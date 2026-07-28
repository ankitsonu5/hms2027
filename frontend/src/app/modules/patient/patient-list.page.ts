import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientApiService } from '../../core/services/patient-api.service';

@Component({
  selector: 'hms-patient-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--text-primary);
      }
      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xs);
        overflow: hidden;
      }
      .card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid var(--border-default);
      }
      .card__title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
      }
      .card__body {
        padding: var(--sp-5);
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--sp-4) var(--sp-6);
      }
      .form-grid--3 {
        grid-template-columns: repeat(3, 1fr);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .col-span-2 {
        grid-column: span 2;
      }
      .col-span-full {
        grid-column: 1/-1;
      }
      .form-label {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      .form-control {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        padding: 8px 12px;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        color: var(--text-primary);
        outline: none;
        width: 100%;
        transition:
          border-color 150ms ease,
          box-shadow 150ms ease;
      }
      .form-control:focus {
        border-color: var(--clr-primary-500);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--clr-primary-500) 15%, transparent);
      }
      .form-control.ng-invalid.ng-touched {
        border-color: var(--clr-danger-600);
      }
      .form-error {
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
        margin-top: 2px;
      }
      .form-actions {
        display: flex;
        gap: var(--sp-3);
        justify-content: flex-end;
        padding-top: var(--sp-5);
        border-top: 1px solid var(--border-default);
        margin-top: var(--sp-6);
      }
      .btn {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: 500;
        padding: 8px 20px;
        border-radius: var(--radius-md);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 150ms ease;
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--clr-primary-700);
      }
      .btn-secondary {
        background: var(--bg-surface);
        color: var(--text-primary);
        border-color: var(--border-default);
      }
      .btn-secondary:hover {
        background: var(--bg-muted);
      }
      .btn-danger {
        background: var(--clr-danger-600);
        color: #fff;
      }
      .btn-danger:hover {
        background: #b91c1c;
      }
      .btn-sm {
        padding: 5px 12px;
        font-size: 12px;
      }
      .search-bar {
        display: flex;
        gap: var(--sp-3);
        align-items: center;
      }
      .search-input {
        flex: 1;
      }
      .table-wrap {
        overflow-x: auto;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
      }
      .table th {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: 10px 16px;
        text-align: left;
        background: var(--bg-muted);
      }
      .table td {
        padding: 10px 16px;
        border-bottom: 1px solid var(--border-default);
        color: var(--text-secondary);
        vertical-align: middle;
      }
      .table tr:last-child td {
        border-bottom: none;
      }
      .table tr:hover td {
        background: var(--bg-muted);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 3px 10px;
        border-radius: 9999px;
      }
      .badge-success {
        background: var(--clr-success-100);
        color: var(--clr-success-600);
      }
      .badge-warning {
        background: var(--clr-warning-100);
        color: var(--clr-warning-600);
      }
      .badge-danger {
        background: var(--clr-danger-100);
        color: var(--clr-danger-600);
      }
      .badge-info {
        background: var(--clr-info-100);
        color: var(--clr-info-600);
      }
      .badge-neutral {
        background: var(--bg-muted);
        color: var(--text-muted);
      }
      .action-col {
        display: flex;
        gap: var(--sp-2);
      }
      .pagination {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        justify-content: flex-end;
        padding: var(--sp-3) var(--sp-5);
        border-top: 1px solid var(--border-default);
      }
      .page-info {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-right: var(--sp-3);
      }
      .empty-state {
        padding: var(--sp-12);
        text-align: center;
        color: var(--text-muted);
      }
    `,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Patient Registration</h1>
        <a class="btn btn-primary" [routerLink]="['new']">+ New Patient</a>
      </div>

      <div class="card">
        <div class="card__body">
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-bar">
            <input
              class="form-control search-input"
              formControlName="search"
              type="text"
              placeholder="Search by name, UHID, phone…"
            />
            <select class="form-control" style="width:200px" formControlName="category">
              <option value="">All Categories</option>
              <option value="DIRECT">Direct</option>
              <option value="B2B_REFERRAL">B2B Referral</option>
              <option value="CORPORATE">Corporate</option>
              <option value="INSURANCE">Insurance</option>
            </select>
            <button type="submit" class="btn btn-primary">Search</button>
          </form>
        </div>

        <div class="table-wrap">
          @if (loading()) {
            <div class="empty-state">Loading…</div>
          } @else if (patients().length === 0) {
            <div class="empty-state">No patients found.</div>
          } @else {
            <table class="table">
              <thead>
                <tr>
                  <th>UHID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of patients(); track p.id) {
                  <tr>
                    <td>{{ p.uhid }}</td>
                    <td>{{ p.firstName }} {{ p.lastName }}</td>
                    <td>{{ p.phone }}</td>
                    <td>{{ p.dob | date: 'dd MMM yyyy' }}</td>
                    <td>
                      <span class="badge" [ngClass]="categoryBadge(p.category)">
                        {{ p.category }}
                      </span>
                    </td>
                    <td>
                      <div class="action-col">
                        <a
                          class="btn btn-primary btn-sm"
                          [routerLink]="['/opd/new']"
                          [queryParams]="{ patientId: p.id }"
                          >Start OPD</a
                        >
                        <a class="btn btn-secondary btn-sm" [routerLink]="[p.id, 'edit']">Edit</a>
                        <button class="btn btn-danger btn-sm" (click)="onDelete(p.id)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        @if (total() > 0) {
          <div class="pagination">
            <span class="page-info">
              Showing {{ (page() - 1) * limit + 1 }}–{{ min(page() * limit, total()) }} of
              {{ total() }}
            </span>
            <button
              class="btn btn-secondary btn-sm"
              [disabled]="page() === 1"
              (click)="onPageChange(page() - 1)"
            >
              &lsaquo; Prev
            </button>
            <button
              class="btn btn-secondary btn-sm"
              [disabled]="page() * limit >= total()"
              (click)="onPageChange(page() + 1)"
            >
              Next &rsaquo;
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class PatientListPage implements OnInit {
  private svc = inject(PatientApiService);
  private fb = inject(FormBuilder);

  patients = signal<any[]>([]);
  total = signal(0);
  page = signal(1);
  limit = 20;
  loading = signal(false);

  searchForm: FormGroup = this.fb.group({
    search: [''],
    category: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.list({ page: this.page(), limit: this.limit, ...this.searchForm.value }).subscribe({
      next: (res) => {
        this.patients.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.load();
  }

  onDelete(id: string | number): void {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.svc.remove(id).subscribe(() => this.load());
    }
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.load();
  }

  categoryBadge(category: string): string {
    const map: Record<string, string> = {
      DIRECT: 'badge-success',
      B2B_REFERRAL: 'badge-info',
      CORPORATE: 'badge-warning',
      INSURANCE: 'badge-neutral',
    };
    return map[category] ?? 'badge-neutral';
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
