import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmergencyApiService } from '../../core/services/emergency-api.service';

interface EmergencyRecord {
  id: number | string;
  patientName: string;
  triageTag: 'RED' | 'YELLOW' | 'GREEN';
  chiefComplaint: string;
  attendedByDoctorName?: string;
  disposition?: string;
  createdAt: string;
}

@Component({
  selector: 'hms-emergency-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [
    `
      .page-wrap {
        padding: var(--sp-6, 1.5rem);
        background: var(--bg-base);
        min-height: 100%;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-6, 1.5rem);
      }
      .page-title {
        font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
        font-weight: var(--fw-bold, 700);
        font-size: var(--text-2xl, 1.5rem);
        color: var(--clr-neutral-900, #111827);
        margin: 0;
      }
      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2, 0.5rem);
        padding: var(--sp-2, 0.5rem) var(--sp-4, 1rem);
        background: var(--clr-primary-600, #dc2626);
        color: #fff;
        border: none;
        border-radius: var(--radius-md, 0.375rem);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-weight: var(--fw-semibold, 600);
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        transition: var(--transition-base, background 0.15s ease);
      }
      .btn-primary:hover {
        background: var(--clr-primary-700, #b91c1c);
      }
      .filters-bar {
        display: flex;
        align-items: center;
        gap: var(--sp-3, 0.75rem);
        margin-bottom: var(--sp-5, 1.25rem);
        flex-wrap: wrap;
      }
      .filter-label {
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        font-weight: var(--fw-medium, 500);
        color: var(--clr-neutral-600, #4b5563);
      }
      .filter-select {
        padding: var(--sp-1, 0.25rem) var(--sp-3, 0.75rem);
        border: 1px solid var(--border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        background: var(--bg-surface, #fff);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        color: var(--clr-neutral-800, #1f2937);
        cursor: pointer;
      }
      .filter-select:focus {
        outline: none;
        border-color: var(--clr-primary-500, #ef4444);
        box-shadow: 0 0 0 3px var(--clr-primary-100, #fee2e2);
      }
      .card {
        background: var(--bg-surface, #fff);
        border: 1px solid var(--border-default, #e5e7eb);
        border-radius: var(--radius-lg, 0.5rem);
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
        overflow: hidden;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
      }
      thead {
        background: var(--bg-muted, #f9fafb);
      }
      thead th {
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        text-align: left;
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-weight: var(--fw-semibold, 600);
        font-size: var(--text-xs, 0.75rem);
        color: var(--clr-neutral-500, #6b7280);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border-default, #e5e7eb);
        white-space: nowrap;
      }
      tbody tr {
        border-bottom: 1px solid var(--border-default, #e5e7eb);
        transition: background 0.1s;
      }
      tbody tr:last-child {
        border-bottom: none;
      }
      tbody tr:hover {
        background: var(--bg-muted, #f9fafb);
      }
      td {
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        color: var(--clr-neutral-800, #1f2937);
        vertical-align: middle;
      }
      .patient-name {
        font-weight: var(--fw-semibold, 600);
        color: var(--clr-neutral-900, #111827);
      }
      .complaint-cell {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--clr-neutral-600, #4b5563);
      }
      .attended-cell {
        color: var(--clr-neutral-600, #4b5563);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-full, 9999px);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-xs, 0.75rem);
        font-weight: var(--fw-bold, 700);
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .badge-red {
        background: var(--clr-danger-100, #fee2e2);
        color: var(--clr-danger-700, #b91c1c);
      }
      .badge-yellow {
        background: var(--clr-warning-100, #fef9c3);
        color: var(--clr-warning-700, #a16207);
      }
      .badge-green {
        background: var(--clr-success-100, #dcfce7);
        color: var(--clr-success-700, #15803d);
      }
      .disposition-text {
        color: var(--clr-neutral-600, #4b5563);
        font-size: var(--text-xs, 0.75rem);
      }
      .time-text {
        color: var(--clr-neutral-500, #6b7280);
        white-space: nowrap;
        font-size: var(--text-xs, 0.75rem);
      }
      .actions-cell {
        display: flex;
        align-items: center;
        gap: var(--sp-2, 0.5rem);
      }
      .btn-link {
        background: none;
        border: none;
        padding: var(--sp-1, 0.25rem) var(--sp-2, 0.5rem);
        border-radius: var(--radius-sm, 0.25rem);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        font-weight: var(--fw-medium, 500);
        cursor: pointer;
        transition: background 0.1s;
      }
      .btn-edit {
        color: var(--clr-primary-600, #dc2626);
      }
      .btn-edit:hover {
        background: var(--clr-primary-50, #fef2f2);
      }
      .btn-delete {
        color: var(--clr-danger-600, #dc2626);
      }
      .btn-delete:hover {
        background: var(--clr-danger-50, #fef2f2);
      }
      .btn-confirm {
        color: var(--clr-danger-700, #b91c1c);
        font-weight: var(--fw-bold, 700);
      }
      .empty-state {
        padding: var(--sp-12, 3rem);
        text-align: center;
        color: var(--clr-neutral-400, #9ca3af);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
      }
      .empty-state p {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
      }
      .loading-state {
        padding: var(--sp-12, 3rem);
        text-align: center;
        color: var(--clr-neutral-400, #9ca3af);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
      }
      .error-banner {
        margin-bottom: var(--sp-4, 1rem);
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        background: var(--clr-danger-50, #fff1f2);
        border: 1px solid var(--clr-danger-200, #fecaca);
        border-radius: var(--radius-md, 0.375rem);
        color: var(--clr-danger-700, #b91c1c);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Emergency Department</h1>
        <button class="btn-primary" (click)="goToNew()">+ New Emergency</button>
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <div class="filters-bar">
        <span class="filter-label">Triage:</span>
        <select class="filter-select" [(ngModel)]="triageFilter" (ngModelChange)="applyFilters()">
          <option value="">All</option>
          <option value="RED">RED</option>
          <option value="YELLOW">YELLOW</option>
          <option value="GREEN">GREEN</option>
        </select>
        <span class="filter-label">Disposition:</span>
        <select
          class="filter-select"
          [(ngModel)]="dispositionFilter"
          (ngModelChange)="applyFilters()"
        >
          <option value="">All</option>
          <option value="DISCHARGE">Discharge</option>
          <option value="ADMIT_ICU">Admit — ICU</option>
          <option value="ADMIT_OBSERVATION">Admit — Observation</option>
          <option value="ADMIT_WARD">Admit — Ward</option>
        </select>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading-state">Loading emergencies…</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Triage Tag</th>
                  <th>Chief Complaint</th>
                  <th>Attended By</th>
                  <th>Disposition</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (filtered().length === 0) {
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">
                        <p>No emergency records found.</p>
                      </div>
                    </td>
                  </tr>
                }
                @for (rec of filtered(); track rec.id) {
                  <tr>
                    <td class="patient-name">{{ rec.patientName }}</td>
                    <td>
                      <span class="badge" [class]="triageBadgeClass(rec.triageTag)">
                        {{ rec.triageTag }}
                      </span>
                    </td>
                    <td class="complaint-cell" [title]="rec.chiefComplaint">
                      {{ rec.chiefComplaint || '—' }}
                    </td>
                    <td class="attended-cell">{{ rec.attendedByDoctorName || '—' }}</td>
                    <td class="disposition-text">{{ formatDisposition(rec.disposition) }}</td>
                    <td class="time-text">{{ formatTime(rec.createdAt) }}</td>
                    <td>
                      <div class="actions-cell">
                        <button class="btn-link btn-edit" (click)="edit(rec.id)">Edit</button>
                        @if (deleteConfirmId() === rec.id) {
                          <button class="btn-link btn-confirm" (click)="confirmDelete(rec.id)">
                            Confirm?
                          </button>
                          <button class="btn-link" (click)="deleteConfirmId.set(null)">
                            Cancel
                          </button>
                        } @else {
                          <button class="btn-link btn-delete" (click)="deleteConfirmId.set(rec.id)">
                            Delete
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class EmergencyListPage implements OnInit {
  private api = inject(EmergencyApiService);
  private router = inject(Router);

  loading = signal(true);
  error = signal('');
  records = signal<EmergencyRecord[]>([]);
  deleteConfirmId = signal<string | number | null>(null);

  triageFilter = '';
  dispositionFilter = '';

  filtered = computed(() => {
    let list = this.records();
    if (this.triageFilter) list = list.filter((r) => r.triageTag === this.triageFilter);
    if (this.dispositionFilter) list = list.filter((r) => r.disposition === this.dispositionFilter);
    return list;
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list({ limit: 200 }).subscribe({
      next: (res) => {
        this.records.set(res.data as EmergencyRecord[]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load emergency records. Please try again.');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    // computed() reacts automatically; trigger change detection via signal touch
    this.records.set([...this.records()]);
  }

  triageBadgeClass(tag: string): string {
    if (tag === 'RED') return 'badge badge-red';
    if (tag === 'YELLOW') return 'badge badge-yellow';
    if (tag === 'GREEN') return 'badge badge-green';
    return 'badge';
  }

  formatDisposition(d?: string): string {
    const map: Record<string, string> = {
      DISCHARGE: 'Discharge',
      ADMIT_ICU: 'Admit — ICU',
      ADMIT_OBSERVATION: 'Admit — Observation',
      ADMIT_WARD: 'Admit — Ward',
    };
    return d ? (map[d] ?? d) : '—';
  }

  formatTime(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  goToNew(): void {
    this.router.navigate(['/emergency/new']);
  }

  edit(id: number | string): void {
    this.router.navigate(['/emergency', id, 'edit']);
  }

  confirmDelete(id: number | string): void {
    this.api.remove(id).subscribe({
      next: () => {
        this.records.update((list) => list.filter((r) => r.id !== id));
        this.deleteConfirmId.set(null);
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }
}
