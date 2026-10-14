import { useRef, useState, type FormEvent } from 'react';
import { LayoutDashboard, Plus, RotateCcw, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { DatePicker } from '@/components/date-picker';
import { EmploymentTypeField } from '@/components/employment-type-field';
import { useI18n } from '@/components/language';
import { LogoMark } from '@/components/logo';
import type { MessageKey } from '@/lib/i18n';
import { addJobToDatabase, type JobData } from '@/utils/db';
import { getCurrentDate } from '@/utils/utils';

type FormValues = Required<Omit<JobData, 'jobId' | 'reportedAt'>>;
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
const dateField: Field = { name: 'appliedDate', label: 'field.appliedDate' };
const linkField: Field = {
    name: 'applicationLink',
    label: 'field.applicationLink',
    placeholder: 'popup.applicationLinkPlaceholder',
    type: 'url',
};
/* In the order they appear, so the first empty one gets focus. */
const textFields = [companyField, roleField, areaField, dateField, linkField];

/* Opens an extension page in a new tab and closes the popup. */
async function openPage(path: '/dashboard.html' | '/preferences.html') {
    await browser.tabs.create({ url: browser.runtime.getURL(path) });
    window.close();
}

/*
 * Icon button for the navy header. Its label is hidden until hover or keyboard focus, when the
 * button widens and the text slides in to the right of the icon. The label stays in the DOM, so
 * it is the button's accessible name; with reduced motion it appears without the animation.
 */
function HeaderLink({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex h-10 cursor-pointer items-center rounded-[10px] border border-white/14 bg-white/8 px-[10px] text-sm font-medium text-white hover:bg-white/16 focus-visible:outline-white"
        >
            <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.8} />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 ease-out group-hover:ml-2 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-40 group-focus-visible:opacity-100 motion-reduce:transition-none">
                {label}
            </span>
        </button>
    );
}

export default function App() {
    const { t } = useI18n();
    const [values, setValues] = useState<FormValues>(emptyForm);
    const [showErrors, setShowErrors] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

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
        } catch (error) {
            console.error(error);
            toast.error(t('popup.saveFailed'));
        }
    }

    function handleReset() {
        setValues(emptyForm());
        setShowErrors(false);
    }

    function renderDateField() {
        const labelId = `${dateField.name}-label`;
        return (
            <div className="flex min-w-0 flex-col gap-1.5">
                <Label id={labelId} htmlFor={dateField.name}>
                    {t(dateField.label)}
                </Label>
                <DatePicker
                    id={dateField.name}
                    labelId={labelId}
                    value={values.appliedDate}
                    onChange={(appliedDate) => setValues({ ...values, appliedDate })}
                />
            </div>
        );
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
                <div className="flex items-center gap-2">
                    <HeaderLink icon={LayoutDashboard} label={t('popup.dashboard')} onClick={() => openPage('/dashboard.html')} />
                    <HeaderLink icon={SlidersHorizontal} label={t('nav.preferences')} onClick={() => openPage('/preferences.html')} />
                </div>
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
                        {renderDateField()}
                    </div>
                    {renderField(linkField)}
                    <div className="mt-1 flex flex-col gap-2">
                        <div className="grid grid-cols-[2fr_1fr] gap-2">
                            <Button type="submit" size="lg">
                                <Plus strokeWidth={2} /> {t('popup.add')}
                            </Button>
                            <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                                <RotateCcw /> {t('popup.reset')}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
            <Toaster position="top-center" containerAriaLabel={t('notifications')} />
        </div>
    );
}
