

# Replace Grow Payment with Tranzila iFrame Recurring Payments

## Overview
Replace the current Grow (Meshulam) payment integration with Tranzila's iFrame-based recurring payments system. This involves creating a new edge function for the handshake, updating the payment flow to use Tranzila's iFrame, creating a webhook handler, and fixing the existing build error.

## Build Error Fix
Line 164 in `FacebookLeadIntegration.tsx` calls `addDebugLog("token for page:", longLivedPageToken)` with 2 arguments, but the function only accepts 1 string. Fix: use template literal instead.

## Architecture

```text
User selects plan --> PaymentForm collects details
       |
       v
Edge Function: tranzila-handshake (server-side)
  - Calls Tranzila API with supplier, TranzilaPW, sum
  - Returns thtk token
       |
       v
Frontend loads Tranzila iFrame with:
  - thtk, sum, recur params, customer info, display settings
  - iFrame handles card entry (PCI compliant)
       |
       v
Tranzila processes payment --> sends webhook
       |
       v
Edge Function: tranzila-webhook
  - Validates transaction
  - Creates/updates user subscription
  - Records payment history
  - Sends emails
```

## Required Secrets
Two new secrets must be configured before implementation:
- **TRANZILA_SUPPLIER** - Terminal name from Tranzila
- **TRANZILA_PW** - Terminal token password

## Step-by-Step Changes

### 1. Fix Build Error
**File:** `src/components/leads/FacebookLeadIntegration.tsx` (line 164)
- Change `addDebugLog("token for page:", longLivedPageToken)` to `addDebugLog(\`token for page: \${longLivedPageToken}\`)`

### 2. Create Edge Function: `tranzila-handshake`
**File:** `supabase/functions/tranzila-handshake/index.ts`
- Authenticated endpoint (verify JWT via getClaims)
- Accepts POST with `{ sum, planId, billingCycle, isYearly }`
- Makes GET request to `https://api.tranzila.com/v1/handshake/create` with supplier, TranzilaPW, and sum
- Returns the `thtk` token to the frontend
- Never exposes TranzilaPW to the client

**Config:** Add `[functions.tranzila-handshake]` with `verify_jwt = false`

### 3. Create Edge Function: `tranzila-webhook`
**File:** `supabase/functions/tranzila-webhook/index.ts`
- Public endpoint (no JWT required, webhook from Tranzila)
- Parses form-urlencoded or JSON payload from Tranzila
- Extracts transaction details (Response, ConfirmationCode, etc.)
- On success: updates subscription, records payment history, generates invoice, sends emails
- Reuses existing patterns from `grow-webhook/index.ts`

**Config:** Add `[functions.tranzila-webhook]` with `verify_jwt = false`

### 4. Update Payment Flow UI
**File:** `src/pages/UpgradeSubscription.tsx`
- After collecting form data, call `tranzila-handshake` to get the `thtk` token
- Instead of redirecting to Grow URL, render a Tranzila iFrame inside the Drawer
- Build the iFrame URL with all required parameters:
  - `sum`, `currency=1` (NIS), `cred_type=1`, `tranmode=A`
  - `new_process=1`, `thtk` from handshake
  - Recurring params: `recur_transaction=4_approved` (monthly) or `7_approved` (yearly)
  - `recur_payments` based on billing cycle
  - Customer fields: `contact`, `email`, `phone`, `company`, `address`, `city`
  - Display: `lang=il`, `nologo=1`, `buttonLabel=שלם`, brand colors
  - Product details for invoice via `u71=1` and `json_purchase_data`

### 5. Create Tranzila iFrame Component
**File:** `src/components/subscription/TranzilaPaymentIframe.tsx`
- Renders the Tranzila iFrame with proper sizing
- Accepts plan details, customer info, and thtk as props
- Builds the form and auto-submits to load the iFrame
- Handles loading state

### 6. Update Plan Pricing Config
- Ensure consistent pricing across `SubscriptionPlanCards`, `PricingSection`, `UpgradeSubscription`, and the webhook
- Monthly: Premium 199, Business 399, Enterprise 699
- Yearly: Premium 179/mo, Business 349/mo, Enterprise 619/mo

### 7. Update Landing Page Trial Flow
**File:** `src/components/landing/PricingSection.tsx`
- For new users (trial signup), also use Tranzila with `tranmode=V` (verification) for 1 NIS charge

## Technical Details

### Tranzila iFrame URL Format
```
https://direct.tranzila.com/{supplier}/iframenew.php
```
Parameters sent via POST form targeting the iFrame.

### Recurring Payment Parameters
- Monthly: `recur_transaction=4_approved`
- Yearly: `recur_transaction=7_approved`
- `recur_sum` = monthly/yearly amount
- `recur_start_date` = next billing date

### Webhook Response Fields
Tranzila sends back transaction results including:
- `Response` (000 = success)
- `ConfirmationCode` (asmachta)
- `index` (transaction ID)
- Custom fields passed through

### Security
- TranzilaPW stored as Supabase secret, never exposed to client
- Handshake performed server-side to prevent amount tampering
- Amount verified via handshake mechanism (mismatch returns error 912791)
- All card data handled by Tranzila iFrame (PCI DSS compliant)

## Files Summary
| File | Action |
|------|--------|
| `src/components/leads/FacebookLeadIntegration.tsx` | Fix build error (line 164) |
| `supabase/functions/tranzila-handshake/index.ts` | Create new |
| `supabase/functions/tranzila-webhook/index.ts` | Create new |
| `src/components/subscription/TranzilaPaymentIframe.tsx` | Create new |
| `src/pages/UpgradeSubscription.tsx` | Update payment flow to use Tranzila iFrame |
| `supabase/config.toml` | Add 2 new function configs |

## Order of Implementation
1. Fix build error
2. Add secrets (TRANZILA_SUPPLIER, TRANZILA_PW)
3. Create tranzila-handshake edge function
4. Create tranzila-webhook edge function
5. Create TranzilaPaymentIframe component
6. Update UpgradeSubscription page
7. Update config.toml
8. Deploy and test

