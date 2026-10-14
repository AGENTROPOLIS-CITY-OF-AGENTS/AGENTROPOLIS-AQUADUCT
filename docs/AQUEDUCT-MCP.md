# AQUEDUCT MCP

AQUEDUCT MCP is the chain-neutral capability interface for governed AGENTROPOLIS testnet provisioning. The canonical contract is `config/aqueduct-mcp.contract.json`.

## Tool surface

| Tool | Mode | Purpose |
| --- | --- | --- |
| `aqueduct.wallet.resolve` | read | Resolve a WALLET ATLAS ID to public testnet addresses |
| `aqueduct.wallet.balance` | read | Read a registered testnet balance |
| `aqueduct.faucets.discover` | read | Discover compatible CHAINWELLS and interaction requirements |
| `aqueduct.faucets.plan` | read | Evaluate threshold, cooldown, provider, and policy state without execution |
| `aqueduct.faucets.prime` | write | Ask agentd to request testnet funding through an approved adapter |
| `aqueduct.faucets.status` | read | Inspect provider/cooldown/verification state |
| `aqueduct.faucets.verify` | read | Verify funding from chain state |
| `aqueduct.receipts.list` | read | Read sanitized provisioning receipts |

## Execution corridor

`aqueduct.faucets.prime` is not unrestricted wallet authority. It compiles to:

```text
Identity -> Mandate -> Wallet ID -> Testnet Network -> Policy
        -> Provider Capability -> Cooldown -> Execute -> Verify -> Receipt
```

The write path accepts registered wallet IDs and testnet intent only. It must never accept raw private keys, seed phrases, arbitrary provider URLs, mainnet destinations, or instructions to defeat provider controls.

## Provider classes

- `machine-callable`: a reviewed testnet provider exposes a programmatic interface and agentd has a bounded adapter.
- `human-required`: CAPTCHA, login, social verification, or other interactive controls are authoritative. AQUEDUCT returns a human-required state instead of bypassing them.

Initial machine-callable lanes are Solana Devnet, Stellar Testnet Friendbot, and XRPL Testnet. EVM faucets remain human-required until a machine API is reviewed against provider terms and rate limits.

## Agent MCP bridge

The system-wide AGENTROPOLIS Agent MCP may delegate a bounded request to AQUEDUCT, but it must not duplicate faucet execution. AQUEDUCT owns FLOWKEEPER policy, WALLET ATLAS resolution, CHAINWELL routing, verification, and provisioning receipts.

## Deployment boundary

The contract intentionally has `configured: false`. It defines the capability surface without pretending an MCP endpoint is deployed. Runtime URLs and credentials stay outside Git.
