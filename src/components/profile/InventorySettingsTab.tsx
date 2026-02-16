import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Check, Loader2, QrCode, Link as LinkIcon } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface InventorySettings {
  logo_url?: string;
  primary_color?: string;
  contact_phone?: string;
  show_phone?: boolean;
}

export function InventorySettingsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [slug, setSlug] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState<InventorySettings>({
    primary_color: "#3b82f6",
    show_phone: true,
  });
  const [slugError, setSlugError] = useState("");

  const baseUrl = "https://carsleadapp.com";
  const inventoryUrl = slug ? `${baseUrl}/inventory/${slug}` : "";

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("inventory_slug, inventory_enabled, inventory_settings")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setSlug(data.inventory_slug || "");
        setEnabled(data.inventory_enabled || false);
        if (data.inventory_settings && typeof data.inventory_settings === 'object') {
          setSettings(data.inventory_settings as InventorySettings);
        }
      }
    } catch (error) {
      console.error("Error fetching inventory settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = (value: string) => {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!value) {
      setSlugError("");
      return true;
    }
    if (!slugRegex.test(value)) {
      setSlugError("השם יכול להכיל רק אותיות באנגלית קטנות, מספרים ומקפים");
      return false;
    }
    if (value.length < 3) {
      setSlugError("השם חייב להכיל לפחות 3 תווים");
      return false;
    }
    setSlugError("");
    return true;
  };

  const handleSlugChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSlug(formatted);
    validateSlug(formatted);
  };

  const saveSettings = async () => {
    if (!validateSlug(slug)) return;
    
    setSaving(true);
    try {
      // Check if slug is unique
      if (slug) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("inventory_slug", slug)
          .neq("id", user?.id)
          .single();

        if (existing) {
          setSlugError("כתובת זו כבר תפוסה, נסה כתובת אחרת");
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          inventory_slug: slug || null,
          inventory_enabled: enabled,
          inventory_settings: settings as unknown as Json,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("ההגדרות נשמרו בהצלחה");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("שגיאה בשמירת ההגדרות", { description: error.message });
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
    if (inventoryUrl) {
      window.open(inventoryUrl, "_blank");
    }
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
            צור דף ציבורי שמציג את כל הרכבים הזמינים במלאי שלך. 
            שתף את הקישור עם לקוחות פוטנציאליים.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" dir="rtl">
            <div>
              <Label className="font-medium">הפעל דף מלאי</Label>
              <p className="text-sm text-muted-foreground">
                כאשר מופעל, הדף יהיה נגיש לכל אחד עם הקישור
              </p>
            </div>
            <div dir="ltr">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>

          {/* Slug Input */}
          <div className="space-y-2">
            <Label htmlFor="slug">כתובת הדף</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {baseUrl}/inventory/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="pr-[200px]"
                  placeholder="my-dealership"
                  dir="ltr"
                />
              </div>
            </div>
            {slugError && <p className="text-sm text-destructive">{slugError}</p>}
            <p className="text-xs text-muted-foreground">
              בחר שם ייחודי לדף שלך (אותיות באנגלית, מספרים ומקפים בלבד)
            </p>
          </div>

          {/* URL Preview and Actions */}
          {slug && enabled && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <Label className="text-green-700 dark:text-green-300 font-medium">הדף שלך פעיל!</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  value={inventoryUrl} 
                  readOnly 
                  className="flex-1 bg-white dark:bg-gray-900" 
                  dir="ltr"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={openInventory}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">הגדרות תצוגה</h3>
            
            <div className="space-y-2">
              <Label htmlFor="primaryColor">צבע ראשי</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primary_color || "#3b82f6"}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-16 h-10 p-1"
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
                מספר הטלפון שיופיע בכפתור "צור קשר" (אם ריק, ישתמש בטלפון מהפרופיל)
              </p>
            </div>

            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <Label>הצג טלפון בדף</Label>
                <p className="text-sm text-muted-foreground">
                  האם להציג את כפתור יצירת הקשר בדף
                </p>
              </div>
              <div dir="ltr">
                <Switch 
                  checked={settings.show_phone !== false} 
                  onCheckedChange={(checked) => setSettings({ ...settings, show_phone: checked })}
                />
              </div>
            </div>
          </div>

          <Button onClick={saveSettings} disabled={saving || !!slugError} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
            שמור הגדרות
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {slug && enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-end">
              קוד QR
              <QrCode className="h-5 w-5" />
            </CardTitle>
            <CardDescription>
              הדפס או שתף את קוד ה-QR כדי שלקוחות יוכלו לגשת לדף המלאי בקלות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inventoryUrl)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(inventoryUrl)}`;
                  link.download = `qr-${slug}.png`;
                  link.click();
                }}
              >
                הורד קוד QR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
