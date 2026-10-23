import { expect, type APIRequestContext } from '@playwright/test';
export const password = 'Test-only-Pass123!';
export async function post(api: APIRequestContext, path: string, data: unknown = {}) {
 const csrf = await (await api.get('/api/v1/auth/csrf')).json();
 return api.post(path, { data, headers: { 'X-CSRF-TOKEN': csrf.token } });
}
export async function mailLink(api: APIRequestContext, email: string, route: string) {
 let link = '';
 await expect.poll(async () => {
  const list = await (await api.get('http://127.0.0.1:8025/api/v1/messages')).json();
  for (const item of list.messages ?? []) {
   if (item.To?.some((to: { Address: string }) => to.Address === email) && item.Subject.endsWith(route)) {
    const message = await (await api.get('http://127.0.0.1:8025/api/v1/message/' + item.ID)).json();
    link = message.Text.match(/http[^\s]+/)?.[0] ?? '';
    return !!link;
   }
  }
  return false;
 }).toBe(true);
 return new URL(link);
}
export async function register(api: APIRequestContext, prefix = 'applicant') {
 const email = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
 expect((await post(api, '/api/v1/auth/register', { email, password })).ok()).toBeTruthy();
 const link = await mailLink(api, email, 'verify');
 expect((await post(api, '/api/v1/auth/verify', { email, token: link.searchParams.get('token') })).ok()).toBeTruthy();
 expect((await post(api, '/api/v1/auth/login', { email, password })).ok()).toBeTruthy();
 return email;
}
