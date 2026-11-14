import {text,type Locale} from '../lib/i18n';
import {useEffect,useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {SegmentedControl,SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Drawer} from '@astryxdesign/core/Drawer';
import {themes,defaultThemeSlug} from '../astryx-themes';
export default function Controls({groups=[],locale='en',alternate='/developers'}:{groups?:{title:string;planned:boolean;items:{title:string;href?:string}[]}[];locale?:Locale;alternate?:string|null}){
 const t=(en:string,vi:string)=>text(locale,en,vi);
 const [mode,setMode]=useState<'system'|'light'|'dark'>('system');const [open,setOpen]=useState(false);
 useEffect(()=>{try{const m=localStorage.getItem('docs-theme');if(m==='light'||m==='dark')setMode(m)}catch{}},[]);
 return <Theme theme={themes[defaultThemeSlug]} mode={mode}><div className="controls">

 <Button label={t('Search docs' ,'Tìm tài liệu')} size="sm" variant="secondary" onClick={()=>{document.querySelector<HTMLDialogElement>('#search')?.showModal();document.querySelector<HTMLInputElement>('#query')?.focus()}}/>
 <SegmentedControl label={t('Color theme','Giao diện')} size="sm" value={mode} onChange={m=>{setMode(m as typeof mode);try{localStorage.setItem('docs-theme',m)}catch{}}}>{['system','light','dark'].map(m=><SegmentedControlItem key={m} value={m} label={locale==='vi'?({system:'Hệ thống',light:'Sáng',dark:'Tối'}[m]||m):m[0].toUpperCase()+m.slice(1)}/>)}</SegmentedControl>{alternate&&<Button label={locale==='en'?'Tiếng Việt':'English'} href={alternate} variant="ghost" size="sm"/>}
 <span className="mobile"><Button label={t('Menu','Danh mục')} size="sm" onClick={()=>setOpen(true)}/></span>
 <Drawer isOpen={open} onOpenChange={setOpen} label={t('Documentation navigation','Điều hướng tài liệu')} side="start" width={300}><Button label={t('Close menu','Đóng danh mục')} variant="ghost" onClick={()=>setOpen(false)}/><nav className="drawer-links">{groups.map(group=><section key={group.title}><h2 className="drawer-group-title">{group.title}</h2>{group.planned&&<small className="nav-review-note">{t('Outline for review','Đề mục chờ nội dung')}</small>}{group.items.map(item=>item.href?<a key={item.title} href={item.href}>{item.title}</a>:<span key={item.title} className="nav-planned">{item.title}</span>)}</section>)}</nav></Drawer>
 </div></Theme>
}
