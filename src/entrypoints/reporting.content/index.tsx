import React from 'react';
import ReactDOM from 'react-dom/client';

import { LanguageProvider } from '@/components/language';
import { FORM_SELECTOR } from './form';
import Panel from './Panel';
import './style.css';

/*
 * Runs on all of "Mina sidor", not only the report form's URL: the site switches pages without
 * reloading, so the script has to be there already when someone navigates to the form.
 */
export default defineContentScript({
    matches: ['https://arbetsformedlingen.se/for-arbetssokande/mina-sidor/*'],
    cssInjectionMode: 'ui',

    async main(ctx) {
        const ui = await createShadowRootUi(ctx, {
            name: 'jat-reporting-panel',
            position: 'inline',
            anchor: FORM_SELECTOR,
            append: 'before',
            onMount(container) {
                const form = document.querySelector<HTMLFormElement>(FORM_SELECTOR)!;
                const root = ReactDOM.createRoot(container);
                root.render(
                    <React.StrictMode>
                        <LanguageProvider setDocumentLanguage={false}>
                            <Panel form={form} />
                        </LanguageProvider>
                    </React.StrictMode>,
                );
                return root;
            },
            onRemove(root) {
                root?.unmount();
            },
        });
        /* Mounts the panel whenever the form appears and removes it when the form goes away. */
        ui.autoMount();
    },
});
