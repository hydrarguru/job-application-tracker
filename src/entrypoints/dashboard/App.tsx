import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Check, ExternalLink, Pencil, Search, Trash2 } from 'lucide-react';

import { AppShell, Card } from '@/components/app-shell';
import { useI18n } from '@/components/language';
import { Button } from '@/components/ui/button';
import { localeOf, monthInSentence } from '@/lib/i18n';
import { getJobsFromDatabase, setJobReported, type StoredJob } from '@/utils/db';
import { getCurrentDate } from '@/utils/utils';
import { DeleteDialog, EditDialog } from './dialogs';

const PAGE_SIZE = 10;

/* Initial badge colours, picked from the company name so a company keeps its colour. */
const badgeTints = [
    'bg-tint-lapis-3 text-lapis-deep',
    'bg-tint-saffron text-[#8a5a06]',
    'bg-tint-olive text-[#4a5c30]',
    'bg-tint-orange-2 text-danger-text',
];
function badgeTint(name: string) {
    let hash = 0;
    for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return badgeTints[Math.abs(hash) % badgeTints.length];
}

/* "2026-10-14 11:33" in local time, in every language, to match the applied date column. */
function formatReportedAt(iso: string) {
    const date = new Date(iso);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* Only http(s) links are rendered as links, so an imported value can't run script. */
function safeUrl(link: string) {
    try {
        const url = new URL(link);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
    } catch {
        return undefined;
    }
}

export default function App() {
    const { t, language } = useI18n();
    const [jobs, setJobs] = useState<StoredJob[] | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [editing, setEditing] = useState<StoredJob | null>(null);
    const [deleting, setDeleting] = useState<StoredJob | null>(null);

    async function load() {
        setJobs(await getJobsFromDatabase());
    }

    useEffect(() => {
        load();
    }, []);

    async function toggleReported(job: StoredJob) {
        await setJobReported(job.id, !job.reportedAt);
        await load();
    }

    const now = new Date();
    const today = getCurrentDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const longDate = now.toLocaleDateString(localeOf(language), { weekday: 'long', day: 'numeric', month: 'long' });
    const prettyDate = longDate.charAt(0).toUpperCase() + longDate.slice(1);

    const totals = useMemo(() => {
        const all = jobs ?? [];
        return {
            all: all.length,
            month: all.filter((job) => job.appliedDate.startsWith(today.slice(0, 7))).length,
            today: all.filter((job) => job.appliedDate === today).length,
        };
    }, [jobs, today]);

    /* Newest first; applications saved on the same day keep the order they were added in. */
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return (jobs ?? [])
            .filter(
                (job) =>
                    !needle ||
                    [job.companyName, job.jobRole, job.jobArea].some((value) => value.toLowerCase().includes(needle)),
            )
            .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate) || b.id - a.id);
    }, [jobs, query]);

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pages - 1);
    const rows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const headCell = 'px-4 py-2.5 text-left text-xs font-medium tracking-[0.04em] whitespace-nowrap text-text-3 uppercase';

    return (
        <AppShell current="overview" eyebrow={prettyDate} title={t('nav.overview')}>
            <section aria-label={t('dashboard.totals')} className="flex flex-wrap gap-4">
                <div className="flex min-h-[168px] flex-[1_1_240px] flex-col gap-[18px] rounded-2xl bg-lapis p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-[#dceaf2]">{t('dashboard.totalJobs')}</h2>
                        <BriefcaseBusiness aria-hidden="true" className="size-5 text-sky" strokeWidth={1.8} />
                    </div>
                    <p className="mt-auto font-serif text-[72px] leading-[0.9]">{totals.all}</p>
                    <span className="text-[13px] text-[#dceaf2]">{t('dashboard.allTime')}</span>
                </div>
                <Card className="flex min-h-[168px] flex-[1_1_240px] flex-col gap-[18px]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-text-2">
                            {t('dashboard.jobsInMonth', { month: monthInSentence(language, now.getMonth()) })}
                        </h2>
                        <span aria-hidden="true" className="size-2.5 rounded-full bg-sky" />
                    </div>
                    <p className="mt-auto font-serif text-[72px] leading-[0.9]">{totals.month}</p>
                    <div className="flex items-center gap-2.5">
                        <div aria-hidden="true" className="h-1.5 grow overflow-hidden rounded-full bg-[#e7f1f7]">
                            <div
                                className="h-1.5 rounded-full bg-sky"
                                style={{ width: `${Math.round((now.getDate() / daysInMonth) * 100)}%` }}
                            />
                        </div>
                        <span className="font-mono text-xs text-text-3">
                            {t('dashboard.dayOfMonth', { day: now.getDate(), days: daysInMonth })}
                        </span>
                    </div>
                </Card>
                <Card className="flex min-h-[168px] flex-[1_1_240px] flex-col gap-[18px]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-text-2">{t('dashboard.jobsToday')}</h2>
                        <span aria-hidden="true" className="size-2.5 rounded-full bg-olive" />
                    </div>
                    <p className="mt-auto font-serif text-[72px] leading-[0.9]">{totals.today}</p>
                    <span className="text-[13px] font-medium text-olive-text">{prettyDate}</span>
                </Card>
            </section>

            <Card aria-labelledby="apps-heading" className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
                    <div className="flex items-baseline gap-2.5">
                        <h2 id="apps-heading" className="font-serif text-[28px] font-normal">
                            {t('dashboard.applications')}
                        </h2>
                        {jobs && (
                            <span className="font-mono text-xs text-text-3">
                                {t('dashboard.shownOf', { shown: filtered.length, total: jobs.length })}
                            </span>
                        )}
                    </div>
                    <label className="flex h-10 flex-[0_1_300px] items-center gap-2 rounded-[10px] border border-input bg-fill px-3 text-text-3 has-[:focus-visible]:border-lapis has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
                        <Search aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />
                        <span className="sr-only">{t('dashboard.search')}</span>
                        <input
                            type="search"
                            value={query}
                            placeholder={t('dashboard.searchPlaceholder')}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(0);
                            }}
                            className="min-w-0 grow bg-transparent text-sm text-ink placeholder:text-text-3 focus-visible:outline-none"
                        />
                    </label>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-fill">
                                <th scope="col" className={`${headCell} pl-6`}>{t('column.companyName')}</th>
                                <th scope="col" className={headCell}>{t('column.jobRole')}</th>
                                <th scope="col" className={headCell}>{t('column.employmentType')}</th>
                                <th scope="col" className={headCell}>{t('column.jobArea')}</th>
                                <th scope="col" className={headCell}>{t('column.appliedDate')}</th>
                                <th scope="col" className={headCell}>{t('column.applicationLink')}</th>
                                <th scope="col" className={headCell}>{t('column.reported')}</th>
                                <th scope="col" className={`${headCell} pr-6 text-right`}>{t('column.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((job) => {
                                const url = safeUrl(job.applicationLink);
                                return (
                                    <tr key={job.id} className="border-t border-line-soft">
                                        <td className="py-2 pr-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold ${badgeTint(job.companyName)}`}
                                                >
                                                    {job.companyName.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="font-medium">{job.companyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-text-2">{job.jobRole}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-text-2">
                                            {job.employmentType ? (
                                                t(`employment.${job.employmentType}`)
                                            ) : (
                                                <>
                                                    <span aria-hidden="true">–</span>
                                                    <span className="sr-only">{t('notSet')}</span>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-text-2">{job.jobArea}</td>
                                        <td className="px-4 py-2 font-mono text-[13px] whitespace-nowrap text-text-2">
                                            {job.appliedDate}
                                        </td>
                                        <td className="px-4 py-2">
                                            {url ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium no-underline hover:underline"
                                                >
                                                    {t('dashboard.posting')}
                                                    <span className="sr-only">
                                                        {' '}
                                                        {t('dashboard.postingFor', { entry: `${job.companyName}, ${job.jobRole}` })}
                                                    </span>
                                                    <ExternalLink aria-hidden="true" className="size-[13px]" strokeWidth={2} />
                                                </a>
                                            ) : (
                                                <span className="text-[13px] text-text-3">{job.applicationLink}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {/* A toggle, so a report the extension missed can be marked by hand. */}
                                            <button
                                                type="button"
                                                aria-pressed={Boolean(job.reportedAt)}
                                                aria-label={t('dashboard.reportedToggle', { entry: `${job.companyName}, ${job.jobRole}` })}
                                                onClick={() => toggleReported(job)}
                                                className={
                                                    job.reportedAt
                                                        ? 'inline-flex cursor-pointer items-center gap-1 rounded-full bg-tint-olive px-2.5 py-1 text-xs font-medium text-olive-text hover:bg-[#dfe6d3]'
                                                        : 'inline-flex cursor-pointer items-center rounded-full border border-dashed border-input px-2.5 py-1 text-xs text-text-3 hover:border-lapis hover:text-lapis-deep'
                                                }
                                            >
                                                {job.reportedAt ? (
                                                    <>
                                                        <Check aria-hidden="true" className="size-3" strokeWidth={2.5} />
                                                        {formatReportedAt(job.reportedAt)}
                                                    </>
                                                ) : (
                                                    t('dashboard.notReported')
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-1 pr-6 pl-4">
                                            <div className="flex justify-end gap-1.5">
                                                <Button variant="soft" size="sm" onClick={() => setEditing(job)}>
                                                    <Pencil strokeWidth={1.8} />
                                                    {t('dashboard.edit')}
                                                    <span className="sr-only">
                                                        {' '}
                                                        {job.companyName}, {job.jobRole}
                                                    </span>
                                                </Button>
                                                <Button variant="soft-destructive" size="sm" onClick={() => setDeleting(job)}>
                                                    <Trash2 strokeWidth={1.8} />
                                                    {t('dashboard.delete')}
                                                    <span className="sr-only">
                                                        {' '}
                                                        {job.companyName}, {job.jobRole}
                                                    </span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {jobs && rows.length === 0 && (
                        <p className="border-t border-line-soft px-6 py-10 text-center text-sm text-text-3">
                            {query.trim() ? t('dashboard.noMatches', { query: query.trim() }) : t('dashboard.empty')}
                        </p>
                    )}
                </div>
                {filtered.length > PAGE_SIZE && (
                    <nav
                        aria-label={t('dashboard.pages')}
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-3.5 text-[13px] text-text-3"
                    >
                        <span aria-live="polite">{t('dashboard.pageStatus', { page: currentPage + 1, pages })}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 0}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                {t('dashboard.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= pages - 1}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                {t('dashboard.next')}
                            </Button>
                        </div>
                    </nav>
                )}
            </Card>

            <EditDialog job={editing} onClose={() => setEditing(null)} onSaved={load} />
            <DeleteDialog job={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
        </AppShell>
    );
}
