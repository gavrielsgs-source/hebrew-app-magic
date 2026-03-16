

## Bug: Automation Settings Race Condition

### Problem
When the user opens the Automations page and toggles a switch, the React Query fetch completes *after* the interaction, triggering the `useEffect` which:
1. Overwrites the form state with DB values (all toggles OFF)
2. Sets `dirty = false`, disabling the save button

The DB already has a row with all toggles OFF (saved previously with defaults).

### Fix (in `src/pages/Automations.tsx`)

**Add a `useRef` to track user interaction**, and skip the `useEffect` if the user has already made changes:

```tsx
const userHasEdited = useRef(false);

useEffect(() => {
  if (settings && !userHasEdited.current) {
    setForm(settings);
    setDirty(false);
  }
}, [settings]);

function update(key, value) {
  userHasEdited.current = true;  // mark that user touched the form
  setForm((f) => ({ ...f, [key]: value }));
  setDirty(true);
}

function save() {
  upsert.mutate(form, {
    onSuccess: () => {
      userHasEdited.current = false;  // reset after successful save
      setDirty(false);
    }
  });
}
```

This ensures:
- Initial load populates form from DB correctly
- User edits are never overwritten by async query resolution
- After save, the ref resets so future data can load normally

### File to edit
- `src/pages/Automations.tsx` — lines 55-72

