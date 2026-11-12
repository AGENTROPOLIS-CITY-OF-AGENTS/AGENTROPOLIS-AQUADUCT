# Governed Arc / Nanopayments POC

Status: design proposal only; no live payments, deployments, or integration claims.

## Objective
Validate whether Circle Nanopayments and Arc can support credentialed agent-to-agent metered service purchases. Verify network, SDK, Gateway, and settlement support against official documentation before implementation; do not assume direct Arc settlement compatibility.

## Canonical corridor
Identity -> credential and reputation validation -> Mandate -> spending policy (AEGIS) -> bounded execution envelope -> payment adapter -> service delivery verification -> signed receipt -> audit and reconciliation.

## Minimum acceptance tests
1. Default-deny unknown agents, recipients, and services.
2. Require independently validated credentials and user-owned payment authorization; never store user secrets in repo or NFT metadata.
3. Enforce per-request, daily, and aggregate spend ceilings and explicit network allowlists.
4. Use sandbox/testnet or mocked funds first; do not move production assets.
5. Use idempotency keys, durable queues, replay protection, timeouts, and safe retry behavior under network outages.
6. Verify actual transaction status and service delivery independently; do not treat an API response as settlement proof.
7. Produce signed evidence receipts with transaction IDs, policy decision, amounts, timestamps, and provenance, without exposing secrets.
8. Reconcile payment, refund, and failed service cases; document fee economics.
9. Verify Circle Nanopayments API availability, minimum amounts, account funding, and Arc chain compatibility using current official docs.
10. Require VERITY independent audit, 54T security review, CI pass, and NEURO approval before merge/deploy.

## SpaceX dependency
None. Satellite connectivity is an optional transport resilience scenario, not a payment rail or announced partnership. Simulate intermittent connectivity; never assume offline settlement.

## Ownership
ARC: payment use-case and settlement interface. AQUADUCT: connectivity, safe delivery, and network resilience. AEGIS/54T: policy and assurance. No trading authority delegated.
