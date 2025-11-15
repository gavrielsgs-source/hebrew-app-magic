import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, Download, Mail, FileText, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useGenerateAccountantReport } from "@/hooks/reports/use-generate-accountant-report";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GenerateReportResponse } from "@/types/accountant-report";

export default function AccountantReports() {
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd")
  );
  const [reportData, setReportData] = useState<GenerateReportResponse | null>(null);

  const { mutate: generateReport, isPending } = useGenerateAccountantReport();
  const { profile } = useProfile();

  const handleGenerateReport = () => {
    generateReport(
      { startDate, endDate },
      {
        onSuccess: (data) => {
          setReportData(data);
        },
      }
    );
  };

  const handleQuickFilter = (type: "current" | "previous" | "three") => {
    const now = new Date();
    switch (type) {
      case "current":
        setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
        break;
      case "previous":
        setStartDate(format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd"));
        break;
      case "three":
        setStartDate(format(startOfMonth(subMonths(now, 3)), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
        break;
    }
  };

  const handleSendToAccountant = async () => {
    if (!profile?.accountant_email) {
      toast.error("לא הוגדר כתובת מייל לרואה החשבון", {
        description: "עדכן את הפרופיל שלך בהגדרות",
      });
      return;
    }

    if (!reportData?.reportUrl) {
      toast.error("אין דוח זמין לשליחה");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: profile.accountant_email,
          template: "accountant_report",
          data: {
            userName: profile.full_name || "לקוח יקר",
            reportUrl: reportData.reportUrl,
            period: `${format(new Date(startDate), "dd/MM/yyyy", { locale: he })} - ${format(
              new Date(endDate),
              "dd/MM/yyyy",
              { locale: he }
            )}`,
            summary: reportData.summary,
          },
        },
      });

      if (error) throw error;

      toast.success("הדוח נשלח לרואה החשבון בהצלחה!");
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error("שגיאה בשליחת המייל", {
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">דוחות לרואה חשבון</h1>
        <p className="text-muted-foreground">
          ייצוא דוחות מפורטים כולל מכירות, רכישות, הוצאות וחשבוניות לרואה החשבון
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Right Panel - Report Generation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              בחירת תקופה
            </CardTitle>
            <CardDescription>בחר את טווח התאריכים לדוח</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Filters */}
            <div className="space-y-2">
              <Label>בחירה מהירה</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter("current")}>
                  החודש הנוכחי
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter("previous")}>
                  החודש הקודם
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter("three")}>
                  3 חודשים אחרונים
                </Button>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">מתאריך</Label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">עד תאריך</Label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <Separator />

            {/* Generate Button */}
            <div className="space-y-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                <FileText className="ml-2 h-5 w-5" />
                {isPending ? "מכין דוח..." : "הכן דוח לרואה חשבון"}
              </Button>

              {isPending && (
                <div className="space-y-2">
                  <Progress value={45} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    אוסף נתונים ומייצר דוח...
                  </p>
                </div>
              )}
            </div>

            {/* Validation Errors */}
            {reportData && reportData.validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">נמצאו {reportData.validationErrors.length} אזהרות:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {reportData.validationErrors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {reportData && reportData.validationErrors.length === 0 && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  הדוח נוצר בהצלחה ללא שגיאות! מוכן להורדה או שליחה
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            {reportData && (
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => window.open(reportData.reportUrl, "_blank")}
                  className="flex-1"
                >
                  <Download className="ml-2 h-4 w-4" />
                  הורד דוח
                </Button>
                <Button
                  variant="default"
                  onClick={handleSendToAccountant}
                  className="flex-1"
                  disabled={!profile?.accountant_email}
                >
                  <Mail className="ml-2 h-4 w-4" />
                  שלח לרו״ח
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Left Panel - Summary */}
        <div className="space-y-6">
          {reportData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    סיכום פיננסי
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">סה״כ מכירות</span>
                      <span className="font-semibold text-green-600">
                        ₪{reportData.summary.totalSales.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">סה״כ רכישות</span>
                      <span className="font-semibold text-red-600">
                        ₪{reportData.summary.totalPurchases.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">סה״כ הוצאות</span>
                      <span className="font-semibold text-orange-600">
                        ₪{reportData.summary.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">רווח גולמי</span>
                      <span className="font-semibold">
                        ₪{reportData.summary.grossProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">רווח נקי</span>
                      <span className="font-bold text-lg text-primary">
                        ₪{reportData.summary.netProfit.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">סה״כ מע״מ</span>
                      <span className="font-semibold">
                        ₪{reportData.summary.totalVAT.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">מס׳ עסקאות</span>
                      <span className="font-semibold">{reportData.summary.transactionCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">פרטי הדוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">תקופה:</span>
                    <span className="font-medium">
                      {format(new Date(reportData.period.start), "dd/MM/yyyy", { locale: he })} -{" "}
                      {format(new Date(reportData.period.end), "dd/MM/yyyy", { locale: he })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">נוצר בתאריך:</span>
                    <span className="font-medium">
                      {format(new Date(reportData.generatedAt), "dd/MM/yyyy HH:mm", { locale: he })}
                    </span>
                  </div>
                  {profile?.accountant_email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">רו״ח:</span>
                      <span className="font-medium text-xs">{profile.accountant_email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
