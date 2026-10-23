import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const buttonVariants = cva('inline-flex shrink-0 max-w-full whitespace-normal text-center items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:pointer-events-none disabled:opacity-50 min-h-11 px-4 py-2', {
 variants: { variant: { default: 'bg-teal-800 text-white hover:bg-teal-900', outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100' } },
 defaultVariants: { variant: 'default' },
});
function Button({ className, variant, asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
 const Comp = asChild ? Slot : 'button';
 return <Comp data-slot="button" className={cn(buttonVariants({ variant, className }))} {...props} />;
}
export { Button, buttonVariants };



