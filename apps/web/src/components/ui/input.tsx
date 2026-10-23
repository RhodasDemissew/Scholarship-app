import * as React from 'react';
import { cn } from '@/lib/utils';
export function Input({ className, ...props }: React.ComponentProps<'input'>) {
 return <input data-slot="input" className={cn('flex min-w-0 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 aria-invalid:border-red-600', className)} {...props} />;
}


