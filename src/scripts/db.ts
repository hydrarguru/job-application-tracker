import { openDB } from 'idb';

const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'juny',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

type JobData = {
    companyName: string;
    jobRole: string;
    jobArea: string;
    applicationLink: string;
    applicationDate: string;
};

export function createDatabase() {
    openDB('JAT-DB', 1, {
        upgrade(db) {
            for (const month of months) {
                db.createObjectStore(`${month}`, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            }
        },
    });
}

/**
 * Add a job application to the database.
 * @param month The month to add the job application to.
 * @param job The job application object to add.
 */
export function addJobToDatabase(month: string, job: JobData) {
    openDB('JAT-DB', 1).then((db) => {
        const transaction = db.transaction(`${month}`, 'readwrite');
        const store = transaction.objectStore(`${month}`);
        store.add(job);
    });
}

/**
 * Delete a job application from the database.
 * @param month The month to get the job applications from.
 * @param id The id of the job application to delete.
 */
export function deleteJobFromDatabase(month: string, id: number) {
    openDB('JAT-DB', 1).then((db) => {
        const transaction = db.transaction(`${month}`, 'readwrite');
        const store = transaction.objectStore(`${month}`);
        store.delete(id);
    });
}

/**
 *
 * @param month The month to get the job applications from.
 * @returns An array of job applications from the database.
 */

export function getJobsFromDatabase(month: string) {
    return openDB('JAT-DB', 1).then((db) => {
        const transaction = db.transaction(`${month}`, 'readonly');
        const store = transaction.objectStore(`${month}`);
        return store.getAll();
    });
}

/**
 * Get a job application from the database.
 * @param month The month to get the job application from.
 * @param id The id of the job application to get.
 * @returns A job application object from the database.
 */
export function getJobFromDatabase(month: string, id: number) {
    return openDB('JAT-DB', 1).then((db) => {
        const transaction = db.transaction(`${month}`, 'readonly');
        const store = transaction.objectStore(`${month}`);
        return store.get(id);
    });
}
