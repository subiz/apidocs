# Documentation authoring

Use Node 22.12+ and npm. Install with `npm ci`, start with `npm run dev`, and validate using `npm run check` and `npm run build`. Algolia is the primary search provider; Pagefind generates the local fallback during the build. See SEARCH.md for hosted indexing setup and inspect the site with `npm run preview`.

Add Markdown or MDX under `src/content/docs`. Required frontmatter: `title`, `description`, `section` (Get Started, Users, Conversations, Messages, Webhooks), numeric `order`, and `status` (verified, example, draft). Section order is centralized in `src/lib/navigation.ts`. Navigation is derived from this metadata in `src/lib/docs.ts`; no route edits are needed. The introduction maps to `/developers` and other IDs map to `/developers/<id>`.

Use `example` until an authoritative Subiz source confirms the contract. Drafts are excluded from routes and search. Current published authentication and messaging content is source-checked; see SOURCES.md. Never add real credentials. The site uses the official Astryx neutral theme; the text wordmark is not an imported brand asset.

Endpoint records live in `src/lib/endpoints.ts`. Reference a record with `endpointId`; invalid references fail the build. Endpoint code examples are rendered statically with Shiki. Use ordinary Markdown headings, fences, tables, and lists for prose. The export function in `src/lib/docs.ts` is shared by per-page Markdown and both LLM routes. Rich MDX export needs normalization before adding arbitrary imported components; currently published documents use Markdown-compatible MDX only.

Deploy the generated `dist` directory using your Git hosting provider's static deployment workflow: install with `npm ci`, run `npm run build`, and publish `dist`. There was no pre-existing deployment configuration. Configure `.md` files as `text/markdown; charset=utf-8` on the final host. Confirm an official site origin before adding absolute canonicals and sitemap URLs.

Browser regression checks: start production preview then run `node tests/browser.mjs`. Screenshots are saved in `screenshots/`.

## Product and design decisions

Follow the Astryx-only styling policy in ../AGENTS.md. See API-STRUCTURE.md for the proposed Users, Conversations, Messages and Webhooks structure. Publish only verified, useful integrations; do not create placeholder pages for planned groups.

## English and Vietnamese

Every published English MDX file must have a counterpart at `src/content/docs/vi/<same-path>.mdx`. Keep section, order, status, and endpointId identical; translate title, description and prose. Preserve API identifiers and code blocks. `docs()` rejects missing counterparts and mismatched metadata at build time.

English URLs use `/developers/...`; Vietnamese counterparts use `/developers/vi/...`. The language control links to the same topic. Navigation and pagination stay in the current language; each locale has its own Markdown export. The LLM index groups both languages. Local development and production use the same `/developers` prefix. Existing `/docs/...` authoring links are rewritten during HTML and Markdown export; new links can use `/developers/...` directly.

Run `node tests/content.mjs` and `node tests/localization.mjs` after building (the browser test needs preview). Local Pagefind selects the current HTML language. For Algolia, append `filterOnly(language)` alongside `filterOnly(docset)` and recrawl using the updated crawler action.

## Translation freshness

Use Node 22.18+ (or Node 24+) for the translation commands. English is the origin. Each page records `sourceHash` in frontmatter; the Vietnamese value records the English revision reviewed by its translator. Hashes include English metadata, prose, and the page's shared endpoint examples. Drafts are excluded. The current translations were initialized as the baseline.

1. Edit English pages, then run `npm run translations:sync`. This updates only English hashes.
2. Run `npm run translations:status` (or append `-- --json`) to find stale, missing, or untracked Vietnamese pages. It also detects English edits before sync.
3. Update the corresponding Vietnamese page. After reviewing it, run `npm run translations:mark -- get-started/concepts --hash HASH_FROM_STATUS`. This stamps only that pair, and rejects a hash if English changed again.
4. Run `npm run translations:check` in your publishing checks. It exits nonzero for stale/missing translations or unsynchronized English hashes. A normal local build remains available while translating.

Never copy hashes to Vietnamese merely to silence the check. Adding a new page requires a counterpart and a source hash; run sync, translate, then mark the reviewed pair. Code samples are shared across locales, so changing an endpoint flags only translations using that endpoint.

## HTTP requests and branding

`src/lib/endpoints.ts` generates one plain HTTP example per endpoint: method and full URL, headers on separate lines, then an indented JSON body if needed. Do not add programming-language tabs or SDK samples. Render and export the same request. Explain algorithms in language-independent prose. Do not execute requests against customer accounts while testing.

The header uses the supplied Subiz SVG. The Subiz theme extends Astryx Neutral with primary `#0d6efd`; edit `src/themes/subiz/subizTheme.ts`, then run `npm run theme:build`. Commit the generated CSS, JS, and type declarations together. Never edit generated `src/astryx-themes.ts` manually.

Sidebar labels and ordering are managed in `src/lib/navigation.ts`. Add the English page ID and English/Vietnamese labels there to include a published page in navigation. Articles can remain available by URL without appearing in the sidebar. The same ordered list drives mobile navigation and previous/next links. Missing published navigation targets fail the build.

For a navigation-only review, an entry may use `planned: true`. It appears as a labeled, non-clickable outline item on desktop and mobile, without a route, search result, or previous/next link. Remove the flag only when its verified English and Vietnamese articles exist.

## Per-page API version labels

There is one current copy of each article, with no documentation snapshots or version selector. Endpoint pages derive their version from the path in `src/lib/endpoints.ts`; do not separately maintain a conflicting label. Shared guides declare `apiVersions: ["4.0", "4.1"]` in frontmatter. Webhook delivery guides declare `apiScope: "webhook"` instead. Missing or conflicting applicability fails the build. Both the page and Markdown export display the same version label.

The schema accepts 4.0, 4.1, and 4.2 for future authoring; this is not a claim that 4.2 is currently documented or supported. Add a version only after verifying the relevant API contract. Keep applicability aligned across translations and update source hashes following the normal workflow.

## Changelog

Edit `src/content/docs/changelog.mdx` and its Vietnamese counterpart. Add dated entries newest first. Label documentation-only changes explicitly. For confirmed API changes, include the effective date, affected API versions/endpoints, breaking-change status, and migration instructions. Do not infer API launch dates from path versions or invent release announcements.

Current iteration: update English content only (D-0031). Do not update Vietnamese prose or mark its translation reviewed when changing English. Run `translations:sync` to refresh English hashes and use `translations:status` to track the translation backlog.

## New English pages while translations are deferred

Set `translationPending: true` on an English page only when its Vietnamese counterpart is intentionally deferred (D-0036). This is the explicit exception to the counterpart requirement above. Add its navigation entry as usual; the site omits it from Vietnamese navigation and omits the unavailable language switch and hreflang link on that page. Existing bilingual routes are unchanged. Unexpected missing translations still fail the build. Do not create Vietnamese placeholder articles.

`translations:status` reports these pages as `pending`; `translations:check` continues to fail until the translation backlog is resolved. When translating, remove the pending flag, create the Vietnamese page, sync the English hash, and record the reviewed hash using `translations:mark`.
