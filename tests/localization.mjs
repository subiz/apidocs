import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const context=await browser.newContext();
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://*-dsn.algolia.net/**',route=>route.fulfill({status:503,body:'Offline test'}));
 await page.goto('http://127.0.0.1:4321/developers');
 await page.getByRole('button',{name:'Language',exact:true}).click();await page.getByRole('menuitemradio',{name:'Tiếng Việt',exact:true}).click();await page.waitForURL('**/developers/vi');
 assert.equal(await page.locator('html').getAttribute('lang'),'vi');assert.equal(await page.locator('h1').textContent(),'API Subiz');assert((await page.locator('article').textContent()).includes('format: "block"'));
 assert.equal(await page.locator('.source-note').count(),0);
 const links=await page.locator('#sidebar a,.pagination a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));assert(links.every(l=>l.startsWith('/developers/vi')));
 assert.equal(await page.locator('[data-markdown]').count(),0);assert((await (await page.request.get('http://127.0.0.1:4321/developers/vi/get-started/concepts.md')).text()).includes('# API Subiz'));
 await page.keyboard.press('Control+k');await page.locator('.DocSearch-Input').fill('khách hàng');await page.locator('.DocSearch-Modal [role="option"]').first().waitFor();assert((await page.locator('.DocSearch-Modal [role="option"]').evaluateAll(nodes=>nodes.map(n=>n.querySelector('a').getAttribute('href')))).every(l=>/^\/developers\/vi(?:\/|#|$)/.test(l)));await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Ngôn ngữ',exact:true}).click();await page.getByRole('menuitemradio',{name:'English',exact:true}).click();await page.waitForURL('**/developers');
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4321/developers/vi/api-reference/conversations/list');await page.waitForTimeout(300);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('.endpoint code').textContent(),'https://api.subiz.com.vn/4.1/conversations');assert.equal(await page.locator('.endpoint strong').textContent(),'GET');await page.screenshot({path:`screenshots/vietnamese-${width}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);console.log('PASS: language counterparts, localized navigation/search/Markdown, rich blocks, endpoint URLs, badge removal and responsive layouts');
}finally{await browser.close()}
