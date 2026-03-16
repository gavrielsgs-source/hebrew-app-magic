

## Plan: Move Automations into Profile Page as a New Tab

### What changes

1. **Extract automation content into a reusable component** — Create `src/components/automations/AutomationSettingsTab.tsx` containing all the automation settings and queue log UI currently in `src/pages/Automations.tsx` (the cards, toggles, queue table, stats). This component will work standalone without the page wrapper/header.

2. **Add "אוטומציות" tab to Profile page** — In `src/pages/Profile.tsx`:
   - Import `AutomationSettingsTab` and `Zap` icon
   - **Desktop**: Change `grid-cols-4` to `grid-cols-5` in TabsList, add a new TabsTrigger for "אוטומציות" with the Zap icon, positioned next to "התראות"
   - Add a new `TabsContent value="automations"` rendering `AutomationSettingsTab`
   - **Mobile**: Change `grid-cols-3` to `grid-cols-4`, add the same tab trigger and content

3. **Remove standalone Automations page and route**:
   - Remove the `/automations` route from `src/App.tsx` (line 180)
   - Remove the import of `Automations` (line 55)

4. **Remove sidebar link** — In `src/components/layout/AppSidebar.tsx`, remove lines 148-157 (the אוטומציות SidebarMenuItem)

5. **Keep `src/pages/Automations.tsx`** as-is (or delete it) — the logic moves to the new component

### Files to create
- `src/components/automations/AutomationSettingsTab.tsx`

### Files to edit
- `src/pages/Profile.tsx` — add tab for both mobile and desktop
- `src/App.tsx` — remove route and import
- `src/components/layout/AppSidebar.tsx` — remove sidebar item

