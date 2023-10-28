import { createDatabase, addJobToDatabase } from './db';
import { getCurrentMonth } from './utils';

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
