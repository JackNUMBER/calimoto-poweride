'use strict';

let reactAppContainer;
const reactAppSelector = '.PlannerComponent';

const init = () => {
  console.log('🌮 Calimoto Enhancer started');

  reactAppContainer = document.querySelector(reactAppSelector);
  CalimotoEnhancer.matches = true;
}

const timeout = () => {
  console.error('Calimoto Enhancer waited 10 seconds and the Calimoto Trip Planner can\'t be found.');
}

/**
 * Wait the React app loaded
 * @param {string} selector the targeted selector we waiting for
 * @param {int} timeoutInSeconds time before considering the app is too long loading
 */
function waitForAppReady(timeoutInSeconds = 10) {
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

const promise = waitForAppReady().then(init, timeout);
