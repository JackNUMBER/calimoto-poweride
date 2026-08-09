import { routeProfiles } from '@/entrypoints/popup/settings';
import { ROUTE_PROFILES, type RouteProfile } from '@/utils/route-profiles';

/** Marker class on every element we inject, for idempotence checks. */
const INJECTED_CLASS = 'poweride-item';

/** Id of the injected row — the `waypoints` CSS block styles it. */
const SELECTOR_ID = 'routingSelector';

/** calimoto's own selectors this feature drives. Re-verify these first if it goes quiet. */
const SITE = {
  /** The "More" panel below the waypoint list, where we inject our row. */
  morePanel: '.SidebarRouteMore .MuiList-root',
  /** One row per route point; the profile controls live in its parent element. */
  routePoint: '.SidebarRoutePoints .SidebarRoutePointWrapper',
  /** A point's current-profile icon. Clicking it expands the selector below. */
  currentProfile: '.SidebarRoutePointCurrentRoutingProfile',
  /** The expanded profile selector of one point. */
  profileSelection: '.RoutingProfileSelection',
  /** One choosable profile inside it, in site order (see `siteIndex`). */
  profileOption: '.SidebarRoutePointRoutingProfileSelectionIcon',
} as const;

/** How long to wait for a point's profile selector to expand. */
const EXPAND_TIMEOUT_MS = 2000;

/** Pause after each choice, to let the site commit it before the next point. */
const SETTLE_MS = 150;

/** Guards against a second run starting while one is still walking the list. */
let applying = false;

/**
 * ISOLATED-world script: adds a row of four buttons to the route sidebar's
 * "More" panel that applies one routing profile to *every* point of the route
 * at once — calimoto only lets you set the profile one point at a time.
 *
 * There is no API for this: the row drives the site's own UI, expanding each
 * point's profile selector and clicking the requested option. That makes it the
 * second-most fragile part of the extension after the fiber walk, so the
 * selectors it depends on are listed in `SITE` above (all verified live — see
 * docs/ARCHITECTURE.md).
 *
 * Matches the whole domain (not just the trip-planner URLs) because the site is
 * a Next.js SPA: a user who lands on the homepage and navigates to the planner
 * client-side never triggers a new document load. The script is dormant on
 * pages without a route sidebar.
 */
export default defineContentScript({
  matches: ['https://calimoto.com/*'],

  async main() {
    // Gate injection on the `routeProfiles` setting, read once at startup.
    // Toggling it in the popup takes effect after the user reloads calimoto.
    if (!(await routeProfiles.getValue())) return;

    // The panel is mounted and unmounted as the user opens and closes it, so
    // every mount has to be caught — not just the first one.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          const panel = node.matches(SITE.morePanel)
            ? node
            : node.querySelector(SITE.morePanel);
          if (panel) injectSelector(panel);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // In case the panel is already open when the script loads.
    const existing = document.querySelector(SITE.morePanel);
    if (existing) injectSelector(existing);
  },
});

/** Prepend our profile row to the "More" panel, once per panel instance. */
function injectSelector(panel: Element): void {
  if (panel.querySelector(`.${INJECTED_CLASS}`)) return;

  // The panel is a <ul>, so the row is an <li> to keep the markup valid; the
  // `waypoints` CSS block lays it out by id, whatever the tag.
  const row = document.createElement('li');
  row.id = SELECTOR_ID;
  row.className = INJECTED_CLASS;

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = 'Set route:';
  row.appendChild(label);

  for (const profile of ROUTE_PROFILES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn';
    button.dataset.powerideId = profile.id;
    button.title = profile.label;
    button.setAttribute('aria-label', profile.label);

    const icon = document.createElement('img');
    icon.className = 'icon';
    icon.alt = '';
    icon.src = profile.icon;

    button.appendChild(icon);
    button.addEventListener('click', () => {
      void applyToAllPoints(profile);
    });
    row.appendChild(button);
  }

  panel.prepend(row);
}

/**
 * Walk the route points and set `profile` on each one in turn.
 *
 * The site's selector is an inline expander, not a modal: expanding one point's
 * selector collapses the previously expanded one, and picking an option leaves
 * it expanded. So each step waits for the selector to actually appear (instead
 * of the fixed 150 ms v1.x waited, which desynchronised on a slow render), then
 * pauses briefly to let the site commit the choice.
 *
 * A step that times out aborts the run: points already visited keep their new
 * profile, the rest are left untouched. Half-applying beats clicking blindly
 * into a UI that isn't in the state we expect.
 */
async function applyToAllPoints(profile: RouteProfile): Promise<void> {
  if (applying) return;
  applying = true;
  setBusy(true);

  try {
    let applied = 0;

    for (const [index, point] of routePoints().entries()) {
      // A point's selector may already be expanded — the user could have left
      // it open, and the run itself leaves the last one open.
      let selection = point.querySelector<HTMLElement>(SITE.profileSelection);

      if (!selection) {
        const current = point.querySelector<HTMLElement>(SITE.currentProfile);
        // No profile icon at all: the start point has no leg arriving into it.
        if (!current) continue;

        current.click();
        selection = await waitFor(() =>
          point.querySelector<HTMLElement>(SITE.profileSelection),
        );
        if (!selection) {
          warn(`point ${index + 1}'s profile selector did not open`);
          return;
        }
      }

      const option = selection.querySelectorAll<HTMLElement>(
        SITE.profileOption,
      )[profile.siteIndex];
      if (!option) {
        warn(`profile "${profile.id}" is missing from the selector`);
        return;
      }

      option.click();
      applied += 1;
      await sleep(SETTLE_MS);
    }

    if (applied > 0) collapseSelection();
  } finally {
    setBusy(false);
    applying = false;
  }
}

/**
 * The route points, as the elements that hold their profile controls: the
 * current-profile icon sits inside `.SidebarRoutePointWrapper`, but the
 * expanded selector is a *sibling* of it, so the shared parent is the unit to
 * iterate.
 */
function routePoints(): Element[] {
  const parents = [...document.querySelectorAll(SITE.routePoint)]
    .map((wrapper) => wrapper.parentElement)
    .filter((parent): parent is HTMLElement => parent !== null);

  return [...new Set(parents)];
}

/**
 * Collapse the selector left expanded on the last point. calimoto gives it no
 * close button — it collapses on a `mousedown` landing outside it, which
 * nothing in this run produces.
 */
function collapseSelection(): void {
  document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}

/**
 * Resolve as soon as `probe` returns something, or with `null` on timeout.
 * Driven by a `MutationObserver` rather than v1.x's 100 ms polling loop, so
 * each step costs exactly as long as the site takes (~80 ms in practice).
 */
function waitFor<T>(
  probe: () => T | null,
  timeoutMs = EXPAND_TIMEOUT_MS,
): Promise<T | null> {
  const immediate = probe();
  if (immediate !== null) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    const finish = (result: T | null): void => {
      observer.disconnect();
      clearTimeout(timeout);
      resolve(result);
    };

    const observer = new MutationObserver(() => {
      const result = probe();
      if (result !== null) finish(result);
    });
    const timeout = setTimeout(() => finish(null), timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Dim the row while a run is in progress (see the `waypoints` CSS block). */
function setBusy(busy: boolean): void {
  for (const row of document.querySelectorAll(`#${SELECTOR_ID}`)) {
    row.setAttribute('aria-busy', String(busy));
  }
}

function warn(reason: string): void {
  console.warn(`[poweride] stopped applying the routing profile: ${reason}`);
}
