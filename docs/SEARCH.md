# Algolia search

The selected Algolia application is `S3B97BCQ1O`, with index `subiz_com_vn_s3b97bcq1o_pages` and the public search-only key supplied by the owner. These defaults live in `src/lib/search.ts`; PUBLIC_ALGOLIA_ build variables can override them. Never put an administrative or indexing key in PUBLIC_ variables.

The UI uses Algolia's official DocSearch v5 packages (`@docsearch/core`,
`@docsearch/modal`, and `@docsearch/css`) in the existing Astro React island.
`@astrojs/starlight-docsearch` requires Starlight, which this site does not use.
D-0038 explicitly permits the official DocSearch UI for search only.

An editable Astryx TextInput sits above the desktop sidebar navigation, fixed
while the navigation scrolls. On mobile it stays visible in the header. A React
portal moves the same control between these locations without duplicating
DocSearch providers or keyboard handlers. The official modal loads on demand,
with keyboard navigation, recent results, favorites, and Algolia attribution.
Its height stays fixed while results load or change; results scroll inside it.
DocSearch colors follow the site's light/dark/system theme.

The supported `transformSearchClient` hook wraps DocSearch's official Algolia
client with a four-second timeout and a labeled Pagefind fallback. The current
index stores page records with title, description, content, and url, without
DocSearch hierarchy or docset/language facets. The adapter converts them into
DocSearch results and also accepts hierarchical records if the crawler is
upgraded later. It fetches up to 100 candidates, then displays at most 12 matches
whose URLs belong to published pages in the current language under
`https://subiz.com.vn/developers`. It does not request missing facets. The client
allowlist also excludes retired articles, help-center pages, and external URLs.

Local aliases (`subiz_com_vn_s3b97bcq1o_pages__developers_en` and
`subiz_com_vn_s3b97bcq1o_pages__developers_vi`) isolate recent/favorite storage by
language. The adapter queries the real index; no alias index is created in
Algolia. Search analytics and AI search are disabled.

## Current connection — 2026-11-14

Read-only queries with the supplied search key returned HTTP 200 and 36 page
records. An unfiltered query for Bearer returned both English and Vietnamese
Authentication pages. Filtering by the old docset/language fields returned zero
hits because these fields are absent. The frontend now derives the scope from
URLs instead. The stored Overview description is an older revision: deploy the
merged Overview and recrawl to refresh content and remove the old concepts URL.
No crawler or account setting was changed remotely.

The shared layout includes the public domain-verification meta tag supplied by
the owner. Deploy the new build before asking Algolia to verify it.

## Previous application readiness — 2026-11-14

These observations refer to the previous application, KMSSP41O2O, and do not verify the newly selected application S3B97BCQ1O.

Read-only checks confirmed that the GitHub repository is public, the production
`/developers` page returns HTTP 200 with server-rendered technical documentation,
and the domain's robots.txt allows crawling. These support applying to DocSearch;
only Algolia can approve the application. A public GitHub repository alone does
not activate the service or establish an approved plan.

The current search-only query for `docset:developers` and `language:en` succeeded
but returned **zero records**. Until the crawler indexes this documentation,
queries use the labeled Pagefind fallback. The existing help-center search does
not establish that `/developers` is indexed.

Apply through the [Algolia dashboard](https://dashboard.algolia.com/) with
`https://subiz.com.vn/developers` and the public repository URL. Algolia requires
domain ownership verification within seven days of approval. The official DocSearch footer includes the required Algolia attribution. No application, account change, crawler update, or paid plan has been
submitted by this repository.

## Refresh the index or adopt hierarchical crawling

1. Deploy the site at the decided `/developers` production path. Local development and production both use `/developers`; Pagefind assets and result links use that prefix too.
2. If these pages are covered by the existing approved documentation project, in its Algolia crawler, add `/developers` as a start URL and merge the action from `config/algolia-crawler-action.js`. Preserve the existing help-center crawler actions.
3. Append `filterOnly(docset)` to the index's attributesForFaceting; preserve its other settings.
4. Run the crawler and verify that the developer records have `docset: developers`, titles, body content and heading URLs.
5. Query “Bearer” on production and confirm the UI says “Results from Algolia”.

For a separately approved project, use its own Algolia application/index and set
the three PUBLIC_ALGOLIA_ overrides below. Update `indexName` in the crawler
action to that index. Keep the `docset` and `language` fields/facets, which the
optional hierarchical extractor emits for future server-side filtering; the current frontend scopes results by URL. Algolia's program guidance calls for a separate
application per project; do not assume the help-center approval covers a new one.

The current index can return hosted developer results. Its crawler/settings were not changed: the repository uses a public search key, which cannot administer the index. Deploy and recrawl after content changes to refresh hosted results.

Pagefind remains a local fallback when Algolia has no matching developer records or cannot be reached. The UI labels fallback results explicitly; no backend or paid search plan is required for this fallback. Keep the Pagefind build step until hosted indexing is confirmed.

Optional build-time overrides: PUBLIC_ALGOLIA_APP_ID, PUBLIC_ALGOLIA_SEARCH_KEY, PUBLIC_ALGOLIA_INDEX. Use a search-only key scoped to the intended index. If changing the index, update the crawler action too.

Algolia offers a free DocSearch program for eligible public documentation; approval and account quotas are controlled by Algolia. Reusing a working key does not verify the account's subscription. No paid plan was enabled and no account or billing settings were changed.

References: https://docsearch.algolia.com/docs/who-can-apply/ and https://docsearch.algolia.com/docs/docsearch-program/ . The program requests Search by Algolia attribution; the search dialog includes it. Review current branding requirements when activating the crawler.
