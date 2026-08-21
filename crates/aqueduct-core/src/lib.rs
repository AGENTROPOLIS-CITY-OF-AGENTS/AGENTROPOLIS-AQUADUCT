use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Environment {
    Testnet,
    Stagenet,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Decision {
    Allow,
    Deny,
    HumanRequired,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FaucetIntent {
    pub wallet_id: String,
    pub network: String,
    pub asset: String,
    pub requested_units: u128,
    pub environment: Environment,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PolicyContext {
    pub mainnet_allowed: bool,
    pub provider_requires_human: bool,
    pub cooldown_active: bool,
    pub rate_limited: bool,
}

#[derive(Debug, Error)]
pub enum AqueductError {
    #[error("mainnet execution is not supported by AQUEDUCT")]
    MainnetDenied,
    #[error("request is rate limited")]
    RateLimited,
    #[error("provider cooldown is active")]
    CooldownActive,
    #[error("human action is required by the provider")]
    HumanRequired,
    #[error("invalid intent: {0}")]
    InvalidIntent(String),
}

impl FaucetIntent {
    pub fn validate(&self) -> Result<(), AqueductError> {
        if self.wallet_id.trim().is_empty() {
            return Err(AqueductError::InvalidIntent("wallet_id is empty".into()));
        }
        if self.network.trim().is_empty() {
            return Err(AqueductError::InvalidIntent("network is empty".into()));
        }
        if self.asset.trim().is_empty() {
            return Err(AqueductError::InvalidIntent("asset is empty".into()));
        }
        if self.requested_units == 0 {
            return Err(AqueductError::InvalidIntent("requested_units must be greater than zero".into()));
        }
        Ok(())
    }
}
