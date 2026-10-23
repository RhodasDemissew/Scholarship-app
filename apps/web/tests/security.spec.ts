import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHmac } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { post, register, password } from './helpers';
import { totp, grant } from './security-helpers';
test('C02 privileged access requires role and MFA; throttling', async ({ request: api }) => {
 expect((await api.get('/api/v1/editor/access')).status()).toBe(401);
 const email = await register(api, 'security');
 expect((await api.get('/api/v1/editor/access')).status()).toBe(403);
 grant(email,'Editor');
 await post(api,'/api/v1/auth/login',{email,password});
 expect((await api.get('/api/v1/editor/access')).status()).toBe(403);
 const setup = await (await post(api,'/api/v1/auth/mfa/setup')).json();
 expect((await post(api,'/api/v1/auth/mfa/enable',{code:'000000'})).status()).toBe(400);
 expect((await post(api,'/api/v1/auth/mfa/enable',{code:totp(setup.key)})).ok()).toBeTruthy();
 expect((await api.get('/api/v1/editor/access')).status()).toBe(200);
 expect((await api.get('/api/v1/admin/access')).status()).toBe(403);
 await post(api,'/api/v1/auth/logout');
 expect((await (await post(api,'/api/v1/auth/login',{email,password})).json()).requiresTwoFactor).toBe(true);
 expect((await api.get('/api/v1/editor/access')).status()).toBe(401);
 expect((await post(api,'/api/v1/auth/two-factor',{code:totp(setup.key)})).ok()).toBeTruthy();
 expect((await api.get('/api/v1/editor/access')).status()).toBe(200);
 grant(email,'Administrator');
 await post(api,'/api/v1/auth/login',{email,password});
 await post(api,'/api/v1/auth/two-factor',{code:totp(setup.key)});
 expect((await api.get('/api/v1/admin/access')).status()).toBe(200);
 const statuses=[];
 for(let i=0;i<21;i++) statuses.push((await post(api,'/api/v1/auth/resend',{email:'absent@example.test'})).status());
 expect(statuses).toContain(429);
 mkdirSync('.local', { recursive: true });
 await api.storageState({ path: '.local/security-session.json' });
});


