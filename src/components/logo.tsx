import { cn } from '@/lib/utils';

/* The sailboat mark on a lapis tile. Decorative: the app name always sits next to it. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-lapis', className)}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-[18px]"
            >
                <path d="M12 3v13" />
                <path d="M12 4l6 10h-6" />
                <path d="M10 7l-4 7h4" />
                <path d="M3 17h18l-2 3H5z" />
            </svg>
        </span>
    );
}
