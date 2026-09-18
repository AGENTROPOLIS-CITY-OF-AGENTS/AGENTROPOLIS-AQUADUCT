# AQUADUCT Certification Plane for FISCALITH and AGENT-ENTITY FORGE

Status: proposed canonical integration

## Purpose

AQUADUCT is the governed **pre-production proving plane** for financial-agent capabilities.

It sits between:
- a capability that exists, and
- a capability that is trusted for production authority.

AQUADUCT remains testnet / sandbox infrastructure. It does **not** become a second PAYRAIL and does not receive autonomous mainnet authority.

## Canonical relationship

```text
AGENTENTITY
    ↓
ATRALITH / ATG
    ↓
FISCALITH
    ↓
Execution Envelope
    ↓
AEGIS
    ↓
AQUADUCT
sandbox / simulation / adapter proving
    ↓
verification + receipts
    ↓
Proof Graph
    ↓
AGENT-ENTITY FORGE
certify / restrict / promote / revoke
    ↓
human / policy approval
    ↓
PAYRAIL
production routing
```

## Responsibility boundaries

### AQUADUCT owns

- testnet provisioning
- sandbox routing
- adapter conformance tests
- deterministic policy checks for the sandbox
- testnet signer-boundary validation
- execution simulation
- post-execution verification
- evidence capture
- receipt generation
- chain-family test harnesses

### AQUADUCT does not own

- production settlement routing
- mainnet treasury authority
- principal mandate issuance
- AGENTENTITY identity
- ATRALITH semantics
- FISCALITH semantics
- final AEGIS authority decisions
- Forge promotion decisions

## FISCALITH integration

FISCALITH financial intents may be executed through AQUADUCT when:
- a new adapter is under test;
- a capability requires certification;
- a policy requires pre-production proof;
- the Forge requires evidence before promotion;
- a production regression requires re-certification.

Example:

```text
ATG.REQUEST
  payload: FISCALITH.BRIDGE
  requires:
    - ProofOfAuthority
    - ProofOfCounterparty
    - ProofOfRoute

AEGIS
  -> sandbox_required

AQUADUCT
  -> execute on approved testnet adapter
  -> verify balance delta
  -> verify route
  -> emit receipts
```

## Circle App Kit / Arc proving path

AQUADUCT should add governed test harnesses for:
- Send
- Bridge
- Swap
- Unified Balance deposit / spend
- Onramp session integration where testable
- Earn preview / deposit / withdrawal where supported
- Arc testnet transaction finality
- Arc USDC gas handling
- Arc dual-USDC interface normalization

Circle App Kit is a provider implementation behind the AQUADUCT/PAYRAIL boundaries. It is not part of FISCALITH language semantics.

## Proofs emitted

AQUADUCT SHOULD be able to emit or contribute evidence for:

- ProofOfCapability
- ProofOfExecution
- ProofOfRoute
- ProofOfQuote
- ProofOfBalanceChange
- ProofOfSettlement
- ProofOfOutcome
- ProofOfRefusal
- ProofOfCompliance
- ProofOfFiscalDiscipline

These are evidence objects. They do not independently grant authority.

## Forge promotion rule

```text
TEST PASS != PRODUCTION AUTHORITY
```

The Forge may consume AQUADUCT evidence and recommend a certification state, but promotion remains governed by the principal mandate, AEGIS policy, and human/policy approval requirements.

## Recommended lifecycle

```text
DISCOVER
  -> DECLARE CAPABILITY
  -> SANDBOX
  -> SIMULATE
  -> EXECUTE TEST
  -> VERIFY
  -> RECEIPT
  -> PROOF GRAPH
  -> CERTIFY
  -> PROMOTE
  -> PRODUCTION
  -> MONITOR
  -> RE-CERTIFY ON MATERIAL CHANGE
```

## Material changes requiring re-certification

- signer implementation
- wallet provider
- chain adapter
- smart-contract version
- Circle App Kit version with material behavior change
- proof schema
- settlement receipt format
- policy semantics
- fee / slippage calculation
- finality assumptions
- credential boundary
- delegation mechanism
- gas sponsorship model

## Standing rule

> **AQUADUCT proves safely. FORGE decides certification state. AEGIS governs authority. PAYRAIL moves approved production value.**
