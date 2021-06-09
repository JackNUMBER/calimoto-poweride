'use strict';

window.CalimotoEnhancer = {
  options: ['smallerFont', 'biggerSearchbar', 'markerLinks'],
  getBrowser: () => /firefox/i.test(navigator.userAgent) ? browser : chrome
}

const browserHandle = CalimotoEnhancer.getBrowser();
const optionsItems = CalimotoEnhancer.options;
