import { browser, storage } from '#imports';
import { sv } from '@/locales/sv';
import { en } from '@/locales/en';

export type Language = 'sv' | 'en';
export type LanguagePreference = Language | 'auto';
export type MessageKey = keyof typeof sv;
export type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

const messages: Record<Language, Record<MessageKey, string>> = { sv, en };

/* Shown in their own language so people can find theirs whatever the UI language is. */
export const languages: { value: Language; name: string }[] = [
    { value: 'sv', name: 'Svenska' },
    { value: 'en', name: 'English' },
];

/* The user's choice, shared by every page of the extension. */
export const languagePreference = storage.defineItem<LanguagePreference>('local:language', {
    fallback: 'auto',
});

/* "auto" follows the browser: English for an English browser, Swedish for everything else. */
export function resolveLanguage(preference: LanguagePreference): Language {
    if (preference !== 'auto') return preference;
    return browser.i18n.getUILanguage().toLowerCase().startsWith('en') ? 'en' : 'sv';
}

/* Locale for Intl formatting (month names, plural rules). */
export function localeOf(language: Language) {
    return language === 'sv' ? 'sv-SE' : 'en-GB';
}

export function createTranslator(language: Language): Translate {
    const plural = new Intl.PluralRules(localeOf(language));
    return (key, params = {}) => {
        const table = messages[language];
        const singular = `${key}_one` as MessageKey;
        const useSingular = typeof params.count === 'number' && singular in table && plural.select(params.count) === 'one';
        /* An unknown key shows as itself rather than breaking the page. */
        const text = (useSingular ? table[singular] : table[key]) ?? key;
        return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
    };
}

/* Month name with a capital first letter, e.g. "Oktober" or "October". `month` is 0-11. */
export function monthName(language: Language, month: number) {
    const name = new Date(2000, month, 1).toLocaleString(localeOf(language), { month: 'long' });
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/* Month name as written inside a sentence: "oktober" in Swedish, "October" in English. */
export function monthInSentence(language: Language, month: number) {
    return new Date(2000, month, 1).toLocaleString(localeOf(language), { month: 'long' }).replace(/^./, (first) =>
        language === 'en' ? first.toUpperCase() : first,
    );
}

/* Three-letter month name for chart axes, e.g. "Okt" or "Oct". */
export function shortMonthName(language: Language, month: number) {
    return monthName(language, month).slice(0, 3);
}
