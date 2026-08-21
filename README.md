# AGENTROPOLIS AQUEDUCT

**Cross-chain testnet provisioning infrastructure for AGENTROPOLIS.**

AGENTROPOLIS AQUEDUCT is a public 3D testnet map for wallet discovery, faucet routing, network adapters, policy controls, privacy lanes, and verifiable funding receipts.

> Prime the Aqueduct.

**Canonical repository:** `AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AQUADUCT`

**Live GitHub Pages:** `https://agentropolis-city-of-agents.github.io/AGENTROPOLIS-AQUADUCT/`

## Current release

The current release is a static GitHub Pages surface adapted from the HERMES CITY Three.js public-shell pattern. It represents supported test networks as **Chainwells** connected to a central AQUEDUCT reservoir, with **VEILWELL** as the dedicated Monero privacy lane.

The site is intentionally **read-only**:

- no private keys
- no mnemonics
- no wallet custody
- no mainnet execution
- no browser-side autonomous faucet calls
- no CAPTCHA or rate-limit bypassing

Faucet cards link to official network documentation or public faucet resources where available.

## Naming system

| Component | Role |
| --- | --- |
| **AGENTROPOLIS AQUEDUCT** | Cross-chain testnet infrastructure layer |
| **AQUEDUCT MCP** | Planned chain-neutral capability interface |
| **AQUEDUCT Agent Kit** | Planned governed execution framework |
| **FLOWKEEPER** | Faucet governor and policy controller |
| **WALLET ATLAS** | Testnet wallet registry |
| **CHAINWELLS** | Network faucet/provider adapters |
| **FLOW ROUTERS** | Chain-family execution adapters |
| **VEILWELL** | Privacy lane for Monero test infrastructure |
| **AQUEDUCT RECEIPTS** | Funding and verification evidence |

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
        +-- AQUEDUCT MCP
        +-- FLOWKEEPER
        +-- WALLET ATLAS
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

The current GitHub Pages build implements the public visualization and documentation layer. MCP and Agent Kit execution remain future governed components.

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
- provider secrets
- internal capability handles
- unrestricted transaction permissions
- autonomous mainnet asset authority

Future faucet execution should occur behind capability-scoped MCP/Agent Kit interfaces with provider-policy enforcement, rate-limit respect, 54-T/ASBE checks, and auditable receipts.

For VEILWELL, privacy is treated as an end-to-end infrastructure property: remote-node metadata, RPC exposure, logging, wallet isolation, and provider use remain part of the threat model.

## Attribution

The initial static 3D interaction pattern is adapted from [HERMES CITY](https://github.com/wiredchaos/HERMES-CITY), which remains hosted in the Wired Chaos namespace. See `NOTICE.md` for the license and identity boundary.

## License

Apache License 2.0. See `LICENSE`.
