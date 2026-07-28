import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OpdApiService } from '../../core/services/opd-api.service';

interface OpdEncounter {
  id: string | number;
  tokenNumber: string | number;
  patientId: string;
  patient: {
    uhid: string;
    firstName: string;
    lastName: string;
  } | null;
  doctorName: string;
  visitDate: string;
  chiefComplaints: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REFERRED' | 'ADMITTED';
}

@Component({
  selector: 'hms-opd-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="opd-list-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">OPD Consultations</h1>
          <p class="page-subtitle">Outpatient Department encounter records</p>
        </div>
        <a routerLink="/opd/new" class="btn btn-primary">+ New Consultation</a>
      </div>

      <!-- Filters -->
      <div class="filter-bar" [formGroup]="filterForm">
        <div class="filter-field">
          <label class="filter-label">Date</label>
          <input type="date" formControlName="date" class="form-control" />
        </div>
        <div class="filter-field">
          <label class="filter-label">Status</label>
          <select formControlName="status" class="form-control">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFERRED">Referred</option>
            <option value="ADMITTED">Admitted</option>
          </select>
        </div>
        <div class="filter-field filter-field--grow">
          <label class="filter-label">Doctor ID</label>
          <input
            type="text"
            formControlName="doctorId"
            class="form-control"
            placeholder="Search by doctor ID..."
          />
        </div>
        <button type="button" class="btn btn-ghost" (click)="resetFilters()">Reset</button>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (loading()) {
          <div class="state-message"><span class="spinner"></span> Loading encounters...</div>
        } @else if (encounters().length === 0) {
          <div class="state-message state-message--empty">
            No OPD encounters found. Adjust your filters or create a new consultation.
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Visit Date</th>
                  <th>Chief Complaints</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (enc of encounters(); track enc.id) {
                  <tr class="table-row">
                    <td class="token-cell">#{{ enc.tokenNumber }}</td>
                    <td>
                      @if (enc.patient; as p) {
                        <div class="patient-cell">
                          <span class="patient-cell__name">{{ p.firstName }} {{ p.lastName }}</span>
                          <span class="patient-cell__uhid monospace">{{ p.uhid }}</span>
                        </div>
                      } @else {
                        <span class="patient-cell__missing">Unknown patient</span>
                      }
                    </td>
                    <td>{{ enc.doctorName }}</td>
                    <td>{{ enc.visitDate | date: 'dd MMM yyyy' }}</td>
                    <td class="complaints-cell">{{ truncate(enc.chiefComplaints, 50) }}</td>
                    <td>
                      <span class="status-badge status-badge--{{ statusClass(enc.status) }}">
                        {{ statusLabel(enc.status) }}
                      </span>
                    </td>
                    <td class="actions-cell">
                      <a [routerLink]="['/opd', enc.id, 'edit']" class="action-link">Edit</a>
                      @if (deleteConfirmId() === enc.id) {
                        <button
                          class="action-link action-link--danger"
                          (click)="confirmDelete(enc.id)"
                        >
                          Confirm?
                        </button>
                        <button class="action-link" (click)="deleteConfirmId.set(null)">
                          Cancel
                        </button>
                      } @else {
                        <button
                          class="action-link action-link--danger"
                          (click)="deleteConfirmId.set(enc.id)"
                        >
                          Delete
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="table-count">{{ total() }} encounter{{ total() === 1 ? '' : 's' }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .opd-list-page {
        padding: var(--sp-6);
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      /* Header */
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--sp-4);
      }
      .page-title {
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: var(--text-2xl);
        color: var(--clr-neutral-900);
        margin: 0 0 var(--sp-1);
      }
      .page-subtitle {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
        margin: 0;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        cursor: pointer;
        border: 1px solid transparent;
        transition: var(--transition-fast);
        text-decoration: none;
        white-space: nowrap;
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
        border-color: var(--clr-primary-600);
      }
      .btn-primary:hover {
        background: var(--clr-primary-700);
        border-color: var(--clr-primary-700);
      }
      .btn-ghost {
        background: transparent;
        color: var(--clr-neutral-600);
        border-color: var(--border-default);
      }
      .btn-ghost:hover {
        background: var(--bg-muted);
      }

      /* Filter bar */
      .filter-bar {
        display: flex;
        align-items: flex-end;
        gap: var(--sp-3);
        flex-wrap: wrap;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-4);
        box-shadow: var(--shadow-sm);
      }
      .filter-field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
        min-width: 140px;
      }
      .filter-field--grow {
        flex: 1;
      }
      .filter-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .form-control {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-900);
        background: var(--bg-base);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-2) var(--sp-3);
        outline: none;
        transition: var(--transition-fast);
        width: 100%;
        box-sizing: border-box;
      }
      .form-control:focus {
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }

      /* Table card */
      .table-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
      .data-table thead {
        background: var(--bg-muted);
        border-bottom: 1px solid var(--border-default);
      }
      .data-table th {
        padding: var(--sp-3) var(--sp-4);
        text-align: left;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      .table-row {
        border-bottom: 1px solid var(--border-default);
        transition: var(--transition-fast);
      }
      .table-row:last-child {
        border-bottom: none;
      }
      .table-row:hover {
        background: var(--bg-muted);
      }
      .data-table td {
        padding: var(--sp-3) var(--sp-4);
        color: var(--clr-neutral-800);
        vertical-align: middle;
      }
      .token-cell {
        font-family: var(--font-label);
        font-weight: var(--fw-semibold);
        color: var(--clr-primary-700);
      }
      .monospace {
        font-family: monospace;
        font-size: var(--text-xs);
      }
      .patient-cell {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .patient-cell__name {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-900);
      }
      .patient-cell__uhid {
        color: var(--clr-neutral-500);
      }
      .patient-cell__missing {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-400);
        font-style: italic;
      }
      .complaints-cell {
        max-width: 200px;
        color: var(--clr-neutral-600);
      }
      .actions-cell {
        white-space: nowrap;
      }
      .action-link {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-primary-600);
        text-decoration: none;
        padding: var(--sp-1) var(--sp-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--clr-primary-200);
        transition: var(--transition-fast);
        background: none;
        cursor: pointer;
      }
      .action-link:hover {
        background: var(--clr-primary-50);
      }
      .action-link--danger {
        color: var(--clr-danger-600);
        border-color: var(--clr-danger-200);
      }
      .action-link--danger:hover {
        background: var(--clr-danger-50);
      }

      /* Status badges */
      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--sp-2);
        border-radius: 999px;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        white-space: nowrap;
      }
      .status-badge--warning {
        background: var(--clr-warning-100);
        color: var(--clr-warning-700);
      }
      .status-badge--info {
        background: var(--clr-info-100);
        color: var(--clr-info-700);
      }
      .status-badge--success {
        background: var(--clr-success-100);
        color: var(--clr-success-700);
      }
      .status-badge--neutral {
        background: var(--clr-neutral-100);
        color: var(--clr-neutral-600);
      }

      /* State messages */
      .state-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--sp-3);
        padding: var(--sp-10);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
      }
      .state-message--empty {
        flex-direction: column;
      }

      /* Table footer */
      .table-footer {
        padding: var(--sp-3) var(--sp-4);
        border-top: 1px solid var(--border-default);
        background: var(--bg-muted);
      }
      .table-count {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        color: var(--clr-neutral-500);
      }

      /* Spinner */
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--clr-neutral-200);
        border-top-color: var(--clr-primary-500);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class OpdListPage implements OnInit {
  private api = inject(OpdApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  encounters = signal<OpdEncounter[]>([]);
  total = signal(0);
  loading = signal(false);
  deleteConfirmId = signal<string | number | null>(null);

  filterForm: FormGroup = this.fb.group({
    date: [''],
    status: [''],
    doctorId: [''],
  });

  ngOnInit(): void {
    this.load();
    this.filterForm.valueChanges.subscribe(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.value;
    const q: Record<string, any> = {};
    if (raw.date) q['date'] = raw.date;
    if (raw.status) q['status'] = raw.status;
    if (raw.doctorId) q['doctorId'] = raw.doctorId;

    this.api.list(q).subscribe({
      next: (res) => {
        this.encounters.set(res.data ?? []);
        this.total.set(res.total ?? this.encounters().length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.filterForm.reset({ date: '', status: '', doctorId: '' });
  }

  truncate(text: string, max: number): string {
    if (!text) return '—';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      REFERRED: 'neutral',
      ADMITTED: 'neutral',
    };
    return map[status] ?? 'neutral';
  }

  confirmDelete(id: string | number): void {
    this.api.remove(id).subscribe({
      next: () => {
        this.encounters.update((list) => list.filter((e) => e.id !== id));
        this.total.update((t) => Math.max(0, t - 1));
        this.deleteConfirmId.set(null);
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      REFERRED: 'Referred',
      ADMITTED: 'Admitted',
    };
    return map[status] ?? status;
  }
}

// Needed for inject() outside constructor in Angular 22
import { inject } from '@angular/core';
