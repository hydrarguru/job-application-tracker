import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, CircleAlert, CircleCheck, LoaderCircle, MousePointerClick } from 'lucide-react';

import { useI18n } from '@/components/language';
import { LogoMark } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { monthInSentence, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { employmentTypes, type StoredJob } from '@/utils/db';
import { sendMessage } from '@/utils/messages';
import { getCurrentDate } from '@/utils/utils';
import { fillForm, formSection, locations, reportedMonth, watchForSave, type Draft, type FieldKey, type FieldStatus, type FillResult, type Location } from './form';
import { usePlacement } from './position';

const PANEL_WIDTH = 320;

type Range = { min: string; max: string };

const locationLabels: Record<Location, MessageKey> = {
    SVERIGE: 'reporting.location.sweden',
    'Obestämd ort': 'reporting.location.unspecified',
    Utomlands: 'reporting.location.abroad',
};

/* In the order the website's form shows them. */
const resultFields: FieldKey[] = ['jobRole', 'companyName', 'employmentType', 'location', 'jobArea', 'answeredAd', 'appliedDate'];

/* The month the form accepts; the current month if the date field has no limits. */
function monthRange(form: HTMLFormElement): Range {
    const month = reportedMonth(form);
    if (month) return month;
    const current = getCurrentDate().slice(0, 7);
    return { min: `${current}-01`, max: `${current}-31` };
}

/*
 * J.A.T's panel for the "Sökta jobb" form: pick a saved application, check it, fill the form in.
 * It sits beside the section on bigger displays and inside it on smaller ones.
 */
export default function Panel({ form }: { form: HTMLFormElement }) {
    const { t, language } = useI18n();
    const [jobs, setJobs] = useState<StoredJob[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const panelRef = useRef<HTMLElement>(null);
    const section = useMemo(() => formSection(form), [form]);
    const placement = usePlacement(section, panelRef, PANEL_WIDTH);
    const beside = placement?.mode === 'beside';
    /* Open beside the section, collapsed inside it, until the person opens or closes it themselves. */
    const [collapsedChoice, setCollapsedChoice] = useState<boolean | null>(null);
    const collapsed = collapsedChoice ?? !beside;
    const range = useMemo(() => monthRange(form), [form]);

    async function load() {
        try {
            setJobs(await sendMessage({ type: 'getJobs' }));
            setFailed(false);
        } catch {
            setFailed(true);
        }
    }

    useEffect(() => {
        load();
    }, []);

    /* Applications from the reported month: not yet reported first, then by date. */
    const monthJobs = useMemo(
        () =>
            (jobs ?? [])
                .filter((job) => job.appliedDate >= range.min && job.appliedDate <= range.max)
                .sort(
                    (a, b) =>
                        Number(Boolean(a.reportedAt)) - Number(Boolean(b.reportedAt)) ||
                        a.appliedDate.localeCompare(b.appliedDate) ||
                        a.id - b.id,
                ),
        [jobs, range],
    );
    const reportedCount = monthJobs.filter((job) => job.reportedAt).length;
    const selected = jobs?.find((job) => job.id === selectedId);
    const [year, month] = range.min.split('-').map(Number);
    const monthLabel = `${monthInSentence(language, month - 1)} ${year}`;

    function renderBody() {
        if (failed) return <p className="m-0 p-4 text-danger-text">{t('reporting.loadFailed')}</p>;
        if (!jobs) return <p className="m-0 p-4 text-text-3">{t('reporting.loading')}</p>;
        if (selected) {
            return (
                <Preview
                    key={selected.id}
                    job={selected}
                    form={form}
                    range={range}
                    onBack={() => setSelectedId(null)}
                    onChanged={load}
                />
            );
        }
        return (
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-baseline justify-between gap-2">
                    <h3 className="m-0 text-sm font-semibold">{t('reporting.monthHeading', { month: monthLabel })}</h3>
                    {monthJobs.length > 0 && (
                        <span className="text-xs whitespace-nowrap text-text-3 tabular-nums">
                            {t('reporting.reportedCount', { reported: reportedCount, count: monthJobs.length })}
                        </span>
                    )}
                </div>
                {monthJobs.length === 0 ? (
                    <p className="m-0 text-text-3">{t('reporting.noJobs', { month: monthLabel })}</p>
                ) : (
                    <>
                        <p className="m-0 text-xs text-text-3">{t('reporting.pickHint')}</p>
                        <ul className="m-0 flex list-none flex-col gap-2 p-0">
                            {monthJobs.map((job) => (
                                <li key={job.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(job.id)}
                                        className={cn(
                                            'flex w-full cursor-pointer flex-col gap-1 rounded-[10px] border px-3 py-2.5 text-left',
                                            job.reportedAt
                                                ? 'border-line-soft bg-fill text-text-3 hover:border-line'
                                                : 'border-line bg-surface hover:border-lapis hover:bg-tint-lapis-2',
                                        )}
                                    >
                                        <span className="flex items-center justify-between gap-2">
                                            <span className={cn('truncate font-medium', !job.reportedAt && 'text-ink')}>
                                                {job.companyName}
                                            </span>
                                            <span className="shrink-0 text-xs tabular-nums">{job.appliedDate}</span>
                                        </span>
                                        <span className="flex items-center justify-between gap-2 text-xs">
                                            <span className="truncate text-text-2">
                                                {job.jobRole} · {job.jobArea}
                                            </span>
                                            {job.reportedAt && <ReportedBadge />}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        );
    }

    return (
        <section
            ref={panelRef}
            aria-labelledby="jat-reporting-heading"
            style={beside ? placement.style : undefined}
            className={cn(
                'flex flex-col overflow-hidden rounded-xl border border-line bg-surface font-sans text-sm text-ink antialiased',
                !beside && 'mb-8',
                /* Hidden for the first frame, until it is known where the panel goes. */
                !placement && 'invisible',
            )}
        >
            <header className="flex shrink-0 items-center gap-2.5 bg-ink px-4 py-3 text-white">
                <LogoMark className="size-7" />
                <div className="flex grow flex-col gap-px">
                    <h2 id="jat-reporting-heading" className="m-0 text-base leading-none font-semibold">
                        {t('appShortName')}
                    </h2>
                    <span className="text-[11px] tracking-[0.02em] text-on-ink">{t('reporting.subtitle')}</span>
                </div>
                <button
                    type="button"
                    aria-expanded={!collapsed}
                    aria-controls="jat-reporting-body"
                    onClick={() => setCollapsedChoice(!collapsed)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-on-ink hover:bg-white/10 hover:text-white"
                >
                    {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                    <span className="sr-only">{collapsed ? t('reporting.expand') : t('reporting.collapse')}</span>
                </button>
            </header>
            <div id="jat-reporting-body" hidden={collapsed}>
                {renderBody()}
            </div>
        </section>
    );
}

function ReportedBadge() {
    const { t } = useI18n();
    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tint-olive px-2 py-0.5 text-[11px] font-medium text-olive-text">
            <Check aria-hidden="true" className="size-3" strokeWidth={2.5} />
            {t('reporting.reported')}
        </span>
    );
}

/* The application as it will be filled in. Changes here only apply to this report, not the saved application. */
function Preview({
    job,
    form,
    range,
    onBack,
    onChanged,
}: {
    job: StoredJob;
    form: HTMLFormElement;
    range: Range;
    onBack: () => void;
    onChanged: () => void;
}) {
    const { t } = useI18n();
    const [draft, setDraft] = useState<Draft>({
        jobRole: job.jobRole,
        companyName: job.companyName,
        employmentType: job.employmentType,
        location: 'SVERIGE',
        jobArea: job.jobArea,
        answeredAd: true,
        appliedDate: job.appliedDate,
    });
    const [filling, setFilling] = useState(false);
    const [result, setResult] = useState<FillResult | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    /* The result sits below the button, often outside the panel's visible part. */
    useEffect(() => {
        if (result) resultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [result]);

    const dateOutside = draft.appliedDate < range.min || draft.appliedDate > range.max;
    const waiting = resultFields.filter((field) => result?.fields[field] === 'choose');

    async function fill() {
        setFilling(true);
        try {
            setResult(await fillForm(form, draft));
            /* Once the person saves the website's form, the application counts as reported. */
            watchForSave(form, async () => {
                await sendMessage({ type: 'setReported', id: job.id, reported: true });
                onChanged();
            });
        } finally {
            setFilling(false);
        }
    }

    async function toggleReported() {
        await sendMessage({ type: 'setReported', id: job.id, reported: !job.reportedAt });
        onChanged();
    }

    function textField(name: 'jobRole' | 'companyName' | 'jobArea', disabled = false) {
        return (
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`jat-${name}`}>{t(`reporting.field.${name}`)}</Label>
                <Input
                    id={`jat-${name}`}
                    value={draft[name]}
                    disabled={disabled}
                    onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
                    className="h-9"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3.5 p-4">
            <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
                    <ArrowLeft strokeWidth={1.8} /> {t('reporting.back')}
                </Button>
                {job.reportedAt && <ReportedBadge />}
            </div>

            {textField('jobRole')}
            {textField('companyName')}
            <Choice
                legend={t('reporting.field.employmentType')}
                name="jat-employment"
                value={draft.employmentType}
                options={employmentTypes.map((type) => ({ value: type, label: t(`employment.${type}`) }))}
                onChange={(employmentType) => setDraft({ ...draft, employmentType })}
            />
            {!draft.employmentType && <Warning>{t('reporting.employmentMissing')}</Warning>}
            <Choice
                legend={t('reporting.field.location')}
                name="jat-location"
                value={draft.location}
                options={locations.map((location) => ({ value: location, label: t(locationLabels[location]) }))}
                onChange={(location) => setDraft({ ...draft, location })}
            />
            {textField('jobArea', draft.location !== 'SVERIGE')}
            <Choice
                legend={t('reporting.field.answeredAd')}
                name="jat-answered-ad"
                value={draft.answeredAd ? 'yes' : 'no'}
                options={[
                    { value: 'yes', label: t('reporting.yes') },
                    { value: 'no', label: t('reporting.no') },
                ]}
                onChange={(answer) => setDraft({ ...draft, answeredAd: answer === 'yes' })}
            />
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="jat-appliedDate">{t('reporting.field.appliedDate')}</Label>
                <Input
                    id="jat-appliedDate"
                    type="date"
                    min={range.min}
                    max={range.max}
                    value={draft.appliedDate}
                    aria-invalid={dateOutside || undefined}
                    onChange={(e) => setDraft({ ...draft, appliedDate: e.target.value })}
                    className="h-9"
                />
            </div>
            {dateOutside && <Warning>{t('reporting.dateOutside', range)}</Warning>}

            <Button onClick={fill} disabled={filling}>
                {filling ? <LoaderCircle className="animate-spin" /> : <MousePointerClick strokeWidth={1.8} />}
                {filling ? t('reporting.filling') : result ? t('reporting.fillAgain') : t('reporting.fill')}
            </Button>

            {result && (
                <div ref={resultRef} role="status" className="flex flex-col gap-2.5 rounded-[10px] bg-fill p-3">
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-xs">
                        {resultFields
                            .filter((field) => result.fields[field])
                            .map((field) => {
                                const picked = field === 'jobRole' || field === 'jobArea' ? result.picked[field] : undefined;
                                return (
                                    <li key={field} className="flex flex-col gap-0.5">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="text-text-2">{t(`reporting.field.${field}`)}</span>
                                            <StatusLabel status={result.fields[field]!} />
                                        </span>
                                        {/* A close but not exact match: show what was picked so it can be checked. */}
                                        {picked && <span className="text-text-3">{t('reporting.picked', { name: picked })}</span>}
                                    </li>
                                );
                            })}
                    </ul>
                    {waiting.length > 0 && (
                        <Warning>
                            {t('reporting.chooseHint', {
                                fields: waiting.map((field) => t(`reporting.field.${field}`)).join(', '),
                            })}
                        </Warning>
                    )}
                    <p className="m-0 text-xs text-text-2">{t('reporting.reviewHint')}</p>
                </div>
            )}

            <Button variant="outline" size="sm" onClick={toggleReported}>
                {job.reportedAt ? t('reporting.markUnreported') : t('reporting.markReported')}
            </Button>
        </div>
    );
}

function StatusLabel({ status }: { status: FieldStatus }) {
    const { t } = useI18n();
    const done = status === 'filled';
    return (
        <span className={cn('inline-flex items-center gap-1 font-medium', done ? 'text-olive-text' : 'text-danger-text')}>
            {done ? <CircleCheck className="size-3.5" strokeWidth={2} /> : <CircleAlert className="size-3.5" strokeWidth={2} />}
            {t(`reporting.status.${status}`)}
        </span>
    );
}

function Warning({ children }: { children: React.ReactNode }) {
    return (
        <p className="m-0 flex gap-1.5 rounded-lg bg-tint-saffron px-2.5 py-2 text-xs text-[#6b4604]">
            <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" strokeWidth={2} />
            <span>{children}</span>
        </p>
    );
}

/* A compact radio group, styled like the popup's employment type cards. */
function Choice<T extends string>({
    legend,
    name,
    value,
    options,
    onChange,
}: {
    legend: string;
    name: string;
    value: T | undefined;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
            <legend className="mb-1.5 p-0 text-xs font-medium text-text-2">{legend}</legend>
            <div className="flex flex-wrap gap-1.5">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                            value === option.value ? 'border-[1.5px] border-lapis bg-tint-lapis-2' : 'border-input bg-surface',
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            className="m-0 size-3.5 accent-lapis focus-visible:outline-none"
                        />
                        {option.label}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
