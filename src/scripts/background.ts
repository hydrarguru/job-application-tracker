import { addJobToDatabase, createDatabase, getJobsFromDatabase } from './db';
import { getCurrentTime } from './utils';
createDatabase();

/*
addJobToDatabase({
    companyName: 'Test Company 1',
    jobRole: 'Test Role 1',
    jobArea: 'Test Area 1',
    applicationLink: 'Test Link 1',
    appliedDate: ,
});
*/

console.log(new Date().toLocaleDateString());

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
  
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg === "offscreen") {
        await createOffscreen();
    }
});