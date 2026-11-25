import {getCollection} from 'astro:content';
import {endpoints} from './endpoints';
import {localeOf,translationKey,localizedId,type Locale} from './i18n';
import {apiVersions,apiVersionLabel} from './api-versions';
import {docsBase,publicMarkdown} from './paths';
export function routeSlug(id:string){const key=translationKey(id);return (localeOf(id)==='vi'?'vi/':'')+(key==='introduction'?'':key)}
export const url=(id:string)=>docsBase+(routeSlug(id)?'/'+routeSlug(id).replace(/\/$/,''):'');
export const markdownSlug=(id:string)=>(translationKey(id)==='introduction'?(localeOf(id)==='vi'?'vi/index':'index'):id);
export const markdownUrl=(id:string)=>docsBase+'/'+markdownSlug(id)+'.md';
export async function docs(locale?:Locale){
 const all=(await getCollection('docs')).filter(p=>p.data.status!=='draft').sort((a,b)=>a.data.order-b.data.order||a.id.localeCompare(b.id));
 for(const p of all){
  if(p.data.endpointId&&!endpoints[p.data.endpointId])throw new Error('Invalid endpoint '+p.id);
  apiVersions(p.data);
  const counterpart=all.find(other=>other.id===localizedId(p.id,localeOf(p.id)==='en'?'vi':'en'));
  if(!counterpart){
   if(localeOf(p.id)==='en'&&p.data.translationPending)continue;
   throw new Error('Missing translation for '+p.id);
  }
  if(JSON.stringify(apiVersions(p.data))!==JSON.stringify(apiVersions(counterpart.data)))throw new Error('API version translation mismatch: '+p.id);
  for(const field of ['section','order','status','endpointId','requestPosition'] as const)if(p.data[field]!==counterpart.data[field])throw new Error('Translation metadata mismatch: '+p.id+' '+field);
 }
 return locale?all.filter(p=>localeOf(p.id)===locale):all;
}
export function markdown(p:Awaited<ReturnType<typeof docs>>[number]){
 const e=p.data.endpointId?endpoints[p.data.endpointId]:null;
 const request=e?'```http\n'+e.request+'\n```':'';
 const body=publicMarkdown(p.body||'');
 const content=p.data.requestPosition==='start'?[request,body]:[body,request];
 return '# '+p.data.title+'\n\n'+p.data.description+'\n\n'+apiVersionLabel(p.data,localeOf(p.id))+'\n\n'+(p.data.status==='example'?(localeOf(p.id)==='vi'?'> API minh họa — chưa xác minh\n\n':'> Example API — not verified\n\n'):'')+content.filter(Boolean).join('\n\n');
}
