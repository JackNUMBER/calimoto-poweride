import {
  COORDS_RESPONSE_EVENT,
  REQUEST_COORDS_EVENT,
} from '@/utils/bridge-events';
import { isLatLng, type LatLng } from '@/utils/coordinates';
import { EXTERNAL_LINKS } from '@/utils/external-links';
import { markerLinks } from '@/entrypoints/popup/settings';

/** Marker class on every element we inject, for idempotence checks. */
const INJECTED_CLASS = 'poweride-item';

/** How long to wait for the MAIN-world script to answer (it answers synchronously in practice). */
const COORDS_TIMEOUT_MS = 300;

/**
 * ISOLATED-world script: watches for calimoto's right-click map menu
 * (.MapPopupDefaultWrapper) and appends our external-link buttons,
 * reusing the site's own CSS classes so they look native.
 *
 * Matches the whole domain (not just the trip-planner URLs) because the
 * site is a Next.js SPA: a user who lands on the homepage and navigates
 * to the planner client-side never triggers a new document load, so
 * narrower match patterns would leave the extension inert. The script is
 * dormant on pages without a map popup.
 */
export default defineContentScript({
  matches: ['https://calimoto.com/*'],

  async main() {
    // Gate injection on the `markerLinks` setting, read once at startup.
    // Toggling it in the popup takes effect after the user reloads calimoto.
    if (!(await markerLinks.getValue())) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          const wrapper = node.matches('.MapPopupDefaultWrapper')
            ? node
            : node.querySelector('.MapPopupDefaultWrapper');
          if (wrapper) injectMenuItems(wrapper);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // In case a marker popup is already open when the script loads.
    const existing = document.querySelector('.MapPopupDefaultWrapper');
    if (existing) injectMenuItems(existing);
  },
});

function injectMenuItems(wrapper: Element): void {
  if (wrapper.querySelector(`.${INJECTED_CLASS}`)) return;

  const divider = document.createElement('div');
  divider.className = `MapPopupLine ${INJECTED_CLASS}`;
  wrapper.appendChild(divider);

  for (const link of EXTERNAL_LINKS) {
    const item = document.createElement('div');
    item.className = `MapPopupItem ${INJECTED_CLASS}`;
    item.dataset.powerideId = link.id;

    const icon = document.createElement('img');
    icon.alt = '';
    icon.className = 'MapPopupItemIcon';
    icon.src = link.icon;

    const label = document.createElement('div');
    label.className = 'LocalizedText';
    label.textContent = link.label;

    item.append(icon, label);
    item.addEventListener('click', () => {
      void openExternalLink(link.id);
    });
    wrapper.appendChild(item);
  }
}

async function openExternalLink(linkId: string): Promise<void> {
  const link = EXTERNAL_LINKS.find((l) => l.id === linkId);
  if (!link) return;

  const coords = await requestCoords();
  if (!coords) {
    console.warn(
      '[poweride] could not read clicked coordinates from the map popup',
    );
    return;
  }
  window.open(link.buildUrl(coords), '_blank', 'noopener,noreferrer');
}

/**
 * Asks the MAIN-world script for the coordinates of the currently open
 * popup. Coordinates are read at click time, never cached at injection
 * time, so they always match the popup the user actually sees.
 */
function requestCoords(): Promise<LatLng | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener(COORDS_RESPONSE_EVENT, onResponse);
      resolve(null);
    }, COORDS_TIMEOUT_MS);

    function onResponse(event: Event): void {
      clearTimeout(timeout);
      const detail = (event as CustomEvent<unknown>).detail;
      resolve(isLatLng(detail) ? detail : null);
    }

    window.addEventListener(COORDS_RESPONSE_EVENT, onResponse, { once: true });
    window.dispatchEvent(new CustomEvent(REQUEST_COORDS_EVENT));
  });
}
