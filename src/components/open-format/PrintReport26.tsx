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

  // Fetch debug manifest from storage — contains exact exported document IDs and mappings used
  const { data: manifestData, isLoading: manifestLoading } = useQuery({
    queryKey: ['report26-manifest', exportRunId],
    queryFn: async () => {
      const { data: artifacts, error: artErr } = await supabase
        .from('open_format_artifacts')
        .select('storage_path')
        .eq('export_run_id', exportRunId)
        .eq('artifact_type', 'DEBUG_MANIFEST')
        .single();
      if (artErr || !artifacts?.storage_path) return null;
      const { data: fileData, error: dlErr } = await supabase.storage
        .from('open-format-exports')
        .download(artifacts.storage_path);
      if (dlErr || !fileData) return null;
      const text = await fileData.text();
      return JSON.parse(text);
    },
    enabled: !!exportRunId,
  });

  const exportedDocIds: string[] = manifestData?.documents_included || [];
  const exportMappingsUsed: Record<string, string> = manifestData?.doc_type_mappings_used || {};

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

  // Fetch the EXACT exported documents by their IDs (source of truth for 2.6 totals)
  const { data: exportedDocs, isLoading: exportedDocsLoading } = useQuery({
    queryKey: ['report26-exported-docs', exportRunId, exportedDocIds.length],
    queryFn: async () => {
      if (exportedDocIds.length === 0) return [];
      const allDocs: any[] = [];
      const batchSize = 100;
      for (let i = 0; i < exportedDocIds.length; i += batchSize) {
        const batch = exportedDocIds.slice(i, i + batchSize);
        const { data: custDocs } = await supabase
          .from('customer_documents')
          .select('id, type, amount, status')
          .in('id', batch);
        if (custDocs) allDocs.push(...custDocs);
        const { data: taxDocs } = await supabase
          .from('tax_invoices')
          .select('id, title, total_amount, vat_amount, subtotal')
          .in('id', batch);
        if (taxDocs) {
          allDocs.push(...taxDocs.map(t => ({
            id: t.id,
            type: 'tax-invoice',
            amount: t.total_amount || 0,
            status: 'active',
            _source: 'tax_invoices',
          })));
        }
      }
      return allDocs;
    },
    enabled: exportedDocIds.length > 0,
  });

  // Informational: ALL docs in period (for context, not for cross-check)
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
  const count100C = recordCounts['100C'] || recordCounts['C100'] || 0;

  // ===================================================================
  // SOURCE OF TRUTH: Exact exported document set from debug manifest
  // ===================================================================
  const effectiveMappings = exportMappingsUsed;
  const effectiveMappingsCount = Object.keys(effectiveMappings).length;
  const dbMappingsList = mappings || [];

  // ===================================================================
  // AGGREGATION: from exact exported documents only
  // ===================================================================
  const aggregated: Record<string, { code: string; label: string; managed: boolean; count: number; amount: number }> = {};
  const exportedDocSet = exportedDocs || [];

  // Pre-populate rows from effective mappings used in this export run
  Object.entries(effectiveMappings).forEach(([internalType, code]) => {
    if (code && code !== '000') {
      if (!aggregated[code]) {
        aggregated[code] = { code, label: internalType, managed: true, count: 0, amount: 0 };
      }
    }
  });

  // Count exported docs
  exportedDocSet.forEach((doc: any) => {
    const rawType = doc.type || 'tax-invoice';
    const code = effectiveMappings[rawType] || effectiveMappings[normalizeKey(rawType)];
    if (code && code !== '000') {
      if (!aggregated[code]) {
        aggregated[code] = { code, label: rawType, managed: true, count: 0, amount: 0 };
      }
      aggregated[code].count++;
      aggregated[code].amount += Number(doc.amount || 0);
    }
  });

  // Informational: period context
  const allDocsInPeriod = docTotals || [];
  const cancelledInPeriod = allDocsInPeriod.filter((d: any) => d.status === 'cancelled').length;
  const activeInPeriod = allDocsInPeriod.length - cancelledInPeriod;
  const allInternalTypes = [...new Set(allDocsInPeriod.map((d: any) => d.type))];

  // Informational: unmapped types in period
  const unmappedTypes = new Set<string>();
  const unmappedTypeCounts: Record<string, { count: number; amount: number }> = {};
  allDocsInPeriod
    .filter((d: any) => d.status !== 'cancelled')
    .forEach((doc: any) => {
      const rawType = doc.type;
      const normType = normalizeKey(rawType);
      const code = effectiveMappings[rawType] || effectiveMappings[normType];
      const dbMapping = dbMappingsList.find((m: any) => normalizeKey(m.internal_type) === normType);
      if (!code && !dbMapping) {
        unmappedTypes.add(rawType);
        if (!unmappedTypeCounts[rawType]) unmappedTypeCounts[rawType] = { count: 0, amount: 0 };
        unmappedTypeCounts[rawType].count++;
        unmappedTypeCounts[rawType].amount += Number(doc.amount || 0);
      }
    });

  // Totals
  const sortedRows = Object.values(aggregated).sort((a, b) => a.code.localeCompare(b.code));
  const totalExportedDocs = exportedDocIds.length;
  const totalMappedCount = sortedRows.reduce((s, r) => s + r.count, 0);
  const totalMappedAmount = sortedRows.reduce((s, r) => s + r.amount, 0);
  const unmappedTotalCount = Object.values(unmappedTypeCounts).reduce((s, v) => s + v.count, 0);

  // Cross-check: exported doc IDs count vs 100C count — must be equal
  const crossCheckPass = count100C === totalExportedDocs;
  const crossCheckFormula = `100C(${count100C}) ?= exported_doc_ids(${totalExportedDocs})`;

  // Debug logging
  console.group('[Report 2.6 Debug]');
  console.log('Export Run ID:', exportRunId);
  console.log('User ID:', user?.id);
  console.log('Date Range:', dateRange);
  console.log('Manifest loaded:', !!manifestData);
  console.log('Exported doc IDs count:', exportedDocIds.length);
  console.log('Effective mappings used in export:', effectiveMappings);
  console.log('DB Mappings loaded:', dbMappingsList.length);
  console.log('Total docs in period:', allDocsInPeriod.length, '| Active:', activeInPeriod, '| Cancelled:', cancelledInPeriod);
  console.log('Internal doc types found:', allInternalTypes);
  console.log('Unmatched types in period:', unmappedTypeCounts);
  console.log('Cross-check:', crossCheckFormula, '→', crossCheckPass ? 'PASS' : 'FAIL');
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

  const isLoading = manifestLoading || exportedDocsLoading || docTotalsLoading;

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

      {/* No manifest — critical warning */}
      {!manifestLoading && !manifestData && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ לא נמצא קובץ manifest עבור ריצת ייצוא זו!</strong>
            <p className="text-sm mt-1">
              דוח 2.6 דורש את קובץ ה-manifest שנוצר בזמן הייצוא כדי להציג נתונים מדויקים.
              ייתכן שהייצוא נכשל או שנוצר בגרסה ישנה.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Unmapped types warning (informational) */}
      {unmappedTypes.size > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ סוגי מסמכים ללא מיפוי בתקופה (לא יוצאו):</strong>
            <ul className="mt-1 mr-4 list-disc text-sm">
              {Object.entries(unmappedTypeCounts).map(([type, info]) => (
                <li key={type}>
                  <code>{type}</code> — {info.count} מסמכים, סכום ₪{info.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm">מסמכים אלו <strong>לא נכללו בייצוא</strong>. לכלילה בעתיד — הגדר מיפוי בטאב "מיפוי מסמכים".</p>
          </AlertDescription>
        </Alert>
      )}

      {totalExportedDocs === 0 && !isLoading && (
        <Alert className="print:hidden">
          <Info className="h-4 w-4" />
          <AlertDescription>
            לא נמצאו מסמכים מיוצאים עבור ריצת הייצוא הנבחרת.
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
            <div className="border-t border-muted pt-1 mt-1">
              <strong>📦 Manifest Data (Source of Truth):</strong>
            </div>
            <div><strong>Manifest loaded:</strong> {manifestData ? '✔ כן' : '✘ לא'}</div>
            <div><strong>Exported doc IDs count:</strong> {exportedDocIds.length}</div>
            <div><strong>Fetched exported docs:</strong> {exportedDocSet.length}</div>
            <div><strong>Effective mappings used in export ({effectiveMappingsCount}):</strong></div>
            {effectiveMappingsCount > 0 ? (
              <ul className="mr-4 list-disc">
                {Object.entries(effectiveMappings).map(([type, code]) => (
                  <li key={type}>{type} → {code}</li>
                ))}
              </ul>
            ) : <div className="text-red-600">(no mappings in manifest)</div>}
            <div className="border-t border-muted pt-1 mt-1">
              <strong>📋 DB Mappings (current config, {dbMappingsList.length}):</strong>
            </div>
            {dbMappingsList.length > 0 ? (
              <ul className="mr-4 list-disc">
                {dbMappingsList.map((m: any) => (
                  <li key={m.id || m.internal_type}>
                    {m.internal_type} → {m.tax_authority_code} ({m.enabled ? 'enabled' : 'disabled'})
                  </li>
                ))}
              </ul>
            ) : <div className="text-amber-600">(no DB mappings configured)</div>}
            <div className="border-t border-muted pt-1 mt-1">
              <strong>📊 Period info (informational):</strong>
            </div>
            <div><strong>Total docs in period (customer_documents):</strong> {allDocsInPeriod.length}</div>
            <div><strong>Active in period:</strong> {activeInPeriod}</div>
            <div><strong>Cancelled in period:</strong> {cancelledInPeriod}</div>
            <div><strong>Internal types found:</strong> {allInternalTypes.join(', ') || '(none)'}</div>
            <div className="text-red-700"><strong>Unmapped in period:</strong> {Object.entries(unmappedTypeCounts).map(([t, v]) => `${t}(${v.count})`).join(', ') || '(none)'}</div>
            <div className="border-t border-muted pt-1 mt-1">
              <strong>Cross-check formula:</strong>
              <div className="text-blue-700">{crossCheckFormula} → {crossCheckPass ? '✔ PASS' : '✘ FAIL'}</div>
            </div>
            <div><strong>100C from export:</strong> {count100C}</div>
            <div><strong>Exported doc IDs:</strong> {totalExportedDocs}</div>
            <div><strong>Aggregated from exported docs:</strong> {totalMappedCount}</div>
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
          <Row26 label="מקור נתונים" value={manifestData ? 'manifest (מדויק)' : 'חישוב עצמאי (לא מדויק)'} />
        </Section26>

        {/* C) Document Totals Table — from exact exported documents */}
        <Section26 title="סיכום מסמכים לפי סוג מסמך (מתוך הייצוא בפועל)">
          {isLoading ? (
            <p className="text-gray-500">טוען נתוני מסמכים...</p>
          ) : (
            <>
              {sortedRows.length === 0 ? (
                <p className="text-gray-500 italic">אין מסמכים מיוצאים בריצה זו.</p>
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
                      <td className="border border-gray-400 px-2 py-1.5" colSpan={3}>סה״כ (מיוצאים)</td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">{totalMappedCount}</td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {totalMappedAmount > 0 ? `₪${totalMappedAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Unmapped types in period (informational) */}
              {unmappedTypes.size > 0 && (
                <div className="border border-red-300 bg-red-50 rounded p-2 mb-2">
                  <p className="font-bold text-red-700 text-sm mb-1">⚠ סוגי מסמכים ללא מיפוי בתקופה (לא נכללו בייצוא):</p>
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
                  <p className="text-xs text-red-600 mt-1">יש להגדיר מיפוי בטאב "מיפוי מסמכים" כדי לכלול מסמכים אלו בייצואים עתידיים.</p>
                </div>
              )}

              {cancelledInPeriod > 0 && (
                <p className="text-xs text-gray-500">
                  * {cancelledInPeriod} מסמכים מבוטלים בתקופה (הייצוא מטפל בהם לפי הגדרות הייצוא).
                </p>
              )}

              {/* Period context (informational) */}
              <div className="bg-gray-50 border rounded p-2 mt-2 text-xs">
                <strong>הקשר תקופתי (מידע רקע):</strong>
                <span className="mr-2">סה״כ מסמכים בתקופה: {allDocsInPeriod.length}</span>
                <span className="mr-2">| פעילים: {activeInPeriod}</span>
                <span className="mr-2">| מבוטלים: {cancelledInPeriod}</span>
                <span className="mr-2">| ללא מיפוי: {unmappedTotalCount}</span>
              </div>
            </>
          )}
        </Section26>

        {/* D) Cross-check */}
        <Section26 title="בדיקת הצלבה">
          <div className="space-y-1 text-sm">
            <Row26 label="כמות רשומות 100C בייצוא" value={count100C.toString()} />
            <Row26 label='כמות מסמכים מיוצאים (מתוך manifest)' value={totalExportedDocs.toString()} />
            <Row26 label='כמות מסמכים מאוגדים בדוח' value={totalMappedCount.toString()} />
            <div className="bg-gray-50 border rounded p-2 mt-2 text-xs font-mono">
              <strong>נוסחת הצלבה:</strong><br />
              100C = <strong>{count100C}</strong> (רשומות C100 בקובץ BKMVDATA)<br />
              exported_doc_ids = <strong>{totalExportedDocs}</strong> (מזהי מסמכים ב-manifest)<br />
              100C({count100C}) {crossCheckPass ? '==' : '!='} exported_doc_ids({totalExportedDocs}) → <strong>{crossCheckPass ? 'התאמה ✔' : 'אי-התאמה ✘'}</strong>
            </div>
            <div className="flex items-baseline gap-2 py-0.5 mt-2">
              <span className="font-semibold min-w-[180px] shrink-0">התאמה:</span>
              {crossCheckPass ? (
                <span className="text-green-700 font-bold">✔ התאמה: כן — 100C({count100C}) = exported_docs({totalExportedDocs})</span>
              ) : !manifestData ? (
                <span className="text-amber-600 font-bold">
                  ⚠ אין manifest — לא ניתן לבצע הצלבה מדויקת. הרץ ייצוא מחדש.
                </span>
              ) : (
                <span className="text-red-600 font-bold">
                  ✘ אי-התאמה — 100C: {count100C}, exported_docs: {totalExportedDocs}, פער: {Math.abs(count100C - totalExportedDocs)}
                </span>
              )}
            </div>
          </div>
        </Section26>

        {/* E) Effective Mappings for this Run */}
        <Section26 title="מיפויים שהופעלו בריצה זו">
          {effectiveMappingsCount > 0 ? (
            <table className="w-full border-collapse text-xs mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1 text-right">סוג פנימי</th>
                  <th className="border border-gray-400 px-2 py-1 text-center w-20">קוד מס</th>
                  <th className="border border-gray-400 px-2 py-1 text-center w-20">מקור</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(effectiveMappings).map(([type, code]) => {
                  const dbMatch = dbMappingsList.find((m: any) => normalizeKey(m.internal_type) === normalizeKey(type));
                  return (
                    <tr key={type}>
                      <td className="border border-gray-300 px-2 py-1 font-mono">{type}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-mono">{code}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {dbMatch ? 'DB' : 'ברירת מחדל'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic text-xs">אין נתוני מיפויים ב-manifest.</p>
          )}
        </Section26>

        {/* F) Accounting Placeholder */}
        <Section26 title="מאזן בוחן תנועות (הנהלת חשבונות)">
          <div className="bg-gray-50 border border-gray-300 rounded p-4 text-center">
            <p className="font-semibold text-gray-500">טרם מיושם</p>
            <p className="text-xs text-gray-400 mt-1">
              מאזן בוחן ייושם כאשר מודול הנהלת חשבונות מלא יהיה זמין במערכת.
            </p>
          </div>
        </Section26>

        {/* G) Warnings */}
        <Section26 title="הערות ואזהרות">
          <ul className="space-y-1 text-xs text-gray-600">
            {!manifestData && (
              <li className="text-red-700 font-bold text-sm">
                ⚠ קובץ manifest לא נמצא — הנתונים עלולים להיות לא מדויקים. הרץ ייצוא מחדש.
              </li>
            )}
            {unmappedTypes.size > 0 && (
              <li className="text-amber-700 text-sm">
                ℹ סוגי מסמכים ללא מיפוי בתקופה:
                {Object.entries(unmappedTypeCounts).map(([t, info]) => (
                  <span key={t}> "{t}" ({info.count})</span>
                ))}
                {' — '}לא נכללו בייצוא. הגדר מיפוי בטאב "מיפוי מסמכים".
              </li>
            )}
            {!config?.software_registration_number && (
              <li>⚠ מספר רישום תוכנה ברשות המיסים חסר — נדרש לפני הגשה.</li>
            )}
            <li>ℹ סכומים מוצגים במטבע ראשי (₪ ILS).</li>
            <li>ℹ בדיקת הסימולטור והגשה לרשות המיסים מתבצעות בנפרד.</li>
            <li className="text-xs text-gray-400 mt-2">
              🔍 מיפויים בייצוא: {effectiveMappingsCount} | מסמכים מיוצאים: {totalExportedDocs} | 100C: {count100C} | מאוגדים: {totalMappedCount}
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
