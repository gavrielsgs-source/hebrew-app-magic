import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Printer, Download, AlertTriangle, Info, ChevronDown, Wand2 } from "lucide-react";
import { useComplianceConfig, useExportRunCounts, useDocTypeMappings, useSaveDocTypeMapping } from "@/hooks/use-open-format";
import type { ExportRunResult } from "@/hooks/use-open-format";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

/**
 * Default mapping suggestions for common internal document types.
 * Used to seed mappings when user has none configured.
 */
const DEFAULT_MAPPING_SUGGESTIONS: Record<string, { code: string; description: string }> = {
  'invoice': { code: '100', description: 'חשבונית מס' },
  'tax_invoice': { code: '100', description: 'חשבונית מס' },
  'tax_invoice_receipt': { code: '200', description: 'חשבונית מס / קבלה' },
  'receipt': { code: '300', description: 'קבלה' },
  'credit_note': { code: '400', description: 'חשבונית זיכוי' },
  'credit_invoice': { code: '400', description: 'חשבונית זיכוי' },
  'order': { code: '500', description: 'הזמנה' },
  'delivery_note': { code: '600', description: 'תעודת משלוח' },
  'quote': { code: '700', description: 'הצעת מחיר' },
  'price_quote': { code: '700', description: 'הצעת מחיר' },
  'contract': { code: '900', description: 'חשבון עסקה' },
  'sale_agreement': { code: '900', description: 'חשבון עסקה' },
  'agreement': { code: '900', description: 'חשבון עסקה' },
  'proforma': { code: '900', description: 'חשבון עסקה' },
  'transaction': { code: '900', description: 'חשבון עסקה' },
};

/** Normalize key: lowercase, trim, replace hyphens with underscores */
function normalizeKey(key: string): string {
  return key?.toLowerCase().trim().replace(/-/g, '_') || '';
}

/** Get suggested mapping for an internal type */
function getSuggestedMapping(internalType: string): { code: string; description: string } | null {
  const norm = normalizeKey(internalType);
  return DEFAULT_MAPPING_SUGGESTIONS[norm] || null;
}

export function PrintReport26({ exportRunId, resultData }: PrintReport26Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const { data: config } = useComplianceConfig();
  const { data: mappings } = useDocTypeMappings();
  const { user } = useAuth();
  const saveMapping = useSaveDocTypeMapping();
  const queryClient = useQueryClient();

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

  // === MAPPING RESOLUTION ===
  // Build normalized mapping lookup from user's configured mappings
  const mappingByNormalized: Record<string, { code: string; description?: string; enabled: boolean; originalKey: string }> = {};
  (mappings || []).forEach((m: any) => {
    const norm = normalizeKey(m.internal_type);
    mappingByNormalized[norm] = {
      code: m.tax_authority_code,
      description: m.description,
      enabled: m.enabled,
      originalKey: m.internal_type,
    };
  });

  // Cancelled document policy: status='cancelled' excluded
  const activeDocs = (docTotals || []).filter((d: any) => d.status !== 'cancelled');
  const cancelledCount = (docTotals || []).length - activeDocs.length;

  // Aggregate by tax authority code
  const aggregated: Record<string, { code: string; label: string; managed: boolean; count: number; amount: number }> = {};

  // Init all known types with 0
  KNOWN_TAX_DOC_TYPES.forEach(t => {
    aggregated[t.code] = { code: t.code, label: t.label, managed: false, count: 0, amount: 0 };
  });

  // Mark mapped types as managed
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

  // Track matched vs unmapped
  const unmappedTypes = new Set<string>();
  const unmappedTypeCounts: Record<string, { count: number; amount: number }> = {};
  const matchedTypeCounts: Record<string, { count: number; amount: number; code: string }> = {};

  activeDocs.forEach((doc: any) => {
    const rawType = doc.type;
    const normType = normalizeKey(rawType);
    const mapping = mappingByNormalized[normType];

    if (mapping && mapping.enabled) {
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
    } else {
      unmappedTypes.add(rawType);
      if (!unmappedTypeCounts[rawType]) unmappedTypeCounts[rawType] = { count: 0, amount: 0 };
      unmappedTypeCounts[rawType].count++;
      unmappedTypeCounts[rawType].amount += Number(doc.amount || 0);
    }
  });

  // All unique internal types in period
  const allInternalTypes = [...new Set((docTotals || []).map((d: any) => d.type))];

  // Debug logging
  console.group('[Report 2.6 Debug]');
  console.log('Export Run ID:', exportRunId);
  console.log('User ID:', user?.id);
  console.log('Date Range:', dateRange);
  console.log('Mappings loaded:', (mappings || []).length, mappings);
  console.log('Total docs in period:', (docTotals || []).length, '| Active:', activeDocs.length, '| Cancelled:', cancelledCount);
  console.log('Internal doc types found:', allInternalTypes);
  console.log('Matched types:', matchedTypeCounts);
  console.log('Unmatched types:', unmappedTypeCounts);
  console.log('Normalized mapping keys:', Object.keys(mappingByNormalized));
  console.groupEnd();

  const sortedRows = Object.values(aggregated).sort((a, b) => a.code.localeCompare(b.code));
  const totalDocCount = sortedRows.reduce((s, r) => s + r.count, 0);
  const totalAmount = sortedRows.reduce((s, r) => s + r.amount, 0);
  const unmappedTotalCount = Object.values(unmappedTypeCounts).reduce((s, v) => s + v.count, 0);
  const unmappedTotalAmount = Object.values(unmappedTypeCounts).reduce((s, v) => s + v.amount, 0);

  const now = new Date().toLocaleString('he-IL');
  const status = resultData?.status || effectiveRun?.status || 'unknown';
  const primaryId = resultData?.primaryId || effectiveRun?.primary_id_15 || '—';
  const mode = effectiveRun?.mode || 'single_year';
  const logicalPath = resultData?.logicalPath || effectiveRun?.logical_output_path || '—';

  const missingFields: string[] = [];
  if (!config?.software_registration_number) missingFields.push('מספר רישום תוכנה');
  if (!profile?.company_name) missingFields.push('שם העסק');

  // Seed default mappings for detected unmapped types
  const handleSeedDefaults = async () => {
    setSeeding(true);
    let seeded = 0;
    for (const rawType of Array.from(unmappedTypes)) {
      const suggestion = getSuggestedMapping(rawType);
      if (suggestion) {
        try {
          await saveMapping.mutateAsync({
            internal_type: rawType,
            tax_authority_code: suggestion.code,
            description: suggestion.description,
            enabled: true,
            notes: 'נוצר אוטומטית — יש לבדוק ולאשר',
          });
          seeded++;
        } catch (e) {
          console.error('Failed to seed mapping for', rawType, e);
        }
      }
    }
    // Invalidate to refresh
    queryClient.invalidateQueries({ queryKey: ['open-format-doc-mappings'] });
    queryClient.invalidateQueries({ queryKey: ['report26-doc-totals'] });
    setSeeding(false);
    if (seeded > 0) {
      toast.success(`נוצרו ${seeded} מיפויים ברירת מחדל. יש לרענן את הדוח.`);
    } else {
      toast.info('לא נמצאו הצעות מיפוי מוכרות לסוגים שנמצאו.');
    }
  };

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

      {/* No mappings at all - critical warning with seed action */}
      {(mappings || []).length === 0 && activeDocs.length > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ לא הוגדרו מיפויי סוגי מסמכים כלל!</strong>
            <p className="text-sm mt-1">
              נמצאו {activeDocs.length} מסמכים פעילים בטווח אך אין מיפוי לאף סוג מסמך.
              כל המסמכים מוחרגים מהסיכום. יש להגדיר מיפויים בטאב "מיפוי מסמכים".
            </p>
            {unmappedTypes.size > 0 && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-800 hover:bg-red-50"
                  onClick={handleSeedDefaults}
                  disabled={seeding}
                >
                  <Wand2 className="h-4 w-4 ml-1" />
                  {seeding ? 'יוצר מיפויים...' : 'צור מיפויי ברירת מחדל'}
                </Button>
                <span className="text-xs mr-2">
                  (יצור מיפויים מוצעים עבור: {Array.from(unmappedTypes).join(', ')})
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Unmapped types warning (when some mappings exist but some types are missing) */}
      {(mappings || []).length > 0 && unmappedTypes.size > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠ סוגי מסמכים ללא מיפוי (חוסם!):</strong>
            <ul className="mt-1 mr-4 list-disc text-sm">
              {Object.entries(unmappedTypeCounts).map(([type, info]) => (
                <li key={type}>
                  <code>{type}</code> — {info.count} מסמכים, סכום ₪{info.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                  {getSuggestedMapping(type) && (
                    <span className="text-xs mr-1">(הצעה: קוד {getSuggestedMapping(type)!.code})</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm">מסמכים אלו <strong>לא נכללים</strong> בסיכום. יש להוסיף מיפוי בטאב "מיפוי מסמכים".</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 border-red-300 text-red-800 hover:bg-red-50"
              onClick={handleSeedDefaults}
              disabled={seeding}
            >
              <Wand2 className="h-4 w-4 ml-1" />
              {seeding ? 'יוצר...' : 'צור מיפויי ברירת מחדל'}
            </Button>
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
            <div><strong>Mappings loaded:</strong> {(mappings || []).length}</div>
            <div><strong>Normalized mapping keys:</strong> {Object.keys(mappingByNormalized).join(', ') || '(none)'}</div>
            <div><strong>Total docs in period:</strong> {(docTotals || []).length}</div>
            <div><strong>Active docs:</strong> {activeDocs.length}</div>
            <div><strong>Cancelled (excluded):</strong> {cancelledCount}</div>
            <div><strong>Internal types found:</strong> {allInternalTypes.join(', ') || '(none)'}</div>
            <div className="text-green-700"><strong>Matched types:</strong> {Object.entries(matchedTypeCounts).map(([t, v]) => `${t}→${v.code}(${v.count})`).join(', ') || '(none)'}</div>
            <div className="text-red-700"><strong>Unmatched types:</strong> {Object.entries(unmappedTypeCounts).map(([t, v]) => `${t}(${v.count})`).join(', ') || '(none)'}</div>
            <div><strong>100C from export:</strong> {count100C}</div>
            <div><strong>Mapped total:</strong> {totalDocCount}</div>
            <div><strong>Unmapped total:</strong> {unmappedTotalCount}</div>
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
                    <td className="border border-gray-400 px-2 py-1.5" colSpan={3}>סה״כ (ממופים)</td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">{totalDocCount}</td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                      {totalAmount > 0 ? `₪${totalAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>

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
                        <th className="border border-red-200 px-2 py-1 text-center">הצעת קוד</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(unmappedTypeCounts).map(([type, info]) => {
                        const suggestion = getSuggestedMapping(type);
                        return (
                          <tr key={type}>
                            <td className="border border-red-200 px-2 py-1 font-mono">{type}</td>
                            <td className="border border-red-200 px-2 py-1 text-center">{info.count}</td>
                            <td className="border border-red-200 px-2 py-1 text-center">₪{info.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</td>
                            <td className="border border-red-200 px-2 py-1 text-center">
                              {suggestion ? `${suggestion.code} (${suggestion.description})` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
            <Row26 label='סה״כ מסמכים ממופים בדוח 2.6' value={totalDocCount.toString()} />
            {unmappedTotalCount > 0 && (
              <Row26 label='מסמכים לא ממופים (לא נספרו)' value={`${unmappedTotalCount} (${Array.from(unmappedTypes).join(', ')})`} />
            )}
            {cancelledCount > 0 && (
              <Row26 label='מסמכים מבוטלים (הוחרגו)' value={cancelledCount.toString()} />
            )}
            <div className="flex items-baseline gap-2 py-0.5">
              <span className="font-semibold min-w-[180px] shrink-0">התאמה:</span>
              {(() => {
                const accountedDocs = totalDocCount + unmappedTotalCount + cancelledCount;
                if (count100C === totalDocCount && unmappedTotalCount === 0 && cancelledCount === 0) {
                  return <span className="text-green-700 font-bold">✔ תואם מלא</span>;
                } else if (count100C === totalDocCount && unmappedTotalCount === 0) {
                  return <span className="text-green-700 font-bold">✔ תואם ({cancelledCount} מבוטלים הוחרגו)</span>;
                } else if (count100C === accountedDocs) {
                  return (
                    <span className="text-amber-600 font-bold">
                      ⚠ תואם חלקית — 100C({count100C}) = ממופים({totalDocCount}) + לא ממופים({unmappedTotalCount}) + מבוטלים({cancelledCount})
                    </span>
                  );
                } else if (count100C > 0 && totalDocCount === 0 && unmappedTotalCount > 0) {
                  return (
                    <span className="text-red-600 font-bold">
                      ✘ אין מסמכים ממופים — כל {unmappedTotalCount} המסמכים חסרי מיפוי. 100C={count100C} בייצוא.
                      {cancelledCount > 0 && ` ${cancelledCount} מבוטלים הוחרגו.`}
                      {' '}יש להגדיר מיפויים בטאב "מיפוי מסמכים".
                    </span>
                  );
                } else {
                  return (
                    <span className="text-red-600 font-bold">
                      ✘ אי-התאמה — 100C: {count100C}, ממופים: {totalDocCount}, לא ממופים: {unmappedTotalCount}, מבוטלים: {cancelledCount}
                      {count100C !== accountedDocs && ` (פער: ${Math.abs(count100C - accountedDocs)})`}
                    </span>
                  );
                }
              })()}
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
                ⚠ חוסם! סוגי מסמכים ללא מיפוי:
                {Object.entries(unmappedTypeCounts).map(([t, info]) => (
                  <span key={t}> "{t}" ({info.count} מסמכים, ₪{info.amount.toLocaleString('he-IL')})</span>
                ))}
                {' — '}לא נכללו בסיכום. יש להגדיר מיפוי בטאב "מיפוי מסמכים".
              </li>
            )}
            {(mappings || []).length === 0 && (
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
              🔍 מיפויים: {(mappings || []).length} | פעילים: {activeDocs.length} | ממופים: {Object.keys(matchedTypeCounts).length} סוגים | לא ממופים: {unmappedTypes.size} סוגים
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
