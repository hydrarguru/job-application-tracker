import { getJobsFromDatabase } from "./db";

function setLocalStorageValues(total, day, month) {
    localStorage.setItem("totalJobs", total);
    localStorage.setItem("totalJobsDay", day);
    localStorage.setItem("totalJobsMonth", month);
}

getJobsFromDatabase().then(
    (jobs) => {
        setLocalStorageValues(jobs.length, 0, 0);
    }
);


