/**
 * Event names for the CustomEvent bridge between the ISOLATED-world
 * content script (menu injection) and the MAIN-world content script
 * (coordinate extraction from React internals).
 *
 * Content scripts run in an isolated world and cannot see JS properties
 * that page scripts attach to DOM nodes (like React's fiber refs), so
 * coordinate extraction must happen in the page's own world.
 */
export const REQUEST_COORDS_EVENT = 'poweride:request-coords';
export const COORDS_RESPONSE_EVENT = 'poweride:coords-response';
