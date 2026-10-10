import { getJobsFromDatabase, getTotalJobsToday, getTotalJobsMonth } from "@/utils/db";
import { getCurrentDate, getCurrentMonth } from "@/utils/utils";

async function setLocalStorageValues() {
    const currentDate = getCurrentDate();
    const [currentYear, currentMonth] = currentDate.split('-');
    localStorage.setItem('totalJobs', (await getJobsFromDatabase()).length.toString());
    localStorage.setItem('totalJobsDay', ((await getTotalJobsToday(currentDate)).toString()));
    localStorage.setItem('totalJobsMonth', (await getTotalJobsMonth(currentYear, currentMonth)).toString());
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






