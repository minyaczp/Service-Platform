# Handoff: Gridline — 3D Microservice City Platform

## Overview
Gridline is a frontend portal that fronts many backend microservices. The platform is visualised as a night-time neon **3D city**: every registered service is a building. Users explore the city, click a building to fly the camera to it, read a floating spec panel, then press **Use service** to open a full-area modal containing that service's own operating UI.

Core flow:
1. City overview (auto-rotating camera, all districts visible).
2. Click building (or sidebar item / building pin) → camera tweens to the building, info panel appears on the right.
3. "Use service" → modal covers the whole city viewport (everything except the sidebar) and shows the service-specific frontend.
4. "Back to building" returns to the panel; × / Esc / "Overview" / breadcrumb "City" returns to the overview.

## About the Design Files
The files in `demo/` are **design references created in HTML** — a working prototype showing intended look and behavior, not production code. Recreate it in the target codebase's environment (e.g. React + three.js / react-three-fiber, Vue + TresJS) using its established patterns. If no environment exists, recommended stack: **React + TypeScript + Vite, three.js via @react-three/fiber + drei, Zustand for state, CSS modules or Tailwind**.

To run the demo: serve the `demo/` folder over HTTP (e.g. `npx serve demo`) and open `Service City.dc.html`. `support.js` is the prototype runtime only — do not port it. Opening via `file://` may block the dynamic three.js import.

## Fidelity
**High-fidelity.** Colors, type, spacing, building mapping rules and interactions are final intent. Sample service data and service UIs are illustrative mock data — wire them to real APIs.

---

## Architecture (recommended)

```
App
├─ Sidebar (collapsible 288px ↔ 64px rail)
└─ Main (position: relative; flex: 1)
   ├─ CityView3D        (WebGL canvas, absolute inset 0)
   │   └─ BuildingPins  (HTML overlay projected from 3D each frame)
   ├─ CityViewIso       (CSS 3D isometric alternative, absolute inset 0)
   ├─ TopBar            (breadcrumb · Overview · view toggle)
   ├─ Legend + Hint     (bottom-left / bottom-right, hidden when modal open)
   ├─ InfoPanel         (selected && !modal)
   └─ ServiceModal      (selected && modal) → renders ServiceApp by service id
```

### Service registry (the key extension point)
Every service is one registry entry. Adding a building = adding an entry + (optionally) a `ServiceApp` component. Suggested TS shape:

```ts
type Health = 'healthy' | 'degraded' | 'deploying' | 'down';
type Kind = 'tower' | 'block' | 'cylinder' | 'stepped';   // building shape, derived from domain

interface ServiceEntry {
  id: string;               // 'payments'
  name: string;             // 'Payments'
  domain: string;           // district: 'Core Platform' | 'Commerce' | 'Messaging' | 'Data & Storage'
  kind: Kind;
  health: Health;
  ver: string;              // short, sidebar: 'v2.4.0'
  version: string;          // full, panel: 'v2.3.1 → v2.4.0'
  rps: number;              // traffic → building height
  p99: string; uptime: string; instances: number;
  endpoint: string; owner: string; region: string;
  desc: string;
  features: string[];       // "Capabilities"
  incident?: string;        // shows amber notice (degraded)
  rollout?: number;         // % — shows rollout bar (deploying)
  rolloutText?: string;
  x: number; y: number; w: number; d: number;  // footprint on 800×800 city plane (iso px)
  app?: React.ComponentType<{ service: ServiceEntry }>; // modal content
}
```
In production the registry should come from a service-discovery / gateway API (health + rps polled or streamed), with `kind`/`domain` → district mapping in config. Building placement should be computed by a layout function per district (slots), not hard-coded.

### Attribute → visual mapping
| Attribute | Visual |
|---|---|
| domain | District (quadrant plate) **and** building shape (`kind`) |
| rps (traffic) | Height. `H3D = 10 + rps/100` world units; iso height = `H3D × 7` px |
| health | Window/edge/beacon color: healthy `#5fe1ec`, degraded `#f2b45a` (beacon blinks ~0.8 Hz), deploying `#6aa2ff`, down `#ff6b6b` |
| deploying | Top segment rendered as wireframe scaffolding + tower crane with rotating jib and blinking red tip light |

Shapes (segments relative to footprint w×d and total height H):
- **tower** (Core Platform): base w×d, 0.68H; upper 0.64w×0.64d at 18% inset, 0.32H; antenna 6 units tall.
- **block** (Commerce): podium w×d, 0.22H; tower 0.6w×0.7d offset (12%,15%), 0.78H.
- **cylinder** (Messaging): cylinder ⌀0.8w, 0.9H; cap 0.4w, 0.1H; 3 torus rings that expand + fade (wave, 2.9 s loop).
- **stepped** (Data & Storage): w×d 0.45H; 0.76w 0.3H; 0.5w 0.25H (this last one is the construction segment when deploying).

---

## Screens / Views

### 1. Sidebar
- Width 288px open / 64px collapsed; `transition: width .28s ease`; bg `#0a0f19`; right border `1px rgba(130,190,255,0.10)`.
- **Header** (padding 18/14/14/16): logo = 28px square, radius 7, 1.5px `#5fe1ec` border, glow `0 0 14px rgba(95,225,236,.35)`, inner 9px rotated square. Title "Gridline" 15px/600; subtitle "SERVICE CITY" mono 10.5px, `.08em`, `#7f8da3`. Collapse button 30×30 "«".
- **Search**: bg `#0d1424`, border `1px rgba(130,190,255,.14)`, radius 9, placeholder "Search services". Filters by name + domain; hides Favorites/Recent while active; empty state "No services match “…”."
- **Sections** (gap 18): Favorites (starred, persisted), Recent (last 3 selected), then one group per domain with count. Section label mono 10.5px uppercase `.1em #7f8da3`, nowrap.
- **Row**: padding 8/10, radius 8; status dot 8px with `0 0 8px` glow in health color; name 14px (`#c9d6e4`, selected `#fff`); version mono 11px; star ★/☆ (on `#5fe1ec`, off `#56657a`, click toggles without selecting). Selected bg `rgba(95,225,236,.10)`.
- **Footer**: "{n} services registered" + healthy/degraded/deploying counts, mono 11px.
- **Collapsed rail**: "»" expand button (36px, cyan border); 40×40 tiles with 2-letter initials and a 9px status dot top-right.

### 2. City view — 3D (default)
- Canvas fills main area. Clear color / fog `#070b13` (fog 150→320).
- Ground 600² `#070c16`; GridHelper 120/30 (`#1b3a5a`/`#10213a`); two cyan road strips crossing at origin (opacity .45).
- 4 district plates 34×34 units (`#0b1526`, cyan edges opacity .3) with mono uppercase labels lying flat at the front-left corner.
- ~60 filler buildings (deterministic RNG), dim blue windows (emissive .35), faint edges — non-interactive.
- Service buildings: dark metallic body `#0b1322` + emissive window texture tinted by health (intensity .95), colored edge lines (opacity .5, 1.0 on hover/selected), additive glow sprite on roof.
- **Traffic arcs**: quadratic bezier lines between dependent services (`#6aa2ff` .28) with 2 glowing dots each travelling the arc (toggle `showTraffic`).
- **Selection**: pulsing cyan ring on ground + faint vertical light beam (opacity .06) above the building.
- **Pins**: HTML labels projected per frame above each service (pill, name + dot, 14px stem). Clicking selects.
- **Camera**: custom orbit (spherical: target, r, θ, φ). Drag = orbit, right-drag/shift-drag = pan, wheel = zoom (r 12–200), φ clamped .3–1.38. Overview: target 0, r 120, φ .95, slow auto-rotate (+0.0007 rad/frame, toggle `autoRotate`) when nothing is selected.
- **Fly-to**: 1200 ms easeInOutCubic tween to target `(x, 0.55H, z)`, `r = max(32, 2.2H)`, φ 1.1; uses `camera.setViewOffset` with a 14% horizontal shift so the building sits left of center, clear of the info panel. Click vs drag threshold: 5 px.

### 3. City view — Isometric (alternate, toggle in top bar)
- Pure CSS 3D (no perspective): stage `translate(offX) scale3d(S) rotateX(55deg) rotateZ(rot) translate3d(-cx,-cy,-cz)`, transition `transform 1.1s cubic-bezier(.65,0,.35,1)` (disabled while dragging).
- 800×800 plane with 40px cyan grid (α .06), 4 district plates, glowing roads.
- Every segment is a CSS box (4 side faces + top) with gradient window pattern; services get health-tinted windows and glowing top; deploying segment = dashed outline + scaffold grid.
- Billboarded labels counter-rotate `rotateZ(-rot) rotateX(-55deg) scale(1/S)`.
- Drag horizontally = rotate (0.35°/px); wheel = zoom 0.5–2.5. Selected: centers the building, S = clamp(300/h, 1.3, 2.4), offX −180px for the panel.

### 4. Top bar (absolute, top/left/right 16px)
Glass chips: bg `rgba(10,16,28,.78)`, border `rgba(130,190,255,.14)`, radius 10, `backdrop-filter: blur(12px)`.
- Breadcrumb (mono 12px): `City / {domain} / {name}`; "City" clickable → overview.
- "Overview" button (only when selected).
- Segmented toggle "3D | Isometric" (active bg `rgba(95,225,236,.16)`, text `#9ff3fa`).

### 5. Info panel (floating, on selection)
- Absolute top 76 / right 20, width 360, max-height `calc(100% - 96px)`, scroll; grid with 18px gap; bg `rgba(10,16,28,.88)`, border `rgba(130,190,255,.16)`, radius 14, blur 16, shadow `0 20px 60px rgba(0,0,0,.5)`, padding 20.
- Content order: domain label → name 26px/600 → health chip + version (mono) → description 14px/1.55 `#b4c2d4` → incident notice (amber, if any) → rollout bar (striped blue, if deploying) → 2×3 spec grid (Throughput, p99 latency, Uptime 30d, Instances, Owner, Region) → Endpoint (mono, `#9ff3fa`) → Capabilities list (5px cyan diamond bullets) → actions: **Use service** (primary, flex 1) + favorite toggle (46px).

### 6. Service modal
- Covers the entire main area: overlay `rgba(4,7,12,.55)` + blur 3, inner card inset 16px, bg `rgba(9,14,24,.97)`, radius 16, border + outer glow in the service's health color.
- Header 14/18/14/22: status dot, name 18px/600, version chip, endpoint mono, spacer, "Back to building", ×.
- Body scrolls, padding 22; columns use `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` so they stack on narrow widths.

Service apps (each is a separate component; replace mock data with API calls):
- **Identity** — user directory (search), user detail card (role, MFA, last sign-in, sessions, "Revoke sessions"), token issuer: scope chips (`read:profile`, `write:profile`, `orders:read`, `payments:write`, `admin`), TTL segmented (15m/1h/24h), "Issue token" → JWT-like string + Copy.
- **Orders** — status tabs with counts (All/Pending/Paid/Shipped/Delivered/Cancelled), table (Order, Customer, Items, Total, Status, Created; min-width 560, horizontal scroll), detail card with line items, status timeline, "Mark as {next}" and "Cancel" (Pending/Paid only).
- **Payments** — amber incident banner; charge form: amount (mono), currency USD/EUR/TWD, test cards (4242 succeeds, 0002 declined, 3155 requires 3-D Secure), description, "Create charge" (busy state "Processing…"); Response panel shows pretty JSON + `status · latency`; Recent charges list (latency >400 ms shown amber).
- **Notifications** — channel tabs Email/SMS/Push; audience select (All users 12,480 / Customers with open orders 316 / Admins 9); subject (Title for Push, hidden for SMS); message with counter (SMS /160, red when over); live preview per channel; "Send to {n}" → delivery log row "Sending…" → "Delivered xx.x%".
- **Media Storage** — blue dashed deploying banner; buckets list; file grid (striped placeholder thumbnails, name, size); "Upload file" with progress bar; detail panel with preview placeholder, metadata, "Generate signed URL".

Status chip pattern (used everywhere): inline-flex, padding 2/8, radius 999, mono 11px, text = color, bg = color α .12, border = color α .35.

---

## Interactions & Behavior
- Select (any source: building click, pin, sidebar, rail): set `selected`, close modal, push to Recent (max 3, persisted), fly camera.
- Esc: modal open → close modal; else selected → overview.
- Hover building (3D): cursor pointer + edges brighten.
- Mode switch keeps the selection; 3D snaps the camera to the selected building instantly.
- 3D loading state "LOADING CITY…" (mono, centered); WebGL failure → message suggesting Isometric.
- Persist in localStorage (`gridline.state`): `mode`, `favs`, `recent`.

## State Management
Global (store): `mode ('3d'|'iso')`, `sidebarOpen`, `query`, `favs[]`, `recent[]`, `selected (id|null)`, `modal (bool)`, iso `rot`/`zoom`, `services[]` (from registry API, with live health/rps).
Camera (non-React, per frame): `{tx,ty,tz,r,th,ph,shift}` + active tween.
Per service app: local state (forms, selections, logs) — should reset on service change.
Data needs: service list + health stream (WebSocket/SSE recommended so buildings change color/height live), each service's own API via the gateway, auth token from Identity for all calls.

## Design Tokens
Colors
- Background `#070b13`; sidebar `#0a0f19`; surface `#0b1220`; deep surface `#060a12` / `#070c16`; input bg `#0d1424`
- Glass panel `rgba(10,16,28,0.78–0.88)`; border `rgba(130,190,255,0.10 / 0.14 / 0.16 / 0.22)`
- Text `#e6edf5`; secondary `#c9d6e4` / `#cfdae6` / `#b4c2d4`; muted `#9aa8bc`; label `#7f8da3`; disabled `#56657a`
- Accent cyan `#5fe1ec` (hover `#8ff0f7`, light `#9ff3fa`, on-accent text `#04121a`); blue `#6aa2ff`; amber `#f2b45a` (text `#f6cf95`); red `#ff6b6b` (text `#ff9a9a`); green `#7fe0a6`
Typography
- Sans: **Instrument Sans** 400/500/600 — UI text. Mono: **JetBrains Mono** 400/500 — labels, versions, IDs, endpoints, numbers.
- Scale: 10–11px mono labels (uppercase, `.08–.1em`), 12–13.5px body/UI, 14px default, 15px card titles, 18px modal title, 20px detail heading, 26px panel title.
Radius: 6, 7, 8, 9, 10, 12, 14, 16, 999 (chips/pills). Spacing: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22.
Shadows/glow: panel `0 20px 60px rgba(0,0,0,.5)`; modal `0 30px 80px rgba(0,0,0,.6)` + `0 0 60px {health α .12}`; primary button `0 0 24px rgba(95,225,236,.35)`; status dot `0 0 8px {color}`.

## Assets
No external images. All textures (window grid, glow sprite, district labels) are generated at runtime with `<canvas>`. three.js 0.160 loaded from unpkg. Image placeholders in Media Storage are striped CSS gradients — replace with real thumbnails.

## Files
- `demo/Service City.dc.html` — full prototype: template (markup + inline styles) and logic class (`init3D()` = scene building, camera, picking, animation loop; `isoBoxes()` = isometric geometry; `renderVals()` = all view state and service-app logic).
- `demo/support.js` — prototype runtime only (not part of the design).
