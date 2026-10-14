# AQUEDUCT Fast Lane Provisioning

AQUEDUCT should not make a developer manually secure every public testnet before development begins.

## Two-track strategy

### Track A — instant development environments

For EVM work, use **Virtual TestNets / mainnet forks first** when the engineering goal is contract development, QA, stateful integration testing, or CI.

This removes public-faucet scarcity from the inner development loop.

Preferred path:

```text
REQUEST
  -> FLOWKEEPER
  -> TENDERLY VIRTUAL TESTNET
  -> FORK MAINNET STATE
  -> TOP UP TEST BALANCES
  -> DEPLOY / TEST / SIMULATE
  -> RECEIPT
```

A Virtual TestNet is not the same thing as the chain's public testnet. It is the speed lane for engineering.

### Track B — real public testnet certification

Before claiming public-testnet compatibility, run the same workload through the actual public chain.

```text
VNET PASS
  -> PUBLIC TESTNET
  -> QUICKNODE / CHAINSTACK API
  -> CHAIN-NATIVE FAUCET
  -> CIRCLE TEST ASSET IF NEEDED
  -> VERIFY ONCHAIN
  -> CERTIFICATION RECEIPT
```

## Reservoir model

Do not provision only at the moment a developer needs tokens.

Maintain bounded **testnet reservoir wallets** per supported network:

- minimum balance threshold
- target balance
- maximum balance
- provider cooldown state
- last refill receipt
- source provenance
- wallet-family isolation
- no private keys in browser/model context

FLOWKEEPER replenishes a reservoir before it reaches the floor. Project wallets receive bounded transfers from the reservoir where chain policy permits.

## Paid acceleration

AQUEDUCT may use legitimate paid infrastructure to reduce development delay:

- paid RPC plans
- provider priority queues
- larger provider drips where explicitly offered
- provider faucet APIs
- contracted test-token allocations
- hosted Virtual TestNets

AQUEDUCT must **not purchase supposedly valuable testnet tokens from gray-market sellers**. Testnet assets have no intended financial value, provenance can be poor, and buying them creates unnecessary scam and compliance risk.

## Mainnet counterparts

Every testnet entry may name a mainnet counterpart for:

- state comparison
- ABI/code retrieval
- fork creation
- gas and fee observation
- production-readiness diffing
- mainnet-vs-testnet drift analysis

Cataloguing a mainnet does not grant mainnet signing or spending authority.

## Testnet-paid mainnet infrastructure

Provider infrastructure can create an unusual but useful lane: a testnet token may pay the **RPC provider fee** for a query against a mainnet endpoint.

This is provider access only.

It does **not**:
- pay blockchain mainnet gas
- supply mainnet ETH/SOL/POL/etc.
- authorize a transaction signer
- bypass the Execution Envelope
- convert AQUEDUCT into a mainnet treasury

## Developer objective

A developer should normally receive:

1. an instant VNet or sandbox,
2. a funded public-testnet wallet when available,
3. RPC credentials/capabilities,
4. explorer and network metadata,
5. a verification receipt,
6. a clear statement of anything still human-gated.

The goal is **hours-to-environment**, not weeks-to-faucet.
