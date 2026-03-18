

## Analysis

Line 155-157 in `use-notifications.ts` already calls `Notification.requestPermission()` automatically, but it fires silently without any UI context — just a raw browser prompt that users may dismiss or miss.

The user wants: when a user first logs in / registers, show the browser's native "Allow notifications?" prompt so they can opt in. This is standard behavior on many sites.

## Plan

**Create a one-time notification permission prompt component** that shows after login, only once per user.

### 1. Create `NotificationPromptOnLogin` component
- A small component mounted in the app layout (e.g., `AppSidebar` or the main layout wrapper)
- On mount, checks:
  - User is authenticated
  - `Notification` API is supported
  - `Notification.permission === 'default'` (not yet asked)
  - `localStorage` key `notification_prompt_shown` is not set
- If all conditions met, wait ~3 seconds (let the page settle), then call `Notification.requestPermission()`
- After calling (regardless of result), set `localStorage.notification_prompt_shown = 'true'` so it only fires once
- No custom UI needed — the browser's native permission dialog is the prompt itself

### 2. Mount the component
- Add `<NotificationPromptOnLogin />` inside the authenticated app layout (likely in `AppSidebar` or a layout component that wraps authenticated pages)

### 3. Remove duplicate prompt
- Remove lines 155-157 in `use-notifications.ts` (`if (Notification.permission === "default") { Notification.requestPermission(); }`) since the new component handles this more cleanly

This is a minimal 2-file change: one new small component + mounting it in the layout.

