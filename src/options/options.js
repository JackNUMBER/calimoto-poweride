'use strict';

const options = {
  /**
   * Saves settings to chrome.storage
   */
  save: () => {
    chrome.storage.sync.set({
      smallerFont: document.getElementById('smallerFont').checked
    });

    document.querySelector('#refresh').classList.remove('hidden');
  },

  /**
   * Get settings from chrome.storage
   */
  load: () => {
    chrome.storage.sync.get({
      smallerFont: true
    }, function(items) {
      document.getElementById('smallerFont').checked = items.smallerFont;
    });
  },
}

// when HTML is ready (no matter all assets are loaded)
document.addEventListener('DOMContentLoaded', () => {
  options.load();

  // refresh the page to apply settings
  // TODO: find a solution to update page UI without this button (Message Passing?)
  document.querySelector('#refresh').addEventListener('click', (e) => {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.executeScript(tab.id, {
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
