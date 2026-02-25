import { assertEquals, assert, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";

import {
  padNumericLeft,
  padAlphaRight,
  formatSignedAmount,
  formatDateYYYYMMDD,
  formatTimeHHMM,
  appendCRLF,
  validateRecordLength,
  generate15DigitId,
  generateLogicalPath,
  resolveLogicalPathCollision,
  RECORD_LENGTHS,
  RECORD_FIELD_DEFS,
  validateRecordDefinitions,
  build100A,
  build100C,
  build110D,
  build120D,
  build900Z,
  buildTxtIni,
  runValidations,
  buildDebugManifest,
  DEFAULT_DOC_TYPE_CODES,
} from "./index.ts";

// =============================================
// Padding helpers
// =============================================

Deno.test("padNumericLeft - basic padding", () => {
  assertEquals(padNumericLeft(42, 6), "000042");
  assertEquals(padNumericLeft(0, 4), "0000");
  assertEquals(padNumericLeft(123456, 4), "1234");
  assertEquals(padNumericLeft("", 5), "00000");
  assertEquals(padNumericLeft(null, 3), "000");
  assertEquals(padNumericLeft(undefined, 3), "000");
});

Deno.test("padAlphaRight - basic padding", () => {
  assertEquals(padAlphaRight("ABC", 6), "ABC   ");
  assertEquals(padAlphaRight("", 4), "    ");
  assertEquals(padAlphaRight("ABCDEF", 3), "ABC");
  assertEquals(padAlphaRight(null, 3), "   ");
  assertEquals(padAlphaRight(undefined, 3), "   ");
});

Deno.test("padAlphaRight - Hebrew text", () => {
  const hebrew = "שלום";
  const result = padAlphaRight(hebrew, 10);
  assertEquals(result.length, 10);
  assert(result.startsWith("שלום"));
});

// =============================================
// Signed amount formatter
// =============================================

Deno.test("formatSignedAmount - positive", () => {
  assertEquals(formatSignedAmount(123.45, 15), "+00000000012345");
});

Deno.test("formatSignedAmount - negative", () => {
  assertEquals(formatSignedAmount(-50.00, 15), "-00000000005000");
});

Deno.test("formatSignedAmount - zero", () => {
  assertEquals(formatSignedAmount(0, 15), "+00000000000000");
});

Deno.test("formatSignedAmount - null/undefined", () => {
  assertEquals(formatSignedAmount(null, 10), "+000000000");
  assertEquals(formatSignedAmount(undefined, 10), "+000000000");
});

Deno.test("formatSignedAmount - rounding", () => {
  assertEquals(formatSignedAmount(10.005, 15), "+00000000001001");
});

Deno.test("formatSignedAmount - large value", () => {
  assertEquals(formatSignedAmount(999999.99, 15), "+00000099999999");
});

// =============================================
// Date/time formatter
// =============================================

Deno.test("formatDateYYYYMMDD - valid date string", () => {
  assertEquals(formatDateYYYYMMDD("2025-03-15"), "20250315");
});

Deno.test("formatDateYYYYMMDD - null", () => {
  assertEquals(formatDateYYYYMMDD(null), "00000000");
});

Deno.test("formatDateYYYYMMDD - Date object", () => {
  const d = new Date(2024, 0, 5);
  assertEquals(formatDateYYYYMMDD(d), "20240105");
});

Deno.test("formatDateYYYYMMDD - invalid date", () => {
  assertEquals(formatDateYYYYMMDD("not-a-date"), "00000000");
});

Deno.test("formatTimeHHMM - valid time", () => {
  const d = new Date(2024, 0, 1, 14, 30);
  assertEquals(formatTimeHHMM(d), "1430");
});

Deno.test("formatTimeHHMM - null", () => {
  assertEquals(formatTimeHHMM(null), "0000");
});

// =============================================
// Record length validator
// =============================================

Deno.test("validateRecordLength - exact match", () => {
  assertEquals(validateRecordLength("A".repeat(428), 428), { valid: true, actual: 428 });
});

Deno.test("validateRecordLength - mismatch", () => {
  assertEquals(validateRecordLength("A".repeat(400), 428), { valid: false, actual: 400 });
});

// =============================================
// CRLF output verification
// =============================================

Deno.test("appendCRLF - adds \\r\\n", () => {
  const result = appendCRLF("test");
  assert(result.endsWith("\r\n"));
  assertEquals(result, "test\r\n");
});

Deno.test("CRLF in generated BKMVDATA content", () => {
  const primaryId = "123456789012345";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: "123456789",
      companyName: "Test", companyAddress: "Addr", softwareName: "SW",
      softwareVersion: "1.0", softwareRegNum: "REG", vendorTaxId: "999",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "ISO-8859-8",
    }),
    build900Z({ recordNum: 2, primaryId, companyTaxId: "123456789", totalRecords: 2 }),
  ];
  const content = records.map(r => appendCRLF(r)).join('');
  assert(!content.match(/[^\r]\n/), "Found bare LF without CR");
  assert(content.includes("\r\n"), "Must contain CRLF");
});

// =============================================
// Primary ID
// =============================================

Deno.test("generate15DigitId - format", () => {
  const id = generate15DigitId();
  assertEquals(id.length, 15);
  assertMatch(id, /^\d{15}$/);
});

Deno.test("generate15DigitId - uniqueness", () => {
  const ids = new Set(Array.from({ length: 100 }, () => generate15DigitId()));
  assert(ids.size >= 95, `Expected high uniqueness, got ${ids.size}/100`);
});

Deno.test("Primary ID appears in all records", () => {
  const primaryId = "123456789012345";
  const taxId = "123456789";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: taxId,
      companyName: "T", companyAddress: "A", softwareName: "S",
      softwareVersion: "1", softwareRegNum: "R", vendorTaxId: "V",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "UTF-8",
    }),
    build100C({
      recordNum: 2, primaryId, companyTaxId: taxId, docTypeCode: "305",
      docNumber: "1", docDate: "2025-06-01", customerName: "C",
      customerTaxId: "999", customerAddress: "A", totalAmount: 100,
      vatAmount: 17, netAmount: 83, cancelled: false,
    }),
    build900Z({ recordNum: 3, primaryId, companyTaxId: taxId, totalRecords: 3 }),
  ];
  for (const rec of records) {
    assert(rec.includes(primaryId), `Record missing primaryId: ${rec.slice(0, 20)}`);
  }
});

// =============================================
// Sequential record numbering
// =============================================

Deno.test("Sequential numbering continuity", () => {
  const primaryId = "123456789012345";
  const taxId = "123456789";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: taxId,
      companyName: "", companyAddress: "", softwareName: "",
      softwareVersion: "", softwareRegNum: "", vendorTaxId: "",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "UTF-8",
    }),
    build100C({
      recordNum: 2, primaryId, companyTaxId: taxId, docTypeCode: "305",
      docNumber: "1", docDate: "2025-01-15", customerName: "",
      customerTaxId: "", customerAddress: "", totalAmount: 0,
      vatAmount: 0, netAmount: 0, cancelled: false,
    }),
    build900Z({ recordNum: 3, primaryId, companyTaxId: taxId, totalRecords: 3 }),
  ];
  for (let i = 0; i < records.length; i++) {
    const numField = records[i].slice(4, 13);
    assertEquals(parseInt(numField, 10), i + 1, `Record ${i} has wrong sequence number`);
  }
});

// =============================================
// Closing count
// =============================================

Deno.test("Closing total matches actual records", () => {
  const totalRecords = 5;
  const rec = build900Z({
    recordNum: 5, primaryId: "123456789012345",
    companyTaxId: "123456789", totalRecords,
  });
  const countField = rec.slice(37, 46);
  assertEquals(parseInt(countField, 10), totalRecords);
});

// =============================================
// INI count
// =============================================

Deno.test("TXT.INI total matches record count", () => {
  const total = 42;
  const ini = buildTxtIni({
    primaryId: "123456789012345", companyTaxId: "123456789",
    companyName: "Test", taxYear: 2025, totalBkmvRecords: total,
    encoding: "ISO-8859-8", softwareName: "SW", softwareVersion: "1.0",
    logicalPath: "OPENFRMT/12345678.25/01011200/",
  });
  assert(ini.includes(`TOTAL_RECORDS=${total}`));
});

// =============================================
// Record exact lengths
// =============================================

Deno.test("100A record exact length", () => {
  const rec = build100A({
    primaryId: "123456789012345", recordNum: 1, companyTaxId: "123456789",
    companyName: "Company", companyAddress: "Address", softwareName: "SW",
    softwareVersion: "1.0", softwareRegNum: "REG123", vendorTaxId: "987654321",
    taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "ISO-8859-8",
  });
  assertEquals(rec.length, RECORD_LENGTHS['100A'], `100A: expected ${RECORD_LENGTHS['100A']}, got ${rec.length}`);
});

Deno.test("100C record exact length", () => {
  const rec = build100C({
    recordNum: 1, primaryId: "123456789012345", companyTaxId: "123456789",
    docTypeCode: "305", docNumber: "INV-001", docDate: "2025-06-15",
    customerName: "Customer", customerTaxId: "111222333",
    customerAddress: "Addr", totalAmount: 1000, vatAmount: 170,
    netAmount: 830, cancelled: false,
  });
  assertEquals(rec.length, RECORD_LENGTHS['100C'], `100C: expected ${RECORD_LENGTHS['100C']}, got ${rec.length}`);
});

Deno.test("110D record exact length", () => {
  const rec = build110D({
    recordNum: 1, primaryId: "123456789012345", companyTaxId: "123456789",
    docTypeCode: "305", docNumber: "INV-001", lineNum: 1,
    description: "Item", catalogCode: "CAT001", quantity: 2,
    unitPrice: 500, lineTotal: 1000, vatRate: 17,
  });
  assertEquals(rec.length, RECORD_LENGTHS['110D'], `110D: expected ${RECORD_LENGTHS['110D']}, got ${rec.length}`);
});

Deno.test("120D record exact length", () => {
  const rec = build120D({
    recordNum: 1, primaryId: "123456789012345", companyTaxId: "123456789",
    docTypeCode: "400", docNumber: "REC-001", paymentMethod: "cash",
    paymentNum: 1, paymentDate: "2025-06-15", amount: 500,
    bankCode: "", branchCode: "", accountNum: "",
  });
  assertEquals(rec.length, RECORD_LENGTHS['120D'], `120D: expected ${RECORD_LENGTHS['120D']}, got ${rec.length}`);
});

Deno.test("900Z record exact length", () => {
  const rec = build900Z({
    recordNum: 1, primaryId: "123456789012345",
    companyTaxId: "123456789", totalRecords: 10,
  });
  assertEquals(rec.length, RECORD_LENGTHS['900Z'], `900Z: expected ${RECORD_LENGTHS['900Z']}, got ${rec.length}`);
});

// =============================================
// Logical path
// =============================================

Deno.test("generateLogicalPath - format", () => {
  const path = generateLogicalPath("123456789", 2025, new Date(2025, 5, 15, 14, 30));
  assertMatch(path, /^OPENFRMT\/\d{8}\.\d{2}\/\d{8}\/$/);
  assert(path.startsWith("OPENFRMT/12345678.25/"));
});

Deno.test("resolveLogicalPathCollision - no collision", () => {
  const path = "OPENFRMT/12345678.25/06151430/";
  assertEquals(resolveLogicalPathCollision(path, []), path);
});

Deno.test("resolveLogicalPathCollision - with collision", () => {
  const path = "OPENFRMT/12345678.25/06151430/";
  const result = resolveLogicalPathCollision(path, [path]);
  assert(result !== path, "Should resolve to different path");
  assertMatch(result, /^OPENFRMT\/12345678\.25\/0615\d{4}\/$/);
});

// =============================================
// Validation engine
// =============================================

Deno.test("runValidations - all pass on valid data", () => {
  const primaryId = "123456789012345";
  const taxId = "123456789";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: taxId,
      companyName: "", companyAddress: "", softwareName: "",
      softwareVersion: "", softwareRegNum: "", vendorTaxId: "",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "UTF-8",
    }),
    build900Z({ recordNum: 2, primaryId, companyTaxId: taxId, totalRecords: 2 }),
  ];
  const bkmvContent = records.map(r => appendCRLF(r)).join('');
  const iniContent = buildTxtIni({
    primaryId, companyTaxId: taxId, companyName: "", taxYear: 2025,
    totalBkmvRecords: 2, encoding: "UTF-8", softwareName: "", softwareVersion: "",
    logicalPath: "OPENFRMT/12345678.25/01011200/",
  });
  const result = runValidations({
    records, primaryId, closingTotalCount: 2, iniTotalCount: 2,
    bkmvContent, iniContent,
  });
  assert(result.allPassed, `Validation failed: ${JSON.stringify(result.results.filter(r => !r.passed))}`);
});

Deno.test("runValidations - detects count mismatch", () => {
  const primaryId = "123456789012345";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: "123456789",
      companyName: "", companyAddress: "", softwareName: "",
      softwareVersion: "", softwareRegNum: "", vendorTaxId: "",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "UTF-8",
    }),
    build900Z({ recordNum: 2, primaryId, companyTaxId: "123456789", totalRecords: 99 }),
  ];
  const bkmvContent = records.map(r => appendCRLF(r)).join('');
  const iniContent = buildTxtIni({
    primaryId, companyTaxId: "123456789", companyName: "", taxYear: 2025,
    totalBkmvRecords: 2, encoding: "UTF-8", softwareName: "", softwareVersion: "",
    logicalPath: "OPENFRMT/12345678.25/01011200/",
  });
  const result = runValidations({
    records, primaryId, closingTotalCount: 99, iniTotalCount: 2,
    bkmvContent, iniContent,
  });
  assert(!result.allPassed);
});

// =============================================
// NEW: Record definition self-check
// =============================================

Deno.test("Record field definitions self-check - all valid", () => {
  const result = validateRecordDefinitions();
  assertEquals(result.valid, true, `Definition errors: ${result.errors.join('; ')}`);
});

Deno.test("Record field lengths sum to RECORD_LENGTHS", () => {
  for (const [code, fields] of Object.entries(RECORD_FIELD_DEFS)) {
    const totalLength = fields.reduce((sum, f) => sum + f.length, 0);
    assertEquals(totalLength, RECORD_LENGTHS[code], `${code}: fields sum ${totalLength} != expected ${RECORD_LENGTHS[code]}`);
  }
});

// =============================================
// NEW: Document type code mapping
// =============================================

Deno.test("Default doc type mapping - known types have codes", () => {
  assertEquals(DEFAULT_DOC_TYPE_CODES['tax-invoice'], '305');
  assertEquals(DEFAULT_DOC_TYPE_CODES['receipt'], '400');
  assertEquals(DEFAULT_DOC_TYPE_CODES['tax-invoice-receipt'], '320');
  assertEquals(DEFAULT_DOC_TYPE_CODES['credit-invoice'], '330');
});

Deno.test("Default doc type mapping - unknown type returns undefined", () => {
  assertEquals(DEFAULT_DOC_TYPE_CODES['nonexistent'], undefined);
});

// =============================================
// NEW: Validation with compliance config checks
// =============================================

Deno.test("runValidations - missing compliance config produces warning", () => {
  const primaryId = "123456789012345";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: "123456789",
      companyName: "", companyAddress: "", softwareName: "",
      softwareVersion: "", softwareRegNum: "", vendorTaxId: "",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "UTF-8",
    }),
    build900Z({ recordNum: 2, primaryId, companyTaxId: "123456789", totalRecords: 2 }),
  ];
  const bkmvContent = records.map(r => appendCRLF(r)).join('');
  const iniContent = buildTxtIni({
    primaryId, companyTaxId: "123456789", companyName: "", taxYear: 2025,
    totalBkmvRecords: 2, encoding: "UTF-8", softwareName: "", softwareVersion: "",
    logicalPath: "OPENFRMT/12345678.25/01011200/",
  });
  const result = runValidations({
    records, primaryId, closingTotalCount: 2, iniTotalCount: 2,
    bkmvContent, iniContent,
    hasComplianceConfig: false,
  });
  const configCheck = result.results.find(r => r.check.includes('הגדרות ציות'));
  assert(configCheck !== undefined);
  assertEquals(configCheck!.passed, false);
});

Deno.test("runValidations - unmapped types produce warning", () => {
  const primaryId = "123456789012345";
  const records = [
    build100A({
      primaryId, recordNum: 1, companyTaxId: "123456789",
      companyName: "", companyAddress: "", softwareName: "",
      softwareVersion: "", softwareRegNum: "", vendorTaxId: "",
      taxYear: 2025, startDate: "2025-01-01", endDate: "2025-12-31", encoding: "UTF-8",
    }),
    build900Z({ recordNum: 2, primaryId, companyTaxId: "123456789", totalRecords: 2 }),
  ];
  const bkmvContent = records.map(r => appendCRLF(r)).join('');
  const iniContent = buildTxtIni({
    primaryId, companyTaxId: "123456789", companyName: "", taxYear: 2025,
    totalBkmvRecords: 2, encoding: "UTF-8", softwareName: "", softwareVersion: "",
    logicalPath: "OPENFRMT/12345678.25/01011200/",
  });
  const result = runValidations({
    records, primaryId, closingTotalCount: 2, iniTotalCount: 2,
    bkmvContent, iniContent,
    hasMappings: false,
    unmappedTypes: ['unknown-doc'],
  });
  const mappingCheck = result.results.find(r => r.check.includes('מיפוי'));
  assert(mappingCheck !== undefined);
  assertEquals(mappingCheck!.passed, false);
});

// =============================================
// NEW: Debug manifest
// =============================================

Deno.test("buildDebugManifest - contains key fields", () => {
  const manifest = buildDebugManifest({
    exportRunId: 'test-run-id',
    primaryId: '123456789012345',
    logicalPath: 'OPENFRMT/12345678.25/01011200/',
    encoding: 'ISO-8859-8',
    recordCounts: { '100A': 1, '900Z': 1 },
    validationResults: [{ check: 'test', passed: true }],
    warnings: ['warn1'],
    blockers: [],
    documentIds: ['doc1', 'doc2'],
    docTypeMappingsUsed: { 'tax-invoice': '305' },
    artifacts: [{ filename: 'TXT.INI', byteSize: 100 }],
    complianceConfig: { software_name: 'Test' },
  });
  const parsed = JSON.parse(manifest);
  assertEquals(parsed._format, 'open_format_debug_manifest_v1');
  assertEquals(parsed.primary_id_15, '123456789012345');
  assertEquals(parsed.encoding_used, 'ISO-8859-8');
  assert(parsed.documents_included.length === 2);
  assertEquals(parsed.simulator_readiness.compliance_config_present, true);
  assertEquals(parsed.simulator_readiness.encoding_compliant, true);
});

Deno.test("buildDebugManifest - no compliance config", () => {
  const manifest = buildDebugManifest({
    exportRunId: 'x', primaryId: '123456789012345',
    logicalPath: 'OPENFRMT/12345678.25/01011200/', encoding: 'UTF-8',
    recordCounts: {}, validationResults: [], warnings: [], blockers: [],
    documentIds: [], docTypeMappingsUsed: {}, artifacts: [],
    complianceConfig: null,
  });
  const parsed = JSON.parse(manifest);
  assertEquals(parsed.simulator_readiness.compliance_config_present, false);
  assertEquals(parsed.simulator_readiness.encoding_compliant, false);
});
