export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Formats a coordinate for use in URLs: trims float noise
 * (48.816200000000435 -> "48.8162") while keeping ~11cm precision.
 */
export function formatCoord(value: number): string {
  return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

export function isLatLng(value: unknown): value is LatLng {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LatLng).lat === 'number' &&
    typeof (value as LatLng).lng === 'number' &&
    Number.isFinite((value as LatLng).lat) &&
    Number.isFinite((value as LatLng).lng)
  );
}
