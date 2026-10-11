import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-[10px] border border-input bg-surface px-3 text-sm text-ink transition-[color,border-color] placeholder:text-text-3 selection:bg-primary selection:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-lapis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
