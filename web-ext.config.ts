import { defineWebExtConfig } from 'wxt';

// Used by `npm run dev` / `npm run dev:firefox` to configure the browser WXT opens.
const isFirefox = process.argv.some((arg, i) => arg === 'firefox' && process.argv[i - 1] === '-b');

export default defineWebExtConfig({
    // about:debugging only exists in Firefox.
    startUrls: isFirefox ? ['about:debugging#/runtime/this-firefox'] : [],
});
