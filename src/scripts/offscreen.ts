import { openDB } from "idb";
import { getJobsFromDatabase } from "./db";
import { getCurrentMonth } from "./utils";

function setLocalStorageValues(total, day, month) {
    localStorage.setItem('totalJobs', total);
    localStorage.setItem('totalJobsDay', day);
    localStorage.setItem('totalJobsMonth', month);
    localStorage.setItem('currentMonth', getCurrentMonth())
}

function getTotalJobsMonth(month: string) {
    const db = openDB('JAT-DB', 1).then(
        (db) => {
            const value = db.getAllFromIndex('jobsTable', 'appliedDate', IDBKeyRange.bound(`2023-${month}-01`, `2023-${month}-31`));
            return value.then((value) => {
                return value.length;
            });
        }
    );
}

getJobsFromDatabase().then(
    (jobs) => {
        setLocalStorageValues(jobs.length, 0, getTotalJobsMonth('11'));
    }
);



