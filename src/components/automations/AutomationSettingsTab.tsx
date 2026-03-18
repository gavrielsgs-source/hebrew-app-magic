import { useEffect, useRef, useState } from "react";
import { useAutomationSettings, useUpsertAutomationSettings, useAutomationQueue, AutomationSettings } from "@/hooks/useAutomations";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, MessageSquare, Clock, Car } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "ממתין", variant: "secondary" },
  sent: { label: "נשלח", variant: "default" },
  failed: { label: "נכשל", variant: "destructive" },
  cancelled: { label: "בוטל", variant: "outline" },
};

const TYPE_LABELS: Record<string, string> = {
  welcome: "הודעת ברוכים הבאים",
  followup_1: "מעקב ראשון",
  followup_2: "מעקב שני",
  car_match: "התאמת רכב",
};

const TOGGLE_KEYS = ["welcome_enabled", "followup1_enabled", "followup2_enabled", "car_match_enabled"] as const;
type ToggleKey = typeof TOGGLE_KEYS[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEFAULT_SETTINGS: Partial<AutomationSettings> = {
  welcome_enabled: false,
  welcome_delay_minutes: 5,
  welcome_template: "welcome_message",
  followup1_enabled: false,
  followup1_delay_hours: 24,
  followup1_template: "lead_followup",
  followup2_enabled: false,
  followup2_delay_hours: 72,
  followup2_template: "lead_followup",
  car_match_enabled: false,
  car_match_template: "car_match_alert",
};

export function AutomationSettingsTab() {
  const { data: settings, isLoading } = useAutomationSettings();
  const { data: queue } = useAutomationQueue();
  const upsert = useUpsertAutomationSettings();
  const userDirty = useRef(false);
  const [form, setForm] = useState<Partial<AutomationSettings>>(() => {
    try {
      const cached = localStorage.getItem("automation_settings_form");
      return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Keep a ref that always points to the latest form so closures never go stale
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const persistForm = (nextForm: Partial<AutomationSettings>) => {
    formRef.current = nextForm;
    setForm(nextForm);
    localStorage.setItem("automation_settings_form", JSON.stringify(nextForm));
  };

  // Only sync from DB on initial load (when user hasn't touched anything)
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (settings && !initialSyncDone.current && !userDirty.current) {
      initialSyncDone.current = true;
      persistForm(settings);
    }
  }, [settings]);

  function update(key: keyof AutomationSettings, value: string | number | boolean) {
    userDirty.current = true;
    const nextForm = { ...formRef.current, [key]: value };
    persistForm(nextForm);
  }

  function handleToggleChange(key: ToggleKey, checked: boolean) {
    userDirty.current = true;
    // Always read from ref to avoid stale closures
    const nextForm = { ...formRef.current, [key]: checked };
    persistForm(nextForm);

    console.log("🔧 [automation] Toggle", key, "→", checked, "| form snapshot:", {
      welcome_enabled: nextForm.welcome_enabled,
      followup1_enabled: nextForm.followup1_enabled,
      followup2_enabled: nextForm.followup2_enabled,
      car_match_enabled: nextForm.car_match_enabled,
    });

    upsert.mutate(
      { id: formRef.current.id, [key]: checked },
      {
        onSuccess: (savedData) => {
          // Merge server metadata into current form without overwriting user's local toggle state
          persistForm({
            ...formRef.current,
            id: savedData.id,
            user_id: savedData.user_id,
            created_at: savedData.created_at,
            updated_at: savedData.updated_at,
          });
        },
      }
    );
  }

  function save() {
    // Always read from ref to get latest state
    const current = formRef.current;
    console.log("🔧 [automation] Save button clicked, current form:", {
      welcome_enabled: current.welcome_enabled,
      followup1_enabled: current.followup1_enabled,
      followup2_enabled: current.followup2_enabled,
      car_match_enabled: current.car_match_enabled,
    });

    upsert.mutate({
      id: current.id,
      welcome_enabled: !!current.welcome_enabled,
      welcome_delay_minutes: current.welcome_delay_minutes ?? 5,
      welcome_template: current.welcome_template ?? "welcome_message",
      followup1_enabled: !!current.followup1_enabled,
      followup1_delay_hours: current.followup1_delay_hours ?? 24,
      followup1_template: current.followup1_template ?? "lead_followup",
      followup2_enabled: !!current.followup2_enabled,
      followup2_delay_hours: current.followup2_delay_hours ?? 72,
      followup2_template: current.followup2_template ?? "lead_followup",
      car_match_enabled: !!current.car_match_enabled,
      car_match_template: current.car_match_template ?? "car_match_alert",
    }, {
      onSuccess: (savedData) => {
        userDirty.current = false;
        persistForm(savedData);
      },
    });
  }

  const pendingCount = queue?.filter((q) => q.status === "pending").length ?? 0;
  const sentCount = queue?.filter((q) => q.status === "sent").length ?? 0;
  const failedCount = queue?.filter((q) => q.status === "failed").length ?? 0;

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center gap-3">
        <Zap className="h-6 w-6 text-yellow-400" />
        <div>
          <h2 className="text-xl font-bold">אוטומציות WhatsApp</h2>
          <p className="text-sm text-muted-foreground">הגדר הודעות אוטומטיות ללידים וללקוחות</p>
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">הגדרות</TabsTrigger>
          <TabsTrigger value="log">
            יומן שליחות
            {pendingCount > 0 && (
              <Badge variant="secondary" className="mr-2 text-xs">{pendingCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">טוען...</p>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      הודעת ברוכים הבאים
                    </CardTitle>
                    <Switch
                      checked={!!form.welcome_enabled}
                      onCheckedChange={(checked) => handleToggleChange("welcome_enabled", checked)}
                    />
                  </div>
                  <CardDescription>נשלחת אוטומטית כשנכנס ליד חדש (ללא לחיצה ידנית)</CardDescription>
                </CardHeader>
                {form.welcome_enabled && (
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> עיכוב (דקות)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.welcome_delay_minutes ?? 5}
                        onChange={(e) => update("welcome_delay_minutes", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>שם תבנית</Label>
                      <Input
                        value={form.welcome_template ?? "welcome_message"}
                        onChange={(e) => update("welcome_template", e.target.value)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      מעקב ראשון
                    </CardTitle>
                    <Switch
                      checked={!!form.followup1_enabled}
                      onCheckedChange={(checked) => handleToggleChange("followup1_enabled", checked)}
                    />
                  </div>
                  <CardDescription>מבוטל אוטומטית אם הליד קיבל טיפול</CardDescription>
                </CardHeader>
                {form.followup1_enabled && (
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> עיכוב (שעות)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.followup1_delay_hours ?? 24}
                        onChange={(e) => update("followup1_delay_hours", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>שם תבנית</Label>
                      <Input
                        value={form.followup1_template ?? "lead_followup"}
                        onChange={(e) => update("followup1_template", e.target.value)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      מעקב שני
                    </CardTitle>
                    <Switch
                      checked={!!form.followup2_enabled}
                      onCheckedChange={(checked) => handleToggleChange("followup2_enabled", checked)}
                    />
                  </div>
                  <CardDescription>מבוטל אוטומטית אם הליד קיבל טיפול</CardDescription>
                </CardHeader>
                {form.followup2_enabled && (
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> עיכוב (שעות)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.followup2_delay_hours ?? 72}
                        onChange={(e) => update("followup2_delay_hours", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>שם תבנית</Label>
                      <Input
                        value={form.followup2_template ?? "lead_followup"}
                        onChange={(e) => update("followup2_template", e.target.value)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Car className="h-4 w-4 text-orange-500" />
                      התאמת רכב ללידים
                    </CardTitle>
                    <Switch
                      checked={!!form.car_match_enabled}
                      onCheckedChange={(checked) => handleToggleChange("car_match_enabled", checked)}
                    />
                  </div>
                  <CardDescription>כשרכב חדש נכנס למלאי, נשלחת הודעה ללידים שחיפשו רכב כזה</CardDescription>
                </CardHeader>
                {form.car_match_enabled && (
                  <CardContent>
                    <div className="max-w-xs space-y-1">
                      <Label>שם תבנית</Label>
                      <Input
                        value={form.car_match_template ?? "car_match_alert"}
                        onChange={(e) => update("car_match_template", e.target.value)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Button onClick={save} disabled={upsert.isPending} className="w-full">
                {upsert.isPending ? "שומר..." : "שמור הגדרות"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="log">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">ממתינים</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-green-500">{sentCount}</div>
                <div className="text-xs text-muted-foreground">נשלחו</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-red-500">{failedCount}</div>
                <div className="text-xs text-muted-foreground">נכשלו</div>
              </Card>
            </div>

            {!queue || queue.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">אין פריטים בתור</p>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-right font-medium">סוג</th>
                      <th className="px-3 py-2 text-right font-medium">טלפון</th>
                      <th className="px-3 py-2 text-right font-medium">מתוזמן ל</th>
                      <th className="px-3 py-2 text-right font-medium">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item) => {
                      const s = STATUS_LABELS[item.status] ?? { label: item.status, variant: "outline" as const };

                      return (
                        <tr key={item.id} className="border-t hover:bg-muted/30">
                          <td className="px-3 py-2">{TYPE_LABELS[item.automation_type] ?? item.automation_type}</td>
                          <td className="px-3 py-2 font-mono text-xs">{item.phone}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(item.scheduled_for)}</td>
                          <td className="px-3 py-2">
                            <Badge variant={s.variant}>{s.label}</Badge>
                            {item.last_error && (
                              <span className="mt-0.5 block max-w-[200px] truncate text-[10px] text-red-400" title={item.last_error}>
                                {item.last_error}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
