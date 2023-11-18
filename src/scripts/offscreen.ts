import { getJobsFromDatabase, getTotalJobsToday, getTotalJobsMonth } from "./db";
import { getCurrentMonth } from "./utils";

async function setLocalStorageValues() {
    const date = new Date();
    const currentDay = date.getDay().toString();
    const currentMonth = date.getMonth().toString();
    localStorage.setItem('totalJobs', (await getJobsFromDatabase()).length.toString());
    localStorage.setItem('totalJobsDay', ((await getTotalJobsToday(currentMonth, currentDay)).toString()));
    localStorage.setItem('totalJobsMonth', (await getTotalJobsMonth(currentMonth)).toString());
    localStorage.setItem('currentMonth', getCurrentMonth());
}

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg === 'refreshValues') {
        await setLocalStorageValues();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await setLocalStorageValues();
});






