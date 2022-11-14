'use strict';

const providerName = 'CalimotoPoweride';

/**
 * Manage new styles
 */
const CustomStyles = {
  output: '',

  /**
   * Custom styles' store
   */
  get: (styles) => {
    // TODO: replace by an array
    switch (styles) {
      // global design fixes
      case 'base':
        return `
          .MuiListItem-root {
            white-space: nowrap;
          }
          .SearchAndLocation .MuiAutocomplete-root input {
            padding-left: 20px !important;
          }
        `;

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
          .PopupMarker .calimoto-poweride {
            margin-top: 5px;
          }
          .PopupMarker .calimoto-poweride .external-link {
            display: inline-block;
          }
          .PopupMarker .calimoto-poweride .external-link.waze {
            margin-left: 4px;
          }
          .PopupMarker .calimoto-poweride .external-link .icon {
            width: 32px;
            height: 32px;
          }
        `;

      // marker popup edit
      case 'waypoints':
        return `
          #routingSelector {
            flex-wrap: wrap;
            justify-content: center;
            min-width: 200px;
            padding-bottom: 0;
          }
          #routingSelector .label {
            width: 100%;
            margin-bottom: 5px;
          }
          #routingSelector .btn {
            background: none;
            border: none;
          }
          #routingSelector .btn .icon {
            min-width: 28px;
            min-height: 28px;
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
    browserHandle.storage.local.get(
      ['smallerFont', 'biggerSearchbar', 'markerLinks'],
      (result) => {
        // TODO: conditional style + option
        CustomStyles.output += CustomStyles.get('waypoints');
        // TODO: end
        CustomStyles.output += CustomStyles.get('base');
        if (result.smallerFont === true) {
          CustomStyles.output += CustomStyles.get('fontSize');
        }
        if (result.biggerSearchbar === true) {
          CustomStyles.output += CustomStyles.get('searchBar');
        }
        if (result.markerLinks === true) {
          CustomStyles.output += CustomStyles.get('markerPopup');
        }
        CustomStyles.inject(CustomStyles.output);
      },
    );
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
  },
};
