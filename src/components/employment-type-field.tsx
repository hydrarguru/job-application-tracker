import { useI18n } from '@/components/language';
import { cn } from '@/lib/utils';
import { employmentTypes, type EmploymentType } from '@/utils/db';

/* Full time / part time as two radio cards in a fieldset. */
export function EmploymentTypeField({
    name,
    value,
    onChange,
}: {
    name: string;
    value: EmploymentType | undefined;
    onChange: (value: EmploymentType) => void;
}) {
    const { t } = useI18n();
    return (
        <fieldset className="m-0 flex flex-col border-0 p-0">
            <legend className="mb-1.5 p-0 text-xs font-medium text-text-2">{t('field.employmentType')}</legend>
            <div className="grid grid-cols-2 gap-2.5">
                {employmentTypes.map((type) => (
                    <label
                        key={type}
                        className={cn(
                            'flex h-11 cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                            value === type ? 'border-[1.5px] border-lapis bg-tint-lapis-2' : 'border-input bg-surface',
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={type}
                            checked={value === type}
                            onChange={() => onChange(type)}
                            className="m-0 size-4 accent-lapis focus-visible:outline-none"
                        />
                        {t(`employment.${type}`)}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
