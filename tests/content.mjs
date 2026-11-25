import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parsePage} from '../scripts/translations.mjs';
import {docsRedirects} from '../src/lib/redirects.ts';
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]))).flat()}
const all=await files('dist');const html=all.filter(f=>f.endsWith('.html'));
const contentFiles=(await files('src/content/docs')).filter(f=>/\.mdx?$/.test(f));
const expectedHtml=docsRedirects.map(({slug})=>'dist/'+slug+'/index.html');
for(const file of contentFiles){
 const {data}=parsePage(await readFile(file,'utf8'));
 if(data.status==='draft')continue;
 const id=file.replace('src/content/docs/','').replace(/\.mdx?$/,'');
 const slug=id==='introduction'?'':id==='vi/introduction'?'vi':id;
 expectedHtml.push('dist/'+(slug?slug+'/':'')+'index.html');
}
assert.deepEqual(html.filter(f=>!f.startsWith('dist/releases/')).sort(),expectedHtml.sort(),'Built HTML must match published documents and legacy redirects');
for(const f of html){const body=await readFile(f,'utf8');assert(!body.includes('data-markdown='),f+' has a copy button');for(const [,href] of body.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)){if(!href.startsWith('/')||href.startsWith('//'))continue;assert(href.startsWith('/developers'),`${f}: unscoped ${href}`);const path=href.split('?')[0].replace(/^\/developers(?=\/|$)/,'');assert(all.includes('dist'+path)||all.includes('dist'+path+'/index.html')||all.includes('dist'+path+'index.html'),`${f}: broken ${href}`)}}
const full=await readFile('dist/llms-full.txt','utf8');for(const title of ['Invite an agent','Assign an agent','Receive webhook events','Event payload examples'])assert(full.includes('# '+title));assert(!full.includes('api.example.com'));assert(!/^# Create a webhook$/m.test(full));assert(!full.includes('# List Contacts'));
assert(!/```(?:javascript|python|java|go|bash)/.test(full));
for(const file of await files('src/content/docs')){const text=await readFile(file,'utf8');for(const [,json] of text.matchAll(/```json\n([\s\S]*?)\n```/g))JSON.parse(json)}
console.log(`PASS: ${html.length} pages; internal links, exports, JSON examples`);

const english=(await files('src/content/docs')).filter(f=>f.endsWith('.mdx')&&!f.includes('/vi/'));
for(const file of english){const vi=file.replace('/docs/','/docs/vi/');const a=await readFile(file,'utf8');const b=await readFile(vi,'utf8').catch(error=>{if(error.code==='ENOENT'&&parsePage(a).data.translationPending)return null;throw error});if(b===null)continue;if(parsePage(a).data.sourceHash===parsePage(b).data.sourceHash)assert.deepEqual(a.match(/```[\s\S]*?```/g)||[],b.match(/```[\s\S]*?```/g)||[],file+' changed code in current translation');assert(!b.includes('](/docs/api-reference/'));}
console.log('PASS: declared pending translations excluded; current translations preserve code examples');
