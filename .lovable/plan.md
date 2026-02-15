
# Fix: Subscription Guard Blocks Active Users

## Problem
When `itscarslead@gmail.com` logs in, they get redirected to `/subscription/expired` even though their subscription is `active` in the database. The "see packages" page works because `/subscription` is in the whitelisted paths and doesn't go through the guard.

## Root Causes

1. **`isLoading` starts as `false`**: The SubscriptionGuard can run its checks before `fetchSubscription` even starts, using stale/default state.

2. **Race condition**: Between the time `fetchSubscription` starts and completes, there's a window where the guard might evaluate with incorrect `isTrialExpired` state.

3. **Guard doesn't check `subscription_status` directly**: The guard relies on `isTrialExpired` derived state, which depends on timing of multiple async state updates.

## Solution

### 1. Fix initial `isLoading` state (`subscription-context.tsx`)
Change `isLoading` initial value from `false` to `true` so the guard waits for subscription data before making any decisions.

```typescript
// Before:
const [isLoading, setIsLoading] = useState(false);

// After:
const [isLoading, setIsLoading] = useState(true);
```

### 2. Make SubscriptionGuard check `subscription_status` directly (`SubscriptionGuard.tsx`)
Add a direct check: if the subscription has `subscription_status === 'active'` or `'cancelled'`, never redirect to expired - regardless of trial dates.

```typescript
// If subscription status is 'active' or 'cancelled', allow access
if (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'cancelled') {
  return; // Paid subscription, no blocking
}

// Only then check trial expiration
if (isTrialExpired) {
  navigate('/subscription/expired', { replace: true });
  return;
}
```

### 3. Handle edge case when user is not logged in
Since `isLoading` now starts as `true`, add a guard to set it `false` when there's no user (to avoid infinite loading screen).

In `fetchSubscription`:
```typescript
if (!user) {
  setIsLoading(false);
  return;
}
```

## Technical Details

### Files to modify:
- `src/contexts/subscription-context.tsx` - Change initial `isLoading` to `true`, ensure it's set to `false` when no user
- `src/components/auth/SubscriptionGuard.tsx` - Add direct `subscription_status` check before trial expiration check

### Why this fixes it:
- `isLoading = true` initially means the guard shows "loading..." until real subscription data arrives
- Direct `subscription_status` check means even if `isTrialExpired` has a stale value, active subscriptions are never blocked
- This is a belt-and-suspenders approach that eliminates the race condition entirely
