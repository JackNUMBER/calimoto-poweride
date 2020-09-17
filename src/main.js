'use strict';

window.CalimotoEnhancer = {

  matches: false,

  // from Material-Freebox-OS (by chteuchteu)
  // https://github.com/chteuchteu/Material-Freebox-OS/blob/7ac105488671e4f40eb82f443f755488f275dd20/data/js/material-freebox-os.js#L140
  environment: {
    isFirefox: function() {
      return /firefox/i.test(navigator.userAgent);
    },

    getBrowserHandle: function() {
      return this.isFirefox() ? browser : chrome;
    }
  }
}

const browserHandle = CalimotoEnhancer.environment.getBrowserHandle();
