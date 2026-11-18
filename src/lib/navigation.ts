import {localizedId, type Locale} from './i18n.ts';

export const sections = ['Get Started', 'Messages', 'Users', 'Conversations', 'Agents', 'Orders', 'Products', 'Webhooks', 'Updates'] as const;
export const navigationSections = ['Get Started', 'Conversations & Messages', 'Users', 'Agents', 'Orders', 'Products', 'Webhooks', 'Updates'] as const;
type Section = typeof navigationSections[number];
export type NavigationItem = {id:string; en:string; vi:string; planned?:boolean};

// Editorial navigation is independent of article frontmatter and published URLs.
export const navigation: Record<Section, readonly NavigationItem[]> = {
 'Get Started': [
  {id:'introduction',en:'Overview',vi:'Tổng quan'},
  {id:'get-started/authentication',en:'Authentication',vi:'Xác thực'},
  {id:'get-started/usage-limits',en:'Usage limits',vi:'Giới hạn sử dụng'},
  {id:'get-started/errors',en:'Errors',vi:'Xử lý lỗi'},
 ],
 'Conversations & Messages': [
  {id:'messages/formats',en:'Message formats',vi:'Định dạng tin nhắn'},
  {id:'messages/attachments',en:'Attachments',vi:'Tệp và nội dung đính kèm'},
  {id:'api-reference/messages/send',en:'Send to a conversation',vi:'Gửi tin nhắn vào hội thoại'},
  {id:'api-reference/messages/send-to-user',en:'Send to a customer',vi:'Gửi tin nhắn cho khách hàng'},
  {id:'api-reference/messages/send-zbs',en:'Send a ZBS message',vi:'Gửi tin ZBS'},
  {id:'api-reference/conversations/retrieve',en:'Get conversation details',vi:'Lấy thông tin hội thoại'},
  {id:'api-reference/conversations/history',en:'Read message history',vi:'Đọc lịch sử tin nhắn'},
  {id:'api-reference/conversations/invite-agent',en:'Invite an agent',vi:'Mời agent tham gia'},
  {id:'api-reference/conversations/assign-agent',en:'Assign an agent',vi:'Giao agent phụ trách'},
 ],
 'Users': [
  {id:'users/format',en:'User and attribute format',vi:'Định dạng khách hàng và thuộc tính'},
  {id:'api-reference/users/create',en:'Create a customer',vi:'Tạo khách hàng'},
  {id:'api-reference/users/retrieve',en:'Get customer details',vi:'Lấy thông tin khách hàng'},
  {id:'api-reference/users/update',en:'Update customer details',vi:'Cập nhật thông tin khách hàng'},
  {id:'api-reference/users/identity',en:'Find or create by channel identity',vi:'Tìm hoặc tạo theo định danh kênh'},
 ],
 'Agents': [
  {id:'agents/format',en:'Agent format',vi:'Định dạng agent'},
  {id:'api-reference/agents/list',en:'List agents',vi:'Lấy danh sách agent'},
  {id:'api-reference/agents/retrieve',en:'Get agent details',vi:'Lấy thông tin agent'},
 ],
 'Orders': [
  {id:'orders/format',en:'Order format',vi:'Định dạng đơn hàng'},
  {id:'api-reference/orders/create',en:'Create an order',vi:'Tạo đơn hàng'},
  {id:'api-reference/orders/list',en:'List orders',vi:'Lấy danh sách đơn hàng'},
  {id:'api-reference/orders/retrieve',en:'Get order details',vi:'Lấy thông tin đơn hàng'},
  {id:'api-reference/orders/update',en:'Update an order',vi:'Cập nhật đơn hàng'},
 ],
 'Products': [
  {id:'products/format',en:'Product format',vi:'Định dạng sản phẩm'},
  {id:'api-reference/products/create',en:'Create a product',vi:'Tạo sản phẩm'},
  {id:'api-reference/products/list',en:'List products',vi:'Lấy danh sách sản phẩm'},
  {id:'api-reference/products/retrieve',en:'Get product details',vi:'Lấy thông tin sản phẩm'},
  {id:'api-reference/products/update',en:'Update a product',vi:'Cập nhật sản phẩm'},
 ],
 'Updates': [{id:'changelog',en:'Changelog',vi:'Nhật ký thay đổi'}],
 'Webhooks': [
  {id:'webhooks/receiving',en:'Receive & verify events',vi:'Nhận và xác minh sự kiện'},
  {id:'webhooks/payloads',en:'Event payloads',vi:'Cấu trúc dữ liệu sự kiện'},
 ],
};

export type NavigationConfig = {sections:readonly string[];items:Record<string,readonly NavigationItem[]>};
export const currentNavigation:NavigationConfig={sections:navigationSections,items:navigation};

export function navigationPages<T extends {id:string;data:{title:string;section:string;translationPending?:boolean}}>(pages:T[],locale:Locale,config:NavigationConfig=currentNavigation):T[] {
 const seen=new Set<string>();
 return config.sections.flatMap(section=>config.items[section].filter(item=>!item.planned).flatMap(item=>{
  const id=localizedId(item.id,locale);
  if(seen.has(id))throw new Error('Duplicate navigation entry: '+id);
  seen.add(id);
  const page=pages.find(page=>page.id===id);
  if(!page){
   if(locale==='vi'&&pages.find(p=>p.id===item.id)?.data.translationPending)return [];
   throw new Error('Navigation links to missing published page: '+id);
  }
  return [{...page,data:{...page.data,title:item[locale],section}}];
 }));
}
