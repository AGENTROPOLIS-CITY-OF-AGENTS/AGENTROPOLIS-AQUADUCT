use aqueduct_core::{Decision, FaucetIntent, PolicyContext};

pub fn evaluate(intent: &FaucetIntent, ctx: &PolicyContext) -> Decision {
    if intent.validate().is_err() {
        return Decision::Deny;
    }
    if ctx.mainnet_allowed {
        return Decision::Deny;
    }
    if ctx.rate_limited || ctx.cooldown_active {
        return Decision::Deny;
    }
    if ctx.provider_requires_human {
        return Decision::HumanRequired;
    }
    Decision::Allow
}

#[cfg(test)]
mod tests {
    use super::*;
    use aqueduct_core::Environment;

    fn intent() -> FaucetIntent {
        FaucetIntent {
            wallet_id: "aq-test-1".into(),
            network: "solana-devnet".into(),
            asset: "SOL".into(),
            requested_units: 1,
            environment: Environment::Testnet,
        }
    }

    #[test]
    fn allows_valid_testnet_intent() {
        let decision = evaluate(
            &intent(),
            &PolicyContext {
                mainnet_allowed: false,
                provider_requires_human: false,
                cooldown_active: false,
                rate_limited: false,
            },
        );
        assert_eq!(decision, Decision::Allow);
    }

    #[test]
    fn requires_human_when_provider_demands_it() {
        let decision = evaluate(
            &intent(),
            &PolicyContext {
                mainnet_allowed: false,
                provider_requires_human: true,
                cooldown_active: false,
                rate_limited: false,
            },
        );
        assert_eq!(decision, Decision::HumanRequired);
    }

    #[test]
    fn denies_rate_limit_evasion() {
        let decision = evaluate(
            &intent(),
            &PolicyContext {
                mainnet_allowed: false,
                provider_requires_human: false,
                cooldown_active: false,
                rate_limited: true,
            },
        );
        assert_eq!(decision, Decision::Deny);
    }
}
