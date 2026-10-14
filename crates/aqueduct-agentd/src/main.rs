use aqueduct_core::{Decision, Environment, FaucetIntent, PolicyContext};
use aqueduct_policy::evaluate;
use aqueduct_receipts::Receipt;
use reqwest::{Client, StatusCode};
use serde::Deserialize;
use serde_json::{json, Value};
use std::{env, error::Error, fs, path::PathBuf, time::{SystemTime, UNIX_EPOCH}};
use tokio::time::{sleep, Duration};
use tracing::{error, info, warn};

const SOLANA_RPC: &str = "https://api.devnet.solana.com";
const STELLAR_HORIZON: &str = "https://horizon-testnet.stellar.org";
const STELLAR_FRIENDBOT: &str = "https://friendbot.stellar.org";
const XRPL_RPC: &str = "https://s.altnet.rippletest.net:51234";
const XRPL_FAUCET: &str = "https://faucet.altnet.rippletest.net/accounts";
const MIN_INTERVAL: u64 = 900;

#[derive(Debug, Deserialize)]
struct Config {
    schema_version: String,
    wallet_id: String,
    interval_secs: u64,
    receipt_dir: PathBuf,
    lanes: Vec<Lane>,
}

#[derive(Debug, Deserialize)]
struct Lane {
    enabled: bool,
    network: String,
    asset: String,
    address: String,
    minimum_units: u64,
    top_up_units: u64,
    cooldown_secs: u64,
    provider: Provider,
}

#[derive(Debug, Clone, Copy, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
enum Provider {
    SolanaDevnetRpc,
    StellarTestnetFriendbot,
    XrplTestnetFaucet,
    HumanRequired,
}

impl Provider {
    fn id(self) -> &'static str {
        match self {
            Self::SolanaDevnetRpc => "solana-devnet-rpc-airdrop",
            Self::StellarTestnetFriendbot => "stellar-testnet-friendbot",
            Self::XrplTestnetFaucet => "xrpl-testnet-faucet",
            Self::HumanRequired => "human-required-faucet",
        }
    }
}

fn err(msg: impl Into<String>) -> Box<dyn Error + Send + Sync> {
    Box::new(std::io::Error::other(msg.into()))
}

fn now_ms() -> Result<u64, Box<dyn Error + Send + Sync>> {
    Ok(u64::try_from(SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis())?)
}

fn validate(config: &Config) -> Result<(), Box<dyn Error + Send + Sync>> {
    if config.schema_version != "1.0.0" || config.wallet_id.trim().is_empty() {
        return Err(err("invalid agentd config identity/schema"));
    }
    if config.interval_secs < MIN_INTERVAL {
        return Err(err("agentd interval must be at least 900 seconds"));
    }
    for lane in config.lanes.iter().filter(|lane| lane.enabled) {
        if lane.address.trim().is_empty() || lane.address.contains("REPLACE_WITH") {
            return Err(err(format!("{} has no configured public wallet address", lane.network)));
        }
        if lane.network.to_ascii_lowercase().contains("mainnet") {
            return Err(err("mainnet is not representable by agentd"));
        }
        if lane.minimum_units == 0 || lane.top_up_units == 0 || lane.cooldown_secs < MIN_INTERVAL {
            return Err(err(format!("invalid thresholds/cooldown for {}", lane.network)));
        }
        let matches = matches!((lane.provider, lane.network.as_str(), lane.asset.as_str()),
            (Provider::SolanaDevnetRpc, "solana-devnet", "SOL") |
            (Provider::StellarTestnetFriendbot, "stellar-testnet", "XLM") |
            (Provider::XrplTestnetFaucet, "xrpl-testnet", "XRP") |
            (Provider::HumanRequired, _, _));
        if !matches {
            return Err(err(format!("provider/network/asset mismatch for {}", lane.network)));
        }
    }
    Ok(())
}

fn intent(config: &Config, lane: &Lane) -> FaucetIntent {
    FaucetIntent {
        wallet_id: config.wallet_id.clone(),
        network: lane.network.clone(),
        asset: lane.asset.clone(),
        requested_units: u128::from(lane.top_up_units),
        environment: Environment::Testnet,
    }
}

async fn balance(client: &Client, lane: &Lane) -> Result<u64, Box<dyn Error + Send + Sync>> {
    match lane.provider {
        Provider::SolanaDevnetRpc => {
            let body: Value = client.post(SOLANA_RPC).json(&json!({
                "jsonrpc":"2.0","id":1,"method":"getBalance",
                "params":[lane.address,{"commitment":"confirmed"}]
            })).send().await?.error_for_status()?.json().await?;
            body.pointer("/result/value").and_then(Value::as_u64)
                .ok_or_else(|| err("Solana getBalance returned no numeric result"))
        }
        Provider::StellarTestnetFriendbot => {
            let response = client.get(format!("{STELLAR_HORIZON}/accounts/{}", lane.address)).send().await?;
            if response.status() == StatusCode::NOT_FOUND { return Ok(0); }
            let body: Value = response.error_for_status()?.json().await?;
            let native = body.get("balances").and_then(Value::as_array)
                .and_then(|items| items.iter().find(|v| v.get("asset_type").and_then(Value::as_str) == Some("native")))
                .and_then(|v| v.get("balance")).and_then(Value::as_str)
                .ok_or_else(|| err("Stellar native balance missing"))?;
            decimal_to_units(native, 7)
        }
        Provider::XrplTestnetFaucet => {
            let body: Value = client.post(XRPL_RPC).json(&json!({
                "method":"account_info","params":[{"account":lane.address,"ledger_index":"validated","strict":true}]
            })).send().await?.error_for_status()?.json().await?;
            if body.pointer("/result/error").and_then(Value::as_str) == Some("actNotFound") { return Ok(0); }
            body.pointer("/result/account_data/Balance").and_then(Value::as_str)
                .ok_or_else(|| err("XRPL Balance missing"))?.parse::<u64>().map_err(Into::into)
        }
        Provider::HumanRequired => Err(err("human-required lane has no autonomous balance adapter")),
    }
}

fn decimal_to_units(value: &str, decimals: u32) -> Result<u64, Box<dyn Error + Send + Sync>> {
    let scale = 10_u64.checked_pow(decimals).ok_or_else(|| err("scale overflow"))?;
    let mut split = value.split('.');
    let whole = split.next().unwrap_or_default().parse::<u64>()?;
    let frac = split.next().unwrap_or_default();
    if split.next().is_some() || frac.len() > usize::try_from(decimals)? || !frac.chars().all(|c| c.is_ascii_digit()) {
        return Err(err("invalid decimal balance"));
    }
    let mut padded = frac.to_string();
    while padded.len() < usize::try_from(decimals)? { padded.push('0'); }
    let frac_units = if padded.is_empty() { 0 } else { padded.parse::<u64>()? };
    whole.checked_mul(scale).and_then(|v| v.checked_add(frac_units)).ok_or_else(|| err("balance overflow"))
}

fn units_to_decimal(units: u64, decimals: u32) -> Result<String, Box<dyn Error + Send + Sync>> {
    let scale = 10_u64.checked_pow(decimals).ok_or_else(|| err("scale overflow"))?;
    let whole = units / scale;
    let fraction = units % scale;
    if fraction == 0 { return Ok(whole.to_string()); }
    let width = usize::try_from(decimals)?;
    let mut rendered = format!("{whole}.{fraction:0width$}");
    while rendered.ends_with('0') { rendered.pop(); }
    Ok(rendered)
}

async fn prime(client: &Client, lane: &Lane) -> Result<Option<String>, Box<dyn Error + Send + Sync>> {
    match lane.provider {
        Provider::SolanaDevnetRpc => {
            let body: Value = client.post(SOLANA_RPC).json(&json!({
                "jsonrpc":"2.0","id":1,"method":"requestAirdrop","params":[lane.address,lane.top_up_units]
            })).send().await?.error_for_status()?.json().await?;
            Ok(Some(body.get("result").and_then(Value::as_str).ok_or_else(|| err("Solana airdrop returned no signature"))?.to_string()))
        }
        Provider::StellarTestnetFriendbot => {
            let body: Value = client.get(STELLAR_FRIENDBOT).query(&[("addr", lane.address.as_str())])
                .send().await?.error_for_status()?.json().await?;
            Ok(body.get("hash").and_then(Value::as_str).map(str::to_string))
        }
        Provider::XrplTestnetFaucet => {
            let response = client.post(XRPL_FAUCET).json(&json!({
                "destination":lane.address,
                "xrpAmount":units_to_decimal(lane.top_up_units, 6)?,
                "usageContext":"agentropolis-aqueduct-agentd",
                "userAgent":"AGENTROPOLIS-AQUADUCT/agentd"
            })).send().await?;
            if response.status() == StatusCode::TOO_MANY_REQUESTS { return Err(err("XRPL faucet rate limited request")); }
            response.error_for_status()?;
            Ok(None)
        }
        Provider::HumanRequired => Err(err("provider requires human interaction")),
    }
}

fn receipt(config: &Config, lane: &Lane, decision: Decision, tx: Option<String>, state: &str) -> Result<PathBuf, Box<dyn Error + Send + Sync>> {
    fs::create_dir_all(&config.receipt_dir)?;
    let stamp = now_ms()?;
    let receipt = Receipt::new(intent(config, lane), decision, lane.provider.id().into(), tx, state.into(), stamp)?;
    let path = config.receipt_dir.join(format!("{}-{}-{stamp}.json", config.wallet_id, lane.network));
    fs::write(&path, serde_json::to_vec_pretty(&receipt)?)?;
    Ok(path)
}

async fn cycle(client: &Client, config: &Config) {
    for lane in config.lanes.iter().filter(|lane| lane.enabled) {
        if lane.provider == Provider::HumanRequired {
            let decision = evaluate(&intent(config, lane), &PolicyContext { mainnet_allowed:false, provider_requires_human:true, cooldown_active:false, rate_limited:false });
            if let Ok(path) = receipt(config, lane, decision, None, "human-required") {
                warn!(network=%lane.network, receipt=%path.display(), "human action required; no bypass attempted");
            }
            continue;
        }
        match balance(client, lane).await {
            Ok(before) if before >= lane.minimum_units => info!(network=%lane.network, balance_units=before, "dev wallet above threshold"),
            Ok(before) => {
                let decision = evaluate(&intent(config, lane), &PolicyContext { mainnet_allowed:false, provider_requires_human:false, cooldown_active:false, rate_limited:false });
                if decision != Decision::Allow { continue; }
                match prime(client, lane).await {
                    Ok(tx) => {
                        sleep(Duration::from_secs(3)).await;
                        let after = balance(client, lane).await.unwrap_or(before);
                        let state = if after > before || after >= lane.minimum_units { "verified" } else { "submitted-unverified" };
                        match receipt(config, lane, Decision::Allow, tx, state) {
                            Ok(path) => info!(network=%lane.network, before_units=before, after_units=after, receipt=%path.display(), state, "faucet cycle complete"),
                            Err(e) => error!(network=%lane.network, error=%e, "receipt write failed"),
                        }
                    }
                    Err(e) => {
                        let _ = receipt(config, lane, Decision::Allow, None, "provider-error");
                        error!(network=%lane.network, error=%e, "faucet request failed closed");
                    }
                }
            }
            Err(e) => error!(network=%lane.network, error=%e, "balance observation failed closed"),
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::from_default_env()).init();
    let path = env::var("AQUEDUCT_AGENTD_CONFIG").map(PathBuf::from).unwrap_or_else(|_| PathBuf::from("config/agentd.dev.json"));
    let config: Config = serde_json::from_slice(&fs::read(&path)?)?;
    validate(&config)?;
    let client = Client::builder().timeout(Duration::from_secs(20)).user_agent("AGENTROPOLIS-AQUADUCT-agentd/0.1").build()?;
    let once = env::var("AQUEDUCT_AGENTD_ONCE").map(|v| matches!(v.to_ascii_lowercase().as_str(), "1"|"true"|"yes")).unwrap_or(false);
    loop {
        cycle(&client, &config).await;
        if once { break; }
        sleep(Duration::from_secs(config.interval_secs)).await;
    }
    Ok(())
}
