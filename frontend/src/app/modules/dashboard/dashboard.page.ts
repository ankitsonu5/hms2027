import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { ChartComponent, SERIES } from '../../shared/components/chart.component';
import { ReportsApiService, Overview } from '../../core/services/reports-api.service';

const SURFACE = '#ffffff';
const GRID = '#f1f5f9';
const INK = '#64748b';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat('en-IN');

/** '2026-07' → 'Jul-26' */
function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(mo) - 1]}-${y.slice(2)}`;
}

/** Title-case an enum label: SCHEDULE_H → Schedule H */
function pretty(s: string): string {
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface LegendRow {
  color: string;
  label: string;
  value: string;
}

@Component({
  selector: 'hms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartComponent],
  styles: [
    `
      :host {
        display: block;
      }

      /* ── Page head ─────────────────────────────────────────────────── */
      .page-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--sp-4);
        margin-bottom: var(--sp-6);
      }

      .org-name {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-xl);
        letter-spacing: var(--ls-tight);
        color: var(--text-primary);
      }

      .org-sub {
        margin-top: var(--sp-1);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .range {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .range select {
        padding: var(--sp-2) var(--sp-3);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        cursor: pointer;
      }

      /* ── Grid ──────────────────────────────────────────────────────── */
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
        gap: var(--sp-5);
      }

      .card {
        display: flex;
        flex-direction: column;
        padding: var(--sp-5);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xs);
        transition:
          box-shadow var(--transition-fast),
          border-color var(--transition-fast);
      }

      .card:hover {
        border-color: var(--border-strong);
        box-shadow: var(--shadow-md);
      }

      .card__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }

      .card__title {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-base);
        color: var(--text-primary);
      }

      .card__total {
        font-family: var(--font-display);
        font-weight: var(--fw-display-black);
        color: var(--clr-primary-700);
      }

      .card__scope {
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      .card__body {
        display: flex;
        gap: var(--sp-5);
        align-items: flex-start;
      }

      .chart-box {
        flex: 1;
        min-width: 0;
      }

      .chart-box--donut {
        flex: 0 0 180px;
      }

      /* ── Legend (also the "relief" for low-contrast slots) ─────────── */
      .legend {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
        min-width: 0;
      }

      .legend--row {
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--sp-2) var(--sp-5);
        margin-top: var(--sp-3);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: var(--text-xs);
        color: var(--text-secondary);
        white-space: nowrap;
      }

      .swatch {
        flex: none;
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }

      .legend-val {
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
      }

      /* ── Empty state ───────────────────────────────────────────────── */
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--sp-2);
        min-height: 108px;
        padding: var(--sp-5);
        text-align: center;
        color: var(--text-muted);
        background: var(--clr-neutral-50);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
      }

      .empty strong {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
      }

      .empty span {
        font-size: var(--text-xs);
        max-width: 34ch;
        line-height: var(--lh-normal);
      }

      /* ── Card footer action ── */
      .card__foot {
        margin-top: var(--sp-4);
        padding-top: var(--sp-3);
        border-top: 1px solid var(--border-default);
      }

      .card__action {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-primary-600);
        text-decoration: none;
      }

      .card__action:hover {
        color: var(--clr-primary-700);
        gap: var(--sp-3);
      }

      /* ── Quick links ───────────────────────────────────────────────── */
      .ql-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--sp-5);
      }

      .ql-group-title {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        letter-spacing: var(--ls-wide);
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: var(--sp-2);
      }

      .ql-link {
        display: block;
        padding: var(--sp-1) 0;
        font-size: var(--text-sm);
        color: var(--clr-primary-600);
        text-decoration: none;
      }

      .ql-link:hover {
        color: var(--clr-primary-700);
        text-decoration: underline;
      }

      /* ── States ────────────────────────────────────────────────────── */
      .state {
        padding: var(--sp-8);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
      }

      .state--error {
        color: var(--clr-danger-600);
        background: var(--clr-danger-100);
        border-color: color-mix(in srgb, var(--clr-danger-600) 25%, transparent);
      }

      @media (max-width: 900px) {
        .grid,
        .ql-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .card__body {
          flex-direction: column;
          align-items: stretch;
        }

        .chart-box--donut {
          flex: none;
        }
      }
    `,
  ],
  template: `
    <div class="page-head">
      <div>
        <div class="org-name">{{ data()?.org?.name ?? '—' }}</div>
        <div class="org-sub">{{ data()?.org?.email }}</div>
      </div>

      <label class="range">
        Range
        <select [value]="months()" (change)="setRange($any($event.target).value)">
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
        </select>
      </label>
    </div>

    @if (loading()) {
      <div class="state">Loading overview…</div>
    } @else if (error()) {
      <div class="state state--error">{{ error() }}</div>
    } @else if (data(); as d) {
      <div class="grid">
        <!-- ── 1. Finance ────────────────────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Finance</span>
            <span class="card__total">{{ money(d.finance.total) }}</span>
          </div>
          @if (d.finance.total > 0) {
            <div class="chart-box">
              <hms-chart [config]="financeCfg()" [height]="220" />
            </div>
            <div class="legend legend--row">
              @for (r of financeLegend(); track r.label) {
                <span class="legend-item">
                  <span class="swatch" [style.background]="r.color"></span>
                  {{ r.label }} <span class="legend-val">{{ r.value }}</span>
                </span>
              }
            </div>
          } @else {
            <div class="empty">
              <strong>No billing yet</strong>
              <span>No bills have been raised in this period, so there is nothing to chart.</span>
            </div>
          }
          <div class="card__foot">
            <a class="card__action" routerLink="/billing">
              Revenue insights
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <!-- ── 2. Your Collections ───────────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Your Collections</span>
            <span class="card__total">{{ money(d.collections.total) }}</span>
          </div>
          @if (d.collections.total > 0) {
            <div class="card__body">
              <div class="chart-box chart-box--donut">
                <hms-chart [config]="collectionsCfg()" [height]="180" />
              </div>
              <div class="legend">
                @for (r of collectionsLegend(); track r.label) {
                  <span class="legend-item">
                    <span class="swatch" [style.background]="r.color"></span>
                    {{ r.label }} <span class="legend-val">{{ r.value }}</span>
                  </span>
                }
              </div>
            </div>
          } @else {
            <div class="empty">
              <strong>No payments recorded</strong>
              <span>Collections appear here once payments are taken against bills.</span>
            </div>
          }
          <div class="card__foot">
            <a class="card__action" routerLink="/billing">
              Collection insights
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <!-- ── 3. Patients ───────────────────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Patients</span>
            <span class="card__total">{{ count(d.patients.total) }}</span>
          </div>
          @if (d.patients.total > 0) {
            <div class="chart-box">
              <hms-chart [config]="patientsCfg()" [height]="220" />
            </div>
            <div class="legend legend--row">
              @for (r of patientsLegend(); track r.label) {
                <span class="legend-item">
                  <span class="swatch" [style.background]="r.color"></span>
                  {{ r.label }} <span class="legend-val">{{ r.value }}</span>
                </span>
              }
            </div>
          } @else {
            <div class="empty">
              <strong>No patients in range</strong>
              <span>Register a patient to see registrations and repeat visits here.</span>
            </div>
          }
          <div class="card__foot">
            <a class="card__action" routerLink="/patient">
              View patients
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <!-- ── 4. Average Patient's Rating ───────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Average Patient's Rating</span>
            <span class="card__scope">Not tracked</span>
          </div>
          <div class="empty">
            <strong>No rating data</strong>
            <span>
              HMS does not capture patient feedback yet — there is no rating field in the schema.
              This card stays empty until one is added.
            </span>
          </div>
        </section>

        <!-- ── 5. Finance Exceptions ─────────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Total Finance Exceptions</span>
            <span class="card__total">{{ count(d.financeExceptions.total) }}</span>
          </div>
          @if (d.financeExceptions.total > 0) {
            <div class="card__body">
              @if (finExcLegend().length >= 2) {
                <div class="chart-box chart-box--donut">
                  <hms-chart [config]="finExcCfg()" [height]="180" />
                </div>
              }
              <div class="legend">
                @for (r of finExcLegend(); track r.label) {
                  <span class="legend-item">
                    <span class="swatch" [style.background]="r.color"></span>
                    {{ r.label }} <span class="legend-val">{{ r.value }}</span>
                  </span>
                }
              </div>
            </div>
          } @else {
            <div class="empty">
              <strong>No finance exceptions</strong>
              <span>No cancelled bills, reversed payments or stale drafts. Nothing to action.</span>
            </div>
          }
          <div class="card__foot">
            <a class="card__action" routerLink="/billing">
              Review bills
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <!-- ── 6. Operation Exceptions ───────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Total Operation Exceptions</span>
            <span class="card__total">{{ count(d.operationExceptions.total) }}</span>
          </div>
          @if (d.operationExceptions.total > 0) {
            <div class="card__body">
              @if (opExcLegend().length >= 2) {
                <div class="chart-box chart-box--donut">
                  <hms-chart [config]="opExcCfg()" [height]="180" />
                </div>
              }
              <div class="legend">
                @for (r of opExcLegend(); track r.label) {
                  <span class="legend-item">
                    <span class="swatch" [style.background]="r.color"></span>
                    {{ r.label }} <span class="legend-val">{{ r.value }}</span>
                  </span>
                }
              </div>
            </div>
          } @else {
            <div class="empty">
              <strong>No operation exceptions</strong>
              <span>No cancelled lab orders, overdue samples or overdue results.</span>
            </div>
          }
          <div class="card__foot">
            <a class="card__action" routerLink="/laboratory">
              Open lab orders
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <!-- ── 7. Total Logins ───────────────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Total Logins</span>
            <span class="card__total">{{ count(d.logins.total) }}</span>
          </div>
          <div class="card__scope" style="margin-bottom:var(--sp-3)">Today, by role</div>
          @if (d.logins.total > 0) {
            <div class="card__body">
              @if (loginsLegend().length >= 2) {
                <div class="chart-box chart-box--donut">
                  <hms-chart [config]="loginsCfg()" [height]="180" />
                </div>
              }
              <div class="legend">
                @for (r of loginsLegend(); track r.label) {
                  <span class="legend-item">
                    <span class="swatch" [style.background]="r.color"></span>
                    {{ r.label }} <span class="legend-val">{{ r.value }}</span>
                  </span>
                }
              </div>
            </div>
          } @else {
            <div class="empty">
              <strong>No logins today</strong>
              <span>Counts users whose last sign-in falls on today's date.</span>
            </div>
          }
          <div class="card__foot">
            <a class="card__action" routerLink="/users-management">
              User settings
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <!-- ── 8. Quick Links ────────────────────────────────────────── -->
        <section class="card">
          <div class="card__head">
            <span class="card__title">Quick Links</span>
          </div>
          <div class="ql-grid">
            @for (g of quickLinks; track g.title) {
              <div>
                <div class="ql-group-title">{{ g.title }}</div>
                @for (l of g.links; track l.route) {
                  <a class="ql-link" [routerLink]="l.route">{{ l.label }}</a>
                }
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
})
export class DashboardPage implements OnInit {
  private api = inject(ReportsApiService);

  data = signal<Overview | null>(null);
  loading = signal(true);
  error = signal('');
  months = signal(12);

  quickLinks = [
    {
      title: 'Front Desk',
      links: [
        { label: 'Register Patient', route: '/patient/new' },
        { label: 'Patient List', route: '/patient' },
        { label: 'New OPD Visit', route: '/opd/new' },
      ],
    },
    {
      title: 'Clinical',
      links: [
        { label: 'Emergency', route: '/emergency' },
        { label: 'Lab Orders', route: '/laboratory' },
        { label: 'IPD Admissions', route: '/ipd' },
      ],
    },
    {
      title: 'Finance',
      links: [
        { label: 'Bills', route: '/billing' },
        { label: 'New Bill', route: '/billing/new' },
        { label: 'Pharmacy Sales', route: '/pharmacy' },
      ],
    },
    {
      title: 'Records',
      links: [
        { label: 'Reports', route: '/reports' },
        { label: 'Inventory', route: '/inventory' },
        { label: 'Compliance', route: '/compliance' },
      ],
    },
  ];

  ngOnInit(): void {
    this.load();
  }

  setRange(v: string): void {
    this.months.set(Number(v));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.overview(this.months()).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Could not load the overview.');
        this.loading.set(false);
      },
    });
  }

  money = (n: number) => inr.format(n);
  count = (n: number) => num.format(n);

  // ── Shared chart options ──────────────────────────────────────────────
  private barOpts(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: INK, font: { size: 10 } } },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: GRID },
          border: { display: false },
          ticks: { color: INK, font: { size: 10 } },
        },
      },
      plugins: { legend: { display: false } },
    };
  }

  private donutOpts(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { display: false } },
    };
  }

  // ── 1. Finance ────────────────────────────────────────────────────────
  financeCfg = computed<ChartConfiguration<'bar'>>(() => {
    const s = this.data()!.finance.series;
    return {
      type: 'bar',
      data: {
        labels: s.map((p) => monthLabel(p.month)),
        datasets: [
          {
            label: 'Paid',
            data: s.map((p) => p.paid),
            backgroundColor: SERIES[0],
            borderColor: SURFACE,
            borderWidth: 2,
            borderRadius: 4,
          },
          {
            label: 'Due',
            data: s.map((p) => p.due),
            backgroundColor: SERIES[3],
            borderColor: SURFACE,
            borderWidth: 2,
            borderRadius: 4,
          },
        ],
      },
      options: this.barOpts(),
    };
  });

  financeLegend = computed<LegendRow[]>(() => {
    const f = this.data()!.finance;
    return [
      { color: SERIES[0], label: 'Paid', value: this.money(f.paid) },
      { color: SERIES[3], label: 'Due', value: this.money(f.due) },
    ];
  });

  // ── 2. Collections ────────────────────────────────────────────────────
  collectionsCfg = computed<ChartConfiguration<'doughnut'>>(() => {
    const m = this.data()!.collections.byMode;
    return {
      type: 'doughnut',
      data: {
        labels: m.map((r) => pretty(r.mode)),
        datasets: [
          {
            data: m.map((r) => r.amount),
            backgroundColor: m.map((_, i) => SERIES[i % SERIES.length]),
            borderColor: SURFACE,
            borderWidth: 2,
          },
        ],
      },
      options: this.donutOpts(),
    };
  });

  collectionsLegend = computed<LegendRow[]>(() =>
    this.data()!.collections.byMode.map((r, i) => ({
      color: SERIES[i % SERIES.length],
      label: pretty(r.mode),
      value: this.money(r.amount),
    })),
  );

  // ── 3. Patients ───────────────────────────────────────────────────────
  patientsCfg = computed<ChartConfiguration<'bar'>>(() => {
    const s = this.data()!.patients.series;
    return {
      type: 'bar',
      data: {
        labels: s.map((p) => monthLabel(p.month)),
        datasets: [
          {
            label: 'New',
            data: s.map((p) => p.fresh),
            backgroundColor: SERIES[0],
            borderColor: SURFACE,
            borderWidth: 2,
            borderRadius: 4,
          },
          {
            label: 'Repeat',
            data: s.map((p) => p.repeat),
            backgroundColor: SERIES[2],
            borderColor: SURFACE,
            borderWidth: 2,
            borderRadius: 4,
          },
        ],
      },
      options: this.barOpts(),
    };
  });

  patientsLegend = computed<LegendRow[]>(() => {
    const s = this.data()!.patients.series;
    return [
      { color: SERIES[0], label: 'New', value: this.count(s.reduce((a, p) => a + p.fresh, 0)) },
      { color: SERIES[2], label: 'Repeat', value: this.count(s.reduce((a, p) => a + p.repeat, 0)) },
    ];
  });

  // ── 5/6/7. Bucket donuts ──────────────────────────────────────────────
  private bucketCfg(buckets: { label: string; count: number }[]): ChartConfiguration<'doughnut'> {
    const shown = buckets.filter((b) => b.count > 0);
    return {
      type: 'doughnut',
      data: {
        labels: shown.map((b) => b.label),
        datasets: [
          {
            data: shown.map((b) => b.count),
            backgroundColor: shown.map((_, i) => SERIES[i % SERIES.length]),
            borderColor: SURFACE,
            borderWidth: 2,
          },
        ],
      },
      options: this.donutOpts(),
    };
  }

  private bucketLegend(buckets: { label: string; count: number }[]): LegendRow[] {
    return buckets
      .filter((b) => b.count > 0)
      .map((b, i) => ({
        color: SERIES[i % SERIES.length],
        label: b.label,
        value: this.count(b.count),
      }));
  }

  finExcCfg = computed(() => this.bucketCfg(this.data()!.financeExceptions.buckets));
  finExcLegend = computed(() => this.bucketLegend(this.data()!.financeExceptions.buckets));

  opExcCfg = computed(() => this.bucketCfg(this.data()!.operationExceptions.buckets));
  opExcLegend = computed(() => this.bucketLegend(this.data()!.operationExceptions.buckets));

  loginsCfg = computed(() =>
    this.bucketCfg(this.data()!.logins.byRole.map((r) => ({ label: pretty(r.label), count: r.count }))),
  );
  loginsLegend = computed(() =>
    this.bucketLegend(this.data()!.logins.byRole.map((r) => ({ label: pretty(r.label), count: r.count }))),
  );
}
