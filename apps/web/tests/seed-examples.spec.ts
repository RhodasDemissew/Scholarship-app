import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { editor } from './security-helpers';
import { post } from './helpers';
test('C06 explicitly seed three reviewed official-source examples through editorial workflow', async ({ request: api }) => {
 test.skip(process.env.SEED_EXAMPLES !== '1', 'Explicit local content-loading operation only.');
 test.setTimeout(60000);
 await editor(api);
 const data=JSON.parse(readFileSync('../../docs/data/verified-examples.json','utf8').replace(/^\uFEFF/,''));
 const existing=await (await api.get('/api/v1/editor/opportunities/')).json();
 for(const draft of data.records) {
  const match=existing.find((x:any)=>x.title===draft.title);
  if(match) { expect(match.publicationStatus).toBe('Published'); continue; }
  let response=await post(api,'/api/v1/editor/opportunities/',draft);
  expect(response.status(),await response.text()).toBe(200);
  let item=await response.json();
  for(const action of ['submit','review','publish']) {
   response=await post(api,`/api/v1/editor/opportunities/${item.id}/${action}`,{version:item.version});
   expect(response.status(),await response.text()).toBe(200); item=await response.json();
  }
  expect(item.lastReviewedAt).not.toBeNull();
 }
 const published=await (await api.get('/api/v1/opportunities')).json();
 expect(published.filter((x:any)=>!x.isFictional)).toHaveLength(3);
});
