/**
 * Reference-range selection and result flagging.
 *
 * The same rules run in the browser (frontend/src/app/modules/laboratory/lab-range.ts)
 * so the technician sees flags while typing; keep the two in step.
 */

export type ResultFlag =
  | 'NORMAL'
  | 'LOW'
  | 'HIGH'
  | 'CRITICAL_LOW'
  | 'CRITICAL_HIGH'
  | 'ABNORMAL'
  | '';

export interface RangeLike {
  rangeType?: string;
  gender?: string;
  minDays?: number;
  maxDays?: number;
  minAge?: number;
  minAgeUnit?: string;
  maxAge?: number;
  maxAgeUnit?: string;
  lowerValue?: number | null;
  upperValue?: number | null;
  criticalLow?: number | null;
  criticalHigh?: number | null;
  textValue?: string | null;
  displayText?: string | null;
  remark?: string | null;
}

const UNIT_DAYS: Record<string, number> = { DAYS: 1, MONTHS: 30, YEARS: 365 };

export function toDays(
  value: number | null | undefined,
  unit: string | null | undefined,
): number {
  const n = Number(value ?? 0);
  return Math.round(n * (UNIT_DAYS[(unit || 'YEARS').toUpperCase()] ?? 365));
}

/** Accepts "MALE"/"Male"/"M" style values. */
export function normaliseGender(
  g: string | null | undefined,
): 'MALE' | 'FEMALE' | 'ANY' {
  const v = (g || '').trim().toUpperCase();
  if (v.startsWith('M')) return 'MALE';
  if (v.startsWith('F')) return 'FEMALE';
  return 'ANY';
}

/**
 * Picks the band for a patient: matching gender (exact beats ANY) and an age
 * window containing the patient; among those the narrowest window wins.
 * Falls back to the first band of a matching gender, then the first band.
 */
export function pickRange<T extends RangeLike>(
  ranges: T[] | null | undefined,
  ageDays: number | null,
  gender: string | null | undefined,
): T | null {
  if (!ranges?.length) return null;
  const g = normaliseGender(gender);
  const genderOk = (r: T) => {
    const rg = normaliseGender(r.gender);
    return rg === 'ANY' || g === 'ANY' || rg === g;
  };
  const min = (r: T) => r.minDays ?? toDays(r.minAge, r.minAgeUnit);
  const max = (r: T) => r.maxDays ?? toDays(r.maxAge ?? 120, r.maxAgeUnit);

  const candidates = ranges.filter(
    (r) =>
      genderOk(r) &&
      (ageDays == null || (ageDays >= min(r) && ageDays <= max(r))),
  );
  if (candidates.length) {
    return [...candidates].sort((a, b) => {
      const exactA = normaliseGender(a.gender) === g && g !== 'ANY' ? 0 : 1;
      const exactB = normaliseGender(b.gender) === g && g !== 'ANY' ? 0 : 1;
      if (exactA !== exactB) return exactA - exactB;
      return max(a) - min(a) - (max(b) - min(b));
    })[0];
  }
  return ranges.find(genderOk) ?? ranges[0];
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(+n.toFixed(4));
}

/** Text printed in the reference column. */
export function rangeText(r: RangeLike | null | undefined): string {
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

const asNumber = (v: string): number | null => {
  const cleaned = v.replace(/,/g, '').trim();
  if (!/^[-+]?\d*\.?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
};

/**
 * Flags a result value. Numeric values are compared with the band's
 * critical / lower / upper limits. Dropdown values are compared with the
 * parameter's normal options, and other text with the band's text value.
 */
export function flagValue(
  value: string | null | undefined,
  range: RangeLike | null | undefined,
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
    if (range.criticalLow != null && n < range.criticalLow)
      return 'CRITICAL_LOW';
    if (range.criticalHigh != null && n > range.criticalHigh)
      return 'CRITICAL_HIGH';
    if (range.lowerValue != null && n < range.lowerValue) return 'LOW';
    if (range.upperValue != null && n > range.upperValue) return 'HIGH';
    if (range.lowerValue == null && range.upperValue == null) return '';
    return 'NORMAL';
  }
  return '';
}

export const isAbnormalFlag = (f: ResultFlag) => !!f && f !== 'NORMAL';
