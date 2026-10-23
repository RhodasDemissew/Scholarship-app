import { test, expect } from '@playwright/test';
test('C07 live explorer filters, validation, detail evidence and pagination',async({page,request:api})=>{
 await page.goto('/');
 await expect(page.getByRole('article')).toHaveCount(3);
 await page.getByLabel('Search opportunities',{exact:true}).fill('x'.repeat(81));
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveText('Use 80 characters or fewer.');
 await page.getByLabel('Search opportunities',{exact:true}).fill('not-a-programme');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByText('No matching opportunities',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Clear',exact:true}).click();
 await page.getByLabel('Country',{exact:true}).selectOption('Switzerland');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByRole('article')).toHaveCount(1);
 await page.getByRole('link',{name:/View details and evidence/}).click();
 await expect(page.getByRole('heading',{name:'Funding breakdown'})).toBeVisible();
 await expect(page.getByText('Source timezone: Europe/Zurich')).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:'Source evidence'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Official programme ↗'})).toHaveAttribute('href',/^https:\/\/ethz.ch/);
 const first=await (await api.get('/api/v1/opportunities?page=1&pageSize=1')).json();
 const second=await (await api.get('/api/v1/opportunities?page=2&pageSize=1')).json();
 expect(first.total).toBe(3);expect(first.items[0].id).not.toBe(second.items[0].id);
 expect((await api.get('/api/v1/opportunities?pageSize=101')).status()).toBe(400);
 await page.goto('/?q=Cambridge');
 await page.getByRole('link',{name:/View details and evidence/}).click();
 await expect(page.getByText(/Conflicting official dates/)).toBeVisible();
 await expect(page.getByText('Needs confirmation — no precise date is asserted.')).toBeVisible();
});
test('loading, failed API request and retry recovery',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});
 await page.route('**/api/v1/opportunities?**',async route=>{await gate;await route.fulfill({status:503,body:'Unavailable'});});
 await page.goto('/');
 await expect(page.getByRole('status')).toHaveText('Loading opportunities...');
 release();
 await expect(page.getByRole('alert')).toContainText("We couldn't load opportunities");
 await page.unroute('**/api/v1/opportunities?**');
 await page.getByRole('button',{name:'Try again'}).click();
 await expect(page.getByRole('article')).toHaveCount(3);
});
test('empty catalogue and unknown routes',async({page})=>{
 await page.route('**/api/v1/opportunities?**',route=>route.fulfill({json:{items:[],total:0,page:1,pageSize:6}}));
 await page.goto('/');await expect(page.getByText('No matching opportunities',{exact:true})).toBeVisible();
 await page.goto('/missing');await expect(page.getByRole('heading',{name:'Page not found'})).toBeVisible();
});
test('Swagger executes the documented catalogue',async({page})=>{
 await page.goto('http://127.0.0.1:5080/swagger');
 await page.getByRole('button',{name:'GET /api/v1/opportunities',exact:true}).click();
 await page.getByRole('button',{name:'Try it out'}).click();
 await page.getByRole('button',{name:'Execute',exact:true}).click();
 await expect(page.locator('.responses-inner')).toContainText('isFictional');
});

