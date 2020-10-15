'use strict';

const options = {
  /**
   * Saves settings to chrome.storage
   */
  save: () => {
    browserHandle.storage.sync.set({
      smallerFont: document.getElementById('smallerFont').checked,
      biggerSearchbar: document.getElementById('biggerSearchbar').checked,
      markerLinks: document.getElementById('markerLinks').checked,
    });

    document.querySelector('#refresh').classList.remove('hidden');
  },

  /**
   * Get settings from chrome.storage
   */
  load: () => {
    browserHandle.storage.sync.get({
      smallerFont: true,
      biggerSearchbar: true,
      markerLinks: true
    }, function(items) {
      document.getElementById('smallerFont').checked = items.smallerFont;
      document.getElementById('biggerSearchbar').checked = items.biggerSearchbar;
      document.getElementById('markerLinks').checked = items.markerLinks;
    });
  },
}

// when HTML is ready (no matter all assets are loaded)
document.addEventListener('DOMContentLoaded', () => {
  options.load();

  // refresh the page to apply settings
  // TODO: find a solution to update page UI without this button (Message Passing?)
  document.querySelector('#refresh').addEventListener('click', (e) => {
    browserHandle.tabs.getSelected(null, function(tab) {
      browserHandle.tabs.executeScript(tab.id, {
        code: 'window.location.reload();'
      });
    });
    e.currentTarget.classList.add('hidden');
  });
});

// save
document.querySelectorAll('.saveOnChange').forEach(item => {
  item.addEventListener('change', options.save);
});
