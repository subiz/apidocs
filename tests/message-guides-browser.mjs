import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(/hydration|did not match|Minified React error/i.test(m.text()))errors.push(m.text())});
 await page.route('https://*-dsn.algolia.net/**',route=>route.fulfill({status:503,body:'Offline test'}));
 for(const name of ['formats','attachments'])for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:1000});
  await page.goto('http://127.0.0.1:4321/developers/messages/'+name);
  assert.equal(await page.locator('#sidebar [aria-current="page"]').getAttribute('href'),'/developers/messages/'+name);
  assert.equal(await page.getByRole('link',{name:'Tiếng Việt',exact:true}).count(),0);
  assert.equal(await page.locator('link[hreflang="vi"]').count(),0);
  for(const href of await page.locator('.toc a[href^="#"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))assert.equal(await page.locator(href).count(),1);
  for(const theme of ['Light','Dark']){
   await page.getByRole('radio',{name:theme,exact:true}).click();await page.waitForTimeout(100);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert(await page.locator('article p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
   assert.equal(await page.locator('article button,[data-markdown]').count(),0);
   await page.screenshot({path:`screenshots/message-${name}-${width}-${theme.toLowerCase()}.png`});
  }
  if(width===390){await page.getByRole('button',{name:'Menu',exact:true}).click();assert.equal(await page.locator('.drawer-links a[href="/developers/messages/'+name+'"]').count(),1);await page.keyboard.press('Escape')}
  if(width===1440){const anchor=name==='formats'?'#links-inside-a-block':'#images';await page.locator('.toc a[href="'+anchor+'"]').click();await page.waitForFunction(id=>document.querySelector('.toc a.active')?.getAttribute('href')===id,anchor);await page.screenshot({path:`screenshots/message-${name}-example.png`})}
 }
 await page.keyboard.press('Control+k');await page.locator('.DocSearch-Input').fill('quick_replies');await page.locator('[role="option"]').first().waitFor();assert((await page.locator('[role="option"]').allTextContents()).some(t=>t.includes('Attachments')));await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:4321/developers/get-started/errors');await page.locator('.pagination a').last().click();await page.waitForURL('**/developers/messages/formats');
 await page.locator('.pagination a').last().click();await page.waitForURL('**/developers/messages/attachments');
 await page.locator('.pagination a').last().click();await page.waitForURL('**/developers/api-reference/messages/send');
 assert.equal(await page.getByRole('button',{name:'Language',exact:true}).count(),1);
 await page.getByRole('button',{name:'Language',exact:true}).click();await page.getByRole('menuitemradio',{name:'Tiếng Việt',exact:true}).click();await page.waitForURL('**/developers/vi/api-reference/messages/send');
 assert.equal(await page.locator('#sidebar a[href*="/messages/formats"],#sidebar a[href*="/messages/attachments"]').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: new message guides, three widths/both themes, typography, navigation, anchors, local search, translation-pending behavior and existing language switch; no runtime/hydration errors');
}finally{await browser.close()}
