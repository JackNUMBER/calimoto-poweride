import { COORDS_RESPONSE_EVENT, REQUEST_COORDS_EVENT } from '@/utils/bridge-events';
import type { LatLng } from '@/utils/coordinates';

/**
 * MAIN-world script: runs in the page's own JS context so it can read
 * React fiber internals, which are invisible to isolated content scripts.
 *
 * calimoto renders its right-click menu as a react-map-gl <Popup> whose
 * props carry the clicked latitude/longitude. We walk up the fiber tree
 * from the popup DOM node until we find those props.
 *
 * Coordinates are read at request time (i.e. when the user clicks one of
 * our injected buttons), never cached, so a reused popup node with
 * updated props can never yield stale coordinates.
 */
export default defineContentScript({
  matches: ['https://calimoto.com/*'],
  world: 'MAIN',

  main() {
    window.addEventListener(REQUEST_COORDS_EVENT, () => {
      const coords = extractPopupCoords();
      window.dispatchEvent(
        new CustomEvent<LatLng | null>(COORDS_RESPONSE_EVENT, { detail: coords }),
      );
    });
  },
});

function extractPopupCoords(): LatLng | null {
  const popup = document.querySelector('.mapboxgl-popup .MapPopupContent');
  if (!popup) return null;

  const fiberKey = Object.keys(popup).find((k) => k.startsWith('__reactFiber$'));
  if (!fiberKey) return null;

  type Fiber = {
    memoizedProps?: { latitude?: unknown; longitude?: unknown };
    return?: Fiber;
  };

  let fiber = (popup as unknown as Record<string, Fiber | undefined>)[fiberKey];
  for (let depth = 0; depth < 10 && fiber; depth++, fiber = fiber.return) {
    const props = fiber.memoizedProps;
    if (
      props &&
      typeof props.latitude === 'number' &&
      typeof props.longitude === 'number' &&
      Number.isFinite(props.latitude) &&
      Number.isFinite(props.longitude)
    ) {
      return { lat: props.latitude, lng: props.longitude };
    }
  }
  return null;
}
