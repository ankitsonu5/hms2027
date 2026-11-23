import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LabApiService, LabMaster } from '../../../core/services/lab-api.service';
import {
  RefRange,
  TestParam,
  ageLabel,
  rangeText,
  validateFormula,
} from '../../laboratory/lab-range';
import { NormalValueEditorComponent } from './normal-value-editor.component';

type TestType = 'SINGLE' | 'MULTIPLE' | 'NESTED' | 'DOCUMENT' | 'PANEL' | 'BILL_ONLY';
interface EditorParam extends TestParam {
  _key: number;
}
interface TestForm {
  name: string;
  code: string;
  category: string;
  testType: TestType;
  price: number | null;
  sampleTypes: string[];
  method: string;
  instrument: string;
  shortText: string;
  testAlias: string;
  isOutsourced: boolean;
  outsourceCenter: string;
  interpretation: string;
  printOnNewPage: boolean;
  panelTestIds: string[];
}

const TYPE_CARDS: { type: TestType; title: string; text: string; example: string }[] = [
  {
    type: 'SINGLE',
    title: 'Single parameter',
    text: 'One result value with its unit and normal range.',
    example: 'Random Sugar, Hb, ESR',
  },
  {
    type: 'MULTIPLE',
    title: 'Multiple parameters',
    text: 'A list of parameters, each with its own unit, method and range.',
    example: 'LFT, KFT, Lipid profile',
  },
  {
    type: 'NESTED',
    title: 'Multiple nested parameters',
    text: 'Parameters grouped under sub-headings on the report.',
    example: 'CBC, Urine routine',
  },
  {
    type: 'DOCUMENT',
    title: 'Document',
    text: 'Narrative report typed by the pathologist from a template.',
    example: 'Histopathology, FNAC, Culture',
  },
  {
    type: 'PANEL',
    title: 'Panel / Package',
    text: 'A bundle of existing tests billed together.',
    example: 'Health checkup, Fever panel',
  },
];

let keySeq = 1;

@Component({
  selector: 'hms-test-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, NormalValueEditorComponent],
  templateUrl: './test-editor.page.html',
  styleUrl: './test-editor.page.scss',
})
export class TestEditorPage implements OnInit {
  private api = inject(LabApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly typeCards = TYPE_CARDS;
  readonly listUrl = '/test-profile-management/test-list';

  testId = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  notice = signal('');

  form = signal<TestForm>(this.blankForm());
  params = signal<EditorParam[]>([]);

  categories = signal<LabMaster[]>([]);
  units = signal<LabMaster[]>([]);
  sampleTypes = signal<LabMaster[]>([]);
  methods = signal<LabMaster[]>([]);
  outsourceCenters = signal<LabMaster[]>([]);
  allTests = signal<any[]>([]);

  // modals
  rangeFor = signal<EditorParam | null>(null);
  optionsFor = signal<EditorParam | null>(null);
  optionsDraft = signal<{ value: string; normal: boolean }[]>([]);
  formulaFor = signal<EditorParam | null>(null);
  formulaDraft = signal('');
  panelSearch = signal('');

  isNew = computed(() => !this.testId());
  type = computed(() => this.form().testType);
  hasParamTable = computed(() => ['MULTIPLE', 'NESTED'].includes(this.type()));
  single = computed(() =>
    ['SINGLE', 'DOCUMENT'].includes(this.type()) ? (this.params()[0] ?? null) : null,
  );
  paramNames = computed(() =>
    this.params()
      .map((p) => p.name)
      .filter((n) => n?.trim()),
  );
  groups = computed(
    () =>
      [
        ...new Set(
          this.params()
            .map((p) => p.groupBy?.trim().toUpperCase())
            .filter(Boolean),
        ),
      ] as string[],
  );
  formulaError = computed(() =>
    this.formulaFor() ? validateFormula(this.formulaDraft(), this.paramNames()) : '',
  );

  panelMembers = computed(() => {
    const byId = new Map(this.allTests().map((t) => [t.id, t]));
    return this.form()
      .panelTestIds.map((id) => byId.get(id))
      .filter(Boolean);
  });
  panelMemberTotal = computed(() =>
    this.panelMembers().reduce((s, t: any) => s + Number(t.price || 0), 0),
  );
  panelCandidates = computed(() => {
    const q = this.panelSearch().trim().toLowerCase();
    const chosen = new Set(this.form().panelTestIds);
    return this.allTests()
      .filter(
        (t) =>
          t.id !== this.testId() &&
          !chosen.has(t.id) &&
          !['PANEL', 'BILL_ONLY'].includes(t.testType),
      )
      .filter(
        (t) => !q || t.name.toLowerCase().includes(q) || (t.code || '').toLowerCase().includes(q),
      )
      .slice(0, 12);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const presetType = this.route.snapshot.queryParamMap.get('type') as TestType | null;
    this.testId.set(id && id !== 'new' ? id : null);

    forkJoin({
      masters: this.api.listMasters(),
      tests: this.api.listTests({ limit: 1000 }),
    }).subscribe({
      next: ({ masters, tests }) => {
        this.setMasters(masters);
        this.allTests.set(tests.data ?? []);
        if (this.testId()) this.loadTest(this.testId()!);
        else {
          if (presetType) this.chooseType(presetType);
          this.loading.set(false);
        }
      },
      error: (e) => this.fail(e),
    });
  }

  private setMasters(all: LabMaster[]) {
    const of = (k: string) => all.filter((m) => m.kind === k);
    this.categories.set(of('CATEGORY'));
    this.units.set(of('UNIT'));
    this.sampleTypes.set(of('SAMPLE_TYPE'));
    this.methods.set(of('METHOD'));
    this.outsourceCenters.set(of('OUTSOURCE_CENTER'));
  }

  private blankForm(): TestForm {
    return {
      name: '',
      code: '',
      category: '',
      testType: '' as TestType,
      price: null,
      sampleTypes: [],
      method: '',
      instrument: '',
      shortText: '',
      testAlias: '',
      isOutsourced: false,
      outsourceCenter: '',
      interpretation: '',
      printOnNewPage: false,
      panelTestIds: [],
    };
  }

  private loadTest(id: string) {
    this.api.getTestDefinition(id).subscribe({
      next: (t) => {
        this.form.set({
          name: t.name ?? '',
          code: t.code ?? '',
          category: t.category ?? '',
          testType: t.testType,
          price: t.price != null ? Number(t.price) : null,
          sampleTypes: (t.sampleType ?? '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean),
          method: t.method ?? '',
          instrument: t.instrument ?? '',
          shortText: t.shortText ?? '',
          testAlias: t.testAlias ?? '',
          isOutsourced: !!t.isOutsourced,
          outsourceCenter: t.outsourceCenter ?? '',
          interpretation: t.interpretation ?? '',
          printOnNewPage: !!t.printOnNewPage,
          panelTestIds: t.panelTestIds ?? [],
        });
        this.params.set((t.parameters ?? []).map((p: TestParam) => ({ ...p, _key: keySeq++ })));
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }

  // ── Type selection ─────────────────────────────────────────────────────────

  chooseType(type: TestType) {
    this.form.update((f) => ({ ...f, testType: type }));
    if (type === 'SINGLE') this.params.set([this.newParam({ name: this.form().name })]);
    else if (type === 'DOCUMENT')
      this.params.set([
        this.newParam({ name: 'REPORT', inputType: 'PARAGRAPH', resultType: 'FIXED' }),
      ]);
    else if (type === 'MULTIPLE' || type === 'NESTED')
      this.params.set([this.newParam(), this.newParam()]);
    else this.params.set([]);
  }

  /** Switching between list types keeps the parameters already entered. */
  changeType(type: TestType) {
    const current = this.params();
    if (['MULTIPLE', 'NESTED'].includes(type) && current.length) {
      this.form.update((f) => ({ ...f, testType: type }));
      if (type === 'NESTED')
        this.params.update((ps) => ps.map((p) => ({ ...p, groupBy: p.groupBy || 'GENERAL' })));
      return;
    }
    if (type === 'SINGLE' && current.length) {
      this.form.update((f) => ({ ...f, testType: type }));
      this.params.set([
        {
          ...current[0],
          groupBy: null,
          resultType: current[0].resultType === 'FORMULA' ? 'MANUAL' : current[0].resultType,
        },
      ]);
      return;
    }
    this.chooseType(type);
  }

  newParam(p: Partial<TestParam> = {}): EditorParam {
    return {
      _key: keySeq++,
      name: '',
      unit: '',
      method: '',
      inputType: 'NUMERIC',
      resultType: 'MANUAL',
      ranges: [],
      ...p,
    };
  }

  // ── Form helpers ───────────────────────────────────────────────────────────

  patch(changes: Partial<TestForm>) {
    this.form.update((f) => ({ ...f, ...changes }));
  }

  touchParams() {
    this.params.update((ps) => [...ps]);
  }

  onNameChange(name: string) {
    const prev = this.form().name;
    this.patch({ name });
    const s = this.single();
    if (this.type() === 'SINGLE' && s && (!s.name || s.name === prev)) {
      s.name = name;
      this.touchParams();
    }
  }

  // callbacks for "+ New" buttons
  patchCategory = (name: string) => this.patch({ category: name });
  patchCenter = (name: string) => this.patch({ outsourceCenter: name });
  toggleSampleFn = (name: string) => {
    if (!this.form().sampleTypes.includes(name)) this.toggleSample(name);
  };

  toggleSample(name: string) {
    const cur = this.form().sampleTypes;
    this.patch({
      sampleTypes: cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name],
    });
  }

  addMaster(
    kind: 'CATEGORY' | 'SAMPLE_TYPE' | 'UNIT' | 'METHOD' | 'OUTSOURCE_CENTER',
    label: string,
    after?: (name: string) => void,
  ) {
    const name = prompt(`New ${label}`)?.trim();
    if (!name) return;
    this.api.createMaster(kind, kind === 'CATEGORY' ? name.toUpperCase() : name).subscribe({
      next: (m) => {
        const target = {
          CATEGORY: this.categories,
          SAMPLE_TYPE: this.sampleTypes,
          UNIT: this.units,
          METHOD: this.methods,
          OUTSOURCE_CENTER: this.outsourceCenters,
        }[kind];
        if (!target().some((x) => x.id === m.id)) target.update((l) => [...l, m]);
        after?.(m.name);
      },
      error: (e) => this.fail(e),
    });
  }

  // ── Parameter table ────────────────────────────────────────────────────────

  addParam() {
    const last = this.params().at(-1);
    this.params.update((ps) => [
      ...ps,
      this.newParam({ groupBy: this.type() === 'NESTED' ? (last?.groupBy ?? '') : null }),
    ]);
  }

  removeParam(p: EditorParam) {
    const used = this.params().filter(
      (x) =>
        x !== p &&
        x.resultType === 'FORMULA' &&
        (x.formula || '').toUpperCase().includes(`{${p.name.trim().toUpperCase()}}`),
    );
    if (
      used.length &&
      !confirm(
        `"${p.name}" is used in the formula of ${used.map((u) => u.name).join(', ')}. Remove anyway?`,
      )
    )
      return;
    this.params.update((ps) => ps.filter((x) => x !== p));
  }

  move(p: EditorParam, delta: number) {
    const ps = [...this.params()];
    const i = ps.indexOf(p);
    const j = i + delta;
    if (j < 0 || j >= ps.length) return;
    [ps[i], ps[j]] = [ps[j], ps[i]];
    this.params.set(ps);
  }

  // drag & drop reordering
  private dragKey: number | null = null;
  onDragStart(p: EditorParam) {
    this.dragKey = p._key;
  }
  onDrop(target: EditorParam) {
    const ps = [...this.params()];
    const from = ps.findIndex((x) => x._key === this.dragKey);
    const to = ps.indexOf(target);
    this.dragKey = null;
    if (from < 0 || from === to) return;
    const [moved] = ps.splice(from, 1);
    ps.splice(to, 0, moved);
    this.params.set(ps);
  }

  onResultTypeChange(p: EditorParam, value: string) {
    p.resultType = value;
    if (value === 'DROPDOWN' || value === 'MULTI_SELECT') {
      p.inputType = 'TEXT';
      if (!p.options?.length) this.openOptions(p);
    }
    if (value === 'FORMULA') {
      p.inputType = 'NUMERIC';
      this.openFormula(p);
    }
    this.touchParams();
  }

  rangeSummary(p: TestParam): string {
    const rs = p.ranges ?? [];
    if (!rs.length) return '';
    if (rs.length === 1) return rangeText(rs[0]);
    return `${rs.length} ranges`;
  }

  rangeTooltip(p: TestParam): string {
    return (p.ranges ?? []).map((r) => `${r.gender} · ${ageLabel(r)} · ${rangeText(r)}`).join('\n');
  }

  // ── Normal values modal ────────────────────────────────────────────────────

  openRanges(p: EditorParam) {
    if (!p.name?.trim()) {
      alert('Enter the parameter name first');
      return;
    }
    this.rangeFor.set(p);
  }

  onRangesSaved(ranges: RefRange[]) {
    const p = this.rangeFor();
    if (p) p.ranges = ranges;
    this.rangeFor.set(null);
    this.touchParams();
  }

  // ── Dropdown options modal ─────────────────────────────────────────────────

  openOptions(p: EditorParam) {
    const normal = new Set(p.normalOptions ?? []);
    const draft = (p.options ?? []).map((o) => ({ value: o, normal: normal.has(o) }));
    this.optionsDraft.set(
      draft.length
        ? draft
        : [
            { value: '', normal: true },
            { value: '', normal: false },
          ],
    );
    this.optionsFor.set(p);
  }

  addOption() {
    this.optionsDraft.update((d) => [...d, { value: '', normal: false }]);
  }

  removeOption(i: number) {
    this.optionsDraft.update((d) => d.filter((_, idx) => idx !== i));
  }

  saveOptions() {
    const p = this.optionsFor();
    if (!p) return;
    const rows = this.optionsDraft()
      .map((o) => ({ ...o, value: o.value.trim() }))
      .filter((o) => o.value);
    const values = [...new Set(rows.map((o) => o.value))];
    p.options = values;
    p.normalOptions = rows.filter((o) => o.normal).map((o) => o.value);
    if (p.defaultResult && !values.includes(p.defaultResult)) p.defaultResult = '';
    this.optionsFor.set(null);
    this.touchParams();
  }

  // ── Formula modal ──────────────────────────────────────────────────────────

  openFormula(p: EditorParam) {
    this.formulaDraft.set(p.formula ?? '');
    this.formulaFor.set(p);
  }

  insertRef(name: string) {
    this.formulaDraft.update((f) => `${f}${f && !f.endsWith(' ') ? ' ' : ''}{${name}}`);
  }

  insertOp(op: string) {
    this.formulaDraft.update((f) => `${f} ${op} `);
  }

  saveFormula() {
    const p = this.formulaFor();
    if (!p || this.formulaError()) return;
    p.formula = this.formulaDraft().trim();
    this.formulaFor.set(null);
    this.touchParams();
  }

  // ── Panel ──────────────────────────────────────────────────────────────────

  addPanelTest(id: string) {
    this.patch({ panelTestIds: [...this.form().panelTestIds, id] });
    this.panelSearch.set('');
  }

  removePanelTest(id: string) {
    this.patch({ panelTestIds: this.form().panelTestIds.filter((x) => x !== id) });
  }

  movePanelTest(id: string, delta: number) {
    const ids = [...this.form().panelTestIds];
    const i = ids.indexOf(id);
    const j = i + delta;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    this.patch({ panelTestIds: ids });
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  private validate(): string {
    const f = this.form();
    if (!f.name.trim()) return 'Test name is required';
    if (!f.category.trim()) return 'Select a department / category';
    if (f.price == null || Number(f.price) < 0) return 'Enter the price';
    if (f.isOutsourced && !f.outsourceCenter.trim()) return 'Select the outsource center';
    if (f.testType === 'PANEL' && !f.panelTestIds.length)
      return 'Add at least one test to the panel';
    if (this.hasParamTable()) {
      const ps = this.params().filter((p) => p.name?.trim());
      if (!ps.length) return 'Add at least one parameter';
      const seen = new Set<string>();
      for (const p of ps) {
        const k = p.name.trim().toUpperCase();
        if (seen.has(k)) return `Parameter "${p.name}" is listed twice`;
        seen.add(k);
        if (f.testType === 'NESTED' && !p.groupBy?.trim())
          return `Parameter "${p.name}" needs a group`;
        if (p.resultType === 'FORMULA') {
          const err = validateFormula(p.formula ?? '', this.paramNames());
          if (err) return `${p.name}: ${err}`;
        }
        if (['DROPDOWN', 'MULTI_SELECT'].includes(p.resultType ?? '') && !p.options?.length)
          return `${p.name}: add dropdown options`;
      }
    }
    return '';
  }

  private buildPayload() {
    const f = this.form();
    const clean = (v: any) => (typeof v === 'string' ? v.trim() || undefined : (v ?? undefined));
    const num = (v: any) => (v === '' || v == null ? undefined : Number(v));
    const params = ['PANEL', 'BILL_ONLY'].includes(f.testType)
      ? []
      : this.params()
          .filter((p) => p.name?.trim())
          .map((p) => ({
            id: p.id,
            name: p.name.trim(),
            unit: clean(p.unit),
            method: clean(p.method),
            inputType: p.inputType,
            resultType: p.resultType,
            options: p.options?.length ? p.options : undefined,
            normalOptions: p.normalOptions?.length ? p.normalOptions : undefined,
            defaultResult: clean(p.defaultResult),
            formula: p.resultType === 'FORMULA' ? clean(p.formula) : undefined,
            decimals: num(p.decimals),
            groupBy: f.testType === 'NESTED' ? clean(p.groupBy) : undefined,
            isOptional: !!p.isOptional,
            isBold: !!p.isBold,
            ranges: (p.ranges ?? []).map((r) => ({
              rangeType: r.rangeType,
              gender: r.gender,
              minAge: r.minAge,
              minAgeUnit: r.minAgeUnit,
              maxAge: r.maxAge,
              maxAgeUnit: r.maxAgeUnit,
              lowerValue: r.lowerValue ?? undefined,
              upperValue: r.upperValue ?? undefined,
              criticalLow: r.criticalLow ?? undefined,
              criticalHigh: r.criticalHigh ?? undefined,
              textValue: clean(r.textValue),
              displayText: clean(r.displayText),
              remark: clean(r.remark),
            })),
          }));
    return {
      name: f.name.trim(),
      code: clean(f.code),
      category: f.category,
      testType: f.testType,
      price: Number(f.price),
      sampleType: f.sampleTypes.join(', ') || undefined,
      method: clean(f.method),
      instrument: clean(f.instrument),
      shortText: clean(f.shortText),
      testAlias: clean(f.testAlias),
      isOutsourced: f.isOutsourced,
      outsourceCenter: f.isOutsourced ? clean(f.outsourceCenter) : undefined,
      interpretation: clean(f.interpretation),
      printOnNewPage: f.printOnNewPage,
      panelTestIds: f.testType === 'PANEL' ? f.panelTestIds : undefined,
      parameters: params,
    };
  }

  save(andClose = false) {
    const err = this.validate();
    if (err) {
      this.error.set(err);
      this.notice.set('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.error.set('');
    this.saving.set(true);
    const body = this.buildPayload();
    const req = this.testId()
      ? this.api.updateTestDefinition(this.testId()!, body)
      : this.api.createTestDefinition(body);
    req.subscribe({
      next: (t) => {
        this.saving.set(false);
        if (andClose) {
          this.router.navigate([this.listUrl]);
          return;
        }
        const wasNew = !this.testId();
        this.testId.set(t.id);
        this.params.set((t.parameters ?? []).map((p: TestParam) => ({ ...p, _key: keySeq++ })));
        this.notice.set('Saved');
        if (wasNew) this.router.navigate([this.listUrl, t.id], { replaceUrl: true });
        setTimeout(() => this.notice.set(''), 2500);
      },
      error: (e) => {
        this.saving.set(false);
        this.fail(e);
      },
    });
  }

  private fail(e: any) {
    this.loading.set(false);
    const msg = e?.error?.message;
    this.error.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Something went wrong');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
