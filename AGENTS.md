# AGENTROPOLIS AQUADUCT — Agent UI Rules

## 21st.dev first

For major frontend UI work, search the 21st.dev catalog before inventing a component from scratch.

Use the installed `@21st-dev/cli` and the unified MCP endpoint documented in `docs/21st-dev-mcp.md`.

Preferred workflow:

1. Search for 3–5 candidate components.
2. Review previews, source, dependencies, and motion behavior.
3. Choose the best candidate for the existing AQUADUCT visual system.
4. Install the selected component.
5. Adapt tokens and copy without breaking its interaction model.
6. Verify accessibility, reduced-motion behavior, responsive layout, and performance.

Do not auto-install the first search result.

## Required search-first surfaces

Search 21st before building or replacing any of these:

- hero sections
- WebGL / shader backgrounds
- React Three Fiber scenes or spatial presentation primitives
- docks and command palettes
- animated navigation
- complex telemetry / bento surfaces
- terminal / CRT treatments
- major section transitions

## AQUADUCT visual canon

- HERMES3D is Agent City.
- AQUADUCT is a governed city utility.
- Chainwells are agent service stations, analogous to fuel/charging infrastructure.
- The city is the primary spatial experience. UI must not bury it behind a generic marketing hero.
- Visual palette: black, neon cyan, glitch red, electric green, accent magenta, VEILWELL orange.
- Prefer real shader/3D techniques over CSS simulations when the effect is materially spatial.

## Trust boundary

Frontend code is never financial authority.

Browser / React / Three.js may:

- render HERMES3D
- render public telemetry
- collect bounded user/agent intent
- show Bot Mode state
- show public network metadata

Browser code must never own:

- private keys or seed phrases
- signer credentials
- provider secrets
- financial authorization decisions
- mainnet execution authority

Rust remains the trusted gateway/policy/receipt boundary. BE remains AQUADUCT's evaluator/promotion layer. 54-T remains part of governance review.

## Secrets

Never commit `API_KEY_21ST` or other MCP/provider credentials. Use environment variables and local MCP client configuration only.
