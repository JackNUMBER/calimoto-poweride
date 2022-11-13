'use strict';

/**
 * Intercept console
 */
const ConsoleInterceptor = {
  inject: () => {
    // TODO: replace this file by a <script> injection
    const script = document.createElement('script');
    script.src = chrome.extension.getURL('src/inject_console_listener.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = function () {
      script.remove();
    };
  },

  listen: () => {
    document.addEventListener('calimotoPoweride_bip_bip', (message) => {
      if (message.detail[0] === undefined) return;

      if (
        !!message.detail[0].properties &&
        message.detail[0].properties.popupType === 'marker'
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
  markerProperties: '',

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

  getExternalLinksHtml: (location) => {
    return `
      <div class="calimoto-enhnancer">
        <span class="location">${location}</span>
        <a href="https://www.instantstreetview.com/s/${
          Popup.markerProperties.lat
        },${
      Popup.markerProperties.lng
    }" target="_blank" class="external-link street-view" title="Street View">
          <img class="icon" src="${chrome.extension.getURL(
            'src/images/street_view.svg',
          )}" />
        </a>

        <a href="https://www.google.fr/maps/place/${
          Popup.markerProperties.lat
        },${Popup.markerProperties.lng}/@${Popup.markerProperties.lat},${
      Popup.markerProperties.lng
    },15z" target="_blank" class="external-link google-maps" title="Google Maps">
          <img class="icon" src="${chrome.extension.getURL(
            'src/images/maps.svg',
          )}" />
        </a>

        <a href="https://www.waze.com/ul?ll=${Popup.markerProperties.lat},${
      Popup.markerProperties.lng
    }&zoom=15" target="_blank" class="external-link waze" title="Waze">
          <img class="icon" src="${chrome.extension.getURL(
            'src/images/waze.svg',
          )}" />
        </a>
      </div>
    `;
  },

  edit: () => {
    // remove icon (to avoid a "launch" text at the end of the location)
    document
      .querySelector('.PopupMarker .MarkerAndPoiNameLink a .material-icons')
      .remove();

    // get location name
    const location = document.querySelector(
      '.PopupMarker .MarkerAndPoiNameLink a',
    ).innerText;
    document.querySelector('.PopupMarker .MarkerAndPoiNameLink a').remove();

    document.querySelector('.PopupMarker .MarkerAndPoiNameLink').innerHTML =
      Popup.getExternalLinksHtml(location);
  },

  set: () => {
    // check if the new UI is already set
    // currently buggy: if the user click on an other marker, the UI is not refreshed (then link on icon doesn't)
    if (
      !!document.querySelector(
        '.PopupMarker .MarkerAndPoiNameLink .calimoto-enhnancer',
      )
    )
      return;

    const promise = Popup.waitForElementReady(
      '.PopupMarker .MarkerAndPoiNameLink',
    ).then(() => Popup.edit());
  },
};

const Waypoints = {
  set: () => {
    ConsoleInterceptor.inject();
    ConsoleInterceptor.listen();
  },
};
