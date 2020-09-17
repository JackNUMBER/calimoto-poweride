const providerName = 'CalimotoEnhancer';

/**
 * Manage new styles
 */
CustomStyles = {
  output: '',

  /**
   * Store of custom styles
   */
  get: (styles) => {
    switch (styles) {
      case 'fontSize':
        // smaller font-size
        return `
          html {
            font-size: 14px;
          }
          html .SidebarRoutePointWrapper .AddressSearchAutocomplete {
            height: 14px;
          }
        `;
      case 'searchBar':
        // bigger place search bar
        return `
          html .MAASearchAndLocation {
            width: 450px;
          }
        `;
      default:
        return;
    }

  },

  // font size
  getFontSize: () => {
    return `
      html {
        font-size: 14px;
      }
      html .SidebarRoutePointWrapper .AddressSearchAutocomplete {
        height: 14px;
      }
    `;
  },

  // search bar
  getSearchBar: () => {
    return `
      html .MAASearchAndLocation {
        width: 450px;
      }
    `;
  },

  /**
   * Get all the needed styles before inject it
   */
  set: () => {
    // CustomStyles.output += CustomStyles.getSearchBar();
    CustomStyles.output += CustomStyles.get('searchBar');

    chrome.storage.sync.get(['smallerFont'], result => {
      if (result.smallerFont === true) {
        // CustomStyles.output += CustomStyles.getFontSize();
        CustomStyles.output += CustomStyles.get('fontSize');
      }

      CustomStyles.inject(CustomStyles.output);
    });
  },

  /**
   * Update the injected <style> without accurate properties
   * Example: settings update
   */
  refresh: () => {
    document.querySelector('style[provider=' + providerName + ']').remove();

    CustomStyles.output = '';
    CustomStyles.set();
  },

  /**
   * Build the <style> element and add it to the page's <head>
   * @param {string} content style properties inside the <style>
   */
  inject: (content) => {
  if (content !== '') {
      let styleSheets = document.createElement('style');
      styleSheets.setAttribute('provider', providerName);
      styleSheets.innerHTML = content;
      document.head.appendChild(styleSheets);
    }
  }
}

CustomStyles.set();
