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

/**
 * Translates a plain HTML page: sets <html lang> and fills every element marked with
 * data-i18n (text), data-i18n-aria-label or data-i18n-placeholder.
 */
export function localizeDocument(language: Language, t: Translate) {
    document.documentElement.lang = language;
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
        element.textContent = t(element.dataset.i18n as MessageKey);
    });
    document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((element) => {
        element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel as MessageKey));
    });
    document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((element) => {
        element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder as MessageKey));
    });
}

/* Fills a <select> with the language choices and saves the choice when it changes. */
export function fillLanguageSelect(select: HTMLSelectElement, preference: LanguagePreference, t: Translate) {
    select.replaceChildren(
        new Option(t('language.auto'), 'auto'),
        ...languages.map(({ value, name }) => {
            const option = new Option(name, value);
            option.lang = value;
            return option;
        }),
    );
    select.value = preference;
    select.addEventListener('change', () => {
        languagePreference.setValue(select.value as LanguagePreference);
    });
}

/**
 * Sets up a plain HTML page: translates it, wires up its #language-select if it has one and
 * calls `render` now and again whenever the language changes (here or on another page).
 */
export async function setupPageLanguage(render: (language: Language, t: Translate) => void | Promise<void> = () => {}) {
    const apply = async (preference: LanguagePreference) => {
        const language = resolveLanguage(preference);
        const t = createTranslator(language);
        localizeDocument(language, t);
        const select = document.querySelector<HTMLSelectElement>('#language-select');
        if (select) {
            select.value = preference;
            select.options[0].text = t('language.auto');
        }
        await render(language, t);
    };

    const preference = await languagePreference.getValue();
    const select = document.querySelector<HTMLSelectElement>('#language-select');
    if (select) fillLanguageSelect(select, preference, createTranslator(resolveLanguage(preference)));
    languagePreference.watch((newPreference) => apply(newPreference));
    await apply(preference);
}
