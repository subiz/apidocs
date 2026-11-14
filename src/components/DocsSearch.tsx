import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {DocSearch,useDocSearch} from '@docsearch/core';
import {TextInput} from '@astryxdesign/core/TextInput';
import {text,type Locale} from '../lib/i18n';

const Modal=lazy(()=>import('./DocsSearchModal'));
type Props={locale:Locale;pages:{title:string;href:string}[]};

function SearchField({locale,pages}:Props){
  const {isModalActive,openModal}=useDocSearch();
  const [query,setQuery]=useState('');
  const [sidebarTarget,setSidebarTarget]=useState<HTMLElement|null>(null);
  useEffect(()=>{
    const mobile=window.matchMedia('(max-width: 700px)');
    const placeSearch=()=>setSidebarTarget(mobile.matches?null:document.getElementById('sidebar-search'));
    placeSearch();mobile.addEventListener('change',placeSearch);
    return ()=>mobile.removeEventListener('change',placeSearch);
  },[]);
  const input=useRef<HTMLInputElement>(null);
  const wasOpen=useRef(false);
  const composing=useRef(false);
  useEffect(()=>{
    if(wasOpen.current&&!isModalActive){setQuery('');input.current?.focus({preventScroll:true});}
    wasOpen.current=isModalActive;
  },[isModalActive]);
  const label=text(locale,'Search docs','Tìm tài liệu');
  const field=<div className="docs-search-field">
    <TextInput ref={input} type="search" label={label} isLabelHidden placeholder={label}
      startIcon="search" size="sm" width="100%" value={query}
      autoComplete="off" enterKeyHint="search" hasSpellCheck={false}
      onClick={openModal} onEnter={openModal}
      onChange={value=>{setQuery(value);if(!composing.current)openModal();}}
      onCompositionStart={()=>{composing.current=true;}}
      onCompositionEnd={()=>{composing.current=false;setQuery(input.current?.value||'');openModal();}}/>
  </div>;
  return <>
    {sidebarTarget?createPortal(field,sidebarTarget):<div className="mobile-search">{field}</div>}
    {isModalActive&&<Suspense fallback={null}><Modal locale={locale} pages={pages} initialQuery={query}/></Suspense>}
  </>;
}

export default function DocsSearch(props:Props){
  return <DocSearch keyboardShortcuts={{'Ctrl/Cmd+K':true,'/':false,'Ctrl/Cmd+I':false}}>
    <SearchField {...props}/>
  </DocSearch>;
}
