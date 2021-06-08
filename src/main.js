'use strict';

window.CalimotoEnhancer = {
  settings: ['smallerFont', 'biggerSearchbar', 'markerLinks'],
  getBrowser: () => /firefox/i.test(navigator.userAgent) ? browser : chrome
}

const browserHandle = CalimotoEnhancer.getBrowser();
const settingsItems = CalimotoEnhancer.settings;
