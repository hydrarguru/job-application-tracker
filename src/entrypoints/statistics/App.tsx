import { Fragment, useEffect, useMemo, useState } from 'react';

import { AppShell, Card } from '@/components/app-shell';
import { useI18n } from '@/components/language';
import { localeOf, monthInSentence, monthName, shortMonthName } from '@/lib/i18n';
import { countPerMonth, rankValues, yearsWithJobs } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { getJobsFromDatabase, type StoredJob } from '@/utils/db';
import { getCurrentDate } from '@/utils/utils';

const CHART_HEIGHT = 220;

export default function App() {
    const { t, language } = useI18n();
    const [jobs, setJobs] = useState<StoredJob[]>([]);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const [year, setYear] = useState(currentYear);

    useEffect(() => {
        getJobsFromDatabase().then(setJobs);
    }, []);

    const years = useMemo(() => yearsWithJobs(jobs, currentYear), [jobs, currentYear]);
    const perMonth = useMemo(() => countPerMonth(jobs, year), [jobs, year]);
    const yearJobs = useMemo(() => jobs.filter((job) => job.appliedDate.startsWith(`${year}-`)), [jobs, year]);
    const yearTotal = yearJobs.length;
    const max = Math.max(1, ...perMonth);
    const busiest = perMonth.indexOf(Math.max(...perMonth));
    /* The current year averages over the months that have started, earlier years over all twelve. */
    const monthsElapsed = year === currentYear ? currentMonth + 1 : 12;
    const average = yearTotal / monthsElapsed;
    const number = new Intl.NumberFormat(localeOf(language), { maximumFractionDigits: 1 });
    const today = getCurrentDate();
    const thisMonth = jobs.filter((job) => job.appliedDate.startsWith(today.slice(0, 7))).length;
    const appliedToday = jobs.filter((job) => job.appliedDate === today).length;

    /* Months still ahead in the current year are drawn as grey stubs without a count. */
    const isFuture = (month: number) => year > currentYear || (year === currentYear && month > currentMonth);
    const isCurrent = (month: number) => year === currentYear && month === currentMonth;

    const summary =
        yearTotal > 0
            ? t('charts.summaryBusiest', {
                  year,
                  total: yearTotal,
                  month: monthInSentence(language, busiest),
                  count: perMonth[busiest],
              })
            : t('charts.summary', { year, total: 0 });

    const groups = [
        { title: t('charts.uniqueCompanies'), color: 'bg-lapis', items: rankValues(yearJobs, 'companyName') },
        { title: t('charts.uniqueRoles'), color: 'bg-olive', items: rankValues(yearJobs, 'jobRole') },
        { title: t('charts.uniqueLocations'), color: 'bg-sky', items: rankValues(yearJobs, 'jobArea') },
    ];

    return (
        <AppShell
            current="statistics"
            eyebrow={t('charts.eyebrow')}
            title={t('nav.statistics')}
            actions={
                <div role="group" aria-label={t('charts.year')} className="flex gap-1 rounded-xl border border-line bg-surface p-1">
                    {years.map((option) => (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={option === year}
                            onClick={() => setYear(option)}
                            className={cn(
                                'h-9 cursor-pointer rounded-[9px] px-3.5 font-mono text-[13px]',
                                option === year ? 'bg-ink text-white' : 'text-text-3 hover:bg-fill hover:text-ink',
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            }
        >
            <div className="flex flex-wrap gap-4">
                <Card aria-labelledby="per-month" className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex flex-col gap-1">
                            <h2 id="per-month" className="font-serif text-[28px] font-normal">
                                {t('charts.jobsPerMonth')}
                            </h2>
                            <span className="text-[13px] text-text-3">
                                {t('charts.yearTotal', { year })} <strong className="font-semibold text-ink">{yearTotal}</strong>
                            </span>
                        </div>
                        <div aria-hidden="true" className="flex gap-4 text-xs text-text-3">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-[3px] bg-lapis" />
                                {t('charts.pastMonths')}
                            </span>
                            {year === currentYear && (
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-[3px] bg-saffron" />
                                    {t('charts.thisMonth')}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* The bars are a picture of the table below, which carries the same numbers. */}
                    <figure className="m-0 flex flex-col gap-2">
                        <div role="img" aria-label={summary} className="flex flex-col gap-2">
                            <div
                                className="relative flex h-[260px] items-end gap-1.5 border-b border-[#d5dde4] sm:gap-2.5"
                                style={{ backgroundImage: 'linear-gradient(#eef1f4 1px, transparent 1px)', backgroundSize: '100% 65px' }}
                            >
                                {perMonth.map((count, month) => (
                                    <div key={month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                                        {!isFuture(month) && <span className="font-mono text-[11px] text-text-2">{count}</span>}
                                        <div
                                            className={cn(
                                                'w-full max-w-11 rounded-t-lg rounded-b-[3px]',
                                                isFuture(month) ? 'bg-line' : isCurrent(month) ? 'bg-saffron' : 'bg-lapis',
                                            )}
                                            style={{
                                                height: isFuture(month) || count === 0 ? 4 : Math.max(6, Math.round((count / max) * CHART_HEIGHT)),
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-1.5 sm:gap-2.5">
                                {perMonth.map((_, month) => (
                                    <span key={month} className="min-w-0 flex-1 truncate text-center text-xs text-text-3">
                                        {shortMonthName(language, month)}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <details className="mt-2 text-sm">
                            <summary className="w-fit cursor-pointer rounded-md text-[13px] font-medium text-lapis">
                                {t('charts.showTable')}
                            </summary>
                            <table className="mt-3 w-full max-w-sm border-collapse text-sm">
                                <caption className="sr-only">
                                    {t('charts.jobsPerMonth')} {year}
                                </caption>
                                <thead>
                                    <tr className="border-b border-line text-left text-xs text-text-3 uppercase">
                                        <th scope="col" className="py-1.5 font-medium">{t('charts.month')}</th>
                                        <th scope="col" className="py-1.5 text-right font-medium">{t('charts.applications')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perMonth.map((count, month) => (
                                        <tr key={month} className="border-b border-line-soft">
                                            <th scope="row" className="py-1.5 text-left font-normal">{monthName(language, month)}</th>
                                            <td className="py-1.5 text-right font-mono">{count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </details>
                    </figure>
                </Card>

                <section
                    aria-labelledby="this-month"
                    className="flex flex-[1_1_260px] flex-col gap-4 rounded-2xl bg-ink p-6 text-white"
                >
                    <h2 id="this-month" className="text-sm font-medium text-on-ink">
                        {t('charts.jobsThisMonth', { month: monthInSentence(language, currentMonth) })}
                    </h2>
                    <p className="font-serif text-[96px] leading-[0.9]">{thisMonth}</p>
                    <p className="text-sm leading-normal text-[#c9d7e0]">
                        {yearTotal > 0
                            ? /* The month name is highlighted, so it is put in after translating. */
                              t('charts.busiest', { year, month: '{month}', count: perMonth[busiest] })
                                  .split('{month}')
                                  .map((part, index) => (
                                      <Fragment key={index}>
                                          {index > 0 && (
                                              <span className="font-medium text-saffron">{monthInSentence(language, busiest)}</span>
                                          )}
                                          {part}
                                      </Fragment>
                                  ))
                            : t('charts.noneInYear', { year })}
                    </p>
                    <dl className="mt-auto flex flex-col gap-2.5 border-t border-white/12 pt-4 text-[13px]">
                        <div className="flex justify-between gap-3">
                            <dt className="text-on-ink">{t('charts.monthlyAverage', { year })}</dt>
                            <dd className="font-mono">{number.format(average)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-on-ink">{t('charts.appliedToday')}</dt>
                            <dd className="font-mono">{appliedToday}</dd>
                        </div>
                    </dl>
                </section>
            </div>

            <div className="flex flex-wrap gap-4">
                {groups.map((group) => {
                    const top = group.items.slice(0, 5);
                    const most = top[0]?.count ?? 1;
                    return (
                        <Card key={group.title} aria-label={group.title} className="flex flex-[1_1_300px] flex-col gap-[18px]">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-sm font-medium text-text-2">{group.title}</h2>
                                    <p className="font-serif text-5xl leading-none">{group.items.length}</p>
                                </div>
                                <span aria-hidden="true" className={cn('mt-1.5 size-2.5 rounded-full', group.color)} />
                            </div>
                            {top.length > 0 ? (
                                <ol aria-label={t('charts.topFive')} className="m-0 flex list-none flex-col gap-3 p-0">
                                    {top.map((item) => (
                                        <li key={item.name} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between gap-3 text-[13px]">
                                                <span className="truncate">{item.name}</span>
                                                <span className="font-mono text-text-3">{item.count}</span>
                                            </div>
                                            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                                                <div
                                                    className={cn('h-1.5 rounded-full', group.color)}
                                                    style={{ width: `${Math.round((item.count / most) * 100)}%` }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-[13px] text-text-3">{t('charts.nothingYet')}</p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </AppShell>
    );
}
