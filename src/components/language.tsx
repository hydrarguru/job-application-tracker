import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
    createTranslator,
    languagePreference,
    resolveLanguage,
    type Language,
    type LanguagePreference,
    type Translate,
} from '@/lib/i18n';

type I18n = { language: Language; preference: LanguagePreference; t: Translate };

const I18nContext = createContext<I18n | null>(null);

/*
 * Loads the stored language, follows changes made on other pages and sets <html lang>.
 * Content scripts pass `setDocumentLanguage={false}`: the <html> there belongs to the website.
 */
export function LanguageProvider({
    children,
    setDocumentLanguage = true,
}: {
    children: ReactNode;
    setDocumentLanguage?: boolean;
}) {
    const [preference, setPreference] = useState<LanguagePreference | null>(null);

    useEffect(() => {
        languagePreference.getValue().then(setPreference);
        return languagePreference.watch(setPreference);
    }, []);

    const value = useMemo(() => {
        if (preference === null) return null;
        const language = resolveLanguage(preference);
        return { language, preference, t: createTranslator(language) };
    }, [preference]);

    useEffect(() => {
        if (value && setDocumentLanguage) document.documentElement.lang = value.language;
    }, [value, setDocumentLanguage]);

    /* Render nothing until the language is known so the UI never flashes the wrong language. */
    if (!value) return null;
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used inside a LanguageProvider');
    return context;
}
