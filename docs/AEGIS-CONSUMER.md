# AQUADUCT AEGIS Candidate Consumer

## Role

`aqueduct-aegis` is the proving-plane consumer of the AEGIS authority decision
candidate. It sits on the AEGIS -> AQUADUCT boundary of the canonical corridor:

```
AGENT-ENTITY
  -> ATRALITH / ATG
  -> FISCALITH
  -> Execution Envelope
  -> AEGIS          (authorizes: ALLOW / DENY / ESCALATE)
  -> AQUADUCT       (THIS CRATE: verifies / proves)
  -> Proof Graph
  -> BE             (evaluates evidence)
  -> FORGE          (certifies / promotes)
  -> 54-T           (governance / security review)
  -> PAYRAIL        (executes approved value movement)
  -> Settlement
  -> SettlementReceipt
```

## Ownership disclaimers (non-negotiable)

AQUADUCT (and this crate) does **NOT**:

- grant, change, or increase authority
- select settlement rails
- invoke PAYRAIL
- sign transactions
- hold wallet credentials
- move funds
- claim execution
- claim settlement
- mint fake receipts
- self-promote agents

A valid AEGIS candidate is evidence that AEGIS authorized a **bounded action**.
It is **NOT** evidence the action executed, and **NOT** evidence it settled.

```
TEST PASS != PRODUCTION AUTHORITY.
VerificationReceipt != ExecutionReceipt != SettlementReceipt.
```

## What the consumer does

`verify_candidate` (typed) and `verify_candidate_json` (raw inbound bytes)
independently verify an AEGIS candidate and emit an
`AqueductVerificationReceipt`.

Checks, in order (fail closed at the first failure):

1. **Schema / versioning** — `schema` must equal
   `agentropolis.aegis.aquaduct-candidate.v1`; `decision_plane_version` must
   equal the supported version. Unknown or future versions are rejected, never
   auto-upgraded.
2. **Decision** — `decision` must be `ALLOW`.
3. **Flags** — `execution == false` and `settled == false`.
4. **Required fields** — all ref/action/asset/counterparty/version fields
   non-empty.
5. **NO FLOAT MONEY** — `amount_minor` is a `u128` integer (serde rejects
   float/NaN/Inf/scientific/negative/string/bool at deserialization); `decimals`
   is an explicit integer within `0..=24`.
6. **Mandatory proofs** — `ProofOfAuthority` and `ProofOfControl` must be
   present with exact canonical spelling. Caller proofs may only augment.
   Forbidden claims (proof or key) are rejected.
7. **Binding verification** — independently recomputes `binding_hash` from the
   12 bound fields using the **identical canonical serialization as the AEGIS
   producer**, and compares. Any field substitution fails the recompute.
8. **Expiry / staleness** — expired, malformed, or timezone-naive expiry is
   rejected (none is allowed).
9. **Candidate digest** — a tamper-evident digest over the whole candidate is
   recorded in the receipt.

## Binding hash contract (CRITICAL)

The AEGIS producer (`aegis/decision.py`) computes:

```python
json.dumps(payload, sort_keys=True, separators=(",", ":"))
```

which orders the 12 bound-field keys **alphabetically** with **compact**
separators (no whitespace). The Rust `CanonicalBinding` struct in `lib.rs` is
therefore declared in **exact alphabetical order** so `serde_json` emits the
same canonical bytes. A regression test locks the recomputed hash to a
known-good value produced by the AEGIS engine.

The 12 bound fields are:

```
agent_entity_ref
principal_ref
mandate_ref
execution_envelope_ref
intent_id
fiscalith_action
asset
amount_minor
decimals
counterparty
policy_version
expiry
```

## Security boundary

- `deny_unknown_fields` on `AegisCandidate` rejects any smuggled foreign key
  (txHash, rail, privateKey, ProofOfExecution, ...) at deserialization.
- `verify_candidate_json` additionally scans the raw inbound bytes for
  forbidden claims before deserialization.
- No credentials, signers, wallets, PAYRAIL invocation, or outbound execution.

## Replay / idempotence

Verification is deterministic: the same immutable candidate produces the same
`verification_id`, `candidate_digest`, and proof references. Replay does not
create new authority and does not create any budget reservation (AQUADUCT does
not own AEGIS budget state).

## Proof Graph compatibility

`proof_refs` exposes stable Proof Graph-compatible references (proof_id,
proof_type, subject_ref, source_ref, verifier_ref, timestamp, digest,
evidence_refs). This crate does NOT build the Proof Graph; it emits stable
references FORGE and Proof Graph can ingest later.

## Forge handoff

The receipt (proofs_satisfied, evidence_refs) is consumed by FORGE for a
**separate governed promotion decision**. Capability growth does not imply
authority growth.

Downstream promotion path (BE and 54-T remain explicit; neither is bypassed by
a generic approval):

```
AQUADUCT verification
  -> Proof Graph / evidence
  -> BE evaluation
  -> FORGE certification / promotion orchestration
  -> 54-T governance / security review
  -> PAYRAIL
```