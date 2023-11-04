import { getJobsFromDatabase } from "./db";

let totalJobs;
getJobsFromDatabase().then(
    (jobs) => {
        totalJobs = jobs.length;
        localStorage.setItem("totalJobs", totalJobs);
    }
);
