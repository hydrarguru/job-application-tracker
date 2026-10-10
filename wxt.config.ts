import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    outDir: 'dist',
    modules: ['@wxt-dev/module-react'],
    vite: () => ({
        plugins: [tailwindcss()],
    }),
    manifest: ({ browser }) => ({
        name: 'Job Application Tracker',
        description: 'An extension that helps you track your job applications.',
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
