import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default: 'bg-primary font-semibold text-primary-foreground hover:bg-lapis-deep',
        destructive:
          'bg-danger font-semibold text-white hover:bg-danger-text focus-visible:outline-danger disabled:bg-line disabled:text-text-3 disabled:opacity-100',
        outline: 'border border-[#d5dde4] bg-surface text-text-2 hover:bg-fill hover:text-ink',
        soft: 'bg-tint-lapis text-lapis-deep hover:bg-tint-lapis-3',
        'soft-destructive': 'bg-tint-orange text-danger-text hover:bg-tint-orange-2 focus-visible:outline-danger',
        ghost: 'text-text-2 hover:bg-tint-lapis hover:text-lapis-deep',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 rounded-[9px] px-3 text-[13px] gap-1.5',
        lg: 'h-[46px] px-5',
        icon: 'size-10 rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
