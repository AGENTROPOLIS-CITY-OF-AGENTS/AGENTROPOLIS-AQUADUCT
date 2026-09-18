# Circle App Kit Certification Harness

Status: testnet / sandbox implementation contract

## Installation

AQUADUCT is the certification surface that is allowed to install Circle App Kit for proving behavior before production promotion.

Initial Arc/EVM harness:

```bash
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem
```

Optional adapters are added only when the test lane requires them:
- `@circle-fin/adapter-ethers-v6`
- `@circle-fin/adapter-solana-kit`
- `@circle-fin/adapter-circle-wallets`

Circle Wallets is server-side only.

Circle API key requirements:
- Onramp requires a Circle Console API key.
- Swap may run without a key but is rate limited.
- Earn may run without a key but is rate limited.

## AQUADUCT role

AQUADUCT must exercise provider behavior in a controlled testnet / sandbox before the Forge treats the capability as certification evidence.

Test targets:
- Send
- Bridge
- Swap
- Unified Balance deposit
- Unified Balance spend
- Onramp session integration
- Earn preview
- Earn deposit
- Earn withdrawal

## Evidence requirements

Each harness run should emit normalized evidence for:
- ProofOfCapability
- ProofOfRoute
- ProofOfQuote
- ProofOfExecution
- ProofOfBalanceChange
- ProofOfSettlement
- ProofOfOutcome
- ProofOfRefusal when blocked
- ProofOfFiscalDiscipline where limits or fees are evaluated

## Secret boundary

Circle API keys, wallet credentials, and signer secrets:
- remain server-side;
- are injected only through approved secret handles;
- are never committed;
- are never exposed through GitHub Pages;
- are never embedded into ATG or FISCALITH payloads.

## Promotion rule

```text
AQUADUCT TEST PASS
      ↓
EVIDENCE
      ↓
PROOF GRAPH
      ↓
FORGE CERTIFICATION
      ↓
AEGIS / HUMAN APPROVAL
      ↓
PAYRAIL PRODUCTION ENABLEMENT
```

A test pass is evidence, not authority.
