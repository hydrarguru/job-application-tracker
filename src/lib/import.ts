import { employmentTypes, type EmploymentType, type JobData } from '@/utils/db';

export const importColumns = ['companyName', 'jobRole', 'employmentType', 'jobArea', 'applicationLink', 'appliedDate'] as const;
const required = ['companyName', 'jobRole', 'jobArea', 'applicationLink', 'appliedDate'] as const;

/* Splits CSV text into rows of cells. Handles quoted cells with commas, quotes and line breaks. */
function parseCsv(text: string): string[][] {
    const delimiter = text.split(/\r?\n/, 1)[0].includes(';') && !text.split(/\r?\n/, 1)[0].includes(',') ? ';' : ',';
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoted) {
            if (char === '"' && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (char === '"') {
                quoted = false;
            } else {
                cell += char;
            }
        } else if (char === '"') {
            quoted = true;
        } else if (char === delimiter) {
            row.push(cell);
            cell = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && text[i + 1] === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }
    if (cell !== '' || row.length) {
        row.push(cell);
        rows.push(row);
    }
    return rows.filter((cells) => cells.some((value) => value.trim() !== ''));
}

function toRecords(fileName: string, text: string): Record<string, unknown>[] {
    const trimmed = text.replace(/^﻿/, '').trim();
    if (fileName.toLowerCase().endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const data = JSON.parse(trimmed);
        const list = Array.isArray(data) ? data : [data];
        return list.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
    }
    const [header, ...rows] = parseCsv(trimmed);
    if (!header) return [];
    const names = header.map((name) => name.trim());
    return rows.map((cells) => Object.fromEntries(names.map((name, index) => [name, cells[index] ?? ''])));
}

/* Accepts "full"/"part" and the English and Swedish words for them. */
function toEmploymentType(value: unknown): EmploymentType | undefined {
    const text = String(value ?? '').trim().toLowerCase().replace(/[\s-]/g, '');
    if (employmentTypes.includes(text as EmploymentType)) return text as EmploymentType;
    if (['fulltime', 'heltid'].includes(text)) return 'full';
    if (['parttime', 'deltid'].includes(text)) return 'part';
    return undefined;
}

/**
 * Reads applications from a CSV or JSON file's text. Rows missing a required field, or with a
 * date that isn't YYYY-MM-DD, are counted as invalid. Throws when the text can't be parsed.
 */
export function parseApplications(fileName: string, text: string): { jobs: JobData[]; invalid: number } {
    const jobs: JobData[] = [];
    let invalid = 0;
    for (const record of toRecords(fileName, text)) {
        const value = (key: string) => String(record[key] ?? '').trim();
        if (required.some((key) => value(key) === '') || !/^\d{4}-\d{2}-\d{2}$/.test(value('appliedDate'))) {
            invalid++;
            continue;
        }
        const employmentType = toEmploymentType(record.employmentType);
        jobs.push({
            companyName: value('companyName'),
            jobRole: value('jobRole'),
            ...(employmentType && { employmentType }),
            jobArea: value('jobArea'),
            applicationLink: value('applicationLink'),
            appliedDate: value('appliedDate'),
        });
    }
    return { jobs, invalid };
}

/* Same company, position and date, ignoring case and surrounding spaces. */
export function duplicateKey(job: JobData) {
    return [job.companyName, job.jobRole, job.appliedDate].map((value) => value.trim().toLowerCase()).join('\u0000');
}
