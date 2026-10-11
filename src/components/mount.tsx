import React, { type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

import { LanguageProvider } from '@/components/language';
import '@/assets/tailwind.css';

/* Renders a page of the extension inside the language provider. */
export function mount(page: ReactNode) {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <LanguageProvider>{page}</LanguageProvider>
        </React.StrictMode>,
    );
}
