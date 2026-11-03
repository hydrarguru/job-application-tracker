import { defineWebExtConfig } from 'wxt';

// Used by `npm run dev` / `npm run dev:chrome` / `npm run dev:firefox` to configure the browser WXT opens.
const isFirefox = process.argv.some((arg, i) => arg === 'firefox' && process.argv[i - 1] === '-b');

export default defineWebExtConfig({
    // Open each browser's extension management page.
    startUrls: isFirefox ? ['about:debugging#/runtime/this-firefox'] : ['chrome://extensions'],
});
