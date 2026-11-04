import React, { useState, type FormEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { Check, Copy, LoaderCircle, Plus, X } from 'lucide-react';

import { DatePicker } from '@/components/date-picker';
import { EmploymentTypeField } from '@/components/employment-type-field';
import { LanguageProvider, useI18n } from '@/components/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PopoverContainer } from '@/components/ui/popover';
import type { MessageKey } from '@/lib/i18n';
import type { JobData } from '@/utils/db';
import { sendMessage } from '@/utils/messages';
import { getCurrentDate } from '@/utils/utils';
import './style.css';

/* Platsbanken switches ads without reloading, so the script runs on all of it and watches the URL. */
const AD_PATH = /^\/platsbanken\/annonser\/(\d+)/;

const adId = (url: URL | Location) => url.pathname.match(AD_PATH)?.[1];

/*
 * The ad page renders in the browser, so the ad is read from JobTech's open JobSearch API (the
 * data behind Platsbanken) instead of the page's markup.
 */
async function fetchAd(id: string): Promise<JobData> {
	const response = await fetch(
		`https://jobsearch.api.jobtechdev.se/ad/${id}`,
		{ headers: { accept: 'application/json' } }
	);
	if (!response.ok)
		throw new Error(`JobSearch API answered ${response.status}`);
	const ad = await response.json();
	const hours = ad.working_hours_type?.label;
	const address = ad.workplace_address ?? {};
	return {
		companyName: ad.employer?.workplace || ad.employer?.name || '',
		/* The occupation is the name the "Sökta jobb" form's Yrkesroll list uses, so reporting fills it in exactly. */
		jobRole: ad.occupation?.label || ad.headline || '',
		employmentType:
			hours === 'Heltid'
				? 'full'
				: hours === 'Deltid'
					? 'part'
					: undefined,
		jobArea: address.municipality || address.city || address.region || '',
		applicationLink: `https://arbetsformedlingen.se/platsbanken/annonser/${id}`,
		appliedDate: getCurrentDate(),
	};
}

type State =
	| 'idle'
	| 'loading'
	| 'editing'
	| 'saving'
	| 'added'
	| 'duplicate'
	| 'failed';

const labels: Record<State, MessageKey> = {
	idle: 'quickAdd.add',
	loading: 'quickAdd.loading',
	editing: 'quickAdd.add',
	saving: 'quickAdd.adding',
	added: 'quickAdd.added',
	duplicate: 'quickAdd.duplicate',
	failed: 'quickAdd.failed',
};

type TextField = 'companyName' | 'jobRole' | 'jobArea' | 'appliedDate';
const textFields: TextField[] = [
	'companyName',
	'jobRole',
	'jobArea',
	'appliedDate',
];

function QuickAdd({ id }: { id: string }) {
	const { t } = useI18n();
	const [state, setState] = useState<State>('idle');
	const [draft, setDraft] = useState<JobData | null>(null);
	const [showErrors, setShowErrors] = useState(false);
	const [container, setContainer] = useState<HTMLElement | null>(null);
	const [copied, setCopied] = useState(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(draft!.applicationLink);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			/* Blocked by the browser or the site: the link can still be selected and copied by hand. */
			console.error(error);
		}
	}
	const done = state === 'added' || state === 'duplicate';
	const busy = state === 'loading' || state === 'saving';
	const open = state === 'editing' || state === 'saving';

	async function toggle() {
		if (open) return setState('idle');
		if (draft) return setState('editing');
		setState('loading');
		try {
			setDraft(await fetchAd(id));
			setState('editing');
		} catch (error) {
			console.error(error);
			setState('failed');
		}
	}

	async function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const firstMissing = textFields.find((field) => !draft![field].trim());
		if (firstMissing) {
			setShowErrors(true);
			form.querySelector<HTMLInputElement>(
				`#jat-quick-${firstMissing}`
			)?.focus();
			return;
		}
		setState('saving');
		try {
			const trimmed = { ...draft! };
			for (const field of textFields)
				trimmed[field] = trimmed[field].trim();
			setState(await sendMessage({ type: 'addJob', job: trimmed }));
		} catch (error) {
			console.error(error);
			setState('failed');
		}
	}

	function field(name: Exclude<TextField, 'appliedDate'>, label: MessageKey) {
		const invalid = showErrors && !draft![name].trim();
		return (
			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`jat-quick-${name}`}>{t(label)}</Label>
				<Input
					id={`jat-quick-${name}`}
					type="text"
					value={draft![name]}
					required
					autoFocus={name === 'companyName'}
					aria-invalid={invalid || undefined}
					onChange={(e) =>
						setDraft({ ...draft!, [name]: e.target.value })
					}
				/>
				{invalid && (
					<p className="text-xs font-medium text-danger-text">
						{t('popup.fieldRequired', { field: t(label) })}
					</p>
				)}
			</div>
		);
	}

	const Icon = busy ? LoaderCircle : done ? Check : Plus;
	return (
		<PopoverContainer.Provider value={container}>
			<div
				ref={setContainer}
				className="fixed right-6 bottom-6 z-[2147483647] flex flex-col items-end gap-3 font-sans text-ink">
				{open && draft && (
					<form
						onSubmit={save}
						/* Only Escape from the form's own fields: the calendar closes itself on Escape. */
						onKeyDown={(e) =>
							e.key === 'Escape' &&
							e.currentTarget.contains(e.target as Node) &&
							setState('idle')
						}
						noValidate
						autoComplete="off"
						aria-label={t('popup.form')}
						className="quick-add-card flex w-80 flex-col gap-3 rounded-[14px] border border-line bg-surface p-4 shadow-[0_12px_32px_rgba(19,32,43,0.18)]">
						{field('companyName', 'field.companyName')}
						{field('jobRole', 'field.jobRole')}
						<EmploymentTypeField
							name="jat-quick-employmentType"
							value={draft.employmentType}
							onChange={(employmentType) =>
								setDraft({ ...draft, employmentType })
							}
						/>
						{field('jobArea', 'field.jobArea')}
						<div className="flex flex-col gap-1.5">
							<Label
								id="jat-quick-appliedDate-label"
								htmlFor="jat-quick-appliedDate">
								{t('field.appliedDate')}
							</Label>
							<DatePicker
								id="jat-quick-appliedDate"
								labelId="jat-quick-appliedDate-label"
								value={draft.appliedDate}
								onChange={(appliedDate) =>
									setDraft({ ...draft, appliedDate })
								}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="jat-quick-applicationLink">
								{t('field.applicationLink')}
							</Label>
							<div className="flex gap-2">
								<Input
									id="jat-quick-applicationLink"
									type="url"
									value={draft.applicationLink}
									readOnly
									className="cursor-default border-line bg-page text-text-3"
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={copyLink}
									aria-label={t(copied ? 'quickAdd.copied' : 'quickAdd.copyLink')}
									title={t(copied ? 'quickAdd.copied' : 'quickAdd.copyLink')}
									className="shrink-0">
									{copied ? (
										<Check aria-hidden="true" strokeWidth={1.8} />
									) : (
										<Copy aria-hidden="true" strokeWidth={1.8} />
									)}
								</Button>
							</div>
						</div>
						<div className="mt-1 grid grid-cols-[2fr_1fr] gap-2">
							<Button type="submit" size="lg" disabled={state === 'saving'}>
								{state === 'saving' ? (
									<LoaderCircle aria-hidden="true" className="animate-spin" />
								) : (
									<Plus aria-hidden="true" strokeWidth={2} />
								)}
								{t('popup.add')}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								onClick={() => setState('idle')}>
								<X aria-hidden="true" strokeWidth={1.8} />
								{t('quickAdd.cancel')}
							</Button>
						</div>
					</form>
				)}
				<div className="spin-border shadow-lg">
					<Button
						type="button"
						onClick={toggle}
						disabled={busy || done}
						aria-expanded={open}
						className="h-14 gap-2.5 rounded-[11px] px-7 text-base disabled:opacity-100">
						<Icon
							aria-hidden="true"
							className={busy ? 'size-5 animate-spin' : 'size-5'}
						/>
						<span aria-live="polite">{t(labels[state])}</span>
					</Button>
				</div>
			</div>
		</PopoverContainer.Provider>
	);
}

export default defineContentScript({
	matches: ['https://arbetsformedlingen.se/platsbanken/*'],
	cssInjectionMode: 'ui',

	async main(ctx) {
		let id: string | undefined;
		const ui = await createShadowRootUi(ctx, {
			name: 'jat-quick-add',
			position: 'inline',
			anchor: 'body',
			onMount(container) {
				const root = ReactDOM.createRoot(container);
				root.render(
					<React.StrictMode>
						<LanguageProvider setDocumentLanguage={false}>
							<QuickAdd id={id!} />
						</LanguageProvider>
					</React.StrictMode>
				);
				return root;
			},
			onRemove(root) {
				root?.unmount();
			},
		});
		/* Remounted on every navigation so a new ad starts with a fresh button. */
		/* The event's URL, not `location`: with the Navigation API it fires before `location` changes. */
		const update = (url: URL | Location) => {
			id = adId(url);
			ui.remove();
			if (id) ui.mount();
		};
		update(location);
		ctx.addEventListener(window, 'wxt:locationchange', (event) =>
			update(event.newUrl)
		);
	},
});
