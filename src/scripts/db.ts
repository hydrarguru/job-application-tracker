import { openDB, DBSchema } from 'idb';

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

export interface JobDB extends DBSchema {
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
    /*
    january: {
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

    february: {
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

    march: {
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

    april: {
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

    may: {
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

    june: {
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

    july: {
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

    august: {
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

    september: {
        key: number;
        value: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: Date;
        };
        indexes: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: Date;
        };
    };

    october: {
        key: number;
        value: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: Date;
        };
        indexes: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: string;
            appliedDate: Date;
        };
    };

    november: {
        key: number;
        value: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: Date;
            appliedDate: Date;
        };
        indexes: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: Date;
            appliedDate: Date;
        };
    };

    december: {
        key: number;
        value: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: Date;
            appliedDate: Date;
        };
        indexes: {
            companyName: string;
            jobRole: string;
            jobArea: string;
            applicationLink: Date;
            appliedDate: Date;
        };
    };
    */
}

type JobData = {
    companyName: string;
    jobRole: string;
    jobArea: string;
    applicationLink: string;
    appliedDate: string;
};

export async function createDatabase() {
    await openDB('JAT-DB', 1, {
        upgrade(db) {
            for (const month of months) {
                const store = db.createObjectStore(`${month}`, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('companyName', 'companyName');
                store.createIndex('jobRole', 'jobRole');
                store.createIndex('jobArea', 'jobArea');
                store.createIndex('applicationLink', 'applicationLink');
                store.createIndex('appliedDate', 'appliedDate');
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
