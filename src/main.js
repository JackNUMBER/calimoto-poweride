'use strict';

window.CalimotoEnhancer = {
  getBrowser: () => /firefox/i.test(navigator.userAgent) ? browser : chrome
}

const browserHandle = CalimotoEnhancer.getBrowser();
