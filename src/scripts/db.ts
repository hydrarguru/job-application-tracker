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

/**
 * Creates a new database with the specified name and schema.
 * @returns A promise that resolves when the database is successfully created.
 */
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
 * Adds a job to the database.
 * @param job The job data to be added to the database.
 * @returns A Promise that resolves with the result of the operation.
 */
export async function addJobToDatabase(job: JobData) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    const store = transaction.objectStore(DATABASE_TABLE);
    store.add(job);
    console.log(`[${getCurrentTime()}] (db.ts) Job added to database`);
}





export async function updateJobInDatabase(job: JobData, id: number) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    const store = transaction.objectStore(DATABASE_TABLE);
    store.put(job, id);
    console.log(`[${getCurrentTime()}] (db.ts) Job updated in database`);
}

/**
 * Deletes a job from the database.
 * @param id - The ID of the job to be deleted.
 * @returns A Promise that resolves when the job is successfully deleted.
 */
export async function deleteJobFromDatabase(id: number) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    const store = transaction.objectStore(DATABASE_TABLE);
    store.delete(id);
    console.log(`[${getCurrentTime()}] (db.ts) Job deleted from database`);
}


/**
 * Retrieves all jobs from the database.
 * @returns {Promise<Array>} A promise that resolves with an array of job objects.
 */
export async function getJobsFromDatabase(numberOfJobs?: number) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readonly');
    const store = transaction.objectStore(DATABASE_TABLE);
    if(numberOfJobs !== undefined) {
        const data = await store.getAll(null, numberOfJobs);
        db.close();
        console.log(`[${getCurrentTime()}] (db.ts) Jobs retrieved from database`);
        return data;
    }
    else {
        const data = await store.getAll();
        db.close();
        console.log(`[${getCurrentTime()}] (db.ts) Jobs retrieved from database`);
        return data;
    }
}


/**
 * Retrieves a job from the database by its ID.
 * @param id - The ID of the job to retrieve.
 * @returns A promise that resolves with the job object if found, or undefined if not found.
 */
export async function getJobFromDatabase(id: number) {
    const db = await openDB(DATABASE_NAME, 1);
    const transaction = db.transaction(DATABASE_TABLE, 'readonly');
    const store = transaction.objectStore(DATABASE_TABLE);
    console.log(`[${getCurrentTime()}] (db.ts) Job ${id} retrieved from database`);
    return store.get(id);
}

/**
 * Retrieves an array of values from the specified index of the database table.
 * @param index - The index to retrieve values from.
 * @returns A promise that resolves to an array of strings.
 */
export async function indexKeyValueQuery(index: string): Promise<string[]> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = db.getAllFromIndex(DATABASE_TABLE, index);
    const queryResult: string[] = (await value).map((job) => job[index]);
    return queryResult;
}

/**
 * Gets the total number of jobs applied in a given month.
 * @param month - The month to get the total number of jobs applied. Format: 'MM'.
 * @returns A promise that resolves to the total number of jobs applied in the given month.
 */
export async function getTotalJobsMonth(month: string): Promise<number> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = await db.getAllFromIndex(DATABASE_TABLE, 'appliedDate', IDBKeyRange.bound(`2023-${month}-01`, `2023-${month}-31`));
    return value.length;
}


/**
 * Returns the total number of jobs applied on a specific day.
 * @param month - The month of the day in string format (e.g. "01" for January).
 * @param day - The day of the month in string format (e.g. "01" for the first day of the month).
 * @returns A promise that resolves to the total number of jobs applied on the specified day.
 */
export async function getTotalJobsToday(month: string, day: string): Promise<number> {
    const db = await openDB(DATABASE_NAME, 1);
    const value = await db.getAllFromIndex(DATABASE_TABLE, 'appliedDate', IDBKeyRange.bound(`2023-${month}-${day}`, `2023-${month}-${day}`));
    return value.length;
}
