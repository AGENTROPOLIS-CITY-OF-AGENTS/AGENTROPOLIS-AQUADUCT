# AGENTROPOLIS AQUEDUCT

**Cross-chain testnet provisioning infrastructure for AGENTROPOLIS.**

AGENTROPOLIS AQUEDUCT is a public 3D testnet map for wallet discovery, faucet routing, network adapters, policy controls, privacy lanes, HERMES Bot Mode visualization, and verifiable funding receipts.

> Prime the Aqueduct.

**Canonical repository:** `AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AQUADUCT`

**Live GitHub Pages:** `https://agentropolis-city-of-agents.github.io/AGENTROPOLIS-AQUADUCT/`

## Current release

The current release is a static GitHub Pages surface adapted from the HERMES CITY Three.js public-shell pattern and the spatial-agent visualization principles used by Hermes3D. It represents supported test networks as **Chainwells** connected to a central AQUEDUCT reservoir, with **VEILWELL** as the dedicated Monero privacy lane and a district-scoped **HERMES Bot Mode** control room.

The public site is intentionally **read-only**:

- no private keys
- no mnemonics
- no wallet custody
- no mainnet execution
- no gateway tokens in browser source
- no browser-side autonomous faucet calls
- no CAPTCHA or rate-limit bypassing

Faucet cards link to official network documentation or public faucet resources where available.

## Naming system

| Component | Role |
| --- | --- |
| **AGENTROPOLIS AQUEDUCT** | Cross-chain testnet infrastructure layer |
| **HERMES Bot Mode** | District-scoped multi-agent orchestration environment |
| **AQUEDUCT MCP** | Planned chain-neutral capability interface |
| **AQUEDUCT Agent Kit** | Planned governed execution framework |
| **FLOWKEEPER** | Faucet governor and policy controller |
| **WALLET ATLAS** | Testnet wallet registry |
| **CHAINWELLS** | Network faucet/provider adapters |
| **FLOW ROUTERS** | Chain-family execution adapters |
| **VEILWELL** | Privacy lane for Monero test infrastructure |
| **AQUEDUCT RECEIPTS** | Funding and verification evidence |

## HERMES Bot Mode

AQUEDUCT includes a checked-in district Bot Mode profile at:

`config/hermes-botmode.aqueduct.json`

The profile defines:

- district scope and mandate
- approved capabilities
- testnet-only policy controls
- specialized agent roles
- the `DISCOVER -> MEASURE -> AUTHORIZE -> ROUTE -> EXECUTE -> VERIFY -> RECEIPT` workflow
- required receipt fields
- a future gateway seam for live public telemetry

The current Pages surface renders that profile in a dedicated Three.js control room through `botmode.js` and `botmode.css`.

The visualization is not itself the authority layer. A future live runtime connection must remain behind a governed gateway or same-origin backend seam. Do not put upstream gateway tokens, wallet credentials, or signer material into GitHub Pages source.

### AQUEDUCT Bot Mode team

- **FLOWKEEPER** — governor, thresholds, cooldowns, provider policy, authorization
- **WALLET ATLAS** — wallet-family and network registry
- **ROUTE ENGINE** — adapter and Chainwell routing
- **CHAIN VERIFIER** — confirmation and post-funding verification
- **RECEIPT SCRIBE** — provenance and audit evidence
- **VEIL SENTINEL** — XMR Stagenet privacy and remote-node policy

## Represented testnet lanes

The current visual registry includes:

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

The registry is intentionally adapter-driven. Networks can be added without changing the core visual or governance model.

## Architecture

```text
HERMES / AGENTROPOLIS
        |
        v
AGENTROPOLIS AQUEDUCT
        |
        +-- HERMES BOT MODE (district-scoped)
        |       +-- FLOWKEEPER
        |       +-- WALLET ATLAS
        |       +-- ROUTE ENGINE
        |       +-- CHAIN VERIFIER
        |       +-- RECEIPT SCRIBE
        |       +-- VEIL SENTINEL
        |
        +-- AQUEDUCT MCP
        +-- VEILWELL / XMR privacy lane
        +-- AQUEDUCT AGENT KIT
                |
                +-- EVM adapters
                +-- Solana adapter
                +-- XRPL adapter
                +-- Stellar adapter
                +-- Move adapters
                +-- Substrate adapter
                +-- Monero adapter
        |
        v
54-T / ASBE policy gate
        |
        v
Testnet execution + verification receipts
```

The current GitHub Pages build implements the public visualization and documentation layer. Live MCP, Agent Kit, and Bot Mode execution remain governed backend components.

## Local preview

No build step is required. Serve the repository root with any static HTTP server.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

A Pages deployment workflow is included at `.github/workflows/pages.yml`.

Deployment source:

- repository: `AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AQUADUCT`
- branch: `main`
- source: GitHub Actions
- live URL: `https://agentropolis-city-of-agents.github.io/AGENTROPOLIS-AQUADUCT/`

Pushes to `main` trigger the Pages workflow automatically. It can also be run manually with `workflow_dispatch`.

## Security boundary

AQUEDUCT must never expose:

- private keys or seed phrases
- production wallet credentials
- gateway access tokens
- provider secrets
- internal capability handles
- unrestricted transaction permissions
- autonomous mainnet asset authority

Future faucet execution should occur behind capability-scoped MCP/Agent Kit/Bot Mode interfaces with provider-policy enforcement, rate-limit respect, 54-T/ASBE checks, and auditable receipts.

For VEILWELL, privacy is treated as an end-to-end infrastructure property: remote-node metadata, RPC exposure, logging, wallet isolation, and provider use remain part of the threat model.

## Attribution

The initial static 3D interaction pattern is adapted from [HERMES CITY](https://github.com/wiredchaos/HERMES-CITY), which remains hosted in the Wired Chaos namespace.

The HERMES Bot Mode spatial visualization also follows architectural principles from [Hermes3D](https://github.com/iamlukethedev/Hermes3D), an MIT-licensed community project that treats the 3D environment as a visualization/interaction layer over a separate agent runtime. AQUEDUCT does not claim affiliation with that project's maintainers.

See `NOTICE.md` for the license and identity boundary.

## License

Apache License 2.0. See `LICENSE`.
