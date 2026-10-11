import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LayoutDashboard, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { EmploymentTypeField } from '@/components/employment-type-field';
import { LanguageSelect, useI18n } from '@/components/language';
import { LogoMark } from '@/components/logo';
import type { MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { addJobToDatabase, countJobsWithDatePrefix, type JobData } from '@/utils/db';
import { getCurrentDate } from '@/utils/utils';

type FormValues = Required<Omit<JobData, 'jobId'>>;
type TextField = Exclude<keyof FormValues, 'employmentType'>;

const emptyForm = (): FormValues => ({
    companyName: '',
    jobRole: '',
    employmentType: 'full',
    jobArea: '',
    applicationLink: '',
    appliedDate: getCurrentDate(),
});

type Field = { name: TextField; label: MessageKey; placeholder?: MessageKey; type?: string };

const companyField: Field = { name: 'companyName', label: 'field.companyName', placeholder: 'popup.companyNamePlaceholder' };
const roleField: Field = { name: 'jobRole', label: 'field.jobRole', placeholder: 'popup.jobRolePlaceholder' };
const areaField: Field = { name: 'jobArea', label: 'field.jobArea', placeholder: 'popup.jobAreaPlaceholder' };
const dateField: Field = { name: 'appliedDate', label: 'field.appliedDate', type: 'date' };
const linkField: Field = {
    name: 'applicationLink',
    label: 'field.applicationLink',
    placeholder: 'popup.applicationLinkPlaceholder',
    type: 'url',
};
/* In the order they appear, so the first empty one gets focus. */
const textFields = [companyField, roleField, areaField, dateField, linkField];

export default function App() {
    const { t } = useI18n();
    const [values, setValues] = useState<FormValues>(emptyForm);
    const [showErrors, setShowErrors] = useState(false);
    const [counts, setCounts] = useState<{ today: number; month: number } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function loadCounts() {
        const today = getCurrentDate();
        const [day, month] = await Promise.all([
            countJobsWithDatePrefix(today),
            countJobsWithDatePrefix(today.slice(0, 7)),
        ]);
        setCounts({ today: day, month });
    }

    useEffect(() => {
        loadCounts();
    }, []);

    const missing = (name: TextField) => showErrors && values[name].trim() === '';

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const firstMissing = textFields.find((field) => values[field.name].trim() === '');
        if (firstMissing) {
            setShowErrors(true);
            toast.error(t('popup.fillAllFields'));
            /* Move focus to the first empty field so keyboard and screen reader users land on it. */
            formRef.current?.querySelector<HTMLInputElement>(`#${firstMissing.name}`)?.focus();
            return;
        }
        try {
            await addJobToDatabase(values);
            toast.success(t('popup.added'));
            setValues(emptyForm());
            setShowErrors(false);
            loadCounts();
        } catch (error) {
            console.error(error);
            toast.error(t('popup.saveFailed'));
        }
    }

    function handleReset() {
        setValues(emptyForm());
        setShowErrors(false);
    }

    function renderField(field: Field) {
        const errorId = `${field.name}-error`;
        const invalid = missing(field.name);
        return (
            <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor={field.name}>{t(field.label)}</Label>
                <Input
                    id={field.name}
                    name={field.name}
                    type={field.type ?? 'text'}
                    placeholder={field.placeholder && t(field.placeholder)}
                    value={values[field.name]}
                    required
                    aria-invalid={invalid || undefined}
                    aria-describedby={invalid ? errorId : undefined}
                    className={cn(field.type === 'date' && 'font-mono text-[13px]')}
                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                />
                {invalid && (
                    <p id={errorId} className="text-xs font-medium text-danger-text">
                        {t('popup.fieldRequired', { field: t(field.label) })}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex w-[420px] flex-col bg-page">
            <header className="flex items-center justify-between gap-3 bg-ink px-6 py-4 text-white">
                <div className="flex items-center gap-2.5">
                    <LogoMark />
                    <div className="flex flex-col gap-px">
                        <span className="font-serif text-xl leading-none">{t('appShortName')}</span>
                        <span className="text-[11px] tracking-[0.02em] text-on-ink">{t('appName')}</span>
                    </div>
                </div>
                <LanguageSelect />
            </header>
            <main>
                <form
                    ref={formRef}
                    className="flex flex-col gap-4 px-6 pt-6 pb-6"
                    onSubmit={handleSubmit}
                    noValidate
                    autoComplete="off"
                    aria-labelledby="popup-heading"
                >
                    <h1 id="popup-heading" className="font-serif text-[28px] leading-[1.1] font-normal">
                        {t('popup.heading')}
                    </h1>
                    {renderField(companyField)}
                    {renderField(roleField)}
                    <EmploymentTypeField
                        name="employmentType"
                        value={values.employmentType}
                        onChange={(employmentType) => setValues({ ...values, employmentType })}
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                        {renderField(areaField)}
                        {renderField(dateField)}
                    </div>
                    {renderField(linkField)}
                    <div className="mt-1 flex flex-col gap-2">
                        <Button type="submit" size="lg">
                            <Plus strokeWidth={2} /> {t('popup.add')}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button type="button" variant="outline" onClick={handleReset}>
                                <RotateCcw /> {t('popup.reset')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => browser.runtime.openOptionsPage()}>
                                <LayoutDashboard /> {t('popup.dashboard')}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
            {counts && (
                <footer className="flex items-center justify-between border-t border-line bg-surface px-6 py-3 text-xs text-text-3">
                    <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="size-2 rounded-full bg-olive" />
                        {t('popup.sentToday', { count: counts.today })}
                    </span>
                    <span>{t('popup.thisMonth', { count: counts.month })}</span>
                </footer>
            )}
            <Toaster position="top-center" containerAriaLabel={t('notifications')} />
        </div>
    );
}
