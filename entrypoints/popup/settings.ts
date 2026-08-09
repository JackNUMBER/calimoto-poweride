import { storage } from '#imports';

export const markerLinks = storage.defineItem<boolean>('local:markerLinks', {
  fallback: true,
});

export const smallerFont = storage.defineItem<boolean>('local:smallerFont', {
  fallback: true,
});

export const biggerSearchbar = storage.defineItem<boolean>(
  'local:biggerSearchbar',
  { fallback: true },
);

export const routeProfiles = storage.defineItem<boolean>(
  'local:routeProfiles',
  { fallback: true },
);
