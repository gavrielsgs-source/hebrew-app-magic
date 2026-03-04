

## Analysis Results

### Question 1: Images for All Approved Templates
Adding an image header to a WhatsApp template **requires Facebook approval**. Each template is registered with a specific header type (TEXT, IMAGE, or NONE). To add images to templates that were approved without an image header, you must:
1. Create a **new version** of each template in the Facebook Business Manager with header type = IMAGE
2. Submit for re-approval (takes 24-48 hours)
3. Only after approval, update `supports_image_header = true` in the database

Currently only `car_template` has `supports_image_header = true`. The code already handles this correctly at line 370: `imageUrl: selectedTemplate.supportsImageHeader ? carImageUrl : undefined`. So once you approve templates with image headers on Facebook's side and flip the DB flag, it will work automatically — no code changes needed.

### Question 2: Duplicate Templates in Dropdown — Root Cause Found
The database has 13 users, each with their own copy of the 12 default templates (156 total rows with `is_default = true`). The RLS SELECT policy says:
```sql
user_id = auth.uid() OR is_default = true
```

Because `is_default = true` bypasses the user_id filter, **every user sees all 13 copies** of each default template — not just their own. This is why each approved template appears ~13 times in the dropdown.

### Fix Plan — Deduplicate in Frontend (Safe, No RLS/API Change)

**File:** `src/hooks/whatsapp-templates/use-whatsapp-templates.ts`

Add deduplication logic after fetching: for templates with `is_default = true`, keep only one per `facebook_template_name` (preferring the one owned by the current user). This ensures the dropdown shows each approved template exactly once without touching RLS policies or the API.

**Changes:**
1. After the query returns, group default templates by `facebook_template_name`
2. For each group, keep only the user's own copy (matching `user_id`) or the first one if none match
3. Non-default (custom) templates pass through unchanged

This is a ~10 line change in one file. No database, RLS, or API changes needed.

