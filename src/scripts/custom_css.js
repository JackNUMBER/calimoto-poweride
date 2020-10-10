'use strict';

const providerName = 'CalimotoEnhancer';

/**
 * Manage new styles
 */
const CustomStyles = {
  output: '',

  /**
   * Custom styles' store
   */
  get: (styles) => {
    switch (styles) {

      // smaller font-size
      case 'fontSize':
        return `
          html {
            font-size: 14px;
          }
          html .SidebarRoutePointWrapper .AddressSearchAutocomplete {
            height: 14px;
          }
        `;

      // bigger place search bar
      case 'searchBar':
        return `
          html .MAASearchAndLocation {
            width: 450px;
          }
        `;

      // marker popup edit
      case 'markerPopup':
        return `
          .PopupMarker .MapPopupMarkerAddressAndDeleteButton {
            align-items: start;
          }
          .PopupMarker .MarkerAndPoiNameLink .location {
            display: inline-block;
            margin-bottom: 15px;
          }
          .PopupMarker .MarkerAndPoiNameLink .external-link i {
            font-size: 22px;
          }
        `;

      default:
        return;
    }

  },

  /**
   * Get all the needed styles before inject it
   */
  set: () => {
    CustomStyles.output += CustomStyles.get('searchBar');

    browserHandle.storage.sync.get(['smallerFont'], result => {
      if (result.smallerFont === true) {
        CustomStyles.output += CustomStyles.get('fontSize');
      }
    });

    CustomStyles.output += CustomStyles.get('markerPopup');

    CustomStyles.inject(CustomStyles.output);
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
