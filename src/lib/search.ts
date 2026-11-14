/** Public search-only configuration reused from the help-center documentation configuration. */
export const algolia = {
  appId: import.meta.env.PUBLIC_ALGOLIA_APP_ID || 'KMSSP41O2O',
  searchKey: import.meta.env.PUBLIC_ALGOLIA_SEARCH_KEY || '1dfabfe59e75bf2e37d5b037ac6dee95',
  index: import.meta.env.PUBLIC_ALGOLIA_INDEX || 'subiz-com',
};
export type SearchResult = {url:string; title:string; excerpt:string};
type Hit = {url?:string; hierarchy?:Record<string,string|null>; content?:string};
const cache = new Map<string, {results:SearchResult[]; provider:'algolia'|'local'}>();

export function normalizeHit(hit:Hit):SearchResult|null {
  if (!hit.url) return null;
  let url:URL;
  try { url=new URL(hit.url); } catch { return null; }
  if(url.origin!=='https://subiz.com.vn' || !/^\/developers(?:\/|$)/.test(url.pathname)) return null;
  const language=document.documentElement.lang==='vi'?'vi':'en';
  if((/^\/developers\/vi(?:\/|$)/.test(url.pathname)?'vi':'en')!==language)return null;
  const title=Object.entries(hit.hierarchy||{}).filter(([key,value])=>/^lvl[1-6]$/.test(key)&&value).map(([,value])=>value).join(' › ');
  return {url:url.pathname+url.hash,title:title||'Developer documentation',excerpt:hit.content?.slice(0,250)||''};
}

export async function searchDocs(query:string,signal:AbortSignal) {
  const language=document.documentElement.lang==='vi'?'vi':'en'; const cacheKey=language+':'+query;
  const cached=cache.get(cacheKey);if(cached)return cached;
  try {
    const response=await fetch(`https://${algolia.appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(algolia.index)}/query`,{
      method:'POST',signal:AbortSignal.any([signal,AbortSignal.timeout(4000)]),
      headers:{'content-type':'application/json','x-algolia-application-id':algolia.appId,'x-algolia-api-key':algolia.searchKey},
      body:JSON.stringify({params:new URLSearchParams({query,hitsPerPage:'12',facetFilters:JSON.stringify(['docset:developers','language:'+language]),attributesToRetrieve:'url,hierarchy,content'}).toString()}),
    });
    if(!response.ok)throw new Error('Search index unavailable');
    const data=await response.json();
    const results:SearchResult[]=data.hits.map(normalizeHit).filter(Boolean);
    if(results.length){const result={results,provider:'algolia' as const};cache.set(cacheKey,result);return result;}
  } catch(error) { if(signal.aborted)throw error; }
  // Build-time Pagefind remains a transparent fallback until crawler activation,
  // and for offline/network failures. Never display unrelated help-center hits.
  const path='/developers/pagefind/pagefind.js';
  const pagefind=await import(/* @vite-ignore */ path);
  await pagefind.options({baseUrl:'/developers/'});
  const response=await pagefind.search(query);
  const rows=await Promise.all(response.results.slice(0,8).map((r:{data:()=>Promise<any>})=>r.data()));
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  const result={provider:'local' as const,results:rows.map((r:any)=>({url:r.url,title:r.meta.title,excerpt:r.excerpt.replace(/<[^>]*>/g,'')}))};
  if(cache.size>=50)cache.delete(cache.keys().next().value!);
  cache.set(cacheKey,result);return result;
}
