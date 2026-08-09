<p align="center">
  <a href="https://chrome.google.com/webstore/detail/gbjkklkjohmpklkamcnbpmaoohgleghi" title="Go to Chrome Web Store">
    <img src="readme-img/badge_chrome.png" align="center" alt="Chrome">
  </a>
  &nbsp;
  <a href="https://addons.mozilla.org/firefox/addon/calimoto-poweride/" title="Go to Firefox Add-on Store">
    <img src="readme-img/badge_firefox.png" align="center" alt="Firefox">
  </a>
</p>

<p align="center">
  <img src="readme-img/banner.png" align="center" alt="braaaaaaaap" width="100%">
</p>

This browser extension add some features to the web Calimoto's Tour Planner:

- Links to externals map services
- One button to change routing for all waypoints
- Design changes (smaller font size, bigger map searchbar)
- A settings popup to turn each of them on or off

_This is a non-official project._

## Why this extension?

Being a passionate biker I use the Calimoto mobile app a lot for my rides. I always prepare these rides on the Calimoto web app but this one has some annoying lacks. The service is good enough that I have been subscribed to the paid offer for several years but the rare upgrades of the web platform led me to do it myself.

➡ **For the Calimoto team:** please understand it's not a "hack" of your app, only a way to enhance it.

## Development

```bash
npm install
npm run dev            # Chrome, hot-reloading dev mode
npm run dev:firefox    # Firefox
npm run build          # production build -> .output/chrome-mv3
npm run build:firefox  # production build -> .output/firefox-mv2
npm run compile        # type-check only
```

Built with [WXT](https://wxt.dev).
