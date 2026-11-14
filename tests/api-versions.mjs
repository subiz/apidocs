import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {apiVersions,apiVersionLabel} from '../src/lib/api-versions.ts';
import {endpoints} from '../src/lib/endpoints.ts';
for(const endpoint of Object.values(endpoints))assert.equal(apiVersionLabel({endpointId:endpoint.id}),'API '+endpoint.path.split('/')[1]);
assert.deepEqual(apiVersions({apiVersions:['4.0','4.1']}),['4.0','4.1']);
assert.equal(apiVersionLabel({apiScope:'webhook'}),'Webhook · Not tied to an API route version');
assert.throws(()=>apiVersions({}));
assert.throws(()=>apiVersions({endpointId:'messages-send',apiVersions:['4.0']}));
assert.throws(()=>apiVersions({endpointId:'missing'}));
assert.throws(()=>apiVersions({apiScope:'webhook',apiVersions:['4.1']}));
for(const [route,label] of [['api-reference/messages/send','API 4.1'],['api-reference/users/create','API 4.0'],['get-started/authentication','API 4.0 · 4.1'],['webhooks/receiving','Webhook · Not tied to an API route version']]){
 const html=await readFile(`dist/${route}/index.html`,'utf8');assert(html.includes('class="api-version"'));assert(html.includes(label));
 assert((await readFile(`dist/${route}.md`,'utf8')).includes(label));
}
console.log('PASS: endpoint-derived versions, shared applicability, webhook scope, invalid metadata rejection, HTML/Markdown labels');
