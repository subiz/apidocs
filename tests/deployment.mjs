import assert from 'node:assert/strict';
import http from 'node:http';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:4321';
const request = path => new Promise((resolve,reject) => {
  http.get(origin + path, {headers:{Host:'subiz.com.vn'}}, response => {
    const chunks=[];
    response.on('data',chunk=>chunks.push(chunk));
    response.on('end',()=>resolve(new Response(Buffer.concat(chunks), {status:response.statusCode,headers:response.headers})));
    response.on('error',reject);
  }).on('error',reject);
});
for (const path of ['/developers', '/developers/webhooks/receiving', '/developers/vi/webhooks/receiving']) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert(html.includes(`rel="canonical" href="https://subiz.com.vn${path}"`));
  for (const [,asset] of html.matchAll(/(?:src|href|component-url|renderer-url)="(\/developers\/_astro\/[^"?#]+)"/g)) {
    const resource = await request(asset);
    assert.equal(resource.status, 200, asset);
    if (asset.endsWith('.css')) assert.match(resource.headers.get('content-type'), /text\/css/);
    if (asset.endsWith('.js')) assert.match(resource.headers.get('content-type'), /javascript/);
  }
  assert(!html.includes('href="/docs'));
}
for (const path of ['/developers/webhooks/receiving.md', '/developers/index.md', '/developers/llms.txt', '/developers/llms-full.txt', '/developers/pagefind/pagefind.js']) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  const body = await response.text();
  assert(!body.includes('](/docs/'), path);
  assert(!body.startsWith('<!DOCTYPE'), path);
}
assert.equal((await request('/developers/not-a-published-page')).status, 404);
assert.equal((await request('/developers/_astro/missing.js')).status, 404);
console.log('PASS: deployment paths, canonical URLs, hydrated assets/MIME types, Markdown, LLM exports, Pagefind and real 404s');
