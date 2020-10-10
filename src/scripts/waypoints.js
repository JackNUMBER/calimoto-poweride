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
        PopUp.set(message.detail[0].properties);
      }
    });
  },

  giveOrder: () => {
    /* Example: Send data from the page to your Chrome extension */
    document.dispatchEvent(new CustomEvent('calimotoEnhancer_bip_bip', {
      detail: GLOBALS // Some variable from Gmail.
    }));
  }
};

const PopUp = {
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

  edit: (properties) => {
    // remove icon (to avoid a "launch" text at the end of the location)
    document.querySelector('.PopupMarker .MarkerAndPoiNameLink a .material-icons').remove();

    // get location name
    const location = document.querySelector('.PopupMarker .MarkerAndPoiNameLink a').innerText;
    document.querySelector('.PopupMarker .MarkerAndPoiNameLink a').remove();

    // TODO: use better icons
    const html = `
      <div class="calimoto-enhnancer">
        <span class="location">${location}</span>
        <a href="https://www.instantstreetview.com/s/${properties.lat},${properties.lng}" target="_blank" class="external-link" title="Street View">
          <i class="material-icons">streetview</i>
        </a>
        <a href="https://www.google.fr/maps/place/${properties.lat},${properties.lng}/@${properties.lat},${properties.lng},15z" target="_blank" class="external-link" title="Google Maps">
          <i class="material-icons">room</i>
        </a>
        <a href="https://www.waze.com/ul?ll=${properties.lat},${properties.lng}&zoom=15" target="_blank" class="external-link" title="Waze">
          <i class="material-icons">sentiment_satisfied_alt</i>
        </a>
      </div>
    `;
    document.querySelector('.PopupMarker .MarkerAndPoiNameLink').innerHTML = html;
  },

  set: (properties) => {
    // check if the new UI is already set
    if (!!document.querySelector('.PopupMarker .MarkerAndPoiNameLink .calimoto-enhnancer')) return;

    const promise = PopUp.waitForElementReady('.PopupMarker .MarkerAndPoiNameLink').then(() => PopUp.edit(properties));
  }
};

const Waypoints = {
  set: () => {
    ConsoleInterceptor.inject();
    ConsoleInterceptor.listen();

    // test
    setTimeout(() => {
      // ConsoleInterceptor.giveOrder();
    }, 10000);
  }
}
