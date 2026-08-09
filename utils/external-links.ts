import { formatCoord, type LatLng } from './coordinates';

export interface ExternalLink {
  id: string;
  label: string;
  /** Inline SVG data URI so no external request is ever made. */
  icon: string;
  buildUrl: (pos: LatLng) => string;
}

function svgIcon(path: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff">${path}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const ICONS = {
  // Simple pegman-like figure
  streetView: svgIcon(
    '<circle cx="12" cy="4.5" r="2.5"/><path d="M12 8c-1.7 0-3 1.3-3 3v3h1.5l.5 6h2l.5-6H15v-3c0-1.7-1.3-3-3-3z"/>',
  ),
  // Panorama
  pano: svgIcon(
    '<circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 1 8.5 6h-2.2A7 7 0 0 0 12 5V3zM3.5 9A9 9 0 0 1 12 3v2a7 7 0 0 0-6.3 4H3.5zM12 21a9 9 0 0 1-8.5-6h2.2A7 7 0 0 0 12 19v2zm8.5-6A9 9 0 0 1 12 21v-2a7 7 0 0 0 6.3-4h2.2z"/>',
  ),
  // Map pin
  mapPin: svgIcon(
    '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>',
  ),
  // Navigation arrow
  navArrow: svgIcon('<path d="M12 2 4.5 20.3l.7.7L12 18l6.8 3 .7-.7z"/>'),
} as const;

/**
 * The external actions injected into calimoto's map context menu.
 * Order here is the display order in the menu.
 */
export const EXTERNAL_LINKS: readonly ExternalLink[] = [
  {
    id: 'google-street-view',
    label: 'Google Street View',
    icon: ICONS.pano,
    // Official Google Maps URLs API: opens the closest panorama to the point.
    buildUrl: ({ lat, lng }) =>
      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${formatCoord(lat)},${formatCoord(lng)}`,
  },
  {
    id: 'google-maps',
    label: 'Google Maps',
    icon: ICONS.mapPin,
    buildUrl: ({ lat, lng }) =>
      `https://www.google.fr/maps/place/${formatCoord(lat)},${formatCoord(lng)}/@${formatCoord(lat)},${formatCoord(lng)},15z`,
  },
  {
    id: 'waze',
    label: 'Waze',
    icon: ICONS.navArrow,
    buildUrl: ({ lat, lng }) =>
      `https://www.waze.com/ul?ll=${formatCoord(lat)},${formatCoord(lng)}&zoom=15`,
  },
];
