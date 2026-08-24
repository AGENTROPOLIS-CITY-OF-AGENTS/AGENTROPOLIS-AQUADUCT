# Harness Dispatch Boundary

## Purpose

AGENTROPOLIS AQUADUCT may consume work produced by an approved agent harness, but harness selection and harness lifecycle governance do not belong to Aquaduct.

Harness admission, UHP interoperability, runtime conformance, revocation, and BYOE lifecycle are owned by the Docking District.

Aquaduct remains the cross-chain testnet trust, policy, routing, signing-boundary, verification, and receipt plane.

## Canonical Rule

```text
Harness != Aquaduct Authority
```

A selected harness may reason, plan, transform data, or call approved Aquaduct interfaces. It MUST NOT inherit authority merely because Dispatch routed a task to it.

## Allowed Flow

```text
AGENTROPOLIS DISPATCH
      |
      | selects approved harness profile
      v
CONFIGURED HARNESS
      |
      | bounded intent / approved capability call
      v
AQUEDUCT GATEWAY
      |
      v
AQUEDUCT POLICY
      |
      v
CAPABILITY-SCOPED CHAIN ADAPTER
      |
      v
SIGNER / PROVIDER
      |
      v
VERIFY -> RECEIPT -> AUDIT
```

## Non-Bypass Invariants

No harness, UHP server, MCP client, district agent, or external runtime may bypass:

- AQUEDUCT gateway validation
- testnet-only restrictions
- mainnet denial
- wallet and signer isolation
- provider rate limits
- FLOWKEEPER policy
- transaction verification
- receipt generation
- audit requirements

The harness never receives private keys, seed phrases, unrestricted signer credentials, or a capability that is broader than the active mandate.

## Capability Discovery

A harness or UHP server advertising a capability is not authorization.

Effective authority remains the intersection of:

1. AGENTROPOLIS identity
2. active mandate
3. AEGIS policy
4. Dock runtime grant
5. district tool/skill policy
6. Aquaduct policy
7. adapter capability
8. budget/rate limits

Any denial fails closed.

## Sessions and Memory

Harness session state is execution-local continuity, not Aquaduct state and not sovereign AGENTROPOLIS memory.

Aquaduct trusts only validated intent, policy decisions, verified execution results, and canonical receipts that pass its own boundary.

## Runtime Preference

Hermes may be the preferred/native AGENTROPOLIS harness, but Aquaduct must remain harness-agnostic. Codex, Claude Code, local runtimes, or future approved UHP-compatible harnesses may be used upstream without changing Aquaduct authority semantics.

## Failure Rule

If a harness becomes unavailable, non-conformant, revoked, compromised, over-budget, or policy-incompatible:

- Dispatch must stop selecting it
- active work should be cancelled when supported
- no new Aquaduct capability handle may be issued through that route
- Aquaduct continues to enforce its own boundary independently

The city owns the agent. The harness is replaceable. Aquaduct owns chain authority within its mandate.
