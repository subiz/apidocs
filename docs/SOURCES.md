# Source verification

Source references use logical repository names, not workstation paths.
Maintainers can resolve them through their untracked `AGENTS.local.md`; these
implementation repositories are not required to build this public documentation.

Reviewed the API gateway (`api`) on 2026-11-14. No production requests were sent.

- `auth.go`, `getAccessToken`: exact Bearer prefix; `buildCtxCore`: session validation and account matching.
- `router.go:390`: POST `/4.1/conversations/{cid}/messages` → `handleSendEvent`.
- `handler.go:4197`, `handleSendEvent`: event defaults, server timestamp/account, path conversation ID, downstream SendMessage call.
- `hparam.go:83`, `Decode2`: JSON decoding.
- `router.go`, `HttpWraps`: authentication-context errors use 400; successful JSON output uses 200.
- `README.md`, domain section: `api.subiz.com.vn`.
- `vendor/github.com/subiz/header/header.pb.go`: Event, Data, Message fields and JSON tags.
- `vendor/github.com/subiz/header/service_grpc.pb.go`: SendMessage returns Event.

Verified means confirmed in this gateway source, not a live integration test. Downstream permission rules, delivery guarantees, and complete error catalogs remain outside this initial gateway review. The personal-token creation workflow was subsequently verified against the frontend source; see below.

The initial unrelated placeholder pages were removed. The proposed expansion and source evidence are in API-STRUCTURE.md.

## Expanded integration reference

- `api/router.go`: registered user, contact-profile, conversation, member, and messaging paths; retain the actual 4.0/4.1 versions and POST verbs.
- `api/handler.go`: handleCreateUserDirectly, handleReadUser, handleUpdateUser, contact-profile handlers, handleStartConversation, handleListConversations2, handleListConversationEvents, handleJoinConversation, handleUpdateConvoInfo, handleSendOmniChannelEvent.
- `user/mgr.go`, `user/userdb_test.go`: customer attributes and fullname text fixtures.
- `conversation/conversation.go`: StartConversation/startConvo, ListConversations2, JoinConversation, UpdateConversationInfo, shouldUpdateConversationAssignee, updateConversationAssignee, SendOmniChannelMessage.
- `conversation/convodb.go`: UpdateAssignee persists ownership without adding a member.
- `sendback/webhook.go`: Payload, NewDelivery, signature; POST delivery, events array, delivery/signature headers, raw-body HMAC, multiple secret digests, 30-second timeout.
- `sendback/webhook_test.go`: TestSignature verifies digest formatting.

Webhook payload examples are synthetic subsets of the source-defined Event/Message/Conversation schema. No captured customer data is published. Receiver code demonstrates verification and processing guidance, not webhook management. No live API calls were made.

## Core concepts and rich blocks

`api/vendor/github.com/subiz/header/header.pb.go`: Message.format, Message.block, Block.type/content/text and bold/italic/underline fields. `header/block.js` contains formatted text examples. `conversation/conversation.go` handles format=block and structured content; `conversation/message_normalize_test.go` verifies text derivation while retaining the block. Channel rendering support is not inferred from the shared schema.

## Webhook guide revision — English only, 2026-11-14

Primary editorial source: [Webhook tích hợp CRM](https://docs.google.com/document/d/1VkTsSfxgC6PHI5p00FB9RFS83PAI5RZ8dExeYScEvao/edit), read through Google Docs including its tables. The English receiving/payload pages are rewritten from that guide and cross-checked with local source. No Google Doc or backend was edited, and no live webhook/API requests were sent. Vietnamese copies deliberately retain their previous source hashes for later translation.

Implementation evidence and resolved discrepancies:

- `sendback/webhook.go`, `Payload`, `NewDelivery`, `signature`: POST; JSON `events`; delivery ID; User-Agent; raw bytes; HMAC-SHA256 as lowercase **hex**, not Base64. Some language examples in the source document use Base64 and are not reproduced. The current sender always builds the signature header; the guide describes signing as optional. Receiver guidance requires a configured secret and valid signature, without inventing a signing-toggle API.
- `sendback/webhook.go`, `signature`: a **single** `sha256=` prefix followed by comma-separated hex digests. The Google Doc shows repeated header lines instead. The current format is primary; receiver compatibility guidance also covers repeated/combined header values.
- `sendback/main.go`, `UpdateWebhookSecret`: previous secret expires after `24*3600*1000` milliseconds. `NewDelivery` includes it only before expiry. No secret-management API is documented.
- `sendback/webhook.go`, `Delivery.post`: 30-second timeout; redirects are not followed. `Shot` dequeues statuses **200 through 300 inclusive**, while reporting treats `>=300` as failure; the source document promises only `2xx` acknowledgement. Documentation recommends `200`/`2xx` and does not claim all non-2xx responses are retried. The status-300 inconsistency is a backend follow-up, not changed here.
- `Shot`: marks a sender dead after over seven days from first failure; `pubsub.go` after-run callback unsubscribes dead senders and calls `Buffer.Clean(0)`. The docs retain the source guide's general extended-outage warning rather than promising a seven-day retention SLA.
- `SchedAt` is based on `FirstFail + Duration`; `decreaseFrequency` adds 30 seconds capped at 300. This is not enough evidence to promise fixed inter-attempt delays. No fixed retry schedule is published.
- `sendback/vendor/github.com/subiz/header/header.pb.go`, `Event`: JSON fields use `omitempty`, including `by`. The source document says common fields are always populated but its own update example omits `by`. The docs explain optional context instead of requiring every field.
- `user/userdb.go` customer creation and `user/mgr.go` customer-update publication confirm `user_created` / `user_info_updated` and `data.user`. The incomplete update JSON in the Google Doc is replaced with valid synthetic JSON. Existing conversation-assignment evidence above is retained.

No unverified order-event catalog or product events are inferred from the Google Doc's introductory list of business areas. Customer identifiers, device data, and messages in published examples are synthetic.

## Personal access-token instructions — 2026-11-14

The supplied screenshot establishes the live `/apikey` page and its Create token entry point. `subiz/app/PersonalAccessTokens.web.js`, `CreateTokenDialog`, confirms the Account selector, required Note, Expiration selector, create confirmation, Copy token action, and one-time display notice. English/Vietnamese labels are taken from `subiz/lang/en-US.json` and `vi-VN.json`. `subiz/src/router.js` registers `/apikey`; `subiz/store/api.js` scopes token creation to the selected account. `api/auth.go`, `getAccessToken`, confirms Bearer-header support despite older UI translation strings mentioning a query parameter.

The Authentication article now starts with the token-creation steps and removes the outdated claim that no self-service token workflow is established. No real token, account ID, customer data, or token-list screenshot is included in the documentation. The success dialog behavior was verified from source; creating a live credential is unnecessary for these instructions.

Live Chrome verification on the user-authorized test account: opened the personal-token page and creation dialog without submitting. Confirmed Account, Note, Expiration, default 30-day duration, and the Vietnamese confirmation button “Tạo mã”. Closed the form without generating or reading a credential.

Authentication token check: `GET /4.1/me` is registered in `api/router.go` and handled by `api/auth.go:handleMe`. For agent credentials it reads the account-scoped agent or agent profile; user credentials have a separate ReadUser branch. The personal-token guide describes the agent case, sends only the Authorization header, and does not invent a JSON response schema or imply authorization for every operation. No live token request was sent.

Authentication review follow-up (English only): `account/account.go:CreateApiKey` binds the token to the selected account and issuing agent; `GetAgent` checks `acclient.AccessFeature` and returns `account.Agent`. `account/vendor/github.com/subiz/acclient/v2/main.go:AccessFeature` and `CheckPerm` consult the active agent's permissions. This supports the statement that a personal token acts as the agent and does not grant extra access; no exhaustive per-endpoint permission matrix is claimed. The `Agent` protobuf JSON tags confirm `id`, `account_id`, and `fullname`; the new response example is explicitly a selected-field subset with placeholders, not a captured response. `subiz/app/PersonalAccessTokens.web.js` exposes Delete token through the row menu and confirmation; `subiz/lang/en-US.json` confirms permanent deletion. Replacement/revocation instructions use that UI, without promising immediate cache invalidation. Vietnamese content and its reviewed hash remain unchanged.

## Webhook receiver and payload review — 2026-11-14

Re-read `sendback/webhook.go` (`NewDelivery`, `signature`, `post`, `Shot`, `RecentDelivery.NewIndex`), `main.go` (`UpdateWebhookSecret`, queue cleanup job), `pubsub.go` (`OnEvent`, `addSched`, `addFunc`), and `queue.go:Clean`. Confirmed raw-body HMAC-SHA256, lowercase hex, comma-separated digests with one prefix, 24-hour previous-secret expiry, 30-second timeout per HTTP attempt, no redirects, and per-webhook delivery IDs that can change on a subsequent delivery of the same event. The sender signs even with an empty secret, so the receiver guide explicitly requires a nonempty trusted secret. The existing status-300 inconsistency remains; the public guide recommends 200 and makes no blanket claim that every non-2xx response is retried. The cleanup job also drops segments older than its day-based cutoff; no guaranteed seven-day retention window is published.

Live Chrome: opened `/settings/webhooks` and the unsaved `/settings/webhooks/new` form in the user-authorized test account. Inspected labels only, selected Custom event to reveal options, and returned to the list without saving. Confirmed URL, Secret, event presets/custom selection, enabled control, and Create webhook. No existing secret, token, or customer payload was read. English labels checked against `subiz/lang/en-US.json`; field layout/default events and submit behavior checked in `subiz/src/settings/webhook/{list_webhooks,detail_webhook}.js`. Recent deliveries and request/response tabs are verified in the detail component, without opening existing webhook secrets. The three setup event names are present in both the live form and source.

Payload evidence:

- `sendback/vendor/github.com/subiz/header/header.pb.go`: Event, By, Message, Block, Attribute JSON fields, omitempty behavior, and created versus event_time semantics. Removed `message.integration_id` from the previous example: this field is absent from the reviewed Message schema.
- `conversation/message_normalize_test.go:TestCompileMessageKeepsNonemptyBlock` and the shared Block schema: block content is retained alongside derived text. Rich example uses synthetic content and documented paragraph/text/bold fields.
- `conversation/broadcaster.go:Broadcast` publishes non-internal-call events to the webhook topic, including message and assignment events; internal messages are not globally filtered from webhook publication. Consumers must check actor type and is_internal. A message event alone is not a channel delivery receipt.
- `user/userdb.go` constructs user_created with data.user; the UI explicitly supports its subscription. `user/mgr.go:publishMyUserUpsert` clones customer data and emits user_info_updated without requiring event-level by. The map keyed by customer topic, flushed in publishWebhookLoop, can coalesce rapid updates. The guide avoids claiming an audit event for every edit.
- `conversation/conversation.go:updateConversationAssignee` emits assigned/unassigned events with data.conversation.id and assignee. These backend events are absent from the current creation form; the public page explicitly limits these examples to already-configured subscriptions instead of inventing a UI option or management API.

A public synthetic signature vector uses `docs-example-secret` and the exact UTF-8 bytes of `{"events":[]}` with no newline. Its digest is checked by the documentation test. This is not a captured delivery or a real credential. Vietnamese articles and reviewed hashes remain unchanged.

Creation-secret correction: `sendback/main.go:CreateWebhook` unconditionally sets `inwebhook.Secret = genSecret()` before storing the webhook. The creation form accepts a typed value, but that is not the saved signing key. The setup walkthrough therefore tells readers to reopen the saved webhook and copy its actual Secret. No live subscription was created to establish this behavior; it is verified from the service implementation and the detail form that reads saved webhook data.

## Core concepts review — English only, 2026-11-14

Rechecked `api/vendor/github.com/subiz/header/header.pb.go`: User.id/account_id/attributes/channel/channel_source/profile_id, Touchpoint.channel/source/id, Conversation.members/assignee/touchpoint, ConversationMember.type/id, Event.by/type/data, Message.format/text/block/attachments, and Block.type/content/text/formatting flags. Touchpoint.id is channel-dependent (the schema includes profile and comment destinations); the guide avoids describing every touchpoint ID as a customer profile ID. User and resource examples use synthetic IDs; they do not imply ID prefixes or exact account/cardinality constraints.

`api/handler.go:handleSendEvent` takes conversation context from the URL, reads an Event body, and returns SendMessage's event. `handleSendOmniChannelEvent` and `conversation/conversation.go:SendOmniChannelMessage` establish the separate customer/channel send flow. `conversation/conversation.go:JoinConversation` emits a conversation_invited event carrying members, while `convodb.go:updateAssignee` changes assignee without adding members. The article distinguishes membership, ownership, and event actor identity.

`conversation/message_normalize_test.go:TestCompileMessageKeepsNonemptyBlock` confirms derived text alongside a preserved block; attachment tests confirm that an empty text field does not establish an empty message. The shared Block schema confirms paragraph/text nodes and bold/italic/underline plus image/link/list/table capabilities. No cross-channel rendering guarantee is claimed. `sendback/webhook.go:Payload` supplies the events-array distinction from a single conversation-send request. Existing deep links, including rich-messages-with-blocks, are retained. Vietnamese prose and reviewed hash remain unchanged.

## Canonical object examples — Core concepts, 2026-11-14

Reviewed the canonical schema repository (`header`) directly, including its AGENTS.md, rather than relying only on service-vendored copies:

- `account.proto:Account`, `Agent`: account `id`, name, owner_id, activated state; agent `id`, account_id, fullname, email, active state. An account's own key is id, while other objects use account_id. No account or staff management endpoints are introduced.
- `header.proto:User`, `Attribute`, `Touchpoint`: customer attributes as repeated objects; channel/channel_source/profile_id versus channel/source/id. The Facebook page/profile mapping follows the schema comments. The sample uses placeholder IDs and does not assert a real destination.
- `Conversation`, `ConversationMember`: repeated members, string membership, touchpoint, and assignee. `conversation.go` assigns the active membership string; earlier source checks establish the independent invitation/assignment behavior.
- `Event`, `Data`, `By`, `Message`: standalone event, payload, actor, and message examples. Event.created uses Unix milliseconds; message content is nested under data.message. No deprecated fields, internal ctx, credentials, or full-response guarantees are included.
- `Block`, `Attachment`: nested paragraph/text/bold nodes; file metadata with mimetype, url, name, and size in bytes. `header.go:BlockToText` is used to verify the example's rendered text.

The page now includes 15 JSON examples: Account, Agent, User, Attribute, Touchpoint, Conversation, ConversationMember, Message, Data, By, Event, Block, rich Message, Attachment, and webhook delivery. Related examples use the same account, customer, agent, conversation, and event IDs. The webhook envelope remains the `sendback/webhook.go:Payload` events array, not the Webhook configuration schema.

Validation uses the generated Go types in the canonical header checkout with `encoding/json.Decoder.DisallowUnknownFields`, then marshals each example back and compares JSON values. This checks field names, types, nested shapes, and omission behavior against the serializer used by `api/router.go`; it does not claim that an illustrative object is accepted as a create request or has been delivered by a live account. BlockToText is also checked against “Hello Alex”. No schema or backend files are changed. English source hashes are refreshed; Vietnamese content remains unchanged.

## Message formats and attachments — English only, 2026-11-14

Canonical `header/header.proto`: Message.format/text/block/attachments; Block.type/content/text/href/bold/italic/underline/strike_through; Attachment media metadata (size bytes, duration seconds, image dimensions), AttachmentType, MessageButton, QuickReply, and GenericElementTemplate. JSON examples use schema fields only. Regular text omits bold; there is no light flag. Shared schema support is not a promise of support on every destination channel.

Rendering evidence: `header/header.go:blockToEle` renders bold/italic/underline/strike-through text and link hrefs; `renderBlockToText`/`blockTextWithHref` handle paragraph/div/hard_break and labeled links. `subiz/utils/common.js:_blockToProseMirror` maps text marks and link.text/link.href; its tests use the same shape. Link labels are direct text rather than child nodes.

`subiz/app/com/{ImageAttachments,VideoAttachments,AudioAttachments,FileAttachments}.js` distinguishes file media by mimetype; all documented media use type=file. LinkAttachments handles link/fallback; ButtonAttachments handles button/buttons and url_button; GenericTemplateAttachments handles generic/elements; the quick-reply model and client handlers establish title/payload fields. Only supported examples are shown; wider channel-specific attachments are not treated as generic files.

`conversation/cdn_attachment.go:prepareMessageFiles,importAttachment` imports file URLs and replaces url/file metadata with stored values; file source is required from url or file.url. `conversation.go:doFile` uses this preparation. This supports explaining that returned metadata may differ from the source. No upload API, universal byte/count limits, external-channel guarantees, or working assets at example.com are invented.

Examples are decoded with DisallowUnknownFields into the generated Go types from the canonical header checkout and marshaled back to compare JSON field names/types. Block rendering is checked using the actual header helpers. No live messages are sent. These are two intentionally English-only additions; existing Vietnamese prose and review hashes are preserved, with the new translation backlog explicitly recorded.


## Usage limits and errors — English only, 2026-11-14

Editorial reference: https://resend.com/docs/api-reference/rate-limit separates request rates, headers, and quotas. Its numerical limits, headers, quota names, and status mapping are Resend-specific and are not transferred to Subiz.

- `api/router.go:HttpWraps,returnError`: context errors use HTTP 400; handler errors default to 400, with service_unavailable mapped to 500. The gateway wraps handler errors with EServer, appending internal without necessarily changing the original classification. Panic/serialization paths can also return 500. Do not promise a one-to-one mapping of body class to HTTP status or treat internal alone as retryable.
- `api/vendor/github.com/subiz/log/error.go:AError,ToJSON,newError,rawify,getValueType`: standard top-level code/class and nested error; comma-separated codes; optional diagnostic id/number, localized message, typed attrs with string values. NewError preserves existing codes/class when wrapping. EPayloadTooLarge, ELimitExceeded, ERateLimit, EDeny, EExpiredAccessToken, EConversationEnded, EInvalidIntegration, EServiceUnavailable, and ETimeout establish documented codes. The HTTP example uses selected fields and synthetic sizes, not a captured production response.
- `conversation/conversation.go:sendMessageToConvo,checkMessageSent,normalizeMessageContent`: normalization precedes message validation for ordinary agent sends. MAX_TEXT_CHAR=1524288, MAX_ATTACHMENT=50, MAX_FIELD=540, MAX_FIELD_KEY=42428, MAX_FIELD_VALUE=1524288. String checks use Go len (UTF-8 bytes), not characters. The field limit error reports MAX_FIELD_KEY even for an oversized value; the article lists the actual validated ceilings instead of interpreting capacity generically. Internal privileged bypasses are not public allowances. An additional attachment string-representation check is not represented as an upload/file byte limit. Connected-channel restrictions remain separate.
- `user/mgr.go:validUserSize,TryUpdateUser` and `user/new_mgr.go:updateAttribute2`: maximum 1000 input attributes and 2048 combined bytes of text+datetime+other_values per attribute. The normal attribute-update path validates normalized input; TryUpdateUser also checks input size before its work. These checks do not establish a stored-customer quota or an account-wide attribute-definition allowance.
- `api/auth_ratelimit.go:authIPPolicy,enforceAuthIPRateLimit` has route-specific authentication buckets, HTTP 429, and Retry-After. These do not establish a global limit for the documented customer/conversation operations or GET /4.1/me. `api/router.go:ServeHTTP` has a separate short-link host throttle, also not the public API allowance. `api/handler.go` and `user/mgr.go` contain specific user-event throttles; no general requests-per-second guarantee is inferred. At this initial review, no shared ratelimit-limit/remaining/reset header contract or general customer/conversation allowance was found. The newer token/account limiter is covered in the follow-up below and supersedes the initial absence of a general allowance. Infrastructure limits and commercial/channel quotas are not established by these sources.

Retry/backoff and write reconciliation are client recommendations, not a server reset schedule or a guarantee of idempotency. No production load test, credentials, API changes, or translation updates are involved.

Validation: generated the selected-fields payload error using the gateway's vendored log.NewError and AError.ToJSON, including the internal wrapper; the resulting JSON matches the published HTTP example. Checked the five message ceilings against the service constants. Production browser checks cover both guides at 390/768/1440 pixels, both themes, sidebar and pagination, heading anchors, local search, and Markdown/LLM exports. Vietnamese routes remain absent for these declared pending translations.


## Token and account usage-limit follow-up — 2026-11-14

The updated gateway implementation supersedes the earlier Usage limits statement that no general request allowance was verified:

- `api/apikey_ratelimit.go:checkAgentAccessTokenRateLimit,checkAPIKeyRateLimit,checkUsageRateLimit` establishes 100 requests/calendar second and 144000/UTC day per exact agent access token; API keys additionally share 100 requests/calendar second and 864000/UTC day per authenticated account. Token identity is hashed, not keyed by agent or login-session ID. No token values are included in documentation.
- `api/auth.go:buildCtxCore` checks agent-token limits after authentication succeeds, then API-key account limits only for session.type=apikey. Login/OAuth agent tokens use the token allowance but not the API-key account allowance. Checks happen before the operation, including /4.1/me. Handler failures do not refund admitted requests. Do not infer that rejected requests never affect any counters: an account rejection can happen after the token counters have advanced.
- `api/vendor/github.com/thanhpk/throttle/ratelimit.go:RateLimit` uses process-local counters with UTC calendar-day buckets. Per-second keys use now.Unix(); the daily retry interval is 86400-now.Unix()%86400. Counters reset on process restart and are not distributed across gateway replicas. The guide explicitly states this scope instead of promising globally enforced account quotas.
- `api/apikey_ratelimit.go:writeUsageRateLimitError`, `api/router.go:HttpWraps,returnError,ServeHTTP`, and `api/airouter.go` preserve usage-limit errors as HTTP 429, with Retry-After (1 second or seconds until UTC midnight), Cache-Control: no-store, Content-Type: application/json, and log.ERateLimit().ToJSON(). This produces code=rate_limit,limit_exceeded,invalid_input and legacy class=400; it does not pass through the usual internal wrapper. Selected-field examples retain this distinction. No remaining/reset headers are emitted by this limiter. Other operation-specific ERateLimit errors can still follow the older HTTP 400 path.
- `api/apikey_ratelimit_test.go` and `api/agent_token_ratelimit_test.go` cover concurrent limits, next-second reset, distinct tokens, shared-account exhaustion, authentication integration, pre-handler rejection, and the 429 response.

`api/DECISIONS.md` and README's API usage limits section agree with these source values. This review confirms the local implementation, not a production rollout date. The changelog records a documentation update only. English source hashes are refreshed; Vietnamese content remains unchanged.


### Additional agent message allowance in the same source update

`api/agent_message_ratelimit.go:checkAgentMessageRateLimit,checkAgentMessageEventRateLimit` adds 5 messages/calendar second, 60/calendar minute, and 5000/UTC day per authenticated account+human-agent identity. The allowance spans tokens/devices and is process-local. Internal messages count; non-message event types and privileged/bot/automation principals are outside this limiter. The identity comes from authenticated context, never the supplied event.by. `api/handler.go:handleSendEvent,handleSendOmniChannelEvent` checks before sending or resolving customer profiles. The shared usage-error writer supplies 429 and Retry-After=1, seconds to next minute, or seconds to next UTC day.

Customer sends reserve len(messages), reject arrays larger than five before reserving, and may consume partial allowance before rejecting a smaller array; no reserved quota is refunded on rejection or backend failure. Cross-checked `conversation/conversation.go:SendOmniChannelMessage`: messages are ordered candidates, returning on first success, not a bulk-delivery array. The guide therefore describes a maximum of five candidates and recommends one for a single destination instead of promising that every candidate is sent. `api/agent_message_ratelimit_test.go` covers concurrency, minute/day exhaustion, event/principal scope, forged sender IDs, handlers, and pre-send batch rejection.

Verification: ran the gateway's TestAPIKeyRateLimit, TestAgentTokenRateLimit, and TestAgentMessage test groups offline with vendored dependencies, without changing backend files or sending live API requests.

## Conversations & Messages endpoint rewrite — English only, 2026-11-17

Gateway (`api`) and vendored `header` schema rechecked; the `conversation` service source was not available locally, so downstream behavior relies on the earlier conversation-service checks recorded above and no new downstream verification is claimed.

- `api/router.go`: POST `/4.1/conversations/{cid}/messages`, POST `/4.0/accounts/{accid}/users/{uid}/messages`, GET `/4.0/conversations/{cid}`, GET `/4.0/conversations/{cid}/messages`, POST `/4.0/conversations/{cid}/members`, POST `/4.0/accounts/{accid}/conversations/{cid}`, POST `/4.1/conversations/{cid}/assign`.
- `api/handler.go:handleSendEvent`: default `message_sent`, rate-limit check, server `created`/`account_id`, path cid overrides message and conversation IDs, returns SendMessage's Event.
- `api/handler.go:handleSendOmniChannelEvent`: top-level `channel` + `profile_id` (+ `channel_source`) resolve the customer through `ReadOrCreateUserByContactProfile` and replace the path uid; `SendOmniChannelMessageRequest` fields from `header.pb.go`.
- `api/handler.go:handleReadConversation,handleListConversationEvents,handleJoinConversation,handleUpdateConvoInfo`; `service_grpc.pb.go` return types (Conversation, Events→array, Empty, Conversation). `hparam.go:Decode2` decodes GET query parameters into `ListConversationEventsRequest` (`start_id`, `limit`).
- `api/auth.go`: `x-fields` query parsed into context fields, supporting the clear-assignee example.
- `api/agent_message_ratelimit.go`: per-agent message allowance and five-candidate ceiling apply to human-agent tokens.

Response JSON examples are selected fields with synthetic IDs. Vietnamese prose and reviewed hashes unchanged (D-0031).

## Customers (Users) endpoint rewrite — English only, 2026-11-17

Gateway (`api`) and `header` rechecked; the `user` service source was not available locally, so downstream behavior relies on the earlier `user/mgr.go`/`user/userdb.go` checks recorded above.

- `api/handler.go:handleCreateUserDirectly`: forwards only channel, channel_source, profile_id, attributes; account from token; returns CreateUser2's User.
- `api/handler.go:handleReadUser`: uid must pass `idgen.IsUserID` (or an internal record_id prefix) else EMissingId; sets an `ETag` header to the MD5 of the returned JSON. Not documented publicly (D-0049).
- `api/handler.go:handleUpdateUser`: forwards only attributes plus primary_id, lead_owners, channel, channel_source, profile_id; the page documents attributes only. Returns UpdateUser's User.
- `api/handler.go:handleGetUserByContactProfile,handleGetOrCreateUserByContactProfile`: GET reads, POST read-or-creates by path channel/source/id.
- `header/attrdef.go`: built-in attribute keys and types (fullname, display_name, emails, phones, address, city, district, gender, job_title, birthdate); created/modified/seen/total_conversations/last_message_sent are read-only.

Unverified downstream semantics (dry-run, partial-update merge rules, alternate uid prefixes, update-by-profile) are intentionally not documented.

## User and attribute format — English only, 2026-11-17

- `header/header.proto` / vendored `header.pb.go`: User (id, account_id, attributes, channel, channel_source, profile_id, labels, created, updated) and Attribute (key, type read-only, text/number/boolean/datetime, other_values, modified) field names and JSON tags; AttributeDefinition types text/number/boolean/datetime.
- `header/attrdef.go`: built-in attribute keys/types; created, modified, seen, total_conversations, last_message_sent are system read-only.
- `header/userutil.go`: datetime values parsed/formatted as RFC 3339.
- `header/header.go`: primary value in `text`, additional values in `other_values` (PushOtherValues/cleanOtherValues; `emails` test fixtures in all_test.go).
- `api/handler.go:handleReadUser` serializes with encoding/json and `omitempty` tags, so empty strings, 0, and false are omitted.

Not published pending `user` service review: the `action` update operations (upsert/replace/insert/delete/push/unshift), writing `other_values`, and treatment of undefined attribute keys. They are defined in `header/header.go:UpdateAttribute` but the service's use of them was not checked.

## Order format — English only, 2026-11-17

Canonical `header/header.proto` (Order, OrderItem, ShippingInfo, Address, Tax, OrderStatusCode, Product.price/sku/name). Proto comments establish: item product is a copy; item discount is before tax and order discount after tax; discount_percentage scale 1234 = 12.34%; Tax.percentage scale 2000 = 20%; currency empty = base currency; payment_status unpaid/paid computed from total and payment_made; status values open/closed/canceled (+ unconfirmed in OrderStatusCode, with won/lost comments); weight grams, dimensions cm; source_id is the source order ID. `header/header.go:CalcTotalOrder` shows subtotal/tax/discount/nominal shipping fee/adjustment composition and fpv_* fixed-point copies.

Gateway `api/router.go` / `handler.go`: order routes are 4.0 (`handleCreateOrder`, `handleReadOrder`, `handleUpdateOrder`, `handleListOrders`) and forward `header.Order` / `OrdersRequest` to the `proder` service. The `proder` source was not available locally, so no endpoint page, request requirements, permissions, or computation guarantees beyond the schema are published. The page uses selected synthetic fields only.

## Order endpoints — English only, 2026-11-17

Source: `proder` (order service) plus gateway `api` and `header`.

- Routes (`api/router.go`): POST `/4.0/accounts/{accid}/orders`, POST `/4.0/accounts/{accid}/orders-search` and GET `/4.0/accounts/{accid}/orders` (both `handleListOrders`), GET and POST `/4.0/accounts/{accid}/orders/{oid}`. Handlers set account (and `oid` → id) and forward to proder.
- `proder/main.go:CreateOrder`: items with product.source_id and no id are linked to (or create) catalog products; then `upsertOrder`.
- `proder/main.go:upsertOrder`: lookup order by source_id (update existing or create), else by id (EMissing), else by number (existing number leaves dborder nil → EMissingId user, so duplicates fail), else create. `user.id` required and must exist (`userclient.GetUser`). New orders default status open. `header.Assign(dborder, order, ctx.Fields)`: with no `x-fields`, every field is copied, clearing omitted ones; user is refilled from the customer record, fullname/phones attributes copied when empty. Default pipeline first stage. Status limited to open/closed/canceled/unconfirmed (else EInvalidInput status; unknown enum strings fall back). `header.CalcTotalOrder` recomputes totals (items without product skipped). payment_made from bills; payment_status paid/unpaid. Agents and tags retained. closed/cancelled_at/cancelled_by set on transition. Events order_created / order_updated / order_status_updated.
- `proder/main.go:UpdateOrder`: after upsert, if Closed != 0 and a shipping code exists and the shipment is not cancelled, `CancelShippingOrder` runs asynchronously (also for edits of already-closed orders).
- `proder/main.go:ReadOrder`: EMissing when absent; agent needs ORDER READ access feature.
- `proder/main.go:ListOrders,listAllOrders,less`: ORDER READ access; non-manager agents limited to salesperson/stage-agent orders; filters user_id, status(es), not_statuses, payment_status, shipping statuses, query (id/number/notes/items/customer name/email/phone), created/due/issue hour ranges (`clock.UnixHour`), is_draft, tags (any; "no"), salesperson (any; "no"), include_deleted; order_by created/issue_date/due_date/assigned/total asc|desc (default desc by id); canceled/deleted sorted last; limit default/max 200; offset; response orders/total/total_value. `anchor` is not used.

## Agents — English only, 2026-11-17

Sources: gateway `api` and canonical `header`. The `account` service source (downstream `ListAgents`) was not available locally, so no new downstream verification is claimed.

- `header/account.proto:Agent`: id, account_id, fullname, email, phone, gender, avatar_url(_128), lang, timezone, joined, invited_by, state (AgentState pending/active/inactive/deleted), modified, type (bot or agent, default agent), client_id (bot ID), scopes (owner, supervisor), extension. `header/account/account.pb.go`: snake_case JSON tags with omitempty. Timestamp units for joined/modified are not stated in the schema, so the page does not claim one; example values are synthetic.
- `api/router.go`: GET `/4.0/agents` and `/4.1/agents` (WithETag) and GET `/4.0/accounts/{accid}/agents` (no WithETag) → `handleListAgents`.
- `api/handler.go:handleListAgents`: sets AccountId from the authenticated context and returns `ListAgents(...).GetAgents()`, i.e. a bare JSON array; no pagination fields. `api/auth.go:buildCtxCore` sets the context account from the token.
- `api/router.go:writeETagResponse,matchesETag`: weak SHA-256 ETag, `Cache-Control: private, no-cache`, `If-None-Match` match → 304 with no body. ETag/conditional-request behavior is intentionally omitted from the public page by user request (D-0049).

Not published (unverified without `account`): which states/types the list includes (e.g. whether deleted agents or bots are returned), ordering, and permission requirements. The page tells readers to filter by `state`/`type` instead. A client library (`acclient.listAgentsDB`) drops deleted agents on its own side; that is not evidence of the service response. Vietnamese translation pending (D-0031).

### Get agent details (follow-up, same day)

- `api/router.go`: GET `/4.0/agents/{agid}` and `/4.0/accounts/{accid}/agents/{agid}` → `handleReadAgent`; GET `/4.1/accounts/{accid}/agents/{agid}` → `handleReadAgent2` (plain GetAgent, permission handling only downstream); GET `/4.1/agents/{agid}` → `handleGetAgentProfile` (cross-account agent profile, a different object — not documented).
- `api/handler.go:handleReadAgent`: `LookupAgentById` (error returned as-is when missing); if `acclient.AccessFeature(acc, AGENT, READ, cred)` passes, returns full `GetAgent`; otherwise returns only account_id, id, fullname, avatar_url. `api/vendor/github.com/subiz/acclient/v2/main.go:AccessFeature` consults the token agent's permissions (internal credential types and manager admin role bypass). The page documents the 4.0 route because this gateway-visible permission split is verifiable; the exact not-found error code depends on the unavailable `account` service and is not published.

## Products — English only, 2026-11-17

Sources: gateway `api`, order/product service `proder`, canonical `header`.

- `api/router.go`: POST `/4.0/accounts/{accid}/products` (`handleCreateProduct`), POST `/4.0/accounts/{accid}/products-search` and GET `/4.0/accounts/{accid}/products` (`handleListProducts2`), GET (`handleReadProduct`) and POST (`handleUpdateProduct`) `/4.0/accounts/{accid}/products/{pid}`. Handlers set account (and path pid) and forward to proder. `api/hparam.go:Decode2` decodes GET query parameters into the request message.
- `header/header.proto:Product,ProductsRequest,KV,ProductOption`: fields and JSON names; proder validation narrows visibility to published/hidden and condition to new/refurbished/used.
- `proder/main.go:CreateProduct`: PRODUCT CREATE access feature, clears id, then UpdateProduct (which also checks PRODUCT UPDATE).
- `proder/main.go:UpdateProduct`: GetProduct by id; if absent, `db.go:getOrCreateProduct` matches id, else source_id (when sent), else sku, else creates a new product with a generated id. Validation on the request body before assignment: name required, category ≤255 bytes, visibility ≤63 bytes, availability in the six values (lowercased/trimmed). `header.Assign` with x-fields, skipping created/created_by/updated/updated_by/modified/error/enrichment-cost fields; without x-fields all fields copy. Visibility default published; condition validated after assignment. updated_by = token issuer.
- `proder/main.go:handleProductImages,uploadProductImage`: changed image/images imported via `ImportCDNFile` and replaced with a 500×500 JPEG resize URL; failure fails the request.
- `proder/main.go:upsertProduct,shareProduct`: product_group_id defaults to id; created/updated/modified in ms; shared fields (url, handle, category, brand, note, condition, visibility, name, description, images, videos, options) are copied to other products in the group.
- `proder/main.go:ReadProduct`: PRODUCT READ; EMissing when absent; num_variants and up to 5 other_variants via `db.go:ListProductVariants` (excludes the product itself).
- `proder/main.go:ListProducts2,filterProducts`: PRODUCT READ, otherwise a single best match for `query` in `product`. Sorted by id descending (string). Filters documented: query (normalized contains), sku, source_id, category, visibility, availability instock/out_of_stock (by stock), price_gte/lte, props (exact key+value, all required), grouped, variant_of (early return, other filters skipped). limit ≤0 or >1000 → 100; anchor = ids lower than anchor; next_anchor = last id. `offset` is applied after truncation to `limit`, so it does not page; documented as not for paging. ids/last_modifieds, collection_ids, discount filters, include_deleted, id_only are not documented.

Product deletion, imports, feeds, crawling, and product search for chat are out of scope. Vietnamese translation pending (D-0031).

## Vietnamese translation pass — 2026-11-17

All 34 English pages now have reviewed Vietnamese counterparts stamped with the current English source hash (D-0048). Prose only was translated; every code block is byte-identical to English (checked per page and by `tests/content.mjs`). Internal links use `/docs/vi/...` and Vietnamese heading anchors; all 563 same-site fragment links in the build resolve. Vietnamese UI labels in step-by-step instructions come from the Subiz dashboard language file (`dashboard-v4/lang/vi-VN.json`: `security_delete_token`, `setting_webhook_add`, `setting_webhook_create`, `custom_event`, `edit`, `secret`). No API behavior was re-verified in this pass; the Vietnamese pages carry the same evidence as their English sources.

## Send a ZBS message (send-zbs) — English only, 2026-11-18

Documents only POST `/4.0/accounts/{accid}/messages` with `touchpoint.channel=zns` (D-0051). No live ZNS was sent.

- `api/router.go`, `handler.go:handleSendEvent`: type defaults to message_sent; Event forwarded to conversation SendMessage; agent message rate limit applies.
- `conversation/conversation.go:SendMessage,sendMessage2`: zns branch calls zalokon.SendZNS with account, `data.message.zns_phone`, `zns_template_id`, `zns_template_data`, and top-level `source_event_id` as tracking ID; returns zalokon's event. No conversation event is stored. A background goroutine pongs (PongMessage zns branch only notifies campaigns) and creates a `zns_sent` customer event via GetOrCreateUserByProfile(accid, "call", "call", phone) + CreateEvent, regardless of Zalo's ack result.
- `zalokon/main.go:SendZNS`: INTEGRATION read permission; missing account/phone/template errors; template must belong to the account; OA taken from the template; DATE params via `sbutil.go:ValidateZnsTime`; `acclient.TrySpend` credit check before sending; `header.PhoneNumber` normalization; Zalo rejection returned as ack pong with `ack_error` (raw Zalo body) and `error` (`zlutil.go:translateZNSError`), not a gRPC error; `acclient.Spend` only on Zalo "Success"; 30-second Zalo timeout. Error codes -108, -118, -133 from source comments.
- Clients using the same path: `subiz/src/activities/zns_template_modal.js`, `automation/action.go` (reads ack pongs).
- The development phone-number shortcut in SendZNS (`SendDevZNS`) is intentionally not published.
- Template parameter types (user decision): the page lists STRING, NUMBER, DATE as common `listParams.type` values, observed in an owner-supplied `/4.1/zns-templates` listing (not a complete Zalo catalog). `api/hparam.go:Decode2` decodes `zns_template_data` as map<string,string>, so JSON numbers are rejected. `zalokon/sbutil.go:ValidateZnsTime` leaves `dd/MM/yyyy` and `HH:mm dd/MM/yyyy` unchanged; NUMBER values are not transformed. NUMBER/DATE formats follow the owner's guidance.
