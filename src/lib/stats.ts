import type { JobData } from '@/utils/db';

/* Applications per month (index 0-11) in `year`. */
export function countPerMonth(jobs: JobData[], year: number): number[] {
    const counts = Array<number>(12).fill(0);
    for (const job of jobs) {
        const [jobYear, month] = job.appliedDate.split('-').map(Number);
        if (jobYear === year && month >= 1 && month <= 12) counts[month - 1]++;
    }
    return counts;
}

/* Years that have applications, plus the current one, newest last. */
export function yearsWithJobs(jobs: JobData[], currentYear: number): number[] {
    const years = new Set([currentYear]);
    for (const job of jobs) {
        const year = Number(job.appliedDate.slice(0, 4));
        if (year > 1900) years.add(year);
    }
    return [...years].sort((a, b) => a - b);
}

/* Distinct values of `field` with how often each occurs, most frequent first. */
export function rankValues(jobs: JobData[], field: 'companyName' | 'jobRole' | 'jobArea') {
    const counts = new Map<string, number>();
    for (const job of jobs) {
        const value = job[field].trim();
        if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
