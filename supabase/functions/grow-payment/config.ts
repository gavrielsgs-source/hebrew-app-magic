// GROW API configuration - All credentials must be set in Supabase secrets
const GROW_USER_ID = Deno.env.get("GROW_USER_ID");
const GROW_PAGE_CODE = Deno.env.get("GROW_PAGE_CODE");
const GROW_CLIENT_ID = Deno.env.get("GROW_CLIENT_ID");
const GROW_EC_PWD = Deno.env.get("GROW_EC_PWD");

// Validate required credentials
if (!GROW_USER_ID) throw new Error("GROW_USER_ID environment variable is required");
if (!GROW_PAGE_CODE) throw new Error("GROW_PAGE_CODE environment variable is required");

export { GROW_USER_ID, GROW_PAGE_CODE, GROW_CLIENT_ID, GROW_EC_PWD };
export const SITE_URL = "https://fb9cfd38-7a13-46ea-b988-44577bd53611.lovableproject.com";
export const SUCCESS_URL = `${SITE_URL}/subscription/payment-success`;
export const CANCEL_URL = `${SITE_URL}/payment`;
export const NOTIFY_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/grow-webhook`;

console.log(Deno.env.get("SUPABASE_URL"));

// Update to use the correct direct debit endpoint for both payment creation and updates
export const GROW_API_BASE = "https://sandbox.meshulam.co.il/api/light/server/1.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
