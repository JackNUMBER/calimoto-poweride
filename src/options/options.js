'use strict';

const options = {
  /**
   * Saves settings to chrome.storage
   */
  save: () => {
    browserHandle.storage.local.set({
      smallerFont: document.getElementById('smallerFont').checked,
      biggerSearchbar: document.getElementById('biggerSearchbar').checked,
      markerLinks: document.getElementById('markerLinks').checked,
    }, success);


  },

  /**
   * Get settings from chrome.storage
   */
  load: () => {
    browserHandle.storage.local.get(optionsItems, result => {
      document.getElementById('smallerFont').checked = result.smallerFont;
      document.getElementById('biggerSearchbar').checked = result.biggerSearchbar;
      document.getElementById('markerLinks').checked = result.markerLinks;
    });
  },
}

/**
 * Display a success feedback
 * @returns Display
 */
const success = () => {
  const refreshClassList = document.querySelector('#refresh').classList;

  // make feedback blinks
  if (!refreshClassList.contains('hidden')) {
    document.querySelector('#refresh').classList.add('hidden');
    setTimeout(() => {
      document.querySelector('#refresh').classList.remove('hidden');
    }, 300);
    return;
  }

  document.querySelector('#refresh').classList.remove('hidden');
}


// when HTML is ready (no matter all assets are loaded)
document.addEventListener('DOMContentLoaded', () => {
  options.load();
});

// save
document.querySelectorAll('.saveOnChange').forEach(item => {
  item.addEventListener('change', options.save);
});
