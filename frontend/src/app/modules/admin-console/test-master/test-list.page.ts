import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LabApiService } from '../../../core/services/lab-api.service';

type Tab = 'TESTS' | 'PANEL' | 'BILL_ONLY';

const TYPE_LABEL: Record<string, string> = {
  SINGLE: 'Single',
  MULTIPLE: 'Multiple',
  NESTED: 'Nested',
  DOCUMENT: 'Document',
  PANEL: 'Panel',
  BILL_ONLY: 'Bill only',
};

/** Test master: every test grouped by department, with links to the editor. */
@Component({
  selector: 'hms-test-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="tl-page">
      <div class="tl-head">
        <div>
          <h1>Test list</h1>
          <p class="sub">
            Create tests, their parameters, units, methods and normal values. These drive result
            entry and the printed report.
          </p>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="exportCsv()">Export</button>
          <button type="button" class="btn btn-secondary" (click)="seed()" [disabled]="seeding()">
            {{ seeding() ? 'Loading…' : 'Load standard tests' }}
          </button>
          <a class="btn btn-secondary" routerLink="/test-profile-management/other-settings"
            >Units &amp; masters</a
          >
          <a
            class="btn btn-secondary"
            [routerLink]="[base, 'new']"
            [queryParams]="{ type: 'PANEL' }"
            >Add panel</a
          >
          <a class="btn btn-primary" [routerLink]="[base, 'new']">+ Add test</a>
        </div>
      </div>

      @if (message()) {
        <div class="alert">{{ message() }}</div>
      }

      <div class="x-tabs">
        <button type="button" [class.on]="tab() === 'TESTS'" (click)="tab.set('TESTS')">
          Tests <span>{{ counts().TESTS }}</span>
        </button>
        <button type="button" [class.on]="tab() === 'PANEL'" (click)="tab.set('PANEL')">
          Panels / packages <span>{{ counts().PANEL }}</span>
        </button>
        <button type="button" [class.on]="tab() === 'BILL_ONLY'" (click)="tab.set('BILL_ONLY')">
          Bill only <span>{{ counts().BILL_ONLY }}</span>
        </button>
      </div>

      <div class="filters">
        <input
          class="form-control search"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          placeholder="Search by name, code, alias or department…"
        />
        <select class="form-control dept" [ngModel]="dept()" (ngModelChange)="dept.set($event)">
          <option value="">All departments</option>
          @for (d of departments(); track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select>
        <span class="rows">{{ filtered().length }} tests</span>
      </div>

      @if (loading()) {
        <div class="card empty">Loading tests…</div>
      } @else if (!tests().length) {
        <div class="card empty">
          <h3>No tests yet</h3>
          <p>
            Start with the standard library (CBC, LFT, KFT, Lipid, Thyroid, Urine routine…) and edit
            it, or add your own test.
          </p>
          <button type="button" class="btn btn-primary" (click)="seed()">
            Load standard tests
          </button>
        </div>
      } @else if (!filtered().length) {
        <div class="card empty">No test matches your search.</div>
      } @else {
        <div class="card">
          <table class="tbl">
            <thead>
              <tr>
                <th>Test name</th>
                <th>Code</th>
                <th>Type</th>
                <th class="num">Parameters</th>
                <th>Sample</th>
                <th>Method</th>
                <th class="num">Price (₹)</th>
                <th>Outsourced</th>
                <th class="act"></th>
              </tr>
            </thead>
            <tbody>
              @for (g of groups(); track g.name) {
                <tr class="grp" (click)="toggle(g.name)">
                  <td colspan="9">
                    <span class="caret" [class.closed]="collapsed().has(g.name)">▾</span
                    >{{ g.name }} <span class="n">({{ g.items.length }})</span>
                  </td>
                </tr>
                @if (!collapsed().has(g.name)) {
                  @for (t of g.items; track t.id) {
                    <tr class="row" (click)="open(t)">
                      <td class="name">{{ t.name }}</td>
                      <td>{{ t.code || '—' }}</td>
                      <td>
                        <span class="type t-{{ t.testType }}">{{ typeLabel(t.testType) }}</span>
                      </td>
                      <td class="num">
                        {{
                          t.testType === 'PANEL'
                            ? (t.panelTestIds?.length || 0) + ' tests'
                            : t.paramCount
                        }}
                      </td>
                      <td class="clip">{{ t.sampleType || '—' }}</td>
                      <td class="clip">{{ t.method || '—' }}</td>
                      <td class="num">{{ t.price }}</td>
                      <td>
                        @if (t.isOutsourced) {
                          <span class="out">{{ t.outsourceCenter || 'Yes' }}</span>
                        } @else {
                          —
                        }
                      </td>
                      <td class="act" (click)="$event.stopPropagation()">
                        <button
                          type="button"
                          class="menu-btn"
                          (click)="menuFor.set(menuFor() === t.id ? null : t.id)"
                        >
                          ⋮
                        </button>
                        @if (menuFor() === t.id) {
                          <div class="menu">
                            <button type="button" (click)="open(t)">Edit</button>
                            <button type="button" (click)="duplicate(t)">Duplicate</button>
                            <button type="button" class="danger" (click)="remove(t)">
                              Disable
                            </button>
                          </div>
                        }
                      </td>
                    </tr>
                  }
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .tl-page {
        padding: 20px 24px 40px;
        background: #f8fafc;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .tl-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      h1 {
        margin: 0;
        font-family: var(--font-display);
        font-size: 22px;
      }
      .sub {
        margin: 4px 0 0;
        color: var(--text-secondary);
        font-size: 13px;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .actions a {
        text-decoration: none;
      }
      .alert {
        background: var(--clr-info-100);
        color: #075985;
        border: 1px solid #bae6fd;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
      }
      .x-tabs {
        display: flex;
        gap: 22px;
        border-bottom: 1px solid var(--border-default);
      }
      .x-tabs button {
        border: 0;
        background: none;
        padding: 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 2px solid transparent;
        cursor: pointer;
      }
      .x-tabs button.on {
        color: var(--clr-primary-700);
        border-bottom-color: var(--clr-primary-600);
      }
      .x-tabs span {
        background: var(--bg-muted);
        border-radius: 999px;
        padding: 0 7px;
        font-size: 11px;
        margin-left: 4px;
        color: var(--text-secondary);
      }
      .filters {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      .search {
        max-width: 420px;
        flex: 1;
        min-width: 220px;
      }
      .dept {
        width: 220px;
      }
      .rows {
        font-size: 13px;
        color: var(--text-secondary);
        margin-left: auto;
      }
      .card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: 10px;
        overflow: visible;
      }
      .empty {
        padding: 40px;
        text-align: center;
        color: var(--text-secondary);
      }
      .empty h3 {
        margin: 0 0 6px;
        color: var(--text-primary);
      }
      .tbl {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .tbl th {
        background: #f1f5f9;
        text-align: left;
        padding: 9px 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-default);
      }
      .tbl td {
        padding: 9px 12px;
        border-bottom: 1px solid var(--border-default);
        color: var(--text-primary);
      }
      .num {
        text-align: right;
      }
      .grp td {
        background: #f8fafc;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.04em;
        color: var(--clr-neutral-700);
        cursor: pointer;
      }
      .grp .n {
        font-weight: 500;
        color: var(--text-muted);
      }
      .caret {
        display: inline-block;
        width: 16px;
        transition: transform 0.15s;
      }
      .caret.closed {
        transform: rotate(-90deg);
      }
      .row {
        cursor: pointer;
      }
      .row:hover td {
        background: var(--clr-primary-50);
      }
      .name {
        font-weight: 600;
        padding-left: 28px !important;
      }
      .clip {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-secondary);
      }
      .type {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--bg-muted);
        color: var(--text-secondary);
      }
      .t-SINGLE {
        background: #ecfeff;
        color: #0e7490;
      }
      .t-MULTIPLE {
        background: #eef2ff;
        color: #4338ca;
      }
      .t-NESTED {
        background: #f5f3ff;
        color: #6d28d9;
      }
      .t-DOCUMENT {
        background: #fff7ed;
        color: #c2410c;
      }
      .t-PANEL {
        background: #f0fdf4;
        color: #15803d;
      }
      .out {
        font-size: 12px;
        background: #fef9c3;
        color: #854d0e;
        padding: 2px 8px;
        border-radius: 999px;
      }
      .act {
        width: 40px;
        position: relative;
      }
      .menu-btn {
        border: 0;
        background: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--text-muted);
        padding: 0 6px;
      }
      .menu {
        position: absolute;
        right: 8px;
        top: 34px;
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: 8px;
        box-shadow: 0 8px 20px rgb(0 0 0 / 0.12);
        z-index: 30;
        min-width: 130px;
        display: flex;
        flex-direction: column;
      }
      .menu button {
        border: 0;
        background: none;
        text-align: left;
        padding: 8px 14px;
        cursor: pointer;
        font-size: 13px;
      }
      .menu button:hover {
        background: var(--bg-muted);
      }
      .menu .danger {
        color: var(--clr-danger-600);
      }
    `,
  ],
})
export class TestListPage implements OnInit {
  private api = inject(LabApiService);
  private router = inject(Router);

  readonly base = '/test-profile-management/test-list';

  tests = signal<any[]>([]);
  loading = signal(true);
  seeding = signal(false);
  message = signal('');
  tab = signal<Tab>('TESTS');
  search = signal('');
  dept = signal('');
  collapsed = signal(new Set<string>());
  menuFor = signal<string | null>(null);

  private inTab = (t: any, tab: Tab) =>
    tab === 'PANEL'
      ? t.testType === 'PANEL'
      : tab === 'BILL_ONLY'
        ? t.testType === 'BILL_ONLY'
        : !['PANEL', 'BILL_ONLY'].includes(t.testType);

  counts = computed(() => {
    const all = this.tests();
    return {
      TESTS: all.filter((t) => this.inTab(t, 'TESTS')).length,
      PANEL: all.filter((t) => this.inTab(t, 'PANEL')).length,
      BILL_ONLY: all.filter((t) => this.inTab(t, 'BILL_ONLY')).length,
    };
  });

  departments = computed(() =>
    [...new Set(this.tests().map((t) => this.dep(t)))].sort(),
  );

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const d = this.dept();
    return this.tests().filter(
      (t) =>
        this.inTab(t, this.tab()) &&
        (!d || this.dep(t) === d) &&
        (!q ||
          [t.name, t.code, t.testAlias, t.category].some((v) =>
            (v || '').toLowerCase().includes(q),
          )),
    );
  });

  groups = computed(() => {
    const map = new Map<string, any[]>();
    for (const t of this.filtered()) {
      const k = this.dep(t);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, items]) => ({ name, items }));
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.listTests({ limit: 2000 }).subscribe({
      next: (r) => {
        this.tests.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.set('Could not load tests');
      },
    });
  }

  dep(t: any): string {
    return (t.category || 'UNASSIGNED').trim().toUpperCase();
  }

  typeLabel(t: string) {
    return TYPE_LABEL[t] ?? t;
  }

  toggle(name: string) {
    this.collapsed.update((s) => {
      const n = new Set(s);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  }

  open(t: any) {
    this.menuFor.set(null);
    this.router.navigate([this.base, t.id]);
  }

  duplicate(t: any) {
    this.menuFor.set(null);
    this.api.duplicateTest(t.id).subscribe({
      next: (copy) => this.router.navigate([this.base, copy.id]),
      error: (e) => this.message.set(e?.error?.message || 'Could not duplicate'),
    });
  }

  remove(t: any) {
    this.menuFor.set(null);
    if (!confirm(`Disable "${t.name}"? It can be restored from Cancelled Tests.`)) return;
    this.api.deleteTest(t.id).subscribe({
      next: () => this.tests.update((l) => l.filter((x) => x.id !== t.id)),
      error: (e) => this.message.set(e?.error?.message || 'Could not disable'),
    });
  }

  seed() {
    this.seeding.set(true);
    this.api.seedStandardTests().subscribe({
      next: (r) => {
        this.seeding.set(false);
        this.message.set(
          r.created.length
            ? `Added ${r.created.length} standard test(s). ${r.skipped.length ? r.skipped.length + ' already existed.' : ''}`
            : 'All standard tests already exist.',
        );
        this.load();
      },
      error: (e) => {
        this.seeding.set(false);
        this.message.set(e?.error?.message || 'Could not load standard tests');
      },
    });
  }

  exportCsv() {
    const rows = [
      [
        'Department',
        'Test name',
        'Code',
        'Type',
        'Parameters',
        'Sample',
        'Method',
        'Price',
        'Outsourced',
      ],
    ];
    for (const g of this.groups())
      for (const t of g.items)
        rows.push([
          g.name,
          t.name,
          t.code || '',
          this.typeLabel(t.testType),
          String(t.paramCount ?? ''),
          t.sampleType || '',
          t.method || '',
          String(t.price),
          t.isOutsourced ? t.outsourceCenter || 'Yes' : 'No',
        ]);
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `test-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
