# AQUEDUCT agentd Faucet Operator

`aqueduct-agentd` is the bounded testnet provisioning daemon for the AGENTROPOLIS developer wallet fleet.

```text
WALLET ATLAS public address
        |
        v
observe testnet balance
        |
        v
FLOWKEEPER policy + cooldown
        |
        v
CHAINWELL machine adapter
        |
        v
faucet request
        |
        v
re-read chain balance
        |
        v
AQUEDUCT RECEIPT
```

## Initial autonomous lanes

- Solana Devnet: `getBalance` + `requestAirdrop`
- Stellar Testnet: Horizon balance + Friendbot
- XRPL Testnet: `account_info` + official Testnet faucet `/accounts`

These adapters use public wallet addresses only. They do not need, load, accept, or log wallet private keys.

## Human-required lanes

If a faucet requires browser login, CAPTCHA, social verification, or another interactive control, configure it as `human_required`. agentd emits a human-required state instead of automating around the control.

## Configure the AGENTROPOLIS dev wallet

```bash
cp config/agentd.dev.example.json config/agentd.dev.json
```

Insert only PUBLIC testnet addresses, then enable the matching lanes. `config/agentd.dev.json` is ignored by Git.

Integer base units are used throughout: SOL lamports, XLM stroops, XRP drops, EVM wei.

## One governed pass

```bash
AQUEDUCT_AGENTD_ONCE=true \
AQUEDUCT_AGENTD_CONFIG=config/agentd.dev.json \
cargo run -p aqueduct-agentd
```

This is the preferred Hermes cron/operator mode.

## Continuous mode

```bash
AQUEDUCT_AGENTD_CONFIG=config/agentd.dev.json \
cargo run -p aqueduct-agentd
```

The loop interval and each enabled provider cooldown must be at least 15 minutes. The example uses one hour.

## Fail-closed rules

agentd rejects mainnet-labelled lanes, missing/placeholder public addresses, zero thresholds, invalid provider/network/asset combinations, and sub-policy intervals. A provider failure does not trigger rate-limit evasion or an unreviewed provider fallback.

The XRPL faucet can return account material in its JSON response. agentd deliberately does not serialize or log that response body; it verifies funding by re-reading the public Testnet account balance.

Receipts default to `var/aqueduct/receipts/`, which is ignored by Git and uses the existing AQUEDUCT receipt digest format.

## Deployment status

Merging this code makes the execution component available. It does not claim a wallet has been configured, faucet funds have been received, a cron job is running, or an MCP endpoint is deployed. Those states require runtime evidence.
