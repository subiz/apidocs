import assert from 'node:assert/strict';
import {parsePage,sourceHash,stamp,inventory} from '../scripts/translations.mjs';
const page=parsePage('---\ntitle: Test\nendpointId: test\n---\nOriginal prose\n');
const endpoint={test:{path:'/test',examples:[]}};
const hash=sourceHash(page,endpoint);
assert.equal(sourceHash(parsePage(stamp(page.raw,hash)),endpoint),hash);
assert.notEqual(sourceHash({...page,body:'Changed prose'},endpoint),hash);
assert.notEqual(sourceHash({...page,data:{...page.data,title:'Changed'}},endpoint),hash);
assert.notEqual(sourceHash(page,{test:{...endpoint.test,path:'/changed'}}),hash);
assert.equal(sourceHash(page,{...endpoint,unrelated:{path:'/other'}}),hash);
assert.equal(sourceHash(parsePage(page.raw.replaceAll('\n','\r\n')),endpoint),hash);
const rows=await inventory();assert.equal(rows.length,20);assert(rows.every(r=>r.englishCurrent));
assert(rows.every(r=>['current','stale','pending'].includes(r.status)));
console.log('Translations awaiting review:',rows.filter(r=>r.status==='stale').map(r=>r.id).join(', ')||'none');
console.log('PASS: source, metadata and endpoint changes detected; unrelated edits excluded; English hashes current; stale translations remain detectable');

assert.deepEqual(rows.filter(r=>r.status==='pending').map(r=>r.id),['get-started/errors','get-started/usage-limits','messages/attachments','messages/formats']);
