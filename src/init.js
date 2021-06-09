'use strict';

/**
 * Set missing settings
 */
const initOptions = () => {
  // build settings with default value (true for everyone atm)
  const defaultOptions = {};
  optionsItems.forEach(key => {
    defaultOptions[key] = true;
  });

  // set only unsetted settings
  browserHandle.storage.local.get(defaultOptions, data => {
    browserHandle.storage.local.set(data);
  });
}

// will be executed on "install", "update", "chrome_update", or "shared_module_update"
// https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
browserHandle.runtime.onInstalled.addListener(details => {
  initOptions();
});
