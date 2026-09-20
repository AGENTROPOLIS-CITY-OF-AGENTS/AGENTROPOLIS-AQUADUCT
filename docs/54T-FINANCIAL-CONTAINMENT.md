# AQUADUCT / 54T Financial Containment

AQUADUCT is the testnet and pre-production proving plane. 54T supplies containment and trust enforcement around every financial adapter test.

## Boundary

```text
FISCALITH intent
  -> AEGIS sandbox requirement
  -> 54T containment profile
  -> AQUADUCT test execution
  -> verification / receipts
  -> Proof Graph
  -> Forge certification
```

54T SHOULD restrict:
- network egress to approved RPC/provider destinations;
- signer access to test/scoped capability handles;
- filesystem, shell, package-manager and subprocess capability;
- credential paths;
- MCP tools and delegated-agent paths;
- provider and contract addresses;
- replay and duplicate economic action.

## Promotion evidence

AQUADUCT results SHOULD bind:
- adapter/version hash;
- dependency snapshot;
- chain and provider;
- canonical FISCALITH intent hash;
- AEGIS decision reference;
- 54T containment attestation;
- execution and verification receipts;
- observed failure/recovery behavior.

AQUADUCT success does not grant production authority.
