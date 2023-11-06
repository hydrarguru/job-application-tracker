import { openDB } from "idb";
import { getJobsFromDatabase, DATABASE_NAME, DATABASE_TABLE } from "./db";
import { getCurrentMonth } from "./utils";

async function getTotalJobsMonth(month: string): Promise<number> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = await db.getAllFromIndex(DATABASE_TABLE, 'appliedDate', IDBKeyRange.bound(`2023-${month}-01`, `2023-${month}-31`));
    return value.length;
}
//`2023-${month}-${day}`
async function getTotalJobsToday(month: string, day: string): Promise<number> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = await db.getAllFromIndex(DATABASE_TABLE, 'appliedDate', IDBKeyRange.bound(`2023-${month}-${day}`, `2023-${month}-${day}`));
    return value.length;
}

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg === 'test') {
        alert();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('totalJobs', (await getJobsFromDatabase()).length.toString());
    localStorage.setItem('totalJobsDay', (await getTotalJobsToday('11', '06')).toString());
    localStorage.setItem('totalJobsMonth', (await getTotalJobsMonth('11')).toString());
    localStorage.setItem('currentMonth', getCurrentMonth());
});






