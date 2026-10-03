import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BillingApiService } from '../../core/services/billing-api.service';
import { OrganizationApiService } from '../../core/services/organization-api.service';

type BillStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'INSURANCE' | 'CGHS';

interface Bill {
  id: number | string;
  billNumber: string;
  patientId: string;
  patientName: string;
  billDate: string;
  dueDate?: string;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: BillStatus;
  createdAt?: string;
  updatedAt?: string;
  items?: any[];
  concessionPercentage?: number;
  concessionReason?: string;
  organizationId?: string;
  notes?: string;
}

@Component({
  selector: 'hms-invoice-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      @media screen {
        .print-wrapper { display: none !important; }
      }
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page {
          display: none !important;
        }
        .print-wrapper {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, Helvetica, sans-serif !important;
          color: #000000 !important;
          background: #ffffff !important;
        }

        .pdf-container {
          width: 100%;
          box-sizing: border-box;
        }

        .pdf-header {
          width: 100%;
          margin: 0;
          padding: 0;
          display: block;
        }
        .pdf-header img {
          width: 100%;
          height: auto;
          display: block;
        }

        .pdf-body {
          padding: 6px 20pt 20pt 20pt;
          box-sizing: border-box;
        }

        .pdf-title {
          font-size: 13px;
          font-weight: bold;
          text-align: center;
          letter-spacing: 0.5px;
          margin: 8px 0 6px 0;
          color: #000;
        }

        .divider-line {
          width: 100%;
          height: 1px;
          background: #000;
          margin: 0;
        }

        .company-block {
          text-align: center;
          padding: 6px 0;
        }
        .company-name {
          font-size: 13px;
          font-weight: bold;
          color: #000;
        }
        .company-address {
          font-size: 10.5px;
          color: #000;
          margin-top: 2px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1.25fr 1.05fr 1.05fr 1fr;
          border: 1px solid #000;
          margin-top: 6px;
          font-size: 9.5px;
          line-height: 1.35;
        }
        .meta-col {
          padding: 5px 6px;
          border-right: 1px solid #000;
          word-break: break-word;
        }
        .meta-col:last-child {
          border-right: none;
        }
        .meta-col div {
          margin-bottom: 2px;
        }
        .meta-col strong {
          font-weight: bold;
        }

        .invoice-data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 9.5px;
        }
        .invoice-data-table th,
        .invoice-data-table td {
          border: 1px solid #000;
          padding: 5px 5px;
          box-sizing: border-box;
        }
        .invoice-data-table th {
          background-color: #ebebeb !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
          line-height: 1.2;
        }
        .invoice-data-table td {
          vertical-align: middle;
          line-height: 1.25;
        }

        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }

        .summary-row td {
          font-weight: bold;
          padding: 4px 6px;
        }
        .summary-left {
          font-size: 9.5px;
        }
        .summary-right {
          font-size: 10px;
        }

        .bottom-block {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 15px;
          font-size: 10px;
          line-height: 1.4;
        }
        .bank-details-block {
          width: 50%;
        }
        .bank-line-title {
          font-weight: bold;
          margin-bottom: 2px;
        }

        .signature-block {
          width: 45%;
          text-align: center;
        }
        .company-sign-title {
          font-weight: bold;
        }
        .signature-img-container {
          margin: 2px auto;
        }
        .signature-img-container img {
          height: 44px;
          width: auto;
          display: block;
          margin: 0 auto;
        }
        .signatory-label {
          font-size: 10px;
          margin-top: 2px;
        }

        .note-line {
          width: 100%;
          height: 1px;
          background: #000;
          margin-top: 15px;
        }
        .disclaimer-text {
          font-size: 9px;
          line-height: 1.3;
          margin-top: 4px;
          color: #000;
        }
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
    <!-- Hidden Invoice Template strictly modeled after Maxivision Eye Hospital PDF -->
    <div class="print-wrapper">
      @if (printBill()) {
        <div class="pdf-container">
          <!-- Top Header Banner -->
          <div class="pdf-header">
            <img src="/access-pathlab-header.jpeg" alt="Access PathLab" />
          </div>

          <div class="pdf-body">
            <!-- Title -->
            <div class="pdf-title">INVOICE</div>

            <div class="divider-line"></div>

            <!-- Lab Info -->
            <div class="company-block">
              <div class="company-name">Access Path Lab India Pvt Ltd</div>
              <div class="company-address">14-37-41/2, Beside Sri Sathya IVF, Krishna Nagar,</div>
            </div>

            <div class="divider-line"></div>

            <!-- 4-Column Metadata Grid -->
            <div class="meta-grid">
              <!-- Col 1: Organization / Patient -->
              <div class="meta-col col-1">
                @if (getOrg(printBill())) {
                  <div><strong>Organization Name :</strong> {{ getOrg(printBill())?.name }}</div>
                } @else {
                  <div><strong>Organization Name :</strong> -</div>
                  <div style="margin-top: 4px;"><strong>Patient Name :</strong> {{ printBill()?.patientName }}</div>
                }
              </div>

              <!-- Col 2: Invoice No & Doctor -->
              <div class="meta-col col-2">
                <div><strong>Invoice No :</strong> {{ printBill()?.billNumber || printBill()?.id }}</div>
                <div><strong>Prepared by :</strong> Dr Krishna Prasad</div>
                <div>accesspathlabs&#64;gmail.com</div>
                <div>Phone : +919618135999</div>
              </div>

              <!-- Col 3: Details -->
              <div class="meta-col col-3">
                <div><strong>Details :</strong></div>
                <div style="margin-top: 4px;">Email :</div>
                <div>{{ getOrg(printBill())?.email || 'otvizag@maxivisioneyehospital.com' }}</div>
                <div style="margin-top: 2px;">Contact No : {{ getOrg(printBill())?.phone || '9963649050' }}</div>
              </div>

              <!-- Col 4: Dates -->
              <div class="meta-col col-4">
                <div><strong>Date :</strong> {{ (printBill()?.billDate | date:'dd/MM/yyyy') || todayFormatted }}</div>
                <div><strong>Due Date :</strong> {{ (printBill()?.dueDate | date:'dd/MM/yyyy') || (printBill()?.billDate | date:'dd/MM/yyyy') || todayFormatted }}</div>
                <div><strong>Period :</strong> {{ getPeriodText(printBill()) }}</div>
              </div>
            </div>

            <!-- Table of Services / Items -->
            <table class="invoice-data-table">
              <thead>
                <tr>
                  <th style="width: 11%;">DATE</th>
                  <th style="width: 10%;">BILL ID</th>
                  <th style="width: 20%;">PATIENT NAME</th>
                  <th style="width: 27%;">SERVICES</th>
                  <th style="width: 11%;">TEST<br/>AMOUNT</th>
                  <th style="width: 10%;">PAID BY<br/>PATIENT</th>
                  <th style="width: 11%;">DUE<br/>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                @if (printBill()?.items && printBill()!.items!.length > 0) {
                  @for (item of printBill()?.items; track $index) {
                    <tr>
                      <td class="text-center">{{ (printBill()?.billDate | date:'dd/MM/yyyy') }}</td>
                      <td class="text-center">{{ item.billId || printBill()?.billNumber || printBill()?.id }}</td>
                      <td class="text-left">{{ item.patientName || printBill()?.patientName }}</td>
                      <td class="text-left">{{ item.description }}</td>
                      <td class="text-right">{{ (item.unitPrice * (item.quantity || 1)) | number:'1.1-2' }}</td>
                      <td class="text-center">{{ getItemPaid(printBill()!, item) | number:'1.1-2' }}</td>
                      <td class="text-right">{{ getItemDue(printBill()!, item) | number:'1.1-2' }}</td>
                    </tr>
                  }
                } @else {
                  <tr>
                    <td class="text-center">{{ (printBill()?.billDate | date:'dd/MM/yyyy') }}</td>
                    <td class="text-center">{{ printBill()?.billNumber || printBill()?.id }}</td>
                    <td class="text-left">{{ printBill()?.patientName }}</td>
                    <td class="text-left">Laboratory Services</td>
                    <td class="text-right">{{ printBill()?.grandTotal | number:'1.1-2' }}</td>
                    <td class="text-center">{{ (isOrgBill(printBill()!) ? 0 : printBill()?.paidAmount) | number:'1.1-2' }}</td>
                    <td class="text-right">{{ (isOrgBill(printBill()!) ? printBill()?.grandTotal : printBill()?.balanceAmount) | number:'1.1-2' }}</td>
                  </tr>
                }

                <!-- Totals Rows -->
                <tr class="summary-row">
                  <td colspan="6" class="text-left summary-left">
                    Amount chargeable (in words) : {{ numberToWords(totalDue(printBill()!)) }}
                  </td>
                  <td class="text-right summary-right">
                    {{ totalDue(printBill()!) | number:'1.1-2' }}
                  </td>
                </tr>
                <tr class="summary-row">
                  <td colspan="6" class="text-left summary-left">
                    Due :
                  </td>
                  <td class="text-right summary-right">
                    {{ totalDue(printBill()!) | number:'1.1-2' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Bottom Section: Bank Details & Signatory -->
            <div class="bottom-block">
              <div class="bank-details-block">
                <div class="bank-line-title">Bank Details:</div>
                <div>Name: Access Pathlab India Private Limited</div>
                <div>Account No: 071063700000160</div>
                <div>IFSC Code: YESB0000710</div>
              </div>

              <div class="signature-block">
                <div class="company-sign-title">FOR Access Path Lab India Pvt Ltd</div>
                <div class="signature-img-container">
                  <img src="/access-pathlab-signature.jpeg" alt="Signature" />
                </div>
                <div class="signatory-label">Authorised Signatory</div>
              </div>
            </div>

            <!-- Disclaimer Note -->
            <div class="note-line"></div>
            <div class="disclaimer-text">
              Note: Please contact us for any discrepancies in the invoice within 1 week after receiving invoice. Contact No: 9618135999/7337455589
            </div>
          </div>
        </div>
      }
    </div>

    <div class="page">
      <div class="page-header">
        <div class="breadcrumbs">
          Billing History > <strong>Invoice</strong>
        </div>
      </div>

      <div class="top-actions-bar">
        <div style="font-family: var(--font-display); font-size: 16px; font-weight: 500; color: var(--clr-neutral-800);">
          All Bills
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
            <table>
              <thead>
                <tr>
                  <th>Bill Id</th>
                  <th>Patient Details</th>
                  <th>Referral</th>
                  <th>Bill</th>
                  <th>Bill Date</th>
                  <th>Bill Amount</th>
                  <th>Due</th>
                  <th>Invoice</th>
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
                  <tr>
                    <td>
                      <span class="bill-no">{{ bill.billNumber || bill.id }}</span>
                    </td>
                    <td>
                      <div class="patient-name">
                        {{ getOrg(bill)?.name ? getOrg(bill)?.name + ' (' + bill.patientName + ')' : bill.patientName }}
                      </div>
                    </td>
                    <td>{{ getOrg(bill)?.name || '—' }}</td>
                    <td>—</td>
                    <td>{{ bill.billDate | date: 'E MMM dd yyyy' }}</td>
                    <td class="amount amount-grand">{{ bill.grandTotal | number: '1.2-2' }}</td>
                    <td class="amount">{{ bill.balanceAmount | number: '1.2-2' }}</td>
                    <td>
                      <button class="btn" style="padding: 6px 12px; font-size: 12px; color: var(--clr-primary-700); background: var(--clr-primary-50); border: 1px solid var(--clr-primary-200); border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" (click)="doPrintInvoice(bill)">
                        <svg fill="currentColor" width="14" height="14" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> Download
                      </button>
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
export class InvoicePage implements OnInit {
  private api = inject(BillingApiService);
  private orgApi = inject(OrganizationApiService);
  private fb = inject(FormBuilder);

  bills = signal<Bill[]>([]);
  loading = signal(false);
  errorMsg = signal('');
  orgMap = signal<Map<string, any>>(new Map());

  printBill = signal<Bill | null>(null);

  filterForm = this.fb.group({
    status: ['PAID'],
    search: [''],
    date: [''],
  });

  get todayFormatted(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  subtotal(bill: Bill): number {
    return (bill.items || []).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }

  discountTotal(bill: Bill): number {
    if (!bill.concessionPercentage) return 0;
    return (this.subtotal(bill) * bill.concessionPercentage) / 100;
  }

  getOrg(bill: Bill | null): any {
    if (!bill || !bill.organizationId) return null;
    return this.orgMap().get(bill.organizationId) || null;
  }

  isOrgBill(bill: Bill | null): boolean {
    return !!(bill && (bill.organizationId || this.getOrg(bill)));
  }

  getPeriodText(bill: Bill | null): string {
    if (!bill || !bill.billDate) return '-';
    const d = new Date(bill.billDate);
    if (isNaN(d.getTime())) return bill.billDate;
    const firstDay = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth(), 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const f1 = `${pad(firstDay.getDate())}/${pad(firstDay.getMonth() + 1)}/${firstDay.getFullYear()}`;
    const f2 = `${pad(lastDay.getDate())}/${pad(lastDay.getMonth() + 1)}/${lastDay.getFullYear()}`;
    return `${f1} to ${f2}`;
  }

  getItemPaid(bill: Bill, item: any): number {
    if (this.isOrgBill(bill)) {
      return 0;
    }
    if (bill.status === 'PAID' || bill.balanceAmount === 0) {
      return item.amount ?? (item.unitPrice * (item.quantity || 1));
    }
    return 0;
  }

  getItemDue(bill: Bill, item: any): number {
    if (this.isOrgBill(bill)) {
      return item.amount ?? (item.unitPrice * (item.quantity || 1));
    }
    if (bill.status === 'PAID' || bill.balanceAmount === 0) {
      return 0;
    }
    return item.amount ?? (item.unitPrice * (item.quantity || 1));
  }

  totalDue(bill: Bill | null): number {
    if (!bill) return 0;
    if (this.isOrgBill(bill)) {
      return bill.balanceAmount > 0 ? Number(bill.balanceAmount) : Number(bill.grandTotal);
    }
    return bill.status === 'PAID' ? Number(bill.grandTotal) : Number(bill.balanceAmount);
  }

  numberToWords(num: number): string {
    if (!num || isNaN(num) || num === 0) return 'Zero Only';
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    };

    const integerPart = Math.floor(Math.abs(num));
    const words = inWords(integerPart).trim();
    return words ? words + ' Only' : 'Zero Only';
  }

  doPrintInvoice(bill: Bill) {
    this.printBill.set(bill);
    const prevTitle = document.title;
    const sanitize = (s: string) => (s || '').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const pid = sanitize(bill.patientId || String(bill.billNumber || bill.id));
    const pname = sanitize(bill.patientName || (this.getOrg(bill)?.name ?? 'Patient'));

    // Set document title so browser PDF print dialog defaults to "${patientId}_${patientName}.pdf"
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

  private _searchTimer: any = null;

  ngOnInit() {
    const img1 = new Image();
    img1.src = '/access-pathlab-header.jpeg';
    const img2 = new Image();
    img2.src = '/access-pathlab-signature.jpeg';

    this.load();
    this.loadOrgs();
  }

  loadOrgs() {
    this.orgApi.list().subscribe({
      next: (orgs) => {
        const map = new Map<string, any>();
        (orgs || []).forEach((o: any) => map.set(o.id, o));
        this.orgMap.set(map);
      },
      error: () => {}
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
}
