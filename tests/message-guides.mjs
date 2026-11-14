import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {inventory,parsePage} from '../scripts/translations.mjs';
import {navigationPages} from '../src/lib/navigation.ts';
const ids=['messages/formats','messages/attachments'];
const pending=(await inventory()).filter(row=>row.status==='pending').map(row=>row.id);
assert(ids.every(id=>pending.includes(id)));
for(const id of ids){
 const source=parsePage(await readFile(`src/content/docs/${id}.mdx`,'utf8'));
 assert.equal(source.data.translationPending,true);
 const html=await readFile(`dist/${id}/index.html`,'utf8');
 assert(!html.includes('hreflang="vi"'));
 assert(!html.includes(`/developers/vi/${id}`));
 await assert.rejects(access(`dist/vi/${id}/index.html`));
 const md=await readFile(`dist/${id}.md`,'utf8');
 assert(md.includes('# '+source.data.title));
 assert((await readFile('dist/llms.txt','utf8')).includes(`/developers/${id}.md`));
 for(const [,language,body] of md.matchAll(/```(json|http)\n([\s\S]*?)\n```/g)){
  const value=JSON.parse(language==='json'?body:body.split('\n\n').slice(1).join('\n\n'));
  if(language==='http'){assert.equal(value.type,'message_sent');assert(value.data.message)}
 }
}
const config={sections:['Messages'],items:{Messages:[{id:'messages/formats',en:'Message formats',vi:'Định dạng tin nhắn'}]}};
const fixture={id:'messages/formats',data:{title:'Message formats',section:'Messages',translationPending:true}};
assert.equal(navigationPages([fixture],'en',config).length,1);
assert.equal(navigationPages([fixture],'vi',config).length,0);
assert.throws(()=>navigationPages([{...fixture,data:{...fixture.data,translationPending:false}}],'vi',config),/missing published page/);
assert.throws(()=>navigationPages([],'en',config),/missing published page/);
console.log('PASS: message guide JSON/HTTP, exports, explicit translation backlog, no absent-locale routes/links, strict navigation validation');
