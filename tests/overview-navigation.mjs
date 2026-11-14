import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base='http://127.0.0.1:4321/developers';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(/hydration|did not match|Minified React error/i.test(m.text()))errors.push(m.text())});
 for(const width of [390,768,1440]) {
  await page.setViewportSize({width,height:1000});await page.goto(base);
  assert.equal(await page.locator('body>header .brand').getAttribute('href'),'https://subiz.com.vn/');
  assert.equal(await page.locator('#sidebar a[href*="get-started/concepts"]').count(),0);
  assert.equal(await page.locator('article pre').count(),15);
  assert.equal(await page.locator('.pagination a').getAttribute('href'),'/developers/get-started/authentication');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const language=page.getByRole('button',{name:'Language',exact:true});
  await language.click();
  assert.equal(await page.getByRole('menuitemradio',{name:'English',exact:true}).getAttribute('aria-checked'),'true');
  await page.waitForTimeout(200);await page.screenshot({path:`screenshots/language-dropdown-${width}.png`});
  await page.keyboard.press('Escape');await language.focus();await page.keyboard.press('ArrowDown');await page.waitForFunction(()=>document.activeElement?.getAttribute('role')==='menuitemradio');await page.keyboard.press('End');await page.waitForFunction(()=>document.activeElement?.textContent==='Tiếng Việt');await page.keyboard.press('Enter');
  await page.waitForURL(base+'/vi');assert.equal(await page.locator('html').getAttribute('lang'),'vi');
  await page.getByRole('button',{name:'Ngôn ngữ',exact:true}).click();await page.getByRole('menuitemradio',{name:'English',exact:true}).click();await page.waitForURL(base);
 }
 await page.goto(base+'/api-reference/messages/send');
 await page.getByRole('button',{name:'Language',exact:true}).click();await page.getByRole('menuitemradio',{name:'Tiếng Việt',exact:true}).click();await page.waitForURL(base+'/vi/api-reference/messages/send');
 await page.goto(base+'/get-started/errors');await page.getByRole('button',{name:'Language',exact:true}).click();
 assert.equal(await page.getByRole('menuitemradio').filter({hasText:'Tiếng Việt'}).getAttribute('aria-disabled'),'true');await page.keyboard.press('Escape');
 for(const [old,destination,anchor] of [
  ['/get-started/concepts','','rich-messages-with-blocks'],
  ['/vi/get-started/concepts','/vi','tin-nhắn-định-dạng-phong-phú-bằng-block'],
 ]) {
  await page.goto(base+old+'?from=bookmark#'+encodeURIComponent(anchor));
  await page.waitForURL(url=>url.pathname.replace(/\/$/,'')==='/developers'+destination&&url.search==='?from=bookmark'&&decodeURIComponent(url.hash)==='#'+anchor);
  await page.locator('[id="'+anchor+'"]').waitFor();assert.equal(await page.locator('[id="'+anchor+'"]').count(),1);
  const legacy=await page.request.get(base+old+'.md');assert.equal(legacy.status(),200);
  const overview=await page.request.get(base+destination+'/index.md');assert.equal(await legacy.text(),await overview.text());
  const raw=await readFile('dist'+old+'/index.html','utf8');assert(raw.includes('content="noindex"'));assert(!raw.includes('data-pagefind-body'));
 }
 const index=await (await page.request.get(base+'/llms.txt')).text();assert(!index.includes('/get-started/concepts.md'));
 const full=await (await page.request.get(base+'/llms-full.txt')).text();assert.equal((full.match(/^## How the entities fit together$/gm)||[]).length,1);
 await page.route('https://subiz.com.vn/',route=>route.fulfill({contentType:'text/html',body:'<title>Subiz homepage</title>'}));
 await page.goto(base);await page.locator('body>header .brand').click();await page.waitForURL('https://subiz.com.vn/');
 assert.deepEqual(errors,[]);
 console.log('PASS: homepage logo, responsive language dropdown/keyboard/disabled translation, same-topic switching, merged examples/navigation, legacy anchors and Markdown, unique LLM content; no runtime/hydration errors');
} finally {await browser.close()}
