import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const context=await browser.newContext();
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [390,768,1440]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://127.0.0.1:4321/developers/api-reference/messages/send');
 assert.equal(await page.getByRole('tab').count(),0);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert(await page.locator('.brand img').evaluate(img=>img.complete&&img.naturalWidth>0));
 for(const mode of ['Light','Dark']) {
  await page.getByRole('radio',{name:mode,exact:true}).click();
  await page.waitForTimeout(100);
  assert.equal(await page.locator('html').getAttribute('data-astryx-theme'),'subiz');
  assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--color-accent').trim()),'#0d6efd');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(100);
  await page.screenshot({path:`screenshots/subiz-${width}-${mode.toLowerCase()}.png`,fullPage:true});
 }
 const content=await page.locator('.request-code pre').textContent();
 assert(content.startsWith('POST https://api.subiz.com.vn'));
 assert.equal(await page.locator('article button').count(),0);
 assert(await page.locator('.request-code pre').evaluate(el=>el.scrollWidth<=el.clientWidth));
}
for(const width of [390,768,1440]) {
 await page.setViewportSize({width,height:900});
 await page.goto('http://127.0.0.1:4321/developers/vi/api-reference/conversations/invite-agent');
 assert.equal(await page.getByRole('tab').count(),0);
 assert(await page.locator('.request-code pre').evaluate(el=>el.scrollWidth<=el.clientWidth));
 assert.equal(await page.locator('article button').count(),0);
 await page.locator('.request-code').screenshot({path:`screenshots/http-request-${width}.png`});
}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: exact primary color, logo, HTTP request wrapping without copy buttons at three widths in both modes');
