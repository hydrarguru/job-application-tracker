import { openDB, DBSchema } from 'idb';
import { getCurrentTime } from './utils';

export const DATABASE_NAME = 'JAT-DB';
export const DATABASE_TABLE = 'jobsTable';

interface JobDB extends DBSchema {
    jobsTable: {
        key: number;
        value: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: string;
        };
        indexes: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: string;
        };
    };
}

export type JobData = {
    companyName: string;
    jobRole: string;
    jobArea: string;
    applicationLink: string;
    appliedDate: string;
};

export async function createDatabase() {
    console.log(`[${getCurrentTime()}] (db.ts) opening connection to ${DATABASE_NAME}`);
    openDB<JobDB>(DATABASE_NAME, 1, {
        upgrade(db) {
            const store = db.createObjectStore(DATABASE_TABLE, {
                keyPath: 'id',
                autoIncrement: true,
            });
            store.createIndex('companyName', 'companyName');
            store.createIndex('jobRole', 'jobRole');
            store.createIndex('jobArea', 'jobArea');
            store.createIndex('applicationLink', 'applicationLink');
            store.createIndex('appliedDate', 'appliedDate');
            console.log(`[${getCurrentTime()}] (db.ts) ${DATABASE_NAME} database initialised`);
        },
    });
}

/**
 * Add a job application to the database.
 * @param job The job application object to add.
 */
export async function addJobToDatabase(job: JobData) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    const store = transaction.objectStore(DATABASE_TABLE);
    store.add(job);
    console.log(`[${getCurrentTime()}] (db.ts) Job added to database`);
}

/**
 * Delete a job application from the database.
 * @param id The id of the job application to delete.
 */
export async function deleteJobFromDatabase(id: number) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    const store = transaction.objectStore(DATABASE_TABLE);
    store.delete(id);
    console.log(`[${getCurrentTime()}] (db.ts) Job deleted from database`);
}

/**
 * @returns A promise that resolves to an array of job application objects.
 */
export async function getJobsFromDatabase() {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readonly');
    const store = transaction.objectStore(DATABASE_TABLE);
    const data = await store.getAll();
    db.close();
    console.log(`[${getCurrentTime()}] (db.ts) Jobs retrieved from database`);
    return data;
}

/**
 * Get a job application from the database.
 * @param id The id of the job application to get.
 * @returns A job application object from the database.
 */
export async function getJobFromDatabase(id: number) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readonly');
    const store = transaction.objectStore(DATABASE_TABLE);
    console.log(`[${getCurrentTime()}] (db.ts) Job ${id} retrieved from database`);
    return store.get(id);
}

/**
 * @param index The object store index to query.
*  @returns A promise that resolves to an array of object store index key values.
*/
export async function indexKeyValueQuery(index: string): Promise<string[]> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = db.getAllFromIndex(DATABASE_TABLE, index);
    const queryResult: string[] = (await value).map((job) => job[index]);
    return queryResult;
}

export async function getTotalJobsMonth(month: string): Promise<number> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = await db.getAllFromIndex(DATABASE_TABLE, 'appliedDate', IDBKeyRange.bound(`2023-${month}-01`, `2023-${month}-31`));
    return value.length;
}

export async function getTotalJobsToday(month: string, day: string): Promise<number> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = await db.getAllFromIndex(DATABASE_TABLE, 'appliedDate', IDBKeyRange.bound(`2023-${month}-${day}`, `2023-${month}-${day}`));
    return value.length;
}
