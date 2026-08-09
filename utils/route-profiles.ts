import { browser } from '#imports';

export interface RouteProfile {
  id: string;
  label: string;
  icon: string;
  /**
   * Position of profile in Calimoto's profile popover.
   * The site's option icons carry no distinguishing class, id or text, so their
   * order is the only handle we have to target the right profile.
   */
  siteIndex: number;
}

export const ROUTE_PROFILES: readonly RouteProfile[] = [
  {
    id: 'fastest',
    label: 'Fastest',
    icon: browser.runtime.getURL('/routing-profiles/fastest.svg'),
    siteIndex: 0,
  },
  {
    id: 'fastest-without-motorways',
    label: 'Fastest without motorways',
    icon: browser.runtime.getURL(
      '/routing-profiles/fastest-without-motorways.svg',
    ),
    siteIndex: 1,
  },
  {
    id: 'winding',
    label: 'Winding',
    icon: browser.runtime.getURL('/routing-profiles/winding.svg'),
    siteIndex: 2,
  },
  {
    id: 'extreme-winding',
    label: 'Extreme winding',
    icon: browser.runtime.getURL('/routing-profiles/extreme-winding.svg'),
    siteIndex: 3,
  },
];
