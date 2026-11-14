// Merge this action into the EXISTING Algolia crawler; do not replace help-center actions.
// Add https://subiz.com.vn/developers to its startUrls after the site is deployed there.
// In the subiz_com_vn_s3b97bcq1o_pages index settings, APPEND filterOnly(docset) and filterOnly(language) to attributesForFaceting.
// This is a crawler dashboard action, not code executed by the Astro app.
({
  indexName: 'subiz_com_vn_s3b97bcq1o_pages',
  pathsToMatch: ['https://subiz.com.vn/developers', 'https://subiz.com.vn/developers/**'],
  recordExtractor: ({ $, helpers }) => {
    if (!$('#main h1').length) return [];
    $('#main button, #main nav, #main footer, .source-note, .code-action').remove();
    return helpers.docsearch({recordProps:{
      lvl0:{selectors:'#main .eyebrow',defaultValue:'Developers'},
      lvl1:'#main h1',lvl2:'#main article h2',lvl3:'#main article h3',
      content:'#main .description, #main article p, #main article li, #main article td, #main article pre',
    }}).map(record=>({...record,docset:'developers',language:$('html').attr('lang')||'en'}));
  },
});
