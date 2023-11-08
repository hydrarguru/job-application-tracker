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
    chrome.runtime.sendMessage('refreshBadge');
    
    /*
    for(let i = 1; i < 13; ++i) {
        await addJobToDatabase({
            companyName: `Test Company ${i}`,
            jobRole: `Test Role ${i}`,
            jobArea: `Test Area ${i}`,
            applicationLink: `https://www.findwork.com/${i}`,
            appliedDate: new Date(`2023-05-${i}`).toLocaleDateString(),
        });
    }
    */
})();