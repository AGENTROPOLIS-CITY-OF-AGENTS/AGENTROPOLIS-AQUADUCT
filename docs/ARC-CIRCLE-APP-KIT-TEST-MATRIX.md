# Arc / Circle App Kit Certification Matrix

Status: test-harness contract

AQUADUCT SHOULD maintain testnet/conformance scenarios for Circle App Kit capabilities used by AGENTROPOLIS.

| Capability | Required evidence |
| --- | --- |
| Send | estimate, signer boundary, recipient binding, balance delta, receipt |
| Bridge | route, fees, burn/attestation/mint state, recovery, settlement |
| Swap | estimate, slippage/stop-limit, provider fees, output, destination completion |
| Unified Balance | deposit/spend state, delegated authority, balance reconciliation |
| Onramp | session boundary, server-side secret isolation, regulated user handoff |
| Earn | preview, risk/position limits, deposit/withdraw state, resulting position |

## Arc-specific conformance

Tests SHOULD cover:
- Arc Testnet chain identity and RPC selection;
- USDC gas behavior;
- dual native/ERC-20 USDC representation;
- deterministic finality assumptions;
- receipt normalization;
- provider/RPC failure;
- replay/idempotency;
- signer unavailable;
- expired quote;
- partial bridge recovery;
- destination pending vs settled.

## Standing rule

> Test the provider behavior that policy depends on, not only the happy-path SDK call.
