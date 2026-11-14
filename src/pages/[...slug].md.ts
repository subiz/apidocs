import {docs,markdown,markdownSlug} from '../lib/docs';
import {docsRedirects} from '../lib/redirects';
export async function getStaticPaths(){
 const pages=await docs();
 return [
  ...pages.map(page=>({params:{slug:markdownSlug(page.id)},props:{page}})),
  ...docsRedirects.map(redirect=>{
   const page=pages.find(page=>page.id===redirect.pageId);
   if(!page)throw new Error('Missing Markdown alias target: '+redirect.pageId);
   return {params:{slug:redirect.slug},props:{page}};
  }),
 ];
}
export function GET({props}:any){return new Response(markdown(props.page),{headers:{'Content-Type':'text/markdown; charset=utf-8'}});}
