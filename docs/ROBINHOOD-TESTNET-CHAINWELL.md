# Robinhood Chain Testnet Chainwell

AQUEDUCT is the provisioning boundary for HOLOFOIL's Robinhood Chain Testnet mint path.

## Canonical flow

```text
HOOD TERPS
  -> HOLOFOIL mint service
  -> AGENTROPOLIS AQUEDUCT
  -> official Robinhood Chain Testnet faucet
  -> user wallet
  -> HOLOFOIL balance verification
  -> sample mint preparation
  -> signer approval
  -> Robinhood Chain Testnet
  -> explorer verification
  -> receipt
```

## Network

- Network: Robinhood Chain Testnet
- Chain ID: `46630`
- Native gas asset: `ETH` (testnet only)
- Public RPC: `https://rpc.testnet.chain.robinhood.com`
- Explorer: `https://explorer.testnet.chain.robinhood.com`
- Official faucet: `https://faucet.testnet.chain.robinhood.com`
- AQUEDUCT handoff: `/robinhood-testnet.html`

## Authority boundary

AQUEDUCT does not mint HOOD TERPS NFTs and does not custody user wallets. It only owns testnet provisioning/routing policy and evidence around the provisioning handoff.

The browser may display public network metadata and send the user to the upstream faucet. It must never collect seed phrases, private keys, signer credentials, or provider secrets.

The external faucet remains authoritative for eligibility, authentication, limits, cooldowns, and delivery. AQUEDUCT must not bypass those controls.

## HOLOFOIL contract

HOLOFOIL should expose provisioning as an explicit field in mint preparation. For the HOOD TERPS test collection the provisioning provider is `AGENTROPOLIS-AQUADUCT`, the network is `Robinhood Chain Testnet`, and the handoff mode is `EXTERNAL_FAUCET`.

A funded wallet is not proof that an NFT mint succeeded. HOLOFOIL must independently verify the wallet balance before enabling testnet execution, and a mint may only become `CONFIRMED` after a real chain transaction and token ID are verified.
