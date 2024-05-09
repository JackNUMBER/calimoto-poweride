'use strict';

const markerSelector = '.MapActiveTourMarker';
const waypointsSelector = '.SidebarRoutePoints .SidebarRoutePointWrapper';

const WaypointsHover = {
  markers: [],
  waypoints: [],

  waitForElementReady: (selector, timeoutInSeconds = 3) => {
    return new Promise((resolve, reject) => {
      let waited = 0;

      const wait = (interval) => {
        setTimeout(() => {
          waited += interval;

          if (!!document.querySelector(selector)) {
            return resolve();
          }

          /* damned infinite loop
          if (waited >= timeoutInSeconds * 1000) {
            return reject();
          }
          */

          wait(interval);
        }, interval);
      };

      wait(100);
    });
  },

  getAllMarkers: () => {
    return document.querySelectorAll(markerSelector);
  },

  getAllWaypoints: () => {
    return document.querySelectorAll(waypointsSelector);
  },

  addEventListeners: () => {
    console.log(
      'addEventListeners',
      WaypointsHover.waypoints,
      WaypointsHover.markers,
    );

    if (
      WaypointsHover.waypoints.length === 0 ||
      WaypointsHover.markers.length === 0
    ) {
      return;
    }

    // waypoints events
    WaypointsHover.waypoints.forEach((node, index) => {
      node.addEventListener('mouseover', function () {
        console.log(WaypointsHover.markers[index]);
        WaypointsHover.markers[index].style.filter = 'invert()';
        // 'drop-shadow(0 0 5px black)';
      });

      node.addEventListener('mouseout', function () {
        WaypointsHover.markers[index].style.filter = '';
      });
    });

    // markers events
    WaypointsHover.markers.forEach((node, index) => {
      node.addEventListener('mouseover', function () {
        console.log(WaypointsHover.waypoints[index]);
        WaypointsHover.waypoints[index].style.backgroundColor =
          'rgba(255,255,255,0.1)';
      });

      node.addEventListener('mouseout', function () {
        WaypointsHover.waypoints[index].style.backgroundColor = 'none';
      });
    });
  },

  consoleMessageAction: (message) => {
    // check if it's a message about new marker
    if (!!message.detail[0].number && !!message.detail[0].coords) {
      WaypointsHover.markers = WaypointsHover.getAllMarkers();
      WaypointsHover.waypoints = WaypointsHover.getAllWaypoints();
      WaypointsHover.addEventListeners();
      // TODO: remove eventListeners
    }
  },

  set: () => {
    ConsoleInterceptor.listen(WaypointsHover.consoleMessageAction);
  },
};
