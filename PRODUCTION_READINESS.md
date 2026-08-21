# AGENTROPOLIS AQUEDUCT — Production Readiness

This document defines the public v1 boundary for AGENTROPOLIS AQUEDUCT.

## What is live today

- Public GitHub Pages 3D visualization
- Chainwell registry visualization
- VEILWELL / XMR privacy lane visualization
- HERMES Bot Mode district visualization
- Checked-in district Bot Mode policy profile
- Rust control-plane workspace
- Deterministic Rust policy evaluation
- Deterministic receipt hashing
- Rust gateway health and policy endpoints
- Rust CI trust gates
- Dependency update automation

## What is intentionally disabled

- Signer-backed transaction execution
- Browser wallet custody
- Private key or mnemonic handling
- Mainnet routing
- Automated bypass of provider rate limits, CAPTCHA, identity checks, or cooldowns
- Autonomous movement of assets with real-world value

The Rust gateway must report `execution_enabled: false` and `mainnet_allowed: false` until execution adapters have passed the promotion gates below.

## Trust boundary

```text
GitHub Pages / Three.js / HERMES 3D
              |
        telemetry + intent
              v
         Rust Gateway
              |
      deterministic policy
              |
      capability-scoped adapters
              |
       signer / wallet provider
              |
       verification + receipts
```

The browser is never an authority boundary.

## Required gates before enabling execution

1. Chain adapter implementation reviewed per supported chain family.
2. Secrets remain outside browser source and model context.
3. Signers accessed only through scoped capability handles.
4. Network allowlist enforced server-side.
5. Testnet/stagenet environment validated independently of caller input.
6. Amounts represented as integer base units only.
7. Provider cooldown and rate-limit state fails closed.
8. Human-required provider flows remain human-required.
9. Every execution emits a deterministic receipt.
10. Negative tests cover mainnet attempts, malformed intents, stale registry data, replay, and provider failure.
11. `cargo fmt --check` passes.
12. `cargo clippy -D warnings` passes.
13. `cargo test --workspace --all-features` passes.
14. release build passes.
15. dependency audit passes or has a documented reviewed exception.
16. 54-T / BE promotion review approves the effective capability surface.

## Public v1 release classification

**Status:** Production public visualization + production-oriented Rust trust foundation.

**Execution status:** Disabled by design.

This distinction is intentional. The live public site is production software; the asset-execution plane is not declared production-ready until the execution promotion gates are satisfied.

## Developer verification

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo build --workspace --release
cargo run -p aqueduct-gateway
```

Then query:

```text
GET http://127.0.0.1:8787/health
```

The response must identify the Rust trust boundary and show execution/mainnet disabled.

## Release rule

Do not change `EXECUTION_ENABLED` or `MAINNET_ALLOWED` to `true` through a standalone commit. Any such change must arrive with the relevant adapter implementation, tests, security review evidence, and governance receipt in the same promotion set.
