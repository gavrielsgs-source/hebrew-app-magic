
# Fix: Login After Registration + Password Reset Link Expiring

## Root Cause Analysis

### Problem 1: Password Reset Link "Expires Immediately"
The `use-auth.tsx` hook has an `onAuthStateChange` listener that checks if the URL contains `#access_token` or `?code=`. When a user clicks the password reset link, Supabase redirects to `/reset-password#access_token=...`. The hook sees this, thinks it's an OAuth redirect, and immediately navigates to `/dashboard` -- destroying the reset token before the ResetPassword page can use it.

Additionally, the `ResetPassword.tsx` page checks `getSession()` on mount. Since the token exchange might not have completed yet (it's async and race-condition-prone), it finds no session and redirects the user to `/forgot-password` with a "link expired" message.

### Problem 2: Can't Login After Registration
The auth logs show `user_confirmation_requested` and a `confirmation` email being sent. This means email confirmation is enabled on the production Supabase project. After registration, the code navigates directly to `/dashboard`, but the user can't actually sign in because their email isn't confirmed yet. When they try to login, they get "Invalid login credentials" (Supabase returns this generic error for unconfirmed emails too).

## Solution

### 1. Fix `use-auth.tsx` - Handle PASSWORD_RECOVERY event properly
- Add handling for the `PASSWORD_RECOVERY` event in `onAuthStateChange`
- When event is `PASSWORD_RECOVERY`, redirect to `/reset-password` instead of treating it as OAuth
- Skip the OAuth redirect logic when on `/reset-password` path to prevent the token from being consumed incorrectly

### 2. Fix `ResetPassword.tsx` - Wait for auth event instead of checking session immediately
- Remove the immediate `getSession()` check that races with token exchange
- Instead, listen for `PASSWORD_RECOVERY` event from `onAuthStateChange` to confirm the user has a valid recovery session
- Add a loading state while waiting for the auth event
- Only show "link expired" if a timeout passes without receiving the recovery event

### 3. Fix `RegisterForm.tsx` - Show email confirmation message
- After successful signup, check if the response indicates email confirmation is needed
- If confirmation is required, show a message telling the user to check their email instead of navigating to the dashboard
- Display clear instructions: "Check your email to confirm your account before logging in"

## Technical Changes

### File: `src/hooks/use-auth.tsx`
- In `onAuthStateChange`, add a check for `PASSWORD_RECOVERY` event
- When `PASSWORD_RECOVERY` fires, navigate to `/reset-password` if not already there
- Exclude `/reset-password` from the OAuth redirect logic so the token isn't consumed

### File: `src/pages/ResetPassword.tsx`
- Replace `getSession()` check with a state that tracks whether a valid recovery session exists
- Listen for the `PASSWORD_RECOVERY` event via `onAuthStateChange`
- Add a brief timeout (e.g., 5 seconds) before showing the "expired" message
- Show a loading spinner while waiting for the recovery session

### File: `src/components/auth/RegisterForm.tsx`
- After `signUp`, check if `data.user?.identities?.length === 0` or if `data.user?.email_confirmed_at` is null
- If email is unconfirmed, show a success message asking the user to check their email
- Do not navigate to dashboard if email confirmation is pending

## Order of Changes
1. Fix `use-auth.tsx` (most critical - stops the redirect that kills the reset token)
2. Fix `ResetPassword.tsx` (proper recovery session handling)
3. Fix `RegisterForm.tsx` (better UX for email confirmation)
