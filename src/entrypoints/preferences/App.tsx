import { useEffect, useState, type DragEvent, type ReactNode } from 'react';
import { DatabaseZap, Download, FileSpreadsheet, FileText, FileUp, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app-shell';
import { useI18n } from '@/components/language';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { duplicateKey, importColumns, parseApplications } from '@/lib/import';
import { buildCsv, buildPdf, buildXlsx, downloadBlob, type ExportFormat } from '@/lib/export';
import { languagePreference, languages, localeOf, type LanguagePreference } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { addJobsToDatabase, clearDatabase, getJobsFromDatabase, getTotalJobs } from '@/utils/db';

/* A settings block: heading and hint on the left, controls on the right. */
function Section({ id, title, hint, danger, children }: { id: string; title: string; hint: string; danger?: boolean; children: ReactNode }) {
    return (
        <section
            aria-labelledby={id}
            className={cn(
                'flex flex-wrap gap-x-8 gap-y-5 rounded-2xl border bg-surface p-6',
                danger ? 'border-danger-border' : 'border-line',
            )}
        >
            <div className="flex flex-[1_1_220px] flex-col gap-1.5">
                <h2 id={id} className="font-serif text-[26px] font-normal">
                    {title}
                </h2>
                <p className="text-sm leading-normal text-text-3">{hint}</p>
            </div>
            <div className="flex min-w-0 flex-[2_1_360px] flex-col gap-4">{children}</div>
        </section>
    );
}

const radioCard =
    'flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring';

function LanguageSection() {
    const { t, preference } = useI18n();
    const choose = (value: LanguagePreference) => languagePreference.setValue(value);
    const options: { value: LanguagePreference; name: string; lang?: string; hint?: string; code?: string }[] = [
        ...languages.map(({ value, name }) => ({ value, name, lang: value, code: value.toUpperCase() })),
        { value: 'auto', name: t('language.auto'), hint: t('language.autoHint') },
    ];
    return (
        <Section id="pref-lang" title={t('language.label')} hint={t('preferences.languageHint')}>
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
                <legend className="sr-only">{t('language.label')}</legend>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            radioCard,
                            preference === option.value ? 'border-[1.5px] border-lapis bg-tint-lapis-2' : 'border-[#d5dde4] bg-surface',
                        )}
                    >
                        <input
                            type="radio"
                            name="language"
                            value={option.value}
                            checked={preference === option.value}
                            onChange={() => choose(option.value)}
                            className="m-0 size-[18px] accent-lapis focus-visible:outline-none"
                        />
                        <span className="flex grow flex-col" lang={option.lang}>
                            <span className="text-sm font-medium">{option.name}</span>
                            {option.hint && <span className="text-xs text-text-3">{option.hint}</span>}
                        </span>
                        {option.code && (
                            <span aria-hidden="true" className="font-mono text-xs text-text-3">
                                {option.code}
                            </span>
                        )}
                    </label>
                ))}
            </fieldset>
        </Section>
    );
}

function ImportSection({ onImported }: { onImported: () => void }) {
    const { t } = useI18n();
    const [file, setFile] = useState<File | null>(null);
    const [skipDuplicates, setSkipDuplicates] = useState(true);
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        setDragging(false);
        const dropped = event.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    }

    async function handleImport() {
        if (!file) return;
        setBusy(true);
        try {
            const { jobs, invalid } = parseApplications(file.name, await file.text());
            let toAdd = jobs;
            if (skipDuplicates) {
                const seen = new Set((await getJobsFromDatabase()).map(duplicateKey));
                toAdd = jobs.filter((job) => {
                    const key = duplicateKey(job);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
            }
            const skipped = invalid + jobs.length - toAdd.length;
            if (toAdd.length === 0) {
                const message = [t('preferences.importEmpty'), skipped > 0 && t('preferences.importSkipped', { count: skipped })]
                    .filter(Boolean)
                    .join(' ');
                setStatus(message);
                toast.error(message);
                return;
            }
            await addJobsToDatabase(toAdd);
            const message = [
                t('preferences.imported', { count: toAdd.length }),
                skipped > 0 && t('preferences.importSkipped', { count: skipped }),
            ]
                .filter(Boolean)
                .join(' ');
            setStatus(message);
            toast.success(message);
            setFile(null);
            onImported();
        } catch (error) {
            console.error(error);
            setStatus(t('preferences.importFailed'));
            toast.error(t('preferences.importFailed'));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Section id="pref-import" title={t('preferences.importTitle')} hint={t('preferences.importHint')}>
            <label
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-sky px-6 py-7 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                    dragging ? 'bg-tint-lapis-3' : 'bg-tint-lapis-2',
                )}
            >
                <span className="flex size-11 items-center justify-center rounded-xl border border-[#dceaf2] bg-surface text-lapis">
                    <FileUp aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <span className="text-sm font-medium">
                    {t('preferences.dropPrefix')} <span className="text-lapis underline">{t('preferences.chooseFile')}</span>
                </span>
                <span className="text-xs text-text-3">{file ? t('preferences.selectedFile', { name: file.name }) : t('preferences.fileTypes')}</span>
                <input
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    className="sr-only"
                    onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        e.target.value = '';
                    }}
                />
            </label>
            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-text-2">{t('preferences.expectedColumns')}</span>
                <div className="flex flex-wrap gap-1.5">
                    {importColumns.map((column) => (
                        <code key={column} className="rounded-md border border-line bg-surface px-2 py-[3px] font-mono text-xs text-text-2">
                            {column}
                        </code>
                    ))}
                </div>
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm">
                <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="m-0 size-[18px] accent-lapis"
                />
                {t('preferences.skipDuplicates')}
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="status" className="text-[13px] text-text-2">
                    {status}
                </p>
                <Button disabled={!file || busy} onClick={handleImport} className="px-5">
                    <Upload strokeWidth={2} /> {t('preferences.import')}
                </Button>
            </div>
        </Section>
    );
}

function ExportSection({ count }: { count: number }) {
    const { t, language } = useI18n();
    const [busy, setBusy] = useState<ExportFormat | null>(null);
    const formats: { format: ExportFormat; icon: LucideIcon }[] = [
        { format: 'csv', icon: FileText },
        { format: 'xlsx', icon: FileSpreadsheet },
        { format: 'pdf', icon: FileText },
    ];
    const names = { csv: t('preferences.exportCsv'), xlsx: t('preferences.exportXlsx'), pdf: t('preferences.exportPdf') };
    const hints = { csv: t('preferences.exportCsvHint'), xlsx: t('preferences.exportXlsxHint'), pdf: t('preferences.exportPdfHint') };

    async function handleExport(format: ExportFormat) {
        setBusy(format);
        try {
            const jobs = await getJobsFromDatabase();
            if (jobs.length === 0) {
                toast.error(t('preferences.exportEmpty'));
                return;
            }
            const today = new Date().toISOString().slice(0, 10);
            const date = new Date().toLocaleDateString(localeOf(language), { year: 'numeric', month: 'long', day: 'numeric' });
            const blob =
                format === 'csv'
                    ? buildCsv(jobs)
                    : format === 'xlsx'
                      ? await buildXlsx(jobs)
                      : await buildPdf(jobs, {
                            title: t('preferences.pdfTitle'),
                            subtitle: t('preferences.pdfSubtitle', { count: jobs.length, date }),
                            columns: {
                                companyName: t('column.companyName'),
                                jobRole: t('column.jobRole'),
                                employmentType: t('column.employmentType'),
                                jobArea: t('column.jobArea'),
                                applicationLink: t('column.applicationLink'),
                                appliedDate: t('column.appliedDate'),
                            },
                            employment: { full: t('employment.full'), part: t('employment.part') },
                            page: t('preferences.pdfPage'),
                        });
            downloadBlob(blob, `job-applications-${today}.${format}`);
            toast.success(t('preferences.exported', { count: jobs.length }));
        } catch (error) {
            console.error(error);
            toast.error(t('preferences.exportFailed'));
        } finally {
            setBusy(null);
        }
    }

    return (
        <Section id="pref-export" title={t('preferences.exportTitle')} hint={t('preferences.exportHint')}>
            <div className="flex flex-col gap-2.5">
                {formats.map(({ format, icon: Icon }) => (
                    <div key={format} className="flex items-center gap-3 rounded-xl border border-[#d5dde4] bg-surface px-4 py-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#dceaf2] bg-tint-lapis-2 text-lapis">
                            <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                        </span>
                        <span className="flex grow flex-col">
                            <span className="text-sm font-medium">{names[format]}</span>
                            <span className="text-xs text-text-3">{hints[format]}</span>
                        </span>
                        <Button variant="outline" disabled={count === 0 || busy !== null} onClick={() => handleExport(format)} className="px-4">
                            <Download strokeWidth={2} /> {names[format]}
                        </Button>
                    </div>
                ))}
            </div>
        </Section>
    );
}

function ClearSection({ count, onCleared }: { count: number; onCleared: () => void }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const [understood, setUnderstood] = useState(false);
    const stored = t('preferences.storedCount', { count });

    async function handleClear() {
        try {
            await clearDatabase();
            toast.success(t('preferences.cleared'));
            onCleared();
        } catch (error) {
            console.error(error);
            toast.error(t('preferences.clearFailed'));
        }
        setOpen(false);
    }

    const [before, after] = t('preferences.clearDialogText', { stored: '{stored}' }).split('{stored}');

    return (
        <Section id="pref-clear" title={t('preferences.clearTitle')} hint={t('preferences.clearHint')} danger>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tint-orange-2 text-danger">
                        <DatabaseZap aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{stored}</span>
                        <span className="text-xs text-text-3">{t('preferences.cannotUndo')}</span>
                    </div>
                </div>
                <Button
                    variant="soft-destructive"
                    className="border border-danger-border bg-surface px-[18px]"
                    disabled={count === 0}
                    onClick={() => {
                        setUnderstood(false);
                        setOpen(true);
                    }}
                >
                    <Trash2 strokeWidth={1.8} /> {t('preferences.clearButton')}
                </Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent role="alertdialog" className="max-w-[420px] gap-4 rounded-2xl p-[22px]">
                    <div className="flex items-start gap-3.5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tint-orange-2 text-danger">
                            <DatabaseZap aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                        </span>
                        <div className="flex flex-col gap-1">
                            <DialogTitle className="text-[26px]">{t('preferences.clearDialogTitle')}</DialogTitle>
                            <DialogDescription>
                                {before}
                                <strong className="font-semibold text-ink">{stored}</strong>
                                {after}
                            </DialogDescription>
                        </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#d5dde4] px-3.5 py-3 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={understood}
                            onChange={(e) => setUnderstood(e.target.checked)}
                            className="m-0 size-[18px] accent-danger"
                        />
                        {t('preferences.clearConfirm')}
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="px-[18px]">
                                {t('preferences.cancel')}
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" className="px-[18px]" disabled={!understood} onClick={handleClear}>
                            {t('preferences.clearButton')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Section>
    );
}

export default function App() {
    const { t } = useI18n();
    const [count, setCount] = useState(0);
    const loadCount = () => getTotalJobs().then(setCount);

    useEffect(() => {
        loadCount();
    }, []);

    return (
        <AppShell current="preferences" eyebrow={t('preferences.eyebrow')} title={t('preferences.title')} narrow>
            <LanguageSection />
            <ImportSection onImported={loadCount} />
            <ExportSection count={count} />
            <ClearSection count={count} onCleared={loadCount} />
        </AppShell>
    );
}
