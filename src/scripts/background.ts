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
    appliedDate: '2021-01-01',
});
*/
