# Sovereign Agentic Testnet54 — v0.1 design
Status: design only, no execution or production approval.

Extend the existing AQUEDUCT Rust policy, receipt, gateway and AEGIS boundaries; do not create another repository, chain, PAYRAIL, identity system or custody service.

## Sovereign mode
Must operate offline without third-party RPC, hosted agents, faucet, APIs, or wallet providers. Pin and audit any open-source libraries. External chains are optional conformance adapters, never required for core operation.

## Native capabilities
- Typed missions, bounded agent roles, scoped permissions and deterministic simulation clock.
- Nonredeemable simulated test credits, integer-only accounting and simulated escrow.
- BUZZ-compatible contribution events with deduplication, replay prevention and provenance.
- Mission verification independent from agent claims; receipt chain with domain-separated hashes.
- Failure scenarios: forged completion, Sybil activity, duplicated payout, exhausted budget, unauthorized capability and malicious third agent.
- Read-only 3D HERMES visualization explicitly labeled SIMULATION.

## Ownership
ENTITY54 identity; CIP54 signed intent; AEGIS/APEX54/54-T assurance; BE evaluation; AGENT-ENTITY FORGE certification; MATH54/SCIENCE54 measurement; PAYRAIL production settlement only. AQUEDUCT does not grant authority or promote agents automatically.

## Acceptance gates
1. Same seed and intents produce identical state and receipt digest.
2. No external network access required.
3. Simulated credit conservation; no underflow/overflow.
4. Duplicate event cannot double-credit.
5. Unauthorized agents are denied with auditable denial records.
6. Invalid verifier evidence cannot release simulated escrow.
7. Cross-run replay and cross-agent state access denied.
8. No mainnet, signing, live faucet, or production settlement path.
9. Graduation requires independent certification and explicit authorization.

## First scenario
Agent A posts mission; B accepts; policy locks simulated escrow; B submits evidence; independent verifier judges; test credits settle only on accepted proof; C attempts forged completion and is denied. Record reproducible receipts.

## OpenLaunch candidate — nondependent evaluation
OpenLaunch may be evaluated as an optional external token-launch adapter, NOT imported into sovereign testnet runtime. Claims requiring independent verification: MIT license, Uniswap v4 integration, chain support for Arc/Base/Robinhood, liquidity lock semantics, fee paths, deployed bytecode and Arc-specific native-quote safeguards.

Conformance fixtures should model launch intent, token supply, quote-asset allowlist per chain, fee caps, simulated liquidity, price manipulation, failed deployment, malicious hook, replay and authorization denial. No real token creation, liquidity provisioning, or third-party reliance. Public-chain transactions cannot be made private by UI policy. FIN54 handles market evidence, not trade execution.

## Sequence
P0 inventory and threat model; P1 offline mission simulator; P2 adversarial tests; P3 3D visualization; P4 optional external adapter conformance and independent review.
