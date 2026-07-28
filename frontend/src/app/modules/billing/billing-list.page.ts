import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BillingApiService } from '../../core/services/billing-api.service';

type BillStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'INSURANCE' | 'CGHS';

interface Bill {
  id: number | string;
  billNo: string;
  patientId: string;
  patientName: string;
  billDate: string;
  grandTotal: number;
  paid: number;
  balance: number;
  status: BillStatus;
}

@Component({
  selector: 'hms-billing-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      .page {
        padding: var(--sp-6);
        background: var(--bg-base);
        min-height: 100vh;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-5);
        flex-wrap: wrap;
        gap: var(--sp-3);
      }
      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
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
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--clr-primary-700);
      }
      .btn-ghost {
        background: transparent;
        color: var(--clr-primary-600);
        border: 1px solid var(--border-default);
      }
      .btn-ghost:hover {
        background: var(--clr-primary-50);
      }
      .btn-danger-ghost {
        background: transparent;
        color: var(--clr-danger-600);
        border: 1px solid var(--border-default);
      }
      .btn-danger-ghost:hover {
        background: var(--clr-danger-50);
      }
      .btn-sm {
        padding: var(--sp-1) var(--sp-3);
        font-size: var(--text-xs);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .filters {
        display: flex;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
        flex-wrap: wrap;
      }
      .filter-select,
      .filter-input {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        background: var(--bg-surface);
        color: var(--clr-neutral-900);
        min-width: 160px;
      }
      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: var(--clr-primary-500);
      }

      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
      }

      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead tr {
        background: var(--bg-muted);
      }
      th {
        padding: var(--sp-3) var(--sp-4);
        text-align: left;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      td {
        padding: var(--sp-3) var(--sp-4);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-800);
        border-top: 1px solid var(--border-default);
        vertical-align: middle;
      }
      tbody tr:hover {
        background: var(--bg-muted);
      }
      tbody tr.expanded {
        background: var(--clr-primary-50);
      }

      .bill-no {
        font-family: var(--font-label);
        font-weight: var(--fw-semibold);
        color: var(--clr-primary-700);
      }
      .patient-name {
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-900);
      }
      .patient-id {
        font-size: var(--text-xs);
        color: var(--clr-neutral-500);
      }

      .amount {
        font-variant-numeric: tabular-nums;
      }
      .amount-grand {
        font-weight: var(--fw-semibold);
      }
      .balance-red {
        color: var(--clr-danger-600);
        font-weight: var(--fw-medium);
      }
      .balance-zero {
        color: var(--clr-success-600);
      }

      .badge {
        display: inline-block;
        padding: 2px var(--sp-2);
        border-radius: var(--radius-full);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .badge-neutral {
        background: var(--clr-neutral-100);
        color: var(--clr-neutral-600);
      }
      .badge-warning {
        background: var(--clr-warning-100);
        color: var(--clr-warning-700);
      }
      .badge-success {
        background: var(--clr-success-100);
        color: var(--clr-success-700);
      }
      .badge-info {
        background: var(--clr-info-100);
        color: var(--clr-info-700);
      }
      .badge-danger {
        background: var(--clr-danger-100);
        color: var(--clr-danger-700);
      }

      .actions {
        display: flex;
        gap: var(--sp-2);
        align-items: center;
        flex-wrap: wrap;
      }

      /* Inline payment panel */
      .payment-row td {
        padding: 0;
        border-top: none;
      }
      .payment-panel {
        padding: var(--sp-4) var(--sp-5);
        background: var(--clr-primary-50);
        border-top: 2px solid var(--clr-primary-200);
      }
      .payment-panel-title {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-primary-800);
        margin-bottom: var(--sp-3);
      }
      .payment-form {
        display: flex;
        gap: var(--sp-3);
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .form-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-600);
      }
      .form-control {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        background: var(--bg-surface);
        color: var(--clr-neutral-900);
      }
      .form-control:focus {
        outline: none;
        border-color: var(--clr-primary-500);
      }
      .form-control.invalid {
        border-color: var(--clr-danger-500);
      }

      .empty-state {
        text-align: center;
        padding: var(--sp-10) var(--sp-6);
        color: var(--clr-neutral-400);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }

      .error-msg {
        padding: var(--sp-3) var(--sp-4);
        background: var(--clr-danger-50);
        border: 1px solid var(--clr-danger-200);
        border-radius: var(--radius-md);
        color: var(--clr-danger-700);
        font-size: var(--text-sm);
        margin-bottom: var(--sp-4);
      }

      .loading {
        text-align: center;
        padding: var(--sp-8);
        color: var(--clr-neutral-400);
        font-size: var(--text-sm);
      }
    `,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Billing</h1>
        <button class="btn btn-primary" (click)="goNew()">+ New Bill</button>
      </div>

      <div class="filters">
        <select
          class="filter-select"
          [formControl]="filterForm.controls['status']"
          (change)="load()"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          class="filter-input"
          type="text"
          placeholder="Search by Patient ID…"
          [formControl]="filterForm.controls['patientId']"
          (input)="onSearch()"
        />
      </div>

      @if (errorMsg()) {
        <div class="error-msg">{{ errorMsg() }}</div>
      }

      <div class="card">
        @if (loading()) {
          <div class="loading">Loading bills…</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Grand Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (bills().length === 0) {
                  <tr>
                    <td colspan="8">
                      <div class="empty-state">No bills found.</div>
                    </td>
                  </tr>
                }
                @for (bill of bills(); track bill.id) {
                  <tr [class.expanded]="expandedId() === bill.id">
                    <td>
                      <span class="bill-no">{{ bill.billNo }}</span>
                    </td>
                    <td>
                      <div class="patient-name">{{ bill.patientName }}</div>
                      <div class="patient-id">{{ bill.patientId }}</div>
                    </td>
                    <td>{{ bill.billDate | date: 'dd MMM yyyy' }}</td>
                    <td class="amount amount-grand">₹{{ bill.grandTotal | number: '1.2-2' }}</td>
                    <td class="amount">₹{{ bill.paid | number: '1.2-2' }}</td>
                    <td
                      class="amount"
                      [class.balance-red]="bill.balance > 0"
                      [class.balance-zero]="bill.balance === 0"
                    >
                      ₹{{ bill.balance | number: '1.2-2' }}
                    </td>
                    <td>
                      <span class="badge" [class]="badgeClass(bill.status)">{{ bill.status }}</span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="btn btn-ghost btn-sm" (click)="goEdit(bill.id)">
                          View / Edit
                        </button>
                        @if (bill.status !== 'CANCELLED' && bill.status !== 'PAID') {
                          <button class="btn btn-ghost btn-sm" (click)="togglePayment(bill)">
                            {{ expandedId() === bill.id ? 'Close' : 'Add Payment' }}
                          </button>
                          <button
                            class="btn btn-danger-ghost btn-sm"
                            (click)="cancelBill(bill)"
                            [disabled]="cancelling() === bill.id"
                          >
                            {{ cancelling() === bill.id ? '…' : 'Cancel' }}
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                  @if (expandedId() === bill.id) {
                    <tr class="payment-row">
                      <td colspan="8">
                        <div class="payment-panel">
                          <div class="payment-panel-title">Add Payment — {{ bill.billNo }}</div>
                          <form
                            class="payment-form"
                            [formGroup]="paymentForm"
                            (ngSubmit)="submitPayment(bill.id)"
                          >
                            <div class="form-field">
                              <label class="form-label">Payment Mode</label>
                              <select class="form-control" formControlName="paymentMode">
                                <option value="CASH">Cash</option>
                                <option value="CARD">Card</option>
                                <option value="UPI">UPI</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="CGHS">CGHS</option>
                              </select>
                            </div>
                            <div class="form-field">
                              <label class="form-label">Amount (₹)</label>
                              <input
                                class="form-control"
                                [class.invalid]="
                                  paymentForm.controls['amount'].invalid &&
                                  paymentForm.controls['amount'].touched
                                "
                                type="number"
                                min="0.01"
                                step="0.01"
                                formControlName="amount"
                                placeholder="0.00"
                                style="width:120px"
                              />
                            </div>
                            <div class="form-field">
                              <label class="form-label">Transaction Ref (optional)</label>
                              <input
                                class="form-control"
                                type="text"
                                formControlName="transactionRef"
                                placeholder="Ref / UTR"
                                style="width:180px"
                              />
                            </div>
                            <div class="form-field">
                              <label class="form-label">&nbsp;</label>
                              <button
                                class="btn btn-primary"
                                type="submit"
                                [disabled]="paymentSubmitting() || paymentForm.invalid"
                              >
                                {{ paymentSubmitting() ? 'Saving…' : 'Submit Payment' }}
                              </button>
                            </div>
                            @if (paymentError()) {
                              <div
                                style="color:var(--clr-danger-600);font-size:var(--text-xs);align-self:center"
                              >
                                {{ paymentError() }}
                              </div>
                            }
                          </form>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class BillingListPage implements OnInit {
  private api = inject(BillingApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  bills = signal<Bill[]>([]);
  loading = signal(false);
  errorMsg = signal('');
  cancelling = signal<string | number | null>(null);

  expandedId = signal<string | number | null>(null);
  paymentSubmitting = signal(false);
  paymentError = signal('');

  filterForm = this.fb.group({
    status: [''],
    patientId: [''],
  });

  paymentForm = this.fb.group({
    paymentMode: ['CASH' as PaymentMode],
    amount: [null as number | null, [this._positiveValidator]],
    transactionRef: [''],
  });

  private _positiveValidator(control: any) {
    const v = control.value;
    return v != null && v > 0 ? null : { positive: true };
  }

  private _searchTimer: any = null;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMsg.set('');
    const { status, patientId } = this.filterForm.value;
    const q: Record<string, any> = {};
    if (status) q['status'] = status;
    if (patientId) q['patientId'] = patientId;

    this.api.list(q).subscribe({
      next: (res) => {
        this.bills.set((res.data ?? []) as Bill[]);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Failed to load bills.');
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.load(), 350);
  }

  goNew() {
    this.router.navigate(['/billing/new']);
  }

  goEdit(id: string | number) {
    this.router.navigate(['/billing', id]);
  }

  cancelBill(bill: Bill) {
    if (!confirm(`Cancel bill ${bill.billNo}? This cannot be undone.`)) return;
    this.cancelling.set(bill.id);
    this.api.cancel(bill.id).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.load();
      },
      error: (err) => {
        this.cancelling.set(null);
        this.errorMsg.set(err?.error?.message ?? 'Cancel failed.');
      },
    });
  }

  togglePayment(bill: Bill) {
    if (this.expandedId() === bill.id) {
      this.expandedId.set(null);
      this.paymentError.set('');
    } else {
      this.expandedId.set(bill.id);
      this.paymentForm.reset({ paymentMode: 'CASH', amount: null, transactionRef: '' });
      this.paymentError.set('');
    }
  }

  submitPayment(billId: string | number) {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.paymentSubmitting.set(true);
    this.paymentError.set('');
    const { paymentMode, amount, transactionRef } = this.paymentForm.value;
    const body: Record<string, any> = { paymentMode, amount };
    if (transactionRef) body['transactionRef'] = transactionRef;

    this.api.addPayment(billId, body).subscribe({
      next: () => {
        this.paymentSubmitting.set(false);
        this.expandedId.set(null);
        this.load();
      },
      error: (err) => {
        this.paymentSubmitting.set(false);
        this.paymentError.set(err?.error?.message ?? 'Payment failed.');
      },
    });
  }

  badgeClass(status: BillStatus): string {
    const map: Record<BillStatus, string> = {
      DRAFT: 'badge badge-neutral',
      PENDING: 'badge badge-warning',
      PAID: 'badge badge-success',
      PARTIAL: 'badge badge-info',
      CANCELLED: 'badge badge-danger',
    };
    return map[status] ?? 'badge badge-neutral';
  }
}
