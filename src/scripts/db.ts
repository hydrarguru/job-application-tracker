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

export function addJobToDatabase(month: string, job: JobData) {
    openDB('JAT-DB', 1).then((db) => {
        const transaction = db.transaction(`${month}`, 'readwrite');
        const store = transaction.objectStore(`${month}`);
        store.add(job);
    });
}
