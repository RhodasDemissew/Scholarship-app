import { test, expect } from '@playwright/test';
import { post, register, password } from './helpers';
import { editor } from './security-helpers';
import type { APIRequestContext } from '@playwright/test';
test('C05 drafts, evidence review, publication, stale edits, correction and archive', async ({ request: api, page }) => {
 await editor(api);
 const draft={title:'Workflow test '+Date.now(),institutionName:'Workflow University',domain:'workflow.example.test',country:'Test country',programmeName:'Workflow MSc',programmeUrl:'https://workflow.example.test/msc',awardName:null,sponsor:null,awardUrl:null,intakeLabel:'test-'+Date.now(),round:'main',isFictional:true,applicationStatus:'Unknown',deadlines:[],funding:[],evidence:[]};
 let response=await post(api,'/api/v1/editor/opportunities/',draft); expect(response.status(),await response.text()).toBe(200);
 let item=await response.json(); const id=item.id;
 expect((await (await api.get('/api/v1/opportunities?fictional=true&pageSize=100')).json()).items.some((x:any)=>x.id===id)).toBe(false);
 expect((await post(api,'/api/v1/editor/opportunities/',draft)).status()).toBe(409);
 expect((await post(api,`/api/v1/editor/opportunities/${id}/publish`,{version:item.version})).status()).toBe(400);
 item=await (await post(api,`/api/v1/editor/opportunities/${id}/submit`,{version:item.version})).json();
 expect((await post(api,`/api/v1/editor/opportunities/${id}/review`,{version:item.version})).status()).toBe(400);
 const csrf=await (await api.get('/api/v1/auth/csrf')).json();
 const input={...draft,evidence:[{field:'overview',sourceUrl:draft.programmeUrl,excerpt:'Fictional workflow fixture, not a real opportunity.'}]};
 response=await api.put(`/api/v1/editor/opportunities/${id}`,{data:{version:item.version,draft:input},headers:{'X-CSRF-TOKEN':csrf.token}}); expect(response.status(),await response.text()).toBe(200);
 const oldVersion=item.version; item=await response.json();
 expect((await api.put(`/api/v1/editor/opportunities/${id}`,{data:{version:oldVersion,draft:input},headers:{'X-CSRF-TOKEN':csrf.token}})).status()).toBe(409);
 for(const action of ['submit','review','publish']) { response=await post(api,`/api/v1/editor/opportunities/${id}/${action}`,{version:item.version}); expect(response.status(),await response.text()).toBe(200);item=await response.json(); }
 expect((await (await api.get('/api/v1/opportunities?fictional=true&pageSize=100')).json()).items.some((x:any)=>x.id===id)).toBe(true);
 await page.context().addCookies((await api.storageState()).cookies);
 await page.goto('/editor/'+id);
 await page.getByLabel('Listing title',{exact:true}).fill(draft.title+' corrected');
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await expect(page.getByText(/Status: Draft\./)).toBeVisible();
 expect((await (await api.get('/api/v1/opportunities?fictional=true&pageSize=100')).json()).items.some((x:any)=>x.id===id)).toBe(false);
 item=await (await api.get('/api/v1/editor/opportunities/'+id)).json();
 for(const action of ['submit','review','publish','archive']) item=await (await post(api,`/api/v1/editor/opportunities/${id}/${action}`,{version:item.version})).json();
 expect(item.publicationStatus).toBe('Archived');
 const audit=await (await api.get(`/api/v1/editor/opportunities/${id}/audit`)).json();
 expect(audit.map((x:any)=>x.action)).toContain('correct');
 expect(audit.some((x:any)=>x.changedFields.includes('Title'))).toBe(true);
 await post(api,'/api/v1/auth/logout');
 expect((await api.get('/api/v1/editor/opportunities/'+id)).status()).toBe(401);
});


