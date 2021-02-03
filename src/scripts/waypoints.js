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
    document.addEventListener('calimotoEnhancer_bip_bip', message => {
      if (message.detail[0] === undefined) return;

      if (
        !!message.detail[0].properties
        && message.detail[0].properties.popupType === 'marker'
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

  waitForElementReady : (selector, timeoutInSeconds = 3) => {
    return new Promise((resolve, reject) => {
      let waited = 0;

      const wait = (interval) => {
        setTimeout(() => {
          waited += interval;

          if (!!document.querySelector(selector)) {
            return resolve()
          }

          if (waited >= timeoutInSeconds * 1000) {
            return reject()
          }
          console.log('waited', waited)
          wait(interval)
        }, interval)
      };

      wait(100);
    })
  },

  getExternalLinksHtml: () => {
    return `
      <div class="calimoto-enhnancer">
        <a href="https://www.instantstreetview.com/s/${Popup.markerProperties.lat},${Popup.markerProperties.lng}" target="_blank" class="external-link street-view" title="Street View">
          <svg viewBox="-467 269 24 24">
            <path style="fill:#FFFFFF;" d="M-455,278.3c2,0,3.6-1.6,3.6-3.6c0-2-1.6-3.6-3.6-3.6c-2,0-3.6,1.6-3.6,3.6
            C-458.7,276.6-457.1,278.3-455,278.3 M-457.6,282c0,0-1.1,3-1.4,3.5c-0.1,0.2-0.1,0.3-0.4,0.3c-0.3,0-0.7-0.3-0.7-0.3
            s-0.2-0.1-0.1-0.4c0.2-0.7,1.3-5.1,1.6-5.9c0.3-0.9,0.9-0.9,0.9-0.9h0.6l2.1,3.6l2.1-3.6h0.8c0,0,0.3,0,0.5,0.3
            c0.2,0.3,0.3,0.7,0.3,0.7l1.4,5.4c0,0,0.1,0.4,0.1,0.5c0,0.2-0.1,0.2-0.1,0.2s-0.4,0.1-0.6,0.2c-0.4,0.1-0.5-0.3-0.5-0.3l-1.3-3.4
            l-0.2,9h-1.9l-0.3-5.1c0,0-0.1-0.1-0.2-0.1c-0.2,0-0.2,0.1-0.2,0.1l-0.3,5.1h-2L-457.6,282L-457.6,282z"/>
          </svg>
        </a>

        <a href="https://www.google.fr/maps/place/${Popup.markerProperties.lat},${Popup.markerProperties.lng}/@${Popup.markerProperties.lat},${Popup.markerProperties.lng},15z" target="_blank" class="external-link google-maps" title="Google Maps">
        <svg viewBox="-467 269 24 24">
          <path style="fill:#FFFFFF;" d="M-452.7,271.4c1.6,0.5,2.9,1.7,3.7,3.2l-3.2,3.8c0.1-0.4,0.1-0.6,0-1c0-0.3-0.2-0.6-0.3-0.9c-0.7-1.2-2.1-1.7-3.3-1.3
            L-452.7,271.4z M-457.7,279c-0.1-0.2-0.1-0.4-0.2-0.6c0-0.2,0-0.5,0-0.8l-3.2,3.8c0.6,1.2,1.5,2.3,2.3,3.4c0.2,0.3,0.4,0.5,0.6,0.7
            l4.1-4.8C-455.7,281.1-457.2,280.4-457.7,279z M-457.5,276.2l-3-2.5c-1.5,2-1.8,4.7-0.9,7.1L-457.5,276.2z M-457.9,286
            c0.5,0.7,1.1,1.4,1.5,2.2c0.4,0.7,0.7,1.4,0.9,2.1c0.1,0.3,0.2,0.7,0.6,0.7c0.3,0,0.4-0.3,0.5-0.6c0.1-0.2,0.2-0.5,0.3-0.8
            s0.2-0.5,0.3-0.8c0.4-0.8,0.9-1.6,1.4-2.3c1.1-1.6,2.5-3,3.4-4.7c1.1-2.1,1.3-4.5,0.4-6.7L-457.9,286z M-457.1,275.7l3.8-4.5
            c-0.6-0.2-1.2-0.2-1.7-0.2c-2,0-3.7,0.9-5,2.2L-457.1,275.7z"/>
        </svg>
        </a>

        <a href="https://www.waze.com/ul?ll=${Popup.markerProperties.lat},${Popup.markerProperties.lng}&zoom=15" target="_blank" class="external-link waze" title="Waze">
          <svg viewBox="-467 269 24 24">
            <path style="fill:#FFF;" d="M-446.5,275.6c0.7,0.9,1.1,2,1.4,3.2c0.2,1.3,0.1,2.5-0.3,3.7c-0.4,1.2-1.1,2.2-2,3.1
              c-0.7,0.6-1.4,1.2-2.3,1.6c0.4,1.1-0.1,2.3-1.2,2.7c-0.2,0.1-0.5,0.1-0.7,0.1c-1.1,0-2-0.9-2.1-2c-0.3,0-2.6,0-3.1,0
              c-0.1,1.1-1.1,2-2.3,1.9c-1.1-0.1-1.9-1-1.9-2c0-0.2,0-0.4,0.1-0.6c-1.6-0.5-3-1.5-4-2.9c-0.3-0.4-0.2-1.1,0.2-1.4
              c0.2-0.1,0.4-0.2,0.6-0.2c0.7,0,1-0.3,1.2-0.6c0.2-0.7,0.4-1.5,0.4-2.2c0-0.5,0.1-1.1,0.2-1.6c0.4-1.7,1.3-3.3,2.7-4.4
              c1.7-1.3,3.7-2,5.8-2c1.4,0,2.8,0.4,4.1,1C-448.4,273.6-447.3,274.5-446.5,275.6 M-450.3,286.3c1.8-0.8,3.2-2.3,3.9-4.1
              c1.6-4.9-2.6-9.2-7.3-9.2c-0.4,0-0.7,0-1.1,0.1c-2.9,0.4-5.8,2.4-6.4,5.4c-0.4,2,0.2,5.3-2.8,5.3c1,1.2,2.3,2.1,3.8,2.6
              c0.9-0.8,2.2-0.7,2.9,0.2c0.1,0.1,0.2,0.3,0.3,0.4c0.6,0,3.2,0,3.5,0c0.5-1,1.8-1.4,2.8-0.9C-450.5,286.1-450.4,286.2-450.3,286.3
              M-456,279.3c-0.6,0-1.1-0.4-1.1-1c0-0.6,0.4-1.1,1-1.1c0.6,0,1.1,0.4,1.1,1.1C-455,278.8-455.4,279.3-456,279.3L-456,279.3
              M-451.3,279.3c-0.6,0-1.1-0.4-1.1-1c0-0.6,0.4-1.1,1-1.1c0.6,0,1.1,0.4,1.1,1.1C-450.3,278.8-450.8,279.3-451.3,279.3L-451.3,279.3
              M-457.3,281.1c-0.1-0.3,0.1-0.6,0.4-0.6c0.3-0.1,0.6,0.1,0.6,0.4l0,0c0.4,1.1,1.4,1.8,2.6,1.7c1.1,0.1,2.2-0.6,2.6-1.7
              c0.1-0.3,0.5-0.4,0.7-0.2c0.2,0.1,0.3,0.3,0.3,0.5c-0.2,0.7-0.6,1.3-1.2,1.8c-0.7,0.5-1.5,0.8-2.3,0.8h-0.1
              C-455.4,283.7-456.9,282.6-457.3,281.1L-457.3,281.1z"/>
          </svg>
        </a>
      </div>
    `
  },

  edit: () => {
    const markerPopupInner = document.querySelector('.PopupMarker .MarkerAndPoiNameLink');

    // check if the new UI is already set
    if (markerPopupInner.querySelector('.calimoto-enhnancer')) {
      markerPopupInner.querySelector('.calimoto-enhnancer').innerHTML = Popup.getExternalLinksHtml();
    } else {
      markerPopupInner.insertAdjacentHTML('beforeend', Popup.getExternalLinksHtml());
    }
  },

  set: () => {
    const promise = Popup.waitForElementReady('.PopupMarker .MarkerAndPoiNameLink').then(() => Popup.edit());
  }
};

const Waypoints = {
  set: () => {
    ConsoleInterceptor.inject();
    ConsoleInterceptor.listen();
  }
}
