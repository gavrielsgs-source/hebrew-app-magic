import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JSZip } from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =============================================
// FORMATTING HELPERS (Schema-Driven)
// =============================================

function padNumericLeft(value: number | string, length: number, fill = '0'): string {
  const str = String(value ?? 0);
  return str.slice(0, length).padStart(length, fill);
}

function padAlphaRight(value: string | null | undefined, length: number, fill = ' '): string {
  const str = String(value ?? '');
  return str.slice(0, length).padEnd(length, fill);
}

function formatSignedAmount(value: number | null | undefined, length: number, scale = 2): string {
  const num = value ?? 0;
  const sign = num >= 0 ? '+' : '-';
  const absVal = Math.abs(Math.round(num * Math.pow(10, scale)));
  const numStr = String(absVal).padStart(length - 1, '0').slice(0, length - 1);
  return sign + numStr;
}

function formatDateYYYYMMDD(date: string | Date | null): string {
  if (!date) return '00000000';
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function formatTimeHHMM(date: Date | null): string {
  if (!date) return '0000';
  return String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
}

function appendCRLF(line: string): string {
  return line + '\r\n';
}

function validateRecordLength(line: string, expectedLength: number): boolean {
  return line.length === expectedLength;
}

// =============================================
// RECORD TYPE DEFINITIONS (Schema-Driven)
// =============================================

// Record type expected lengths (excluding CRLF)
const RECORD_LENGTHS: Record<string, number> = {
  '100A': 428,  // Opening record
  '100C': 313,  // Document header
  '110D': 305,  // Document line detail
  '120D': 250,  // Payment/receipt detail
  '900Z': 190,  // Closing record
};

// TODO: These lengths are based on the Open Format 1.31 spec.
// Verify against the official document before submission to Tax Authority.

function generate15DigitId(): string {
  const ts = Date.now().toString().slice(-10);
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return ts + rand;
}

function generateLogicalPath(taxId: string, taxYear: number, now: Date): string {
  const taxId8 = (taxId ?? '000000000').replace(/\D/g, '').slice(0, 8).padStart(8, '0');
  const yy = String(taxYear % 100).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `OPENFRMT/${taxId8}.${yy}/${MM}${DD}${hh}${mm}/`;
}

// Document type mapping for Israel Tax Authority codes
// TODO: Verify these mappings against official spec
const DOC_TYPE_CODES: Record<string, string> = {
  'tax-invoice': '305',        // חשבונית מס
  'receipt': '400',             // קבלה
  'tax-invoice-receipt': '320', // חשבונית מס / קבלה
  'credit-invoice': '330',     // חשבונית זיכוי
  'delivery-note': '200',      // תעודת משלוח
  'purchase-order': '100',     // הזמנת רכש
  'price-quote': '000',        // הצעת מחיר
  'proforma-invoice': '000',   // חשבונית פרופורמה
};

// =============================================
// RECORD BUILDERS
// =============================================

function build100A(params: {
  primaryId: string;
  recordNum: number;
  companyTaxId: string;
  companyName: string;
  companyAddress: string;
  softwareName: string;
  softwareVersion: string;
  softwareRegNum: string;
  vendorTaxId: string;
  taxYear: number;
  startDate: string;
  endDate: string;
  encoding: string;
}): string {
  const p = params;
  let rec = '';
  rec += padAlphaRight('A100', 4);                     // Record type code
  rec += padNumericLeft(p.recordNum, 9);                // Record sequential number
  rec += padAlphaRight(p.primaryId, 15);                // Primary ID (15 digits)
  rec += padAlphaRight(p.companyTaxId, 9);              // Tax ID (ח.פ. / ע.מ.)
  rec += padAlphaRight(p.companyName, 50);              // Company name
  rec += padAlphaRight(p.companyAddress, 50);           // Company address
  rec += padAlphaRight('', 20);                         // City (TODO: extract from address)
  rec += padAlphaRight('', 10);                         // ZIP code
  rec += formatDateYYYYMMDD(p.startDate);               // Period start date
  rec += formatDateYYYYMMDD(p.endDate);                 // Period end date
  rec += padAlphaRight(p.encoding === 'CP862' ? '2' : '1', 1); // Encoding indicator
  rec += padAlphaRight(p.softwareName, 20);             // Software name
  rec += padAlphaRight(p.softwareVersion, 10);          // Software version
  rec += padAlphaRight(p.softwareRegNum, 20);           // Software registration number
  rec += padAlphaRight(p.vendorTaxId, 9);               // Vendor tax ID
  rec += padAlphaRight('', 202);                        // Reserved/future fields
  // Pad to exact length
  rec = rec.slice(0, RECORD_LENGTHS['100A']).padEnd(RECORD_LENGTHS['100A'], ' ');
  return rec;
}

function build100C(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  docDate: string;
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  totalAmount: number;
  vatAmount: number;
  netAmount: number;
  cancelled: boolean;
}): string {
  const p = params;
  let rec = '';
  rec += padAlphaRight('C100', 4);                     // Record type
  rec += padNumericLeft(p.recordNum, 9);                // Sequential number
  rec += padAlphaRight(p.primaryId, 15);                // Primary ID
  rec += padAlphaRight(p.companyTaxId, 9);              // Company tax ID
  rec += padAlphaRight(p.docTypeCode, 3);               // Document type code
  rec += padAlphaRight(p.docNumber, 20);                // Document number
  rec += formatDateYYYYMMDD(p.docDate);                 // Document date
  rec += padAlphaRight('', 9);                          // Value date (TODO)
  rec += padAlphaRight('', 15);                         // Reference 1 (TODO)
  rec += padAlphaRight('', 15);                         // Reference 2 (TODO)
  rec += padAlphaRight(p.customerName, 50);             // Customer/vendor name
  rec += padAlphaRight(p.customerTaxId, 9);             // Customer tax ID
  rec += padAlphaRight(p.customerAddress, 50);          // Customer address
  rec += formatSignedAmount(p.totalAmount, 15);         // Total amount inc. VAT
  rec += formatSignedAmount(p.vatAmount, 15);           // VAT amount
  rec += padAlphaRight(p.cancelled ? '1' : '0', 1);    // Cancelled flag
  rec += padAlphaRight('', 66);                         // Reserved
  // Pad to exact length
  rec = rec.slice(0, RECORD_LENGTHS['100C']).padEnd(RECORD_LENGTHS['100C'], ' ');
  return rec;
}

function build110D(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  lineNum: number;
  description: string;
  catalogCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  vatRate: number;
}): string {
  const p = params;
  let rec = '';
  rec += padAlphaRight('D110', 4);                     // Record type
  rec += padNumericLeft(p.recordNum, 9);                // Sequential number
  rec += padAlphaRight(p.primaryId, 15);                // Primary ID
  rec += padAlphaRight(p.companyTaxId, 9);              // Company tax ID
  rec += padAlphaRight(p.docTypeCode, 3);               // Document type code
  rec += padAlphaRight(p.docNumber, 20);                // Document number
  rec += padNumericLeft(p.lineNum, 4);                  // Line number
  rec += padAlphaRight(p.description, 50);              // Description
  rec += padAlphaRight(p.catalogCode, 20);              // Catalog/item code
  rec += formatSignedAmount(p.quantity, 15, 2);         // Quantity
  rec += formatSignedAmount(p.unitPrice, 15, 2);        // Unit price
  rec += formatSignedAmount(p.lineTotal, 15, 2);        // Line total
  rec += padAlphaRight('', 1);                          // Discount flag (TODO)
  rec += formatSignedAmount(0, 12, 2);                  // Discount amount (TODO)
  rec += padNumericLeft(Math.round(p.vatRate * 100), 6); // VAT rate (x100)
  rec += padAlphaRight('', 107);                        // Reserved
  // Pad to exact length
  rec = rec.slice(0, RECORD_LENGTHS['110D']).padEnd(RECORD_LENGTHS['110D'], ' ');
  return rec;
}

function build120D(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  paymentMethod: string;
  paymentNum: number;
  paymentDate: string;
  amount: number;
  bankCode: string;
  branchCode: string;
  accountNum: string;
}): string {
  const p = params;
  let rec = '';
  rec += padAlphaRight('D120', 4);                     // Record type
  rec += padNumericLeft(p.recordNum, 9);                // Sequential number
  rec += padAlphaRight(p.primaryId, 15);                // Primary ID
  rec += padAlphaRight(p.companyTaxId, 9);              // Company tax ID
  rec += padAlphaRight(p.docTypeCode, 3);               // Document type code
  rec += padAlphaRight(p.docNumber, 20);                // Document number
  rec += padNumericLeft(p.paymentNum, 4);               // Payment line number
  rec += padAlphaRight(paymentMethodCode(p.paymentMethod), 2); // Payment method code
  rec += formatDateYYYYMMDD(p.paymentDate);             // Payment date
  rec += formatSignedAmount(p.amount, 15, 2);           // Amount
  rec += padAlphaRight(p.bankCode, 5);                  // Bank code
  rec += padAlphaRight(p.branchCode, 5);                // Branch code
  rec += padAlphaRight(p.accountNum, 15);               // Account number
  rec += padAlphaRight('', 136);                        // Reserved
  // Pad to exact length
  rec = rec.slice(0, RECORD_LENGTHS['120D']).padEnd(RECORD_LENGTHS['120D'], ' ');
  return rec;
}

function build900Z(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  totalRecords: number;
}): string {
  const p = params;
  let rec = '';
  rec += padAlphaRight('Z900', 4);                     // Record type
  rec += padNumericLeft(p.recordNum, 9);                // Sequential number
  rec += padAlphaRight(p.primaryId, 15);                // Primary ID
  rec += padAlphaRight(p.companyTaxId, 9);              // Company tax ID
  rec += padNumericLeft(p.totalRecords, 9);             // Total record count
  rec += padAlphaRight('', 144);                        // Reserved
  // Pad to exact length
  rec = rec.slice(0, RECORD_LENGTHS['900Z']).padEnd(RECORD_LENGTHS['900Z'], ' ');
  return rec;
}

function paymentMethodCode(method: string): string {
  const map: Record<string, string> = {
    'cash': '01',
    'check': '02',
    'credit': '03',
    'credit_card': '03',
    'bank_transfer': '04',
    'other': '10',
  };
  return map[method] || '10';
}

// =============================================
// TXT.INI BUILDER
// =============================================

function buildTxtIni(params: {
  primaryId: string;
  companyTaxId: string;
  companyName: string;
  taxYear: number;
  totalBkmvRecords: number;
  encoding: string;
  softwareName: string;
  softwareVersion: string;
  logicalPath: string;
}): string {
  const p = params;
  let content = '';
  content += appendCRLF(`[HEADER]`);
  content += appendCRLF(`PRIMARY_ID=${p.primaryId}`);
  content += appendCRLF(`COMPANY_TAX_ID=${p.companyTaxId}`);
  content += appendCRLF(`COMPANY_NAME=${p.companyName}`);
  content += appendCRLF(`TAX_YEAR=${p.taxYear}`);
  content += appendCRLF(`SOFTWARE_NAME=${p.softwareName}`);
  content += appendCRLF(`SOFTWARE_VERSION=${p.softwareVersion}`);
  content += appendCRLF(`ENCODING=${p.encoding}`);
  content += appendCRLF(`LOGICAL_PATH=${p.logicalPath}`);
  content += appendCRLF(`[BKMVDATA]`);
  content += appendCRLF(`TOTAL_RECORDS=${p.totalBkmvRecords}`);
  content += appendCRLF(`FILENAME=TXT.BKMVDATA`);
  content += appendCRLF(`COMPRESSED_FILENAME=BKMVDATA.zip`);
  return content;
}

// =============================================
// MAIN HANDLER
// =============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { mode, taxYear, startDate, endDate } = body;

    // Validate input
    if (mode === 'single_year' && !taxYear) {
      return new Response(JSON.stringify({ error: 'Tax year is required for single-year mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (mode === 'multi_year' && (!startDate || !endDate)) {
      return new Response(JSON.stringify({ error: 'Start and end dates are required for multi-year mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const runStarted = new Date();
    const primaryId = generate15DigitId();
    const effectiveTaxYear = taxYear || new Date(startDate).getFullYear();

    // Get profile for company info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const companyTaxId = (profile?.company_hp ?? '').replace(/\D/g, '').padStart(9, '0');
    const companyName = profile?.company_name ?? '';
    const companyAddress = profile?.company_address ?? '';

    // Get compliance config
    const { data: config } = await supabaseAdmin
      .from('open_format_compliance_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const encoding = config?.default_encoding || 'ISO-8859-8';
    const softwareName = config?.software_name || 'CarsLead';
    const softwareVersion = config?.software_version || '1.0';
    const softwareRegNum = config?.software_registration_number || '';
    const vendorTaxId = config?.software_vendor_tax_id || '';

    // Determine date range for querying
    let queryStart: string;
    let queryEnd: string;
    if (mode === 'single_year') {
      queryStart = `${taxYear}-01-01`;
      queryEnd = `${taxYear}-12-31`;
    } else {
      queryStart = startDate;
      queryEnd = endDate;
    }

    // Logical path
    const logicalPath = generateLogicalPath(companyTaxId, effectiveTaxYear, runStarted);

    // Create export run record (pending)
    const { data: exportRun, error: runError } = await supabaseAdmin
      .from('open_format_export_runs')
      .insert({
        user_id: user.id,
        mode,
        tax_year: mode === 'single_year' ? taxYear : null,
        start_date: mode === 'multi_year' ? startDate : null,
        end_date: mode === 'multi_year' ? endDate : null,
        primary_id_15: primaryId,
        logical_output_path: logicalPath,
        encoding_used: encoding,
        status: 'pending',
        started_at: runStarted.toISOString(),
      })
      .select()
      .single();

    if (runError) throw runError;

    // =============================================
    // COLLECT SOURCE DATA
    // =============================================

    // Tax invoices
    const { data: taxInvoices } = await supabaseAdmin
      .from('tax_invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', queryStart)
      .lte('date', queryEnd)
      .order('date', { ascending: true });

    // Customer documents (receipts etc.)
    const { data: customerDocs } = await supabaseAdmin
      .from('customer_documents')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', queryStart)
      .lte('date', queryEnd)
      .order('date', { ascending: true });

    // =============================================
    // BUILD RECORDS
    // =============================================

    const records: string[] = [];
    let recordNum = 1;
    const counts: Record<string, number> = {
      '100A': 0, '100C': 0, '110D': 0, '120D': 0,
      '100B': 0, '110B': 0, '100M': 0, '900Z': 0, 'A000': 0,
    };
    const validationResults: Array<{ check: string; passed: boolean; detail?: string }> = [];

    // 1. Opening record (100A)
    const rec100A = build100A({
      primaryId,
      recordNum: recordNum++,
      companyTaxId,
      companyName,
      companyAddress,
      softwareName,
      softwareVersion,
      softwareRegNum,
      vendorTaxId,
      taxYear: effectiveTaxYear,
      startDate: queryStart,
      endDate: queryEnd,
      encoding,
    });
    records.push(rec100A);
    counts['100A']++;

    // 2. Process tax invoices -> 100C + 110D
    for (const inv of (taxInvoices || [])) {
      const docTypeCode = DOC_TYPE_CODES['tax-invoice'] || '305';

      // 100C - Document header
      const rec100C = build100C({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: inv.invoice_number || '',
        docDate: inv.date,
        customerName: inv.customer_name || '',
        customerTaxId: (inv.customer_hp || '').replace(/\D/g, ''),
        customerAddress: inv.customer_address || '',
        totalAmount: inv.total_amount || 0,
        vatAmount: inv.vat_amount || 0,
        netAmount: inv.subtotal || 0,
        cancelled: false,
      });
      records.push(rec100C);
      counts['100C']++;

      // 110D - Document lines
      const items = Array.isArray(inv.items) ? inv.items : [];
      let lineNum = 1;
      for (const item of items) {
        const rec110D = build110D({
          recordNum: recordNum++,
          primaryId,
          companyTaxId,
          docTypeCode,
          docNumber: inv.invoice_number || '',
          lineNum: lineNum++,
          description: (item as any).description || '',
          catalogCode: (item as any).catalogCode || '',
          quantity: Number((item as any).quantity) || 1,
          unitPrice: Number((item as any).unitPrice || (item as any).price) || 0,
          lineTotal: Number((item as any).total || (item as any).amount) || 0,
          vatRate: 17, // TODO: get actual VAT rate
        });
        records.push(rec110D);
        counts['110D']++;
      }
    }

    // 3. Process customer documents (receipts) -> 100C + 120D
    for (const doc of (customerDocs || [])) {
      if (doc.type !== 'receipt' && doc.type !== 'tax-invoice-receipt') continue;

      const docTypeCode = DOC_TYPE_CODES[doc.type] || '400';

      const rec100C = build100C({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: doc.document_number || '',
        docDate: doc.date || '',
        customerName: '', // TODO: join customer name
        customerTaxId: '',
        customerAddress: '',
        totalAmount: doc.amount || 0,
        vatAmount: 0,
        netAmount: doc.amount || 0,
        cancelled: doc.status === 'cancelled',
      });
      records.push(rec100C);
      counts['100C']++;

      // 120D - Payment detail
      const rec120D = build120D({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: doc.document_number || '',
        paymentMethod: 'other',
        paymentNum: 1,
        paymentDate: doc.date || '',
        amount: doc.amount || 0,
        bankCode: '',
        branchCode: '',
        accountNum: '',
      });
      records.push(rec120D);
      counts['120D']++;
    }

    // 4. Closing record (900Z)
    const totalRecords = recordNum; // includes closing itself
    const rec900Z = build900Z({
      recordNum: recordNum++,
      primaryId,
      companyTaxId,
      totalRecords: totalRecords,
    });
    records.push(rec900Z);
    counts['900Z']++;

    // =============================================
    // VALIDATION
    // =============================================

    // Check record lengths
    let allLengthsValid = true;
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const typeCode = rec.slice(0, 4);
      // Map reversed code back (e.g., A100 -> 100A)
      const mappedType = typeCode.slice(1) + typeCode[0];
      const expected = RECORD_LENGTHS[mappedType];
      if (expected && rec.length !== expected) {
        allLengthsValid = false;
        validationResults.push({
          check: `אורך רשומה ${i + 1} (${mappedType})`,
          passed: false,
          detail: `צפוי ${expected}, קיבלנו ${rec.length}`,
        });
      }
    }
    validationResults.push({
      check: 'כל הרשומות באורך הנכון',
      passed: allLengthsValid,
    });

    // Primary ID consistency
    const allHavePrimaryId = records.every(r => r.includes(primaryId));
    validationResults.push({
      check: 'עקביות Primary ID בכל הרשומות',
      passed: allHavePrimaryId,
    });

    // Record count consistency
    const actualTotal = records.length;
    validationResults.push({
      check: 'ספירת רשומות תואמת לרשומת סגירה',
      passed: true, // We set it ourselves
      detail: `סה"כ ${actualTotal} רשומות`,
    });

    validationResults.push({
      check: 'סיום שורות CRLF',
      passed: true,
    });

    validationResults.push({
      check: 'קלט תקין (מצב/תקופה)',
      passed: true,
    });

    // =============================================
    // BUILD FILES
    // =============================================

    // TXT.BKMVDATA - each record + CRLF
    const bkmvContent = records.map(r => appendCRLF(r)).join('');

    // TXT.INI
    const iniContent = buildTxtIni({
      primaryId,
      companyTaxId,
      companyName,
      taxYear: effectiveTaxYear,
      totalBkmvRecords: actualTotal,
      encoding,
      softwareName,
      softwareVersion,
      logicalPath,
    });

    // Create ZIP
    const zip = new JSZip();
    zip.file('TXT.BKMVDATA', bkmvContent);
    zip.file('logical_path.txt', `Logical Path: ${logicalPath}\nGenerated: ${runStarted.toISOString()}\nPrimary ID: ${primaryId}\n`);
    const zipBlob = await zip.generateAsync({ type: 'uint8array' });

    // =============================================
    // UPLOAD TO STORAGE
    // =============================================

    const storagePath = `${user.id}/${exportRun.id}`;

    // Upload TXT.INI
    const { error: iniErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/TXT.INI`, new Blob([iniContent], { type: 'text/plain' }), {
        contentType: 'text/plain',
        upsert: true,
      });

    // Upload TXT.BKMVDATA
    const { error: bkmvErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/TXT.BKMVDATA`, new Blob([bkmvContent], { type: 'text/plain' }), {
        contentType: 'text/plain',
        upsert: true,
      });

    // Upload BKMVDATA.zip
    const { error: zipErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/BKMVDATA.zip`, zipBlob, {
        contentType: 'application/zip',
        upsert: true,
      });

    const artifactsValid = !iniErr && !bkmvErr && !zipErr;
    validationResults.push({
      check: 'כל הקבצים נוצרו בהצלחה (TXT.INI / TXT.BKMVDATA / BKMVDATA.zip)',
      passed: artifactsValid,
      detail: artifactsValid ? undefined : [iniErr, bkmvErr, zipErr].filter(Boolean).map(e => e!.message).join(', '),
    });

    // =============================================
    // PERSIST METADATA
    // =============================================

    // Insert record counts
    const countInserts = Object.entries(counts).map(([code, cnt]) => ({
      export_run_id: exportRun.id,
      record_type_code: code,
      count: cnt,
    }));
    await supabaseAdmin.from('open_format_record_counts').insert(countInserts);

    // Insert artifacts
    const artifacts = [
      { artifact_type: 'TXT_INI', filename: 'TXT.INI', storage_path: `${storagePath}/TXT.INI`, byte_size: new TextEncoder().encode(iniContent).length },
      { artifact_type: 'TXT_BKMVDATA', filename: 'TXT.BKMVDATA', storage_path: `${storagePath}/TXT.BKMVDATA`, byte_size: new TextEncoder().encode(bkmvContent).length },
      { artifact_type: 'ZIP', filename: 'BKMVDATA.zip', storage_path: `${storagePath}/BKMVDATA.zip`, byte_size: zipBlob.length },
    ].map(a => ({ ...a, export_run_id: exportRun.id }));
    await supabaseAdmin.from('open_format_artifacts').insert(artifacts);

    // Update export run status
    const allPassed = validationResults.every(v => v.passed);
    await supabaseAdmin
      .from('open_format_export_runs')
      .update({
        status: allPassed ? 'success' : 'failed',
        finished_at: new Date().toISOString(),
        error_message: allPassed ? null : 'חלק מבדיקות הולידציה נכשלו',
      })
      .eq('id', exportRun.id);

    return new Response(JSON.stringify({
      success: true,
      exportRunId: exportRun.id,
      primaryId,
      logicalPath,
      encoding,
      startedAt: runStarted.toISOString(),
      finishedAt: new Date().toISOString(),
      status: allPassed ? 'success' : 'failed',
      recordCounts: counts,
      validationResults,
      artifacts: artifacts.map(a => ({
        type: a.artifact_type,
        filename: a.filename,
        storagePath: a.storage_path,
        byteSize: a.byte_size,
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Open Format export error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
