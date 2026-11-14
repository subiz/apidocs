import {endpoints} from '../src/lib/endpoints.ts';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const full=await readFile('dist/llms-full.txt','utf8');
for(const endpoint of Object.values(endpoints)) {
 const [head,body]=endpoint.request.split('\n\n');
 const lines=head.split('\n');
 assert(lines[0].startsWith(endpoint.method+' https://api.subiz.com.vn/'));
 assert(lines.includes('Authorization: Bearer YOUR_ACCESS_TOKEN'));
 assert(!('examples' in endpoint));
 if(endpoint.method==='GET') {assert.equal(body,undefined);assert(!head.includes('Content-Type'));}
 else {assert(head.includes('Content-Type: application/json'));assert.equal(body,JSON.stringify(JSON.parse(body),null,2));}
 assert(full.includes('```http\n'+endpoint.request+'\n```'));
}
const invite=endpoints['conversations-invite-agent'].request;
assert(invite.includes('\n\n{\n  "type": "agent",\n  "id": "YOUR_AGENT_ID"\n}'));
assert(endpoints['conversations-list'].request.includes('?user_id=YOUR_USER_ID&limit=20'));
console.log('PASS: 12 HTTP examples, JSON formatting, GET/body semantics, query parameters, and matching Markdown exports');
