'use strict';

window.CalimotoEnhancer = {

  matches: false,

  environment: {
    getBrowserHandle: () => /firefox/i.test(navigator.userAgent) ? browser : chrome
  }
}

const browserHandle = CalimotoEnhancer.environment.getBrowserHandle();
