

## Problem Analysis

There are **two separate notification systems** that don't talk to each other:

1. **`use-notifications.ts`** (used by `NotificationsPopover`) — This is what renders the bell icon and notification list. It **never fetches from the database**. It only shows hardcoded sample data (lines 151-170) and task reminders detected client-side.

2. **`use-notification-data.ts`** / **`use-push-notifications.ts`** (used by `NotificationSettings`) — This is where `sendTestNotification` lives. It inserts a record into the `notifications` DB table and fires a browser `Notification`, but **does not update the popover's state**.

So when you click "send test notification":
- A row is inserted into the `notifications` table
- A browser push notification fires (if permission granted)
- But the popover (`NotificationsPopover`) never knows about it because `use-notifications.ts` doesn't read from the DB

## Plan

**Refactor `use-notifications.ts` to fetch real notifications from the database** instead of showing hardcoded samples.

### Changes in `src/hooks/use-notifications.ts`:

1. Replace the `fetchNotifications` function (lines 146-176) to query `supabase.from("notifications")` instead of returning hardcoded sample data.
2. Map DB rows (`id`, `title`, `message`, `type`, `read_at`, `created_at`, `entity_type`, `entity_id`) to the hook's `Notification` type (using `read: !!row.read_at`).
3. Update `markAsRead` to also persist to DB via `supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId)`.
4. Update `markAllAsRead` to persist all unread to DB.
5. Set up a Supabase realtime subscription on the `notifications` table filtered by `user_id`, so new inserts (from test notification or scheduled reminders) automatically appear in the popover without refresh.
6. Keep the task-reminder polling logic as-is (it already inserts into the DB, so it will show up via the subscription).

This is a single-file change that connects the existing popover UI to the existing database table.

