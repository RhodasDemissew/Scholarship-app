import { useState } from 'react';
import { request } from '@/lib/http';
import { useSession } from './auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function SecuritySettings() {
 const session = useSession();
 const [key, setKey] = useState('');
 const [code, setCode] = useState('');
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 return <><h1>Account security</h1><div className="panel mt-6 space-y-4">
 <p>Editors and administrators must enable an authenticator before accessing editorial tools. Keep access to your authenticator; self-service MFA recovery is not available in this local milestone.</p>
 {!session.data?.authenticated ? <a href="/login">Sign in first</a> : <>
 <Button onClick={async () => { setError(''); try { setKey((await request('/api/v1/auth/mfa/setup','POST')).key); } catch(e) { setError((e as Error).message); } }}>Set up authenticator</Button>
 {key && <><p>Add a time-based account to your authenticator with this secret key:</p><code className="block break-all">{key}</code><p>Issuer: Scholarship Assistant. Account: {session.data.email}.</p><form onSubmit={async e => { e.preventDefault(); setError(''); try { const r=await request('/api/v1/auth/mfa/enable','POST',{code}); setMessage(r.message); setKey(''); } catch(e) {setError((e as Error).message);} }}><label htmlFor="authenticator">Authenticator code</label><Input id="authenticator" value={code} onChange={e=>setCode(e.target.value)} autoComplete="one-time-code"/><Button className="mt-3">Enable MFA</Button></form></>}
 </>}{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
 </div></>;
}

