import {sections} from '../lib/navigation';
import {docs,markdownUrl} from '../lib/docs';
import {sectionLabel,localeOf,type Locale} from '../lib/i18n';
export async function GET(){const pages=await docs();return new Response('# Subiz Developer Docs\n\nEnglish and Vietnamese developer documentation.\n\n'+(['en','vi'] as Locale[]).map(locale=>'## '+(locale==='en'?'English':'Tiếng Việt')+'\n\n'+sections.map(s=>'### '+sectionLabel(s,locale)+'\n'+pages.filter(p=>p.data.section===s&&localeOf(p.id)===locale).map(p=>'- ['+p.data.title+']('+markdownUrl(p.id)+'): '+p.data.description).join('\n')).join('\n\n')).join('\n\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}})}
