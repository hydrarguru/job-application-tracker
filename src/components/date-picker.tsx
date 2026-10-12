import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/components/language';
import { localeOf, monthName } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/* Dates are kept as YYYY-MM-DD strings, like in the database. */
function parse(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : new Date();
}

function format(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/* Same day of the month in another month, kept inside that month (31 Jan + 1 month = 28/29 Feb). */
function addMonths(date: Date, months: number) {
    const last = new Date(date.getFullYear(), date.getMonth() + months + 1, 0).getDate();
    return new Date(date.getFullYear(), date.getMonth() + months, Math.min(date.getDate(), last));
}

/* Monday-first weeks; getDay() counts from Sunday. */
const weekday = (date: Date) => (date.getDay() + 6) % 7;

/* The six weeks shown for the month of `date`, starting on the Monday on or before the 1st. */
function monthGrid(date: Date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = addDays(first, -weekday(first));
    return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}

type DatePickerProps = {
    id: string;
    /* id of the visible <Label>, which together with the date names the button. */
    labelId: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

/*
 * Date field with a calendar drawn in the page. The browser's own date picker opens behind the
 * extension popup, so it can't be used there. Follows the WAI-ARIA date picker dialog pattern:
 * arrow keys move by day and week, Home/End to the start/end of the week, Page Up/Down by month
 * (with Shift by year), Enter or Space picks the date and Escape closes without changing it.
 */
export function DatePicker({ id, labelId, value, onChange, className }: DatePickerProps) {
    const { language, t } = useI18n();
    const locale = localeOf(language);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(() => parse(value));
    const gridRef = useRef<HTMLTableElement>(null);
    const headingId = useId();
    const valueId = useId();

    const selected = value;
    const today = format(new Date());
    const focusedKey = format(focused);
    const longDate = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const weekdays = monthGrid(new Date(2024, 0, 1))[0];

    const focusActiveDay = () => gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedKey}"]`)?.focus();

    /* Keep keyboard focus on the active day as it moves. */
    useEffect(() => {
        if (open) focusActiveDay();
    }, [focusedKey]);

    function handleOpenChange(next: boolean) {
        if (next) setFocused(parse(value));
        setOpen(next);
    }

    function pick(date: Date) {
        onChange(format(date));
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
        const moves: Record<string, () => Date> = {
            ArrowLeft: () => addDays(focused, -1),
            ArrowRight: () => addDays(focused, 1),
            ArrowUp: () => addDays(focused, -7),
            ArrowDown: () => addDays(focused, 7),
            Home: () => addDays(focused, -weekday(focused)),
            End: () => addDays(focused, 6 - weekday(focused)),
            PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        setFocused(move());
    }

    const navButton =
        'flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-line text-text-2 hover:bg-fill';

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                id={id}
                aria-labelledby={`${labelId} ${valueId}`}
                className={cn(
                    'flex h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-input bg-surface px-3 text-left text-ink',
                    'focus-visible:border-lapis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    className,
                )}
            >
                <span id={valueId} className="font-mono text-[13px]">
                    <time dateTime={value}>{value}</time>
                </span>
                <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-text-3" />
            </PopoverTrigger>
            <PopoverContent
                aria-labelledby={headingId}
                onOpenAutoFocus={(event) => {
                    /* Start on the chosen date rather than the first button. */
                    event.preventDefault();
                    focusActiveDay();
                }}
                className="w-[300px]"
            >
                <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        className={navButton}
                        aria-label={t('datePicker.previousMonth')}
                        onClick={() => setFocused(addMonths(focused, -1))}
                    >
                        <ChevronLeft aria-hidden="true" className="size-4" />
                    </button>
                    <h2 id={headingId} aria-live="polite" className="text-sm font-semibold">
                        {monthName(language, focused.getMonth())} {focused.getFullYear()}
                    </h2>
                    <button
                        type="button"
                        className={navButton}
                        aria-label={t('datePicker.nextMonth')}
                        onClick={() => setFocused(addMonths(focused, 1))}
                    >
                        <ChevronRight aria-hidden="true" className="size-4" />
                    </button>
                </div>
                <table ref={gridRef} role="grid" aria-labelledby={headingId} className="w-full border-collapse" onKeyDown={handleKeyDown}>
                    <thead>
                        <tr>
                            {weekdays.map((day) => (
                                <th key={day.getDay()} scope="col" abbr={day.toLocaleDateString(locale, { weekday: 'long' })} className="pb-1 text-xs font-medium text-text-3">
                                    {day.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {monthGrid(focused).map((week) => (
                            <tr key={format(week[0])}>
                                {week.map((day) => {
                                    const key = format(day);
                                    const outside = day.getMonth() !== focused.getMonth();
                                    const isSelected = key === selected;
                                    return (
                                        <td key={key} aria-selected={isSelected} className="p-0.5 text-center">
                                            <button
                                                type="button"
                                                data-date={key}
                                                tabIndex={key === focusedKey ? 0 : -1}
                                                aria-label={longDate.format(day)}
                                                aria-current={key === today ? 'date' : undefined}
                                                onClick={() => pick(day)}
                                                className={cn(
                                                    'size-9 cursor-pointer rounded-[10px] font-mono text-[13px] hover:bg-tint-lapis',
                                                    outside ? 'text-text-3' : 'text-ink',
                                                    key === today && 'font-semibold underline underline-offset-4',
                                                    isSelected && 'bg-lapis text-white hover:bg-lapis-deep',
                                                )}
                                            >
                                                {day.getDate()}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
