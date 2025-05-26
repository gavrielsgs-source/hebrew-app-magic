
// GROW API configuration
export const GROW_USER_ID = Deno.env.get('GROW_USER_ID') || '3bdaec1d6c7e9ef7';
export const GROW_PAGE_CODE = Deno.env.get('GROW_PAGE_CODE') || 'f8dc02a4a03d';
export const GROW_CLIENT_ID = Deno.env.get('GROW_CLIENT_ID') || '3bdaec1d6c7e9ef7';
export const GROW_EC_PWD = Deno.env.get('GROW_EC_PWD') || 'f8dc02a4a03d';
export const SUCCESS_URL = '/subscription/payment-success'
export const CANCEL_URL = '/subscription/upgrade'

// Update to use the correct direct debit endpoint for both payment creation and updates
export const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
