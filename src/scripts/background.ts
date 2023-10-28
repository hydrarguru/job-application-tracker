import {
    createDatabase,
    addJobToDatabase,
    getJobsFromDatabase,
    deleteJobFromDatabase,
} from './db';

createDatabase();

/* 
addJobToDatabase('october', {
    companyName: 'Test Företag',
    jobRole: 'Test Roll',
    jobArea: 'Test Ort',
    applicationLink: 'https://www.test.se',
    applicationDate: '2021-01-01',
});
*/
