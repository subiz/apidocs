import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const context=await browser.newContext();
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://*-dsn.algolia.net/**',route=>route.fulfill({status:503,body:'Offline test'}));
 for(const name of ['receiving','payloads'])for(const width of [390,768,1440]) {
  await page.setViewportSize({width,height:1000});
  await page.goto('http://127.0.0.1:4321/developers/webhooks/'+name);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('#sidebar [aria-current=page]').count(),1);
  for(const href of await page.locator('.toc a[href^="#"]').evaluateAll(links=>links.map(l=>l.getAttribute('href'))))assert.equal(await page.locator(href).count(),1);
  assert.equal(await page.locator('[data-markdown]').count(),0);
  assert.equal(await page.getByRole('button',{name:/Copy Markdown|Copy code|Copy request/}).count(),0);
  const response=await page.request.get('http://127.0.0.1:4321/developers/webhooks/'+name+'.md');
  assert.equal(response.status(),200);assert((await response.text()).includes(name==='receiving'?'Create a webhook in Subiz':'Rich message blocks'));
  for(const mode of ['Light','Dark']) {
   await page.getByRole('radio',{name:mode,exact:true}).click();
   await page.waitForTimeout(150);
   assert.equal(await page.locator('html').getAttribute('data-theme'),mode.toLowerCase());
   assert(await page.locator('article p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
   assert(await page.locator('pre').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14));
   await page.screenshot({path:`screenshots/webhook-${name}-${width}-${mode.toLowerCase()}.png`});
  }
  if(width===1440){
   const anchor=name==='receiving'?'#verify-the-signature':'#rich-message-blocks';
   await page.locator('.toc a[href="'+anchor+'"]').click();
   await page.waitForFunction(id=>document.querySelector('.toc a.active')?.getAttribute('href')===id,anchor);
   assert((await page.locator(anchor).boundingBox()).y>=72);
   await page.screenshot({path:`screenshots/webhook-${name}-detail.png`});
  }
 }
 await page.keyboard.press('Control+k');await page.locator('#query').fill('user_info_updated');
 await page.locator('#results a').first().waitFor();
 assert((await page.locator('#results a').allTextContents()).some(t=>t.includes('Event payload')));
 assert.deepEqual(errors,[]);console.log('PASS: webhook pages at 390/768/1440 in both themes, typography, anchors and active TOC, no copy buttons, Markdown exports, search, no runtime errors');
}finally{await browser.close()}
