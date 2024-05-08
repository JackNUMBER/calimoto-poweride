'use strict';

const popupPowerideContainerClass = 'calimoto-poweride';
const popupPowerideSelector = `.${popupPowerideContainerClass}`;
const popupWaypointSelector = '.PopupMarker .MarkerAndPoiNameLink';
const popupFavoriteSelector = '.MapPopup .MapPopupFavoriteContentLeft';

/**
 * Intercept console
 */
const ConsoleInterceptor = {
  inject: () => {
    // TODO: replace this file by a <script> injection
    const script = document.createElement('script');
    script.src = chrome.extension.getURL('src/console_listener.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = function () {
      script.remove();
    };
  },

  listen: () => {
    document.addEventListener('calimotoPoweride_bip_bip', (message) => {
      if (message.detail[0] === undefined) return;

      // check if it's a message about marker
      if (
        !!message.detail[0].properties &&
        ['marker', 'favorite'].includes(message.detail[0].properties.popupType)
      ) {
        Popup.markerProperties = message.detail[0].properties;
        Popup.set();
      }
    });
  },
};

/**
 * Edit marker Popup
 */
const Popup = {
  markerProperties: {},

  waitForElementReady: (selector, timeoutInSeconds = 3) => {
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
        }, interval);
      };

      wait(100);
    });
  },

  getExternalLinksHtml: () => {
    return `
    <a href="https://www.instantstreetview.com/s/${
      Popup.markerProperties.lat
    },${Popup.markerProperties.lng}"
      target="_blank" class="external-link street-view" title="Street View"
    >
      <img class="icon" src="${chrome.extension.getURL(
        'src/images/street_view.svg',
      )}" />
    </a>

    <a href="https://www.google.fr/maps/place/${Popup.markerProperties.lat},${
      Popup.markerProperties.lng
    }/@${Popup.markerProperties.lat},${Popup.markerProperties.lng},15z"
      target="_blank" class="external-link google-maps" title="Google Maps"
    >
      <img class="icon" src="${chrome.extension.getURL(
        'src/images/maps.svg',
      )}" />
    </a>

    <a href="https://www.waze.com/ul?ll=${Popup.markerProperties.lat},${
      Popup.markerProperties.lng
    }&zoom=15"
      target="_blank" class="external-link waze" title="Waze"
    >
      <img class="icon" src="${chrome.extension.getURL(
        'src/images/waze.svg',
      )}" />
    </a>
    `;
  },

  editWaypoint: () => {
    if (
      !document.querySelector(
        `${popupWaypointSelector} ${popupPowerideSelector}`,
      )
    ) {
      document
        .querySelector(popupWaypointSelector)
        .insertAdjacentHTML(
          'beforeEnd',
          `<div class="${popupPowerideContainerClass}"></div>`,
        );
    }

    document.querySelector(
      `${popupWaypointSelector} ${popupPowerideSelector}`,
    ).innerHTML = Popup.getExternalLinksHtml();
  },

  editFavorite: () => {
    if (
      !document.querySelector(
        `${popupFavoriteSelector} ${popupPowerideSelector}`,
      )
    ) {
      document
        .querySelector(`${popupFavoriteSelector} > div:first-child`)
        .insertAdjacentHTML(
          'beforeEnd',
          `<div class="${popupPowerideContainerClass}"></div>`,
        );
    }

    document.querySelector(
      `${popupFavoriteSelector} ${popupPowerideSelector}`,
    ).innerHTML = Popup.getExternalLinksHtml();
  },

  set: () => {
    Popup.waitForElementReady(popupFavoriteSelector).then(() =>
      Popup.editFavorite(),
    );

    Popup.waitForElementReady(popupWaypointSelector).then(() =>
      Popup.editWaypoint(),
    );
  },
};

const Waypoints = {
  set: () => {
    ConsoleInterceptor.inject();
    ConsoleInterceptor.listen();
  },
};
