import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { request } from '@/lib/http';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type Session = { authenticated: boolean; email: string | null; roles: string[] };
export function useSession() { return useQuery({ queryKey: ['session'], queryFn: () => request<Session>('/api/v1/auth/session'), retry: false }); }
const schema = z.object({ email: z.email('Enter a valid email address.'), password: z.string().max(128).optional() });
export function Account() {
 const { pathname } = useLocation();
 const action = pathname.slice(1);
 const [params] = useSearchParams();
 const client = useQueryClient();
 const session = useSession();
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [twoFactor, setTwoFactor] = useState(false);
 const [code, setCode] = useState('');
 const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: params.get('email') ?? '', password: '' } });
 const title: Record<string, string> = { register: 'Create your account', login: 'Welcome back', verify: 'Verify your email', forgot: 'Reset your password', reset: 'Choose a new password', account: 'Your account', resend: 'Resend verification' };
 const needsPassword = ['register','login','reset'].includes(action);
 async function submit(values: z.infer<typeof schema>) {
  setError(''); setMessage('');
  try {
   const result = await request('/api/v1/auth/' + action, 'POST', { ...values, token: params.get('token') ?? '' });
   setTwoFactor(!!result?.requiresTwoFactor);
   setMessage(result?.message ?? (result?.requiresTwoFactor ? 'Enter the code from your authenticator.' : 'You are signed in.'));
   client.clear();
  } catch (e) { setError((e as Error).message); }
 }
 return <><p className="eyebrow">Your scholarship companion</p><h1>{title[action] ?? 'Account'}</h1>
 <div className="panel mt-6">
 {session.data?.authenticated && <div className="mb-5"><p>Signed in as {session.data.email}</p><Button variant="outline" onClick={async () => { await request('/api/v1/auth/logout','POST'); client.clear(); setMessage('Signed out.'); }}>Sign out</Button></div>}
 {action !== 'account' && <form noValidate className="space-y-4" onSubmit={form.handleSubmit(submit)}>
 <div><label htmlFor="email">Email</label><Input id="email" type="email" autoComplete="email" {...form.register('email')} aria-invalid={!!form.formState.errors.email} aria-describedby="email-error"/><p id="email-error" role="alert">{form.formState.errors.email?.message}</p></div>
 {needsPassword && <div><label htmlFor="password">Password</label><Input id="password" type="password" autoComplete={action === 'login' ? 'current-password' : 'new-password'} {...form.register('password')} aria-describedby="password-help"/><p id="password-help" className="text-sm text-slate-600">12–128 characters, including uppercase, lowercase, a number and a symbol.</p></div>}
 <Button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Working...' : title[action]}</Button></form>}
 {twoFactor && <form className="mt-4 space-y-3" onSubmit={async e => { e.preventDefault(); try { await request('/api/v1/auth/two-factor','POST',{code}); client.clear(); setTwoFactor(false); setMessage('Signed in.'); } catch(e) { setError((e as Error).message); } }}><label htmlFor="code">Authenticator code</label><Input id="code" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)}/><Button>Verify code</Button></form>}
 {message && <p role="status" className="mt-4">{message}</p>}{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
 <nav aria-label="Account actions" className="mt-6 flex flex-wrap gap-4 underline"><Link to="/login">Sign in</Link><Link to="/register">Register</Link><Link to="/forgot">Forgot password</Link><Link to="/resend">Resend verification</Link><Link to="/security">Authenticator setup</Link></nav>
 </div></>;
}


