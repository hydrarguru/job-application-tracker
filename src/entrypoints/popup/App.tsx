import { useRef, useState, type FormEvent } from 'react';
import { DatabaseZap, LayoutDashboard, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
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

const fields: { name: keyof FormValues; label: string; placeholder?: string; type?: string }[] = [
    { name: 'companyName', label: 'Företag', placeholder: 'T.ex. Google, Microsoft' },
    { name: 'jobRole', label: 'Sökt tjänst', placeholder: 'T.ex. Frontendutvecklare' },
    { name: 'jobArea', label: 'Område', placeholder: 'T.ex. Stockholm, Solna, Umeå' },
    { name: 'applicationLink', label: 'Ansökningslänk', placeholder: 'Länk till ansökan' },
    { name: 'appliedDate', label: 'Ansökningsdatum', type: 'date' },
];

/* Three buttons share one row in the 350px popup, so they get less padding. */
const actionButton = 'gap-1.5 px-2 has-[>svg]:px-2';

export default function App() {
    const [values, setValues] = useState<FormValues>(emptyForm);
    const [showErrors, setShowErrors] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const missing = (name: keyof FormValues) => showErrors && values[name].trim() === '';

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const firstMissing = fields.find((field) => values[field.name].trim() === '');
        if (firstMissing) {
            setShowErrors(true);
            toast.error('Fyll i alla fält innan du lägger till ansökan.');
            /* Move focus to the first empty field so keyboard and screen reader users land on it. */
            formRef.current?.querySelector<HTMLInputElement>(`#${firstMissing.name}`)?.focus();
            return;
        }
        try {
            await addJobToDatabase({ jobId: crypto.randomUUID(), ...values });
            toast.success('Ansökan har lagts till!');
            setValues(emptyForm());
            setShowErrors(false);
        } catch (error) {
            console.error(error);
            toast.error('Kunde inte spara ansökan.');
        }
    }

    function handleReset() {
        setValues(emptyForm());
        setShowErrors(false);
    }

    return (
        <div className="w-[350px]">
            <header className="bg-primary px-4 py-4">
                <h1 className="text-xl font-semibold text-primary-foreground">Job Application Tracker</h1>
            </header>
            <main>
                <form
                    ref={formRef}
                    className="flex flex-col gap-3 p-4"
                    onSubmit={handleSubmit}
                    noValidate
                    autoComplete="off"
                    aria-label="Lägg till jobbansökan"
                >
                    {fields.map((field) => {
                        const errorId = `${field.name}-error`;
                        return (
                            <div key={field.name} className="flex flex-col gap-1.5">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type ?? 'text'}
                                    placeholder={field.placeholder}
                                    value={values[field.name]}
                                    required
                                    aria-invalid={missing(field.name) || undefined}
                                    aria-describedby={missing(field.name) ? errorId : undefined}
                                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                                />
                                {missing(field.name) && (
                                    <p id={errorId} className="text-destructive text-xs font-medium">
                                        {field.label} måste fyllas i.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    <div className="mt-1 grid grid-cols-3 gap-2">
                        <Button type="submit" className={actionButton}>
                            <DatabaseZap /> Lägg till
                        </Button>
                        <Button type="button" variant="outline" className={actionButton} onClick={handleReset}>
                            <RotateCcw /> Återställ
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className={actionButton}
                            onClick={() => browser.runtime.openOptionsPage()}
                        >
                            <LayoutDashboard /> Dashboard
                        </Button>
                    </div>
                </form>
            </main>
            <Toaster position="top-center" />
        </div>
    );
}
