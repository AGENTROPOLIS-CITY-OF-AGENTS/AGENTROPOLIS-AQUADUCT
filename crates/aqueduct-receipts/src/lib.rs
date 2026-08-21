use aqueduct_core::{Decision, FaucetIntent};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Receipt {
    pub version: String,
    pub intent: FaucetIntent,
    pub policy_decision: Decision,
    pub provider: String,
    pub transaction_id: Option<String>,
    pub verification_state: String,
    pub timestamp_unix_ms: u64,
    pub digest_sha256: String,
}

#[derive(Serialize)]
struct CanonicalReceipt<'a> {
    version: &'a str,
    intent: &'a FaucetIntent,
    policy_decision: &'a Decision,
    provider: &'a str,
    transaction_id: &'a Option<String>,
    verification_state: &'a str,
    timestamp_unix_ms: u64,
}

impl Receipt {
    pub fn new(
        intent: FaucetIntent,
        policy_decision: Decision,
        provider: String,
        transaction_id: Option<String>,
        verification_state: String,
        timestamp_unix_ms: u64,
    ) -> Result<Self, serde_json::Error> {
        let canonical = CanonicalReceipt {
            version: "1",
            intent: &intent,
            policy_decision: &policy_decision,
            provider: &provider,
            transaction_id: &transaction_id,
            verification_state: &verification_state,
            timestamp_unix_ms,
        };
        let bytes = serde_json::to_vec(&canonical)?;
        let digest_sha256 = hex::encode(Sha256::digest(bytes));
        Ok(Self {
            version: "1".into(),
            intent,
            policy_decision,
            provider,
            transaction_id,
            verification_state,
            timestamp_unix_ms,
            digest_sha256,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use aqueduct_core::Environment;

    #[test]
    fn receipt_digest_is_deterministic() {
        let intent = FaucetIntent {
            wallet_id: "aq-test-1".into(),
            network: "solana-devnet".into(),
            asset: "SOL".into(),
            requested_units: 1,
            environment: Environment::Testnet,
        };
        let a = Receipt::new(intent.clone(), Decision::Allow, "provider".into(), None, "verified".into(), 1).unwrap();
        let b = Receipt::new(intent, Decision::Allow, "provider".into(), None, "verified".into(), 1).unwrap();
        assert_eq!(a.digest_sha256, b.digest_sha256);
    }
}
