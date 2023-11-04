import { createDatabase, getJobsFromDatabase } from './db';
createDatabase();

async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.LOCAL_STORAGE],
      justification: "storing data in local storage",
    });
    const date = new Date();
    console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] Created offscreen document.`)
}
  
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg === "offscreen") {
        await createOffscreen();
    }
});