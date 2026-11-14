import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import {inventory} from '../scripts/translations.mjs';
const pages=['receiving','payloads'];
for(const name of pages) {
 const md=await readFile(`dist/webhooks/${name}.md`,'utf8');
 assert(!/```(?:javascript|python|java|go|bash)/.test(md));
 assert(md.includes('## '));
 for(const [,raw] of md.matchAll(/```json\n([\s\S]*?)\n```/g)) {
  const batch=JSON.parse(raw);assert(Array.isArray(batch.events));
  for(const event of batch.events){assert(event.id&&event.account_id&&event.type&&event.created&&event.data);}
 }
}
const payloads=await readFile('dist/webhooks/payloads.md','utf8');
assert.deepEqual([...payloads.matchAll(/```json\n([\s\S]*?)\n```/g)].map(([,raw])=>JSON.parse(raw).events[0].type),['message_sent','message_sent','user_created','user_info_updated','conversation_assigned','conversation_unassigned']);
const receiving=await readFile('dist/webhooks/receiving.md','utf8');
const request=receiving.match(/```http\nPOST [\s\S]*?\n\n([\s\S]*?)\n```/)[1];assert.equal(JSON.parse(request).events[0].type,'message_sent');
assert(receiving.includes('sha256=NEW_SECRET_DIGEST,PREVIOUS_SECRET_DIGEST'));
assert(receiving.includes('HTTP/1.1 200 OK'));
const rows=await inventory();
for(const name of pages){const row=rows.find(r=>r.id==='webhooks/'+name);assert(row.englishCurrent);assert(['stale','current'].includes(row.status));}
console.log('PASS: webhook HTTP/JSON examples and event types, exports, signing format, English hashes');

const examples=[...payloads.matchAll(/```json\n([\s\S]*?)\n```/g)].map(([,raw])=>JSON.parse(raw).events[0]);
assert.equal(examples[1].data.message.format,'block');
assert.equal(examples[1].data.message.block.content.map(node=>node.text).join(''),examples[1].data.message.text);
assert.equal(examples[1].data.message.block.content[1].bold,true);
assert(!('assignee' in examples.at(-1).data.conversation));
assert.equal(new Set(examples.map(event=>event.id)).size,examples.length);
assert(!payloads.includes('integration_id'));
const secret=receiving.match(/\| Secret \| `([^`]+)`/)[1];
const rawBody=receiving.match(/\| Raw body \| `([^`]+)`/)[1];
const digest=receiving.match(/X-Hub-Signature-256: sha256=([0-9a-f]{64})/)[1];
assert.equal(createHmac('sha256',secret).update(rawBody).digest('hex'),digest);
assert.notEqual(createHmac('sha256',secret).update(rawBody+'\n').digest('hex'),digest);
assert.notEqual(createHmac('sha256','wrong-secret').update(rawBody).digest('hex'),digest);
assert(receiving.includes('Subiz generates this value'));
assert(receiving.includes('https://app.subiz.com.vn/settings/webhooks'));
console.log('PASS: signature test vector, changed bytes/wrong secret rejection, rich blocks, unique event IDs, saved-secret setup guidance');
