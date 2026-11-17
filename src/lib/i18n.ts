export type Locale='en'|'vi';
export const localeOf=(id:string):Locale=>id.startsWith('vi/')?'vi':'en';
export const translationKey=(id:string)=>id.replace(/^vi\//,'');
export const localizedId=(id:string,locale:Locale)=>(locale==='vi'?'vi/':'')+translationKey(id);
export function text(locale:Locale,en:string,vi:string){return locale==='vi'?vi:en}
export const sectionLabel=(section:string,locale:Locale)=>locale==='en'?(section==='Users'?'Customers (Users)':section):({'Get Started':'Bắt đầu','Users':'Khách hàng','Conversations & Messages':'Hội thoại và tin nhắn','Conversations':'Hội thoại','Messages':'Tin nhắn','Agents':'Nhân viên','Orders':'Đơn hàng','Products':'Sản phẩm','Updates':'Cập nhật','Webhooks':'Webhook'}[section]||section);
