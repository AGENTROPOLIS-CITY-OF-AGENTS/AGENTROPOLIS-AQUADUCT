# 21st.dev MCP + CLI Integration

AGENTROPOLIS AQUADUCT uses 21st.dev as the external UI component discovery and installation layer for the HERMES3D web experience.

The goal is to stop inventing generic hero sections, shaders, docks, and spatial UI from scratch when a reviewed component already exists in the 21st catalog.

## Supported integration

- CLI package: `@21st-dev/cli`
- Unified MCP endpoint: `https://21st.dev/api/mcp`
- Interactive authentication: `21st login`
- CI / automation authentication: `API_KEY_21ST`

Never commit a real 21st API key. `.env*` is ignored except `.env.example`.

## Bootstrap

```bash
bash scripts/setup-21st.sh
21st login
```

For CI or headless agents:

```bash
export API_KEY_21ST='...'
```

## AQUADUCT discovery-first workflow

Before creating or rewriting a major UI surface, search 21st first.

Recommended queries:

```bash
21st search "3D shader cyberpunk hero WebGL"
21st search "CRT scanline terminal hero"
21st search "spatial dashboard holographic HUD"
21st search "react three fiber shader background"
21st search "3D city map interface"
21st search "dock command palette cyberpunk"
21st search "neon bento telemetry"
```

Use `21st get` to inspect source and dependencies before installation when available in the current CLI version. Use `21st add <component>` only after the component is selected.

## Selection rules

For AQUADUCT, prefer components that satisfy the following:

1. Real shader/WebGL/React Three Fiber output is preferred over CSS pretending to be 3D.
2. The HERMES3D Agent City remains the primary visual object, not decorative background art.
3. CRT/neon/cyber visual language should match the WIRED CHAOS token system: black, cyan, red, green, magenta, and VEILWELL orange.
4. Components must support dark UI and readable contrast.
5. Motion must support `prefers-reduced-motion` or be straightforward to adapt.
6. No component may receive signer secrets, wallet seeds, provider credentials, or privileged capability handles.
7. The browser remains visualization and intent only. Rust remains the authority boundary.
8. BE remains the evaluator/promotion layer used by AQUADUCT.

## React migration implication

The current public AQUADUCT site is static HTML/CSS/Three.js. Most 21st components are React/Tailwind/shadcn-oriented.

Therefore do not paste React components into the legacy static page ad hoc. The intended migration is:

```text
21st search / preview
        |
        v
select real components + shaders
        |
        v
React/Tailwind frontend shell
        |
        +-- HERMES3D spatial scene
        +-- 21st hero/shaders/navigation/UI
        +-- HERMES Bot Mode visualization
        |
        v
Rust gateway / policy / receipts
```

The Rust workspace is independent of the frontend migration.

## What to source from 21st first

Priority order:

1. shader / animated background suitable for HERMES3D
2. hero composition that does not obscure the city
3. spatial/3D presentation primitives
4. command dock / navigation
5. telemetry cards and contextual panels
6. terminal/CRT treatments
7. transitions and section motion

Do not finalize the next live-site visual redesign until these searches have been reviewed.
