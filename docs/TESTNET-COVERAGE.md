# AQUEDUCT Testnet Coverage

AQUEDUCT uses `config/testnet-registry.json` as the canonical registry for public development networks and their funding sources.

## Coverage rule

"All available testnets" is implemented as a governed discovery model rather than a frozen marketing claim.

A network may enter the registry when it is publicly documented and relevant to an AGENTROPOLIS execution, settlement, identity, asset, privacy, gaming, or agentic-development rail. Registry entries move through:

`DISCOVERED -> VERIFIED -> ADAPTER-READY -> EXECUTABLE`

The public UI may display verified networks before execution adapters exist. Execution remains disabled unless the backend adapter, policy controls, signer boundary, verification, and receipts have independently cleared review.

## Current registry

The September 19, 2026 registry contains **60** test/dev/stage/preview lanes spanning:

- EVM and EVM-derived networks
- Superchain networks
- ZK / rollup networks
- Solana
- XRPL
- Stellar
- Hedera
- Sui
- Aptos
- Polkadot/Substrate
- TRON
- Cronos
- Dogecoin
- Algorand
- NEAR
- Noble/Cosmos
- Monero privacy development networks
- Robinhood Chain Testnet
- Circle Arc Testnet
- LitVM LiteForge

## Funding-source policy

Each network has one or more upstream funding sources. AQUEDUCT records the source type and whether the path is programmatic, mixed, human-required, or manual.

Provider requirements are authoritative. AQUEDUCT must not bypass:

- CAPTCHA
- identity/account requirements
- mainnet-balance requirements
- rate limits
- cooldowns
- wallet ownership checks
- geographic restrictions

Drip amounts and cooldown periods are deliberately **not** hard-coded as policy because upstream providers change them.

## Multi-source routing

Where more than one approved source exists, FLOWKEEPER may select an alternate source after an unavailable or exhausted provider is detected. Fallback routing must never be used to evade a provider's anti-abuse controls.

## Mainnet boundary

`mainnetAllowed` is permanently false in this registry. Mainnet execution belongs to separate governed economic infrastructure and is not unlocked by adding a testnet entry.
