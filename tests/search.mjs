import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let requests=0;
 await page.route('https://*-dsn.algolia.net/**',async route=>{
  requests++;const body=route.request().postDataJSON();assert.equal(new URLSearchParams(body.params).get('facetFilters'),'["docset:developers","language:en"]');
  await route.fulfill({json:{hits:[
   {url:'https://subiz.com.vn/docs/help/',hierarchy:{lvl1:'Unrelated help'}},
   {url:'https://subiz.com.vn/developers/get-started/authentication#send-your-access-token',hierarchy:{lvl1:'Authentication'},content:'Bearer token'},
   {url:'javascript:alert(1)',hierarchy:{lvl1:'Bad result'}},
  ]}});
 });
 await page.goto('http://127.0.0.1:4321/developers');await page.keyboard.press('Control+k');await page.locator('#query').fill('Bearer');await page.locator('#results a').waitFor();assert.equal(await page.locator('#results a').count(),1);assert.equal(await page.locator('#results a').getAttribute('href'),'/developers/get-started/authentication#send-your-access-token');assert.equal(await page.locator('#search-provider').textContent(),'Results from Algolia');
 await page.locator('#query').fill('');await page.locator('#query').fill('Bearer');await page.waitForTimeout(400);assert.equal(requests,1);
 await page.unroute('https://*-dsn.algolia.net/**');await page.route('https://*-dsn.algolia.net/**',route=>route.fulfill({status:503,body:'Unavailable'}));await page.locator('#query').fill('message');await page.waitForFunction(()=>document.querySelector('#search-provider').textContent.startsWith('Local results'));assert(await page.locator('#results a').count()>0);
 await page.keyboard.press('Escape');await page.locator('#search').waitFor({state:'hidden'});assert.deepEqual(errors,[]);console.log('PASS: Algolia response mapping, scope, unsafe URLs, cache, fallback, dialog');
}finally{await browser.close()}
