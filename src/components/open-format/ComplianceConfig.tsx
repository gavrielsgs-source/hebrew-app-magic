import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Settings } from "lucide-react";
import { useComplianceConfig, useSaveComplianceConfig } from "@/hooks/use-open-format";

export function ComplianceConfig() {
  const { data: config, isLoading } = useComplianceConfig();
  const saveConfig = useSaveComplianceConfig();

  const [form, setForm] = useState({
    software_registration_number: "",
    software_name: "CarsLead",
    software_version: "1.0",
    software_vendor_name: "CarsLead Ltd",
    software_vendor_tax_id: "",
    default_encoding: "ISO-8859-8",
    currency_code: "ILS",
    branches_enabled: false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        software_registration_number: config.software_registration_number || "",
        software_name: config.software_name || "CarsLead",
        software_version: config.software_version || "1.0",
        software_vendor_name: config.software_vendor_name || "CarsLead Ltd",
        software_vendor_tax_id: config.software_vendor_tax_id || "",
        default_encoding: config.default_encoding || "ISO-8859-8",
        currency_code: config.currency_code || "ILS",
        branches_enabled: config.branches_enabled || false,
      });
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          הגדרות ציות
        </CardTitle>
        <CardDescription>
          הגדרות תוכנה ורישום לרשות המיסים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>מספר רישום תוכנה ברשות המיסים</Label>
            <Input
              value={form.software_registration_number}
              onChange={(e) => setForm({ ...form, software_registration_number: e.target.value })}
              placeholder="יוזן לאחר קבלת הרישום"
            />
          </div>
          <div className="space-y-2">
            <Label>שם התוכנה</Label>
            <Input
              value={form.software_name}
              onChange={(e) => setForm({ ...form, software_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>גרסת התוכנה</Label>
            <Input
              value={form.software_version}
              onChange={(e) => setForm({ ...form, software_version: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>שם מפתח התוכנה</Label>
            <Input
              value={form.software_vendor_name}
              onChange={(e) => setForm({ ...form, software_vendor_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>ח.פ. / ע.מ. מפתח</Label>
            <Input
              value={form.software_vendor_tax_id}
              onChange={(e) => setForm({ ...form, software_vendor_tax_id: e.target.value })}
              placeholder="מספר עוסק מורשה של המפתח"
            />
          </div>
          <div className="space-y-2">
            <Label>קידוד ברירת מחדל</Label>
            <Select
              value={form.default_encoding}
              onValueChange={(v) => setForm({ ...form, default_encoding: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ISO-8859-8">ISO-8859-8 (מומלץ)</SelectItem>
                <SelectItem value="CP862">CP862 (legacy)</SelectItem>
                <SelectItem value="UTF-8">UTF-8 (debug בלבד - לא תואם)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>מטבע</Label>
            <Input value={form.currency_code} disabled />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              checked={form.branches_enabled}
              onCheckedChange={(v) => setForm({ ...form, branches_enabled: v })}
            />
            <Label>סניפים מופעלים (עתידי)</Label>
          </div>
        </div>

        <Button
          onClick={() => saveConfig.mutate(form)}
          disabled={saveConfig.isPending}
          className="mt-4"
        >
          {saveConfig.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          שמור הגדרות
        </Button>
      </CardContent>
    </Card>
  );
}
