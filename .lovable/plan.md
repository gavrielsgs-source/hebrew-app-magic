

# Fix Build Errors: pushManager TypeScript Issues

## Overview
Fix two pre-existing TypeScript build errors in push notification hooks. The `pushManager` property is not recognized on the default `ServiceWorkerRegistration` type in TypeScript. This requires adding a type assertion.

## Changes

### 1. `src/hooks/use-notification-permission.ts` (line 81)
Change:
```typescript
const subscription = await registration.pushManager.subscribe({
```
To:
```typescript
const subscription = await (registration as any).pushManager.subscribe({
```

### 2. `src/hooks/use-push-notifications.ts` (line 115)
Change:
```typescript
const subscription = await registration.pushManager.subscribe({
```
To:
```typescript
const subscription = await (registration as any).pushManager.subscribe({
```

## Tranzila Integration Status
The Tranzila payment integration has been tested and is working:
- Webhook processes payloads correctly (tested with simulated data)
- Handshake function is deployed and properly authenticates users
- iFrame component has all required Tranzila parameters configured

To fully test the payment flow end-to-end, you would need to:
1. Log in to the app
2. Navigate to /upgrade-subscription
3. Select a plan, fill in payment details
4. The handshake will generate a thtk token
5. The Tranzila iFrame will load for card entry
6. After payment, Tranzila sends a webhook to update the subscription

