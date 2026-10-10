import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BillingApiService } from '../../core/services/billing-api.service';

type BillStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'INSURANCE' | 'CGHS';

interface Bill {
  id: number | string;
  billNumber: string;
  patientId: string;
  patientName: string;
  billDate: string;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: BillStatus;
  createdAt?: string;
  updatedAt?: string;
  items?: any[];
  concessionPercentage?: number;
  concessionReason?: string;
}

@Component({
  selector: 'hms-billing-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      @media screen {
        .print-wrapper { display: none; }
      }
      @media print {
        @page { margin: 0; }
        body { padding: 40px !important; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { display: none !important; }
        .print-wrapper { display: block !important; width: 100%; font-family: Arial, sans-serif; }
        
        .invoice-header { text-align: center; margin-bottom: 20px; }
        .invoice-header h1 { font-size: 28px; margin: 0; color: #333; font-weight: bold; }
        .invoice-header h2 { font-size: 18px; margin: 5px 0 0; color: #666; font-weight: normal; }
        
        .invoice-info { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 15px; margin-bottom: 20px; font-size: 14px; }
        .invoice-info p { margin: 5px 0; }
        
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
        .invoice-table th { border-bottom: 2px solid #ddd; padding: 10px 5px; text-align: left; }
        .invoice-table th.right { text-align: right; }
        .invoice-table td { border-bottom: 1px solid #ddd; padding: 10px 5px; }
        .invoice-table td.right { text-align: right; }
        
        .invoice-summary { width: 300px; margin-left: auto; font-size: 14px; }
        .invoice-summary .row { display: flex; justify-content: space-between; padding: 5px 0; }
        .invoice-summary .row.bold { font-weight: bold; font-size: 16px; border-top: 2px solid #ddd; margin-top: 5px; padding-top: 10px; }
        
        .invoice-footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
      }

      .page {
        padding: var(--sp-6);
        background: var(--bg-base);
        min-height: 100vh;
      }

      .page-header {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--sp-4);
      }
      .breadcrumbs {
        font-family: var(--font-body);
        font-size: 14px;
        color: var(--clr-neutral-600);
        margin-bottom: var(--sp-4);
      }
      .breadcrumbs strong {
        color: var(--clr-neutral-900);
      }
      
      .top-actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #eee;
        padding-bottom: 8px;
        margin-bottom: var(--sp-4);
      }

      .tabs {
        display: flex;
        gap: var(--sp-6);
      }
      .tab {
        padding: var(--sp-2) 0;
        cursor: pointer;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-500);
        border-bottom: 3px solid transparent;
        margin-bottom: -10px;
      }
      .tab.active {
        color: var(--clr-primary-700);
        border-bottom: 3px solid var(--clr-primary-600);
      }
      
      .filters {
        display: flex;
        gap: var(--sp-3);
        align-items: center;
      }
      .filter-input {
        padding: 6px 12px;
        border: 1px solid var(--border-default);
        border-radius: 4px;
        font-family: var(--font-body);
        font-size: 13px;
        background: #f8f9fa;
        color: var(--clr-neutral-900);
        min-width: 200px;
      }
      .filter-btn {
        padding: 6px 12px;
        border: 1px solid var(--border-default);
        border-radius: 4px;
        background: #f8f9fa;
        font-size: 13px;
        color: var(--clr-neutral-600);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      
      .card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: 4px;
        overflow: hidden;
      }

      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead tr {
        background: #fafafa;
      }
      th {
        padding: 16px 16px;
        text-align: left;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        white-space: nowrap;
      }
      td {
        padding: 16px 16px;
        font-family: var(--font-body);
        font-size: 13px;
        color: var(--clr-neutral-700);
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
      }
      tbody tr:hover {
        background: var(--bg-muted);
      }
      tbody tr.expanded {
        background: var(--clr-primary-50);
      }

      .bill-no {
        color: var(--clr-neutral-800);
      }
      .patient-name {
        color: var(--clr-neutral-800);
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
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      .badge-neutral {
        background: #f0f0f0;
        color: #555;
      }
      .badge-warning {
        background: #f0ad4e;
        color: #fff;
      }
      .badge-success {
        background: #5cb85c;
        color: #fff;
      }
      .badge-info {
        background: #5bc0de;
        color: #fff;
      }
      .badge-danger {
        background: #d9534f;
        color: #fff;
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
    <!-- Hidden Invoice Template -->
    <div class="print-wrapper">
      @if (printBill()) {
        <div class="invoice-header">
          <h1>INVOICE</h1>
          <h2>Health Management System</h2>
        </div>
        <div class="invoice-info">
          <div>
            <p><strong>Patient Name:</strong> {{ printBill()?.patientName }}</p>
            <p><strong>Patient ID:</strong> {{ printBill()?.patientId }}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Bill No:</strong> {{ printBill()?.billNumber || printBill()?.id }}</p>
            <p><strong>Date:</strong> {{ printBill()?.billDate | date:'mediumDate' }}</p>
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th class="right">Qty</th>
              <th class="right">Unit Price</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            @for (item of printBill()?.items; track $index) {
              <tr>
                <td>{{ item.description }}</td>
                <td>{{ item.category }}</td>
                <td class="right">{{ item.quantity }}</td>
                <td class="right">₹{{ item.unitPrice | number:'1.2-2' }}</td>
                <td class="right">₹{{ item.amount | number:'1.2-2' }}</td>
              </tr>
            }
            @if (!printBill()?.items || printBill()?.items?.length === 0) {
              <tr><td colspan="5" style="text-align:center;">No items found.</td></tr>
            }
          </tbody>
        </table>
        
        <div class="invoice-summary">
          <div class="row">
            <span>Subtotal:</span>
            <span>₹{{ subtotal(printBill()!) | number:'1.2-2' }}</span>
          </div>
          @if (printBill()?.concessionPercentage) {
            <div class="row" style="color: #666;">
              <span>Discount ({{ printBill()?.concessionPercentage }}%):</span>
              <span>- ₹{{ discountTotal(printBill()!) | number:'1.2-2' }}</span>
            </div>
          }
          <div class="row bold">
            <span>Total Paid:</span>
            <span>₹{{ printBill()?.paidAmount | number:'1.2-2' }}</span>
          </div>
        </div>
        
        <div class="invoice-footer">
          <p>Thank you for your visit.</p>
        </div>
      }
    </div>

    <div class="page">
      <div class="page-header">
        <div class="breadcrumbs">
          Billing History > <strong>Bill Settlements</strong>
        </div>
      </div>

      <div class="top-actions-bar">
        <div class="tabs">
          <div class="tab" [class.active]="activeTab() === 'ALL'" (click)="setActiveTab('ALL')">All Bills</div>
          <div class="tab" [class.active]="activeTab() === 'SETTLEMENTS'" (click)="setActiveTab('SETTLEMENTS')">Bill Settlements</div>
          <div class="tab" [class.active]="activeTab() === 'CREDIT'" (click)="setActiveTab('CREDIT')">Credit Outstanding</div>
          <div class="tab" (click)="goNew()">Add Test To Bill</div>
        </div>

        <div class="filters">
          <input
            class="filter-input"
            type="text"
            placeholder="Search Bill / Patient Name"
            [formControl]="filterForm.controls['search']"
            (input)="onSearch()"
          />
          <select
            class="filter-btn"
            [formControl]="filterForm.controls['status']"
            (change)="load()"
            style="appearance: none; padding-right: 24px; background: #f8f9fa url('data:image/svg+xml;utf8,<svg fill=%22black%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/></svg>') no-repeat right 4px center;"
          >
            <option value="">Filter Rows</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Complete</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input 
            type="date"
            class="filter-btn"
            style="font-family: inherit; color: var(--clr-neutral-600);"
            [formControl]="filterForm.controls['date']"
            (change)="load()"
          />
        </div>
      </div>

      @if (errorMsg()) {
        <div class="error-msg">{{ errorMsg() }}</div>
      }

      <div class="card">
        @if (loading()) {
          <div class="loading">Loading bills…</div>
        } @else {
          <div class="table-wrap">
            @if (activeTab() !== 'CREDIT') {
              <table>
                <thead>
                  <tr>
                    <th>Bill Id</th>
                    <th>Patient Details</th>
                    <th>Referral</th>
                    <th>Department</th>
                    <th>Bill Date</th>
                    <th>Bill Amount</th>
                    <th>Due</th>
                    <th>Bill Status</th>
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
                    <tr [class.expanded]="expandedId() === bill.id" (click)="togglePayment(bill)" style="cursor: pointer;">
                      <td>
                        <span class="bill-no">{{ bill.billNumber || bill.id }}</span>
                      </td>
                      <td>
                        <div class="patient-name">{{ bill.patientName }}</div>
                      </td>
                      <td>—</td>
                      <td>{{ getDepartments(bill) }}</td>
                      <td>{{ bill.billDate | date: 'E MMM dd yyyy' }}</td>
                      <td class="amount amount-grand">{{ bill.grandTotal | number: '1.2-2' }}</td>
                      <td class="amount">{{ bill.balanceAmount | number: '1.2-2' }}</td>
                      <td>
                        @if (isUpdated(bill)) {
                          <span class="badge badge-info" style="margin-right: 4px;">Updated</span>
                        }
                        <span class="badge" [class]="badgeClass(bill.status)">{{ (bill.status === 'PAID' ? 'Complete' : 'Pending') }}</span>
                      </td>
                    </tr>
                    @if (expandedId() === bill.id) {
                      <tr class="payment-row">
                        <td colspan="8">
                          @if (bill.status === 'PAID') {
                            <div class="payment-panel">
                              <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                  <div class="payment-panel-title">Invoice Details</div>
                                  <p style="margin:4px 0; font-size:13px; color:var(--text-secondary);"><strong>Bill No:</strong> {{ bill.billNumber || bill.id }} &nbsp;|&nbsp; <strong>Date:</strong> {{ bill.billDate | date:'mediumDate' }}</p>
                                  <p style="margin:4px 0; font-size:13px; color:var(--text-secondary);"><strong>Total Paid:</strong> ₹{{ bill.paidAmount | number:'1.2-2' }}</p>
                                </div>
                                <button class="btn btn-primary" (click)="doPrintInvoice(bill)">
                                  Print Invoice
                                </button>
                              </div>
                            </div>
                          } @else {
                            <div class="payment-panel">
                              <div class="payment-panel-title">Add Payment — {{ bill.billNumber || bill.id }}</div>
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
                          }
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            } @else {
              <table>
                <thead>
                  <tr>
                    <th>Sponsor Name</th>
                    <th>Unbilled Amount</th>
                    <th>Submitted Amount</th>
                    <th>Approved Amount</th>
                    <th>Rejected Amount</th>
                    <th>Settled Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @if (creditReports().length === 0) {
                    <tr>
                      <td colspan="6">
                        <div class="empty-state">No credit outstanding records found.</div>
                      </td>
                    </tr>
                  }
                  @for (report of creditReports(); track report.sponsorName) {
                    <tr>
                      <td><strong>{{ report.sponsorName || 'Unknown Sponsor' }}</strong></td>
                      <td class="amount text-warning">₹{{ report.unbilledAmount | number: '1.2-2' }}</td>
                      <td class="amount text-info">₹{{ report.submittedAmount | number: '1.2-2' }}</td>
                      <td class="amount text-success">₹{{ report.approvedAmount | number: '1.2-2' }}</td>
                      <td class="amount text-danger">₹{{ report.rejectedAmount | number: '1.2-2' }}</td>
                      <td class="amount text-primary">₹{{ report.settledAmount | number: '1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
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

  activeTab = signal<'ALL' | 'SETTLEMENTS' | 'CREDIT'>('SETTLEMENTS');
  bills = signal<Bill[]>([]);
  creditReports = signal<any[]>([]);
  loading = signal(false);
  errorMsg = signal('');
  cancelling = signal<string | number | null>(null);

  expandedId = signal<string | number | null>(null);
  printBill = signal<Bill | null>(null);
  paymentSubmitting = signal(false);
  paymentError = signal('');

  filterForm = this.fb.group({
    status: [''],
    search: [''],
    date: [''],
  });

  paymentForm = this.fb.group({
    paymentMode: ['CASH' as PaymentMode],
    amount: [null as number | null, [this._positiveValidator]],
    transactionRef: [''],
  });

  subtotal(bill: Bill): number {
    return (bill.items || []).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }

  discountTotal(bill: Bill): number {
    if (!bill.concessionPercentage) return 0;
    return (this.subtotal(bill) * bill.concessionPercentage) / 100;
  }

  doPrintInvoice(bill: Bill) {
    this.printBill.set(bill);
    const prevTitle = document.title;
    const sanitize = (s: string) => (s || '').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const pid = sanitize(bill.patientId || String(bill.billNumber || bill.id));
    const pname = sanitize(bill.patientName || 'Patient');

    document.title = `${pid}_${pname}`;

    const restoreTitle = () => {
      document.title = prevTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    setTimeout(() => {
      window.print();
      setTimeout(restoreTitle, 2000);
    }, 150);
  }

  private _positiveValidator(control: any) {
    const v = control.value;
    return v != null && v > 0 ? null : { positive: true };
  }

  private _searchTimer: any = null;

  ngOnInit() {
    this.load();
  }

  setActiveTab(tab: 'ALL' | 'SETTLEMENTS' | 'CREDIT') {
    this.activeTab.set(tab);
    if (tab === 'SETTLEMENTS') {
      this.filterForm.patchValue({ status: 'PAID' }, { emitEvent: false });
      this.load();
    } else if (tab === 'CREDIT') {
      this.loadCreditOutstanding();
    } else {
      this.filterForm.patchValue({ status: '' }, { emitEvent: false });
      this.load();
    }
  }

  loadCreditOutstanding() {
    this.loading.set(true);
    this.errorMsg.set('');
    this.api.getCreditOutstanding().subscribe({
      next: (res) => {
        this.creditReports.set(res || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set('Failed to load credit outstanding.');
        this.loading.set(false);
      }
    });
  }

  load() {
    this.loading.set(true);
    this.errorMsg.set('');
    const { status, search, date } = this.filterForm.value;
    const q: Record<string, any> = {};
    if (status) q['status'] = status;
    if (search) q['search'] = search;
    if (date) {
      q['dateFrom'] = date;
      q['dateTo'] = date;
    }

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
    this.router.navigate(['/registration/billing-history/add-test-to-bill']);
  }

  goEdit(id: string | number) {
    this.router.navigate(['/billing', id]);
  }

  isUpdated(bill: Bill): boolean {
    if (!bill.createdAt || !bill.updatedAt) return false;
    const created = new Date(bill.createdAt).getTime();
    const updated = new Date(bill.updatedAt).getTime();
    return updated - created > 2000;
  }

  cancelBill(bill: Bill) {
    if (!confirm(`Cancel bill ${bill.billNumber}? This cannot be undone.`)) return;
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
    const body: Record<string, any> = { paymentMode, amount, billId: String(billId) };
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

  getDepartments(bill: any): string {
    if (!bill.items || !Array.isArray(bill.items) || bill.items.length === 0) {
      return '—';
    }
    const categories = new Set<string>();
    for (const item of bill.items) {
      if (item.category) {
        categories.add(item.category);
      }
    }
    if (categories.size === 0) return '—';
    
    // Convert e.g., 'CONSULTATION' -> 'Consultation', 'PHARMACY' -> 'Pharmacy'
    const sorted = Array.from(categories).map(cat => {
      if (cat === 'CONSULTATION') return 'Appointment';
      return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    });
    
    return sorted.join(', ');
  }
}
