'use strict';

setTimeout(function() {
  const log = console.log.bind(console)
  console.log = (...args) => {
    document.dispatchEvent(new CustomEvent('calimotoEnhancer_bip_bip', {
      detail: {...args}
    }));
  }
}, 0);
