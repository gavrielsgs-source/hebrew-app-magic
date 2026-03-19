

## Analysis

I investigated the full flow of adding team users from the Team Management page. There are **two potential issues** causing the failure:

### Issue 1: Resend Email Limitation (Most Likely)
The `send-invitation` edge function sends emails via Resend using the test domain (`onboarding@resend.dev`). In Resend's free/test mode, you can only send emails to the account owner's verified email address. Sending to any other email will fail with a 403 error. The `RESEND_FORCE_TEST_TO` secret exists as a workaround but may not be set, or may not match the target email.

When the email fails, the edge function cleans up the invitation record and returns an error, so the user sees "שגיאה בשליחת ההזמנה".

### Issue 2: Subscription User Limit
The `premium` trial tier has `userLimit: 2` and `max_users: 2` in the database. The owner counts as 1, so only 1 additional user can be invited. This is not a bug per se, but might block adding more than 1 team member.

## Plan

### Step 1: Fix the send-invitation edge function to not fail on email errors
- Modify `send-invitation/index.ts` so that if the email fails to send, it **keeps the invitation record** instead of deleting it, and returns a success response with a warning that the email failed
- This way the invitation is created and the user can share the invite link manually
- Add better error logging for debugging

### Step 2: Add a custom "From" email if RESEND_FROM_EMAIL is set
- The `RESEND_FROM_EMAIL` secret already exists in the project
- Update the edge function to use it instead of always using `onboarding@resend.dev`

### Step 3: Show the invitation link in the UI as fallback
- In `AddTeamUserDialog` / `useTeamManagement`, when the invitation is created successfully but the email might have failed, show the invite link to the user so they can share it manually (via WhatsApp, copy link, etc.)

### Step 4: Ensure trial users have adequate user limit
- Keep `userLimit: 2` for premium trial (this is a business decision), but ensure the UI clearly shows the limit and doesn't show a generic error

This is a 2-3 file change: edge function fix + team management hook update + optional UI update.

