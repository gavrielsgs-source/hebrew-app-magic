import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Check, Loader2, Link as LinkIcon, Upload, ImageIcon, X } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface InventorySettings {
  logo_url?: string;
  cover_image_url?: string;
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

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const resolvedSlug = useMemo(() => normalizeSlug(slug || suggestedSlug), [slug, suggestedSlug]);
  const inventoryUrl = resolvedSlug ? `${baseUrl}/inventory/${resolvedSlug}` : "";

  const applyProfileState = (
    profile: {
      inventory_slug?: string | null;
      inventory_enabled?: boolean | string | number | null;
      inventory_settings?: Json | null;
      company_name?: string | null;
      full_name?: string | null;
    } | null
  ) => {
    const nextSuggestedSlug = createSuggestedSlug(user?.id, profile?.company_name, profile?.full_name);
    setSuggestedSlug(nextSuggestedSlug);

    if (!profile) {
      setSlug(nextSuggestedSlug);
      validateSlug(nextSuggestedSlug);
      setEnabled(false);
      setSettings({
        primary_color: "#3b82f6",
        show_phone: true,
        show_prices: true,
      });
      return;
    }

    const existingSlug = normalizeSlug(profile.inventory_slug || nextSuggestedSlug || "");
    setSlug(existingSlug);
    setEnabled(parseBoolean(profile.inventory_enabled, false));
    validateSlug(existingSlug);

    const dbSettings =
      profile.inventory_settings && typeof profile.inventory_settings === "object"
        ? (profile.inventory_settings as Record<string, unknown>)
        : {};

    setSettings({
      logo_url: (dbSettings.logo_url as string) || undefined,
      cover_image_url: (dbSettings.cover_image_url as string) || undefined,
      primary_color: (dbSettings.primary_color as string) || "#3b82f6",
      contact_phone: (dbSettings.contact_phone as string) || undefined,
      show_phone: parseBoolean(dbSettings.show_phone, true),
      show_prices: parseBoolean(dbSettings.show_prices, true),
    });
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("inventory_slug, inventory_enabled, inventory_settings, company_name, full_name")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      applyProfileState(data);
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

  const [autoSaving, setAutoSaving] = useState<string | null>(null);

  const autoSaveToggle = async (field: string, value: boolean) => {
    if (!user?.id) return;
    setAutoSaving(field);
    try {
      if (field === 'inventory_enabled') {
        const normalizedSlug = normalizeSlug(slug || suggestedSlug);
        const isEnabled = value && !!normalizedSlug;
        const { error } = await supabase
          .from("profiles")
          .update({ inventory_enabled: isEnabled })
          .eq("id", user.id);
        if (error) throw error;
        setEnabled(isEnabled);
        if (value && !normalizedSlug) {
          toast.error("כדי להפעיל את הקטלוג צריך להגדיר כתובת דף");
          setEnabled(false);
          return;
        }
      } else {
        // show_phone / show_prices — merge into inventory_settings JSONB
        const { data: current } = await supabase
          .from("profiles")
          .select("inventory_settings")
          .eq("id", user.id)
          .maybeSingle();

        const currentSettings = (current?.inventory_settings && typeof current.inventory_settings === "object")
          ? (current.inventory_settings as Record<string, unknown>)
          : {};

        const merged = { ...currentSettings, [field]: value };

        const { error } = await supabase
          .from("profiles")
          .update({ inventory_settings: merged as unknown as Json })
          .eq("id", user.id);
        if (error) throw error;
      }
      toast.success("נשמר");
    } catch (error: any) {
      console.error("Auto-save toggle error:", error);
      toast.error("שגיאה בשמירה");
    } finally {
      setAutoSaving(null);
    }
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    autoSaveToggle('inventory_enabled', checked);
  };

  const handleDisplaySettingChange = (key: "show_phone" | "show_prices", checked: boolean) => {
    setSettings((current) => ({ ...current, [key]: checked }));
    autoSaveToggle(key, checked);
  };

  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, toggle: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'cover',
    setUploading: (v: boolean) => void
  ) => {
    if (!user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('נא להעלות קובץ תמונה בלבד');
      return;
    }

    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`גודל הקובץ חייב להיות עד ${type === 'logo' ? '2' : '5'}MB`);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/inventory-${type}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;
        setSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'logo_url' : 'cover_image_url']: publicUrl,
        }));
        toast.success(type === 'logo' ? 'הלוגו הועלה בהצלחה' : 'תמונת הכיסוי הועלתה בהצלחה');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
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

        setSlug(normalizedSlug);
        setEnabled(isEnabled);
        setSettings(normalizedSettings);
      } else {
        setSlug(normalizeSlug(updatedProfile.inventory_slug || ""));
        setEnabled(parseBoolean(updatedProfile.inventory_enabled, false));

        const confirmedSettings =
          updatedProfile.inventory_settings && typeof updatedProfile.inventory_settings === "object"
            ? (updatedProfile.inventory_settings as Record<string, unknown>)
            : {};

        setSettings({
          logo_url: (confirmedSettings.logo_url as string) || undefined,
          cover_image_url: (confirmedSettings.cover_image_url as string) || undefined,
          primary_color: (confirmedSettings.primary_color as string) || "#3b82f6",
          contact_phone: (confirmedSettings.contact_phone as string) || undefined,
          show_phone: parseBoolean(confirmedSettings.show_phone, true),
          show_prices: parseBoolean(confirmedSettings.show_prices, true),
        });
      }

      

      toast.success("הגדרות הקטלוג נשמרו בהצלחה");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("שגיאה בשמירת ההגדרות", { description: error.message });
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
            <div className="flex items-center gap-2">
              {autoSaving === 'inventory_enabled' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Switch
                checked={enabled}
                onCheckedChange={handleEnabledChange}
                onClick={(event) => event.stopPropagation()}
                dir="ltr"
              />
            </div>
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

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 justify-end">
                לוגו לקטלוג
                <ImageIcon className="h-4 w-4 text-primary" />
              </Label>
              <p className="text-xs text-muted-foreground text-right">
                הלוגו יופיע ב-Hero ועל תמונות הרכב כ-watermark (מומלץ: רקע שקוף, PNG, עד 2MB)
              </p>
              <div className="flex items-center gap-4 justify-end flex-row-reverse">
                {settings.logo_url ? (
                  <div className="relative group">
                    <div className="w-32 h-20 rounded-xl border-2 border-primary/20 overflow-hidden bg-white flex items-center justify-center p-2">
                      <img src={settings.logo_url} alt="לוגו" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, logo_url: undefined }))}
                      className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo', setUploadingLogo);
                      if (logoInputRef.current) logoInputRef.current.value = '';
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="rounded-lg"
                  >
                    {uploadingLogo ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />מעלה...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />{settings.logo_url ? 'החלף לוגו' : 'העלה לוגו'}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 justify-end">
                תמונת כיסוי ל-Hero
                <ImageIcon className="h-4 w-4 text-primary" />
              </Label>
              <p className="text-xs text-muted-foreground text-right">
                תמונה שתוצג כרקע בראש הקטלוג (מומלץ: רוחב 1920px, JPG, עד 5MB). אם לא תועלה תמונה, יוצג גרדיאנט בצבע המותג.
              </p>
              <div className="flex items-center gap-4 justify-end flex-row-reverse">
                {settings.cover_image_url ? (
                  <div className="relative group">
                    <div className="w-40 h-20 rounded-xl border-2 border-primary/20 overflow-hidden bg-white flex items-center justify-center">
                      <img src={settings.cover_image_url} alt="כיסוי" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, cover_image_url: undefined }))}
                      className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'cover', setUploadingCover);
                      if (coverInputRef.current) coverInputRef.current.value = '';
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="rounded-lg"
                  >
                    {uploadingCover ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />מעלה...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />{settings.cover_image_url ? 'החלף תמונה' : 'העלה תמונה'}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

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
              <div className="flex items-center gap-2">
                {autoSaving === 'show_phone' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Switch
                  checked={settings.show_phone !== false}
                  onCheckedChange={(checked) => handleDisplaySettingChange("show_phone", checked)}
                  onClick={(event) => event.stopPropagation()}
                  dir="ltr"
                />
              </div>
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
              <div className="flex items-center gap-2">
                {autoSaving === 'show_prices' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Switch
                  checked={settings.show_prices !== false}
                  onCheckedChange={(checked) => handleDisplaySettingChange("show_prices", checked)}
                  onClick={(event) => event.stopPropagation()}
                  dir="ltr"
                />
              </div>
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
