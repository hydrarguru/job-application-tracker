/*
 * Everything that knows about Arbetsförmedlingen's "Sökta jobb" form: its selectors, the values
 * its radio buttons use and how to fill it so the site's Angular form picks the values up.
 * If the website changes its markup, this is the file to update.
 */
import type { EmploymentType } from '@/utils/db';

export const FORM_SELECTOR = 'form#soktjobb';

/* The white "Sökta jobb" section around the form, with its heading and intro text. */
export function formSection(form: HTMLFormElement): Element {
    return form.closest('.segment-padding-add-activity') ?? form.parentElement!;
}

const selectors = {
    jobRole: '#soktjobb-soktTjanst-search',
    companyName: '#soktjobb-arbetsgivare',
    jobArea: '#soktjobb-ort',
    appliedDate: '#soktjobb-aktivitetsdatum',
    suggestion: 'li.dropdown-item',
};

/* Radio groups by their `name`; the ids of the radio buttons change on every page load. */
const radioGroups = {
    employmentType: 'soktjobb-omfattning',
    location: 'soktjobb',
    answeredAd: 'typ',
};

const employmentValues: Record<EmploymentType, string> = { full: 'HELTID', part: 'DELTID' };

/* "Var finns jobbet?". The values are the website's own. */
export const locations = ['SVERIGE', 'Obestämd ort', 'Utomlands'] as const;
export type Location = (typeof locations)[number];

/* What gets filled in: a saved application plus the answers J.A.T doesn't store. */
export type Draft = {
    jobRole: string;
    companyName: string;
    employmentType: EmploymentType | undefined;
    location: Location;
    jobArea: string;
    answeredAd: boolean;
    appliedDate: string;
};

export type FieldKey = keyof Draft;

/*
 * filled: done. choose: the website's list had no clear match, so the person picks one.
 * empty: nothing to fill in. notFound: the field isn't on the page.
 */
export type FieldStatus = 'filled' | 'choose' | 'empty' | 'notFound';

type SuggestionField = 'jobRole' | 'jobArea';

export type FillResult = {
    fields: Partial<Record<FieldKey, FieldStatus>>;
    /* The website's name for a value that was picked without matching it exactly, to double-check. */
    picked: Partial<Record<SuggestionField, string>>;
};

/* The first and last day the form accepts, i.e. the month being reported. */
export function reportedMonth(form: HTMLFormElement): { min: string; max: string } | null {
    const input = form.querySelector<HTMLInputElement>(selectors.appliedDate);
    if (!input?.min || !input.max) return null;
    return { min: input.min, max: input.max };
}

/* Fills the form in. It never submits it: the person reviews the form and presses Spara. */
export async function fillForm(form: HTMLFormElement, draft: Draft): Promise<FillResult> {
    const fields: FillResult['fields'] = {};
    const picked: FillResult['picked'] = {};
    /* The search left in each field that waits for the person to pick from the list. */
    const searches: Partial<Record<SuggestionField, string>> = {};
    const suggestion = (field: SuggestionField, selector: string) =>
        fillSuggestion(form.querySelector(selector), draft[field], {
            onPicked: (name) => (picked[field] = name),
            onChoose: (search) => (searches[field] = search),
        });

    /* First, because "Sök och välj ort" depends on it. */
    fields.location = await checkRadio(form, radioGroups.location, draft.location);

    fields.jobRole = await suggestion('jobRole', selectors.jobRole);
    fields.companyName = fillText(form.querySelector(selectors.companyName), draft.companyName);
    fields.employmentType = draft.employmentType
        ? await checkRadio(form, radioGroups.employmentType, employmentValues[draft.employmentType])
        : 'empty';
    if (draft.location === 'SVERIGE') {
        fields.jobArea = await suggestion('jobArea', selectors.jobArea);
    }
    fields.answeredAd = await checkRadio(form, radioGroups.answeredAd, draft.answeredAd ? 'soktjobb' : 'intresseanmalan');
    fields.appliedDate = fillText(form.querySelector(selectors.appliedDate), draft.appliedDate);

    /*
     * Filling the later fields closed the list of any field still waiting for a choice, so the
     * first one is searched again and focused to leave its list open.
     */
    const waiting = (['jobRole', 'jobArea'] as const).find((key) => fields[key] === 'choose');
    if (waiting) {
        const input = form.querySelector<HTMLInputElement>(waiting === 'jobRole' ? selectors.jobRole : selectors.jobArea);
        if (input) typeInto(input, searches[waiting]!);
    }
    return { fields, picked };
}

/* Sets a value the way typing would, so both the Digi component and Angular see the change. */
function typeInto(input: HTMLInputElement, value: string) {
    input.focus();
    /* The prototype's setter, because frameworks may replace the element's own `value` property. */
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, composed: true }));
}

function fillText(input: HTMLInputElement | null, value: string): FieldStatus {
    if (!input) return 'notFound';
    if (!value.trim()) return 'empty';
    typeInto(input, value.trim());
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.blur();
    return 'filled';
}

async function checkRadio(form: HTMLFormElement, name: string, value: string): Promise<FieldStatus> {
    const radio = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(
        (input) => input.name === name && input.value === value,
    );
    if (!radio) return 'notFound';
    if (!radio.checked) radio.click();
    /* Give Angular a moment to show or hide the fields that depend on this answer. */
    await delay(150);
    return 'filled';
}

/*
 * "Yrkesroll" and "Sök och välj ort" only accept a value picked from the website's list. The
 * value is searched for and the best match is picked (see `bestMatch`). `onPicked` gets the
 * website's name when it isn't an exact match. If nothing matches clearly, the search with
 * results is left in the field so the person can pick from the list.
 */
async function fillSuggestion(
    input: HTMLInputElement | null,
    value: string,
    { onPicked, onChoose }: { onPicked: (name: string) => void; onChoose: (search: string) => void },
): Promise<FieldStatus> {
    if (!input) return 'notFound';
    if (!normalize(value)) return 'empty';
    const container = input.closest('.mb-search-input') ?? input.parentElement!;
    const items = () => [...container.querySelectorAll<HTMLElement>(selectors.suggestion)];

    let searchWithResults: string | null = null;
    for (const search of searchesFor(value)) {
        typeInto(input, '');
        await waitUntil(() => items().length === 0, 1000);
        typeInto(input, search);
        const found = await waitForSuggestions(items);
        if (found.length === 0) continue;
        searchWithResults ??= search;
        const match = bestMatch(found, value);
        if (match) {
            /* mousedown too, in case the list picks on mousedown to beat the input's blur. */
            match.item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
            match.item.click();
            await waitUntil(() => items().length === 0, 1500);
            input.blur();
            if (!match.exact) onPicked(match.item.textContent!.trim());
            return 'filled';
        }
    }
    const search = searchWithResults ?? value.trim();
    typeInto(input, search);
    onChoose(search);
    return 'choose';
}

/* The whole value first, then shorter searches in case the website words it differently. */
function searchesFor(value: string) {
    const trimmed = value.trim();
    const firstWord = trimmed.split(/[\s\-/,]+/)[0];
    return [...new Set([trimmed, firstWord, trimmed.slice(0, 6)])].filter((search) => search.length >= 2);
}

/*
 * The suggestion that matches `value`, ignoring case, spaces and hyphens ("Frontendutvecklare"
 * is "Frontend-utvecklare"). Failing an exact match, a suggestion counts if one part of its name
 * matches ("Systemutvecklare" in "Systemutvecklare/programmerare"), allowing one typo per five
 * letters ("Systemvecklare"). Only a single clear winner is picked: when several suggestions
 * match equally well, like "Kock" in "Kock, à la carte" and "Kock, storhushåll", the person picks.
 */
function bestMatch(items: HTMLElement[], value: string): { item: HTMLElement; exact: boolean } | null {
    const wanted = normalize(value);
    const exact = items.filter((item) => normalize(item.textContent ?? '') === wanted);
    if (exact.length === 1) return { item: exact[0], exact: true };

    const allowed = Math.floor(wanted.length / 5);
    const scored = items.map((item) => {
        const text = item.textContent ?? '';
        const names = [text, ...text.split(/[/,()]/)].map(normalize).filter(Boolean);
        return { item, distance: Math.min(...names.map((name) => editDistance(wanted, name))) };
    });
    const best = Math.min(...scored.map((score) => score.distance));
    const winners = scored.filter((score) => score.distance === best);
    if (best > allowed || winners.length !== 1) return null;
    return { item: winners[0].item, exact: false };
}

/* How many letters have to be added, removed or swapped to turn `a` into `b` (Levenshtein). */
function editDistance(a: string, b: string) {
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        for (let j = 1; j <= b.length; j++) {
            current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        previous = current;
    }
    return previous[b.length];
}

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

/* Waits for the list to appear and stop changing; an empty array means no results. */
async function waitForSuggestions(items: () => HTMLElement[], timeout = 3000) {
    const end = Date.now() + timeout;
    let last = '';
    let stableSince = 0;
    while (Date.now() < end) {
        const current = items();
        const snapshot = current.map((item) => item.textContent).join('\n');
        if (snapshot !== last) {
            last = snapshot;
            stableSince = Date.now();
        } else if (current.length > 0 && Date.now() - stableSince >= 300) {
            return current;
        }
        await delay(100);
    }
    return items();
}

async function waitUntil(condition: () => boolean, timeout: number) {
    const end = Date.now() + timeout;
    while (!condition() && Date.now() < end) await delay(50);
    return condition();
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * Calls `onSaved` once the person saves the form: after a submit, the form either goes away
 * or is emptied for the next activity. A submit that fails validation, or pressing Avbryt,
 * doesn't count. Starting a new watch stops the previous one.
 */
let stopWatching: (() => void) | null = null;

export function watchForSave(form: HTMLFormElement, onSaved: () => void) {
    stopWatching?.();
    let timer = 0;
    const stop = () => {
        clearInterval(timer);
        form.removeEventListener('submit', onSubmit, true);
        form.removeEventListener('click', onClick, true);
        if (stopWatching === stop) stopWatching = null;
    };
    const onClick = (event: Event) => {
        const button = (event.target as Element).closest('button');
        if (button?.type === 'button' && button.textContent?.trim() === 'Avbryt') stop();
    };
    const onSubmit = () => {
        clearInterval(timer);
        const companyInput = form.querySelector<HTMLInputElement>(selectors.companyName);
        const end = Date.now() + 20_000;
        timer = window.setInterval(() => {
            const saved = !form.isConnected || companyInput?.value === '';
            if (saved) {
                stop();
                onSaved();
            } else if (form.querySelector('[aria-invalid="true"]') || Date.now() > end) {
                /* Validation failed or nothing happened: wait for the next submit. */
                clearInterval(timer);
            }
        }, 250);
    };
    form.addEventListener('submit', onSubmit, true);
    form.addEventListener('click', onClick, true);
    stopWatching = stop;
}
