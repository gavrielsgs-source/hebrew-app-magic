import { useState, useEffect, useRef } from "react";
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

  const [form, setForm] = useState<Partial<AutomationSettings>>(() => {
    try {
      const cached = localStorage.getItem("automation_settings_form");
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_SETTINGS;
  });
  const formRef = useRef<Partial<AutomationSettings>>(form);
  const pendingMutations = useRef(0);
  const latestToggleRevision = useRef(0);
  const hasUnsavedManualChanges = useRef(false);

  const persistLocalForm = (nextForm: Partial<AutomationSettings>) => {
    formRef.current = nextForm;
    setForm(nextForm);
    localStorage.setItem("automation_settings_form", JSON.stringify(nextForm));
  };

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    if (settings && pendingMutations.current === 0 && !hasUnsavedManualChanges.current) {
      persistLocalForm(settings);
    }
  }, [settings]);

  const TOGGLE_KEYS = ['welcome_enabled', 'followup1_enabled', 'followup2_enabled', 'car_match_enabled'] as const;
  type ToggleKey = typeof TOGGLE_KEYS[number];

  function update(key: keyof AutomationSettings, value: any) {
    const updated = { ...formRef.current, [key]: value };
    persistLocalForm(updated);
    hasUnsavedManualChanges.current = true;
  }

  function handleToggleChange(key: ToggleKey, checked: boolean) {
    const updated = { ...formRef.current, [key]: checked };
    persistLocalForm(updated);

    const currentRevision = ++latestToggleRevision.current;
    pendingMutations.current += 1;
    upsert.mutate({ [key]: checked }, {
      onSuccess: (savedData) => {
        if (currentRevision === latestToggleRevision.current) {
          persistLocalForm({
            ...formRef.current,
            [key]: checked,
            id: savedData.id,
            user_id: savedData.user_id,
            created_at: savedData.created_at,
            updated_at: savedData.updated_at,
          });
        }
      },
      onSettled: () => {
        pendingMutations.current = Math.max(0, pendingMutations.current - 1);
      }
    });
  }

  function save() {
    const {
      welcome_enabled: _welcomeEnabled,
      followup1_enabled: _followup1Enabled,
      followup2_enabled: _followup2Enabled,
      car_match_enabled: _carMatchEnabled,
      ...manualFields
    } = formRef.current;

    pendingMutations.current += 1;
    upsert.mutate(manualFields, {
      onSuccess: (savedData) => {
        hasUnsavedManualChanges.current = false;
        persistLocalForm({
          ...formRef.current,
          ...manualFields,
          id: savedData.id,
          user_id: savedData.user_id,
          created_at: savedData.created_at,
          updated_at: savedData.updated_at,
        });
      },
      onSettled: () => {
        pendingMutations.current = Math.max(0, pendingMutations.current - 1);
      },
    });
  }

  const pendingCount = queue?.filter((q) => q.status === "pending").length ?? 0;
  const sentCount = queue?.filter((q) => q.status === "sent").length ?? 0;
  const failedCount = queue?.filter((q) => q.status === "failed").length ?? 0;

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-6 w-6 text-yellow-400" />
        <div>
          <h2 className="text-xl font-bold">אוטומציות WhatsApp</h2>
          <p className="text-muted-foreground text-sm">הגדר הודעות אוטומטיות ללידים וללקוחות</p>
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
            <p className="text-muted-foreground text-sm">טוען...</p>
          ) : (
            <div className="space-y-4">
              {/* Welcome */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
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

              {/* Follow-up 1 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
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

              {/* Follow-up 2 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      מעקב שני
                    </CardTitle>
                    <Switch
                      checked={!!form.followup2_enabled}
                      onCheckedChange={(v) => update("followup2_enabled", v)}
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

              {/* Car match */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="h-4 w-4 text-orange-500" />
                      התאמת רכב ללידים
                    </CardTitle>
                    <Switch
                      checked={!!form.car_match_enabled}
                      onCheckedChange={(v) => update("car_match_enabled", v)}
                    />
                  </div>
                  <CardDescription>כשרכב חדש נכנס למלאי, נשלחת הודעה ללידים שחיפשו רכב כזה</CardDescription>
                </CardHeader>
                {form.car_match_enabled && (
                  <CardContent>
                    <div className="space-y-1 max-w-xs">
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
              <Card className="text-center p-3">
                <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">ממתינים</div>
              </Card>
              <Card className="text-center p-3">
                <div className="text-2xl font-bold text-green-500">{sentCount}</div>
                <div className="text-xs text-muted-foreground">נשלחו</div>
              </Card>
              <Card className="text-center p-3">
                <div className="text-2xl font-bold text-red-500">{failedCount}</div>
                <div className="text-xs text-muted-foreground">נכשלו</div>
              </Card>
            </div>

            {!queue || queue.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">אין פריטים בתור</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right px-3 py-2 font-medium">סוג</th>
                      <th className="text-right px-3 py-2 font-medium">טלפון</th>
                      <th className="text-right px-3 py-2 font-medium">מתוזמן ל</th>
                      <th className="text-right px-3 py-2 font-medium">סטטוס</th>
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
                              <span className="block text-[10px] text-red-400 mt-0.5 max-w-[200px] truncate" title={item.last_error}>
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
