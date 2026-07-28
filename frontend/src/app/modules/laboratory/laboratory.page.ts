import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';

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
        @if (activeTab() === 'orders') {
          <button class="btn btn-primary" (click)="newOrder()">+ New Lab Order</button>
        } @else {
          <button class="btn btn-primary" (click)="showTestForm.set(true)">+ Add Test</button>
        }
      </div>

      <!-- Tabs -->
      <div class="tabs-bar">
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'orders'"
          (click)="activeTab.set('orders')"
        >
          Orders
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'tests'"
          (click)="activeTab.set('tests')"
        >
          Test Master
        </button>
      </div>

      <!-- ═══════════════ ORDERS TAB ═══════════════ -->
      @if (activeTab() === 'orders') {
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
                  <th>Patient ID</th>
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
                      <td>{{ order.patientId }}</td>
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
                        <button class="btn btn-ghost" (click)="enterResults(order.id)">
                          Results
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ═══════════════ TEST MASTER TAB ═══════════════ -->
      @if (activeTab() === 'tests') {
        <!-- Inline Add Test Form -->
        @if (showTestForm()) {
          <div class="form-panel">
            <p class="form-panel-title">Add New Test</p>
            <form [formGroup]="testForm" (ngSubmit)="createTest()">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Name *</label>
                  <input
                    class="form-control"
                    [class.invalid]="isInvalid('name')"
                    formControlName="name"
                    placeholder="e.g. Complete Blood Count"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Code *</label>
                  <input
                    class="form-control"
                    [class.invalid]="isInvalid('code')"
                    formControlName="code"
                    placeholder="e.g. CBC"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select
                    class="form-control"
                    [class.invalid]="isInvalid('category')"
                    formControlName="category"
                  >
                    <option value="">Select…</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Serology">Serology</option>
                    <option value="Immunology">Immunology</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Unit</label>
                  <input class="form-control" formControlName="unit" placeholder="e.g. g/dL" />
                </div>
                <div class="form-group">
                  <label class="form-label">Normal Range</label>
                  <input
                    class="form-control"
                    formControlName="normalRange"
                    placeholder="e.g. 13.5–17.5"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Method</label>
                  <input
                    class="form-control"
                    formControlName="method"
                    placeholder="e.g. Automated"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Price (₹) *</label>
                  <input
                    class="form-control"
                    [class.invalid]="isInvalid('price')"
                    formControlName="price"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="savingTest()">
                  {{ savingTest() ? 'Saving…' : 'Save Test' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="cancelTestForm()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Test Master Table -->
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Normal Range</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (testsLoading()) {
                  <tr class="loading-row">
                    <td colspan="7">Loading tests…</td>
                  </tr>
                } @else if (tests().length === 0) {
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">No tests found. Add one above.</div>
                    </td>
                  </tr>
                } @else {
                  @for (test of tests(); track test.id) {
                    <tr>
                      <td>{{ test.name }}</td>
                      <td>{{ test.code }}</td>
                      <td>{{ test.category }}</td>
                      <td>{{ test.unit || '—' }}</td>
                      <td>{{ test.normalRange || '—' }}</td>
                      <td>₹{{ test.price ?? 0 }}</td>
                      <td>
                        <button class="btn btn-ghost" (click)="showTestForm.set(true)">Edit</button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class LaboratoryPage implements OnInit {
  private labApi = inject(LabApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab = signal<'orders' | 'tests'>('orders');

  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  orderStatusFilter = signal('');

  tests = signal<any[]>([]);
  testsLoading = signal(false);

  showTestForm = signal(false);
  savingTest = signal(false);

  testForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    category: ['', Validators.required],
    unit: [''],
    normalRange: [''],
    method: [''],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadOrders();
    this.loadTests();
  }

  loadOrders(): void {
    this.ordersLoading.set(true);
    const params: Record<string, any> = {};
    if (this.orderStatusFilter()) params['status'] = this.orderStatusFilter();
    this.labApi.listOrders(params).subscribe({
      next: (res) => {
        this.orders.set(res.data ?? []);
        this.ordersLoading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.ordersLoading.set(false);
      },
    });
  }

  loadTests(): void {
    this.testsLoading.set(true);
    this.labApi.listTests().subscribe({
      next: (res) => {
        this.tests.set(res.data ?? []);
        this.testsLoading.set(false);
      },
      error: () => {
        this.tests.set([]);
        this.testsLoading.set(false);
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

  isInvalid(field: string): boolean {
    const ctrl = this.testForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  createTest(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      return;
    }
    this.savingTest.set(true);
    this.labApi.createTest(this.testForm.value).subscribe({
      next: () => {
        this.savingTest.set(false);
        this.testForm.reset({ price: 0 });
        this.showTestForm.set(false);
        this.loadTests();
      },
      error: () => {
        this.savingTest.set(false);
      },
    });
  }

  cancelTestForm(): void {
    this.testForm.reset({ price: 0 });
    this.showTestForm.set(false);
  }
}
