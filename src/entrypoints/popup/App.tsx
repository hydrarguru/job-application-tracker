import { useRef, useState, type FormEvent } from 'react';
import { DatabaseZap, LayoutDashboard, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { LanguageSelect, useI18n } from '@/components/language';
import type { MessageKey } from '@/lib/i18n';
import { addJobToDatabase, type JobData } from '@/utils/db';
import { getCurrentDate } from '@/utils/utils';

type FormValues = Omit<JobData, 'jobId'>;

const emptyForm = (): FormValues => ({
    companyName: '',
    jobRole: '',
    jobArea: '',
    applicationLink: '',
    appliedDate: getCurrentDate(),
});

const fields: { name: keyof FormValues; label: MessageKey; placeholder?: MessageKey; type?: string }[] = [
    { name: 'companyName', label: 'field.companyName', placeholder: 'popup.companyNamePlaceholder' },
    { name: 'jobRole', label: 'field.jobRole', placeholder: 'popup.jobRolePlaceholder' },
    { name: 'jobArea', label: 'field.jobArea', placeholder: 'popup.jobAreaPlaceholder' },
    { name: 'applicationLink', label: 'field.applicationLink', placeholder: 'popup.applicationLinkPlaceholder' },
    { name: 'appliedDate', label: 'field.appliedDate', type: 'date' },
];

/* Three buttons share one row in the 350px popup, so they get less padding. */
const actionButton = 'gap-1.5 px-2 has-[>svg]:px-2';

/* Asks the offscreen document to recount the stored statistics. No listener is not an error. */
function refreshStatistics() {
    browser.runtime.sendMessage('refreshValues').catch(() => {});
}

export default function App() {
    const { t } = useI18n();
    const [values, setValues] = useState<FormValues>(emptyForm);
    const [showErrors, setShowErrors] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const missing = (name: keyof FormValues) => showErrors && values[name].trim() === '';

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const firstMissing = fields.find((field) => values[field.name].trim() === '');
        if (firstMissing) {
            setShowErrors(true);
            toast.error(t('popup.fillAllFields'));
            /* Move focus to the first empty field so keyboard and screen reader users land on it. */
            formRef.current?.querySelector<HTMLInputElement>(`#${firstMissing.name}`)?.focus();
            return;
        }
        try {
            await addJobToDatabase({ jobId: crypto.randomUUID(), ...values });
            toast.success(t('popup.added'));
            setValues(emptyForm());
            setShowErrors(false);
            refreshStatistics();
        } catch (error) {
            console.error(error);
            toast.error(t('popup.saveFailed'));
        }
    }

    function handleReset() {
        setValues(emptyForm());
        setShowErrors(false);
    }

    return (
        <div className="w-[350px]">
            <header className="flex items-center justify-between gap-2 bg-primary px-4 py-4 text-primary-foreground">
                <h1 className="text-base font-semibold">{t('appName')}</h1>
                <LanguageSelect />
            </header>
            <main>
                <form
                    ref={formRef}
                    className="flex flex-col gap-3 p-4"
                    onSubmit={handleSubmit}
                    noValidate
                    autoComplete="off"
                    aria-label={t('popup.form')}
                >
                    {fields.map((field) => {
                        const errorId = `${field.name}-error`;
                        return (
                            <div key={field.name} className="flex flex-col gap-1.5">
                                <Label htmlFor={field.name}>{t(field.label)}</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type ?? 'text'}
                                    placeholder={field.placeholder && t(field.placeholder)}
                                    value={values[field.name]}
                                    required
                                    aria-invalid={missing(field.name) || undefined}
                                    aria-describedby={missing(field.name) ? errorId : undefined}
                                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                                />
                                {missing(field.name) && (
                                    <p id={errorId} className="text-destructive text-xs font-medium">
                                        {t('popup.fieldRequired', { field: t(field.label) })}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    <div className="mt-1 grid grid-cols-3 gap-2">
                        <Button type="submit" className={actionButton}>
                            <DatabaseZap /> {t('popup.add')}
                        </Button>
                        <Button type="button" variant="outline" className={actionButton} onClick={handleReset}>
                            <RotateCcw /> {t('popup.reset')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className={actionButton}
                            onClick={() => browser.runtime.openOptionsPage()}
                        >
                            <LayoutDashboard /> {t('popup.dashboard')}
                        </Button>
                    </div>
                </form>
            </main>
            <Toaster position="top-center" containerAriaLabel={t('notifications')} />
        </div>
    );
}
