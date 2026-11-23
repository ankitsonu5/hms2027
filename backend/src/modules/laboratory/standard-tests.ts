/**
 * Starter test library a lab can load with one click ("Load standard tests").
 * Reference ranges are common adult values for Indian labs; the pathologist is
 * expected to review and adjust them in the test master.
 */

export interface SeedRange {
  gender?: 'ANY' | 'MALE' | 'FEMALE';
  minAge?: number;
  minAgeUnit?: 'DAYS' | 'MONTHS' | 'YEARS';
  maxAge?: number;
  maxAgeUnit?: 'DAYS' | 'MONTHS' | 'YEARS';
  low?: number | null;
  high?: number | null;
  critLow?: number;
  critHigh?: number;
  text?: string;
  display?: string;
  remark?: string;
}

export interface SeedParam {
  name: string;
  unit?: string;
  method?: string;
  group?: string;
  input?: 'NUMERIC' | 'TEXT' | 'PARAGRAPH';
  result?: 'MANUAL' | 'DROPDOWN' | 'MULTI_SELECT' | 'FIXED' | 'FORMULA';
  options?: string[];
  normal?: string[];
  def?: string;
  formula?: string;
  decimals?: number;
  optional?: boolean;
  bold?: boolean;
  ranges?: SeedRange[];
}

export interface SeedTest {
  name: string;
  code: string;
  category: string;
  type: 'SINGLE' | 'MULTIPLE' | 'NESTED' | 'DOCUMENT' | 'PANEL';
  price: number;
  sample?: string;
  method?: string;
  instrument?: string;
  interpretation?: string;
  params?: SeedParam[];
  panelCodes?: string[];
}

const any = (
  low: number | null,
  high: number | null,
  extra: Partial<SeedRange> = {},
): SeedRange => ({
  gender: 'ANY',
  low,
  high,
  ...extra,
});
const male = (
  low: number | null,
  high: number | null,
  extra: Partial<SeedRange> = {},
): SeedRange => ({
  gender: 'MALE',
  minAge: 13,
  low,
  high,
  ...extra,
});
const female = (
  low: number | null,
  high: number | null,
  extra: Partial<SeedRange> = {},
): SeedRange => ({
  gender: 'FEMALE',
  minAge: 13,
  low,
  high,
  ...extra,
});
const textRange = (
  text: string,
  extra: Partial<SeedRange> = {},
): SeedRange => ({
  gender: 'ANY',
  text,
  ...extra,
});
const dropdown = (
  name: string,
  options: string[],
  normal: string[],
  group?: string,
  def?: string,
): SeedParam => ({
  name,
  group,
  input: 'TEXT',
  result: 'DROPDOWN',
  options,
  normal,
  def: def ?? normal[0],
  ranges: [textRange(normal.join(' / '))],
});

const PLUS_SCALE = ['Nil', 'Trace', '+', '++', '+++', '++++'];

export const STANDARD_CATEGORIES = [
  'HAEMATOLOGY',
  'BIOCHEMISTRY',
  'IMMUNOASSAY',
  'SEROLOGY',
  'CLINICAL PATHOLOGY',
  'MICROBIOLOGY',
  'HISTOPATHOLOGY',
  'HEALTH PACKAGES',
];

export const STANDARD_UNITS = [
  'g/dL',
  'mg/dL',
  'mg/L',
  'ng/mL',
  'pg/mL',
  'µg/dL',
  'µIU/mL',
  'mmol/L',
  'U/L',
  '%',
  'fL',
  'pg',
  'cells/µL',
  'million/µL',
  'mm/1st hr',
  '/hpf',
  'mL',
];

export const STANDARD_SAMPLE_TYPES = [
  'Whole Blood (EDTA)',
  'Serum',
  'Plasma',
  'Fluoride Plasma',
  'Urine',
  'Stool',
  'Tissue',
  'Swab',
];

export const STANDARD_METHODS = [
  'Automated Cell Counter',
  'Microscopy',
  'Westergren',
  'GOD-POD',
  'HPLC',
  'CLIA',
  'Diazo',
  'IFCC',
  'Enzymatic',
  'Biuret',
  'BCG',
  'Ion Selective Electrode',
  'Immunoturbidimetry',
  'Slide Agglutination',
  'Dipstick / Reflectance',
  'Immunochromatography',
];

export const STANDARD_TESTS: SeedTest[] = [
  {
    name: 'COMPLETE BLOOD COUNT (CBC)',
    code: 'CBC',
    category: 'HAEMATOLOGY',
    type: 'NESTED',
    price: 300,
    sample: 'Whole Blood (EDTA)',
    method: 'Automated Cell Counter',
    params: [
      {
        name: 'HAEMOGLOBIN',
        unit: 'g/dL',
        group: 'HAEMOGLOBIN',
        method: 'Cyanide-free SLS',
        decimals: 1,
        bold: true,
        ranges: [
          male(13, 17, { critLow: 7, critHigh: 20 }),
          female(12, 15, { critLow: 7, critHigh: 20 }),
          any(11, 14.5, {
            minAge: 1,
            minAgeUnit: 'YEARS',
            maxAge: 12,
            critLow: 7,
          }),
        ],
      },
      {
        name: 'TOTAL RBC COUNT',
        unit: 'million/µL',
        group: 'RBC COUNT & INDICES',
        decimals: 2,
        ranges: [
          male(4.5, 5.5),
          female(3.8, 4.8),
          any(4.0, 5.2, { maxAge: 12 }),
        ],
      },
      {
        name: 'PACKED CELL VOLUME (PCV)',
        unit: '%',
        group: 'RBC COUNT & INDICES',
        decimals: 1,
        ranges: [male(40, 50), female(36, 46), any(34, 42, { maxAge: 12 })],
      },
      {
        name: 'MCV',
        unit: 'fL',
        group: 'RBC COUNT & INDICES',
        decimals: 1,
        ranges: [any(83, 101)],
      },
      {
        name: 'MCH',
        unit: 'pg',
        group: 'RBC COUNT & INDICES',
        decimals: 1,
        ranges: [any(27, 32)],
      },
      {
        name: 'MCHC',
        unit: 'g/dL',
        group: 'RBC COUNT & INDICES',
        decimals: 1,
        ranges: [any(31.5, 34.5)],
      },
      {
        name: 'RDW-CV',
        unit: '%',
        group: 'RBC COUNT & INDICES',
        decimals: 1,
        ranges: [any(11.6, 14)],
      },
      {
        name: 'TOTAL WBC COUNT',
        unit: 'cells/µL',
        group: 'WBC COUNT',
        bold: true,
        decimals: 0,
        ranges: [any(4000, 11000, { critLow: 2000, critHigh: 30000 })],
      },
      {
        name: 'NEUTROPHILS',
        unit: '%',
        group: 'DIFFERENTIAL LEUCOCYTE COUNT',
        decimals: 0,
        ranges: [any(40, 80)],
      },
      {
        name: 'LYMPHOCYTES',
        unit: '%',
        group: 'DIFFERENTIAL LEUCOCYTE COUNT',
        decimals: 0,
        ranges: [any(20, 40)],
      },
      {
        name: 'MONOCYTES',
        unit: '%',
        group: 'DIFFERENTIAL LEUCOCYTE COUNT',
        decimals: 0,
        ranges: [any(2, 10)],
      },
      {
        name: 'EOSINOPHILS',
        unit: '%',
        group: 'DIFFERENTIAL LEUCOCYTE COUNT',
        decimals: 0,
        ranges: [any(1, 6)],
      },
      {
        name: 'BASOPHILS',
        unit: '%',
        group: 'DIFFERENTIAL LEUCOCYTE COUNT',
        decimals: 0,
        ranges: [any(0, 2)],
      },
      {
        name: 'ABSOLUTE NEUTROPHIL COUNT',
        unit: 'cells/µL',
        group: 'ABSOLUTE COUNTS',
        result: 'FORMULA',
        formula: '{TOTAL WBC COUNT} * {NEUTROPHILS} / 100',
        decimals: 0,
        ranges: [any(2000, 7000)],
      },
      {
        name: 'ABSOLUTE LYMPHOCYTE COUNT',
        unit: 'cells/µL',
        group: 'ABSOLUTE COUNTS',
        result: 'FORMULA',
        formula: '{TOTAL WBC COUNT} * {LYMPHOCYTES} / 100',
        decimals: 0,
        ranges: [any(1000, 3000)],
      },
      {
        name: 'PLATELET COUNT',
        unit: 'cells/µL',
        group: 'PLATELETS',
        bold: true,
        decimals: 0,
        ranges: [any(150000, 410000, { critLow: 50000, critHigh: 1000000 })],
      },
      {
        name: 'MPV',
        unit: 'fL',
        group: 'PLATELETS',
        decimals: 1,
        optional: true,
        ranges: [any(7.5, 11.5)],
      },
      {
        name: 'PERIPHERAL SMEAR',
        group: 'PERIPHERAL SMEAR',
        input: 'PARAGRAPH',
        optional: true,
        def: 'RBCs are normocytic normochromic. WBCs are normal in number and morphology. Platelets are adequate.',
        result: 'FIXED',
      },
    ],
  },
  {
    name: 'ERYTHROCYTE SEDIMENTATION RATE (ESR)',
    code: 'ESR',
    category: 'HAEMATOLOGY',
    type: 'SINGLE',
    price: 100,
    sample: 'Whole Blood (EDTA)',
    method: 'Westergren',
    params: [
      {
        name: 'ESR',
        unit: 'mm/1st hr',
        decimals: 0,
        ranges: [male(0, 15), female(0, 20), any(0, 10, { maxAge: 12 })],
      },
    ],
  },
  {
    name: 'BLOOD GROUP & RH TYPING',
    code: 'BG',
    category: 'HAEMATOLOGY',
    type: 'MULTIPLE',
    price: 100,
    sample: 'Whole Blood (EDTA)',
    method: 'Slide Agglutination',
    params: [
      {
        name: 'ABO GROUP',
        input: 'TEXT',
        result: 'DROPDOWN',
        options: ['A', 'B', 'AB', 'O'],
      },
      {
        name: 'RH (D) TYPE',
        input: 'TEXT',
        result: 'DROPDOWN',
        options: ['POSITIVE', 'NEGATIVE'],
      },
    ],
  },
  {
    name: 'BLOOD SUGAR RANDOM',
    code: 'RBS',
    category: 'BIOCHEMISTRY',
    type: 'SINGLE',
    price: 60,
    sample: 'Fluoride Plasma',
    method: 'GOD-POD',
    params: [
      {
        name: 'BLOOD SUGAR RANDOM',
        unit: 'mg/dL',
        decimals: 0,
        ranges: [any(70, 140, { critLow: 40, critHigh: 450 })],
      },
    ],
  },
  {
    name: 'BLOOD SUGAR FASTING',
    code: 'FBS',
    category: 'BIOCHEMISTRY',
    type: 'SINGLE',
    price: 60,
    sample: 'Fluoride Plasma',
    method: 'GOD-POD',
    params: [
      {
        name: 'BLOOD SUGAR FASTING',
        unit: 'mg/dL',
        decimals: 0,
        ranges: [
          any(70, 100, {
            critLow: 40,
            critHigh: 450,
            remark:
              'Normal: 70-100 | Impaired fasting glucose: 100-125 | Diabetes: >= 126 mg/dL (ADA)',
          }),
        ],
      },
    ],
  },
  {
    name: 'GLYCATED HAEMOGLOBIN (HbA1c)',
    code: 'HBA1C',
    category: 'BIOCHEMISTRY',
    type: 'MULTIPLE',
    price: 450,
    sample: 'Whole Blood (EDTA)',
    method: 'HPLC',
    params: [
      {
        name: 'HbA1c',
        unit: '%',
        decimals: 1,
        bold: true,
        ranges: [
          any(4, 5.6, {
            display:
              'Non-diabetic: < 5.7\nPre-diabetic: 5.7 - 6.4\nDiabetic: >= 6.5',
          }),
        ],
      },
      {
        name: 'ESTIMATED AVERAGE GLUCOSE (eAG)',
        unit: 'mg/dL',
        result: 'FORMULA',
        formula: '28.7 * {HbA1c} - 46.7',
        decimals: 0,
        ranges: [any(68, 114)],
      },
    ],
  },
  {
    name: 'LIVER FUNCTION TEST (LFT)',
    code: 'LFT',
    category: 'BIOCHEMISTRY',
    type: 'MULTIPLE',
    price: 600,
    sample: 'Serum',
    params: [
      {
        name: 'TOTAL BILIRUBIN',
        unit: 'mg/dL',
        method: 'Diazo',
        decimals: 2,
        ranges: [any(0.3, 1.2)],
      },
      {
        name: 'DIRECT BILIRUBIN',
        unit: 'mg/dL',
        method: 'Diazo',
        decimals: 2,
        ranges: [any(0, 0.3)],
      },
      {
        name: 'INDIRECT BILIRUBIN',
        unit: 'mg/dL',
        result: 'FORMULA',
        formula: '{TOTAL BILIRUBIN} - {DIRECT BILIRUBIN}',
        decimals: 2,
        ranges: [any(0.1, 1.0)],
      },
      {
        name: 'SGOT (AST)',
        unit: 'U/L',
        method: 'IFCC',
        decimals: 0,
        ranges: [any(0, 40, { display: 'Upto 40' })],
      },
      {
        name: 'SGPT (ALT)',
        unit: 'U/L',
        method: 'IFCC',
        decimals: 0,
        ranges: [any(0, 41, { display: 'Upto 41' })],
      },
      {
        name: 'ALKALINE PHOSPHATASE',
        unit: 'U/L',
        method: 'IFCC',
        decimals: 0,
        ranges: [male(40, 129), female(35, 104)],
      },
      {
        name: 'TOTAL PROTEIN',
        unit: 'g/dL',
        method: 'Biuret',
        decimals: 1,
        ranges: [any(6.4, 8.3)],
      },
      {
        name: 'ALBUMIN',
        unit: 'g/dL',
        method: 'BCG',
        decimals: 1,
        ranges: [any(3.5, 5.2)],
      },
      {
        name: 'GLOBULIN',
        unit: 'g/dL',
        result: 'FORMULA',
        formula: '{TOTAL PROTEIN} - {ALBUMIN}',
        decimals: 1,
        ranges: [any(2.0, 3.5)],
      },
      {
        name: 'A/G RATIO',
        result: 'FORMULA',
        formula: '{ALBUMIN} / {GLOBULIN}',
        decimals: 2,
        ranges: [any(1.1, 2.2)],
      },
    ],
  },
  {
    name: 'KIDNEY FUNCTION TEST (KFT)',
    code: 'KFT',
    category: 'BIOCHEMISTRY',
    type: 'MULTIPLE',
    price: 600,
    sample: 'Serum',
    params: [
      {
        name: 'BLOOD UREA',
        unit: 'mg/dL',
        method: 'Enzymatic',
        decimals: 0,
        ranges: [any(17, 43)],
      },
      {
        name: 'BLOOD UREA NITROGEN (BUN)',
        unit: 'mg/dL',
        result: 'FORMULA',
        formula: '{BLOOD UREA} / 2.14',
        decimals: 1,
        ranges: [any(7, 20)],
      },
      {
        name: 'SERUM CREATININE',
        unit: 'mg/dL',
        method: 'Enzymatic',
        decimals: 2,
        ranges: [
          male(0.7, 1.3, { critHigh: 10 }),
          female(0.6, 1.1, { critHigh: 10 }),
        ],
      },
      {
        name: 'URIC ACID',
        unit: 'mg/dL',
        method: 'Enzymatic',
        decimals: 1,
        ranges: [male(3.5, 7.2), female(2.6, 6.0)],
      },
      {
        name: 'SODIUM (Na+)',
        unit: 'mmol/L',
        method: 'Ion Selective Electrode',
        decimals: 0,
        ranges: [any(136, 145, { critLow: 120, critHigh: 160 })],
      },
      {
        name: 'POTASSIUM (K+)',
        unit: 'mmol/L',
        method: 'Ion Selective Electrode',
        decimals: 1,
        ranges: [any(3.5, 5.1, { critLow: 2.5, critHigh: 6.5 })],
      },
      {
        name: 'CHLORIDE (Cl-)',
        unit: 'mmol/L',
        method: 'Ion Selective Electrode',
        decimals: 0,
        ranges: [any(98, 107)],
      },
    ],
  },
  {
    name: 'LIPID PROFILE',
    code: 'LIPID',
    category: 'BIOCHEMISTRY',
    type: 'MULTIPLE',
    price: 500,
    sample: 'Serum',
    method: 'Enzymatic',
    params: [
      {
        name: 'TOTAL CHOLESTEROL',
        unit: 'mg/dL',
        decimals: 0,
        ranges: [
          any(null, 200, {
            display: 'Desirable: < 200\nBorderline: 200 - 239\nHigh: >= 240',
          }),
        ],
      },
      {
        name: 'TRIGLYCERIDES',
        unit: 'mg/dL',
        decimals: 0,
        ranges: [
          any(null, 150, {
            display: 'Normal: < 150\nBorderline: 150 - 199\nHigh: >= 200',
          }),
        ],
      },
      {
        name: 'HDL CHOLESTEROL',
        unit: 'mg/dL',
        decimals: 0,
        ranges: [
          male(40, null, { display: '> 40' }),
          female(50, null, { display: '> 50' }),
        ],
      },
      {
        name: 'VLDL CHOLESTEROL',
        unit: 'mg/dL',
        result: 'FORMULA',
        formula: '{TRIGLYCERIDES} / 5',
        decimals: 0,
        ranges: [any(null, 30, { display: '< 30' })],
      },
      {
        name: 'LDL CHOLESTEROL',
        unit: 'mg/dL',
        result: 'FORMULA',
        formula: '{TOTAL CHOLESTEROL} - {HDL CHOLESTEROL} - {VLDL CHOLESTEROL}',
        decimals: 0,
        ranges: [
          any(null, 100, {
            display: 'Optimal: < 100\nNear optimal: 100 - 129\nHigh: >= 160',
          }),
        ],
      },
      {
        name: 'TOTAL CHOLESTEROL / HDL RATIO',
        result: 'FORMULA',
        formula: '{TOTAL CHOLESTEROL} / {HDL CHOLESTEROL}',
        decimals: 2,
        ranges: [any(null, 5, { display: '< 5.0' })],
      },
    ],
  },
  {
    name: 'SERUM CALCIUM',
    code: 'CA',
    category: 'BIOCHEMISTRY',
    type: 'SINGLE',
    price: 200,
    sample: 'Serum',
    method: 'Enzymatic',
    params: [
      {
        name: 'SERUM CALCIUM',
        unit: 'mg/dL',
        decimals: 1,
        ranges: [any(8.6, 10.2, { critLow: 6, critHigh: 13 })],
      },
    ],
  },
  {
    name: 'C-REACTIVE PROTEIN (CRP)',
    code: 'CRP',
    category: 'SEROLOGY',
    type: 'SINGLE',
    price: 400,
    sample: 'Serum',
    method: 'Immunoturbidimetry',
    params: [
      {
        name: 'CRP',
        unit: 'mg/L',
        decimals: 1,
        ranges: [any(0, 6, { display: '< 6.0' })],
      },
    ],
  },
  {
    name: 'DENGUE NS1 ANTIGEN',
    code: 'NS1',
    category: 'SEROLOGY',
    type: 'SINGLE',
    price: 600,
    sample: 'Serum',
    method: 'Immunochromatography',
    params: [
      dropdown('DENGUE NS1 ANTIGEN', ['NEGATIVE', 'POSITIVE'], ['NEGATIVE']),
    ],
  },
  {
    name: 'WIDAL TEST (SLIDE)',
    code: 'WIDAL',
    category: 'SEROLOGY',
    type: 'MULTIPLE',
    price: 150,
    sample: 'Serum',
    method: 'Slide Agglutination',
    interpretation:
      'Titres of 1:80 and above for "O" and 1:160 and above for "H" antigen are considered significant.',
    params: [
      'S. TYPHI "O"',
      'S. TYPHI "H"',
      'S. PARATYPHI "AH"',
      'S. PARATYPHI "BH"',
    ].map((n) =>
      dropdown(
        n,
        ['< 1:20', '1:20', '1:40', '1:80', '1:160', '1:320'],
        ['< 1:20', '1:20', '1:40'],
      ),
    ),
  },
  {
    name: 'THYROID PROFILE (T3, T4, TSH)',
    code: 'TFT',
    category: 'IMMUNOASSAY',
    type: 'MULTIPLE',
    price: 500,
    sample: 'Serum',
    method: 'CLIA',
    params: [
      { name: 'TOTAL T3', unit: 'ng/mL', decimals: 2, ranges: [any(0.8, 2.0)] },
      {
        name: 'TOTAL T4',
        unit: 'µg/dL',
        decimals: 2,
        ranges: [any(5.1, 14.1)],
      },
      {
        name: 'TSH',
        unit: 'µIU/mL',
        decimals: 2,
        bold: true,
        ranges: [any(0.27, 4.2)],
      },
    ],
  },
  {
    name: 'VITAMIN D (25-OH)',
    code: 'VITD',
    category: 'IMMUNOASSAY',
    type: 'SINGLE',
    price: 1200,
    sample: 'Serum',
    method: 'CLIA',
    params: [
      {
        name: 'VITAMIN D (25-OH)',
        unit: 'ng/mL',
        decimals: 1,
        ranges: [
          any(30, 100, {
            display:
              'Deficiency: < 20\nInsufficiency: 20 - 30\nSufficiency: 30 - 100',
          }),
        ],
      },
    ],
  },
  {
    name: 'VITAMIN B12',
    code: 'B12',
    category: 'IMMUNOASSAY',
    type: 'SINGLE',
    price: 900,
    sample: 'Serum',
    method: 'CLIA',
    params: [
      {
        name: 'VITAMIN B12',
        unit: 'pg/mL',
        decimals: 0,
        ranges: [any(211, 911)],
      },
    ],
  },
  {
    name: 'URINE ROUTINE & MICROSCOPY',
    code: 'URINE-RM',
    category: 'CLINICAL PATHOLOGY',
    type: 'NESTED',
    price: 150,
    sample: 'Urine',
    method: 'Dipstick / Reflectance',
    params: [
      {
        name: 'QUANTITY',
        unit: 'mL',
        group: 'PHYSICAL EXAMINATION',
        decimals: 0,
        optional: true,
      },
      dropdown(
        'COLOUR',
        ['PALE YELLOW', 'YELLOW', 'DARK YELLOW', 'COLOURLESS', 'RED', 'BROWN'],
        ['PALE YELLOW', 'YELLOW'],
        'PHYSICAL EXAMINATION',
      ),
      dropdown(
        'APPEARANCE',
        ['CLEAR', 'SLIGHTLY TURBID', 'TURBID'],
        ['CLEAR'],
        'PHYSICAL EXAMINATION',
      ),
      {
        name: 'SPECIFIC GRAVITY',
        group: 'PHYSICAL EXAMINATION',
        decimals: 3,
        ranges: [any(1.005, 1.03)],
      },
      {
        name: 'pH',
        group: 'CHEMICAL EXAMINATION',
        decimals: 1,
        ranges: [any(5.0, 8.0)],
      },
      dropdown('PROTEIN', PLUS_SCALE, ['Nil'], 'CHEMICAL EXAMINATION'),
      dropdown('GLUCOSE', PLUS_SCALE, ['Nil'], 'CHEMICAL EXAMINATION'),
      dropdown(
        'KETONE BODIES',
        ['NEGATIVE', 'POSITIVE'],
        ['NEGATIVE'],
        'CHEMICAL EXAMINATION',
      ),
      dropdown(
        'BILIRUBIN',
        ['NEGATIVE', 'POSITIVE'],
        ['NEGATIVE'],
        'CHEMICAL EXAMINATION',
      ),
      dropdown(
        'UROBILINOGEN',
        ['NORMAL', 'INCREASED'],
        ['NORMAL'],
        'CHEMICAL EXAMINATION',
      ),
      dropdown(
        'BLOOD',
        ['NEGATIVE', 'POSITIVE'],
        ['NEGATIVE'],
        'CHEMICAL EXAMINATION',
      ),
      {
        name: 'PUS CELLS',
        unit: '/hpf',
        group: 'MICROSCOPIC EXAMINATION',
        input: 'TEXT',
        def: '2-3',
        ranges: [textRange('0 - 5')],
      },
      {
        name: 'EPITHELIAL CELLS',
        unit: '/hpf',
        group: 'MICROSCOPIC EXAMINATION',
        input: 'TEXT',
        def: '1-2',
        ranges: [textRange('0 - 5')],
      },
      {
        name: 'RBCs',
        unit: '/hpf',
        group: 'MICROSCOPIC EXAMINATION',
        input: 'TEXT',
        def: 'Nil',
        ranges: [textRange('Nil')],
      },
      dropdown(
        'CASTS',
        ['ABSENT', 'PRESENT'],
        ['ABSENT'],
        'MICROSCOPIC EXAMINATION',
      ),
      dropdown(
        'CRYSTALS',
        ['ABSENT', 'CALCIUM OXALATE', 'URIC ACID', 'AMORPHOUS PHOSPHATES'],
        ['ABSENT'],
        'MICROSCOPIC EXAMINATION',
      ),
      dropdown(
        'BACTERIA',
        ['ABSENT', 'PRESENT'],
        ['ABSENT'],
        'MICROSCOPIC EXAMINATION',
      ),
    ],
  },
  {
    name: 'HISTOPATHOLOGY EXAMINATION',
    code: 'HPE',
    category: 'HISTOPATHOLOGY',
    type: 'DOCUMENT',
    price: 1500,
    sample: 'Tissue',
    method: 'Microscopy',
    params: [
      {
        name: 'REPORT',
        input: 'PARAGRAPH',
        result: 'FIXED',
        def: 'SPECIMEN:\n\nGROSS EXAMINATION:\n\nMICROSCOPIC EXAMINATION:\n\nIMPRESSION:',
      },
    ],
  },
  {
    name: 'BASIC HEALTH CHECKUP',
    code: 'PKG-BASIC',
    category: 'HEALTH PACKAGES',
    type: 'PANEL',
    price: 1999,
    panelCodes: ['CBC', 'ESR', 'FBS', 'LFT', 'KFT', 'LIPID', 'TFT', 'URINE-RM'],
  },
];
