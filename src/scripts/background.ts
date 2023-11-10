import { createDatabase } from './db';
import { getCurrentTime } from './utils';

async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.LOCAL_STORAGE],
      justification: "storing data in local storage",
    });
    const date = new Date();
    console.info(`[${getCurrentTime()}] Created offscreen document.`)
}

(async () => {
    await createDatabase();
    await createOffscreen();
})();