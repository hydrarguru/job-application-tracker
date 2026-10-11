import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
    createTranslator,
    languagePreference,
    languages,
    resolveLanguage,
    type Language,
    type LanguagePreference,
    type Translate,
} from '@/lib/i18n';

type I18n = { language: Language; preference: LanguagePreference; t: Translate };

const I18nContext = createContext<I18n | null>(null);

/* Loads the stored language, follows changes made on other pages and sets <html lang>. */
export function LanguageProvider({ children }: { children: ReactNode }) {
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
        if (value) document.documentElement.lang = value.language;
    }, [value]);

    /* Render nothing until the language is known so the UI never flashes the wrong language. */
    if (!value) return null;
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used inside a LanguageProvider');
    return context;
}

/* Compact language picker for the popup's navy header. The select's accessible name is "Språk"/"Language". */
export function LanguageSelect({ className }: { className?: string }) {
    const { preference, t } = useI18n();
    return (
        <label
            className={cn(
                'relative flex h-8 items-center gap-1.5 rounded-full border border-white/14 bg-white/8 pr-2 pl-2.5 text-xs text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white',
                className,
            )}
        >
            <Globe aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.8} />
            <span className="sr-only">{t('language.label')}</span>
            <select
                value={preference}
                onChange={(e) => languagePreference.setValue(e.target.value as LanguagePreference)}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-xs text-white focus-visible:outline-none [&>option]:bg-white [&>option]:text-ink"
            >
                <option value="auto">{t('language.auto')}</option>
                {languages.map(({ value, name }) => (
                    <option key={value} value={value} lang={value}>
                        {name}
                    </option>
                ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 size-3" strokeWidth={2} />
        </label>
    );
}
