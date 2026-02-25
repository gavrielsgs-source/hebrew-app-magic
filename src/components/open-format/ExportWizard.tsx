import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileDown, Info } from "lucide-react";
import { useGenerateExport, ExportRunResult } from "@/hooks/use-open-format";
import { ExportResults } from "./ExportResults";

export function ExportWizard() {
  const [mode, setMode] = useState<string>("single_year");
  const [taxYear, setTaxYear] = useState<string>(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<ExportRunResult | null>(null);

  const generateExport = useGenerateExport();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleGenerate = async () => {
    const params: any = { mode };
    if (mode === "single_year") {
      params.taxYear = parseInt(taxYear);
    } else {
      if (!startDate || !endDate) return;
      params.startDate = startDate;
      params.endDate = endDate;
    }

    try {
      const res = await generateExport.mutateAsync(params);
      setResult(res);
    } catch {
      // Error handled in mutation
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setResult(null)}>
          ← חזרה לאשף הייצוא
        </Button>
        <ExportResults result={result} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          אשף ייצוא - פורמט אחיד 1.31
        </CardTitle>
        <CardDescription>
          ייצוא נתונים בפורמט האחיד של רשות המיסים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">סוג מערכת</Label>
          <RadioGroup value={mode} onValueChange={setMode} className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="single_year" id="single" />
              <Label htmlFor="single">שנה בודדת</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="multi_year" id="multi" />
              <Label htmlFor="multi">רב-שנתי</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Year / Date Range */}
        {mode === "single_year" ? (
          <div className="space-y-2">
            <Label>שנת מס</Label>
            <Select value={taxYear} onValueChange={setTaxYear}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>מתאריך</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>עד תאריך</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {mode === "multi_year" && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              סינון רב-שנתי מתבצע לפי תאריך מסמך. סינון לפי יומן חשבונאי - בשלב עתידי.
            </AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generateExport.isPending}
          size="lg"
          className="w-full"
        >
          {generateExport.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              מייצא קבצים...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 ml-2" />
              ייצא קבצים
            </>
          )}
        </Button>

        <Alert variant="default" className="bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs text-muted-foreground">
            מודול זה מכין קבצים בלבד. בדיקת סימולטור והגשה לרשות המיסים מבוצעות חיצונית.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
