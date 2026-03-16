import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Check, Loader2, Link as LinkIcon } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface InventorySettings {
  logo_url?: string;
  primary_color?: string;
  contact_phone?: string;
  show_phone?: boolean;
  show_prices?: boolean;
}

const parseBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return fallback;
};

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const createSuggestedSlug = (userId: string | undefined, ...values: Array<string | null | undefined>) => {
  for (const value of values) {
    const normalized = normalizeSlug(
      (value || "")
        .normalize("NFKD")
        .replace(/[^\x00-\x7F]/g, "")
    );

    if (normalized.length >= 3) {
      return normalized;
    }
  }

  // Fallback: use first 8 chars of user UUID for Hebrew-only names
  if (userId && userId.length >= 8) {
    return `dealer-${userId.substring(0, 8)}`;
  }

  return "";
};

export function InventorySettingsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestedSlug, setSuggestedSlug] = useState("");

  const [slug, setSlug] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState<InventorySettings>({
    primary_color: "#3b82f6",
    show_phone: true,
    show_prices: true,
  });
  const [slugError, setSlugError] = useState("");

  // Track recent saves to prevent remount from overwriting state (survives remount via sessionStorage)
  const getLastSaveTimestamp = () => {
    try { return Number(sessionStorage.getItem('inventory_save_ts') || '0'); } catch { return 0; }
  };
  const setLastSaveTimestamp = () => {
    try { sessionStorage.setItem('inventory_save_ts', String(Date.now())); } catch {}
  };

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const resolvedSlug = useMemo(() => normalizeSlug(slug || suggestedSlug), [slug, suggestedSlug]);
  const inventoryUrl = resolvedSlug ? `${baseUrl}/inventory/${resolvedSlug}` : "";

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    // Skip fetch if we saved very recently (prevents remount race condition)
    const timeSinceLastSave = Date.now() - lastSaveTimestamp.current;
    if (timeSinceLastSave < 3000) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("inventory_slug, inventory_enabled, inventory_settings, company_name, full_name")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;

      const nextSuggestedSlug = createSuggestedSlug(user?.id, data?.company_name, data?.full_name);
      setSuggestedSlug(nextSuggestedSlug);

      if (data) {
        const existingSlug = normalizeSlug(data.inventory_slug || nextSuggestedSlug || "");
        setSlug(existingSlug);
        setEnabled(parseBoolean(data.inventory_enabled, false));
        validateSlug(existingSlug);

        const dbSettings =
          data.inventory_settings && typeof data.inventory_settings === "object"
            ? (data.inventory_settings as Record<string, unknown>)
            : {};

        setSettings({
          logo_url: (dbSettings.logo_url as string) || undefined,
          primary_color: (dbSettings.primary_color as string) || "#3b82f6",
          contact_phone: (dbSettings.contact_phone as string) || undefined,
          show_phone: parseBoolean(dbSettings.show_phone, true),
          show_prices: parseBoolean(dbSettings.show_prices, true),
        });
      } else {
        setSlug(nextSuggestedSlug);
        validateSlug(nextSuggestedSlug);
      }
    } catch (error) {
      console.error("Error fetching inventory settings:", error);
      toast.error("שגיאה בטעינת הגדרות הקטלוג החיצוני");
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = (value: string) => {
    const normalizedValue = normalizeSlug(value);
    const slugRegex = /^[a-z0-9-]+$/;

    if (!normalizedValue) {
      setSlugError("");
      return true;
    }

    if (!slugRegex.test(normalizedValue)) {
      setSlugError("השם יכול להכיל רק אותיות באנגלית קטנות, מספרים ומקפים");
      return false;
    }

    if (normalizedValue.length < 3) {
      setSlugError("השם חייב להכיל לפחות 3 תווים");
      return false;
    }

    setSlugError("");
    return true;
  };

  const handleSlugChange = (value: string) => {
    const formatted = normalizeSlug(value);
    setSlug(formatted);
    validateSlug(formatted);
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
  };

  const handleDisplaySettingChange = (key: "show_phone" | "show_prices", checked: boolean) => {
    setSettings((current) => ({ ...current, [key]: checked }));
  };

  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, toggle: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  const saveSettings = async () => {
    if (!user?.id) {
      toast.error("לא ניתן לשמור כרגע", { description: "המשתמש אינו מחובר." });
      return;
    }

    const normalizedSlug = normalizeSlug(slug || suggestedSlug);

    if (enabled && !normalizedSlug) {
      setSlugError("כדי להפעיל את הקטלוג צריך להגדיר כתובת דף באנגלית");
      return;
    }

    if (!validateSlug(normalizedSlug)) return;

    setSaving(true);
    try {
      if (normalizedSlug) {
        const { data: existing, error: existingError } = await supabase
          .from("profiles")
          .select("id")
          .eq("inventory_slug", normalizedSlug)
          .neq("id", user.id)
          .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
          setSlugError("כתובת זו כבר תפוסה, נסה כתובת אחרת");
          return;
        }
      }

      const normalizedSettings: InventorySettings = {
        ...settings,
        show_phone: parseBoolean(settings.show_phone, true),
        show_prices: parseBoolean(settings.show_prices, true),
      };

      const isEnabled = parseBoolean(enabled, false) && !!normalizedSlug;
      const profilePayload = {
        inventory_slug: normalizedSlug || null,
        inventory_enabled: isEnabled,
        inventory_settings: normalizedSettings as unknown as Json,
      };

      // Read back confirmed values from DB response
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", user.id)
        .select("inventory_slug, inventory_enabled, inventory_settings")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            ...profilePayload,
          });

        if (insertError) throw insertError;

        // For insert, trust local values
        setSlug(normalizedSlug);
        setEnabled(isEnabled);
        setSettings(normalizedSettings);
      } else {
        // Use confirmed DB values to set state
        setSlug(normalizeSlug(updatedProfile.inventory_slug || ""));
        setEnabled(parseBoolean(updatedProfile.inventory_enabled, false));

        const confirmedSettings =
          updatedProfile.inventory_settings && typeof updatedProfile.inventory_settings === "object"
            ? (updatedProfile.inventory_settings as Record<string, unknown>)
            : {};

        setSettings({
          logo_url: (confirmedSettings.logo_url as string) || undefined,
          primary_color: (confirmedSettings.primary_color as string) || "#3b82f6",
          contact_phone: (confirmedSettings.contact_phone as string) || undefined,
          show_phone: parseBoolean(confirmedSettings.show_phone, true),
          show_prices: parseBoolean(confirmedSettings.show_prices, true),
        });
      }

      // Mark save timestamp to prevent remount fetch from overwriting
      lastSaveTimestamp.current = Date.now();

      toast.success("הגדרות הקטלוג נשמרו בהצלחה");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("שגיאה בשמירת ההגדרות", { description: error.message });
      // Only re-fetch on error to rollback state
      await fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inventoryUrl) return;
    try {
      await navigator.clipboard.writeText(inventoryUrl);
      setCopied(true);
      toast.success("הקישור הועתק!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("שגיאה בהעתקת הקישור");
    }
  };

  const openInventory = () => {
    if (inventoryUrl && enabled) {
      window.open(inventoryUrl, "_blank", "noopener,noreferrer");
      return;
    }

    toast.error("הקטלוג עדיין לא פעיל", {
      description: "שמור את ההגדרות עם כתובת דף והפעלה כדי לפתוח את הקטלוג.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-end">
            דף מלאי פומבי
            <LinkIcon className="h-5 w-5" />
          </CardTitle>
          <CardDescription>
            צור דף ציבורי שמציג את כל הרכבים הזמינים במלאי שלך ושתף אותו ישירות עם לקוחות.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/50 p-4"
            dir="rtl"
            role="button"
            tabIndex={0}
            onClick={() => setEnabled((current) => !current)}
            onKeyDown={(event) => handleToggleKeyDown(event, () => setEnabled((current) => !current))}
          >
            <div>
              <Label className="font-medium">הפעל דף מלאי</Label>
              <p className="text-sm text-muted-foreground">
                כאשר מופעל, הדף יהיה נגיש לכל אחד עם הקישור.
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleEnabledChange}
              onClick={(event) => event.stopPropagation()}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">כתובת הדף</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {baseUrl}/inventory/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="pr-[200px]"
                  placeholder={suggestedSlug || "my-dealership"}
                  dir="ltr"
                />
              </div>
            </div>
            {slugError && <p className="text-sm text-destructive">{slugError}</p>}
            <p className="text-xs text-muted-foreground">
              בחר שם ייחודי לדף שלך (אותיות באנגלית, מספרים ומקפים בלבד).
            </p>
          </div>

          {resolvedSlug && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3" dir="rtl">
                <div>
                  <Label className="font-medium text-foreground">
                    {enabled ? "הקטלוג החיצוני פעיל" : "הקטלוג מוכן — נשאר רק להפעיל"}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {enabled
                      ? "אפשר לפתוח, להעתיק ולשתף את הקישור ישירות."
                      : "הקישור כבר מוכן. שמור עם ההפעלה כדי לפרסם אותו ללקוחות."}
                  </p>
                </div>
                <Button variant="outline" onClick={openInventory} disabled={!enabled || !inventoryUrl}>
                  <ExternalLink className="ml-2 h-4 w-4" />
                  פתח קטלוג חיצוני
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Input value={inventoryUrl} readOnly className="flex-1 bg-background" dir="ltr" />
                <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!inventoryUrl}>
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">הגדרות תצוגה</h3>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">צבע ראשי</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primary_color || "#3b82f6"}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={settings.primary_color || "#3b82f6"}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">טלפון ליצירת קשר</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={settings.contact_phone || ""}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="050-1234567"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                מספר הטלפון שיופיע בכפתור "צור קשר". אם לא הוגדר, יילקח מהפרופיל.
              </p>
            </div>

            <div
              className="flex cursor-pointer items-center justify-between"
              dir="rtl"
              role="button"
              tabIndex={0}
              onClick={() => handleDisplaySettingChange("show_phone", settings.show_phone === false)}
              onKeyDown={(event) => handleToggleKeyDown(event, () => handleDisplaySettingChange("show_phone", settings.show_phone === false))}
            >
              <div>
                <Label>הצג טלפון בדף</Label>
                <p className="text-sm text-muted-foreground">האם להציג כפתור יצירת קשר בדף.</p>
              </div>
              <Switch
                checked={settings.show_phone !== false}
                onCheckedChange={(checked) => handleDisplaySettingChange("show_phone", checked)}
                onClick={(event) => event.stopPropagation()}
                dir="ltr"
              />
            </div>

            <div
              className="flex cursor-pointer items-center justify-between"
              dir="rtl"
              role="button"
              tabIndex={0}
              onClick={() => handleDisplaySettingChange("show_prices", settings.show_prices === false)}
              onKeyDown={(event) => handleToggleKeyDown(event, () => handleDisplaySettingChange("show_prices", settings.show_prices === false))}
            >
              <div>
                <Label>הצג מחירים בדף</Label>
                <p className="text-sm text-muted-foreground">האם להציג מחירי רכבים בקטלוג החיצוני.</p>
              </div>
              <Switch
                checked={settings.show_prices !== false}
                onCheckedChange={(checked) => handleDisplaySettingChange("show_prices", checked)}
                onClick={(event) => event.stopPropagation()}
                dir="ltr"
              />
            </div>
          </div>

          <Button onClick={saveSettings} disabled={saving || !!slugError} className="w-full">
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            שמור הגדרות
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
