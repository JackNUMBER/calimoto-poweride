CustomStyles = {

  // font size
  applyFontSize: () => {
    const fontSize_customStyles = `
      html {
        font-size: 14px;
      }
      html .SidebarRoutePointWrapper .AddressSearchAutocomplete {
        height: 14px;
      }
    `;

    fontSize_styleSheet = document.createElement('style');
    fontSize_styleSheet.innerText = fontSize_customStyles;
    document.head.appendChild(fontSize_styleSheet);
  },

  // search bar
  applySearchBar: () => {
    const searchbar_customStyles = `
      html .MAASearchAndLocation {
        width: 450px;
      }
    `;

    searchbar_styleSheet = document.createElement('style');
    searchbar_styleSheet.innerText = searchbar_customStyles;
    document.head.appendChild(searchbar_styleSheet);
  },
}

// init
// TODO: améliorer en concaténant tous les styles et en appliquant qu'une seule balise <style>
chrome.storage.sync.get(['smallerFont'], result => {
  console.log('smallerFont', result.smallerFont)
  if (result.smallerFont === true) {
    CustomStyles.applyFontSize();
  }
});

CustomStyles.applySearchBar();
