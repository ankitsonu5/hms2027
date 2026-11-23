/**
 * Reference-range selection, result flagging and formula evaluation used by the
 * test master and result entry. Mirrors backend/src/modules/laboratory/lab-range.util.ts.
 */

export type ResultFlag =
  'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | 'ABNORMAL' | '';
export type AgeUnit = 'DAYS' | 'MONTHS' | 'YEARS';

export interface RefRange {
  id?: string;
  rangeType?: 'NUMERIC' | 'TEXT' | string;
  gender?: 'ANY' | 'MALE' | 'FEMALE' | string;
  minAge?: number;
  minAgeUnit?: AgeUnit | string;
  maxAge?: number;
  maxAgeUnit?: AgeUnit | string;
  minDays?: number;
  maxDays?: number;
  lowerValue?: number | null;
  upperValue?: number | null;
  criticalLow?: number | null;
  criticalHigh?: number | null;
  textValue?: string | null;
  displayText?: string | null;
  remark?: string | null;
}

export interface TestParam {
  id?: string;
  sortOrder?: number;
  name: string;
  unit?: string | null;
  method?: string | null;
  inputType?: 'NUMERIC' | 'TEXT' | 'PARAGRAPH' | string;
  resultType?: 'MANUAL' | 'DROPDOWN' | 'MULTI_SELECT' | 'FIXED' | 'FORMULA' | string;
  options?: string[] | null;
  normalOptions?: string[] | null;
  defaultResult?: string | null;
  formula?: string | null;
  decimals?: number | null;
  groupBy?: string | null;
  isOptional?: boolean;
  isBold?: boolean;
  ranges?: RefRange[];
}

const UNIT_DAYS: Record<string, number> = { DAYS: 1, MONTHS: 30, YEARS: 365 };

export function toDays(value: number | null | undefined, unit: string | null | undefined): number {
  return Math.round(Number(value ?? 0) * (UNIT_DAYS[(unit || 'YEARS').toUpperCase()] ?? 365));
}

export function normaliseGender(g: string | null | undefined): 'MALE' | 'FEMALE' | 'ANY' {
  const v = (g || '').trim().toUpperCase();
  if (v.startsWith('M')) return 'MALE';
  if (v.startsWith('F')) return 'FEMALE';
  return 'ANY';
}

export function pickRange(
  ranges: RefRange[] | null | undefined,
  ageDays: number | null,
  gender: string | null | undefined,
): RefRange | null {
  if (!ranges?.length) return null;
  const g = normaliseGender(gender);
  const genderOk = (r: RefRange) => {
    const rg = normaliseGender(r.gender);
    return rg === 'ANY' || g === 'ANY' || rg === g;
  };
  const min = (r: RefRange) => r.minDays ?? toDays(r.minAge, r.minAgeUnit);
  const max = (r: RefRange) => r.maxDays ?? toDays(r.maxAge ?? 120, r.maxAgeUnit);
  const candidates = ranges.filter(
    (r) => genderOk(r) && (ageDays == null || (ageDays >= min(r) && ageDays <= max(r))),
  );
  if (candidates.length) {
    return [...candidates].sort((a, b) => {
      const ea = normaliseGender(a.gender) === g && g !== 'ANY' ? 0 : 1;
      const eb = normaliseGender(b.gender) === g && g !== 'ANY' ? 0 : 1;
      if (ea !== eb) return ea - eb;
      return max(a) - min(a) - (max(b) - min(b));
    })[0];
  }
  return ranges.find(genderOk) ?? ranges[0];
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(4)));

export function rangeText(r: RefRange | null | undefined): string {
  if (!r) return '';
  if (r.displayText?.trim()) return r.displayText.trim();
  if ((r.rangeType || 'NUMERIC') === 'TEXT') return r.textValue?.trim() || '';
  const lo = r.lowerValue;
  const hi = r.upperValue;
  if (lo != null && hi != null) return `${fmt(lo)} - ${fmt(hi)}`;
  if (hi != null) return `< ${fmt(hi)}`;
  if (lo != null) return `> ${fmt(lo)}`;
  return r.textValue?.trim() || '';
}

export function ageLabel(r: RefRange): string {
  const unit = (u?: string) => (u || 'YEARS').toLowerCase().replace(/s$/, '(s)');
  return `${r.minAge ?? 0} ${unit(r.minAgeUnit)} – ${r.maxAge ?? 120} ${unit(r.maxAgeUnit)}`;
}

const asNumber = (v: string): number | null => {
  const c = v.replace(/,/g, '').trim();
  return /^[-+]?\d*\.?\d+$/.test(c) ? Number(c) : null;
};

export function flagValue(
  value: string | null | undefined,
  range: RefRange | null | undefined,
  normalOptions?: string[] | null,
): ResultFlag {
  const raw = (value ?? '').toString().trim();
  if (!raw) return '';
  if (normalOptions?.length) {
    const picked = raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const normal = normalOptions.map((s) => s.trim().toUpperCase());
    return picked.every((p) => normal.includes(p)) ? 'NORMAL' : 'ABNORMAL';
  }
  if (!range) return '';
  const n = asNumber(raw);
  if (n != null && (range.rangeType || 'NUMERIC') === 'NUMERIC') {
    if (range.criticalLow != null && n < range.criticalLow) return 'CRITICAL_LOW';
    if (range.criticalHigh != null && n > range.criticalHigh) return 'CRITICAL_HIGH';
    if (range.lowerValue != null && n < range.lowerValue) return 'LOW';
    if (range.upperValue != null && n > range.upperValue) return 'HIGH';
    if (range.lowerValue == null && range.upperValue == null) return '';
    return 'NORMAL';
  }
  return '';
}

export const FLAG_LABEL: Record<string, string> = {
  LOW: 'L',
  HIGH: 'H',
  CRITICAL_LOW: 'LL',
  CRITICAL_HIGH: 'HH',
  ABNORMAL: '*',
};

// ── Formula evaluation ───────────────────────────────────────────────────────
// Grammar: expr := term (('+'|'-') term)* ; term := factor (('*'|'/') factor)* ;
// factor := number | '{' NAME '}' | '(' expr ')' | '-' factor. No eval().

export const formulaRefs = (formula: string | null | undefined): string[] =>
  [...(formula ?? '').matchAll(/\{([^}]+)\}/g)].map((m) => m[1].trim());

export function evaluateFormula(
  formula: string,
  lookup: (name: string) => number | null,
): number | null {
  const src = formula.trim().replace(/^=/, '');
  let i = 0;
  const peek = () => {
    while (src[i] === ' ') i++;
    return src[i];
  };
  const fail = (): never => {
    throw new Error('bad formula');
  };
  const factor = (): number => {
    const c = peek();
    if (c === '(') {
      i++;
      const v = expr();
      if (peek() !== ')') fail();
      i++;
      return v;
    }
    if (c === '-') {
      i++;
      return -factor();
    }
    if (c === '{') {
      const end = src.indexOf('}', i);
      if (end < 0) fail();
      const v = lookup(src.slice(i + 1, end).trim());
      i = end + 1;
      if (v == null || Number.isNaN(v)) throw new Error('missing');
      return v;
    }
    const m = /^\d*\.?\d+/.exec(src.slice(i));
    if (!m) return fail();
    i += m[0].length;
    return Number(m[0]);
  };
  const term = (): number => {
    let v = factor();
    for (let c = peek(); c === '*' || c === '/'; c = peek()) {
      i++;
      const r = factor();
      v = c === '*' ? v * r : v / r;
    }
    return v;
  };
  const expr = (): number => {
    let v = term();
    for (let c = peek(); c === '+' || c === '-'; c = peek()) {
      i++;
      const r = term();
      v = c === '+' ? v + r : v - r;
    }
    return v;
  };
  try {
    const v = expr();
    if (peek() !== undefined) return null;
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Checks a formula's syntax and parameter names; returns an error message or ''. */
export function validateFormula(formula: string, names: string[]): string {
  if (!formula.trim()) return 'Formula is empty';
  const upper = names.map((n) => n.trim().toUpperCase());
  const unknown = formulaRefs(formula).filter((r) => !upper.includes(r.toUpperCase()));
  if (unknown.length) return `Unknown parameter: {${unknown[0]}}`;
  return evaluateFormula(formula, () => 1) == null ? 'Formula syntax is not valid' : '';
}

export function roundTo(v: number, decimals: number | null | undefined): string {
  if (decimals == null) return String(+v.toFixed(4));
  return v.toFixed(decimals);
}
