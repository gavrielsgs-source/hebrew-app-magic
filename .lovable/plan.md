
# Add Cancel/Manage Subscription Access for Paid Users

## Problem
Users who have paid for a subscription have no way to reach the "Manage Subscription" page (`/subscription/manage`) where the cancel button and payment history are located. The main `/subscription` page only shows plan details and an "Upgrade" button but no link to manage or cancel.

## Solution
Add a "Manage Subscription / Cancel" button on the `/subscription` page that links to `/subscription/manage` -- but only for users with a paid subscription (`active` status). Trial users won't see it since their trial can be cancelled from the manage page too, but we can show it for all authenticated users.

Also, on the `/subscription/manage` page (ManageSubscription.tsx), update the logic to properly reflect the 14-day trial billing model:
- During trial: show that cancellation is immediate and no charge will occur
- After trial (active): show that cancellation happens at end of billing period

## Changes

### 1. `src/pages/Subscription.tsx`
Add a "Manage Subscription" button (with settings/manage icon) in both mobile and desktop views that navigates to `/subscription/manage`. This will appear for all users so they can always access payment history and cancellation.

- **Mobile view**: Add a button below "Upgrade" in the actions section
- **Desktop view**: Add a button in the actions sidebar

### 2. No changes needed to ManageSubscription.tsx
The existing `ManageSubscription` page already has the cancel button, cancel dialog, and payment history. The edge function `cancel-subscription` already handles both trial (immediate cancel) and active (cancel at period end) correctly, matching the business logic of:
- Trial users: immediate cancel, no charge
- Active users: cancel at end of billing period

## Technical Details
- One file to modify: `src/pages/Subscription.tsx`
- Add a `Button` with `variant="outline"` navigating to `/subscription/manage`
- Show in both mobile and desktop layouts
- Use `Settings` or `CreditCard` icon for visual clarity
