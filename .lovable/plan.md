

## Root Cause Analysis — Simulator Failures

Based on the simulator screenshots and the official OF1.31 specification (Oracle Appendix 6), there are **6 distinct bugs** in `supabase/functions/generate-open-format/index.ts`. No other files need changing.

---

### Error-to-Root-Cause Mapping

```text
SIMULATOR ERROR                                         ROOT CAUSE IN CODE
──────────────────────────────────────────────────────────────────────────────
#6  A000 length exceeds max 470                         buildA000 = 580 chars. Count lines are
                                                        embedded INSIDE A000 instead of being
                                                        separate INI lines after it.

#5  No summary records in INI file                      Same cause — count lines (B100/B110/C100/
                                                        D110/D120/M100) must be SEPARATE lines
                                                        in INI.TXT after the A000 line.

#2  No summary record for C100                          ↑ same
#3  No summary record for D110                          ↑ same
#4  No summary record for B110                          ↑ same

#1  Record count < 2000 (registration)                  Only 16 records. This is a registration-mode
                                                        requirement — informational, not blocking for
                                                        production use.

C100 field 1215: "ספרת ביקורת שגויה"                    Customer tax ID (pos 252, len 9) has invalid
                                                        check digit. Must either validate via Luhn or
                                                        leave blank (9 spaces) when invalid.

B110 field 1414: "סה"כ שגיאות לשורה: 3"                 B110 field layout is WRONG. Opening balance
                                                        is at pos 87 in our code, but spec says pos 277.
                                                        Entire B110 structure after pos 87 is shifted.

INI "סך דווחו = 0" for all types                        Simulator cannot parse counts because they
                                                        are buried inside a malformed 580-char A000.

"אין התאמה בין רשומות מדווחות לנמצאות"                  Same — reported counts read as 0 because
 (C100, D110, B110)                                     A000 is malformed; actual counts are non-zero.
```

---

### Fix Plan — 6 Changes, 1 File

**File:** `supabase/functions/generate-open-format/index.ts`

#### Fix 1: A000 must be exactly 470 characters

Current code builds A000 as 580 chars by appending 6 count lines (6 x 19 = 114 chars) inside the record. According to the spec, the A000 record itself is max 470 chars. The count lines belong as **separate lines** in INI.TXT.

- Remove the 6 count-line concatenations from `buildA000`
- Change `padRight('', 46)` to `padRight('', 50)` so A000 totals exactly 470
- Update `A000_LEN` from 580 to 470
- Remove `counts` parameter from `buildA000` signature

#### Fix 2: INI.TXT must contain summary count lines as separate records

The INI file format per spec:

```text
[A000 record — 470 chars]\r\n
B100[15-digit zero-padded count]\r\n
B110[15-digit zero-padded count]\r\n
C100[15-digit zero-padded count]\r\n
D110[15-digit zero-padded count]\r\n
D120[15-digit zero-padded count]\r\n
M100[15-digit zero-padded count]\r\n
```

Each summary line is `TYPE_CODE` (4 chars) + `COUNT` (15 chars) = 19 chars + CRLF.

- Update the INI generation block (around line 1191-1212) to build the A000 line followed by 6 separate summary lines
- This fixes errors #2, #3, #4, #5, and the "reported vs found" mismatch

#### Fix 3: B110 field layout must match spec positions

The current `buildB110` has fields in the wrong positions from offset 87 onward. Per Oracle Appendix 6:

```text
POS   LEN  FIELD
0     4    Record Code "B110"
4     9    Record Number
13    9    Registration Number (Tax ID)
22    15   Account Value
37    50   Account Description
87    15   Balancing Segment Qualifier (blank)     ← WE PUT openingBalance HERE (WRONG)
102   30   Account Description 2 (blank)
132   50   Customer/Vendor Street (blank)
182   10   House Number (blank)
192   30   City (blank)
222   8    Zip Code (blank)
230   30   State (blank)
260   2    State Code (blank)
262   15   Summary Account (blank)
277   15   Opening Balance (SIGNED)                ← FIELD 1414 — THIS IS WHERE IT BELONGS
292   15   Sum Accounted Debits (SIGNED)
307   15   Sum Accounted Credits (SIGNED)
322   4    Accounting Classification (blank)
326   9    Customer/Supplier Tax ID
335   7    Branch ID (blank)
342   15   Non-ILS Opening Balance (blank/zero)
357   3    Currency Code "ILS"
360   16   Future Use (blank)
TOTAL: 376 ✓
```

- Rewrite `buildB110` to place fields at correct positions
- This fixes field 1414 errors on B110 lines

#### Fix 4: C100 customer tax ID check digit validation (field 1215)

Field 1215 (position 252, length 9) is the customer/vendor tax identifier. The simulator validates its check digit using the **Luhn algorithm** (standard for Israeli IDs and tax numbers).

- Add a `luhnCheckDigitValid(id: string): boolean` helper function
- In `buildC100`, if the customer tax ID fails Luhn validation, output 9 spaces instead of the invalid number
- This prevents "ספרת הביקורת שגויה" errors

#### Fix 5: Update validation engine for new INI structure

- Update `runValidations` to handle multi-line INI format
- Parse the first line as A000 (470 chars) and subsequent lines as summary counts
- Validate that each summary count matches actual record counts in BKMVDATA

#### Fix 6: Update INI record counts reference in validation

- The `iniRecordCounts` parameter parsing must read from the separate summary lines, not from positions within A000
- Adjust field offset references accordingly

---

### Technical Details

**Luhn algorithm for Israeli tax IDs (9 digits):**
```text
For each digit (left to right, 0-indexed):
  - Multiply by 1 if even index, 2 if odd index
  - If result > 9, subtract 9
  - Sum all results
  - Valid if sum % 10 == 0
```

**INI.TXT output structure after fix:**
```text
A000.....470 chars.....\r\n
B100000000000000000\r\n
B110000000000000002\r\n
C100000000000000006\r\n
D110000000000000006\r\n
D120000000000000000\r\n
M100000000000000000\r\n
```

**Expected result after all fixes:**
- A000 = exactly 470 chars (within limit)
- Summary count lines present in INI (fixes 5 errors)
- B110 fields at correct positions (fixes field 1414)
- C100 customer tax IDs validated (fixes field 1215)
- Reported counts match actual counts (fixes mismatch warnings)

### Files Changed
- `supabase/functions/generate-open-format/index.ts` — all 6 fixes

