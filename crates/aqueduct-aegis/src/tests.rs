use super::*;
use aqueduct_core::Environment;

const VALID_EXPIRY: &str = "2099-01-01T00:00:00Z";
// 2027-01-01, well before the 2099 expiry in fixtures.
const NOW_UNIX: i64 = 1_800_000_000;

fn base_candidate() -> AegisCandidate {
    let mut c = AegisCandidate {
        schema: AEGIS_CANDIDATE_SCHEMA.into(),
        decision_id: "AEGIS-DEC-1".into(),
        decision: "ALLOW".into(),
        principal_ref: "TREASURY-042".into(),
        agent_entity_ref: "AGENT-ENTITY-042".into(),
        mandate_ref: "M-88".into(),
        execution_envelope_ref: "EE-102".into(),
        intent_id: "I-1".into(),
        fiscalith_action: "PAY".into(),
        asset: "USDC".into(),
        amount_minor: 4200000000u128,
        decimals: 6u8,
        counterparty: "V-12".into(),
        policy_version: "1.0".into(),
        expiry: Some(VALID_EXPIRY.into()),
        required_proofs: Vec::new(),
        binding_hash: "".into(),
        verifier: "aegis-assurance".into(),
        decision_plane_version: SUPPORTED_DECISION_PLANE_VERSION.into(),
        timestamp: "2027-01-01T00:00:00Z".into(),
        risk_tier: "R2".into(),
        execution: false,
        settled: false,
    };
    c.required_proofs.push("ProofOfAuthority".into());
    c.required_proofs.push("ProofOfControl".into());
    // binding_hash must match the production recompute algorithm exactly so
    // the valid path passes while substitution tests (which mutate a bound
    // field but not the hash) fail closed on binding mismatch.
    c.binding_hash = recompute_binding_hash(&c).unwrap_or_default();
    c
}

fn verified(c: &AegisCandidate) -> Result<AqueductVerificationReceipt, AegisVerifyError> {
    verify_candidate(c, NOW_UNIX, "aqueduct-test", Environment::Testnet)
}

// ---------------- VALID PATH ----------------
#[test]
fn valid_candidate_verifies() -> Result<(), Box<dyn std::error::Error>> {
    let receipt = verified(&base_candidate())?;
    assert_eq!(receipt.verification_result, "VERIFIED");
    assert!(!receipt.execution);
    assert!(!receipt.settled);
    assert_eq!(receipt.proofs_satisfied.len(), 2);
    Ok(())
}

#[test]
fn valid_candidate_deterministic_receipt_id() -> Result<(), Box<dyn std::error::Error>> {
    let a = verified(&base_candidate())?;
    let b = verified(&base_candidate())?;
    assert_eq!(a.verification_id, b.verification_id);
    assert_eq!(a.candidate_digest, b.candidate_digest);
    Ok(())
}

// ---------------- SCHEMA / VERSIONING ----------------
#[test]
fn wrong_schema_rejected() {
    let mut c = base_candidate();
    c.schema = "wrong.schema.v9".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn unknown_schema_version_rejected() {
    let mut c = base_candidate();
    c.schema = "agentropolis.aegis.aquaduct-candidate.v999".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn unknown_decision_plane_version_rejected() {
    let mut c = base_candidate();
    c.decision_plane_version = "99.0.0".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn binding_hash_mismatch_rejected() {
    let mut c = base_candidate();
    c.binding_hash = "0".repeat(64);
    assert!(verified(&c).err().is_some());
}

// ---------------- DECISION / FLAGS ----------------
#[test]
fn non_allow_rejected() {
    let mut c = base_candidate();
    c.decision = "DENY".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn execution_true_rejected() {
    let mut c = base_candidate();
    c.execution = true;
    assert!(verified(&c).err().is_some());
}

#[test]
fn settled_true_rejected() {
    let mut c = base_candidate();
    c.settled = true;
    assert!(verified(&c).err().is_some());
}

// ---------------- MONEY (NO FLOAT) ----------------
// decimals is the only money shape the typed struct accepts that can be
// out of range here; the integer amount is enforced at deserialization time
// because u128 cannot carry a float / negative / string / NaN / Inf.
#[test]
fn decimals_too_large_rejected() {
    let mut c = base_candidate();
    c.decimals = 25u8;
    assert!(verified(&c).err().is_some());
}

#[test]
fn serde_rejects_float_amount() {
    let raw =
        r#"{"schema":"agentropolis.aegis.aquaduct-candidate.v1","amount_minor":4.2,"decimals":6}"#;
    assert!(serde_json::from_str::<AegisCandidate>(raw).is_err());
}

#[test]
fn serde_rejects_negative_amount() {
    let raw =
        r#"{"schema":"agentropolis.aegis.aquaduct-candidate.v1","amount_minor":-5,"decimals":6}"#;
    assert!(serde_json::from_str::<AegisCandidate>(raw).is_err());
}

#[test]
fn serde_rejects_string_amount() {
    let raw = r#"{"schema":"agentropolis.aegis.aquaduct-candidate.v1","amount_minor":"4200","decimals":6}"#;
    assert!(serde_json::from_str::<AegisCandidate>(raw).is_err());
}

#[test]
fn serde_rejects_scientific_notation() {
    let raw = r#"{"schema":"agentropolis.aegis.aquaduct-candidate.v1","amount_minor":4.2e6,"decimals":6}"#;
    assert!(serde_json::from_str::<AegisCandidate>(raw).is_err());
}

#[test]
fn serde_rejects_bool_amount() {
    let raw =
        r#"{"schema":"agentropolis.aegis.aquaduct-candidate.v1","amount_minor":true,"decimals":6}"#;
    assert!(serde_json::from_str::<AegisCandidate>(raw).is_err());
}

// ---------------- PROOFS ----------------
#[test]
fn missing_authority_proof_rejected() {
    let mut c = base_candidate();
    c.required_proofs = ["ProofOfControl".into()].to_vec();
    assert!(verified(&c).err().is_some());
}

#[test]
fn missing_control_proof_rejected() {
    let mut c = base_candidate();
    c.required_proofs = ["ProofOfAuthority".into()].to_vec();
    assert!(verified(&c).err().is_some());
}

#[test]
fn empty_proofs_rejected() {
    let mut c = base_candidate();
    c.required_proofs = Vec::new();
    assert!(verified(&c).err().is_some());
}

#[test]
fn weak_arbitrary_proof_rejected() {
    let mut c = base_candidate();
    c.required_proofs = ["AttackerSaysOK".into()].to_vec();
    assert!(verified(&c).err().is_some());
}

#[test]
fn case_confused_proof_rejected() {
    let mut c = base_candidate();
    c.required_proofs = ["proofofauthority".into(), "proofofcontrol".into()].to_vec();
    assert!(verified(&c).err().is_some());
}

#[test]
fn whitespace_aliased_proof_rejected() {
    let mut c = base_candidate();
    c.required_proofs = [" ProofOfAuthority ".into(), "ProofOfControl".into()].to_vec();
    assert!(verified(&c).err().is_some());
}

#[test]
fn duplicate_only_trick_rejected() {
    let mut c = base_candidate();
    c.required_proofs = ["ProofOfAuthority".into(), "ProofOfAuthority".into()].to_vec();
    assert!(verified(&c).err().is_some());
}

#[test]
fn caller_proofs_augment_mandatory() -> Result<(), Box<dyn std::error::Error>> {
    let mut c = base_candidate();
    c.required_proofs = [
        "ProofOfAuthority".into(),
        "ProofOfControl".into(),
        "ProofOfCounterparty".into(),
    ]
    .to_vec();
    let receipt = verified(&c)?;
    assert_eq!(receipt.proofs_satisfied.len(), 3);
    Ok(())
}

// ---------------- FORBIDDEN CLAIMS ----------------
// A smuggled forbidden key is rejected both by deny_unknown_fields at
// deserialization and by the raw-byte scan in verify_candidate_json.
#[test]
fn forbidden_tx_hash_key_rejected() {
    let raw = concat!(
        r#"{"schema":"agentropolis.aegis.aquaduct-candidate.v1","decision_id":"D","decision":"ALLOW","principal_ref":"P","agent_entity_ref":"AE","mandate_ref":"M","execution_envelope_ref":"EE","intent_id":"I","fiscalith_action":"PAY","asset":"USDC","amount_minor":100,"decimals":6,"counterparty":"C","policy_version":"1.0","expiry":"2099-01-01T00:00:00Z","required_proofs":["ProofOfAuthority","ProofOfControl"],"binding_hash":"x","verifier":"v","decision_plane_version":"0.1.0","timestamp":"t","risk_tier":"R2","execution":false,"settled":false,""#,
        r#""txHash":"0xdeadbeef"}"#,
    );
    let input = verify_candidate_json(raw, NOW_UNIX, "aqueduct-test", Environment::Testnet);
    assert!(input.err().is_some());
}

#[test]
fn forbidden_settlement_proof_rejected() {
    let mut c = base_candidate();
    c.required_proofs = [
        "ProofOfAuthority".into(),
        "ProofOfControl".into(),
        "ProofOfSettlement".into(),
    ]
    .to_vec();
    assert!(verified(&c).err().is_some());
}

// ---------------- BINDING SUBSTITUTION ----------------
// Each mutations a single bound field WITHOUT recomputing binding_hash, so
// verification must fail on the independent recompute (binding mismatch).
#[test]
fn amount_mutation_rejected() {
    let mut c = base_candidate();
    c.amount_minor = 1u128;
    assert!(verified(&c).err().is_some());
}

#[test]
fn decimals_mutation_rejected() {
    let mut c = base_candidate();
    c.decimals = 7u8;
    assert!(verified(&c).err().is_some());
}

#[test]
fn principal_mutation_rejected() {
    let mut c = base_candidate();
    c.principal_ref = "EVIL-999".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn agent_entity_mutation_rejected() {
    let mut c = base_candidate();
    c.agent_entity_ref = "EVIL-ENTITY".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn mandate_mutation_rejected() {
    let mut c = base_candidate();
    c.mandate_ref = "M-EVIL".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn envelope_mutation_rejected() {
    let mut c = base_candidate();
    c.execution_envelope_ref = "EE-EVIL".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn intent_mutation_rejected() {
    let mut c = base_candidate();
    c.intent_id = "I-EVIL".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn action_mutation_rejected() {
    let mut c = base_candidate();
    c.fiscalith_action = "SWAP".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn asset_mutation_rejected() {
    let mut c = base_candidate();
    c.asset = "BTC".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn counterparty_mutation_rejected() {
    let mut c = base_candidate();
    c.counterparty = "UNKNOWN-999".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn policy_version_mutation_rejected() {
    let mut c = base_candidate();
    c.policy_version = "9.9".into();
    assert!(verified(&c).err().is_some());
}

#[test]
fn expiry_mutation_rejected() {
    let mut c = base_candidate();
    c.expiry = Some("2099-12-31T00:00:00Z".into());
    assert!(verified(&c).err().is_some());
}

// ---------------- CANONICALIZATION ----------------
// CROSS-REPO BINDING CONTRACT: AEGIS producer (aegis/decision.py) computes
// binding_hash = sha256(json.dumps(bound, sort_keys=True, separators=(",",":")))
// which orders the 12 bound-field keys ALPHABETICALLY with compact output.
// This test locks the recomputed hash to a known-good value produced by the
// actual AEGIS engine for exactly these fixture values, proving the Rust
// recompute emits identical canonical bytes.
#[test]
fn recompute_matches_aegis_engine_known_hash() -> Result<(), Box<dyn std::error::Error>> {
    let c = base_candidate();
    // Expected canonical JSON (alphabetical key order, compact):
    //   {"agent_entity_ref":"AGENT-ENTITY-042","amount_minor":4200000000,"asset":"USDC","counterparty":"V-12","decimals":6,"execution_envelope_ref":"EE-102","expiry":"2099-01-01T00:00:00Z","fiscalith_action":"PAY","intent_id":"I-1","mandate_ref":"M-88","policy_version":"1.0","principal_ref":"TREASURY-042"}
    // sha256 of that string, produced by the AEGIS engine:
    let expected = "32ba7054f35137f3a24c63fd5094872c6c894fff3519da3700eacc7a71dc81f3";
    assert_eq!(recompute_binding_hash(&c)?, expected);
    Ok(())
}

#[test]
fn same_semantic_artifact_same_digest() -> Result<(), Box<dyn std::error::Error>> {
    let a = base_candidate();
    let b = base_candidate();
    assert_eq!(recompute_binding_hash(&a)?, recompute_binding_hash(&b)?);
    assert_eq!(compute_candidate_digest(&a)?, compute_candidate_digest(&b)?);
    Ok(())
}

#[test]
fn changed_bound_byte_different_digest() -> Result<(), Box<dyn std::error::Error>> {
    let a = base_candidate();
    let mut b = base_candidate();
    b.counterparty = "V-99".into();
    assert_ne!(recompute_binding_hash(&a)?, recompute_binding_hash(&b)?);
    assert_ne!(compute_candidate_digest(&a)?, compute_candidate_digest(&b)?);
    Ok(())
}

// ---------------- EXPIRY / STALENESS ----------------
#[test]
fn expired_candidate_rejected() {
    let mut c = base_candidate();
    c.expiry = Some("2020-01-01T00:00:00Z".into());
    assert!(verified(&c).err().is_some());
}

#[test]
fn timezone_naive_expiry_rejected() {
    let mut c = base_candidate();
    c.expiry = Some("2099-01-01T00:00:00".into());
    assert!(verified(&c).err().is_some());
}

#[test]
fn malformed_expiry_rejected() {
    let mut c = base_candidate();
    c.expiry = Some("not-a-date".into());
    assert!(verified(&c).err().is_some());
}

#[test]
fn no_expiry_allowed() -> Result<(), Box<dyn std::error::Error>> {
    let c = base_candidate();
    let mut no_exp = c;
    no_exp.expiry = None;
    no_exp.binding_hash = recompute_binding_hash(&no_exp).unwrap_or_default();
    assert_eq!(verified(&no_exp)?.verification_result, "VERIFIED");
    Ok(())
}

// ---------------- REPLAY / IDEMPOTENCE ----------------
#[test]
fn replay_is_deterministic() -> Result<(), Box<dyn std::error::Error>> {
    let a = verified(&base_candidate())?;
    let b = verified(&base_candidate())?;
    assert_eq!(a.verification_id, b.verification_id);
    assert_eq!(a.candidate_digest, b.candidate_digest);
    Ok(())
}

// ---------------- PROOF REFS / GRAPH COMPATIBILITY ----------------
#[test]
fn proof_refs_are_stable() -> Result<(), Box<dyn std::error::Error>> {
    let c = base_candidate();
    let receipt = verified(&c)?;
    let refs = proof_refs(&c, &receipt);
    assert_eq!(refs.len(), 2);
    for r in &refs {
        assert!(!r.proof_id.is_empty());
        assert!(!r.source_ref.is_empty());
        assert_eq!(r.subject_ref, "AGENT-ENTITY-042");
    }
    Ok(())
}
