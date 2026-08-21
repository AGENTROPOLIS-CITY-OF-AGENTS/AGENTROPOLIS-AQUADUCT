# Security Policy

AGENTROPOLIS AQUEDUCT is finance-adjacent testnet infrastructure. Security claims must be evidence-based and narrowly scoped.

## Current security posture

- Public GitHub Pages is visualization and read-only metadata only.
- The Rust gateway is the intended trusted control-plane boundary.
- Execution is currently disabled in the Rust gateway.
- Mainnet execution is out of scope and must remain denied.
- No private key, seed phrase, signer secret, provider secret, or gateway token may be committed to this repository or exposed to browser code.
- Provider cooldowns, rate limits, and human-verification requirements are authoritative and must not be bypassed.

## Required controls before enabling chain execution

Any production-capable adapter must have:

1. typed request/response models
2. integer-only asset amounts in smallest units
3. explicit network allowlists
4. capability-scoped signer access
5. deterministic policy evaluation
6. provider rate-limit and cooldown handling
7. post-transaction verification
8. tamper-evident execution receipts
9. unit and integration tests
10. dependency audit and clippy-clean CI
11. threat review for egress, replay, confused-deputy, SSRF, credential exposure, and mainnet-crossing risks
12. 54-T / BE review before promotion

## Rust requirements

The workspace forbids unsafe Rust and denies common reliability shortcuts through Clippy. CI runs formatting, clippy, tests, release builds, and `cargo audit`.

Rust reduces classes of memory-safety defects; it does not replace protocol review, key-management review, economic-risk review, or operational controls.

## Reporting

Do not open a public issue containing credentials, wallet secrets, private infrastructure details, or exploitable vulnerability instructions. Use GitHub's private security advisory mechanism for sensitive reports when enabled for this repository.
