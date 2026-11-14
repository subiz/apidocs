import {text,type Locale} from '../lib/i18n';
import {useEffect,useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {SystemIcon,LightIcon,DarkIcon} from './ThemeIcons';
import {SegmentedControl,SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {DropdownMenu,DropdownMenuRadioGroup,DropdownMenuRadioItem} from '@astryxdesign/core/DropdownMenu';
import {Drawer} from '@astryxdesign/core/Drawer';
import {themes,defaultThemeSlug} from '../astryx-themes';
import DocsSearch from './DocsSearch';
export default function Controls({groups=[],locale='en',alternate='/developers',searchPages=[]}:{searchPages?:{title:string;href:string}[];groups?:{title:string;planned:boolean;items:{title:string;href?:string}[]}[];locale?:Locale;alternate?:string|null}){
 const t=(en:string,vi:string)=>text(locale,en,vi);
 const [mode,setMode]=useState<'system'|'light'|'dark'>('system');const [open,setOpen]=useState(false);
 useEffect(()=>{try{const m=localStorage.getItem('docs-theme');if(m==='light'||m==='dark')setMode(m)}catch{}},[]);
 return <Theme theme={themes[defaultThemeSlug]} mode={mode}><div className="controls">

 <DocsSearch locale={locale} pages={searchPages}/>
 <div className="header-actions"><div className="header-preferences"><SegmentedControl label={t('Color theme','Giao diện')} size="sm" value={mode} onChange={m=>{setMode(m as typeof mode);try{localStorage.setItem('docs-theme',m)}catch{}}}>{['system','light','dark'].map(m=><SegmentedControlItem key={m} value={m} label={locale==='vi'?({system:'Hệ thống',light:'Sáng',dark:'Tối'}[m]||m):m[0].toUpperCase()+m.slice(1)} isLabelHidden icon={<Icon icon={{system:SystemIcon,light:LightIcon,dark:DarkIcon}[m]!} size="sm"/>}/>)}</SegmentedControl><DropdownMenu presentation="popover" menuWidth={168} button={{label:t('Language','Ngôn ngữ'),variant:'ghost',size:'sm',children:<><span className="header-language-full">{locale==='en'?'English':'Tiếng Việt'}</span><span className="header-language-short">{locale.toUpperCase()}</span></>}}>
  <DropdownMenuRadioGroup label={t('Language','Ngôn ngữ')} value={locale} onChange={value=>{if(value!==locale&&alternate)window.location.assign(alternate)}}>
   <DropdownMenuRadioItem value="en" label="English" isDisabled={locale!=='en'&&!alternate}/>
   <DropdownMenuRadioItem value="vi" label="Tiếng Việt" isDisabled={locale!=='vi'&&!alternate} description={locale!=='vi'&&!alternate?'Translation not available for this page':undefined}/>
  </DropdownMenuRadioGroup>
 </DropdownMenu></div>
 <div className="header-navigation"><span className="mobile"><Button label={t('Menu','Danh mục')} isIconOnly icon={<Icon icon="menu"/>} size="sm" onClick={()=>setOpen(true)}/></span><Button label={t('Log in','Trang quản trị')} href="https://app.subiz.com.vn/" variant="primary" size="sm" endContent={<Icon icon="chevronRight"/>}/></div></div>
 <Drawer isOpen={open} onOpenChange={setOpen} label={t('Documentation navigation','Điều hướng tài liệu')} side="start" width={300}><Button label={t('Close menu','Đóng danh mục')} variant="ghost" onClick={()=>setOpen(false)}/><nav className="drawer-links">{groups.map(group=><section key={group.title}><h2 className="drawer-group-title">{group.title}</h2>{group.planned&&<small className="nav-review-note">{t('Outline for review','Đề mục chờ nội dung')}</small>}{group.items.map(item=>item.href?<a key={item.title} href={item.href}>{item.title}</a>:<span key={item.title} className="nav-planned">{item.title}</span>)}</section>)}</nav></Drawer>
 </div></Theme>
}
