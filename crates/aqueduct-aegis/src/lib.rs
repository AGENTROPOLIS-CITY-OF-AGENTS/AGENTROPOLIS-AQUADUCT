//! AQUADUCT consumer of the AEGIS authority decision candidate.
//!
//! This is the proving-plane boundary. AQUADUCT independently verifies the
//! AEGIS candidate artifact (the output of the AEGIS decision plane). It does
//! NOT grant, change, or increase authority; it does NOT select settlement
//! rails, invoke PAYRAIL, sign transactions, hold wallet credentials, move
//! funds, claim execution, claim settlement, mint fake receipts, or promote
//! agents.
//!
//! A valid candidate is evidence that AEGIS authorized a bounded action. It is
//! NOT evidence that the action executed or settled.
//!
//! Canonical corridor:
//!   AGENT-ENTITY -> ATRALITH/ATG -> FISCALITH -> Execution Envelope -> AEGIS
//!   -> AQUADUCT -> Proof Graph -> FORGE -> PAYRAIL -> Settlement
//!
//! TEST PASS != PRODUCTION AUTHORITY.
//! VerificationReceipt != ExecutionReceipt != SettlementReceipt.

use aqueduct_core::Environment;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use thiserror::Error;

/// The AEGIS producer contract schema this consumer understands.
pub const AEGIS_CANDIDATE_SCHEMA: &str = "agentropolis.aegis.aquaduct-candidate.v1";
/// The decision-plane version this consumer is built against.
pub const SUPPORTED_DECISION_PLANE_VERSION: &str = "0.1.0";
/// The verification-receipt schema version this consumer emits.
pub const VERIFICATION_RECEIPT_SCHEMA: &str = "agentropolis.aqueduct.verification-receipt.v1";
/// The binding-hash algorithm version (sha256 over canonical JSON).
pub const BINDING_VERSION: &str = "sha256-v1";

/// Mandatory minimum proofs required by the authority boundary. Caller-supplied
/// proofs may only AUGMENT these; they may never replace or weaken them.
pub const MANDATORY_PROOFS: [&str; 2] = ["ProofOfAuthority", "ProofOfControl"];

/// Fields AEGIS binds into its `binding_hash`. AQUADUCT must recompute over
/// this EXACT set (matching the AEGIS producer) to verify the supplied hash.
/// These are the 12 `_BOUND_FIELDS` from the AEGIS decision model.
pub const AEGIS_BINDING_FIELDS: [&str; 12] = [
    "agent_entity_ref",
    "principal_ref",
    "mandate_ref",
    "execution_envelope_ref",
    "intent_id",
    "fiscalith_action",
    "asset",
    "amount_minor",
    "decimals",
    "counterparty",
    "policy_version",
    "expiry",
];

/// Forbidden claims that must never appear in an inbound candidate, whether as
/// unknown JSON keys or as proof names. AEGIS ALLOW is not execution proof;
/// AQUADUCT verification is not settlement proof.
pub const FORBIDDEN_CLAIMS: [&str; 16] = [
    "txHash",
    "transactionHash",
    "settlementHash",
    "settlementReceipt",
    "ProofOfExecution",
    "ProofOfSettlement",
    "signedTransaction",
    "privateKey",
    "seedPhrase",
    "mnemonic",
    "walletSecret",
    "apiSecret",
    "providerSecret",
    "rawSigner",
    "rail",
    "payrail",
];

#[derive(Debug, Error)]
pub enum AegisVerifyError {
    #[error("candidate is not an object")]
    NotAnObject,
    #[error("candidate schema mismatch: {0}")]
    SchemaMismatch(String),
    #[error("unsupported schema version: {0}")]
    UnsupportedSchemaVersion(String),
    #[error("unsupported decision-plane version: {0}")]
    UnsupportedDecisionPlaneVersion(String),
    #[error("binding version mismatch: {0}")]
    BindingVersionMismatch(String),
    #[error("decision is not ALLOW: {0}")]
    DecisionNotAllow(String),
    #[error("execution flag must be false")]
    ExecutionNotFalse,
    #[error("settled flag must be false")]
    SettledNotFalse,
    #[error("missing required field: {0}")]
    MissingField(String),
    #[error("invalid money: {0}")]
    InvalidMoney(String),
    #[error("missing mandatory proof: {0}")]
    MissingMandatoryProof(String),
    #[error("invalid proof entry: {0}")]
    InvalidProof(String),
    #[error("forbidden claim present: {0}")]
    ForbiddenClaim(String),
    #[error("binding hash mismatch: expected {0}, recomputed {1}")]
    BindingHashMismatch(String, String),
    #[error("candidate expired: {0}")]
    Expired(String),
    #[error("malformed expiry: {0}")]
    MalformedExpiry(String),
    #[error("serialization error: {0}")]
    Serialization(String),
}

/// The AEGIS candidate as received by AQUADUCT. All monetary fields are
/// integer/fixed-unit (NO FLOAT MONEY). `amount_minor` is a u128 integer;
/// `decimals` is explicit integer metadata.
///
/// `deny_unknown_fields` ensures any smuggled foreign key (txHash, rail,
/// privateKey, ProofOfExecution, ...) fails deserialization — fail closed.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct AegisCandidate {
    pub schema: String,
    pub decision_id: String,
    pub decision: String,
    pub principal_ref: String,
    pub agent_entity_ref: String,
    pub mandate_ref: String,
    pub execution_envelope_ref: String,
    pub intent_id: String,
    pub fiscalith_action: String,
    pub asset: String,
    pub amount_minor: u128,
    pub decimals: u8,
    pub counterparty: String,
    pub policy_version: String,
    pub expiry: Option<String>,
    pub required_proofs: Vec<String>,
    pub binding_hash: String,
    pub verifier: String,
    pub decision_plane_version: String,
    pub timestamp: String,
    pub risk_tier: String,
    pub execution: bool,
    pub settled: bool,
}

/// A stable proof reference suitable for later Proof Graph ingestion.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProofRef {
    pub proof_id: String,
    pub proof_type: String,
    pub subject_ref: String,
    pub source_ref: String,
    pub verifier_ref: String,
    pub timestamp: String,
    pub digest: String,
    pub evidence_refs: Vec<String>,
}

/// The proving-plane result. This proves verification occurred; it does NOT
/// prove the economic action occurred.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AqueductVerificationReceipt {
    pub schema: String,
    pub verification_id: String,
    pub source_decision_id: String,
    pub source_binding_hash: String,
    pub agent_entity_ref: String,
    pub principal_ref: String,
    pub intent_id: String,
    pub verification_result: String,
    pub verification_version: String,
    pub verified_at: String,
    pub verifier_id: String,
    pub proofs_checked: Vec<String>,
    pub proofs_satisfied: Vec<String>,
    pub policy_version: String,
    pub risk_tier: String,
    pub schema_version: String,
    pub candidate_digest: String,
    pub test_environment: String,
    pub evidence_refs: Vec<String>,
    pub failure_reasons: Vec<String>,
    pub warnings: Vec<String>,
    pub revalidation_required: bool,
    pub execution: bool,
    pub settled: bool,
}

/// Canonical serialization for the AEGIS binding hash.
///
/// CRITICAL CROSS-REPO CONTRACT: the AEGIS producer computes the hash as
/// `json.dumps(payload, sort_keys=True, separators=(",", ":"))` over the bound
/// fields. `sort_keys=True` orders the JSON keys ALPHABETICALLY with compact
/// separators (no whitespace). The struct fields below are therefore declared
/// in EXACT alphabetical order so serde_json emits the identical canonical
/// bytes. If this field order diverges from alphabetical, every recomputed
/// hash will differ from the AEGIS-supplied `binding_hash` and the consumer
/// will reject valid candidates.
#[derive(Serialize)]
struct CanonicalBinding<'a> {
    agent_entity_ref: &'a str,
    amount_minor: u128,
    asset: &'a str,
    counterparty: &'a str,
    decimals: u8,
    execution_envelope_ref: &'a str,
    expiry: &'a Option<String>,
    fiscalith_action: &'a str,
    intent_id: &'a str,
    mandate_ref: &'a str,
    policy_version: &'a str,
    principal_ref: &'a str,
}

/// Recompute the AEGIS binding hash over the exact 12 bound fields, using the
/// identical canonical serialization as the AEGIS producer (alphabetical keys,
/// compact). Independent recompute: never trusts the supplied `binding_hash`.
pub fn recompute_binding_hash(c: &AegisCandidate) -> Result<String, AegisVerifyError> {
    let canonical = CanonicalBinding {
        agent_entity_ref: &c.agent_entity_ref,
        amount_minor: c.amount_minor,
        asset: &c.asset,
        counterparty: &c.counterparty,
        decimals: c.decimals,
        execution_envelope_ref: &c.execution_envelope_ref,
        expiry: &c.expiry,
        fiscalith_action: &c.fiscalith_action,
        intent_id: &c.intent_id,
        mandate_ref: &c.mandate_ref,
        policy_version: &c.policy_version,
        principal_ref: &c.principal_ref,
    };
    // serde_json emits compact JSON (no spaces after ':' or ','), matching
    // separators=(",", ":") exactly.
    let bytes = serde_json::to_vec(&canonical)
        .map_err(|e| AegisVerifyError::Serialization(e.to_string()))?;
    Ok(hex::encode(Sha256::digest(bytes)))
}

/// Validate the candidate's monetary fields (NO FLOAT MONEY).
///
/// `amount_minor` is a u128 integer by construction (serde rejects floats, NaN,
/// Infinity, scientific notation, negative, and strings when deserializing into
/// u128). `decimals` is a u8. This enforces the remaining invariant: an
/// explicit decimal scale within a sane bound.
pub fn validate_money(c: &AegisCandidate) -> Result<(), AegisVerifyError> {
    if c.decimals > 24 {
        return Err(AegisVerifyError::InvalidMoney("decimals exceeds 24".into()));
    }
    Ok(())
}

/// Validate mandatory proofs. ProofOfAuthority and ProofOfControl are required;
/// caller proofs may only augment. Rejects empty, non-exact, case-confused,
/// whitespace-aliased, and duplicate-only tricks.
pub fn validate_proofs(c: &AegisCandidate) -> Result<Vec<String>, AegisVerifyError> {
    if c.required_proofs.is_empty() {
        return Err(AegisVerifyError::MissingMandatoryProof(
            "required_proofs is empty".into(),
        ));
    }
    let mut satisfied: Vec<String> = Vec::new();
    for p in &c.required_proofs {
        // Reject any forbidden proof / execution / settlement claim name.
        for forbidden in FORBIDDEN_CLAIMS {
            if p == forbidden {
                return Err(AegisVerifyError::ForbiddenClaim(p.clone()));
            }
        }
        // Mandatory proofs must appear with EXACT canonical spelling (case and
        // whitespace are significant — substitutes are rejected).
        if satisfied.iter().any(|s| s == p) {
            return Err(AegisVerifyError::InvalidProof(format!(
                "duplicate proof: {p}"
            )));
        }
        satisfied.push(p.clone());
    }
    for mandatory in MANDATORY_PROOFS {
        if !satisfied.iter().any(|s| s == mandatory) {
            return Err(AegisVerifyError::MissingMandatoryProof(mandatory.into()));
        }
    }
    Ok(satisfied)
}

/// Scan a raw JSON string for forbidden claims. Used on the inbound raw bytes;
/// this catches any attempt to smuggle a forbidden claim, complemented by
/// `deny_unknown_fields` at deserialization.
pub fn scan_forbidden_raw(raw: &str) -> Option<String> {
    for claim in FORBIDDEN_CLAIMS {
        if raw.contains(claim) {
            return Some(claim.into());
        }
    }
    None
}

/// Parse an ISO-8601 timestamp requiring an explicit timezone. Returns unix
/// seconds. Rejects malformed and timezone-naive timestamps.
pub fn parse_expiry_utc(value: &str) -> Result<i64, AegisVerifyError> {
    let text = value.trim();
    if text.is_empty() {
        return Err(AegisVerifyError::MalformedExpiry("empty".into()));
    }
    // Require an explicit UTC-relative timezone designator.
    if !(text.ends_with('Z') || text.ends_with("+00:00") || text.ends_with("+0000")) {
        return Err(AegisVerifyError::MalformedExpiry(
            "timezone offset required".into(),
        ));
    }
    // Strict: must be YYYY-MM-DDTHH:MM:SS[.sss] (validated structure).
    let date_time: Vec<&str> = text.split('T').collect();
    if date_time.len() != 2 {
        return Err(AegisVerifyError::MalformedExpiry(
            "missing T separator".into(),
        ));
    }
    let date = date_time[0] as &str;
    let time = date_time[1] as &str;
    let date_parts: Vec<&str> = date.split('-').collect();
    let time_parts: Vec<&str> = time.split(':').collect();
    if date_parts.len() != 3 || time_parts.len() < 3 {
        return Err(AegisVerifyError::MalformedExpiry("bad structure".into()));
    }
    let year: i64 = date_parts[0]
        .parse::<i64>()
        .map_err(|_| AegisVerifyError::MalformedExpiry("year".into()))?;
    let month: i64 = date_parts[1]
        .parse::<i64>()
        .map_err(|_| AegisVerifyError::MalformedExpiry("month".into()))?;
    let day: i64 = date_parts[2]
        .parse::<i64>()
        .map_err(|_| AegisVerifyError::MalformedExpiry("day".into()))?;
    let hour: i64 = time_parts[0]
        .parse::<i64>()
        .map_err(|_| AegisVerifyError::MalformedExpiry("hour".into()))?;
    let minute: i64 = time_parts[1]
        .parse::<i64>()
        .map_err(|_| AegisVerifyError::MalformedExpiry("minute".into()))?;
    let sec_raw = time_parts[2];
    let sec_text = sec_raw.split('.').next().unwrap_or(sec_raw);
    let second: i64 = sec_text
        .split('Z')
        .next()
        .unwrap_or(sec_text)
        .parse::<i64>()
        .map_err(|_| AegisVerifyError::MalformedExpiry("second".into()))?;
    if !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return Err(AegisVerifyError::MalformedExpiry(
            "out-of-range date".into(),
        ));
    }
    if hour > 23 || minute > 59 || second > 60 {
        return Err(AegisVerifyError::MalformedExpiry(
            "out-of-range time".into(),
        ));
    }
    Ok(days_from_civil(year, month, day) * 86_400 + hour * 3_600 + minute * 60 + second)
}

/// Days since 1970-01-01 (Howard Hinnant's civil-from-days algorithm).
fn days_from_civil(y: i64, m: i64, d: i64) -> i64 {
    let y = if m <= 2 { y - 1 } else { y };
    let era = if y >= 0 { y } else { y - 399 } / 400;
    let yoe = y - era * 400;
    let doy = (153 * (if m > 2 { m - 3 } else { m + 9 }) + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468
}

/// Verify the candidate expiry against a reference unix time (seconds).
pub fn check_expiry(c: &AegisCandidate, now_unix: i64) -> Result<(), AegisVerifyError> {
    if let Some(expiry) = &c.expiry {
        let exp = parse_expiry_utc(expiry)?;
        if exp <= now_unix {
            return Err(AegisVerifyError::Expired(expiry.clone()));
        }
    }
    Ok(())
}

fn require_non_empty(c: &AegisCandidate) -> Result<(), AegisVerifyError> {
    for (field, value) in [
        ("decision_id", &c.decision_id),
        ("principal_ref", &c.principal_ref),
        ("agent_entity_ref", &c.agent_entity_ref),
        ("mandate_ref", &c.mandate_ref),
        ("execution_envelope_ref", &c.execution_envelope_ref),
        ("intent_id", &c.intent_id),
        ("fiscalith_action", &c.fiscalith_action),
        ("asset", &c.asset),
        ("counterparty", &c.counterparty),
        ("policy_version", &c.policy_version),
        ("verifier", &c.verifier),
        ("risk_tier", &c.risk_tier),
        ("timestamp", &c.timestamp),
    ] {
        if value.trim().is_empty() {
            return Err(AegisVerifyError::MissingField(field.into()));
        }
    }
    Ok(())
}

/// Canonical full-candidate digest (includes non-bound metadata like
/// decision_id, decision_plane_version, risk_tier). Used for the receipt's own
/// tamper-evident candidate_digest.
pub fn compute_candidate_digest(c: &AegisCandidate) -> Result<String, AegisVerifyError> {
    let canonical_bytes =
        serde_json::to_vec(c).map_err(|e| AegisVerifyError::Serialization(e.to_string()))?;
    Ok(hex::encode(Sha256::digest(canonical_bytes)))
}

/// Verify a deserialized AEGIS candidate and produce a proving-plane receipt.
///
/// This is the typed path. For untrusted inbound bytes, use
/// `verify_candidate_json` which also scans the raw input for forbidden claims
/// before deserialization.
pub fn verify_candidate(
    c: &AegisCandidate,
    now_unix: i64,
    verifier_id: &str,
    test_environment: Environment,
) -> Result<AqueductVerificationReceipt, AegisVerifyError> {
    // 1. Schema + versioning (fail closed on unknown/future).
    if c.schema != AEGIS_CANDIDATE_SCHEMA {
        return Err(AegisVerifyError::SchemaMismatch(c.schema.clone()));
    }
    if c.decision_plane_version != SUPPORTED_DECISION_PLANE_VERSION {
        return Err(AegisVerifyError::UnsupportedDecisionPlaneVersion(
            c.decision_plane_version.clone(),
        ));
    }

    // 2. Decision must be ALLOW; execution/settled must be false.
    if c.decision != "ALLOW" {
        return Err(AegisVerifyError::DecisionNotAllow(c.decision.clone()));
    }
    if c.execution {
        return Err(AegisVerifyError::ExecutionNotFalse);
    }
    if c.settled {
        return Err(AegisVerifyError::SettledNotFalse);
    }

    // 3. Required fields non-empty.
    require_non_empty(c)?;

    // 4. NO FLOAT MONEY.
    validate_money(c)?;

    // 5. Mandatory proofs.
    let proofs_satisfied = validate_proofs(c)?;

    // 6. Binding verification (independent recompute).
    let recomputed = recompute_binding_hash(c)?;
    if recomputed != c.binding_hash {
        return Err(AegisVerifyError::BindingHashMismatch(
            c.binding_hash.clone(),
            recomputed,
        ));
    }

    // 7. Expiry / staleness.
    check_expiry(c, now_unix)?;

    // 8. Candidate digest.
    let canonical_bytes =
        serde_json::to_vec(c).map_err(|e| AegisVerifyError::Serialization(e.to_string()))?;
    let candidate_digest = hex::encode(Sha256::digest(canonical_bytes));

    let env_str = match test_environment {
        Environment::Testnet => "testnet",
        Environment::Stagenet => "stagenet",
    };

    // Deterministic verification id (immutable candidate -> same receipt id;
    // replay-safe, no new authority, no new budget reservation).
    let id_string = format!("{}:{}:{}", c.decision_id, c.binding_hash, verifier_id);
    let id_input = id_string.as_bytes();
    let verification_id = format!("AQUADUCT-VERIFY-{}", hex::encode(Sha256::digest(id_input)));

    Ok(AqueductVerificationReceipt {
        schema: VERIFICATION_RECEIPT_SCHEMA.into(),
        verification_id,
        source_decision_id: c.decision_id.clone(),
        source_binding_hash: c.binding_hash.clone(),
        agent_entity_ref: c.agent_entity_ref.clone(),
        principal_ref: c.principal_ref.clone(),
        intent_id: c.intent_id.clone(),
        verification_result: "VERIFIED".into(),
        verification_version: BINDING_VERSION.into(),
        verified_at: format!("{now_unix}"),
        verifier_id: verifier_id.into(),
        proofs_checked: MANDATORY_PROOFS.iter().map(|s| s.to_string()).collect(),
        proofs_satisfied,
        policy_version: c.policy_version.clone(),
        risk_tier: c.risk_tier.clone(),
        schema_version: AEGIS_CANDIDATE_SCHEMA.into(),
        candidate_digest,
        test_environment: env_str.into(),
        evidence_refs: Vec::new(),
        failure_reasons: Vec::new(),
        warnings: Vec::new(),
        revalidation_required: false,
        execution: false,
        settled: false,
    })
}

/// Verify an untrusted raw JSON AEGIS candidate. Scans the raw bytes for
/// forbidden claims before deserialization (defense in depth with
/// `deny_unknown_fields`), then runs the full typed verification.
pub fn verify_candidate_json(
    raw: &str,
    now_unix: i64,
    verifier_id: &str,
    test_environment: Environment,
) -> Result<AqueductVerificationReceipt, AegisVerifyError> {
    if let Some(claim) = scan_forbidden_raw(raw) {
        return Err(AegisVerifyError::ForbiddenClaim(claim));
    }
    let candidate: AegisCandidate = serde_json::from_str::<AegisCandidate>(raw)
        .map_err(|e| AegisVerifyError::Serialization(e.to_string()))?;
    verify_candidate(&candidate, now_unix, verifier_id, test_environment)
}

/// Build stable Proof Graph-compatible references from a verified candidate.
/// This does NOT build the Proof Graph; it exposes stable references FORGE and
/// the Proof Graph can ingest later.
pub fn proof_refs(c: &AegisCandidate, receipt: &AqueductVerificationReceipt) -> Vec<ProofRef> {
    let mut refs = Vec::new();
    for proof_type in &receipt.proofs_satisfied {
        let id_string = format!("{}:{}:{}", proof_type, c.decision_id, c.binding_hash);
        let id_input = id_string.as_bytes();
        refs.push(ProofRef {
            proof_id: format!("PROOF-{}", hex::encode(Sha256::digest(id_input))),
            proof_type: proof_type.clone(),
            subject_ref: c.agent_entity_ref.clone(),
            source_ref: format!("aegis:{}", c.decision_id),
            verifier_ref: receipt.verifier_id.clone(),
            timestamp: receipt.verified_at.clone(),
            digest: receipt.candidate_digest.clone(),
            evidence_refs: Vec::new(),
        });
    }
    refs
}

#[cfg(test)]
mod tests;
