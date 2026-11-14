# Project decisions

## Astryx is the sole visual design system

Use official Astryx components, the documented APIs, and its built neutral theme for all UI work. Use Astryx typography, colors, spacing, borders, radii, focus states, and light/dark/system theming. Do not introduce a second component library, recreate Astryx controls, or add a competing visual style. Custom CSS is for documentation layout, responsive behavior, and technical content unsupported by Astryx; use theme tokens and avoid overriding Astryx component internals. Consult the installed CLI before using a component. Preserve static Astro article rendering and hydrate only interactive controls.

Resend is an information-architecture reference only, never a styling reference. Changes to this decision require an explicit user request.

## Documentation scope

Read docs/API-STRUCTURE.md for the proposed customer-integration scope. Publish verified, useful pages only. Do not generate placeholder APIs to fill the navigation. Users means customer records; agents means staff. Keep real API route versions and methods, even when inconsistent. Do not modify the API backend as part of documentation cleanup.

Check contracts in the API gateway and relevant service implementations. Gateway route existence alone does not establish downstream validation, permissions, webhook signature algorithms, retry schedules, or delivery guarantees. Never inspect credentials or copy them into examples.

Run npm run check and npm run build after content or implementation changes. Browser tests in tests/browser.mjs expect the production preview on port 4321.

Conversations must include inviting an existing agent into a conversation and assigning a conversation to a specific agent. Distinguish these operations from account-level staff invitations and automatic reassignment. Webhook docs cover receiving events and consumer handling only; do not document webhook editing or management APIs.

## Decisions
Please read and follow ./DECISIONS.md

## Verify API documentation against Subiz source.
Use the API gateway and relevant service implementations as authoritative implementation evidence. Do not invent production endpoints, authentication requirements, request schemas, event names, or guarantees. Preserve the actual route versions and HTTP methods.


## Local implementation sources

Before changing API documentation or deployment configuration, read
`AGENTS.local.md` if present. It maps logical source names in `docs/SOURCES.md`
and deployment notes to locally available repositories. This file is private
workstation configuration and must not be committed or included in build uploads.

If the required sources are unavailable, do not invent API behavior or claim new
verification. State what evidence is missing and leave unverified API changes
unpublished. Public notes should use logical source names and file/symbol
references, never machine-specific checkout paths.
