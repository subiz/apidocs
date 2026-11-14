import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'dark'});
 await page.goto('http://127.0.0.1:4321/developers/get-started/authentication');
 const groups=page.locator('[data-docs-sidebar] details');
 const expanded=async()=>assert.equal(await groups.evaluateAll(nodes=>nodes.filter(n=>n.open).length),7);
 await expanded();
 for(const group of await groups.all()){
   await group.locator('summary').click();assert.equal(await group.getAttribute('open'),null);
   await group.locator('summary').press('Enter');assert.notEqual(await group.getAttribute('open'),null);
 }
 await page.locator('#sidebar summary').filter({hasText:'Users'}).click();
 await page.reload();await expanded();
 await page.locator('#sidebar a').filter({hasText:'Invite an agent'}).click();
 await page.waitForURL('**/conversations/invite-agent');await expanded();
 assert.equal(await page.locator('#sidebar [aria-current=page]').textContent(),'Invite an agent');
 await page.locator('#sidebar summary').filter({hasText:'Webhooks'}).click();
 await page.goBack();await expanded();
 await page.goForward();await expanded();
 for(const locale of ['', '/vi']) {
  await page.goto('http://127.0.0.1:4321/developers'+locale);
  assert.deepEqual(await page.locator('#sidebar summary').allTextContents(),locale?['Bắt đầu','Hội thoại và tin nhắn','Khách hàng','Đơn hàng','Sản phẩm','Webhook','Cập nhật']:['Get Started','Conversations & Messages','Customers (Users)','Orders','Products','Webhooks','Updates']);
  assert.equal(await page.locator('#sidebar .nav-planned').count(),8);
  assert.equal(await page.locator('#sidebar .nav-review-note').count(),2);
  const expected=['introduction', 'get-started/concepts', 'get-started/authentication', ...(!locale?['messages/formats','messages/attachments']:[]), 'api-reference/messages/send', 'api-reference/messages/send-to-user', 'api-reference/conversations/retrieve', 'api-reference/conversations/history', 'api-reference/conversations/invite-agent', 'api-reference/conversations/assign-agent', 'api-reference/users/create', 'api-reference/users/retrieve', 'api-reference/users/update', 'api-reference/users/identity', 'webhooks/receiving', 'webhooks/payloads','changelog'].map(id=>'/developers'+locale+(id==='introduction'?'':'/'+id));
  assert.deepEqual(await page.locator('#sidebar a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),expected);
  await page.goto('http://127.0.0.1:4321/developers'+locale+'/get-started/authentication');
  assert.deepEqual(await page.locator('.pagination a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),[expected[1],expected[3]]);
  await page.setViewportSize({width:390,height:900});
  await page.getByRole('button',{name:locale?'Danh mục':'Menu',exact:true}).click();
  assert.deepEqual(await page.locator('.drawer-links a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),expected);
  assert.equal(await page.locator('.drawer-links .nav-planned').count(),8);
  assert.equal(await page.locator('.drawer-links .nav-review-note').count(),2);
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4321/developers'+locale+'/api-reference/conversations/list');
  assert.equal(await page.locator('.pagination a').count(),0);
  assert.equal(await page.locator('#sidebar a[href$="/conversations/list"]').count(),0);
 }
 await page.goto('http://127.0.0.1:4321/developers/vi');
 await page.locator('#sidebar').screenshot({path:'screenshots/sidebar-review.png'});
 console.log('PASS: sidebar groups expand by default; mouse/keyboard toggling, links, reload, history navigation, reviewed order in both locales, mobile and pagination');
}finally{await browser.close()}
