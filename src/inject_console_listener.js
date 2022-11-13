'use strict';

setTimeout(function () {
  // copy  console.log
  const realConsoleLog = console.log.bind(console);

  // replace console.log
  console.log = (...args) => {
    // send the console.log content to the extension
    document.dispatchEvent(
      new CustomEvent('calimotoPoweride_bip_bip', {
        detail: { ...args },
      }),
    );

    // execute inital console.log
    realConsoleLog(...args);
  };
}, 0);
