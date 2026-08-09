# Calimoto Poweride — project guide

When working in this codebase, prioritize readability over cleverness, and ask clarifying
questions before making architectural changes. Project-specific directives:

- **Keep the minimal-permission, zero-dependency posture.** The extension ships with
  `permissions: ['storage']` (added for the settings popup, exactly as planned), one
  `web_accessible_resources` for icons ;
  justify any addition to either (see Conventions) before making it.
- **The coordinate extraction is fragile.** If the injected menu ever "stops working,"
  re-verify the site selectors and the React fiber walk against the live site _before_
  assuming the code is wrong — calimoto may have redeployed. See Gotchas and ARCHITECTURE.md.
- **Keep the docs current.** `docs/ARCHITECTURE.md` is the source of truth; update it when
  the architecture or the target-site facts change.

## About this project

Calimoto Poweride is a Chrome + Firefox extension that adds quality of life features to the Calimoto's trip planner.

calimoto.com is a **Next.js React SPA**, and its map is **Mapbox GL JS via react-map-gl**.
The clicked coordinates are not in the DOM; they are read from the popup's React fiber at click time. See Gotchas for the consequences.

**Features:**

- **externals links** (Google Street View, Google Maps, Waze) added to the right-click map context menu (see [entrypoints/calimoto-menu.content.ts](entrypoints/calimoto-menu.content.ts)).
- **UI tweaks** (smaller global font, bigger searchbar) via the custom-styles
  content script (see [entrypoints/calimoto-styles.content.ts](entrypoints/calimoto-styles.content.ts)).
- a **quick route-profile selector** in the route sidebar that applies one profile to every route point at once (see
  [entrypoints/calimoto-routes.content.ts](entrypoints/calimoto-routes.content.ts)).
- a **persisted settings popup**, backed by WXT `storage` — four active switches
  (`markerLinks`, `smallerFont`, `biggerSearchbar`, `routeProfiles`), each gating injected
  menu items and/or custom-style blocks; applied on page load. See [entrypoints/popup/settings.ts](entrypoints/popup/settings.ts).

### Authoritative docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — full architecture, the target-site facts
  discovered by live inspection, design decisions, fragility notes, and the E2E verification
  log. **This is the source of truth; read it before touching the extension.**
- [README.md](README.md) — user-facing overview and dev instructions.

## Target site & supported browsers

Runs on calimoto.com's trip planner — the same SPA under five language routes, which is why
content scripts match `https://calimoto.com/*` rather than only these URLs:

- https://calimoto.com/de/motorrad-routenplaner
- https://calimoto.com/en/motorcycle-trip-planner
- https://calimoto.com/es/planificador-de-rutas
- https://calimoto.com/fr/itineraires-moto
- https://calimoto.com/it/itinerari-motociclistici

Primary targets are **Google Chrome** and **Mozilla Firefox**. Avoid browser-specific APIs;
use compatible WebExtension standards.

## Stack

- **[WXT](https://wxt.dev)** (`^0.20.27`) — extension framework, emits **MV3 for Chrome** and
  **MV2 for Firefox** from one codebase. Do not reintroduce alternatives without reason.
- **TypeScript** (`^5.9.3`), strict.
- **Zero runtime dependencies**; the only extension permission is **`storage`**
  ([wxt.config.ts](wxt.config.ts)), used by the settings popup (see [entrypoints/popup/settings.ts](entrypoints/popup/settings.ts)).
  One `web_accessible_resources` entry exposes the route-profile icons to `calimoto.com` only.
- MAIN-world content scripts require **Chrome 111+ / Firefox 128+** (manifest `world` key).

## Key directories

```
entrypoints/
  calimoto-menu.content.ts    ISOLATED world: MutationObserver watches for the popup,
                              injects the menu items (reusing calimoto's CSS classes),
                              handles clicks, opens the external tab. Extension-API world.
  calimoto-coords.content.ts  MAIN world: on request, walks the React fiber and returns {lat, lng}.
  calimoto-styles.content.ts  ISOLATED world: injects one <style> of global custom tweaks at
                              load, blocks gated by settings (roadmap blocks commented out).
  calimoto-routes.content.ts  ISOLATED world: MutationObserver watches for the sidebar's
                              "More" panel, injects the route-profile row, and applies the
                              chosen profile to every route point by driving the site's UI.
  popup/                      toolbar popup: persisted settings switches
    index.html                the settings switches
    main.ts                   loads/saves each switch
    settings.ts               typed WXT storage items backing the settings
utils/
  coordinates.ts              LatLng type, formatting, validation
  external-links.ts           external link builders (Google Street View pano, Google Maps, Waze) + inline SVG icons
  route-profiles.ts           the four routing profiles: label, packaged icon, position in calimoto's own selector
  bridge-events.ts            CustomEvent names shared by both content scripts
public/
  routing-profiles/*.svg      profile icons (web-accessible to calimoto.com only)
```

## Conventions

Project-specific:

- Injected DOM elements carry the `poweride-item` class and a `data-poweride-id` attribute
  (idempotence checks + cleanup).
- Cross-world messages use `poweride:`-namespaced `window` CustomEvents
  (`poweride:request-coords` / `poweride:coords-response`, see
  [utils/bridge-events.ts](utils/bridge-events.ts)).
- Content scripts are named `*.content.ts`; the execution world is declared per entrypoint.
- Injected menu items **reuse calimoto's own CSS classes** (`MapPopupItem`, `MapPopupItemIcon`,
  `LocalizedText`, `MapPopupLine`) so the site's stylesheet styles them — they carry no custom
  CSS. Global site-level tweaks live separately in `calimoto-styles.content.ts`, which injects a
  single `<style>` of `poweride`-owned rules.
- Map-menu icons are **inline SVG data URIs**; the route-profile icons are packaged files
  under `public/routing-profiles/`, the only assets exposed to the page.
- The **route-profile selector drives calimoto's own UI** (expand a point's selector, click
  an option). It waits for each step with a real timeout and **aborts with a warning**
  instead of clicking on when the DOM isn't in the expected state.

General:

- Prefer TypeScript with strict typing. Keep modules small; avoid duplicated logic.
- Avoid unnecessary dependencies. Before adding one, explain **why it's needed**, the
  **alternatives**, and the **maintenance impact**.
- Explain important choices; think about future features.

## Commands

```bash
npm run dev            # Chrome, hot-reloading dev mode
npm run dev:firefox    # Firefox
npm run build          # production build -> .output/chrome-mv3
npm run build:firefox  # -> .output/firefox-mv2
npm run zip            # package for store submission (zip:firefox for Firefox)
npm run compile        # type-check only (tsc --noEmit)
```

**Tests:** there is no unit-test suite yet. Verification is E2E and manual via the Playwright
MCP server configured in [.mcp.json](.mcp.json), which launches Chromium with the built
extension loaded (isolated profile in `mcp/chrome-profile`). Rebuild (`npm run build`) and
restart the MCP browser to pick up changes, then drive the real site, right-click the map,
and verify the injected menu.

## Gotchas / non-obvious

- **Coordinates are read at click time, never cached at injection time.** A cached coord
  would silently point at the previous location — the worst possible bug for a navigation tool.
- **The popup DOM node is recreated on every right-click**, so the `MutationObserver` on
  added nodes catches every menu; injection stays idempotent via the `poweride-item` check.
- **Two content-script worlds.** Isolated-world scripts can't see React's `__reactFiber$*`
  expandos, so coordinate reading lives in a MAIN-world script and the result crosses back
  over the CustomEvent bridge. `dispatchEvent` is synchronous, so the response resolves
  immediately; a **300 ms timeout** guards the pathological case.
- **The fiber walk is the most fragile part.** It depends on React internals (`__reactFiber$`
  naming, fiber `return` links, `memoizedProps`) — stable across React 16–19 but not
  guaranteed. On failure it logs `[poweride] could not read clicked coordinates …` and
  no-ops. Fallback strategies are in ARCHITECTURE.md; re-verify against the live site before
  assuming a code bug.
- **`window.open(url, '_blank', 'noopener,noreferrer')` runs in the click handler**, so it
  counts as a user gesture: no popup blocking and no `tabs` permission needed.
- Site class names (`MapPopup*`, `SidebarRoute*`) are semantic, not CSS-module hashes, so they
  should survive redeploys; the observer + selectors are the first thing to re-verify if the
  extension goes quiet.
- **The route-profile selector depends on site _behaviour_, not just selectors**: the profile
  popover is an inline expander (no portal, no backdrop), expanding one point collapses the
  previous one, picking an option leaves it open, and only an outside `mousedown` closes it.
  Those facts are documented in ARCHITECTURE.md — re-verify them, not just the class names.
- Profile options are told apart **by position only** (`siteIndex` in `utils/route-profiles.ts`);
  they carry no id or class, and their `title` is localized.

## Security

- Watch content-script security, user-data privacy, and permission minimization.
- Request the minimal permissions, actually required (currently `storage`, for settings and `web_accessible_resources` scoped to `https://calimoto.com/*` and to the files that need it.
