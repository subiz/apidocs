import {createHash} from 'node:crypto';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parse} from 'yaml';
import {endpoints} from '../src/lib/endpoints.ts';

export function parsePage(raw) {
  const match=raw.replace(/\r\n/g,'\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!match) throw new Error('Missing YAML frontmatter');
  return {data:parse(match[1]),body:match[2],raw};
}
function stable(value) {
  if(Array.isArray(value)) return value.map(stable);
  if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
  return value;
}
export function sourceHash(page,metadata=endpoints) {
  const {sourceHash:ignored,...data}=page.data;
  const endpoint=data.endpointId?metadata[data.endpointId]:null;
  if(data.endpointId&&!endpoint) throw new Error('Unknown endpoint: '+data.endpointId);
  return createHash('sha256').update(JSON.stringify(stable({data,body:page.body,endpoint}))).digest('hex');
}
export function stamp(raw,hash) {
  return raw.match(/^sourceHash:/m)?raw.replace(/^sourceHash:.*$/m,`sourceHash: ${hash}`):raw.replace(/^---\r?\n/,`---\nsourceHash: ${hash}\n`);
}
export async function inventory(root=resolve('src/content/docs')) {
  const pages=new Map();
  for(const file of await readdir(root,{recursive:true})) {
    if(!/\.mdx?$/.test(file))continue;
    const path=resolve(root,file);const page=parsePage(await readFile(path,'utf8'));
    if(page.data.status==='draft')continue;
    pages.set(file.replace(/\.mdx?$/,''),{...page,path});
  }
  const rows=[];
  for(const [id,en] of pages) {
    if(id.startsWith('vi/'))continue;
    const vi=pages.get('vi/'+id),hash=sourceHash(en);
    rows.push({id,hash,englishCurrent:en.data.sourceHash===hash,status:!vi?(en.data.translationPending?'pending':'missing'):!vi.data.sourceHash?'untracked':vi.data.sourceHash===hash?'current':'stale',en,vi});
  }
  for(const [id,page] of pages)if(id.startsWith('vi/')&&!pages.has(id.slice(3)))rows.push({id,status:'orphan',en:page});
  return rows.sort((a,b)=>a.id.localeCompare(b.id));
}
async function main() {
  const [command='status',id,...args]=process.argv.slice(2);const rows=await inventory();
  if(command==='sync') {
    for(const row of rows)if(row.hash)await writeFile(row.en.path,stamp(row.en.raw,row.hash));
    console.log('Updated English source hashes. Vietnamese review hashes are unchanged.');return;
  }
  if(command==='mark') {
    const row=rows.find(r=>r.id===id),expected=args[args.indexOf('--hash')+1];
    if(!row?.vi||!args.includes('--hash')||expected!==row.hash)throw new Error('Use mark <English page ID> --hash <current hash> after reviewing the translation.');
    for(const page of [row.en,row.vi])await writeFile(page.path,stamp(page.raw,row.hash));
    console.log('Translation reviewed: '+id);return;
  }
  if(!['status','check'].includes(command))throw new Error('Expected status, sync, mark, or check');
  const report=rows.map(({id,hash,englishCurrent,status})=>({id,hash,englishCurrent,status}));
  if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
  else for(const row of report)console.log(`${row.status.padEnd(9)} ${row.id}${row.englishCurrent?'':' (English hash needs sync)'}\n          ${row.hash||''}`);
  if(command==='check'&&report.some(r=>r.status!=='current'||!r.englishCurrent))process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(e=>{console.error(e.message);process.exitCode=1});
