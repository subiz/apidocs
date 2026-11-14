import type {DocSearchModalProps} from '@docsearch/modal/modal';
import type {Locale} from './i18n';

/** Public search-only credentials; never use an indexing/admin key here. */
export const algolia={
  appId:import.meta.env.PUBLIC_ALGOLIA_APP_ID||'S3B97BCQ1O',
  searchKey:import.meta.env.PUBLIC_ALGOLIA_SEARCH_KEY||'b16ee34120be49057d1c5a87359ca8f0',
  index:import.meta.env.PUBLIC_ALGOLIA_INDEX||'subiz_com_vn_s3b97bcq1o_pages',
};
type Transform=NonNullable<DocSearchModalProps['transformSearchClient']>;
type Client=Parameters<Transform>[0];
type Hit=Parameters<NonNullable<DocSearchModalProps['transformItems']>>[0][number];
type PageHit=Partial<Hit>&{objectID:string;url:string;title?:string;description?:string};
export type Provider='algolia'|'local'|'loading'|'error'|null;
export function documentationUrl(value:string,locale:Locale):string|null {
  try {
    const url=new URL(value,'https://subiz.com.vn');
    if(url.origin!=='https://subiz.com.vn'||!/^\/developers(?:\/|$)/.test(url.pathname))return null;
    if((/^\/developers\/vi(?:\/|$)/.test(url.pathname)?'vi':'en')!==locale)return null;
    return url.pathname+url.hash;
  }catch{return null;}
}

function localHit(row:{url:string;meta:{title:string};excerpt:string},locale:Locale){
  const url=documentationUrl(row.url,locale);
  if(!url)return null;
  return {
    objectID:url,url,url_without_anchor:url.split('#')[0],anchor:null,type:'lvl1',
    hierarchy:{lvl0:locale==='vi'?'Tài liệu API':'Developer documentation',lvl1:row.meta.title,lvl2:null,lvl3:null,lvl4:null,lvl5:null,lvl6:null},
    content:row.excerpt.replace(/<[^>]*>/g,''),
  };
}

// The current crawler stores one page per record, rather than DocSearch headings.
function hostedHit(hit:PageHit,locale:Locale) {
  if(hit.hierarchy)return hit;
  return {
    objectID:hit.objectID,url:hit.url,url_without_anchor:hit.url.split('#')[0],anchor:null,type:'content',
    hierarchy:{lvl0:locale==='vi'?'Tài liệu API':'Developer documentation',lvl1:(hit.title||hit.url).replace(/ · Subiz Developer Docs$/,''),lvl2:null,lvl3:null,lvl4:null,lvl5:null,lvl6:null},
    content:hit.description||hit.content?.slice(0,240)||'',
  };
}

/** DocSearch owns querying/caching. This adapter adds scoped Pagefind fallback. */
export function searchAdapter(locale:Locale,pages:{href:string}[],report:(provider:Provider)=>void):Transform {
  const allowed=(hit:{url:string})=>{
    const url=documentationUrl(hit.url,locale);
    return url&&pages.some(page=>page.href.replace(/\/$/,'')===url.split('#')[0].replace(/\/$/,''));
  };
  let latest=0;
  return client=>({...client,search:(async (body,options)=>{
    const generation=++latest;
    const requests=Array.isArray(body)?body:body.requests;
    // One virtual index isolates DocSearch's recent/favorite storage from /docs
    // and the other locale. Only the real index is sent to Algolia.
    const request=requests[0];
    const params='params' in request&&typeof request.params==='object'?request.params:request;
    const query=('query' in params?params.query:'')||'';
    const update=(provider:Provider)=>{if(generation===latest)report(provider);};
    update('loading');
    let timer:ReturnType<typeof setTimeout>|undefined;
    try {
      const response=await Promise.race([
        client.search<PageHit>({requests:[{...params,indexName:algolia.index,query,facetFilters:[],hitsPerPage:100,attributesToRetrieve:['objectID','url','title','description','content','hierarchy','type','anchor','url_without_anchor']}]},options),
        new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Search timeout')),4000);}),
      ]);
      const result=response.results[0];
      if('hits' in result){
        const hits=result.hits.filter(allowed).slice(0,12).map((hit:PageHit)=>hostedHit(hit,locale));
        if(hits.length){update('algolia');return {results:[{...result,hits,nbHits:hits.length}]};}
      }
    }catch{/* The installed static index remains available without hosted search. */}
    finally{clearTimeout(timer);}
    try {
      const path='/developers/pagefind/pagefind.js';
      const pagefind=await import(/* @vite-ignore */ path);
      await pagefind.options({baseUrl:'/developers/'});
      const found=await pagefind.search(query);
      const rows=await Promise.all(found.results.slice(0,12).map((r:{data:()=>Promise<Parameters<typeof localHit>[0]>})=>r.data()));
      const hits=rows.map(row=>localHit(row,locale)).filter(hit=>hit&&allowed(hit));
      update('local');
      return {results:[{hits,nbHits:hits.length,page:0,nbPages:1,hitsPerPage:12,processingTimeMS:0,query,params:''}]};
    }catch(error){update('error');throw error;}
  }) as Client['search']});
}
