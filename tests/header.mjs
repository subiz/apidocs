import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/developers','/developers/get-started/errors','/developers/vi']){
  await page.goto('http://127.0.0.1:4321'+path);
  await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
  for(const width of [320,390,700,701,768,1000,1440,1620]){
   await page.setViewportSize({width,height:900});
   const header=await page.locator('body>header').boundingBox();
   const brand=await page.locator('body>header .brand').boundingBox();
   await page.waitForFunction(()=>{const field=document.querySelector('.docs-search-field');return innerWidth>700?!!field?.closest('#sidebar-search'):!!field?.closest('.mobile-search');});
   assert.equal(await page.getByRole('searchbox').count(),1);
   const search=await page.locator('.docs-search-field').boundingBox();
   const actions=await page.locator('.header-actions').boundingBox();
   const cta=page.locator('.header-navigation a');
   assert.equal(await cta.getAttribute('href'),'https://app.subiz.com.vn/');
   const colors=await cta.evaluate(el=>({text:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
   assert.notEqual(colors.text,colors.background,'CTA text is invisible');
   const ctaBox=await cta.boundingBox();
   assert(Math.abs(ctaBox.x+ctaBox.width-actions.x-actions.width)<1,'CTA is not at the right edge');
   assert.equal(await page.getByRole('radio').locator('svg').count(),3);
   assert(search.width>=120,`search too narrow: ${path} ${width}`);
   for(const rect of [brand,actions]){
    assert(rect.x>=header.x&&rect.x+rect.width<=header.x+header.width,`horizontal overflow: ${path} ${width}`);
    assert(rect.y>=header.y&&rect.y+rect.height<=header.y+header.height,`vertical overflow: ${path} ${width}`);
   }
   const center=r=>r.y+r.height/2;
   if(width>700){
    assert(Math.abs(center(brand)-center(actions))<1,`header controls wrapped: ${path} ${width}`);
    const sidebar=await page.locator('#sidebar').boundingBox();
    const nav=await page.locator('[data-docs-sidebar]').boundingBox();
    assert(search.x>=sidebar.x&&search.x+search.width<=sidebar.x+sidebar.width,`search outside sidebar: ${path} ${width}`);
    assert(search.y+search.height<=nav.y,`search overlaps navigation: ${path} ${width}`);
    await page.locator('[data-docs-sidebar]').evaluate(el=>{el.scrollTop=300});
    assert.deepEqual(await page.locator('.docs-search-field').boundingBox(),search,'sidebar search moved with navigation');
    await page.locator('[data-docs-sidebar]').evaluate(el=>{el.scrollTop=0});
   }else{
    assert(Math.abs(center(brand)-center(search))<1,`mobile search misaligned: ${path} ${width}`);
    assert(search.x>=brand.x+brand.width&&search.x+search.width<=header.x+header.width,`mobile search overflow: ${path} ${width}`);
    assert(actions.y>=search.y+search.height,`mobile rows overlap: ${path} ${width}`);
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`page overflow: ${path} ${width}`);
   if(path==='/developers'&&[390,1620].includes(width))await page.screenshot({path:`screenshots/sidebar-layout-${width}.png`});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: sidebar search pinned above scrolling navigation, mobile header search, one input, 320–1620px, EN/VI, no overlap or overflow');
}finally{await browser.close()}
