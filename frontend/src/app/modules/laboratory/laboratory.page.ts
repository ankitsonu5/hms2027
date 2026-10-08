import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';
import { PatientApiService } from '../../core/services/patient-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'hms-laboratory',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  styles: [
    `
      .page-wrap {
        padding: var(--sp-6);
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-6);
      }
      .page-title {
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: var(--text-2xl);
        color: var(--clr-neutral-900);
        margin: 0;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        border: none;
        cursor: pointer;
        transition: var(--transition-base);
        text-decoration: none;
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--clr-primary-700);
      }
      .btn-secondary {
        background: var(--bg-surface);
        color: var(--clr-neutral-700);
        border: 1px solid var(--border-default);
      }
      .btn-secondary:hover {
        background: var(--bg-muted);
      }
      .btn-ghost {
        background: transparent;
        color: var(--clr-primary-600);
        border: none;
        padding: var(--sp-1) var(--sp-2);
      }
      .btn-ghost:hover {
        background: var(--clr-primary-50);
      }
      .btn-danger-ghost {
        background: transparent;
        color: var(--clr-danger-600);
        border: none;
        padding: var(--sp-1) var(--sp-2);
      }
      .btn-danger-ghost:hover {
        background: var(--clr-danger-50);
      }

      /* Tabs */
      .tabs-bar {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--border-default);
        margin-bottom: var(--sp-6);
      }
      .tab-btn {
        padding: var(--sp-3) var(--sp-5);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-500);
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        transition: var(--transition-base);
      }
      .tab-btn:hover {
        color: var(--clr-primary-600);
      }
      .tab-btn.active {
        color: var(--clr-primary-600);
        border-bottom-color: var(--clr-primary-600);
      }

      /* Filter bar */
      .filter-bar {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }
      .filter-label {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-600);
      }
      .select-input {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-800);
        background: var(--bg-surface);
        min-width: 160px;
      }
      .select-input:focus {
        outline: none;
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }

      /* Table */
      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: var(--sp-3) var(--sp-4);
        text-align: left;
        background: var(--bg-muted);
        border-bottom: 1px solid var(--border-default);
        white-space: nowrap;
      }
      td {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-800);
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--border-default);
        vertical-align: middle;
      }
      tr:last-child td {
        border-bottom: none;
      }
      tr:hover td {
        background: var(--bg-muted);
      }

      /* Badges */
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--sp-2);
        border-radius: var(--radius-full);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        white-space: nowrap;
      }
      .badge-warning {
        background: var(--clr-warning-100);
        color: var(--clr-warning-700);
      }
      .badge-info {
        background: var(--clr-info-100);
        color: var(--clr-info-700);
      }
      .badge-success {
        background: var(--clr-success-100);
        color: var(--clr-success-700);
      }
      .badge-neutral {
        background: var(--clr-neutral-100);
        color: var(--clr-neutral-600);
      }

      /* Empty state */
      .empty-state {
        padding: var(--sp-12) var(--sp-6);
        text-align: center;
        color: var(--clr-neutral-400);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }

      /* Inline form panel */
      .form-panel {
        background: var(--bg-muted);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-6);
        margin-bottom: var(--sp-6);
      }
      .form-panel-title {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-800);
        margin: 0 0 var(--sp-4);
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--sp-4);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .form-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .form-control {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-900);
        background: var(--bg-surface);
        transition: var(--transition-base);
      }
      .form-control:focus {
        outline: none;
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      .form-control.invalid {
        border-color: var(--clr-danger-400);
      }
      .form-actions {
        display: flex;
        gap: var(--sp-3);
        margin-top: var(--sp-4);
      }

      /* Loading */
      .loading-row td {
        text-align: center;
        color: var(--clr-neutral-400);
        font-size: var(--text-sm);
        padding: var(--sp-8);
      }

      /* Section header row */
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-4);
      }
      .section-title {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-800);
        margin: 0;
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Laboratory</h1>
        <button class="btn btn-primary" (click)="newOrder()">+ New Test</button>
      </div>

      <!-- ═══════════════ ORDERS TAB ═══════════════ -->
        <div class="filter-bar">
          <span class="filter-label">Status:</span>
          <select class="select-input" (change)="onStatusFilter($event)">
            <option value="">All</option>
            <option value="ORDERED">Ordered</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient UHID</th>
                  <th>Doctor</th>
                  <th>Tests</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (ordersLoading()) {
                  <tr class="loading-row">
                    <td colspan="8">Loading orders…</td>
                  </tr>
                } @else if (orders().length === 0) {
                  <tr>
                    <td colspan="8"><div class="empty-state">No lab orders found.</div></td>
                  </tr>
                } @else {
                  @for (order of orders(); track order.id) {
                    <tr>
                      <td>{{ order.patientUhid || order.patientId }}</td>
                      <td>{{ order.orderedByDoctorName || order.orderedByDoctorId || '—' }}</td>
                      <td>{{ order.tests?.length ?? 0 }}</td>
                      <td>
                        <span class="badge" [ngClass]="statusBadge(order.status)">{{
                          statusLabel(order.status)
                        }}</span>
                      </td>
                      <td>₹{{ order.totalAmount ?? 0 }}</td>
                      <td>
                        @if (order.paid) {
                          <span class="badge badge-success">Yes</span>
                        } @else {
                          <span class="badge badge-neutral">No</span>
                        }
                      </td>
                      <td>{{ order.createdAt | date: 'dd MMM yyyy' }}</td>
                      <td>
                        <button class="btn btn-ghost" (click)="editOrder(order.id)">Edit</button>
                        <button class="btn btn-ghost" (click)="viewBill(order.id)">Bill</button>
                        <button class="btn btn-ghost" (click)="enterResults(order.id)">
                          Results
                        </button>
                        <button class="btn btn-danger-ghost" (click)="deleteOrder(order.id)">Delete</button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>


    </div>
  `,
})
export class LaboratoryPage implements OnInit {
  private labApi = inject(LabApiService);
  private patientApi = inject(PatientApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  orderStatusFilter = signal('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersLoading.set(true);
    const params: Record<string, any> = {};
    if (this.orderStatusFilter()) params['status'] = this.orderStatusFilter();
    this.labApi.listOrders(params).subscribe({
      next: (res) => {
        const data = res.data ?? [];
        if (data.length === 0) {
          this.orders.set([]);
          this.ordersLoading.set(false);
          return;
        }

        const reqs = data.map((order: any) =>
          forkJoin({
            order: of(order),
            patient: this.patientApi.getOne(order.patientId).pipe(catchError(() => of(null)))
          })
        );

        forkJoin(reqs).subscribe(results => {
          const mappedOrders = results.map(r => ({
            ...r.order,
            patientUhid: r.patient ? r.patient.uhid : r.order.patientId
          }));
          this.orders.set(mappedOrders);
          this.ordersLoading.set(false);
        });
      },
      error: () => {
        this.orders.set([]);
        this.ordersLoading.set(false);
      },
    });
  }

  onStatusFilter(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.orderStatusFilter.set(val);
    this.loadOrders();
  }

  newOrder(): void {
    this.router.navigate(['/laboratory/order/new']);
  }

  editOrder(id: string): void {
    this.router.navigate(['/laboratory/order', id]);
  }

  viewBill(id: string): void {
    this.router.navigate(['/laboratory/receipt', id]);
  }

  deleteOrder(id: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.labApi.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: () => alert('Failed to delete order.')
      });
    }
  }

  enterResults(id: string): void {
    this.router.navigate(['/laboratory/results', id]);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ORDERED: 'Ordered',
      SAMPLE_COLLECTED: 'Sample Collected',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    };
    return map[status] ?? status;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      ORDERED: 'badge-warning',
      SAMPLE_COLLECTED: 'badge-info',
      IN_PROGRESS: 'badge-info',
      COMPLETED: 'badge-success',
    };
    return map[status] ?? 'badge-neutral';
  }
}
