import { useEffect, type ReactNode } from 'react';
import { ChartNoAxesColumn, LayoutDashboard, SlidersHorizontal, type LucideIcon } from 'lucide-react';

import { LogoMark } from '@/components/logo';
import { useI18n } from '@/components/language';
import { Toaster } from '@/components/ui/sonner';
import type { MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type Page = 'overview' | 'statistics' | 'preferences';

const pages: { page: Page; href: string; label: MessageKey; icon: LucideIcon }[] = [
    { page: 'overview', href: '/dashboard.html', label: 'nav.overview', icon: LayoutDashboard },
    { page: 'statistics', href: '/statistics.html', label: 'nav.statistics', icon: ChartNoAxesColumn },
    { page: 'preferences', href: '/preferences.html', label: 'nav.preferences', icon: SlidersHorizontal },
];

/* Navy top bar, page heading and content area shared by the full-page views. */
export function AppShell({
    current,
    eyebrow,
    title,
    actions,
    narrow = false,
    children,
}: {
    current: Page;
    eyebrow: string;
    title: string;
    actions?: ReactNode;
    narrow?: boolean;
    children: ReactNode;
}) {
    const { t } = useI18n();
    useEffect(() => {
        document.title = `${title} · ${t('appShortName')}`;
    }, [title, t]);
    return (
        <div className="min-h-screen bg-page">
            <header className="bg-ink text-white">
                <nav
                    aria-label={t('nav.label')}
                    className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-7 gap-y-3 px-4 py-3.5 sm:px-8"
                >
                    <span className="flex items-center gap-2.5">
                        <LogoMark className="size-[34px] rounded-[10px]" />
                        <span className="font-serif text-[22px]">{t('appShortName')}</span>
                    </span>
                    <ul className="flex flex-wrap gap-1">
                        {pages.map(({ page, href, label, icon: Icon }) => (
                            <li key={page}>
                                <a
                                    href={href}
                                    aria-current={page === current ? 'page' : undefined}
                                    className={cn(
                                        'flex h-10 items-center gap-2 rounded-[10px] px-3.5 text-sm font-medium no-underline focus-visible:outline-white',
                                        page === current
                                            ? 'bg-sky/16 text-white hover:text-white'
                                            : 'text-on-ink hover:bg-white/8 hover:text-white',
                                    )}
                                >
                                    <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                                    {t(label)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>
            <main
                className={cn(
                    'mx-auto flex flex-col gap-7 px-4 pt-11 pb-16 sm:px-8',
                    narrow ? 'max-w-[880px] gap-6' : 'max-w-[1200px]',
                )}
            >
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium tracking-[0.08em] text-text-3 uppercase">{eyebrow}</span>
                        <h1 className="font-serif text-[56px] leading-none font-normal tracking-[-0.01em]">{title}</h1>
                    </div>
                    {actions}
                </div>
                {children}
            </main>
            <Toaster position="bottom-right" containerAriaLabel={t('notifications')} />
        </div>
    );
}

/* White rounded card used across the pages. */
export function Card({ className, ...props }: React.ComponentProps<'section'>) {
    return <section className={cn('rounded-2xl border border-line bg-surface p-6', className)} {...props} />;
}
