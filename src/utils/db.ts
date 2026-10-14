import { openDB, type DBSchema } from 'idb';
import { getCurrentTime } from './utils';
export const DATABASE_NAME = 'JAT-DB';
export const DATABASE_TABLE = 'jobsTable';

export type EmploymentType = 'full' | 'part';
export const employmentTypes: EmploymentType[] = ['full', 'part'];

export type JobData = {
    jobId?: string;
    companyName: string;
    jobRole: string;
    /* Missing on applications saved before employment type existed. */
    employmentType?: EmploymentType;
    jobArea: string;
    applicationLink: string;
    appliedDate: string;
    /* When the application was reported to Arbetsförmedlingen (ISO timestamp). Missing until then. */
    reportedAt?: string;
};

/* A stored application: `id` is the auto-incremented key IndexedDB assigns. */
export type StoredJob = JobData & { id: number };

interface JobDB extends DBSchema {
    jobsTable: {
        key: number;
        value: StoredJob;
        indexes: {
            jobId: string;
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: string;
        };
    };
}

function open() {
    return openDB<JobDB>(DATABASE_NAME, 1, {
        upgrade(db) {
            const store = db.createObjectStore(DATABASE_TABLE, {
                keyPath: 'id',
                autoIncrement: true,
            });
            store.createIndex('jobId', 'jobId', { unique: true });
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
 * Creates the database and its indexes if they don't exist yet.
 */
export async function createDatabase() {
    console.log(`[${getCurrentTime()}] (db.ts) opening connection to ${DATABASE_NAME}`);
    const db = await open();
    db.close();
}

/**
 * Adds jobs to the database in one transaction. Each job gets a new jobId if it has none.
 */
export async function addJobsToDatabase(jobs: JobData[]) {
    const db = await open();
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    for (const job of jobs) {
        /* `id` is left out so IndexedDB assigns the next key. */
        transaction.store.add({ ...job, jobId: job.jobId ?? crypto.randomUUID() } as StoredJob);
    }
    await transaction.done;
    db.close();
}

/**
 * Adds a job to the database.
 */
export async function addJobToDatabase(job: JobData) {
    await addJobsToDatabase([job]);
}

/**
 * Saves changes to a stored job.
 */
export async function updateJobInDatabase(job: StoredJob) {
    const db = await open();
    await db.put(DATABASE_TABLE, job);
    db.close();
}

/**
 * Marks a job as reported now, or clears the mark. Returns the updated job, or undefined if it's gone.
 */
export async function setJobReported(id: number, reported: boolean): Promise<StoredJob | undefined> {
    const db = await open();
    const transaction = db.transaction(DATABASE_TABLE, 'readwrite');
    const job = await transaction.store.get(id);
    if (job) {
        if (reported) job.reportedAt = new Date().toISOString();
        else delete job.reportedAt;
        await transaction.store.put(job);
    }
    await transaction.done;
    db.close();
    return job;
}

/**
 * Deletes a job by its key.
 */
export async function deleteJobFromDatabase(id: number) {
    const db = await open();
    await db.delete(DATABASE_TABLE, id);
    db.close();
}

/**
 * Deletes every job.
 */
export async function clearDatabase() {
    const db = await open();
    await db.clear(DATABASE_TABLE);
    db.close();
}

/**
 * Retrieves every job, oldest first.
 */
export async function getJobsFromDatabase(): Promise<StoredJob[]> {
    const db = await open();
    const jobs = await db.getAll(DATABASE_TABLE);
    db.close();
    return jobs;
}

/**
 * Returns the total number of jobs in the database.
 */
export async function getTotalJobs(): Promise<number> {
    const db = await open();
    const value = await db.count(DATABASE_TABLE);
    db.close();
    return value;
}
