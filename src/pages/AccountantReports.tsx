import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, Download, Mail, FileText, AlertTriangle, CheckCircle2, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useGenerateAccountantReport } from "@/hooks/reports/use-generate-accountant-report";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
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
  const isMobile = useIsMobile();

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

  const content = (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-l from-primary to-primary/80 p-6">
          <div className="flex items-center justify-between">
            <div className="text-primary-foreground text-right">
              <h1 className={`font-bold mb-1 ${isMobile ? 'text-xl' : 'text-2xl'}`}>דוחות לרואה חשבון</h1>
              <p className="text-primary-foreground/80 text-sm">
                ייצוא דוחות מפורטים לרואה החשבון
              </p>
            </div>
            <div className={`${isMobile ? 'h-12 w-12' : 'h-14 w-14'} bg-white/20 rounded-2xl flex items-center justify-center`}>
              <Calculator className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-primary-foreground`} />
            </div>
          </div>
        </div>
      </Card>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Report Generation Card */}
        <Card className={`shadow-lg rounded-2xl border-2 ${isMobile ? '' : 'lg:col-span-2'}`}>
          <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
            <CardTitle className="text-right text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              בחירת תקופה
            </CardTitle>
            <p className="text-sm text-muted-foreground text-right">
              בחר את טווח התאריכים לדוח
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            {/* Quick Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2 justify-end">
                בחירה מהירה
              </Label>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter("current")}
                  className="rounded-xl"
                >
                  החודש הנוכחי
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter("previous")}
                  className="rounded-xl"
                >
                  החודש הקודם
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter("three")}
                  className="rounded-xl"
                >
                  3 חודשים אחרונים
                </Button>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2 justify-end">
                  מתאריך
                </Label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 px-4 border-2 rounded-xl text-right bg-background focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2 justify-end">
                  עד תאריך
                </Label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 px-4 border-2 rounded-xl text-right bg-background focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <Separator />

            {/* Generate Button */}
            <div className="space-y-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
                size="lg"
              >
                <FileText className="ml-2 h-5 w-5" />
                {isPending ? "מכין דוח..." : "הכן דוח לרואה חשבון"}
              </Button>

              {isPending && (
                <div className="space-y-2">
                  <Progress value={45} className="w-full h-2 rounded-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    אוסף נתונים ומייצר דוח...
                  </p>
                </div>
              )}
            </div>

            {/* Validation Errors */}
            {reportData && reportData.validationErrors.length > 0 && (
              <Alert variant="destructive" className="rounded-xl">
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
              <Alert className="border-green-500 bg-green-50 rounded-xl">
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
                  className="flex-1 h-11 rounded-xl border-2"
                >
                  <Download className="ml-2 h-4 w-4" />
                  הורד דוח
                </Button>
                <Button
                  onClick={handleSendToAccountant}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-l from-primary to-primary/80"
                  disabled={!profile?.accountant_email}
                >
                  <Mail className="ml-2 h-4 w-4" />
                  שלח לרו״ח
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Panel */}
        {reportData && (
          <div className="space-y-4">
            <Card className="shadow-lg rounded-2xl border-2 bg-gradient-to-b from-primary/5 to-transparent">
              <CardHeader className="bg-gradient-to-l from-green-500/10 to-transparent border-b pb-4">
                <CardTitle className="text-right text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  סיכום פיננסי
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-green-600">
                    ₪{reportData.summary.totalSales.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">סה״כ מכירות</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-red-600">
                    ₪{reportData.summary.totalPurchases.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">סה״כ רכישות</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-orange-600">
                    ₪{reportData.summary.totalExpenses.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">סה״כ הוצאות</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">
                    ₪{reportData.summary.grossProfit.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">רווח גולמי</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">
                    ₪{reportData.summary.netProfit.toLocaleString()}
                  </span>
                  <span className="font-semibold">רווח נקי</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">
                    ₪{reportData.summary.totalVAT.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">סה״כ מע״מ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{reportData.summary.transactionCount}</span>
                  <span className="text-muted-foreground">מס׳ עסקאות</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-right text-base">פרטי הדוח</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {format(new Date(reportData.period.start), "dd/MM/yyyy", { locale: he })} -{" "}
                    {format(new Date(reportData.period.end), "dd/MM/yyyy", { locale: he })}
                  </span>
                  <span className="text-muted-foreground">תקופה:</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">
                    {format(new Date(reportData.generatedAt), "dd/MM/yyyy HH:mm", { locale: he })}
                  </span>
                  <span className="text-muted-foreground">נוצר בתאריך:</span>
                </div>
                {profile?.accountant_email && (
                  <div className="flex justify-between">
                    <span className="font-medium text-xs truncate max-w-[150px]">{profile.accountant_email}</span>
                    <span className="text-muted-foreground">רו״ח:</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileContainer className="bg-background" withPadding={false}>
        <div className="p-4 pb-24">
          {content}
        </div>
      </MobileContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {content}
      </div>
    </div>
  );
}
