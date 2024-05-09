'use strict';

const reactAppSelector = '.PlannerComponent';

/**
 * Init the Web Extension features
 */
const setup = () => {
  console.log('🌮 Calimoto Poweride started');

  browserHandle.storage.local.get(['markerLinks'], (result) => {
    if (result.markerLinks === true) {
      Waypoints.set();
    }
  });

  CustomStyles.set();
  WaypointsList.set(); // TODO: make an option in settings for it
  WaypointsHover.set(); // TODO: make an option in settings for it
};

/**
 * Wait the React app loaded
 * @param {string} selector the targeted selector we waiting for
 * @param {int} timeoutInSeconds time before considering the app is too long loading
 */
const waitForAppReady = (timeoutInSeconds = 10) => {
  return new Promise((resolve, reject) => {
    let waited = 0;

    const wait = (interval) => {
      setTimeout(() => {
        waited += interval;

        if (!!document.querySelector(reactAppSelector)) {
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
};

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

  listen: (callback) => {
    document.addEventListener('calimotoPoweride_bip_bip', (message) => {
      // check if there is some content provided into the console.log from the website
      if (message.detail[0] === undefined) return;

      callback(message);
    });
  },
};

waitForAppReady().then(setup);
ConsoleInterceptor.inject();
