# Proposed Subiz API documentation structure

Status: implemented initial scope, 2026-11-14. The Astryx-only styling decision is accepted and recorded in AGENTS.md. Published contracts live in src/content/docs; source evidence is recorded in SOURCES.md.

## Business model

Subiz is a messaging CRM: businesses centralize customer interactions from channels such as their website, Facebook, and Zalo, maintain customer profiles, and coordinate sales and support staff. See https://subiz.com.vn/.

The integration model should distinguish:

- **Users:** customer records, their attributes, and channel identities. Use the sidebar label “Users (customers)” initially; do not invent a separate Contacts API.
- **Conversations:** interactions that provide context and ownership for messages, including inviting an existing agent and assigning responsibility.
- **Messages:** replying inside an existing conversation versus contacting a user through a channel. These are different handlers and request types.
- **Webhooks:** receiving outbound events in an integration, verifying requests, and handling deliveries. Webhook configuration and management APIs are excluded by user decision.
- **Agents:** staff serving customers. Agent management is not customer management.

The recommended developer journey is: authenticate → identify or update a customer → use an existing conversation → invite/assign an agent → send a message → receive and reconcile webhook events.

## Sidebar — review revision, 2026-11-14

The goal is a gradual path from understanding Subiz's entities and authentication to sending a first message, then customer synchronization, conversation operations, and webhook consumption. Navigation labels and order live in `src/lib/navigation.ts`, independently of article content. Desktop, mobile, and previous/next links use the same list.

| Order | Group | Pages, in order |
| --- | --- | --- |
| 1 | Get Started / Bắt đầu | Overview (including core concepts); Authentication; Usage limits (English only); Errors (English only) |
| 2 | Conversations & Messages / Hội thoại và tin nhắn | Message formats (English only); Attachments (English only); Send to a conversation; Send to a customer; Get conversation details; Read message history; Invite an agent; Assign an agent |
| 3 | Customers (Users) / Khách hàng | User and attribute format (English only); Create a customer; Get customer details; Update customer details; Find or create by channel identity |
| 4 | Agents / Nhân viên | Agent format; List agents; Get agent details (English only, D-0046) |
| 5 | Orders / Đơn hàng | Order format; Create an order; List orders; Get order details; Update an order (English only, D-0045) |
| 6 | Products / Sản phẩm | Product format; Create a product; List products; Get product details; Update a product (English only, D-0047) |
| 7 | Webhooks / Webhook | Receive & verify events; Event payloads |

List conversations is removed from navigation at the user's request. Its existing article and URL are preserved during this sidebar-only review. It does not appear in mobile navigation or previous/next links either.

Keep the two send operations separate: sending to an existing conversation and sending through a customer's channel identity require different inputs. Keep channel identity as the last customer topic, after basic record operations. Keep invitation and assignment separate: participation and responsibility are different operations.

Avoid extra top-level Guides/API Reference/SDK sections, separate API Keys pages, and webhook management entries. Verification and delivery handling remain one webhook topic rather than several sidebar entries. Rich message blocks remain part of the entities topic for this review. Do not create empty quickstart/error/pagination pages just to fill the sidebar.

This revision changes navigation only, not article bodies, contracts, or translation hashes. A dedicated first-integration walkthrough can be considered in the content review; the current send-message page is not relabeled as a complete quickstart.

## Source map and verification boundaries

Route evidence below comes from api/router.go. Paths are candidates for documentation, not a promise that every backend route is a supported public integration API. Preserve actual versions and POST-based operations; do not normalize them into invented REST routes.

| Proposed page | Registered route / implementation evidence |
| --- | --- |
| Create user | POST `/4.0/users`; `handleCreateUserDirectly` forwards channel, channel_source, profile_id, attributes |
| Retrieve user | GET `/4.0/users/{uid}` |
| Update user | POST `/4.1/users/{uid}`; `handleUpdateUser` explicitly selects supported fields |
| Find/create by channel identity | GET/POST `/4.1/accounts/{accid}/contact-profiles/{channel}/sources/{source}/{id}` |
| List conversations | GET `/4.1/conversations`; confirm its query/response semantics before publishing |
| Retrieve conversation | GET `/4.0/conversations/{cid}` |
| Read message history | GET `/4.0/conversations/{cid}/messages` |
| Send to conversation | POST `/4.1/conversations/{cid}/messages`; `handleSendEvent` |
| Send to user | POST `/4.0/accounts/{accid}/users/{uid}/messages`; `handleSendOmniChannelEvent`, `SendOmniChannelMessageRequest` |
| Invite an agent to a conversation | POST `/4.0/conversations/{cid}/members`; `handleJoinConversation` decodes ConversationMember and JoinConversation emits conversation_invited. This is not inviting a new staff account. |
| List agents | GET `/4.1/agents` (also `/4.0/agents`, `/4.0/accounts/{accid}/agents`); `handleListAgents` returns a JSON array of `Agent` |
| Get agent details | GET `/4.0/agents/{agid}` (also `/4.0/accounts/{accid}/agents/{agid}`); `handleReadAgent` |
| Assign a conversation to an agent | POST `/4.0/accounts/{accid}/conversations/{cid}` with `assignee`; verified in UpdateConversationInfo/updateConversationAssignee. The `/4.1/conversations/{cid}/assign` route is automatic reassignment; the member-update route is restricted to AI bot membership. Neither is the explicit-agent assignment operation. |

Webhook content must be verified against the Sendback service before documenting event names, payloads, signing headers/algorithm, acknowledgements, retry timing, ordering or duplicate handling. Do not add pages for creating, listing, retrieving, editing, deleting, rotating secrets, pinging, or querying webhook management/delivery APIs. Consumer troubleshooting belongs in the receiving guide.

User attribute validation, identity matching and channel-send requirements also need the relevant service contract reviewed before runnable examples are published. Do not invent a GET `/users` list route or `/contacts` resource from the UI concept.

## Exclude from the initial public documentation

Remove the generated example Contacts, Conversations, Webhooks, generic guide, and API-key placeholder pages. Their routes and contracts were fictional and add no integration value.

Do not mirror the entire backend router: omit internal connector acknowledgements, message apply/update internals, AI traces, infrastructure, session internals, account administration, webhook management, billing, shipping, campaigns and reporting from this initial integration scope. These may be useful in later products; exclusion here is editorial, not removal from Subiz's backend.

Published: introduction, authentication, four user operations, five conversation operations (including invite and explicit assignment), two message operations, and two webhook consumption guides. No webhook management pages are published.

## Commerce outline added for review

Orders and Products are now in scope by user request, superseding their initial exclusion above. These eight topics are outline entries, not published API reference pages. In `src/lib/navigation.ts`, `planned: true` renders a non-link label on desktop and mobile and excludes the topic from previous/next links. There are no empty articles or broken URLs. Once a verified bilingual article pair is ready, remove `planned` to enable its navigation link; validation then requires a published target.

Gateway evidence for selecting topics only, from `api/router.go`:

- Orders: POST and GET `/4.0/accounts/{accid}/orders`; GET and POST `/4.0/accounts/{accid}/orders/{oid}`.
- Products: POST and GET `/4.0/accounts/{accid}/products`; GET and POST `/4.0/accounts/{accid}/products/{pid}`.

These routes justify the proposed create/list/retrieve/update topics, but request/response schemas, authorization, and downstream behavior still require verification when writing the articles. Leave shipping, payments, imports, product feeds, categories, and deletion out of this initial outline.

## Start a conversation removed

By user decision, the Start a conversation article and its Vietnamese counterpart are removed, along with endpoint metadata and navigation links. The remaining conversation documentation covers existing conversations; no backend routes are changed.
