import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LabApiService } from '../../core/services/lab-api.service';
import { ResultFlag, flagValue } from './lab-range';

export type Line =
  | { kind: 'category'; label: string; breakBefore: boolean }
  | {
      kind: 'test';
      label: string;
      sample: string | null;
      method: string | null;
      breakBefore: boolean;
    }
  | { kind: 'group'; label: string }
  | {
      kind: 'param';
      name: string;
      value: string;
      flag: ResultFlag;
      unit: string;
      range: string;
      method: string;
      bold: boolean;
      indent: boolean;
      single: boolean;
    }
  | { kind: 'subhead'; text: string; indent: boolean }
  | { kind: 'text'; text: string; indent: boolean; small: boolean };

const HEADINGS = new Set(['category', 'test', 'group', 'subhead']);
const A4_HEIGHT_MM = 297;
const PAGE_NO_MM = 7;

/**
 * Printable lab report (A4), paginated in the browser like the reference
 * system: every row is measured, then rows are distributed over fixed-size
 * pages, each carrying its own letterhead, patient block, column headings and
 * page number. This prints identically in every browser, unlike relying on
 * repeated <thead> rows. Without letterhead the same space stays blank for
 * pre-printed stationery.
 */
@Component({
  selector: 'hms-lab-report-print',
  standalone: true,
  imports: [DatePipe, NgTemplateOutlet],
  templateUrl: './lab-report-print.page.html',
  styleUrl: './lab-report-print.page.scss',
})
export class LabReportPrintPage implements OnInit {
  private api = inject(LabApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private measureBox = viewChild<ElementRef<HTMLElement>>('measure');

  orderId = '';
  loading = signal(true);
  error = signal('');
  ws = signal<any>(null);
  s = signal<any>(null);
  letterhead = signal(true);
  /** Line indexes per page; empty until measured. */
  pages = signal<number[][]>([]);
  measuring = signal(false);

  showUnit = computed(() => this.s()?.showUnitColumn !== false);
  showMethod = computed(() => this.s()?.showMethodColumn !== false);
  colCount = computed(() => 3 + (this.showUnit() ? 1 : 0) + (this.showMethod() ? 1 : 0));
  approved = computed(() => !!this.ws()?.order?.approvedAt);
  reportedAt = computed(() => this.ws()?.order?.approvedAt || this.ws()?.order?.resultEnteredAt);
  notes = computed(() => (this.s()?.footerNotes || '').split('\n').filter((l: string) => l.trim()));

  /** Report lines in print order; empty and hidden results are left out. */
  lines = computed<Line[]>(() => {
    const ws = this.ws();
    const s = this.s();
    if (!ws || !s) return [];
    const out: Line[] = [];
    const textLines = (text: string, indent: boolean) =>
      (text ?? '')
        .replace(/\r/g, '')
        .split('\n')
        .forEach((t) => out.push({ kind: 'text', text: t || ' ', indent, small: false }));
    let cat = '';
    let first = true;

    for (const t of ws.tests as any[]) {
      const visible = (t.parameters as any[]).filter(
        (p) => !p.hideInPrint && (p.value ?? '').toString().trim(),
      );
      const outsourcedOnly = t.isOutsourced && !visible.length;
      if (!visible.length && !outsourcedOnly) continue;

      const newCat = t.category !== cat;
      if (newCat) {
        cat = t.category;
        out.push({ kind: 'category', label: cat, breakBefore: !first && !!s.departmentOnNewPage });
      }
      const breakBefore = !first && !!t.printOnNewPage && !newCat;
      first = false;

      if (outsourcedOnly) {
        out.push({ kind: 'test', label: t.testName, sample: null, method: null, breakBefore });
        out.push({
          kind: 'text',
          text: `Report from ${t.outsourceCenter || 'the partner lab'} is attached separately.`,
          indent: false,
          small: true,
        });
        continue;
      }

      if (t.testType === 'DOCUMENT') {
        out.push({
          kind: 'test',
          label: t.testName,
          sample: s.showSampleType ? t.sampleType : null,
          method: null,
          breakBefore,
        });
        textLines(visible[0].value, false);
        if (t.interpretation)
          out.push({
            kind: 'text',
            text: `Interpretation: ${t.interpretation}`,
            indent: false,
            small: true,
          });
        continue;
      }

      const single = visible.length === 1 && t.testType === 'SINGLE';
      // A method shared by every row is printed once next to the test name.
      const methods = [...new Set(visible.map((p: any) => p.method || t.method || ''))];
      const testMethod: string = single ? '' : methods.length === 1 ? methods[0] : t.method || '';
      if (!single) {
        out.push({
          kind: 'test',
          label: t.testName,
          sample: s.showSampleType ? t.sampleType : null,
          method: testMethod || null,
          breakBefore,
        });
      }
      let group = '';
      for (const p of visible) {
        if (p.groupBy && p.groupBy !== group) {
          group = p.groupBy;
          const inGroup = visible.filter((x: any) => x.groupBy === group);
          // Skip a heading that would just repeat its only parameter's name.
          if (!(inGroup.length === 1 && inGroup[0].name.trim().toUpperCase() === group)) {
            out.push({ kind: 'group', label: group });
          }
        }
        const indent = !!p.groupBy && p.name.trim().toUpperCase() !== p.groupBy;
        if (p.inputType === 'PARAGRAPH') {
          out.push({ kind: 'subhead', text: single ? t.testName : p.name, indent });
          textLines(p.value, indent);
          continue;
        }
        const flag: ResultFlag = p.parameterId
          ? flagValue(p.value, p.range, p.normalOptions)
          : (p.flag as ResultFlag) || '';
        const method = p.method || t.method || '';
        out.push({
          kind: 'param',
          name: single ? t.testName : p.name,
          value: p.value,
          flag,
          unit: p.unit || '',
          range: p.rangeText || '',
          method: method === testMethod ? '' : method,
          bold: p.isBold,
          indent,
          single,
        });
        if (p.remark) out.push({ kind: 'text', text: p.remark, indent, small: true });
      }
      if (t.interpretation)
        out.push({
          kind: 'text',
          text: `Interpretation: ${t.interpretation}`,
          indent: false,
          small: true,
        });
    }
    return out;
  });

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    const lh = this.route.snapshot.queryParamMap.get('lh');
    forkJoin({
      ws: this.api.getWorksheet(this.orderId),
      s: this.api.getReportSettings(),
    }).subscribe({
      next: ({ ws, s }) => {
        this.ws.set(ws);
        this.s.set({ ...s, fontSizePt: Number(s.fontSizePt) || 10 });
        this.letterhead.set(lh != null ? lh !== '0' : s.letterheadByDefault !== false);
        this.loading.set(false);
        this.measuring.set(true);
        // Measure once the hidden copy has rendered and web fonts are ready.
        setTimeout(() => document.fonts.ready.then(() => this.paginate()));
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message || 'Could not load the report');
      },
    });
  }

  /** Splits the measured rows into A4 pages. */
  private paginate() {
    const box = this.measureBox()?.nativeElement;
    const lines = this.lines();
    if (!box) {
      this.pages.set([lines.map((_, i) => i)]);
      this.measuring.set(false);
      return;
    }
    const pxPerMm = (box.querySelector('.mm-probe') as HTMLElement).offsetHeight / 100;
    const mm = (el: Element | null) =>
      el ? (el as HTMLElement).getBoundingClientRect().height / pxPerMm : 0;

    const rowH = new Array(lines.length).fill(0);
    box
      .querySelectorAll<HTMLElement>('tr[data-i]')
      .forEach((tr) => (rowH[Number(tr.dataset['i'])] += mm(tr)));

    const s = this.s();
    const body =
      A4_HEIGHT_MM -
      Number(s.headerHeightMm || 0) -
      Number(s.footerHeightMm || 0) -
      mm(box.querySelector('.pblock-wrap')) -
      mm(box.querySelector('thead')) -
      PAGE_NO_MM -
      2;
    const closingH = mm(box.querySelector('.closing'));

    const pages: number[][] = [[]];
    let used = 0;
    const newPage = () => {
      if (pages[pages.length - 1].length) pages.push([]);
      used = 0;
    };
    lines.forEach((line, i) => {
      const h = rowH[i];
      if ('breakBefore' in line && line.breakBefore) newPage();
      // Keep a heading (and any headings straight after it) together with the first real row.
      let need = h;
      if (HEADINGS.has(line.kind)) {
        let j = i + 1;
        while (j < lines.length && HEADINGS.has(lines[j].kind)) need += rowH[j++];
        need += rowH[j] ?? 0;
      }
      if (used + need > body && pages[pages.length - 1].length) newPage();
      pages[pages.length - 1].push(i);
      used += h;
    });
    if (used + closingH > body) pages.push([]);

    this.pages.set(pages);
    this.measuring.set(false);
  }

  line(i: number): Line {
    return this.lines()[i];
  }

  genderText(g: string | undefined) {
    return g ? g.charAt(0) + g.slice(1).toLowerCase() : '—';
  }

  isAbnormal(f: ResultFlag) {
    return !!f && f !== 'NORMAL';
  }

  flagText(f: ResultFlag): string {
    const style = this.s()?.flagStyle ?? 'HL';
    if (!this.isAbnormal(f) || style === 'BOLD') return '';
    if (style === 'ARROW')
      return f === 'LOW' || f === 'CRITICAL_LOW' ? '↓' : f === 'ABNORMAL' ? '*' : '↑';
    const map: Record<string, string> = {
      LOW: 'L',
      HIGH: 'H',
      CRITICAL_LOW: 'L*',
      CRITICAL_HIGH: 'H*',
      ABNORMAL: '*',
    };
    return map[f] ?? '';
  }

  print() {
    this.api.markReportPrinted(this.orderId).subscribe({ error: () => undefined });
    window.print();
  }

  back() {
    if (history.length > 1) history.back();
    else this.router.navigate(['/laboratory/results', this.orderId]);
  }
}
