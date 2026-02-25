import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, Download, AlertTriangle, CheckCircle2, XCircle, FileText } from "lucide-react";
import { useComplianceConfig, useExportRunCounts, useExportRunArtifacts } from "@/hooks/use-open-format";
import type { ExportRunResult } from "@/hooks/use-open-format";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

const RECORD_TYPE_ROWS = [
  { code: 'A000', label: 'רשומה כללית (TXT.INI)', future: true },
  { code: '100A', label: 'רשומת פתיחה', future: false },
  { code: '100C', label: 'כותרת מסמך', future: false },
  { code: '110D', label: 'שורת פירוט מסמך', future: false },
  { code: '120D', label: 'פרטי תשלום', future: false },
  { code: '100B', label: 'כותרת חשבון (חשבונאי)', future: true },
  { code: '110B', label: 'תנועת יומן חשבונאי', future: true },
  { code: '100M', label: 'מלאי', future: true },
  { code: '900Z', label: 'רשומת סגירה', future: false },
];

const ARTIFACT_CHECKS = [
  { key: 'INI', label: 'TXT.INI' },
  { key: 'BKMVDATA', label: 'TXT.BKMVDATA' },
  { key: 'ZIP', label: 'BKMVDATA.zip' },
  { key: 'DEBUG_MANIFEST', label: 'export_debug_manifest.json (פנימי)' },
];

interface PrintReport54Props {
  exportRunId: string;
  /** If we already have the full result from ExportWizard, pass it to avoid extra fetches */
  resultData?: ExportRunResult;
}

export function PrintReport54({ exportRunId, resultData }: PrintReport54Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const { data: config } = useComplianceConfig();
  const { user } = useAuth();

  // Fetch export run from DB if resultData not provided
  const { data: runFromDb } = useQuery({
    queryKey: ['open-format-run', exportRunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_format_export_runs')
        .select('*')
        .eq('id', exportRunId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!exportRunId && !resultData,
  });

  const { data: dbCounts } = useExportRunCounts(exportRunId);
  const { data: dbArtifacts } = useExportRunArtifacts(exportRunId);

  // Fetch profile for business details
  const { data: profile } = useQuery({
    queryKey: ['profile-for-report', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, company_hp, company_address, company_authorized_dealer')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Build unified data from either resultData or DB
  const run = runFromDb;
  const recordCounts: Record<string, number> = {};
  if (resultData?.recordCounts) {
    Object.assign(recordCounts, resultData.recordCounts);
  } else if (dbCounts) {
    dbCounts.forEach((c: any) => {
      recordCounts[c.record_type_code] = c.count;
    });
  }

  const artifacts = resultData?.artifacts
    ? resultData.artifacts.map(a => ({ artifact_type: a.type, filename: a.filename, byte_size: a.byteSize, checksum: null }))
    : dbArtifacts || [];

  const validationResults = resultData?.validationResults || [];
  const warnings = resultData?.warnings || [];
  const blockers = resultData?.blockers || [];

  const status = resultData?.status || run?.status || 'unknown';
  const primaryId = resultData?.primaryId || run?.primary_id_15 || '—';
  const mode = run?.mode || (resultData ? 'single_year' : '—');
  const taxYear = run?.tax_year;
  const startDate = run?.start_date;
  const endDate = run?.end_date;
  const encoding = resultData?.encoding || run?.encoding_used || '—';
  const logicalPath = resultData?.logicalPath || run?.logical_output_path || '—';
  const startedAt = resultData?.startedAt || run?.started_at;
  const finishedAt = resultData?.finishedAt || run?.finished_at;
  const compressionName = run?.compression_name || 'BKMVDATA.zip';

  const now = new Date().toLocaleString('he-IL');
  const missingFields: string[] = [];
  if (!config?.software_registration_number) missingFields.push('מספר רישום תוכנה ברשות המיסים');
  if (!profile?.company_name) missingFields.push('שם העסק');
  if (!profile?.company_hp) missingFields.push('ח.פ. / ע.מ. של העסק');

  const totalBkmvRecords = RECORD_TYPE_ROWS
    .filter(r => !r.future && r.code !== 'A000')
    .reduce((sum, r) => sum + (recordCounts[r.code] || 0), 0);

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        width: 794,
        windowWidth: 794,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let y = 0;
      let page = 0;
      while (y < imgHeight) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
        y += pdfHeight;
        page++;
      }
      pdf.save(`section54_report_${primaryId}.pdf`);
      toast.success('PDF נוצר בהצלחה');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('שגיאה ביצירת PDF — השתמש בהדפסה מהדפדפן');
    } finally {
      setGenerating(false);
    }
  };

  if (!run && !resultData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          לא נמצאו נתוני הפקה עבור מזהה זה ({exportRunId}). ייתכן שהריצה נמחקה או שאין הרשאה.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons — hidden in print */}
      <div className="flex gap-3 print:hidden">
        <Button onClick={handlePdf} disabled={generating}>
          <Download className="h-4 w-4 ml-2" />
          {generating ? 'מייצר PDF...' : 'הורד PDF'}
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 ml-2" />
          הדפס מהדפדפן
        </Button>
      </div>

      {missingFields.length > 0 && (
        <Alert className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>שדות חסרים לדו״ח מלא:</strong> {missingFields.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Printable Report */}
      <div
        ref={reportRef}
        dir="rtl"
        className="bg-white text-black p-8 print:p-4 max-w-[794px] mx-auto border print:border-0 print:shadow-none shadow-sm text-sm leading-relaxed"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* A) Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold mb-1">פלט מודפס — נספח 4 (סעיף 5.4)</h1>
          <h2 className="text-base font-semibold text-gray-700">ממשק פתוח / FORMAT OPEN 1.31</h2>
          <p className="text-xs text-gray-500 mt-2">תאריך הפקת דו״ח: {now}</p>
          <p className="text-xs text-gray-500">מזהה ריצת ייצוא: <span className="font-mono">{exportRunId}</span></p>
        </div>

        {/* B) Business Details */}
        <Section title="פרטי עסק">
          <Row label="שם העסק" value={profile?.company_name} />
          <Row label="מספר עוסק מורשה / ח.פ." value={profile?.company_hp} />
          <Row label="כתובת העסק" value={profile?.company_address} />
          <Row label="עוסק מורשה" value={profile?.company_authorized_dealer ? 'כן' : 'לא'} />
        </Section>

        {/* C) Software / Compliance */}
        <Section title="פרטי תוכנה וציות">
          <Row label="שם התוכנה" value={config?.software_name || 'CarsLead'} />
          <Row label="גרסת תוכנה" value={config?.software_version || '1.0'} />
          <Row label="יצרן התוכנה" value={config?.software_vendor_name || 'CarsLead Ltd'} />
          <Row label="ע״מ יצרן התוכנה" value={config?.software_vendor_tax_id} />
          <Row
            label="מספר רישום ברשות המיסים"
            value={config?.software_registration_number}
            warn={!config?.software_registration_number}
            warnText="נדרש לפני הגשה לרשות המיסים"
          />
          <Row label="קידוד שנבחר" value={encoding} warn={encoding === 'UTF-8'} warnText="לא תואם — debug בלבד" />
          <Row label="מטבע מוביל" value={config?.currency_code || 'ILS'} />
        </Section>

        {/* D) Export Run Details */}
        <Section title="פרטי הפקה">
          <Row label="סטטוס הפקה" value={status === 'success' ? '✔ הצלחה' : status === 'failed' ? '✘ נכשל' : status} />
          <Row label="Primary ID (15 ספרות)" value={primaryId} mono />
          <Row label="מצב מערכת" value={mode === 'single_year' ? 'חד-שנתית' : mode === 'multi_year' ? 'רב-שנתית' : mode} />
          {mode === 'single_year' && <Row label="שנת מס" value={taxYear?.toString()} />}
          {mode === 'multi_year' && <Row label="טווח תאריכים" value={startDate && endDate ? `${startDate} — ${endDate}` : undefined} />}
          <Row label="תחילת הפקה" value={startedAt ? new Date(startedAt).toLocaleString('he-IL') : undefined} />
          <Row label="סיום הפקה" value={finishedAt ? new Date(finishedAt).toLocaleString('he-IL') : undefined} />
          <Row label="נתיב שמירה לוגי" value={logicalPath} mono />
          <Row label="שם קובץ ZIP" value={compressionName} mono />
        </Section>

        {/* E) Record Counts */}
        <Section title="סיכום רשומות">
          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-1.5 text-right font-semibold">קוד רשומה</th>
                <th className="border border-gray-400 px-3 py-1.5 text-right font-semibold">תיאור</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-semibold w-24">כמות</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-semibold w-28">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {RECORD_TYPE_ROWS.map(row => {
                const count = recordCounts[row.code] ?? 0;
                return (
                  <tr key={row.code} className={row.future ? 'text-gray-400' : ''}>
                    <td className="border border-gray-300 px-3 py-1 font-mono">{row.code}</td>
                    <td className="border border-gray-300 px-3 py-1">{row.label}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center font-bold">{count}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">
                      {row.future ? 'טרם מיושם' : count > 0 ? 'פעיל' : 'ריק'}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-bold">
                <td className="border border-gray-400 px-3 py-1.5" colSpan={2}>סה״כ רשומות ב-BKMVDATA</td>
                <td className="border border-gray-400 px-3 py-1.5 text-center">{totalBkmvRecords}</td>
                <td className="border border-gray-400 px-3 py-1.5"></td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* F) Validation / Readiness */}
        <Section title="ולידציה ומוכנות סימולטור">
          {validationResults.length > 0 ? (
            <ul className="space-y-1 mb-3">
              {validationResults.map((v, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span>{v.passed ? '✔' : '✘'}</span>
                  <span className={v.passed ? '' : 'font-bold'}>{v.check}</span>
                  {v.detail && <span className="text-xs text-gray-500">({v.detail})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mb-3">אין תוצאות ולידציה זמינות עבור ריצה זו.</p>
          )}

          {blockers.length > 0 && (
            <div className="mb-2">
              <p className="font-bold">בעיות חוסמות:</p>
              <ul className="pr-4">
                {blockers.map((b, i) => <li key={i} className="text-sm">• {b}</li>)}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="mb-2">
              <p className="font-semibold">אזהרות:</p>
              <ul className="pr-4">
                {warnings.map((w, i) => <li key={i} className="text-sm text-gray-600">• {w}</li>)}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-500 border-t border-gray-300 pt-2 mt-3">
            דו״ח זה הינו פלט מערכת לצורך תיעוד/בדיקה. בדיקת הסימולטור והגשה לרשות המיסים מתבצעות בנפרד.
          </p>
        </Section>

        {/* G) Artifact Summary */}
        <Section title="סיכום קבצים (Artifacts)">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-1.5 text-right font-semibold">קובץ</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-semibold w-20">קיים?</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-semibold w-28">גודל</th>
              </tr>
            </thead>
            <tbody>
              {ARTIFACT_CHECKS.map(ac => {
                const found = (artifacts as any[]).find((a: any) =>
                  (a.artifact_type || a.type) === ac.key
                );
                const size = found ? (found.byte_size || found.byteSize) : null;
                return (
                  <tr key={ac.key}>
                    <td className="border border-gray-300 px-3 py-1 font-mono text-xs">{ac.label}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center">
                      {found ? '✔' : '✘'}
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">
                      {size ? `${(size / 1024).toFixed(1)} KB` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        {/* Footer */}
        <div className="border-t-2 border-black mt-6 pt-3 text-center text-xs text-gray-400">
          <p>הופק ע״י CarsLead — ממשק פתוח 1.31 | {now}</p>
        </div>
      </div>
    </div>
  );
}

// Helper components for report layout
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-base border-b border-gray-300 pb-1 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  warn,
  warnText,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  warn?: boolean;
  warnText?: string;
}) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="font-semibold min-w-[180px] shrink-0">{label}:</span>
      {value ? (
        <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
      ) : (
        <span className="text-gray-400 italic">לא צוין</span>
      )}
      {warn && warnText && (
        <span className="text-red-600 text-xs font-bold mr-2">⚠ {warnText}</span>
      )}
    </div>
  );
}
