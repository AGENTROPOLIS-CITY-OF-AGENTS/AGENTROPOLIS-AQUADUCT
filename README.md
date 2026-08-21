# AGENTROPOLIS AQUEDUCT

**Cross-chain testnet provisioning infrastructure for AGENTROPOLIS.**

AGENTROPOLIS AQUEDUCT combines a public 3D/HERMES visualization layer with a Rust-first trusted control plane for testnet policy, routing, receipts, and future chain execution.

> Prime the Aqueduct.

**Canonical repository:** `AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AQUADUCT`

**Live GitHub Pages:** `https://agentropolis-city-of-agents.github.io/AGENTROPOLIS-AQUADUCT/`

## Trust architecture

AQUEDUCT is finance-adjacent infrastructure. The browser is **not** the trusted execution environment.

```text
GitHub Pages / Three.js / HERMES Bot Mode visualization
                         |
                 intent + telemetry
                         v
                 Rust Gateway Boundary
                         |
             deterministic policy core
                         |
              capability-scoped adapters
                         |
                 signer / wallet provider
                         |
              verification + receipts
```

### Rust owns

- typed financial/testnet intent data
- integer-only asset-unit representation (`u128`)
- deterministic policy evaluation
- rate-limit/cooldown enforcement decisions
- human-required decisions
- receipt construction and SHA-256 evidence digests
- backend API boundary
- future chain adapters and signer-provider interfaces

### Browser JavaScript owns

- Three.js rendering
- HERMES Bot Mode visualization
- public network/faucet metadata
- user interaction and read-only telemetry

### Browser JavaScript must never own

- seed phrases or private keys
- signer credentials
- provider secrets
- authorization decisions
- transaction signing
- autonomous asset execution
- mainnet authority

## Rust workspace

The production control plane is organized as:

| Crate | Responsibility |
| --- | --- |
| `aqueduct-core` | typed domain objects and validation |
| `aqueduct-policy` | deterministic fail-closed policy evaluation |
| `aqueduct-receipts` | canonical receipt serialization and SHA-256 evidence digest |
| `aqueduct-gateway` | narrow HTTP trust boundary for UI/runtime integration |

Workspace policy:

- Rust 2024 edition
- `unsafe_code = "forbid"`
- Clippy denies `unwrap`, `expect`, `panic`, `todo`, and `unimplemented`
- no floating-point representation for requested asset units
- gateway binds to localhost by default
- CORS is restricted to the AQUEDUCT Pages origin unless explicitly overridden
- current gateway reports `execution_enabled: false`
- mainnet is not representable as an AQUEDUCT execution environment

## CI trust gates

`.github/workflows/rust-trust.yml` runs on Rust changes and requires:

1. `cargo fmt --check`
2. `cargo clippy --workspace --all-targets --all-features -- -D warnings`
3. `cargo test --workspace --all-features`
4. release build
5. `cargo audit`

Rust is not presented as proof of safety by itself. Production promotion additionally requires review of effective capabilities, dependency risk, chain-adapter behavior, signer boundaries, and execution receipts.

## Current execution status

**The Rust execution adapters are not live yet.** The current Rust gateway provides health and deterministic policy-evaluation endpoints only. This is intentional: chain execution and signer integrations should not be enabled until adapter-specific tests, threat review, and receipt verification are in place.

The public Pages site remains read-only:

- no private keys
- no mnemonics
- no wallet custody
- no mainnet execution
- no gateway tokens in browser source
- no browser-side autonomous faucet calls
- no CAPTCHA or rate-limit bypassing

## Naming system

| Component | Role |
| --- | --- |
| **AGENTROPOLIS AQUEDUCT** | Cross-chain testnet infrastructure layer |
| **HERMES Bot Mode** | District-scoped multi-agent orchestration environment |
| **AQUEDUCT MCP** | Chain-neutral capability interface |
| **AQUEDUCT Agent Kit** | Governed chain execution framework |
| **FLOWKEEPER** | Faucet governor and policy controller |
| **WALLET ATLAS** | Testnet wallet registry |
| **CHAINWELLS** | Network faucet/provider adapters |
| **FLOW ROUTERS** | Chain-family execution adapters |
| **VEILWELL** | Monero privacy lane |
| **AQUEDUCT RECEIPTS** | Funding and verification evidence |

## HERMES Bot Mode

The district profile lives at `config/hermes-botmode.aqueduct.json` and defines district scope, approved capabilities, testnet-only policy, specialized agent roles, required receipts, and the workflow:

```text
DISCOVER -> MEASURE -> AUTHORIZE -> ROUTE -> EXECUTE -> VERIFY -> RECEIPT
```

The Pages surface renders the profile with `botmode.js` and `botmode.css`. The visualization is not the authority layer; live execution must remain behind the Rust/backend gateway seam.

### Bot Mode team

- **FLOWKEEPER** — thresholds, cooldowns, provider policy, authorization
- **WALLET ATLAS** — wallet-family and network registry
- **ROUTE ENGINE** — adapter and Chainwell routing
- **CHAIN VERIFIER** — post-funding verification
- **RECEIPT SCRIBE** — provenance and audit evidence
- **VEIL SENTINEL** — XMR Stagenet privacy and remote-node policy

## Represented testnet lanes

- Ethereum Sepolia
- Base Sepolia
- OP Sepolia
- Arbitrum Sepolia
- Polygon Amoy
- Avalanche Fuji
- BSC Testnet
- LitVM LiteForge
- Solana Devnet
- XRPL Testnet
- Stellar Testnet
- Sui Testnet
- Aptos Testnet
- Polkadot Paseo
- Monero Stagenet via **VEILWELL**

## Security boundary

AQUEDUCT must never expose or accept through the public Pages layer:

- private keys or seed phrases
- production wallet credentials
- gateway access tokens
- provider secrets
- unrestricted transaction permissions
- autonomous mainnet asset authority

For VEILWELL, remote-node metadata, RPC exposure, logging, wallet isolation, and provider use remain part of the privacy threat model.

## Attribution

The initial static 3D interaction pattern is adapted from [HERMES CITY](https://github.com/wiredchaos/HERMES-CITY).

The HERMES Bot Mode spatial visualization follows architectural principles from [Hermes3D](https://github.com/iamlukethedev/Hermes3D), an MIT-licensed community project that treats the 3D environment as a visualization layer over a separate agent runtime. AQUEDUCT does not claim affiliation with that project's maintainers.

See `NOTICE.md` for license and identity boundaries.

## License

Apache License 2.0. See `LICENSE`.
