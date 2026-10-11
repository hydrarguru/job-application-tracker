import { useEffect, useState, type FormEvent } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmploymentTypeField } from '@/components/employment-type-field';
import { useI18n } from '@/components/language';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { deleteJobFromDatabase, updateJobInDatabase, type StoredJob } from '@/utils/db';

type TextField = 'companyName' | 'jobRole' | 'jobArea' | 'appliedDate' | 'applicationLink';

const gridFields: { name: TextField; label: MessageKey; type?: string }[] = [
    { name: 'companyName', label: 'field.companyName' },
    { name: 'jobRole', label: 'field.jobRole' },
    { name: 'jobArea', label: 'field.jobArea' },
    { name: 'appliedDate', label: 'field.appliedDate', type: 'date' },
];
const linkField = { name: 'applicationLink' as const, label: 'field.applicationLink' as const, type: 'url' };

export function EditDialog({ job, onClose, onSaved }: { job: StoredJob | null; onClose: () => void; onSaved: () => void }) {
    const { t } = useI18n();
    const [values, setValues] = useState<StoredJob | null>(job);
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        setValues(job);
        setShowErrors(false);
    }, [job]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!values) return;
        const form = event.currentTarget;
        const firstMissing = [...gridFields, linkField].find((field) => values[field.name].trim() === '');
        if (firstMissing) {
            setShowErrors(true);
            form.querySelector<HTMLInputElement>(`#edit-${firstMissing.name}`)?.focus();
            return;
        }
        try {
            await updateJobInDatabase(values);
            toast.success(t('dashboard.saved'));
            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(t('dashboard.saveFailed'));
        }
    }

    function renderField(field: { name: TextField; label: MessageKey; type?: string }) {
        if (!values) return null;
        const id = `edit-${field.name}`;
        const invalid = showErrors && values[field.name].trim() === '';
        return (
            <div key={field.name} className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor={id}>{t(field.label)}</Label>
                <Input
                    id={id}
                    type={field.type ?? 'text'}
                    value={values[field.name]}
                    required
                    aria-invalid={invalid || undefined}
                    aria-describedby={invalid ? `${id}-error` : undefined}
                    className={cn('h-[42px]', field.type === 'date' && 'font-mono text-[13px]')}
                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                />
                {invalid && (
                    <p id={`${id}-error`} className="text-xs font-medium text-danger-text">
                        {t('popup.fieldRequired', { field: t(field.label) })}
                    </p>
                )}
            </div>
        );
    }

    return (
        <Dialog open={job !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent closeLabel={t('dashboard.close')} aria-describedby={undefined} className="max-w-[512px]">
                {values && (
                    <>
                        <DialogTitle className="pr-14">{t('dashboard.editTitle')}</DialogTitle>
                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{gridFields.map(renderField)}</div>
                            <EmploymentTypeField
                                name="edit-employmentType"
                                value={values.employmentType}
                                onChange={(employmentType) => setValues({ ...values, employmentType })}
                            />
                            {renderField(linkField)}
                            <div className="flex justify-end gap-2 pt-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" className="px-[18px]">
                                        {t('dashboard.close')}
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="px-[22px]">
                                    <Check strokeWidth={2} /> {t('dashboard.save')}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function DeleteDialog({
    job,
    onClose,
    onDeleted,
}: {
    job: StoredJob | null;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const { t } = useI18n();
    /* Kept while the dialog animates closed, so its text doesn't vanish mid-fade. */
    const [shown, setShown] = useState(job);
    useEffect(() => {
        if (job) setShown(job);
    }, [job]);

    async function handleDelete() {
        if (!job) return;
        try {
            await deleteJobFromDatabase(job.id);
            toast.success(t('dashboard.deleted'));
            onDeleted();
        } catch (error) {
            console.error(error);
        }
        onClose();
    }

    return (
        <Dialog open={job !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent role="alertdialog" className="max-w-[400px] gap-4 rounded-2xl p-[22px]">
                <div className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tint-orange-2 text-danger">
                        <Trash2 aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                    </span>
                    <div className="flex flex-col gap-1">
                        <DialogTitle className="text-[26px]">{t('dashboard.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {shown && t('dashboard.deleteText', { entry: `${shown.companyName} · ${shown.jobRole}` })}
                        </DialogDescription>
                    </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="px-[18px]" autoFocus>
                            {t('dashboard.keep')}
                        </Button>
                    </DialogClose>
                    <Button variant="destructive" className="px-[18px]" onClick={handleDelete}>
                        {t('dashboard.confirmDelete')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
