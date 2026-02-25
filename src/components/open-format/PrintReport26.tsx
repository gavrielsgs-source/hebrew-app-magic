import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Printer, Download, AlertTriangle, Info, ChevronDown } from "lucide-react";
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

/** Normalize key: lowercase, trim, replace hyphens with underscores */
function normalizeKey(key: string): string {
  return key?.toLowerCase().trim().replace(/-/g, '_') || '';
}

export function PrintReport26({ exportRunId, resultData }: PrintReport26Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

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

  // Build effective run context
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

  const dateRange = getDateRange(effectiveRun);

  // Fetch document totals for the export run period
  const { data: docTotals, isLoading: docTotalsLoading } = useQuery({
    queryKey: ['report26-doc-totals', user?.id, exportRunId, dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!dateRange) return [];
      const { data, error } = await supabase
        .from('customer_documents')
        .select('type, amount, status')
        .eq('user_id', user!.id)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!dateRange,
  });

  // Build record counts from export run
  const recordCounts: Record<string, number> = {};
  if (resultData?.recordCounts) {
    Object.assign(recordCounts, resultData.recordCounts);
  } else if (dbCounts) {
    dbCounts.forEach((c: any) => { recordCounts[c.record_type_code] = c.count; });
  }
  const count100C = recordCounts['100C'] || 0;

  // ===================================================================
  // SOURCE OF TRUTH: open_format_doc_type_mappings ONLY
  // ===================================================================
  // Build normalized mapping lookup from user's CONFIGURED mappings (DB)
  const mappingByNormalized: Record<string, { code: string; description?: string; enabled: boolean; originalKey: string }> = {};
  const dbMappingsList = mappings || [];
  dbMappingsList.forEach((m: any) => {
    const norm = normalizeKey(m.internal_type);
    mappingByNormalized[norm] = {
      code: m.tax_authority_code,
      description: m.description,
      enabled: m.enabled,
      originalKey: m.internal_type,
    };
  });

  // Cancelled document policy: status='cancelled' excluded from mapped totals
  const allDocs = docTotals || [];
  const activeDocs = allDocs.filter((d: any) => d.status !== 'cancelled');
  const cancelledDocs = allDocs.filter((d: any) => d.status === 'cancelled');
  const cancelledCount = cancelledDocs.length;
  // Count how many cancelled docs WOULD have been mapped (for cross-check)
  const cancelledMappedCount = cancelledDocs.filter((d: any) => {
    const norm = normalizeKey(d.type);
    const mapping = mappingByNormalized[norm];
    return mapping && mapping.enabled && mapping.code !== '000';
  }).length;

  // ===================================================================
  // AGGREGATION: only from actual documents + configured mappings
  // No pre-populated catalog rows. Only rows with data or explicit mapping.
  // ===================================================================
  const aggregated: Record<string, { code: string; label: string; managed: boolean; count: number; amount: number }> = {};

  // Pre-populate rows from DB mappings (so mapped types with 0 docs still show as managed)
  dbMappingsList.forEach((m: any) => {
    if (m.enabled && m.tax_authority_code && m.tax_authority_code !== '000') {
      const code = m.tax_authority_code;
      if (!aggregated[code]) {
        aggregated[code] = { code, label: m.description || m.internal_type, managed: true, count: 0, amount: 0 };
      } else {
        aggregated[code].managed = true;
      }
    }
  });

  // Track matched vs unmapped vs excluded-000
  const unmappedTypes = new Set<string>();
  const unmappedTypeCounts: Record<string, { count: number; amount: number }> = {};
  const matchedTypeCounts: Record<string, { count: number; amount: number; code: string }> = {};
  const excluded000Types: Record<string, { count: number; amount: number }> = {};

  activeDocs.forEach((doc: any) => {
    const rawType = doc.type;
    const normType = normalizeKey(rawType);
    const mapping = mappingByNormalized[normType];

    if (mapping) {
      if (mapping.code === '000' || !mapping.enabled) {
        // Mapped to 000 or disabled = explicitly excluded
        if (!excluded000Types[rawType]) excluded000Types[rawType] = { count: 0, amount: 0 };
        excluded000Types[rawType].count++;
        excluded000Types[rawType].amount += Number(doc.amount || 0);
      } else {
        // Mapped and enabled — count it
        const code = mapping.code;
        if (!aggregated[code]) {
          aggregated[code] = { code, label: mapping.description || rawType, managed: true, count: 0, amount: 0 };
        }
        aggregated[code].count++;
        aggregated[code].amount += Number(doc.amount || 0);
        aggregated[code].managed = true;

        if (!matchedTypeCounts[rawType]) matchedTypeCounts[rawType] = { count: 0, amount: 0, code };
        matchedTypeCounts[rawType].count++;
        matchedTypeCounts[rawType].amount += Number(doc.amount || 0);
      }
    } else {
      // No mapping at all = unmapped
      unmappedTypes.add(rawType);
      if (!unmappedTypeCounts[rawType]) unmappedTypeCounts[rawType] = { count: 0, amount: 0 };
      unmappedTypeCounts[rawType].count++;
      unmappedTypeCounts[rawType].amount += Number(doc.amount || 0);
    }
  });

  // All unique internal types in period
  const allInternalTypes = [...new Set((docTotals || []).map((d: any) => d.type))];

  // Totals
  const sortedRows = Object.values(aggregated).sort((a, b) => a.code.localeCompare(b.code));
  const totalMappedCount = sortedRows.reduce((s, r) => s + r.count, 0);
  const totalMappedAmount = sortedRows.reduce((s, r) => s + r.amount, 0);
  const unmappedTotalCount = Object.values(unmappedTypeCounts).reduce((s, v) => s + v.count, 0);
  const unmappedTotalAmount = Object.values(unmappedTypeCounts).reduce((s, v) => s + v.amount, 0);
  const excluded000TotalCount = Object.values(excluded000Types).reduce((s, v) => s + v.count, 0);

  // Cross-check formula (SUBTRACTION based):
  // mapped_raw = totalMappedCount (active, mapped, enabled, code!=000)
  //            + cancelledMappedCount (cancelled docs that WOULD have been mapped)
  // net_included = mapped_raw - cancelledMappedCount - unmapped - excluded000
  // Compare: count100C vs net_included
  const mappedRaw = totalMappedCount + cancelledMappedCount;
  const netIncluded = mappedRaw - cancelledMappedCount - unmappedTotalCount - excluded000TotalCount;
  const crossCheckPass = count100C === netIncluded;
  const crossCheckFormula = `net_included = mapped_raw(${mappedRaw}) - cancelled(${cancelledMappedCount}) - unmapped(${unmappedTotalCount}) - excluded_000(${excluded000TotalCount}) = ${netIncluded}`;

  // Debug logging
  console.group('[Report 2.6 Debug]');
  console.log('Export Run ID:', exportRunId);
  console.log('User ID:', user?.id);
  console.log('Date Range:', dateRange);
  console.log('DB Mappings loaded:', dbMappingsList.length);
  console.log('DB Mapping keys:', dbMappingsList.map((m: any) => `${m.internal_type}→${m.tax_authority_code}(${m.enabled ? 'on' : 'off'})`));
  console.log('Total docs in period:', (docTotals || []).length, '| Active:', activeDocs.length, '| Cancelled:', cancelledCount);
  console.log('Internal doc types found:', allInternalTypes);
  console.log('Matched types:', matchedTypeCounts);
  console.log('Unmatched types:', unmappedTypeCounts);
  console.log('Excluded (000/disabled):', excluded000Types);
  console.log('Cross-check formula:', crossCheckFormula);
  console.groupEnd();

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

      {/* No mappings at all - critical warning */}
      {dbMappingsList.length === 0 && activeDocs.length > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ לא הוגדרו מיפויי סוגי מסמכים כלל!</strong>
            <p className="text-sm mt-1">
              נמצאו {activeDocs.length} מסמכים פעילים בטווח אך אין מיפוי לאף סוג מסמך.
              כל המסמכים מוחרגים מהסיכום. יש להגדיר מיפויים בטאב "מיפוי מסמכים".
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Unmapped types warning */}
      {unmappedTypes.size > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ סוגי מסמכים ללא מיפוי (חוסם!):</strong>
            <ul className="mt-1 mr-4 list-disc text-sm">
              {Object.entries(unmappedTypeCounts).map(([type, info]) => (
                <li key={type}>
                  <code>{type}</code> — {info.count} מסמכים, סכום ₪{info.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm">מסמכים אלו <strong>לא נכללים</strong> בסיכום. יש להוסיף מיפוי בטאב "מיפוי מסמכים".</p>
          </AlertDescription>
        </Alert>
      )}

      {activeDocs.length === 0 && (
        <Alert className="print:hidden">
          <Info className="h-4 w-4" />
          <AlertDescription>
            לא נמצאו מסמכים פעילים בטווח התאריכים של ריצת הייצוא הנבחרת ({dateRange?.start} — {dateRange?.end}).
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Debug Panel */}
      <Collapsible open={debugOpen} onOpenChange={setDebugOpen} className="print:hidden">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${debugOpen ? 'rotate-180' : ''}`} />
            🔍 מידע דיבאג (2.6)
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="bg-muted/50 border rounded p-3 text-xs font-mono space-y-1 mt-1">
            <div><strong>Export Run ID:</strong> {exportRunId}</div>
            <div><strong>User ID:</strong> {user?.id}</div>
            <div><strong>Date Range:</strong> {dateRange ? `${dateRange.start} → ${dateRange.end}` : 'N/A'}</div>
            <div><strong>Mode:</strong> {mode}</div>
            <div><strong>DB Mappings loaded:</strong> {dbMappingsList.length}</div>
            <div><strong>DB Mapping details:</strong></div>
            {dbMappingsList.length > 0 ? (
              <ul className="mr-4 list-disc">
                {dbMappingsList.map((m: any) => (
                  <li key={m.id || m.internal_type}>
                    {m.internal_type} → {m.tax_authority_code} ({m.enabled ? 'enabled' : 'disabled'}) {m.description && `"${m.description}"`}
                  </li>
                ))}
              </ul>
            ) : <div className="text-red-600">(no mappings configured!)</div>}
            <div><strong>Normalized keys:</strong> {Object.keys(mappingByNormalized).join(', ') || '(none)'}</div>
            <div><strong>Total docs in period:</strong> {(docTotals || []).length}</div>
            <div><strong>Active docs:</strong> {activeDocs.length}</div>
            <div><strong>Cancelled (excluded):</strong> {cancelledCount}</div>
            <div><strong>Internal types found:</strong> {allInternalTypes.join(', ') || '(none)'}</div>
            <div className="text-green-700"><strong>Matched:</strong> {Object.entries(matchedTypeCounts).map(([t, v]) => `${t}→${v.code}(${v.count})`).join(', ') || '(none)'}</div>
            <div className="text-red-700"><strong>Unmatched:</strong> {Object.entries(unmappedTypeCounts).map(([t, v]) => `${t}(${v.count})`).join(', ') || '(none)'}</div>
            <div className="text-amber-700"><strong>Excluded (000/disabled):</strong> {Object.entries(excluded000Types).map(([t, v]) => `${t}(${v.count})`).join(', ') || '(none)'}</div>
            <div className="border-t border-muted pt-1 mt-1">
              <strong>Cross-check formula:</strong>
              <div className="text-blue-700">{crossCheckFormula}</div>
            </div>
            <div><strong>100C from export:</strong> {count100C}</div>
            <div><strong>Mapped included total:</strong> {totalMappedCount}</div>
            <div><strong>Unmapped total:</strong> {unmappedTotalCount}</div>
            <div><strong>Excluded 000 total:</strong> {excluded000TotalCount}</div>
          </div>
        </CollapsibleContent>
      </Collapsible>

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
          <Row26 label="טווח תאריכים" value={dateRange ? `${dateRange.start} — ${dateRange.end}` : undefined} />
          <Row26 label="סטטוס הפקה" value={status === 'success' ? '✔ הצלחה' : status === 'failed' ? '✘ נכשל' : status} />
          <Row26 label="נתיב שמירה לוגי" value={logicalPath} mono />
        </Section26>

        {/* C) Document Totals Table — ONLY from configured mappings */}
        <Section26 title="סיכום מסמכים לפי סוג מסמך (מיפויים מוגדרים)">
          {docTotalsLoading ? (
            <p className="text-gray-500">טוען נתוני מסמכים...</p>
          ) : (
            <>
              {sortedRows.length === 0 ? (
                <p className="text-gray-500 italic">אין מיפויים מוגדרים — אין שורות להציג. הגדר מיפויים בטאב "מיפוי מסמכים".</p>
              ) : (
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
                      <tr key={row.code}>
                        <td className="border border-gray-300 px-2 py-1 font-mono text-center">{row.code}</td>
                        <td className="border border-gray-300 px-2 py-1">{row.label}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold text-green-700">כן</td>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold">{row.count}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.amount > 0 ? `₪${row.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="border border-gray-400 px-2 py-1.5" colSpan={3}>סה״כ (ממופים ומנוהלים)</td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">{totalMappedCount}</td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {totalMappedAmount > 0 ? `₪${totalMappedAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Excluded 000 / disabled types */}
              {Object.keys(excluded000Types).length > 0 && (
                <div className="border border-amber-300 bg-amber-50 rounded p-2 mb-2">
                  <p className="font-bold text-amber-700 text-sm mb-1">סוגי מסמכים ממופים לקוד 000 / מושבתים (לא מיוצאים):</p>
                  <ul className="text-xs mr-4 list-disc">
                    {Object.entries(excluded000Types).map(([type, info]) => (
                      <li key={type}><code>{type}</code> — {info.count} מסמכים, ₪{info.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unmapped types inline in report */}
              {unmappedTypes.size > 0 && (
                <div className="border border-red-300 bg-red-50 rounded p-2 mb-2">
                  <p className="font-bold text-red-700 text-sm mb-1">⚠ סוגי מסמכים ללא מיפוי (לא נכללו בסיכום):</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-red-200 px-2 py-1 text-right">סוג פנימי</th>
                        <th className="border border-red-200 px-2 py-1 text-center">כמות</th>
                        <th className="border border-red-200 px-2 py-1 text-center">סכום</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(unmappedTypeCounts).map(([type, info]) => (
                        <tr key={type}>
                          <td className="border border-red-200 px-2 py-1 font-mono">{type}</td>
                          <td className="border border-red-200 px-2 py-1 text-center">{info.count}</td>
                          <td className="border border-red-200 px-2 py-1 text-center">₪{info.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-red-600 mt-1">יש להגדיר מיפוי בטאב "מיפוי מסמכים" כדי לכלול מסמכים אלו.</p>
                </div>
              )}

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
            <Row26 label='סה״כ מסמכים ממופים (גולמי, כולל מבוטלים)' value={mappedRaw.toString()} />
            <Row26 label='סה״כ מסמכים ממופים (פעילים בלבד)' value={totalMappedCount.toString()} />
            {cancelledMappedCount > 0 && (
              <Row26 label='מסמכים מבוטלים ממופים (הופחתו)' value={`-${cancelledMappedCount}`} />
            )}
            {unmappedTotalCount > 0 && (
              <Row26 label='מסמכים ללא מיפוי (הופחתו)' value={`-${unmappedTotalCount} (${Array.from(unmappedTypes).join(', ')})`} />
            )}
            {excluded000TotalCount > 0 && (
              <Row26 label='מסמכים ממופים ל-000/מושבתים (הופחתו)' value={`-${excluded000TotalCount}`} />
            )}
            {cancelledCount > 0 && (
              <Row26 label='סה״כ מסמכים מבוטלים בתקופה' value={cancelledCount.toString()} />
            )}
            <Row26 label='סה״כ נטו לייצוא (net_included)' value={netIncluded.toString()} />
            <div className="bg-gray-50 border rounded p-2 mt-2 text-xs font-mono">
              <strong>נוסחת הצלבה:</strong><br />
              net_included = mapped_raw({mappedRaw}) − cancelled({cancelledMappedCount}) − unmapped({unmappedTotalCount}) − excluded_000({excluded000TotalCount}) = <strong>{netIncluded}</strong><br />
              100C = <strong>{count100C}</strong><br />
              100C({count100C}) {crossCheckPass ? '==' : '!='} net_included({netIncluded}) → <strong>{crossCheckPass ? 'התאמה ✔' : 'אי-התאמה ✘'}</strong>
            </div>
            <div className="flex items-baseline gap-2 py-0.5 mt-2">
              <span className="font-semibold min-w-[180px] shrink-0">התאמה:</span>
              {crossCheckPass ? (
                <span className="text-green-700 font-bold">✔ התאמה: כן — 100C({count100C}) = net_included({netIncluded})</span>
              ) : count100C > 0 && totalMappedCount === 0 ? (
                <span className="text-red-600 font-bold">
                  ✘ אין מסמכים ממופים — {unmappedTotalCount} חסרי מיפוי, 100C={count100C}. יש להגדיר מיפויים.
                </span>
              ) : (
                <span className="text-red-600 font-bold">
                  ✘ אי-התאמה — 100C: {count100C}, net_included: {netIncluded}, פער: {Math.abs(count100C - netIncluded)}
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
            </p>
          </div>
        </Section26>

        {/* F) Warnings */}
        <Section26 title="הערות ואזהרות">
          <ul className="space-y-1 text-xs text-gray-600">
            {unmappedTypes.size > 0 && (
              <li className="text-red-700 font-bold text-sm">
                ⚠ חוסם! סוגי מסמכים ללא מיפוי:
                {Object.entries(unmappedTypeCounts).map(([t, info]) => (
                  <span key={t}> "{t}" ({info.count} מסמכים, ₪{info.amount.toLocaleString('he-IL')})</span>
                ))}
                {' — '}לא נכללו בסיכום. יש להגדיר מיפוי בטאב "מיפוי מסמכים".
              </li>
            )}
            {dbMappingsList.length === 0 && (
              <li className="text-red-700 font-bold text-sm">
                ⚠ לא הוגדרו מיפויי סוגי מסמכים כלל — כל המסמכים יוחרגו מהדוח.
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
            <li className="text-xs text-gray-400 mt-2">
              🔍 מיפויים מוגדרים: {dbMappingsList.length} | מסמכים פעילים: {activeDocs.length} | ממופים: {totalMappedCount} | לא ממופים: {unmappedTotalCount} | 000/מושבתים: {excluded000TotalCount}
            </li>
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
