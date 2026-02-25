import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, Download, AlertTriangle, Info } from "lucide-react";
import { useComplianceConfig, useExportRunCounts, useDocTypeMappings } from "@/hooks/use-open-format";
import type { ExportRunResult } from "@/hooks/use-open-format";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface PrintReport26Props {
  exportRunId: string;
  resultData?: ExportRunResult;
}

/** All known Tax Authority document type codes for reference */
const KNOWN_TAX_DOC_TYPES = [
  { code: '100', label: 'חשבונית מס' },
  { code: '200', label: 'חשבונית מס / קבלה' },
  { code: '210', label: 'חשבונית ריכוז' },
  { code: '300', label: 'קבלה' },
  { code: '305', label: 'קבלה על תרומה' },
  { code: '310', label: 'תקבולים על חשבון' },
  { code: '320', label: 'קבלה עבור מילווה' },
  { code: '330', label: 'קבלה - פדיון מילווה' },
  { code: '340', label: 'קבלת תשלום אחר' },
  { code: '400', label: 'חשבונית זיכוי' },
  { code: '500', label: 'הזמנה' },
  { code: '600', label: 'תעודת משלוח' },
  { code: '610', label: 'החזרה' },
  { code: '700', label: 'הצעת מחיר' },
  { code: '800', label: 'תעודת זיכוי' },
  { code: '900', label: 'חשבון עסקה' },
];

export function PrintReport26({ exportRunId, resultData }: PrintReport26Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const { data: config } = useComplianceConfig();
  const { data: mappings } = useDocTypeMappings();
  const { user } = useAuth();

  // Fetch export run from DB if resultData not provided
  const { data: run } = useQuery({
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

  // Fetch document totals for the export run period
  const effectiveRun = run || (resultData ? {
    mode: 'single_year',
    tax_year: undefined,
    start_date: undefined,
    end_date: undefined,
    status: resultData?.status,
    primary_id_15: resultData?.primaryId,
    encoding_used: resultData?.encoding,
    logical_output_path: resultData?.logicalPath,
    started_at: resultData?.startedAt,
    finished_at: resultData?.finishedAt,
  } : null) as any;

  // Calculate date range for document query
  const dateRange = getDateRange(effectiveRun);

  const { data: docTotals, isLoading: docTotalsLoading } = useQuery({
    queryKey: ['report26-doc-totals', user?.id, exportRunId, dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!dateRange) return [];
      let query = supabase
        .from('customer_documents')
        .select('type, amount, status')
        .eq('user_id', user!.id)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!dateRange,
  });

  // Build record counts
  const recordCounts: Record<string, number> = {};
  if (resultData?.recordCounts) {
    Object.assign(recordCounts, resultData.recordCounts);
  } else if (dbCounts) {
    dbCounts.forEach((c: any) => { recordCounts[c.record_type_code] = c.count; });
  }

  const count100C = recordCounts['100C'] || 0;

  // Build document totals aggregated by Tax Authority code
  const mappingByInternal: Record<string, { code: string; description?: string; enabled: boolean }> = {};
  (mappings || []).forEach((m: any) => {
    mappingByInternal[m.internal_type] = { code: m.tax_authority_code, description: m.description, enabled: m.enabled };
  });

  // Cancelled document policy: documents with status 'cancelled' are EXCLUDED from totals
  const activeDocs = (docTotals || []).filter((d: any) => d.status !== 'cancelled');
  const cancelledCount = (docTotals || []).length - activeDocs.length;

  // Aggregate by tax authority code
  const aggregated: Record<string, { code: string; label: string; managed: boolean; count: number; amount: number }> = {};

  // Init all known types with 0
  KNOWN_TAX_DOC_TYPES.forEach(t => {
    aggregated[t.code] = { code: t.code, label: t.label, managed: false, count: 0, amount: 0 };
  });

  // Also init from user mappings
  (mappings || []).forEach((m: any) => {
    if (m.enabled && m.tax_authority_code) {
      if (!aggregated[m.tax_authority_code]) {
        aggregated[m.tax_authority_code] = { code: m.tax_authority_code, label: m.description || m.internal_type, managed: true, count: 0, amount: 0 };
      } else {
        aggregated[m.tax_authority_code].managed = true;
        if (m.description) aggregated[m.tax_authority_code].label = m.description;
      }
    }
  });

  // Warnings for unmapped types
  const unmappedTypes = new Set<string>();

  activeDocs.forEach((doc: any) => {
    const mapping = mappingByInternal[doc.type];
    if (mapping && mapping.enabled) {
      const code = mapping.code;
      if (!aggregated[code]) {
        aggregated[code] = { code, label: mapping.description || doc.type, managed: true, count: 0, amount: 0 };
      }
      aggregated[code].count++;
      aggregated[code].amount += Number(doc.amount || 0);
      aggregated[code].managed = true;
    } else {
      unmappedTypes.add(doc.type);
    }
  });

  const sortedRows = Object.values(aggregated).sort((a, b) => a.code.localeCompare(b.code));
  const totalDocCount = sortedRows.reduce((s, r) => s + r.count, 0);
  const totalAmount = sortedRows.reduce((s, r) => s + r.amount, 0);

  const now = new Date().toLocaleString('he-IL');
  const status = resultData?.status || effectiveRun?.status || 'unknown';
  const primaryId = resultData?.primaryId || effectiveRun?.primary_id_15 || '—';
  const mode = effectiveRun?.mode || 'single_year';
  const logicalPath = resultData?.logicalPath || effectiveRun?.logical_output_path || '—';

  const missingFields: string[] = [];
  if (!config?.software_registration_number) missingFields.push('מספר רישום תוכנה');
  if (!profile?.company_name) missingFields.push('שם העסק');

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, useCORS: true, width: 794, windowWidth: 794,
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
      pdf.save(`section26_report_${primaryId}.pdf`);
      toast.success('PDF נוצר בהצלחה');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('שגיאה ביצירת PDF — השתמש בהדפסה מהדפדפן');
    } finally {
      setGenerating(false);
    }
  };

  if (!effectiveRun && !resultData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          לא נמצאו נתוני הפקה עבור מזהה זה ({exportRunId}).
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
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
            <strong>שדות חסרים:</strong> {missingFields.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {unmappedTypes.size > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ סוגי מסמכים ללא מיפוי (חוסם!):</strong> {Array.from(unmappedTypes).join(', ')} — מסמכים אלו לא נכללים בסיכום. 
            <br />
            <span className="text-sm">יש להוסיף מיפוי בטאב "מיפוי מסמכים" כדי שהם ייכללו בדוח ובייצוא.</span>
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
          <h1 className="text-xl font-bold mb-1">פלט מודפס — סעיף 2.6</h1>
          <h2 className="text-base font-semibold text-gray-700">דוח מסמכים לפי סוגי מסמכים</h2>
          <p className="text-xs text-gray-500 mt-2">תאריך הפקת דו״ח: {now}</p>
          <p className="text-xs text-gray-500">מזהה ריצת ייצוא: <span className="font-mono">{exportRunId}</span></p>
        </div>

        {/* B) Business / Export Context */}
        <Section26 title="פרטי עסק והפקה">
          <Row26 label="שם העסק" value={profile?.company_name} />
          <Row26 label="עוסק מורשה / ח.פ." value={profile?.company_hp} />
          <Row26 label="Primary ID" value={primaryId} mono />
          <Row26 label="מצב מערכת" value={mode === 'single_year' ? 'חד-שנתית' : 'רב-שנתית'} />
          {mode === 'single_year' && <Row26 label="שנת מס" value={effectiveRun?.tax_year?.toString()} />}
          {mode === 'multi_year' && <Row26 label="טווח תאריכים" value={dateRange ? `${dateRange.start} — ${dateRange.end}` : undefined} />}
          <Row26 label="סטטוס הפקה" value={status === 'success' ? '✔ הצלחה' : status === 'failed' ? '✘ נכשל' : status} />
          <Row26 label="נתיב שמירה לוגי" value={logicalPath} mono />
        </Section26>

        {/* C) Document Totals Table */}
        <Section26 title="סיכום מסמכים לפי סוג מסמך">
          {docTotalsLoading ? (
            <p className="text-gray-500">טוען נתוני מסמכים...</p>
          ) : (
            <>
              <table className="w-full border-collapse text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold w-20">קוד</th>
                    <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">סוג מסמך</th>
                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold w-20">מנוהל?</th>
                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold w-20">כמות</th>
                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold w-28">סה״כ סכום</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map(row => (
                    <tr key={row.code} className={!row.managed ? 'text-gray-400' : ''}>
                      <td className="border border-gray-300 px-2 py-1 font-mono text-center">{row.code}</td>
                      <td className="border border-gray-300 px-2 py-1">{row.label}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.managed ? 'כן' : 'לא'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-bold">{row.count}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.amount > 0 ? `₪${row.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-gray-400 px-2 py-1.5" colSpan={3}>סה״כ</td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">{totalDocCount}</td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                      {totalAmount > 0 ? `₪${totalAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {cancelledCount > 0 && (
                <p className="text-xs text-gray-500">
                  * {cancelledCount} מסמכים מבוטלים הוחרגו מהסיכום (מדיניות: מסמכים עם סטטוס "cancelled" אינם נספרים).
                </p>
              )}
            </>
          )}
        </Section26>

        {/* D) Cross-check */}
        <Section26 title="בדיקת הצלבה">
          <div className="space-y-1 text-sm">
            <Row26 label="כמות רשומות 100C בייצוא" value={count100C.toString()} />
            <Row26 label='סה״כ מסמכים בדוח 2.6' value={totalDocCount.toString()} />
            <div className="flex items-baseline gap-2 py-0.5">
              <span className="font-semibold min-w-[180px] shrink-0">התאמה:</span>
              {count100C === totalDocCount ? (
                <span className="text-green-700 font-bold">✔ תואם</span>
              ) : (
                <span className="text-red-600 font-bold">
                  ✘ אי-התאמה ({count100C} לעומת {totalDocCount})
                  {unmappedTypes.size > 0 && ' — ייתכן שנובע ממיפויים חסרים'}
                </span>
              )}
            </div>
          </div>
        </Section26>

        {/* E) Accounting Placeholder */}
        <Section26 title="מאזן בוחן תנועות (הנהלת חשבונות)">
          <div className="bg-gray-50 border border-gray-300 rounded p-4 text-center">
            <p className="font-semibold text-gray-500">טרם מיושם</p>
            <p className="text-xs text-gray-400 mt-1">
              מאזן בוחן ייושם כאשר מודול הנהלת חשבונות מלא יהיה זמין במערכת.
              <br />
              כרגע המערכת מבוססת מסמכים בלבד (חשבוניות, קבלות וכו׳).
            </p>
          </div>
        </Section26>

        {/* F) Warnings */}
        <Section26 title="הערות ואזהרות">
          <ul className="space-y-1 text-xs text-gray-600">
            {unmappedTypes.size > 0 && (
              <li className="text-red-700 font-bold text-sm">
                ⚠ חוסם! סוגי מסמכים ללא מיפוי: {Array.from(unmappedTypes).join(', ')} — 
                {Array.from(unmappedTypes).reduce((sum, t) => sum + activeDocs.filter((d: any) => d.type === t).length, 0)} מסמכים לא נכללו בסיכום.
                יש להגדיר מיפוי בטאב "מיפוי מסמכים".
              </li>
            )}
            {!config?.software_registration_number && (
              <li>⚠ מספר רישום תוכנה ברשות המיסים חסר — נדרש לפני הגשה.</li>
            )}
            {cancelledCount > 0 && (
              <li>ℹ {cancelledCount} מסמכים מבוטלים הוחרגו מהספירה.</li>
            )}
            <li>ℹ סכומים מוצגים במטבע ראשי (₪ ILS). מסמכים במטבעות אחרים (אם קיימים) אינם מנורמלים.</li>
            <li>ℹ בדיקת הסימולטור והגשה לרשות המיסים מתבצעות בנפרד.</li>
          </ul>
        </Section26>

        {/* Footer */}
        <div className="border-t-2 border-black mt-6 pt-3 text-center text-xs text-gray-400">
          <p>הופק ע״י CarsLead — ממשק פתוח 1.31 | סעיף 2.6 | {now}</p>
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---

function getDateRange(run: any): { start: string; end: string } | null {
  if (!run) return null;
  if (run.mode === 'single_year' && run.tax_year) {
    return { start: `${run.tax_year}-01-01`, end: `${run.tax_year}-12-31` };
  }
  if (run.start_date && run.end_date) {
    return { start: run.start_date, end: run.end_date };
  }
  // fallback for resultData
  if (run.tax_year) {
    return { start: `${run.tax_year}-01-01`, end: `${run.tax_year}-12-31` };
  }
  return null;
}

function Section26({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-base border-b border-gray-300 pb-1 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row26({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="font-semibold min-w-[180px] shrink-0">{label}:</span>
      {value ? (
        <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
      ) : (
        <span className="text-gray-400 italic">לא צוין</span>
      )}
    </div>
  );
}
