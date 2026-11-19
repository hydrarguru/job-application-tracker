import {
	Toaster as Sonner,
	toast as sonnerToast,
	type ExternalToast,
	type ToasterProps,
} from 'sonner';

const defaultToastMs = 2500;
const errorToastMs = 5000;

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			className="toaster group"
			duration={defaultToastMs}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

function withProgress(
	data: ExternalToast = {},
	fallbackMs = defaultToastMs
): ExternalToast {
	const duration = data.duration ?? fallbackMs;
	return {
		...data,
		duration,
		description: (
			<span
				aria-hidden="true"
				className="toast-progress"
				style={
					{
						'--toast-duration': `${duration}ms`,
					} as React.CSSProperties
				}
			/>
		),
	};
}

const toast = {
	success: (message: React.ReactNode, data?: ExternalToast) =>
		sonnerToast.success(message, withProgress(data)),
	error: (message: React.ReactNode, data?: ExternalToast) =>
		sonnerToast.error(message, withProgress(data, errorToastMs)),
};

export { Toaster, toast };
