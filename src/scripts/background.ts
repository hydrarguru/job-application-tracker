import { addJobToDatabase, createDatabase, getJobsFromDatabase } from './db';
createDatabase();

/*
for (let i = 1; i < 6; i++) {
    addJobToDatabase({
        companyName: `Test Company ${i}`,
        jobRole: `Test Role ${i}`,
        jobArea: `Test Area ${i}`,
        applicationLink: `Test Link ${i}`,
        appliedDate: `Test Date ${i}`,
    });
}
*/

/*
addJobToDatabase({
    companyName: 'Test Company 1',
    jobRole: 'Test Role 1',
    jobArea: 'Test Area 1',
    applicationLink: 'Test Link 1',
    appliedDate: 'Test Date 1',
});
*/

async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.LOCAL_STORAGE],
      justification: "storing data in local storage",
    });
    const date = new Date();
    console.info(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] Created offscreen document.`)
}
  
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg === "offscreen") {
        await createOffscreen();
    }
});