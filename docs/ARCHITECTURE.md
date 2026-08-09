# Architecture & Project Memory

Last verified against the live site: 2026-07-31 (route sidebar & profile selector).

References to **v1.x** below mean the previously shipped extension this 2.0 rewrite
replaces. Its sources are no longer in the tree — see the git history if you need them `old`.

## Target site facts (discovered via live inspection, not assumptions)

- calimoto.com is a **Next.js React SPA**. The five language-specific trip-planner URLs
  (`/en/motorcycle-trip-planner`, `/fr/itineraires-moto`, …) are client-side routes of
  the same app. A user can reach the planner without a document load, which is why our
  content scripts match `https://calimoto.com/*` instead of only the planner URLs.
- The map is **Mapbox GL JS rendered through react-map-gl** — _not Leaflet_, contrary
  to the original project brief. There is no `window.L`; the map container is
  `.MapWrapper > .mapboxgl-map`.
- Right-clicking the map opens a native context menu built as a react-map-gl `<Popup>`:

  ```
  .MapPopup.mapboxgl-popup            <- positioned wrapper (transform: translate(...))
    .mapboxgl-popup-content
      div
        .MapPopupContent
          .MapPopupDefaultWrapper     <- the menu itself
            .MapPopupItem             <- menu entry (img.MapPopupItemIcon + div.LocalizedText)
            .MapPopupLine             <- divider
  ```

- The popup DOM node is **recreated on every right-click** (verified by tagging the
  node and re-clicking), so a `MutationObserver` on added nodes catches every menu.
- The clicked coordinates are **not in the DOM**. They live in the React props of the
  popup component: walking up the fiber tree from `.MapPopupContent` (via the
  `__reactFiber$*` expando) reaches a component with numeric `latitude` / `longitude`
  props within ~3 levels. Verified twice at different map positions.

### The route sidebar (verified 2026-07-31)

- The sidebar's **"More" panel** is `.SidebarRouteMore`; its `ul.MuiList-root` is mounted
  only while open. One route point per unclassed `div` in `.SidebarRoutePoints`:

  ```
  .SidebarRoutePoints
    div                                          <- one route point
      .RoutingProfileSelection                   <- only while expanded
      .SidebarRoutePointWrapper
        img.SidebarRoutePointCurrentRoutingProfile   <- only while collapsed
  ```

  The current-profile icon is _inside_ the wrapper, the expanded selector a **sibling** of
  it, so the shared parent is the unit to iterate.

- A profile belongs to the **leg arriving into a point**, so the start point has none
  (`.SidebarRoutePointEmptyRoutingProfile` instead).
- `.RoutingProfileSelection` is an **inline expander, not a modal** — no portal, no
  backdrop. Expanding one point collapses the previously expanded one and clicks elsewhere
  aren't swallowed; picking an option commits the change but **leaves it expanded**; only a
  `mousedown` outside collapses it (a `click` doesn't). It expands in ~60–80 ms.
- Its options, `img.SidebarRoutePointRoutingProfileSelectionIcon`, are in site order
  (fastest, fastest-without-motorways, winding, extreme-winding) and carry only a localized
  `title` — **position is the only handle**, hence `siteIndex` in `utils/route-profiles.ts`.

## Extension design

Four content scripts + shared utils, no background logic. The only permission is
`storage`, which backs the settings popup.

```
entrypoints/
  calimoto-menu.content.ts    ISOLATED world (default)
  calimoto-coords.content.ts  MAIN world
  calimoto-styles.content.ts  ISOLATED world (default) — global custom styles
  calimoto-routes.content.ts  ISOLATED world (default) — route-profile selector
  popup/                      toolbar popup — persisted settings switches
    index.html                the switches (planned ones commented out)
    main.ts                   loads/saves each switch via ./settings.ts
    settings.ts               typed WXT storage items (the persisted settings)
    style.css                 switch styling (ported from v1.x options.css)
utils/
  coordinates.ts              LatLng type, formatting, validation
  external-links.ts           the external link builders + inline SVG icons
  route-profiles.ts           the four routing profiles + their packaged icons
  bridge-events.ts            CustomEvent names shared by both scripts
public/
  routing-profiles/*.svg      profile icons, declared web-accessible for calimoto.com
```

### Settings & storage

`entrypoints/popup/settings.ts` defines each persisted setting with WXT's typed `storage`
wrapper (`storage.defineItem<boolean>('local:…')`), the WXT-native replacement
for v1.x's raw `chrome.storage.local` calls. The popup mirrors each switch into
its item on `change`; the menu content script reads the value once at startup, so
toggling a setting takes effect after the user reloads calimoto.

Four settings are wired up today, each gating a feature and/or one or more custom-style
blocks (see below). New planned settings are added commented-out across `settings.ts`,
`popup/index.html`, and `popup/main.ts` in aligned pairs, so schema, UI, and the
feature code that consumes them ship together.

- **markerLinks** (default on) — gates whether the external-navigation items are
  injected into the map popup, plus their `markerPopup`/`favoritePopup` styling.
- **smallerFont** (default on) — reduces calimoto's global font size (`fontSize` block).
- **biggerSearchbar** (default on) — widens the place search bar (`searchBar` block).
- **routeProfiles** (default on) — gates the route-profile selector row and its
  `waypoints` styling.

### Why two worlds

Content scripts run in an isolated world and **cannot see expando properties** that
page scripts attach to DOM nodes — including React's `__reactFiber$*` refs. So:

- `calimoto-menu.content.ts` (isolated): owns the `MutationObserver`, injects the menu
  items (DOM is shared across worlds), handles clicks, opens the external tab. This is
  the world with extension-API access, where future settings/storage code belongs.
- `calimoto-coords.content.ts` (MAIN): does exactly one thing — on request, walk the
  fiber from `.mapboxgl-popup .MapPopupContent` and return `{lat, lng}`.

They talk over `window` CustomEvents (`poweride:request-coords` /
`poweride:coords-response`). `dispatchEvent` is synchronous, so the response resolves
immediately; a 300 ms timeout guards the pathological case.

### Custom styles

`calimoto-styles.content.ts` (ISOLATED world) injects a single `<style id="poweride-styles">`
into `<head>` once at page load. It assembles a set of named CSS blocks — ported verbatim
from v1.x's `custom_css.js` — and picks which apply from the persisted settings, read once
at startup (no `.watch()`; a toggle takes effect after the user reloads calimoto).

- `base` is always injected (global design fixes).
- `markerPopup` + `favoritePopup` are injected when `markerLinks` is on — they position the
  external-link buttons the menu script adds.
- `fontSize` is injected when `smallerFont` is on; `searchBar` when `biggerSearchbar` is on.
- `waypoints` is injected when `routeProfiles` is on — it lays out the row that script
  injects, including the dimmed `[aria-busy='true']` state during a run.

Injection is idempotent (it no-ops if `#poweride-styles` already exists) and no-ops on empty
content. This is a distinct layer from the menu items: the menu **items** still reuse
calimoto's own classes so the site styles them, while this content script is a separate
global custom-styles layer for site-level tweaks the site's stylesheet can't provide.

### Route-profile selector

`calimoto-routes.content.ts` (ISOLATED world) reintegrates v1.x's `waypoints_list.js`:
a row of four buttons prepended to the sidebar's "More" panel that applies one routing
profile to **every** point of the route, which the site only lets you do one point at a
time. A `MutationObserver` catches each mount of the panel; injection stays idempotent via
the `poweride-item` check.

There is no API for this — the row **drives the site's own UI**. Per point: expand the
profile selector, click the option at `siteIndex`, move on. Each expansion is awaited with a
`MutationObserver` and a 2 s timeout (v1.x instead offset points by `index * 150 ms` and
polled unbounded), and points are resolved freshly per step, since their icon nodes are
swapped out on expand. A timeout **aborts the run**, logging
`[poweride] stopped applying the routing profile: …` — points already visited keep their new
profile, the rest are untouched. An `applying` flag prevents overlapping runs; the row is
dimmed (`aria-busy`) during one.

Icons ship as files in `public/routing-profiles/` (v1.x's artwork), resolved with
`browser.runtime.getURL`, declared `web_accessible_resources` for `https://calimoto.com/*`.

Known limitation, inherited from v1.x: only the points rendered in the sidebar are visited —
all of them today (the list isn't virtualised), but worth re-checking on a very long route.

### Design decisions worth remembering

- **Coordinates are read at click time, never cached at injection time.** If the popup
  node were ever reused with new props, cached coords would silently point at the old
  location — the nastiest possible bug for a navigation tool.
- **Injected items reuse the site's classes** (`MapPopupItem`, `MapPopupItemIcon`,
  `LocalizedText`, `MapPopupLine`) so calimoto's stylesheet does all the styling work.
  Everything we add also carries `poweride-item` for idempotence checks and cleanup.
- **Map-menu icons are inline SVG data URIs** — no network request, no exposed asset. The
  route-profile icons are packaged files instead: detailed artwork, too bulky to inline.
- **MAIN-world scripts need Chrome 111+ / Firefox 128+** (manifest `world` key). Fine
  for our audience; WXT emits MV3 for Chrome and MV2 for Firefox.
- `window.open(url, '_blank', 'noopener,noreferrer')` from the click handler is a
  user gesture, so no popup blocking and no `tabs` permission needed.

### Fragility & mitigations

The coordinate extraction depends on React internals (`__reactFiber$` naming, fiber
`return` links, `memoizedProps`). Stable across React 16–19 but not guaranteed. If it
breaks: the click handler logs `[poweride] could not read clicked coordinates` and does
nothing. Fallback ideas, in order of preference:

1. Hook `contextmenu` on the map canvas in MAIN world and unproject the pixel via the
   Mapbox map instance (also fiber-derived, but from a different angle).
2. Parse the popup wrapper's `transform` and reverse-engineer lat/lng from the map's
   current viewport (last resort, needs map center/zoom/bearing).

Site class names (`MapPopup*`, `SidebarRoute*`) are semantic, not CSS-modules hashes, so
they should survive redeploys; the observer + selectors are the first thing to re-verify if
the extension goes quiet after a site update.

The route-profile selector is the second-most fragile piece, and for a different reason: it
depends on the sidebar **behaviours** listed above, not just on selectors. Those are grouped
in one `SITE` object at the top of the file, to re-check a redeploy in one place.

## End-to-end verification log (via Playwright MCP)

### Map context menu (2026-07-22)

- Injection appears on right-click; menu renders natively (screenshot-verified).
- All links open with correct coordinates; Google URLs verified through the EU
  consent redirect's `continue` param; Waze verified to place the destination pin.
- Re-injection works across repeated right-clicks (popup recreation).
- SPA path verified: homepage → client-side nav to planner → right-click → 4 items.

### Route-profile selector (2026-07-31)

- Checked on a live 4-point route by running the script's algorithm in the page: all `SITE`
  selectors resolve, applying a profile hit the 3 legs and skipped the start point three runs
  in a row (read back from the collapsed icons' `title`), the selector collapsed each time,
  and the row lays out correctly with the `waypoints` CSS block.
- **Still owed: the same pass with the packaged build.** The MCP browser's config pointed at
  a stale folder (`Calimoto Poweride Vibed`) and silently failed to load the extension —
  path fixed in `mcp/playwright.config.json`.
