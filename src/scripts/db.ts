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

export function createDatabase() {
    openDB('JAT-DB', 1, {
        upgrade(db) {
            for (const month of months) {
                db.createObjectStore(`${month}-jobs`, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            }
        },
    });
}
