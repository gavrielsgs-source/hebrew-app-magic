/**
 * ============================================================================
 *  Attribution Service (Future-Ready)
 * ============================================================================
 *
 *  PURPOSE
 *  -------
 *  A single, isolated module that resolves the "source" of a Meta lead
 *  (Facebook vs Instagram vs Meta vs Unknown) and returns a structured
 *  AttributionResult. Designed to be safe to call from the public/reviewer
 *  webhook flow today, while keeping all enhanced detection logic ready to
 *  switch on once App Review approves `ads_read` and `instagram_basic`.
 *
 *  WHAT WORKS NOW (public/reviewer-safe)
 *  -------------------------------------
 *  - resolveAttribution() with `enhanced=false` performs ZERO Graph calls
 *    and returns a conservative label of "Facebook" (since Lead Ads ship
 *    through Facebook Pages). If we have no signal at all (no page_id),
 *    it falls back to "Meta".
 *  - Stores raw evidence on the lead JSON so we never lose information.
 *
 *  WHAT IS FUTURE-READY BUT DISABLED
 *  ---------------------------------
 *  - resolveAttribution() with `enhanced=true` performs ad-metadata lookup
 *    via the Graph API and may resolve to "Instagram" / confirmed "Facebook".
 *  - lookupInstagramLinkage() is stubbed: REQUIRES `instagram_basic` scope.
 *  - lookupCampaign() is stubbed: REQUIRES `ads_read` scope.
 *
 *  HOW TO ENABLE LATER
 *  -------------------
 *  - Set the edge function env var FEATURE_ENHANCED_ATTRIBUTION=true
 *    (controlled globally), OR
 *  - Set profiles.attribution_enhanced=true for a specific user.
 *  - The webhook calls isEnhancedEnabled() which OR-merges both.
 *
 *  STORAGE
 *  -------
 *  - JSONB now: lead_data.attribution on facebook_leads (zero migration friction)
 *  - Mirror table when flag is on: public.lead_attributions
 * ============================================================================
 */

export type LeadSource = "Facebook" | "Instagram" | "Meta" | "Unknown";

export type DetectionMethod =
  | "default_safe"                          // flag OFF — conservative label
  | "no_ad_id"                              // no ad_id present
  | "ad_metadata_instagram_actor"           // enhanced: IG actor / IG media URL found
  | "ad_metadata_no_instagram_markers"      // enhanced: ad exists, no IG markers → Facebook
  | "ad_lookup_failed"                      // enhanced: HTTP error from Graph
  | "ad_lookup_exception";                  // enhanced: thrown exception

export type DetectionConfidence = "none" | "low" | "medium" | "high";

export interface AttributionInput {
  adId?: string | null;
  formId?: string | null;
  pageId?: string | null;
  campaignId?: string | null;
  pageAccessToken?: string | null;
  /** When true, perform Graph lookups. When false, return conservative label. */
  enhanced: boolean;
}

export interface AttributionResult {
  /** What we show in UI today (safe label) */
  lead_source_display: LeadSource;
  /** Internal raw classification — may differ from display when flag is OFF */
  lead_source_raw: LeadSource;
  detection_method: DetectionMethod;
  detection_confidence: DetectionConfidence;
  detection_error: string | null;
  ad_id: string | null;
  campaign_id: string | null;
  form_id: string | null;
  page_id: string | null;
  /** Free-form evidence (kept verbatim for audit/debug) */
  evidence: Record<string, unknown>;
  /** Whether enhanced detection ran */
  enhanced_used: boolean;
}

/**
 * Resolve whether the enhanced attribution flow should run for this user.
 * Global env var OR per-user profile flag.
 */
export function isEnhancedEnabled(perUserOverride: boolean | null | undefined): boolean {
  const globalFlag = (Deno.env.get("FEATURE_ENHANCED_ATTRIBUTION") ?? "").toLowerCase();
  const globalOn = globalFlag === "true" || globalFlag === "1" || globalFlag === "yes";
  return globalOn || perUserOverride === true;
}

/**
 * Conservative label for the public/reviewer flow.
 * Lead Ads are technically a Facebook Page product → "Facebook" is defensible.
 * Only fall back to "Meta" when we have no page context at all.
 */
function safeDefault(input: AttributionInput): AttributionResult {
  const display: LeadSource = input.pageId ? "Facebook" : "Meta";
  return {
    lead_source_display: display,
    lead_source_raw: display,
    detection_method: "default_safe",
    detection_confidence: "low",
    detection_error: null,
    ad_id: input.adId ?? null,
    campaign_id: input.campaignId ?? null,
    form_id: input.formId ?? null,
    page_id: input.pageId ?? null,
    evidence: { reason: "enhanced_attribution_disabled" },
    enhanced_used: false,
  };
}

/**
 * Enhanced ad-metadata lookup. Requires `ads_read` (already requested) and
 * works best with `instagram_basic` (for IG actor resolution).
 * Only invoked when the feature flag is ON.
 */
async function enhancedAdLookup(input: AttributionInput): Promise<AttributionResult> {
  if (!input.adId) {
    return {
      lead_source_display: input.pageId ? "Facebook" : "Meta",
      lead_source_raw: "Unknown",
      detection_method: "no_ad_id",
      detection_confidence: "none",
      detection_error: null,
      ad_id: null,
      campaign_id: input.campaignId ?? null,
      form_id: input.formId ?? null,
      page_id: input.pageId ?? null,
      evidence: { reason: "no_ad_id_in_payload" },
      enhanced_used: true,
    };
  }

  if (!input.pageAccessToken) {
    return {
      lead_source_display: input.pageId ? "Facebook" : "Meta",
      lead_source_raw: "Unknown",
      detection_method: "ad_lookup_failed",
      detection_confidence: "none",
      detection_error: "missing_page_access_token",
      ad_id: input.adId,
      campaign_id: input.campaignId ?? null,
      form_id: input.formId ?? null,
      page_id: input.pageId ?? null,
      evidence: {},
      enhanced_used: true,
    };
  }

  try {
    // Future TODO: include `campaign{id,name,objective}` once `ads_read` is approved
    // Fields requiring `instagram_basic`: instagram_actor_id, effective_instagram_media_url
    const fields = "effective_instagram_media_url,instagram_actor_id";
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${input.adId}?fields=${fields}&access_token=${input.pageAccessToken}`,
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        lead_source_display: input.pageId ? "Facebook" : "Meta",
        lead_source_raw: "Unknown",
        detection_method: "ad_lookup_failed",
        detection_confidence: "none",
        detection_error: `HTTP ${res.status}: ${errText.substring(0, 200)}`,
        ad_id: input.adId,
        campaign_id: input.campaignId ?? null,
        form_id: input.formId ?? null,
        page_id: input.pageId ?? null,
        evidence: { http_status: res.status },
        enhanced_used: true,
      };
    }

    const ad = await res.json();
    const isInstagram = !!(ad.instagram_actor_id || ad.effective_instagram_media_url);

    return {
      lead_source_display: isInstagram ? "Instagram" : "Facebook",
      lead_source_raw: isInstagram ? "Instagram" : "Facebook",
      detection_method: isInstagram
        ? "ad_metadata_instagram_actor"
        : "ad_metadata_no_instagram_markers",
      detection_confidence: "high",
      detection_error: null,
      ad_id: input.adId,
      campaign_id: input.campaignId ?? null,
      form_id: input.formId ?? null,
      page_id: input.pageId ?? null,
      evidence: ad,
      enhanced_used: true,
    };
  } catch (err) {
    return {
      lead_source_display: input.pageId ? "Facebook" : "Meta",
      lead_source_raw: "Unknown",
      detection_method: "ad_lookup_exception",
      detection_confidence: "none",
      detection_error: err instanceof Error ? err.message : String(err),
      ad_id: input.adId,
      campaign_id: input.campaignId ?? null,
      form_id: input.formId ?? null,
      page_id: input.pageId ?? null,
      evidence: {},
      enhanced_used: true,
    };
  }
}

/**
 * MAIN ENTRY POINT.
 * - Pure function from the perspective of the webhook (no DB writes).
 * - Caller decides whether to mirror the result into `lead_attributions`.
 */
export async function resolveAttribution(input: AttributionInput): Promise<AttributionResult> {
  if (!input.enhanced) return safeDefault(input);
  return enhancedAdLookup(input);
}

/* ----------------------------------------------------------------------------
 * Future hooks (DO NOT CALL until permissions are approved)
 * --------------------------------------------------------------------------*/

/** REQUIRES `instagram_basic`. Resolves IG business account linkage for a Page. */
export async function lookupInstagramLinkage(
  _pageId: string,
  _pageAccessToken: string,
): Promise<{ ig_business_id: string | null; verified: boolean }> {
  // TODO(after instagram_basic approval):
  // GET /{page_id}?fields=instagram_business_account
  return { ig_business_id: null, verified: false };
}

/** REQUIRES `ads_read`. Resolves campaign/adset metadata for an ad. */
export async function lookupCampaign(
  _adId: string,
  _pageAccessToken: string,
): Promise<{ campaign_id: string | null; campaign_name: string | null }> {
  // TODO(after ads_read approval):
  // GET /{ad_id}?fields=campaign{id,name,objective},adset{id,name}
  return { campaign_id: null, campaign_name: null };
}
