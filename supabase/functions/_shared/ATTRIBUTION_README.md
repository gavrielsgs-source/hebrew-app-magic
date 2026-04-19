# Attribution Architecture — Developer Notes

## TL;DR

We separated the **public/reviewer-safe** Meta lead sync from the **future
Facebook vs Instagram attribution** logic so we can ship one without the other.

## What works now (public flow)

- `facebook-leads` webhook validates Meta signatures (HMAC-SHA256 / `x-hub-signature-256`)
- Receives `leadgen` change → fetches lead via Graph API
- Saves the lead to `public.facebook_leads` via `save_facebook_lead` RPC
- Sends welcome WhatsApp message
- Calls `resolveAttribution({ enhanced: false })` → returns a **safe label**:
  - `"Facebook"` when we have a `page_id` (Lead Ads run on Pages)
  - `"Meta"` only when we truly cannot tell
- Persists evidence under `lead_data.attribution` on the JSONB record
- **No Graph calls beyond the existing approved lead-fetch.** Reviewers see
  exactly the behavior the App Review covers today.

## What is future-ready but disabled

- `resolveAttribution({ enhanced: true })` calls Graph `/{ad_id}?fields=…`
  and resolves `Instagram` vs `Facebook` from `instagram_actor_id` /
  `effective_instagram_media_url`.
- When the flag is on, the webhook **also** mirrors evidence to
  `public.lead_attributions` for clean SQL reporting.
- Stub helpers `lookupInstagramLinkage()` and `lookupCampaign()` are in
  `_shared/attribution.ts` ready to be wired up.

## Permissions required to fully activate

| Capability                                  | Scope required        | Status        |
|---------------------------------------------|-----------------------|---------------|
| Receive lead notifications                  | `leads_retrieval`     | ✅ approved    |
| Resolve `Instagram` via ad metadata         | `ads_read`            | ⏳ pending     |
| Resolve IG business account linkage on Page | `instagram_basic`     | ⏳ pending     |
| Pull campaign/adset names                   | `ads_read`            | ⏳ pending     |

## Feature flag (dual control)

| Layer       | Where                                                  | Default |
|-------------|--------------------------------------------------------|---------|
| Global      | Edge Function env var `FEATURE_ENHANCED_ATTRIBUTION`   | `false` |
| Per-user    | `public.profiles.attribution_enhanced` (boolean)       | `false` |

Resolution: `enabled = global || perUser`. Implemented in
`_shared/attribution.ts → isEnhancedEnabled()`.

## Storage

| Layer       | Where                                                | When written        |
|-------------|------------------------------------------------------|---------------------|
| JSONB (now) | `facebook_leads.lead_data.attribution`               | every webhook lead  |
| Mirror      | `public.lead_attributions`                           | only when flag = ON |

`lead_attributions` columns capture: `lead_source_raw`, `lead_source_display`,
`detection_method`, `detection_confidence`, `detection_error`, `ad_id`,
`campaign_id`, `form_id`, `page_id`, raw `evidence` (jsonb).

## To enable enhanced attribution

1. Get App Review approval for `ads_read` (and `instagram_basic` for IG).
2. Either:
   - Set Edge Function secret `FEATURE_ENHANCED_ATTRIBUTION=true` (global), or
   - Toggle `profiles.attribution_enhanced` for individual pilot users.
3. No code changes required. The webhook will start performing ad-metadata
   lookups and writing to `lead_attributions`.

## Files involved

- `supabase/functions/_shared/attribution.ts` — pure attribution service
- `supabase/functions/facebook-leads/index.ts` — public webhook (calls service)
- `src/components/leads/AttributionDetails.tsx` — UI (only shown if data exists)
- `src/hooks/leads/use-fetch-leads.ts` — surfaces attribution to UI
