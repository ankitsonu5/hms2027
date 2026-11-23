import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LabApiService } from '../../core/services/lab-api.service';
import { FLAG_LABEL, ResultFlag, evaluateFormula, flagValue, roundTo } from './lab-range';

interface WsParam {
  parameterId: string | null;
  name: string;
  unit: string | null;
  method: string | null;
  inputType: string;
  resultType: string;
  options: string[] | null;
  normalOptions: string[] | null;
  defaultResult: string | null;
  formula: string | null;
  decimals: number | null;
  groupBy: string | null;
  isOptional: boolean;
  isBold: boolean;
  range: any;
  rangeText: string;
  remark: string | null;
  value: string | null;
  flag: string | null;
  hideInPrint: boolean;
  saved: boolean;
  // ui
  _idx?: number;
}

interface WsTest {
  testId: string;
  testName: string;
  category: string;
  testType: string;
  method: string | null;
  sampleType: string | null;
  isOutsourced: boolean;
  outsourceCenter: string | null;
  panelName: string | null;
  reportUrl: string | null;
  parameters: WsParam[];
}

interface Row {
  kind: 'category' | 'test' | 'group' | 'param';
  label?: string;
  test?: WsTest;
  param?: WsParam;
}

/**
 * Result entry for one lab order, parameter by parameter. The normal value
 * shown is the band matching the patient's age and gender; flags and formula
 * results update while typing. Enter / Tab moves to the next result.
 */
@Component({
  selector: 'hms-lab-result-entry',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './lab-result-entry.page.html',
  styleUrl: './lab-result-entry.page.scss',
})
export class LabResultPage implements OnInit {
  private api = inject(LabApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderId = '';
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  notice = signal('');
  dirty = signal(false);

  order = signal<any>(null);
  patient = signal<any>(null);
  tests = signal<WsTest[]>([]);
  /** Bumped on every edit so computed views refresh (params are mutated in place). */
  private tick = signal(0);

  readonly flagLabel = FLAG_LABEL;

  rows = computed<Row[]>(() => {
    this.tick();
    const out: Row[] = [];
    let cat = '';
    let idx = 0;
    for (const t of this.tests()) {
      if (t.category !== cat) {
        cat = t.category;
        out.push({ kind: 'category', label: cat });
      }
      out.push({ kind: 'test', test: t });
      let group = '';
      for (const p of t.parameters) {
        if (p.groupBy && p.groupBy !== group) {
          group = p.groupBy;
          out.push({ kind: 'group', label: group, test: t });
        }
        p._idx = idx++;
        out.push({ kind: 'param', test: t, param: p });
      }
    }
    return out;
  });

  progress = computed(() => {
    this.tick();
    const all = this.tests().flatMap((t) =>
      t.parameters.filter((p) => !p.isOptional && p.resultType !== 'FORMULA'),
    );
    const done = all.filter((p) => (p.value ?? '').toString().trim()).length;
    return { done, total: all.length };
  });

  abnormalCount = computed(() => {
    this.tick();
    return this.tests()
      .flatMap((t) => t.parameters)
      .filter((p) => this.flagOf(p) && this.flagOf(p) !== 'NORMAL').length;
  });

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getWorksheet(this.orderId).subscribe({
      next: (ws) => this.applyWorksheet(ws),
      error: (e) => this.fail(e),
    });
  }

  private applyWorksheet(ws: any) {
    for (const t of ws.tests as WsTest[]) {
      for (const p of t.parameters) {
        if (
          !p.saved &&
          (p.value == null || p.value === '') &&
          p.defaultResult &&
          p.resultType !== 'FORMULA'
        ) {
          p.value = p.defaultResult;
        }
      }
      this.applyFormulas(t);
    }
    this.order.set(ws.order);
    this.patient.set(ws.patient);
    this.tests.set(ws.tests);
    this.loading.set(false);
    this.dirty.set(false);
    this.tick.update((n) => n + 1);
  }

  // ── Editing ────────────────────────────────────────────────────────────────

  onValue(t: WsTest, p: WsParam, value: string) {
    p.value = value;
    this.applyFormulas(t);
    this.dirty.set(true);
    this.tick.update((n) => n + 1);
  }

  toggleMulti(t: WsTest, p: WsParam, option: string, on: boolean) {
    const cur = (p.value ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = on ? [...new Set([...cur, option])] : cur.filter((c) => c !== option);
    this.onValue(t, p, (p.options ?? []).filter((o) => next.includes(o)).join(', '));
  }

  isPicked(p: WsParam, option: string) {
    return (p.value ?? '')
      .split(',')
      .map((s) => s.trim())
      .includes(option);
  }

  setHidden(p: WsParam, hidden: boolean) {
    p.hideInPrint = hidden;
    this.dirty.set(true);
    this.tick.update((n) => n + 1);
  }

  testHidden(t: WsTest) {
    return t.parameters.length > 0 && t.parameters.every((p) => p.hideInPrint);
  }

  setTestHidden(t: WsTest, hidden: boolean) {
    t.parameters.forEach((p) => (p.hideInPrint = hidden));
    this.dirty.set(true);
    this.tick.update((n) => n + 1);
  }

  /** Recalculate formula parameters of a test (a few passes so formulas may use other formulas). */
  private applyFormulas(t: WsTest) {
    const formulas = t.parameters.filter((p) => p.resultType === 'FORMULA' && p.formula);
    if (!formulas.length) return;
    const byName = new Map(t.parameters.map((p) => [p.name.trim().toUpperCase(), p]));
    const lookup = (name: string) => {
      const raw = (byName.get(name.trim().toUpperCase())?.value ?? '')
        .toString()
        .replace(/,/g, '')
        .trim();
      return raw !== '' && !Number.isNaN(Number(raw)) ? Number(raw) : null;
    };
    for (let pass = 0; pass < 3; pass++) {
      for (const p of formulas) {
        const v = evaluateFormula(p.formula!, lookup);
        p.value = v == null ? '' : roundTo(v, p.decimals);
      }
    }
  }

  flagOf(p: WsParam): ResultFlag {
    if (!p.parameterId) return (p.flag as ResultFlag) || '';
    return flagValue(p.value, p.range, p.normalOptions);
  }

  flagClass(p: WsParam) {
    const f = this.flagOf(p);
    if (!f || f === 'NORMAL') return '';
    return f.startsWith('CRITICAL') ? 'crit' : 'abn';
  }

  /** Enter / Tab / arrows move between result inputs. */
  onKey(e: KeyboardEvent, p: WsParam) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' && e.key === 'Enter' && !e.ctrlKey) return;
    let delta = 0;
    if (e.key === 'Enter' || e.key === 'ArrowDown') delta = 1;
    if (e.key === 'ArrowUp') delta = -1;
    if (!delta) return;
    e.preventDefault();
    const inputs = Array.from(document.querySelectorAll<HTMLElement>('[data-result-input]'));
    const i = inputs.indexOf(target);
    inputs[i + delta]?.focus();
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  private payload() {
    return this.tests().flatMap((t) =>
      t.parameters.map((p) => ({
        testId: t.testId,
        ...(p.parameterId ? { parameterId: p.parameterId } : {}),
        value: (p.value ?? '').toString(),
        hideInPrint: !!p.hideInPrint,
      })),
    );
  }

  save(then?: 'approve' | 'print') {
    this.saving.set(true);
    this.error.set('');
    this.api
      .saveOrderResults(this.orderId, { results: this.payload(), approve: then === 'approve' })
      .subscribe({
        next: (ws) => {
          this.saving.set(false);
          this.applyWorksheet(ws);
          this.flash(then === 'approve' ? 'Saved and approved' : 'Results saved');
          if (then === 'print') this.openPrint();
        },
        error: (e) => {
          this.saving.set(false);
          this.fail(e);
        },
      });
  }

  unapprove() {
    this.api.approveReport(this.orderId, false).subscribe({
      next: (r) => {
        this.order.update((o) => ({ ...o, ...r }));
        this.flash('Approval removed');
      },
      error: (e) => this.fail(e),
    });
  }

  openPrint() {
    if (this.dirty() && !confirm('You have unsaved changes. Print the last saved report anyway?'))
      return;
    this.router.navigate(['/print/lab-report', this.orderId]);
  }

  back() {
    if (this.dirty() && !confirm('Discard unsaved results?')) return;
    this.router.navigate(['/laboratory']);
  }

  statusLabel(s: string) {
    return (
      (
        {
          ORDERED: 'Ordered',
          SAMPLE_COLLECTED: 'Sample collected',
          IN_PROGRESS: 'In progress',
          COMPLETED: 'Completed',
        } as any
      )[s] ?? s
    );
  }

  private flash(msg: string) {
    this.notice.set(msg);
    setTimeout(() => this.notice.set(''), 2500);
  }

  private fail(e: any) {
    this.loading.set(false);
    const m = e?.error?.message;
    this.error.set(Array.isArray(m) ? m.join(', ') : m || 'Something went wrong');
  }
}
