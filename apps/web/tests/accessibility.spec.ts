import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { editor } from './security-helpers';

test('C09 responsive widths, keyboard, enlarged text, long content and public accessibility',async({page,request:api})=>{
 test.setTimeout(120000);
 const catalogue=await(await api.get('/api/v1/opportunities')).json();
 const detail='/opportunities/'+catalogue.items[0].id;
 for(const path of ['/',detail,'/register','/saved']){
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toBeVisible();
  if(path==='/')await expect(page.getByRole('article')).toHaveCount(3);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  for(const width of [320,375,480,640,768,1024,1440,1920,2560]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),path+' width '+width).toBe(true);
  }
 }
 await page.setViewportSize({width:1280,height:900});await page.goto('/');
 for(const scale of [2,4]){
  await page.setViewportSize({width:1280/scale,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.setViewportSize({width:1280,height:900});
  await page.evaluate(s=>{document.documentElement.style.zoom=String(s);},scale);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 }
 await page.evaluate(()=>{document.documentElement.style.zoom='1';document.documentElement.style.fontSize='200%';});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('#main')).toBeFocused();
 await page.getByRole('link',{name:'About',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('#main')).toBeFocused();
 await expect(page).toHaveTitle('About | Scholarship Assistant');
 await page.goto('/register');await page.getByRole('button',{name:'Create your account'}).click();
 await expect(page.getByLabel('Email',{exact:true})).toBeFocused();
 await expect(page.getByText('Enter a valid email address.',{exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.goto('/');await expect(page.getByRole('article')).toHaveCount(3);
 await page.locator('article h2').first().evaluate(el=>{el.textContent='A very long programme title '+ 'unbroken'.repeat(50);});
 await page.setViewportSize({width:320,height:900});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/c09-long-title-320.png',fullPage:true});
 await page.goto('/');await expect(page.getByRole('article')).toHaveCount(3);
 await page.screenshot({path:'test-results/c09-explorer-320.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.goto(detail);
 await expect(page.getByRole('heading',{name:'Source evidence'})).toBeVisible();
 await page.screenshot({path:'test-results/c09-detail-1440.png',fullPage:true});
});

test('C09 editor forms reflow, accessible controls and error state',async({page,request:api})=>{
 test.setTimeout(90000);await editor(api);await page.context().addCookies((await api.storageState()).cookies);
 await page.goto('/editor/new');await expect(page.getByLabel('Listing title',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Add deadline'}).click();await page.getByRole('button',{name:'Add evidence',exact:true}).click();
 for(const width of [320,480,768,1280,2560]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Complete the title');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.setViewportSize({width:320,height:900});await page.screenshot({path:'test-results/c09-editor-320.png',fullPage:true});
});

