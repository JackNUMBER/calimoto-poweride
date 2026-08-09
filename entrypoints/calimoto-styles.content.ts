import {
  biggerSearchbar,
  markerLinks,
  routeProfiles,
  smallerFont,
} from '@/entrypoints/popup/settings';

/** Identifies (and de-duplicates) the single <style> element we inject. */
const STYLE_ID = 'poweride-styles';

const CSS_BLOCKS = {
  // Global design fixes.
  base: `
    .MuiListItem-root {
      white-space: nowrap;
    }
    .SearchAndLocation .MuiAutocomplete-root input {
      padding-left: 20px !important;
    }
  `,

  // Route-profile selector injected into the sidebar's "More" panel.
  waypoints: `
    #routingSelector {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 8px 16px 0;
      margin-bottom: 12px;
    }
    #routingSelector .label {
      flex-grow: 1;
      margin-bottom: 5px;
    }
    #routingSelector .btn {
      background: none;
      border: none;
      cursor: pointer;
    }
    #routingSelector .btn .icon {
      min-width: 28px;
      min-height: 28px;
      filter: grayscale(1);
      transition: filter 0.15s;
    }
    #routingSelector .btn:hover .icon {
      filter: none;
    }
    #routingSelector[aria-busy='true'] .btn {
      opacity: 0.5;
      pointer-events: none;
    }
    html .SidebarRouteAddViaMoreList {
      height: 370px;
    }
    html .SidebarRouteAddViaMoreList__AdditionalInfo{
      top: 215px;
    }
  `,

  // Marker popup: lay out our injected external links.
  markerPopup: `
    .PopupMarker .MapPopupMarkerAddressAndDeleteButton {
      align-items: start;
    }
    .PopupMarker .calimoto-poweride {
      margin-top: 5px;
    }
    .PopupMarker .calimoto-poweride .external-link {
      display: inline-block;
    }
    .PopupMarker .calimoto-poweride .external-link.waze {
      margin-left: 4px;
    }
    .PopupMarker .calimoto-poweride .external-link .icon {
      width: 32px;
      height: 32px;
    }
  `,

  // Favorite popup: lay out our injected external links.
  favoritePopup: `
    .MapPopupFavoriteContentLeft .calimoto-poweride {
      margin-top: 5px;
    }
    .MapPopupFavoriteContentLeft .calimoto-poweride .external-link {
      display: inline-block;
    }
    .MapPopupFavoriteContentLeft .calimoto-poweride .external-link.waze {
      margin-left: 4px;
    }
    .MapPopupFavoriteContentLeft .calimoto-poweride .external-link .icon {
      width: 32px;
      height: 32px;
    }
  `,

  // Smaller global font-size (gated on `smallerFont`).
  fontSize: `
    html {
      font-size: 14px;
    }
    html .SidebarRoutePointWrapper .AddressSearchAutocomplete {
      height: 14px;
    }
  `,

  // Bigger place search bar (gated on `biggerSearchbar`).
  searchBar: `
    html .TourPlanner_MapActionAreaTop_Search {
      width: 450px;
      max-width: 450px;
    }
  `,
} as const;

/**
 * ISOLATED-world script: assembles the applicable CSS blocks and injects them
 * as a single <style> element in <head>, once at page load.
 *
 * Which blocks apply is decided from the persisted settings, read once at
 * startup (no `.watch()` reactivity — a toggle takes effect after the user
 * reloads calimoto, matching the rest of the extension).
 *
 * Matches the whole domain (not just the trip-planner URLs) because the site
 * is a Next.js SPA: a user who lands on the homepage and navigates to the
 * planner client-side never triggers a new document load.
 */
export default defineContentScript({
  matches: ['https://calimoto.com/*'],

  async main() {
    // `base` is always injected.
    let css = CSS_BLOCKS.base;

    if (await smallerFont.getValue()) css += CSS_BLOCKS.fontSize;
    if (await biggerSearchbar.getValue()) css += CSS_BLOCKS.searchBar;
    if (await routeProfiles.getValue()) css += CSS_BLOCKS.waypoints;

    // Marker/favorite popup styling only matters when the external links are
    // injected, so it shares the `markerLinks` setting.
    if (await markerLinks.getValue()) {
      css += CSS_BLOCKS.markerPopup + CSS_BLOCKS.favoritePopup;
    }

    inject(css);
  },
});

/**
 * Build the <style> element and append it to <head>. No-ops on empty content
 * (like the original) and stays idempotent: if our <style> already exists,
 * don't inject a second one.
 */
function inject(content: string): void {
  if (content.trim() === '') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = content;
  document.head.appendChild(style);
}
