'use strict';

const WaypointsList = {
  waitForElementReady : (selector, timeoutInSeconds = 3) => {
    return new Promise((resolve, reject) => {
      let waited = 0;

      const wait = (interval) => {
        setTimeout(() => {
          waited += interval;

          if (!!document.querySelector(selector)) {
            return resolve();
          }

          if (waited >= timeoutInSeconds * 1000) {
            return reject();
          }

          wait(interval);
        }, interval)
      };

      wait(100);
    })
  },

  getRoutingSelectorHtml: () => {
    return `
      <div id="routingSelector" class="SidebarRoutePoint">
        <span class="label">Set route: </span>
        <button class="btn" data-routing-type="fastest">
          <img class="icon" src="${chrome.extension.getURL("src/images/routing_types/fastest.svg")}" />
        </button>

        <button class="btn" data-routing-type="fastest-no-motorways">
          <img class="icon" src="${chrome.extension.getURL("src/images/routing_types/fastest_without_motorways.svg")}" />
        </button>

        <button class="btn" data-routing-type="winding">
          <img class="icon" src="${chrome.extension.getURL("src/images/routing_types/winding.svg")}" />
        </button>

        <button class="btn" data-routing-type="extrem">
          <img class="icon" src="${chrome.extension.getURL("src/images/routing_types/extreme_winding.svg")}" />
        </button>
      </div>
    `
  },

  applyRouting: (event) => {
    const routingType = event.currentTarget.getAttribute('data-routing-type');
    const buttonPositionByRoutingType = {
      'fastest': 1,
      'fastest-no-motorways': 2,
      'winding': 3,
      'extrem': 4
    };

    document.querySelectorAll('.SidebarRoutePointCurrentRoutingProfile').forEach((button, index, items) => {
      setTimeout(() => {
        button.click();
        const promise = WaypointsList.waitForElementReady(`.RoutingProfileSelection:not(#index-${index})`).then(() => {
          const RoutingProfileSelection = document.querySelector('.RoutingProfileSelection');
          RoutingProfileSelection.id = `index-${index}`;
          RoutingProfileSelection.querySelector(
            `.SidebarRoutePointRoutingProfileSelectionIcon:nth-child(${buttonPositionByRoutingType[routingType]})`
          ).click();
        });
      }, index * 150);
    });
  },

  addButtons: () => {
    document.querySelector('.SidebarRouteAddViaInput').insertAdjacentHTML('beforeend', WaypointsList.getRoutingSelectorHtml());
    document.querySelector('#routingSelector .label').addEventListener('click', WaypointsList.applyRoutin);
    document.querySelectorAll('#routingSelector .btn').forEach((button) => {
      button.addEventListener('click', WaypointsList.applyRouting)
    });
  },

  set: () => {
    // eventlistener on "Plus" panel then wait for panel to display the routingSelector inside the panel
    // this should fix the issue when the user display is track and come back to waypoints list

    WaypointsList.waitForElementReady('.SidebarRouteMore .MuiList-root').then(() => WaypointsList.addButtons());
  }
}
