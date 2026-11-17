# Decisions

# 11/14/2026
## D-0002 Default language is english, also support vietnamese, must have language switcher
## D-0003 The path is /developers. Production URL: subiz.com.vn/developers
## D-0004 Astryx is the sole visual design system

Use official Astryx components and its theme system for typography, colors, spacing, controls, and light/dark/system modes. Do not introduce another visual style or recreate Astryx components. Custom CSS may support documentation layout and technical content while using Astryx tokens. Resend is a reference for information architecture and developer experience only, not styling.

## D-0005 Organize documentation around Subiz integration tasks

Use these primary sections: Get Started, Users, Conversations, Messages, and Webhooks. Users are customer records; agents are staff. Focus on useful customer-management and messaging workflows rather than documenting every backend route.

The initial focus was authentication and sending messages. The subsequently approved scope adds customer management, conversation operations, agent handoff, and webhook consumption.

## D-0006 Include agent invitation and explicit assignment under Conversations

Document inviting an existing agent into a conversation and assigning a conversation to a specific agent. Distinguish conversation participation from ownership, account-level staff invitations, and automatic routing.

## D-0007 Document webhook usage and example payloads, not management APIs

Keep a Webhooks section explaining how to receive and use events, with example payloads. Include source-verified signature verification and delivery-handling guidance where relevant.

Do not publish API documentation for creating, editing, deleting, or otherwise managing webhook subscriptions. This exclusion does not remove the webhook usage guide or payload examples.

## D-0010 Keep the Astro documentation architecture

Use Astro with TypeScript, Git-managed Markdown/MDX Content Collections, Astryx, React islands for interactive controls, Pagefind search, and static syntax highlighting. Prefer prerendered documents; do not hydrate the whole article or introduce a separate documentation framework.

## D-0011 Provide readable documentation for developers and AI tools

Every published page must support Copy Markdown and a public Markdown representation. Generate `llms.txt` and `llms-full.txt` from the same published content. Exclude drafts and avoid exposing raw MDX component internals in exports.

## D-0012 Use Algolia for documentation search

Use Algolia's free documentation-search offering, following the existing help-center documentation setup. This supersedes Pagefind as the primary provider in D-0010. Preserve Astryx as the UI styling system. Pagefind may remain as an explicitly labeled local fallback while hosted indexing is unavailable. Do not enable a paid plan without an explicit request.

## D-0013 This repo is public available

## D-0014 Expand all sidebar groups by default

Every documentation sidebar section starts expanded on page load, reload, and history navigation. Users may collapse sections during the current page visit.

## D-0015 Every English page has a Vietnamese counterpart

Publish equivalent English and Vietnamese pages, with a language switcher preserving the current topic. Translate the article and interface; preserve API field names and code semantics. Missing published counterparts must fail validation.

## D-0016 Explain the domain and rich messages

Provide a concepts page describing users, agents, conversations, messages, and their relationships. Explain structured rich message content using the supported block format.

## D-0017 Omit source-verification badges from pages

Do not display “Source-checked · Subiz services” in the documentation UI. Keep verification evidence in repository documentation.

## D-0018 Show the API host in endpoint headings

Show the actual HTTP method and full API URL in endpoint headings. Describe query parameters separately and retain them in request examples. Never change an endpoint's method to match a display example.

## D-0019 Track translation freshness with source hashes

English pages are the origin. Store their content hash and record the reviewed source hash on Vietnamese counterparts. Report stale translations when English prose, metadata, or shared endpoint examples change; never automatically mark Vietnamese as translated.

## D-0021 Primary color is #0d6efd

Apply this primary color through an Astryx theme extending Neutral, shared by static documentation and React islands in light, dark, and system modes.

## D-0022 Use plain HTTP request examples only

Replace all programming-language tabs and samples with one readable HTTP example: method and full URL, one header per line, a blank line, then indented JSON when the request has a body. Wrap long lines on small screens. Keep copy support and use the same example in Markdown exports. Explain webhook verification in language-independent steps. Apply this to both English and Vietnamese pages.

## D-0023 Review the sidebar as a gradual developer journey

The user requested a sidebar-only review, without editing article content, and explicitly removed List conversations from the navigation. Keep navigation labels/order independent of article frontmatter. Proposed order for review: Get Started → Messages → Customers (Users) → Conversations → Webhooks. Retain both invite-agent and assign-agent topics and webhook consumption only. Apply the same navigation to both locales, mobile, and previous/next links. Preserve existing article URLs during this review.

## D-0024 Merge Conversations and Messages in navigation

Combine both groups into “Conversations & Messages” / “Hội thoại và tin nhắn”. Order: start conversation, send to conversation, send to customer, get conversation details, read message history, invite agent, assign agent. This supersedes the separate groups in D-0023. Keep article content and URLs unchanged and continue excluding List conversations from navigation.

## D-0025 Add Orders and Products to the sidebar review

Add Orders / Đơn hàng and Products / Sản phẩm after Customers and before Webhooks. Each has create, list, retrieve, and update topics. This expands the initial scope that excluded commerce. The current request remains a navigation-only review: show these proposed topics as non-link outline items, labeled as awaiting content, until articles are written and verified. Do not generate empty article routes or present gateway route evidence as a verified public contract. Mirror the outline in both locales and mobile navigation.

## D-0026 Implement the webhook guide in English only

Use the supplied Google Doc (Webhook tích hợp CRM) and cross-check against the webhook delivery service (`sendback`). Update the existing English receiving and payload pages only. Retain plain HTTP/JSON examples and webhook consumption scope, with no management APIs. Leave Vietnamese articles and reviewed hashes unchanged; translation status must show these two pages as stale until translated later. This is an explicit exception to simultaneous bilingual updates.

## D-0027 Readable typography

Normal text is 16px, and no displayed text is smaller than 14px at the default browser text size. Apply this through Astryx theme tokens and documentation styles, including navigation, code, supporting labels, and interactive controls. Preserve browser zoom and accessibility text scaling.

## D-0028 Show API applicability on each page; do not archive docs

The user clarified that each page should identify the applicable API route version (4.0, 4.1, or future verified 4.2). Do not keep multiple documentation versions or provide a documentation release selector. Derive endpoint labels from actual paths; explicitly mark shared guides and version-independent webhook delivery. Add a dedicated changelog, distinguishing documentation updates from verified API changes.

## D-0029 Keep documentation brief and actionable

Use short, clear prose and direct steps. Start Authentication with the actual Subiz personal-access-token workflow, followed by the HTTP header example and concise troubleshooting. Use exact UI labels; keep implementation evidence in repository source notes rather than in the reader's instructions.

## D-0030 Remove code-block copy buttons

Remove Copy code / Copy request controls from code blocks and HTTP examples. Keep the page-level Copy Markdown action. This supersedes earlier requirements for per-example copy buttons.

## D-0031 English-only content updates for this iteration

Focus on English documentation for the current iteration. Do not translate new content or update Vietnamese articles yet. Preserve existing Vietnamese content and reviewed source hashes; let translation tracking report stale pages for a later translation pass. This supersedes simultaneous bilingual content updates for this iteration, while retaining the existing language switcher and routes.

## D-0032 Remove Start a conversation documentation

Remove the English and Vietnamese Start a conversation articles, endpoint metadata, navigation entry, and incoming links. Exclude them from search and Markdown/AI exports. This removes documentation only; the API backend is unchanged.

## D-0033 Remove Copy Markdown buttons

Remove the page-level Copy Markdown action across both languages. Keep public Markdown URLs, View Markdown links, and the LLM exports. This supersedes the clipboard requirement in D-0011 and the retained button in D-0030.

## D-0034 Explain webhook creation through the Subiz UI

Include a concise, verified walkthrough for creating a webhook in the Subiz application, selecting events, and setting the receiver URL and shared secret. This is UI setup guidance, not documentation of webhook management APIs. Inspect the authorized account's form without creating a subscription unless a real receiver and creation task are supplied. Continue updating English content only.

## D-0035 Show JSON examples for documented objects

When explaining Subiz objects, include a JSON example for each core object and each nested object being described. Check names, types, and relationships against the canonical schemas (`header`); use the relevant services to verify behavior. Use consistent synthetic identifiers, label selected-field examples clearly, and distinguish objects from endpoint request bodies. Apply this to Core concepts in English first.

## D-0036 Separate message formats and attachment guides

Add two English pages under Conversations & Messages: Message formats (plaintext, block trees, links, regular/bold text and other supported marks) and Attachments (image/video/audio/files and common structured attachments). Include source-verified JSON examples and link from Core concepts. New English pages may declare `translationPending: true` while Vietnamese work is deferred; do not publish fabricated Vietnamese translations or links to absent routes. Translation checks must continue reporting that backlog.


## D-0037 Add Usage limits and Errors guides

Add concise English guides under Get Started, after Authentication. Use Resend’s Usage Limits page as an organizational reference only; preserve Astryx styling. Publish Subiz limits and error semantics verified in the gateway and downstream services. Distinguish request throttling, payload validation, and plan/channel allowances; do not import another provider’s rates, quotas, or headers. Keep Vietnamese translations pending for this iteration.

## D-0038 Use the official DocSearch interface for search

The user explicitly approved Algolia's official DocSearch UI as an exception to D-0004 for search only. Integrate its React packages into the existing Astro island; do not migrate the site to Starlight solely to use its DocSearch plugin. Use a real editable search input in the header and keep the popup dimensions stable across loading, empty, and populated results. Preserve language/documentation scoping and the labeled Pagefind fallback until hosted indexing is available. The rest of the site continues to use Astryx.

## D-0039 Put desktop search at the top of the sidebar

Use the referenced Resend API documentation as a layout reference for search placement. Put the editable search field above desktop navigation and keep it visible while the navigation scrolls. Retain the visible mobile header input while the sidebar is collapsed into Menu. Keep one DocSearch provider/modal and the existing Astryx theme; keep articles and navigation statically rendered. This updates the header placement in D-0038.

## D-0040 Make the application login the header CTA

Place a primary “Log in” / “Trang quản trị” link to the Subiz application at the right edge of the header. Keep language and appearance controls secondary. Show system, light, and dark modes as accessible icon-only Astryx segmented choices; preserve saved preferences and system mode.


## D-0041 Header homepage link and language dropdown

The header Subiz logo opens https://subiz.com.vn/. Replace the alternate-language link with an official Astryx DropdownMenu with radio choices for English and Tiếng Việt, with the current locale selected. Preserve the current topic when changing languages. On an English-only page, show Vietnamese as unavailable rather than linking to a missing translation.

## D-0042 Merge Core concepts into Overview

Move the Users, conversations & messages article into Overview, including its object JSON examples, and remove the separate navigation item. Keep old Core concepts URLs as noindex redirects that preserve heading fragments; legacy Markdown URLs resolve from the same merged source. Move the existing Vietnamese material without translating new English content or stamping it reviewed. Translation tracking must keep the merged Vietnamese Overview stale until reviewed.


## D-0043 Switch the Algolia application

Use application ID S3B97BCQ1O for documentation search. Use the owner-supplied public search-only key and index subiz_com_vn_s3b97bcq1o_pages. Preserve the labeled Pagefind fallback when hosted records are unavailable. Adapt the index’s page records to DocSearch and scope displayed results to published documentation in the current language.


## D-0044 Include the Subiz chat widget

Load the exact owner-provided Subiz widget snippet in the shared documentation layout for account acpxkgumifuoofoosble. Keep its asynchronous loading and fallback behavior. No chat messages are sent as part of verification.

## D-0045 Replace the Orders outline with Order format

By user request, the Orders group shows a single English “Order format” page (`orders/format`) instead of the four planned create/list/retrieve/update outline items. The page documents the `Order` object and nested items, shipping, amounts, and statuses from the canonical `header` schema. Vietnamese translation is pending (D-0031). This supersedes D-0025 for Orders; Products remain an outline.

Update (same day): after the `proder` source became available, the four order endpoint pages (create, list, retrieve, update) were verified and published after Order format, in English only.

## D-0046 Add an Agents section

By user request, add an Agents / Nhân viên group after Customers (Users) with two English pages: Agent format (`agents/format`, the `Agent` object from `header`) List agents (GET `/4.1/agents`), and Get agent details (GET `/4.0/agents/{agid}`, added by follow-up request). Read-only reference for finding agent IDs used by invite and assign; no staff invitation or account administration APIs. Vietnamese translation pending (D-0031).

## D-0047 Publish the Products pages like Orders

By user request, replace the Products outline with five English pages: Product format (`products/format`), Create a product, List products, Get product details, and Update a product, verified against `api`, `proder`, and `header`. Deletion, imports, feeds, and crawling stay out of scope. Vietnamese translation pending (D-0031). This supersedes D-0025 for Products.

## D-0048 Publish Vietnamese for every page

By user request, every English page has a reviewed Vietnamese counterpart. This ends the English-only iteration in D-0031 and the D-0026 webhook exception, and restores D-0015. Vietnamese pages translate prose and keep code, JSON, field names, and API semantics identical; links point to `/docs/vi/...` with Vietnamese heading anchors. UI labels in steps use the Subiz app's Vietnamese strings. Future English changes must update the Vietnamese page in the same change, or the translation check reports it stale.

## D-0049 Do not document ETag behavior

By user request, public pages do not mention `ETag`, `If-None-Match`, or `304 Not Modified` responses, in either language. These are optional optimizations, not required for integration. Evidence stays in SOURCES.md only.

## D-0050 Keep "agent" as the Vietnamese term

By user request, Vietnamese pages and navigation use "agent" (lowercase mid-sentence, "Agent" at the start), matching the Subiz app, instead of "nhân viên". Definitions may still explain that an agent is a staff member ("nhân viên"), and the salesperson role keeps the app label "nhân viên bán hàng". The Agents sidebar group is "Agent".
