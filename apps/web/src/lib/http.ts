let csrf: string | undefined;
export async function request<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
 if (method !== 'GET' && !csrf) {
  const result = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin' });
  if (!result.ok) throw new Error('Could not secure the request. Try again.');
  csrf = (await result.json()).token;
 }
 const response = await fetch(path, { method, credentials: 'same-origin', headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(method === 'GET' ? {} : { 'X-CSRF-TOKEN': csrf! }) }, body: body === undefined ? undefined : JSON.stringify(body) });
 if (['/login','/logout','/two-factor','/mfa/enable'].some(s => path.endsWith(s))) csrf = undefined;
 if (!response.ok) {
  const error = await response.json().catch(() => ({}));
  throw new Error(error.title || (response.status === 401 ? 'Please sign in.' : response.status === 403 ? 'You do not have access.' : 'Request failed. Try again.'));
 }
 return response.status === 204 ? undefined as T : response.json();
}

