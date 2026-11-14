import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {text,type Locale} from '../lib/i18n';

type Props = {locale:Locale;logo:string;overview:string;changelog:string;markdown:string};

// Rendered as static HTML by Astro; these links need no client hydration.
export default function DocsFooter({locale,logo,overview,changelog,markdown}:Props) {
  const t=(en:string,vi:string)=>text(locale,en,vi);
  const groups=[
    {id:'footer-resources',title:t('Developer resources','Tài nguyên lập trình viên'),links:[
      {label:t('Documentation','Tài liệu API'),href:overview},
      {label:t('Changelog','Nhật ký thay đổi'),href:changelog},
      {label:t('View Markdown','Xem Markdown'),href:markdown},
      {label:t('Documentation for AI','Tài liệu cho AI'),href:'/developers/llms.txt'},
    ]},
    {id:'footer-subiz',title:'Subiz',links:[
      {label:t('Website','Trang chủ'),href:'https://subiz.com.vn/'},
      {label:t('Help center','Trung tâm trợ giúp'),href:'https://subiz.com.vn/docs/'},
      {label:t('Open Subiz','Mở Subiz'),href:'https://app.subiz.com.vn/'},
    ]},
  ];
  return <footer className="docs-footer" data-pagefind-ignore>
    <div className="docs-footer-inner">
      <div className="docs-footer-top">
        <div className="docs-footer-brand">
          <div><Link href={overview} color="secondary" label={t('Subiz developer documentation','Tài liệu API Subiz')}><img src={logo} width="113" height="31" alt="Subiz"/></Link></div>
          <Text type="label" display="block">{t('Developer documentation','Tài liệu dành cho lập trình viên')}</Text>
          <Text color="secondary" display="block">{t('Connect customer data, conversations, and workflows with the Subiz API.','Kết nối dữ liệu khách hàng, hội thoại và quy trình làm việc qua API Subiz.')}</Text>
        </div>
        {groups.map(group=><nav className="docs-footer-group" aria-labelledby={group.id} key={group.id}>
          <Text type="label" id={group.id} display="block">{group.title}</Text>
          <ul>{group.links.map(link=><li key={link.href}><Link href={link.href} isStandalone size="sm" color="secondary">{link.label}</Link></li>)}</ul>
        </nav>)}
      </div>
      <div className="docs-footer-bottom">
        <Text type="supporting">© {new Date().getFullYear()} Subiz. {t('All rights reserved.','Bảo lưu mọi quyền.')}</Text>
        <nav className="docs-footer-legal" aria-label={t('Legal','Thông tin pháp lý')}>
          <Link href="https://subiz.com.vn/privacy-policy" isStandalone size="sm" color="secondary">{t('Privacy policy','Chính sách bảo mật')}</Link>
          <Link href="https://subiz.com.vn/terms-of-service" isStandalone size="sm" color="secondary">{t('Terms of service','Điều khoản sử dụng')}</Link>
        </nav>
      </div>
    </div>
  </footer>;
}
