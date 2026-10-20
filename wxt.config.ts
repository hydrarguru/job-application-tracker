import { fileURLToPath } from 'node:url';
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    outDir: 'dist',
    modules: ['@wxt-dev/module-react'],
    vite: () => ({
        plugins: [tailwindcss()],
        /* jsPDF loads these only for its HTML and SVG features. Stubbing them keeps unused code that Firefox's linter flags (eval, innerHTML) out of the build. */
        resolve: {
            alias: {
                canvg: fileURLToPath(new URL('./src/lib/stubs/empty.ts', import.meta.url)),
                dompurify: fileURLToPath(new URL('./src/lib/stubs/empty.ts', import.meta.url)),
                html2canvas: fileURLToPath(new URL('./src/lib/stubs/empty.ts', import.meta.url)),
            },
        },
    }),
    manifest: ({ browser }) => ({
        // Name and description come from public/_locales; the UI text lives in src/locales.
        name: '__MSG_extName__',
        description: '__MSG_extDescription__',
        default_locale: 'sv',
        icons: {
            16: 'img/icon16.png',
            32: 'img/icon32.png',
            48: 'img/icon48.png',
            128: 'img/icon128.png',
        },
        options_ui: {
            page: 'dashboard.html',
            open_in_tab: true,
        },
        permissions: ['storage', 'activeTab'],
        ...(browser === 'firefox' && {
            browser_specific_settings: {
                gecko: {
                    id: 'job-application-tracker@hydrarguru',
                    strict_min_version: '121.0',
                    data_collection_permissions: { required: ['none'] },
                },
            },
        }),
    }),
});
