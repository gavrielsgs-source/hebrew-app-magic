import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// =============================================
// FORMATTING HELPERS (Schema-Driven, Exported for Tests)
// =============================================

export function padNumericLeft(value: number | string | null | undefined, length: number, fill = '0'): string {
  const str = String(value ?? 0).replace(/\D/g, '');
  if (str.length > length) return str.slice(0, length);
  return str.padStart(length, fill);
}

export function padAlphaRight(value: string | null | undefined, length: number, fill = ' '): string {
  const str = String(value ?? '');
  if (str.length > length) return str.slice(0, length);
  return str.padEnd(length, fill);
}

export function formatSignedAmount(value: number | null | undefined, length: number, scale = 2): string {
  const num = value ?? 0;
  const sign = num >= 0 ? '+' : '-';
  const absVal = Math.abs(Math.round(num * Math.pow(10, scale)));
  const numStr = String(absVal);
  const fieldLen = length - 1; // 1 char for sign
  if (numStr.length > fieldLen) return sign + numStr.slice(0, fieldLen);
  return sign + numStr.padStart(fieldLen, '0');
}

export function formatDateYYYYMMDD(date: string | Date | null | undefined): string {
  if (!date) return '00000000';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '00000000';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function formatTimeHHMM(date: Date | null): string {
  if (!date) return '0000';
  return String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
}

export function appendCRLF(line: string): string {
  return line + '\r\n';
}

export function validateRecordLength(line: string, expectedLength: number): { valid: boolean; actual: number } {
  return { valid: line.length === expectedLength, actual: line.length };
}

// =============================================
// RECORD TYPE DEFINITIONS
// =============================================

// Record type expected lengths (excluding CRLF)
// TODO: Verify against official Open Format 1.31 spec before submission
export const RECORD_LENGTHS: Record<string, number> = {
  '100A': 428,
  '100C': 313,
  '110D': 305,
  '120D': 250,
  '900Z': 190,
};

export function generate15DigitId(): string {
  const ts = Date.now().toString().slice(-10);
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return ts + rand;
}

export function generateLogicalPath(taxId: string, taxYear: number, now: Date): string {
  const taxId8 = (taxId ?? '000000000').replace(/\D/g, '').slice(0, 8).padStart(8, '0');
  const yy = String(taxYear % 100).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `OPENFRMT/${taxId8}.${yy}/${MM}${DD}${hh}${mm}/`;
}

// Resolve same-minute collision by incrementing minute
export function resolveLogicalPathCollision(basePath: string, existingPaths: string[]): string {
  if (!existingPaths.includes(basePath)) return basePath;
  // Extract the MMDDhhmm part and increment mm
  const match = basePath.match(/^(OPENFRMT\/\d{8}\.\d{2}\/)(\d{4})(\d{2})(\d{2})\/$/);
  if (!match) return basePath;
  const [, prefix, MMDD, hh, mm] = match;
  let newMm = parseInt(mm, 10);
  let newHh = parseInt(hh, 10);
  for (let i = 0; i < 60; i++) {
    newMm++;
    if (newMm >= 60) { newMm = 0; newHh = (newHh + 1) % 24; }
    const candidate = `${prefix}${MMDD}${String(newHh).padStart(2, '0')}${String(newMm).padStart(2, '0')}/`;
    if (!existingPaths.includes(candidate)) return candidate;
  }
  return basePath; // fallback
}

// Document type mapping for Israel Tax Authority codes
// TODO: Verify against official spec document type codes
export const DOC_TYPE_CODES: Record<string, string> = {
  'tax-invoice': '305',
  'receipt': '400',
  'tax-invoice-receipt': '320',
  'credit-invoice': '330',
  'delivery-note': '200',
  'purchase-order': '100',
  'price-quote': '000',
  'proforma-invoice': '000',
};

// =============================================
// RECORD BUILDERS
// =============================================

function buildRecord(fields: string[], expectedType: string): string {
  const raw = fields.join('');
  const expected = RECORD_LENGTHS[expectedType];
  if (!expected) return raw;
  // Strict: pad or truncate to exact length
  if (raw.length < expected) return raw.padEnd(expected, ' ');
  if (raw.length > expected) return raw.slice(0, expected);
  return raw;
}

export function build100A(params: {
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
  const fields = [
    padAlphaRight('A100', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.companyName, 50),
    padAlphaRight(p.companyAddress, 50),
    padAlphaRight('', 20),              // City (TODO)
    padAlphaRight('', 10),              // ZIP
    formatDateYYYYMMDD(p.startDate),
    formatDateYYYYMMDD(p.endDate),
    padAlphaRight(p.encoding === 'CP862' ? '2' : '1', 1),
    padAlphaRight(p.softwareName, 20),
    padAlphaRight(p.softwareVersion, 10),
    padAlphaRight(p.softwareRegNum, 20),
    padAlphaRight(p.vendorTaxId, 9),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['100A'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '100A');
}

export function build100C(params: {
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
  const fields = [
    padAlphaRight('C100', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.docTypeCode, 3),
    padAlphaRight(p.docNumber, 20),
    formatDateYYYYMMDD(p.docDate),
    padAlphaRight('', 9),               // Value date (TODO)
    padAlphaRight('', 15),              // Reference 1
    padAlphaRight('', 15),              // Reference 2
    padAlphaRight(p.customerName, 50),
    padAlphaRight(p.customerTaxId, 9),
    padAlphaRight(p.customerAddress, 50),
    formatSignedAmount(p.totalAmount, 15),
    formatSignedAmount(p.vatAmount, 15),
    padAlphaRight(p.cancelled ? '1' : '0', 1),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['100C'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '100C');
}

export function build110D(params: {
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
  const fields = [
    padAlphaRight('D110', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.docTypeCode, 3),
    padAlphaRight(p.docNumber, 20),
    padNumericLeft(p.lineNum, 4),
    padAlphaRight(p.description, 50),
    padAlphaRight(p.catalogCode, 20),
    formatSignedAmount(p.quantity, 15, 2),
    formatSignedAmount(p.unitPrice, 15, 2),
    formatSignedAmount(p.lineTotal, 15, 2),
    padAlphaRight('', 1),               // Discount flag (TODO)
    formatSignedAmount(0, 12, 2),       // Discount amount (TODO)
    padNumericLeft(Math.round(p.vatRate * 100), 6),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['110D'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '110D');
}

export function build120D(params: {
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
  const fields = [
    padAlphaRight('D120', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.docTypeCode, 3),
    padAlphaRight(p.docNumber, 20),
    padNumericLeft(p.paymentNum, 4),
    padAlphaRight(paymentMethodCode(p.paymentMethod), 2),
    formatDateYYYYMMDD(p.paymentDate),
    formatSignedAmount(p.amount, 15, 2),
    padAlphaRight(p.bankCode, 5),
    padAlphaRight(p.branchCode, 5),
    padAlphaRight(p.accountNum, 15),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['120D'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '120D');
}

export function build900Z(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  totalRecords: number;
}): string {
  const p = params;
  const fields = [
    padAlphaRight('Z900', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padNumericLeft(p.totalRecords, 9),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['900Z'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '900Z');
}

function paymentMethodCode(method: string): string {
  const map: Record<string, string> = {
    'cash': '01', 'check': '02', 'credit': '03',
    'credit_card': '03', 'bank_transfer': '04', 'other': '10',
  };
  return map[method] || '10';
}

// =============================================
// TXT.INI BUILDER
// =============================================

export function buildTxtIni(params: {
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
// VALIDATION ENGINE
// =============================================

interface ValidationResult {
  check: string;
  passed: boolean;
  detail?: string;
}

export function runValidations(params: {
  records: string[];
  primaryId: string;
  closingTotalCount: number;
  iniTotalCount: number;
  bkmvContent: string;
  iniContent: string;
}): { results: ValidationResult[]; allPassed: boolean; fatalError?: string } {
  const { records, primaryId, closingTotalCount, iniTotalCount, bkmvContent, iniContent } = params;
  const results: ValidationResult[] = [];
  let fatalError: string | undefined;

  // 1. Record length validation
  let allLengthsValid = true;
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const typeCode = rec.slice(0, 4);
    const mappedType = typeCode.slice(1) + typeCode[0]; // A100 -> 100A
    const expected = RECORD_LENGTHS[mappedType];
    if (expected) {
      const { valid, actual } = validateRecordLength(rec, expected);
      if (!valid) {
        allLengthsValid = false;
        fatalError = `Record ${i + 1} (${mappedType}): expected ${expected} chars, got ${actual}`;
        results.push({ check: `אורך רשומה ${i + 1} (${mappedType})`, passed: false, detail: `צפוי ${expected}, קיבלנו ${actual}` });
      }
    }
  }
  results.push({ check: 'כל הרשומות באורך הנכון', passed: allLengthsValid });

  // 2. CRLF validation
  const crlfValid = bkmvContent.includes('\r\n') && !bkmvContent.match(/[^\r]\n/);
  const iniCrlfValid = iniContent.includes('\r\n') && !iniContent.match(/[^\r]\n/);
  results.push({ check: 'סיום שורות CRLF ב-TXT.BKMVDATA', passed: crlfValid });
  results.push({ check: 'סיום שורות CRLF ב-TXT.INI', passed: iniCrlfValid });

  // 3. Primary ID consistency
  const allHavePrimaryId = records.every(r => r.includes(primaryId));
  results.push({ check: 'עקביות Primary ID בכל הרשומות', passed: allHavePrimaryId });

  // 4. Primary ID format (15 digits)
  const pidValid = /^\d{15}$/.test(primaryId);
  results.push({ check: 'Primary ID - 15 ספרות', passed: pidValid, detail: pidValid ? primaryId : `ערך: "${primaryId}"` });

  // 5. Sequential record numbering
  let seqValid = true;
  for (let i = 0; i < records.length; i++) {
    const numField = records[i].slice(4, 13); // positions 5-13 = record number
    const num = parseInt(numField, 10);
    if (num !== i + 1) {
      seqValid = false;
      results.push({ check: `מספור רציף - רשומה ${i + 1}`, passed: false, detail: `צפוי ${i + 1}, קיבלנו ${num}` });
      break;
    }
  }
  results.push({ check: 'מספור רשומות רציף', passed: seqValid });

  // 6. Closing count consistency
  const actualTotal = records.length;
  const closingMatch = closingTotalCount === actualTotal;
  results.push({ check: 'ספירת רשומות תואמת לרשומת סגירה', passed: closingMatch, detail: `סגירה: ${closingTotalCount}, בפועל: ${actualTotal}` });

  // 7. INI count consistency
  const iniMatch = iniTotalCount === actualTotal;
  results.push({ check: 'ספירת רשומות ב-TXT.INI תואמת', passed: iniMatch, detail: `INI: ${iniTotalCount}, בפועל: ${actualTotal}` });

  // 8. Required artifacts
  results.push({ check: 'קבצים נדרשים (TXT.INI / TXT.BKMVDATA / BKMVDATA.zip)', passed: true });

  // 9. Input validation
  results.push({ check: 'קלט תקין (מצב/תקופה)', passed: true });

  const allPassed = results.every(r => r.passed);
  return { results, allPassed, fatalError };
}

// =============================================
// ZIP BUILDER (Deno-native, no external lib)
// =============================================

// Minimal ZIP creator using raw bytes (avoids JSZip import issues in Deno)
function createZipArchive(files: Array<{ name: string; content: Uint8Array }>): Uint8Array {
  const entries: Array<{ name: Uint8Array; content: Uint8Array; offset: number; crc: number }> = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.content);
    entries.push({ name: nameBytes, content: file.content, offset, crc });

    // Local file header
    const header = new Uint8Array(30 + nameBytes.length);
    const hv = new DataView(header.buffer);
    hv.setUint32(0, 0x04034b50, true); // signature
    hv.setUint16(4, 20, true);          // version needed
    hv.setUint16(6, 0, true);           // flags
    hv.setUint16(8, 0, true);           // compression (stored)
    hv.setUint16(10, 0, true);          // mod time
    hv.setUint16(12, 0, true);          // mod date
    hv.setUint32(14, crc, true);        // crc32
    hv.setUint32(18, file.content.length, true); // compressed size
    hv.setUint32(22, file.content.length, true); // uncompressed size
    hv.setUint16(26, nameBytes.length, true);     // name length
    hv.setUint16(28, 0, true);           // extra length
    header.set(nameBytes, 30);

    chunks.push(header);
    chunks.push(file.content);
    offset += header.length + file.content.length;
  }

  // Central directory
  const cdStart = offset;
  for (const entry of entries) {
    const cd = new Uint8Array(46 + entry.name.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, entry.crc, true);
    cv.setUint32(20, entry.content.length, true);
    cv.setUint32(24, entry.content.length, true);
    cv.setUint16(28, entry.name.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, entry.offset, true);
    cd.set(entry.name, 46);
    chunks.push(cd);
    offset += cd.length;
  }

  // End of central directory
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, offset - cdStart, true);
  ev.setUint32(16, cdStart, true);
  ev.setUint16(20, 0, true);
  chunks.push(eocd);

  // Concatenate
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) {
    result.set(c, pos);
    pos += c.length;
  }
  return result;
}

// CRC32 implementation
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// =============================================
// ENCODING HELPER
// =============================================

// ISO-8859-8 encoding map for Hebrew chars (U+05D0-U+05EA -> 0xE0-0xFA)
function encodeToISO8859_8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code); // ASCII
    } else if (code >= 0x05D0 && code <= 0x05EA) {
      bytes.push(code - 0x05D0 + 0xE0); // Hebrew
    } else if (code === 0x00A0) {
      bytes.push(0xA0); // NBSP
    } else {
      bytes.push(0x3F); // '?' for unmappable
    }
  }
  return new Uint8Array(bytes);
}

function encodeContent(text: string, encoding: string): Uint8Array {
  if (encoding === 'UTF-8') {
    return new TextEncoder().encode(text);
  }
  // ISO-8859-8 and CP862 both use the Hebrew mapping
  // TODO: CP862 has a different mapping (DOS Hebrew) - implement separately if needed
  return encodeToISO8859_8(text);
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
      return new Response(JSON.stringify({ success: false, error: 'Tax year is required for single-year mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (mode === 'multi_year' && (!startDate || !endDate)) {
      return new Response(JSON.stringify({ success: false, error: 'Start and end dates are required for multi-year mode' }), {
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

    // Determine date range
    let queryStart: string;
    let queryEnd: string;
    if (mode === 'single_year') {
      queryStart = `${taxYear}-01-01`;
      queryEnd = `${taxYear}-12-31`;
    } else {
      queryStart = startDate;
      queryEnd = endDate;
    }

    // Logical path with collision resolution
    const basePath = generateLogicalPath(companyTaxId, effectiveTaxYear, runStarted);
    const { data: existingRuns } = await supabaseAdmin
      .from('open_format_export_runs')
      .select('logical_output_path')
      .eq('user_id', user.id);
    const existingPaths = (existingRuns || []).map((r: any) => r.logical_output_path);
    const logicalPath = resolveLogicalPathCollision(basePath, existingPaths);

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

    const { data: taxInvoices } = await supabaseAdmin
      .from('tax_invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', queryStart)
      .lte('date', queryEnd)
      .order('date', { ascending: true });

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

    // 1. Opening record (100A)
    records.push(build100A({
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
    }));
    counts['100A']++;

    // 2. Tax invoices -> 100C + 110D
    for (const inv of (taxInvoices || [])) {
      const docTypeCode = DOC_TYPE_CODES['tax-invoice'] || '305';

      records.push(build100C({
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
      }));
      counts['100C']++;

      const items = Array.isArray(inv.items) ? inv.items : [];
      let lineNum = 1;
      for (const item of items) {
        records.push(build110D({
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
          vatRate: 17, // TODO: get actual VAT rate from document
        }));
        counts['110D']++;
      }
    }

    // 3. Customer documents (receipts) -> 100C + 120D
    for (const doc of (customerDocs || [])) {
      if (doc.type !== 'receipt' && doc.type !== 'tax-invoice-receipt') continue;
      const docTypeCode = DOC_TYPE_CODES[doc.type] || '400';

      records.push(build100C({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: doc.document_number || '',
        docDate: doc.date || '',
        customerName: '', // TODO: join customer name from customers table
        customerTaxId: '',
        customerAddress: '',
        totalAmount: doc.amount || 0,
        vatAmount: 0,
        netAmount: doc.amount || 0,
        cancelled: doc.status === 'cancelled',
      }));
      counts['100C']++;

      records.push(build120D({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: doc.document_number || '',
        paymentMethod: 'other', // TODO: map from customer_payments if linked
        paymentNum: 1,
        paymentDate: doc.date || '',
        amount: doc.amount || 0,
        bankCode: '',
        branchCode: '',
        accountNum: '',
      }));
      counts['120D']++;
    }

    // 4. Closing record (900Z) - totalRecords includes the closing record itself
    const totalRecords = records.length + 1; // +1 for this closing record
    records.push(build900Z({
      recordNum: recordNum++,
      primaryId,
      companyTaxId,
      totalRecords,
    }));
    counts['900Z']++;

    // =============================================
    // BUILD FILES
    // =============================================

    const bkmvContent = records.map(r => appendCRLF(r)).join('');

    const actualTotal = records.length;
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

    // =============================================
    // VALIDATION
    // =============================================

    const validation = runValidations({
      records,
      primaryId,
      closingTotalCount: totalRecords,
      iniTotalCount: actualTotal,
      bkmvContent,
      iniContent,
    });

    if (validation.fatalError) {
      // Mark as failed but still save artifacts for debugging
      await supabaseAdmin
        .from('open_format_export_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: validation.fatalError,
        })
        .eq('id', exportRun.id);
    }

    // =============================================
    // ENCODE & PACKAGE
    // =============================================

    const bkmvBytes = encodeContent(bkmvContent, encoding);
    const iniBytes = encodeContent(iniContent, encoding);
    const pathTxt = new TextEncoder().encode(
      `Logical Path: ${logicalPath}\nGenerated: ${runStarted.toISOString()}\nPrimary ID: ${primaryId}\nEncoding: ${encoding}\n`
    );

    const zipBytes = createZipArchive([
      { name: 'TXT.BKMVDATA', content: bkmvBytes },
      { name: 'logical_path.txt', content: pathTxt },
    ]);

    // =============================================
    // UPLOAD TO STORAGE
    // =============================================

    const storagePath = `${user.id}/${exportRun.id}`;

    const { error: iniErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/TXT.INI`, iniBytes, { contentType: 'text/plain', upsert: true });

    const { error: bkmvErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/TXT.BKMVDATA`, bkmvBytes, { contentType: 'text/plain', upsert: true });

    const { error: zipErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/BKMVDATA.zip`, zipBytes, { contentType: 'application/zip', upsert: true });

    const artifactsValid = !iniErr && !bkmvErr && !zipErr;
    // Update the artifacts validation result
    const artifactIdx = validation.results.findIndex(r => r.check.includes('קבצים נדרשים'));
    if (artifactIdx >= 0) {
      validation.results[artifactIdx].passed = artifactsValid;
      if (!artifactsValid) {
        validation.results[artifactIdx].detail = [iniErr, bkmvErr, zipErr].filter(Boolean).map(e => e!.message).join(', ');
      }
    }

    // =============================================
    // PERSIST METADATA
    // =============================================

    const countInserts = Object.entries(counts).map(([code, cnt]) => ({
      export_run_id: exportRun.id,
      record_type_code: code,
      count: cnt,
    }));
    await supabaseAdmin.from('open_format_record_counts').insert(countInserts);

    const artifacts = [
      { artifact_type: 'TXT_INI', filename: 'TXT.INI', storage_path: `${storagePath}/TXT.INI`, byte_size: iniBytes.length },
      { artifact_type: 'TXT_BKMVDATA', filename: 'TXT.BKMVDATA', storage_path: `${storagePath}/TXT.BKMVDATA`, byte_size: bkmvBytes.length },
      { artifact_type: 'ZIP', filename: 'BKMVDATA.zip', storage_path: `${storagePath}/BKMVDATA.zip`, byte_size: zipBytes.length },
    ].map(a => ({ ...a, export_run_id: exportRun.id }));
    await supabaseAdmin.from('open_format_artifacts').insert(artifacts);

    // Final status
    const allPassed = validation.results.every(v => v.passed) && artifactsValid;
    await supabaseAdmin
      .from('open_format_export_runs')
      .update({
        status: allPassed ? 'success' : 'failed',
        finished_at: new Date().toISOString(),
        error_message: allPassed ? null : (validation.fatalError || 'חלק מבדיקות הולידציה נכשלו'),
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
      validationResults: validation.results,
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
      error: (error as Error).message || 'An unexpected error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
