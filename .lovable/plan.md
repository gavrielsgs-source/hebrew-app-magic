

## Analysis Results

I investigated both issues thoroughly - the inventory settings persistence and the leads visibility concern.

### Issue 1: Inventory Settings Don't Persist (CONFIRMED BUG)

**Evidence from DB**: Your customer (nirmotors) has `inventory_enabled: false` in the database right now, even though they tried to enable it and save.

**Root Cause**: The `saveSettings` function in `InventorySettingsTab.tsx` has a critical race condition:

1. User toggles "Enable" ON and clicks Save
2. `saveSettings` runs the DB update correctly
3. Lines 235-237 set local state correctly: `setSlug(...)`, `setEnabled(isEnabled)`, `setSettings(...)`
4. **Line 238 immediately calls `await fetchSettings()`** which re-reads from DB
5. `fetchSettings` overwrites the local state with whatever it reads from DB
6. If the DB hasn't fully propagated, or if the update silently failed (e.g. RLS issue), the state reverts to `false`

Additionally, when the user switches tabs in the Profile page, the `InventorySettingsTab` component **unmounts and remounts**, triggering a fresh `fetchSettings()`. If the previous save didn't persist correctly, everything resets.

**Another sub-issue**: The `normalizeSlug` function strips all non-ASCII characters. For Hebrew-only names (like "ניר מוטורס"), `createSuggestedSlug` returns empty string because after stripping Hebrew, nothing remains with 3+ characters. The customer manually typed "nirmotors" so this worked for them, but the slug must already be saved in DB for the flow to work on remount.

### Issue 2: Leads Syncing Across Users (NOT A BUG)

**Evidence from DB**: Leads RLS policy is `user_id = auth.uid()` for all operations. Each user's leads are isolated:
- User `7c70fd91...` (you/admin): 42 leads
- User `aeb31ddd...`: 2 leads  
- User `5d7ad9a7...`: 2 leads
- Other users: 1 lead each

The leads data is properly isolated. What you were seeing was likely the **admin view** - since you're an admin, some tables (like `cars`) have admin-override RLS policies. However, **leads do NOT have admin override** - so even as admin you should only see your own leads. If you saw other users' leads, it would be a different issue worth investigating separately.

---

## Fix Plan

### Fix 1: Remove the race condition in `saveSettings` (InventorySettingsTab.tsx)

- After a successful DB update, **do NOT call `fetchSettings()`** in the success path
- Instead, trust the local state that was already set on lines 235-237
- Only call `fetchSettings()` in the **error/catch** path as a rollback mechanism
- This prevents the remount-triggered fetch from overwriting unsaved state

### Fix 2: Read back confirmed values from DB update response

- Change the `.update()` call to `.select('inventory_slug, inventory_enabled, inventory_settings')` (it already selects `id`)
- Use the returned data to set local state, confirming what was actually persisted
- This eliminates any ambiguity about what the DB actually stored

### Fix 3: Generate fallback slug for Hebrew-only names

- If `createSuggestedSlug` returns empty (all Hebrew name), generate a fallback using the first 8 characters of the user's UUID
- This ensures every user gets a suggested slug even without English characters

### Fix 4: Prevent double-toggle on tab switch remount

- Add a `useRef` to track whether settings were saved in this session
- On remount, if the ref indicates a recent save, skip the fetch and use cached values
- Alternatively, use React Query with a stable cache key so the data persists across tab switches

### Files to Edit
- `src/components/profile/InventorySettingsTab.tsx` — all 4 fixes above

### Edge Function (get-public-inventory)
- No changes needed. The edge function correctly checks `inventory_enabled = true`. Once the settings persist correctly, the catalog will work.

### Leads
- No code changes needed. RLS is correctly configured. If you want, I can add an admin-override policy for leads so you can see all leads as admin (like you can with cars).

