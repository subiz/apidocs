import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const base='http://127.0.0.1:4321';
const algolia=/https:\/\/[^/]+\.(algolia\.net|algolianet\.com)\//;
const hit=(url,title)=>({objectID:url,url,title:title+' · Subiz Developer Docs',description:'Documentation for '+title,content:'Page content'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let requests=0;
 await page.route(algolia,async route=>{
  requests++;
  assert(new URL(route.request().url()).hostname.toLowerCase().startsWith('s3b97bcq1o'), 'wrong Algolia application');
  const request=route.request().postDataJSON().requests[0];
  assert.equal(request.indexName,'subiz_com_vn_s3b97bcq1o_pages');
  assert.deepEqual(request.facetFilters,[]);
  await new Promise(resolve=>setTimeout(resolve,150));
  await route.fulfill({json:{results:[{query:request.query,nbHits:3,page:0,nbPages:1,hitsPerPage:12,processingTimeMS:0,hits:[
   hit('https://subiz.com.vn/docs/help/','Unrelated help'),
   hit('https://subiz.com.vn/developers/get-started/authentication#send-your-access-token','Authentication'),
   hit('javascript:alert(1)','Bad result'),
   hit('https://subiz.com.vn/developers/vi/get-started/authentication','Wrong language'),
   hit('https://subiz.com.vn/developers/get-started/concepts','Retired page'),
  ]}]}});
 });
 await page.goto(base+'/developers');
 await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
 assert.equal(await page.locator('meta[name="algolia-site-verification"]').getAttribute('content'),'A27D0201C3106098');
 const header=page.getByRole('searchbox',{name:'Search docs',exact:true});
 await header.fill('Bearer');
 const query=page.locator('.DocSearch-Input');
 await query.waitFor();assert.equal(await query.inputValue(),'Bearer');
 await page.waitForFunction(()=>document.querySelector('#search-provider')?.textContent==='Results from Algolia');
 assert.equal(await page.getByRole('option').count(),1);
 assert.equal(await page.getByRole('option').locator('a').getAttribute('href'),'/developers/get-started/authentication#send-your-access-token');
 const geometry=async()=>({modal:await page.locator('.DocSearch-Modal').boundingBox(),input:await query.boundingBox()});
 const initial=await geometry();
 await page.screenshot({path:"screenshots/docsearch-desktop.png"});
 const stable=async()=>{const rect=await geometry();for(const key of ['x','y','width','height'])assert(Math.abs(rect.modal[key]-initial.modal[key])<1,`modal ${key} moved`);assert.equal(rect.input.y,initial.input.y);};
 await query.fill('');await stable();await query.fill('Bearer');
 await page.waitForTimeout(400);assert.equal(requests,1);await stable();
 await page.unroute(algolia);await page.route(algolia,route=>route.fulfill({status:403,json:{message:'Unavailable',status:403}}));
 await query.fill('message');await stable();
 await page.waitForFunction(()=>document.querySelector('#search-provider')?.textContent==='Local results');
 assert(await page.getByRole('option').count()>0);await stable();
 await query.fill('zzzz-no-such-topic-zzzz');
 await page.locator('.DocSearch-NoResults').waitFor();await stable();
 await query.fill('Bearer');await page.getByRole('option').first().waitFor();
 await query.press('Enter');
 await page.waitForURL('**/developers/get-started/authentication#send-your-access-token');
 await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
 await page.keyboard.press('Control+k');await page.getByText('Recent',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Remove this search from history',exact:true}).click();
 await page.getByText('Recent',{exact:true}).waitFor({state:'hidden'});
 await page.keyboard.press('Escape');await page.locator('.DocSearch-Modal').waitFor({state:'hidden'});
 assert(await page.getByRole('searchbox',{name:'Search docs',exact:true}).evaluate(el=>el===document.activeElement));
 await page.getByRole('searchbox',{name:'Search docs',exact:true}).click();await query.waitFor();
 await page.getByRole('button',{name:'Close search',exact:true}).click();
 await page.locator('.DocSearch-Modal').waitFor({state:'hidden'});
 for(const width of [390,768]){
  await page.setViewportSize({width,height:844});await page.keyboard.press('Control+k');await query.waitFor();
  const before=await page.locator('.DocSearch-Modal').boundingBox();
  await query.fill('message');await page.waitForFunction(()=>document.querySelector('#search-provider')?.textContent==='Local results');
  assert.deepEqual(await page.locator('.DocSearch-Modal').boundingBox(),before);
  assert(before.width<=width);assert(before.height<=844);
  const logo=await page.locator(".DocSearch-Logo").boundingBox();assert(logo.x+logo.width<=width,"Algolia attribution overflows");
  await page.screenshot({path:`screenshots/docsearch-${width}.png`});
  await page.keyboard.press('Escape');
 }
 await page.goto(base+'/developers/vi');await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));await page.keyboard.press('Control+k');await query.fill('khách hàng');
 await page.getByRole('option').first().waitFor();
 assert((await page.getByRole('option').locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')))).every(url=>url.includes('/developers/vi/')));
 assert.equal(await page.getByText('Recent',{exact:true}).count(),0);
 await page.keyboard.press('Escape');
 await page.getByRole('radio',{name:'Tối',exact:true}).click();await page.keyboard.press('Control+k');await query.waitFor();
 const dark=await page.locator('.DocSearch-Modal').evaluate(el=>getComputedStyle(el).backgroundColor);
 assert.equal(dark,'rgb(38, 38, 38)');
 await page.keyboard.press('Escape');await page.getByRole('radio',{name:'Hệ thống',exact:true}).click();
 await page.emulateMedia({colorScheme:'dark'});await page.keyboard.press('Control+k');await query.waitFor();
 assert.equal(await page.locator('.DocSearch-Modal').evaluate(el=>getComputedStyle(el).backgroundColor),dark);
 assert.deepEqual(errors,[]);
 console.log('PASS: official DocSearch, header input, fixed desktop/mobile geometry, scoped/cached Algolia results, Pagefind fallback, EN/VI, recent history, keyboard/focus, verification meta');
}finally{await browser.close()}
