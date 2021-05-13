'use strict';

const reactAppSelector = '.PlannerComponent';

/**
 * Init the Web Extension features
 */
const setup = () => {
  console.log('🌮 Calimoto Poweride started');

  browserHandle.storage.local.get(['markerLinks'], result => {
    if (result.markerLinks === true) {
      Waypoints.set();
    }
  });

  CustomStyles.set();
  WaypointsList.set();
}

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
          return resolve()
        }

        if (waited >= timeoutInSeconds * 1000) {
          return reject()
        }

        wait(interval)
      }, interval)
    };

    wait(100);
  })
}

const promise = waitForAppReady().then(setup);
