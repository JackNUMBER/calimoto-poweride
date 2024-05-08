'use strict';

window.CalimotoPoweride = {
  options: ['smallerFont', 'biggerSearchbar', 'markerLinks'],
  getBrowser: () => (/firefox/i.test(navigator.userAgent) ? browser : chrome),
};

const browserHandle = CalimotoPoweride.getBrowser();
const optionsItems = CalimotoPoweride.options;
