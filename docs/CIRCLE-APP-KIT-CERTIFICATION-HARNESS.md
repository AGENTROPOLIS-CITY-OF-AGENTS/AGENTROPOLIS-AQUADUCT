# Circle App Kit Certification Harness

Status: testnet / sandbox implementation contract

## Installation

AQUADUCT is the certification surface that is allowed to install Circle App Kit for proving behavior before production promotion.

Initial Arc/EVM harness:

```bash
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem
```

Optional adapters are added only when the test lane requires them:
- `@circle-fin/adapter-ethers-v6`
- `@circle-fin/adapter-solana-kit`
- `@circle-fin/adapter-circle-wallets`

Circle Wallets is server-side only.

Circle API key requirements:
- Onramp requires a Circle Console API key.
- Swap may run without a key but is rate limited.
- Earn may run without a key but is rate limited.

## AQUADUCT role

AQUADUCT must exercise provider behavior in a controlled testnet / sandbox before the Forge treats the capability as certification evidence.

Test targets:
- Send
- Bridge
- Swap
- Unified Balance deposit
- Unified Balance spend
- Onramp session integration
- Earn preview
- Earn deposit
- Earn withdrawal

## Evidence requirements

Each harness run should emit normalized evidence for:
- ProofOfCapability
- ProofOfRoute
- ProofOfQuote
- ProofOfExecution
- ProofOfBalanceChange
- ProofOfSettlement
- ProofOfOutcome
- ProofOfRefusal when blocked
- ProofOfFiscalDiscipline where limits or fees are evaluated

## Secret boundary

Circle API keys, wallet credentials, and signer secrets:
- remain server-side;
- are injected only through approved secret handles;
- are never committed;
- are never exposed through GitHub Pages;
- are never embedded into ATG or FISCALITH payloads.

## Executable surface

The harness lives in `harness/circle-app-kit/` and runs offline with Node >= 20 and zero runtime dependencies.

| File | Role |
| --- | --- |
| `provider.mjs` | Provider-neutral capability interface (`capabilities`, `quote`, `execute`, `poll`, `resume`, `restart`, `balance`, `onrampSession`, `earnPreview/earnDeposit/earnWithdraw`), `MockCircleAppKitProvider` (deterministic, seedable failures) and the `CircleAppKitProvider` live skeleton. Arc chain config: testnet `5042002` allowed; mainnet `5042` metadata present with `allowed: false`. |
| `conformance.mjs` | Runs the matrix from `ARC-CIRCLE-APP-KIT-TEST-MATRIX.md` against a provider and emits the evidence bundle; contains the 54T containment gate and the minimal Forge proof-envelope shape checker. |
| `run.mjs` | CLI: `node harness/circle-app-kit/run.mjs --provider mock --out evidence/` writes `evidence/<run_id>.json`. |
| `schemas/evidence-bundle.schema.json` | Bundle schema; proofs reference the Forge envelope `$id` `https://agentropolis.dev/forge/proof-envelope.v1.json` rather than forking it. |
| `test/*.test.mjs` | `npm test` (`node --test harness/circle-app-kit/test/`), also run by `.github/workflows/harness.yml`. |

Every intent is FISCALITH-shaped (`intent_id`, `kind`, `actor_ref`, `mandate_ref`, `payload`) and every provider response is a normalized record (`status` `PENDING|SETTLED|FAILED|REFUSED`, `state`, `tx_ref`, `fee_quotes`, `net_amount`).

Invariants encoded as named tests:
- `TEST PASS != PRODUCTION AUTHORITY` — every bundle carries `"grants_authority": false` and `"promotion": "REQUIRES_FORGE_AND_AEGIS"`.
- `CAPABILITY != AUTHORITY` — declared vs exercised capabilities are reconciled; a mismatch fails the matrix, never elevates it.
- `RETRY THE STATE, NOT THE MONEY` — replayed `execute` is idempotent; a partial bridge failure after `BURNED` can `resume` from persisted state, `restart` is refused.
- 54T containment — intents carrying `private_key` / `mnemonic` keys are refused before any provider call.
- Quote binding — `execute` with a mismatched or expired bound quote hash is refused.
- Mainnet `5042` — any intent targeting it is refused with a `ProofOfRefusal`.

Live lane (operator step, never in the committed dependency tree):

```bash
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem
AQUADUCT_LIVE_HARNESS=1 CIRCLE_API_KEY_HANDLE=<handle-name> node harness/circle-app-kit/run.mjs --provider circle-app-kit --out evidence/
```

Without `AQUADUCT_LIVE_HARNESS=1` the live provider throws `live harness disabled` and the SDK is never imported. Only secret handle names cross the boundary; values are never read, logged, or written into evidence. `evidence/` is git-ignored except the committed mock output `evidence/SAMPLE.json`.

## Promotion rule

```text
AQUADUCT TEST PASS
      ↓
EVIDENCE
      ↓
PROOF GRAPH
      ↓
BE EVALUATION
      ↓
FORGE CERTIFICATION
      ↓
54-T GOVERNANCE / SECURITY REVIEW
      ↓
AEGIS / HUMAN APPROVAL
      ↓
PAYRAIL PRODUCTION ENABLEMENT
```

A test pass is evidence, not authority. BE remains the explicit evaluator layer, and 54-T performs the required governance/security review before production enablement; neither is bypassed by a generic approval.
