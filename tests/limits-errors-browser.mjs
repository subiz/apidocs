import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const base='http://127.0.0.1:4321/developers';
try {
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(/hydration|did not match|Minified React error/i.test(m.text()))errors.push(m.text())});
 await page.route('https://*-dsn.algolia.net/**',route=>route.fulfill({status:503,body:'Offline test'}));
 for(const slug of ['usage-limits','errors']) {
  const path='/get-started/'+slug;
  for(const width of [390,768,1440]) {
   await page.setViewportSize({width,height:1000});
   const res=await page.goto(base+path);assert.equal(res.status(),200);
   assert.equal(await page.locator('#sidebar [aria-current="page"]').getAttribute('href'),'/developers'+path);
   assert.equal(await page.locator('link[hreflang="vi"]').count(),0);
   for(const theme of ['Light','Dark']) {
    await page.getByRole('radio',{name:theme,exact:true}).click();
    await page.waitForFunction(value=>document.documentElement.dataset.theme===value,theme.toLowerCase());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug+' overflow '+width);
    assert(await page.locator('article p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
   }
   await page.getByRole('radio',{name:'Light',exact:true}).click();
   await page.screenshot({path:`screenshots/${slug}-${width}.png`});
   for(const href of await page.locator('.toc a[href^="#"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))assert.equal(await page.locator(href).count(),1);
   if(width===1440){const anchor=slug==='errors'?'#common-error-codes':'#message-limits';await page.locator('.toc a[href="'+anchor+'"]').click();await page.waitForFunction(id=>document.querySelector('.toc a.active')?.getAttribute('href')===id,anchor);await page.screenshot({path:`screenshots/${slug}-details.png`})}
   if(width===390){await page.getByRole('button',{name:'Menu',exact:true}).click();assert.equal(await page.locator('.drawer-links a[href="/developers'+path+'"]').count(),1);await page.keyboard.press('Escape')}
  }
  const md=await page.request.get(base+path+'.md');assert.equal(md.status(),200);
  assert(/markdown|text\/plain/.test(md.headers()['content-type']));
  const body=await md.text();assert(body.includes('# '+await page.locator('h1').textContent()));
  if(slug==='errors') {
   const example=body.match(/```http\n[\s\S]*?\n\n([\s\S]*?)\n```/)[1];
   const data=JSON.parse(example);assert.equal(data.error.attrs.maximum_size.value,'2048');assert.equal(data.error.attrs.maximum_size.type,'number');
  } else {
   const response=body.match(/```http\n([\s\S]*?)\n```/)[1];
   assert(response.startsWith('HTTP/1.1 429 Too Many Requests\nRetry-After: 1\n'));
   const data=JSON.parse(response.split('\n\n').slice(1).join('\n\n'));
   assert.equal(data.class,400);assert.equal(data.error.code,'rate_limit,limit_exceeded,invalid_input');
   assert(body.includes('144,000'));assert(body.includes('864,000'));assert(body.includes('00:00 UTC'));
   assert(body.includes('5 messages | 60 messages | 5,000 messages'));assert(body.includes('Include at most five candidates per request'));
  }
  for(const exportName of ['llms.txt','llms-full.txt']) {
   const res=await page.request.get(base+'/'+exportName);assert.equal(res.status(),200);
   assert((await res.text()).includes(exportName==='llms.txt'?path+'.md':'# '+await page.locator('h1').textContent()));
  }
 }
 await page.goto(base+'/get-started/authentication');
 for(const path of ['/get-started/usage-limits','/get-started/errors','/messages/formats']){
  await page.locator('.pagination a').last().click();await page.waitForURL(base+path);
 }
 await page.keyboard.press('Control+k');
 const query=page.locator('.DocSearch-Input');
 await query.fill('payload_too_large');
 await page.getByRole('option').filter({hasText:'Errors'}).first().waitFor();
 await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);
 console.log('PASS: usage limits/errors at 390,768,1440; both themes, navigation, anchors, mobile menu, local search, Markdown/LLM exports, error JSON, no runtime/hydration errors');
}finally{await browser.close()}
