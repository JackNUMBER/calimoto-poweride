import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Calimoto Poweride',
    description:
      "Adds external navigation shortcuts to calimoto's map context menu.",
    permissions: ['storage'],
    // For route icons
    web_accessible_resources: [
      {
        matches: ['https://calimoto.com/*'],
        resources: ['routing-profiles/*.svg'],
      },
    ],
  },
  webExt: {
    startUrls: ['https://calimoto.com/fr/itineraires-moto'],
  },
});
