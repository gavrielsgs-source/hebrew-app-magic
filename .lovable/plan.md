
# Fix: Inventory URL always points to production domain

## Problem
The current code uses `window.location.origin` to build the public inventory link. This means:
- In development/preview: users see `https://id-preview--xxx.lovable.app/inventory/slug`
- Only in production they'd see the correct `https://carsleadapp.com/inventory/slug`

Every dealer who copies the link from the settings page would get an incorrect URL that won't work for their customers.

## Solution
Hardcode the production URL back to `https://carsleadapp.com` so the inventory link always points to the correct, permanent address regardless of which environment the dealer is using.

## Technical Details
**File:** `src/components/profile/InventorySettingsTab.tsx`

Change line 34 from:
```typescript
const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://carsleadapp.com";
```
To:
```typescript
const baseUrl = "https://carsleadapp.com";
```

This is a single-line change. The inventory page itself (`/inventory/:slug`) will continue to work on any domain since the data fetching uses the Supabase edge function directly.
