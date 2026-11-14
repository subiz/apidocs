# Algolia search

The primary search provider is Algolia, reusing the public search configuration from the help-center documentation’s `docusaurus.config.js`: application KMSSP41O2O, index subiz-com. The search-only key is already a public frontend key. Never put an administrative or indexing key in PUBLIC_ variables.

The client uses Algolia's Search API with a `docset:developers` facet filter. It accepts only results under `https://subiz.com.vn/developers`, so help-center records cannot appear here. Rendering uses textContent, not HTML from index records. Queries are debounced, abortable, and cached for the page session. The existing keyboard dialog and Astryx design remain.

## Activate hosted search

1. Deploy the site at the decided `/developers` production path. Local development and production both use `/developers`; Pagefind assets and result links use that prefix too.
2. In the existing Algolia crawler, add `/developers` as a start URL and merge the action from `config/algolia-crawler-action.js`. Preserve the existing help-center crawler actions.
3. Append `filterOnly(docset)` to the index's attributesForFaceting; preserve its other settings.
4. Run the crawler and verify that the developer records have `docset: developers`, titles, body content and heading URLs.
5. Query “Bearer” on production and confirm the UI says “Results from Algolia”.

The live index was queried successfully during implementation; it contains existing help-center records. Its crawler/settings were not changed: the repository exposes only a public search key, which cannot administer the index. Developer pages must be deployed and crawled before they can return hosted results.

Pagefind remains a local fallback when Algolia has no matching developer records or cannot be reached. The UI labels fallback results explicitly; no backend or paid search plan is required for this fallback. Keep the Pagefind build step until hosted indexing is confirmed.

Optional build-time overrides: PUBLIC_ALGOLIA_APP_ID, PUBLIC_ALGOLIA_SEARCH_KEY, PUBLIC_ALGOLIA_INDEX. Use a search-only key scoped to the intended index. If changing the index, update the crawler action too.

Algolia offers a free DocSearch program for eligible public documentation; approval and account quotas are controlled by Algolia. Reusing a working key does not verify the account's subscription. No paid plan was enabled and no account or billing settings were changed.

References: https://docsearch.algolia.com/docs/who-can-apply/ and https://docsearch.algolia.com/docs/docsearch-program/ . The program requests Search by Algolia attribution; the search dialog includes it. Review current branding requirements when activating the crawler.
