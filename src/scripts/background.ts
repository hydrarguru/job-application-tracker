import { createDatabase, getJobsFromDatabase } from './db';
var _window = window;

async function initaliseValues() {
    const jobs = await getJobsFromDatabase();
    console.log(jobs);
}
//initaliseValues();
createDatabase();