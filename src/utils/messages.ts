import { browser } from '#imports';
import { getJobsFromDatabase, setJobReported, type StoredJob } from './db';

/*
 * Messages from content scripts to the background script. Content scripts run under the
 * website's origin and can't open the extension's IndexedDB, so the background script reads
 * and writes it for them.
 */
export type Message = { type: 'getJobs' } | { type: 'setReported'; id: number; reported: boolean };

type Responses = {
    getJobs: StoredJob[];
    setReported: StoredJob | undefined;
};

type Reply<T> = { ok: true; value: T } | { ok: false; error: string };

export async function sendMessage<M extends Message>(message: M): Promise<Responses[M['type']]> {
    const reply = (await browser.runtime.sendMessage(message)) as Reply<Responses[M['type']]> | undefined;
    if (!reply) throw new Error('No reply from the background script');
    /* `in` rather than `!reply.ok`: without strictNullChecks TypeScript doesn't narrow on `ok`. */
    if ('error' in reply) throw new Error(reply.error);
    return reply.value;
}

function respond(message: Message): Promise<Responses[Message['type']]> {
    switch (message.type) {
        case 'getJobs':
            return getJobsFromDatabase();
        case 'setReported':
            return setJobReported(message.id, message.reported);
    }
}

/* Answers content script messages. Called by the background script at startup. */
export function handleMessages() {
    browser.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
        /* sendResponse plus `return true` works in both Chrome and Firefox; a returned promise doesn't everywhere. */
        respond(message).then(
            (value) => sendResponse({ ok: true, value }),
            (error) => sendResponse({ ok: false, error: String(error) }),
        );
        return true;
    });
}
