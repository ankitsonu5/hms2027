import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LabApiService, LabMaster } from '../../../core/services/lab-api.service';

const KINDS: { kind: LabMaster['kind']; label: string; hint: string }[] = [
  {
    kind: 'CATEGORY',
    label: 'Departments',
    hint: 'Report headings. "Print order" decides which department prints first on a report.',
  },
  {
    kind: 'UNIT',
    label: 'Units',
    hint: 'Offered when choosing a parameter unit (you can still type any unit).',
  },
  { kind: 'SAMPLE_TYPE', label: 'Sample types', hint: 'Sample types a test can be collected in.' },
  { kind: 'METHOD', label: 'Methods', hint: 'Test methods printed on the report.' },
  {
    kind: 'OUTSOURCE_CENTER',
    label: 'Outsource centers',
    hint: 'Partner labs that perform outsourced tests.',
  },
];

/** Lookup lists used by the test master (units, sample types, departments…). */
@Component({
  selector: 'hms-lab-masters',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="lm-page">
      <div class="lm-head">
        <div>
          <a routerLink="/test-profile-management/test-list" class="back">← Test list</a>
          <h1>Units &amp; masters</h1>
        </div>
      </div>

      <div class="x-tabs">
        @for (k of kinds; track k.kind) {
          <button type="button" [class.on]="kind() === k.kind" (click)="kind.set(k.kind)">
            {{ k.label }} <span>{{ countOf(k.kind) }}</span>
          </button>
        }
      </div>
      <p class="hint">{{ current().hint }}</p>

      @if (error()) {
        <div class="alert">{{ error() }}</div>
      }

      <div class="card">
        <form class="add" (ngSubmit)="add()">
          <input
            class="form-control"
            name="newName"
            [(ngModel)]="newName"
            placeholder="Add {{ current().label.toLowerCase() }}…"
          />
          <button class="btn btn-primary" type="submit" [disabled]="!newName.trim()">Add</button>
        </form>
        <table class="tbl">
          <thead>
            <tr>
              <th>Name</th>
              @if (kind() === 'CATEGORY') {
                <th class="w">Print order</th>
              }
              <th class="w"></th>
            </tr>
          </thead>
          <tbody>
            @for (m of rows(); track m.id) {
              <tr>
                <td>
                  @if (editing() === m.id) {
                    <input
                      class="form-control sm"
                      [(ngModel)]="editName"
                      (keydown.enter)="rename(m)"
                      (keydown.escape)="editing.set(null)"
                    />
                  } @else {
                    {{ m.name }}
                  }
                </td>
                @if (kind() === 'CATEGORY') {
                  <td>
                    <input
                      class="form-control sm"
                      type="number"
                      [ngModel]="m.sortOrder"
                      (change)="reorder(m, $any($event.target).value)"
                    />
                  </td>
                }
                <td class="acts">
                  @if (editing() === m.id) {
                    <button type="button" class="link" (click)="rename(m)">Save</button>
                  } @else {
                    <button
                      type="button"
                      class="link"
                      (click)="editing.set(m.id); editName = m.name"
                    >
                      Rename
                    </button>
                  }
                  <button type="button" class="link danger" (click)="remove(m)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="muted">Nothing added yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .lm-page {
        padding: 20px 24px 40px;
        background: #f8fafc;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 900px;
      }
      h1 {
        margin: 4px 0 0;
        font-family: var(--font-display);
        font-size: 22px;
      }
      .back {
        color: var(--clr-primary-700);
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
      }
      .x-tabs {
        display: flex;
        gap: 20px;
        border-bottom: 1px solid var(--border-default);
        flex-wrap: wrap;
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
      }
      .hint {
        margin: 0;
        color: var(--text-secondary);
        font-size: 13px;
      }
      .alert {
        background: var(--clr-danger-100);
        color: #991b1b;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
      }
      .card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: 10px;
      }
      .add {
        display: flex;
        gap: 8px;
        padding: 14px;
        border-bottom: 1px solid var(--border-default);
      }
      .tbl {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      .tbl th {
        text-align: left;
        background: #f1f5f9;
        padding: 8px 14px;
        font-size: 11px;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      .tbl td {
        padding: 8px 14px;
        border-top: 1px solid var(--border-default);
      }
      .w {
        width: 150px;
      }
      .form-control.sm {
        padding: 4px 8px;
        font-size: 13px;
      }
      .acts {
        text-align: right;
        white-space: nowrap;
      }
      .link {
        border: 0;
        background: none;
        color: var(--clr-primary-700);
        cursor: pointer;
        font-size: 13px;
        margin-left: 10px;
      }
      .link.danger {
        color: var(--clr-danger-600);
      }
      .muted {
        color: var(--text-muted);
        text-align: center;
        padding: 20px;
      }
    `,
  ],
})
export class LabMastersPage implements OnInit {
  private api = inject(LabApiService);
  readonly kinds = KINDS;

  all = signal<LabMaster[]>([]);
  kind = signal<LabMaster['kind']>('CATEGORY');
  editing = signal<string | null>(null);
  error = signal('');
  newName = '';
  editName = '';

  current = computed(() => KINDS.find((k) => k.kind === this.kind())!);
  rows = computed(() =>
    this.all()
      .filter((m) => m.kind === this.kind())
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
  );

  ngOnInit() {
    this.api.listMasters().subscribe((l) => this.all.set(l));
  }

  countOf(kind: string) {
    return this.all().filter((m) => m.kind === kind).length;
  }

  add() {
    const name = this.newName.trim();
    if (!name) return;
    const next = (this.rows().at(-1)?.sortOrder ?? 0) + 10;
    this.api
      .createMaster(this.kind(), this.kind() === 'CATEGORY' ? name.toUpperCase() : name, next)
      .subscribe({
        next: (m) => {
          this.all.update((l) => [...l.filter((x) => x.id !== m.id), m]);
          this.newName = '';
          this.error.set('');
        },
        error: (e) => this.error.set(e?.error?.message || 'Could not add'),
      });
  }

  rename(m: LabMaster) {
    const name = this.editName.trim();
    if (!name) return;
    this.api.updateMaster(m.id, { name }).subscribe({
      next: (u) => {
        this.all.update((l) => l.map((x) => (x.id === u.id ? u : x)));
        this.editing.set(null);
      },
      error: (e) =>
        this.error.set(e?.error?.message || 'Could not rename (name may already exist)'),
    });
  }

  reorder(m: LabMaster, value: string) {
    const sortOrder = Math.round(Number(value));
    if (!Number.isFinite(sortOrder)) return;
    this.api
      .updateMaster(m.id, { sortOrder })
      .subscribe((u) => this.all.update((l) => l.map((x) => (x.id === u.id ? u : x))));
  }

  remove(m: LabMaster) {
    if (!confirm(`Delete "${m.name}"? Tests already using it keep their value.`)) return;
    this.api
      .deleteMaster(m.id)
      .subscribe(() => this.all.update((l) => l.filter((x) => x.id !== m.id)));
  }
}
