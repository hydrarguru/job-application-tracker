import { openDB } from "idb";
import { getJobsFromDatabase, DATABASE_NAME, DATABASE_TABLE, getTotalJobsToday, getTotalJobsMonth } from "./db";
import { getCurrentMonth } from "./utils";



async function refreshBadge() {
    chrome.action.setBadgeBackgroundColor({ color: '#294936' });
    chrome.action.setBadgeTextColor({ color: '#ffffff' });
    chrome.action.setBadgeText({text: '100' });
}

async function setLocalStorageValues() {
    const date = new Date();
    const currentDay = date.getDay().toString();
    const currentMonth = date.getMonth().toString();
    localStorage.setItem('totalJobs', (await getJobsFromDatabase()).length.toString());
    localStorage.setItem('totalJobsDay', (await getTotalJobsToday(currentMonth, currentDay)).toString());
    localStorage.setItem('totalJobsMonth', (await getTotalJobsMonth(currentMonth)).toString());
    localStorage.setItem('currentMonth', getCurrentMonth());
}

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg === 'refreshValues') {
        await setLocalStorageValues();
    }
    if (msg === 'refreshBadge') {
        await refreshBadge();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await setLocalStorageValues();
});






