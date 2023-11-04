import { getJobsFromDatabase } from "./db";

getJobsFromDatabase().then(
    (jobs) => {
        setLocalStorageValues(jobs.length, 0, 0);
    }
);

function setLocalStorageValues(total, day, month) {
    localStorage.setItem("totalJobs", total);
    localStorage.setItem("totalJobsDay", day);
    localStorage.setItem("totalJobsMonth", month);
}
