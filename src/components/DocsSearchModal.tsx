import {useMemo,useState} from 'react';
import {DocSearchModal} from '@docsearch/modal/modal';
import {algolia,documentationUrl,searchAdapter,type Provider} from '../lib/search';
import {text,type Locale} from '../lib/i18n';
import '@docsearch/css/dist/style.css';
import '../styles/search.css';

type Props={locale:Locale;pages:{title:string;href:string}[];initialQuery:string};
export default function SearchModal({locale,pages,initialQuery}:Props){
  const t=(en:string,vi:string)=>text(locale,en,vi);
  const [provider,setProvider]=useState<Provider>(null);
  const transformSearchClient=useMemo(()=>searchAdapter(locale,pages,setProvider),[locale,pages]);
  const indices=useMemo(()=>[{name:algolia.index+'__developers_'+locale,searchParameters:{hitsPerPage:12}}],[locale]);
  const status=provider==='loading'?t('Searching…','Đang tìm…'):provider==='local'?t('Local results','Kết quả cục bộ'):provider==='algolia'?t('Results from Algolia','Kết quả từ Algolia'):provider==='error'?t('Search unavailable','Không thể tìm kiếm'):t('Developer docs','Tài liệu API');
  return <DocSearchModal appId={algolia.appId} apiKey={algolia.searchKey} indices={indices}
    initialQuery={initialQuery} insights={false} transformSearchClient={transformSearchClient}
    transformItems={items=>items.filter(hit=>!!documentationUrl(hit.url,locale))}
    hitComponent={({hit,children})=><a href={documentationUrl(hit.url,locale)||'#'}>{children}</a>}
    navigator={{navigate:({itemUrl})=>{const url=documentationUrl(itemUrl,locale);if(url)window.location.assign(url);}}}
    footerAction={<span id="search-provider" className="docs-search-provider" role="status">{status}</span>}
    translations={{
      searchBox:{searchInputLabel:t('Search documentation','Tìm kiếm tài liệu'),placeholderText:t('Search docs','Tìm tài liệu'),clearButtonTitle:t('Clear query','Xóa từ khóa'),clearButtonAriaLabel:t('Clear query','Xóa từ khóa'),closeButtonText:t('Close','Đóng'),closeButtonAriaLabel:t('Close search','Đóng tìm kiếm')},
      startScreen:{recentSearchesTitle:t('Recent','Gần đây'),noRecentSearchesText:t('Search guides, API resources, and webhooks','Tìm hướng dẫn, tài nguyên API và webhook'),saveRecentSearchButtonTitle:t('Save this search','Lưu tìm kiếm này'),removeRecentSearchButtonTitle:t('Remove this search from history','Xóa tìm kiếm này khỏi lịch sử'),favoriteSearchesTitle:t('Favorites','Đã lưu'),removeFavoriteSearchButtonTitle:t('Remove from favorites','Bỏ lưu')},
      noResultsScreen:{noResultsText:t('No results for','Không tìm thấy kết quả cho'),suggestedQueryText:t('Try searching for','Thử tìm kiếm'),reportMissingResultsText:t('Should this query return results?','Từ khóa này cần có kết quả?'),reportMissingResultsLinkText:t('Let us know','Báo cho chúng tôi')},
      errorScreen:{titleText:t('Search unavailable','Không thể tìm kiếm'),helpText:t('Please check your connection and try again.','Vui lòng kiểm tra kết nối và thử lại.')},
      footer:{selectText:t('to open','để mở'),selectKeyAriaLabel:t('Enter key','Phím Enter'),navigateText:t('to navigate','để di chuyển'),navigateUpKeyAriaLabel:t('Arrow up','Mũi tên lên'),navigateDownKeyAriaLabel:t('Arrow down','Mũi tên xuống'),closeText:t('to close','để đóng'),closeKeyAriaLabel:t('Escape key','Phím Escape'),poweredByText:t('Search by','Tìm kiếm bởi')},
    }}/>
}
