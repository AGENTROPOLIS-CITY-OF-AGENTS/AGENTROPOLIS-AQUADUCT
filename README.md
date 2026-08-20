# AGENTROPOLIS AQUEDUCT

**Cross-chain testnet provisioning infrastructure for AGENTROPOLIS.**

AGENTROPOLIS AQUEDUCT is a public 3D testnet map for wallet discovery, faucet routing, network adapters, policy controls, and verifiable funding receipts.

> Prime the Aqueduct.

## Current release

The first release is a static GitHub Pages surface adapted from the HERMES CITY Three.js public-shell pattern. It represents supported test networks as **Chainwells** connected to a central AQUEDUCT reservoir.

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
| **AQUEDUCT RECEIPTS** | Funding and verification evidence |

## Represented testnet lanes

The initial visual registry includes:

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
        +-- AQUEDUCT AGENT KIT
                |
                +-- EVM adapters
                +-- Solana adapter
                +-- XRPL adapter
                +-- Stellar adapter
                +-- Move adapters
                +-- Substrate adapter
        |
        v
54-T / ASBE policy gate
        |
        v
Testnet execution + verification receipts
```

The current GitHub Pages build implements only the public visualization and documentation layer. MCP and Agent Kit execution remain future governed components.

## Local preview

No build step is required. Serve the repository root with any static HTTP server.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

A Pages deployment workflow is included at `.github/workflows/pages.yml`.

For a public launch:

1. Set repository visibility to **Public**.
2. In **Settings → Pages**, select **GitHub Actions** as the source if it is not already enabled.
3. Push to `main` or manually run the Pages workflow.

Expected project-site URL after Pages is enabled:

```text
https://wiredchaos.github.io/AGENTROPOLIS-AQUEDUCT/
```

## Security boundary

AQUEDUCT must never expose:

- private keys or seed phrases
- production wallet credentials
- provider secrets
- internal capability handles
- unrestricted transaction permissions
- autonomous mainnet asset authority

Future faucet execution should occur behind capability-scoped MCP/Agent Kit interfaces with provider-policy enforcement, rate-limit respect, 54-T/ASBE checks, and auditable receipts.

## Attribution

The initial static 3D interaction pattern is adapted from [HERMES CITY](https://github.com/wiredchaos/HERMES-CITY), also maintained by Wired Chaos. See `NOTICE.md` for the license and identity boundary.

## License

Apache License 2.0. See `LICENSE`.
