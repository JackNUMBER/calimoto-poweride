// Saves options to chrome.storage
function save_options() {
  chrome.storage.sync.set({
    smallerFont: document.getElementById('smallerFont').checked
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function load_options() {
  chrome.storage.sync.get({
    smallerFont: true
  }, function(items) {
    document.getElementById('smallerFont').checked = items.smallerFont;
  });
}

document.addEventListener('DOMContentLoaded', load_options);

document.querySelectorAll('.saveOnChange').forEach(item => {
  item.addEventListener('change', save_options);
});
