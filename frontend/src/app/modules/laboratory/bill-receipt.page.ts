import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LabApiService } from '../../core/services/lab-api.service';
import { PatientApiService } from '../../core/services/patient-api.service';
import { BillingApiService } from '../../core/services/billing-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'hms-lab-bill-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [
    `
      @media screen {
        .print-wrapper { display: none; }
      }
      @media print {
        @page { margin: 0; }
        body { padding: 20px !important; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page {
          display: none !important;
        }
        .print-wrapper {
          display: block !important;
          width: 100%;
        }

        .print-wrapper[data-print-mode="barcode"] .print-bill { display: none !important; }
        .print-wrapper[data-print-mode="bill"] .print-barcode { display: none !important; }

        /* --- Barcode Styles --- */
        .print-barcode {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 10px;
        }
        .barcode-label {
          border: 1px solid #000;
          padding: 12px;
          border-radius: 8px;
          width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-family: sans-serif;
        }
        .barcode-label img {
          max-width: 100%;
          height: auto;
        }
        .patient-info, .test-info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 12px;
          font-weight: bold;
          border-top: 1px solid #000;
          padding-top: 6px;
        }
        .test-info {
          font-size: 11px;
          font-weight: normal;
          border-top: none;
          padding-top: 0;
        }

        /* --- Bill Styles --- */
        .print-bill {
          font-family: Arial, sans-serif;
          color: #000;
          width: 100%;
        }
        .bill-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 10px;
        }
        .bill-logo h2 { margin: 0; color: #4b2354; font-size: 28px; font-weight: bold; }
        .bill-logo .sub { color: #000; font-size: 16px; font-weight: normal; margin-top: -4px; }
        
        .bill-right-logo { text-align: right; }
        .bill-right-logo h3 { margin: 0; color: #4b2354; font-size: 24px; }
        
        .bill-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 5px;
        }
        .bill-title {
          font-size: 14px;
          font-weight: bold;
          text-decoration: underline;
        }
        .bill-barcode-img {
          text-align: right;
        }
        .bill-barcode-img img {
          height: 40px;
        }
        .bill-barcode-img div {
          font-size: 10px;
          text-align: center;
          margin-top: 2px;
        }

        .box {
          border: 2px solid #000;
          padding: 10px 15px;
          margin-bottom: 20px;
        }
        .box-title {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .field {
          display: flex;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .field .label {
          width: 100px;
        }
        .field .sep {
          margin-right: 8px;
        }
        .field .value {
          font-weight: bold;
        }

        .investigation-title {
          font-weight: bold;
          text-decoration: underline;
          font-size: 14px;
          margin-bottom: 10px;
          padding: 0 15px;
        }
        .investigation-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          padding: 0 15px;
        }
        .investigation-table th {
          text-align: left;
          text-decoration: underline;
          font-size: 12px;
          padding: 5px 15px;
          font-weight: bold;
        }
        .investigation-table th:last-child {
          text-align: right;
        }
        .investigation-table td {
          padding: 5px 15px;
          font-size: 12px;
        }
        .investigation-table td:last-child {
          text-align: right;
        }

        .footer-notes {
          font-size: 10px;
          line-height: 1.6;
          margin-top: 10px;
        }
      }

      /* --- Screen Styles --- */
      .page {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--sp-6);
        background: #f9f9fb;
        min-height: 100vh;
      }
      .receipt-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .receipt-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }
      .receipt-subtitle {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-top: 4px;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-primary);
        line-height: 1;
      }

      .card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .card-header {
        background: var(--bg-muted);
        padding: var(--sp-3) var(--sp-4);
        font-family: var(--font-label);
        font-weight: 600;
        font-size: 13px;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-default);
      }
      .card-body {
        padding: var(--sp-4);
      }

      .info-row {
        display: flex;
        align-items: center;
        gap: var(--sp-6);
      }
      .info-group {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .info-label {
        font-size: 12px;
        color: var(--text-secondary);
      }
      .info-value {
        font-size: 13px;
        font-weight: 500;
      }
      input.form-control {
        padding: 4px 8px;
        border: 1px solid var(--border-default);
        border-radius: 4px;
        font-size: 13px;
        width: 150px;
        background: #f3f4f6;
      }

      table.screen-table {
        width: 100%;
        border-collapse: collapse;
      }
      table.screen-table th {
        text-align: left;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-default);
        background: #fafafa;
      }
      table.screen-table td {
        padding: 12px;
        font-size: 13px;
        border-bottom: 1px solid var(--border-default);
        vertical-align: middle;
      }
      table.screen-table tr:last-child td {
        border-bottom: none;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 12px;
        border: 1px solid var(--border-default);
        background: #fff;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        color: var(--clr-primary-700);
        transition: all 0.15s;
      }
      .btn:hover {
        background: var(--bg-muted);
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
        border-color: var(--clr-primary-600);
      }
      .btn-primary:hover {
        background: var(--clr-primary-700);
      }
      
      .table-actions {
        background: #fafafa;
        padding: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--sp-2);
        border-top: 1px solid var(--border-default);
      }

      .other-actions {
        display: flex;
        gap: var(--sp-2);
      }
    `
  ],
  template: `
    <!-- Hidden Print Templates -->
    <div class="print-wrapper" [attr.data-print-mode]="printMode()">
      
      <!-- Barcode Mode -->
      <div class="print-barcode">
        @if (currentPrintTest()) {
          <div class="barcode-label" style="break-after: page;">
            <img [src]="'https://bwipjs-api.metafloor.com/?bcid=code128&text=' + (order()?.sampleBarcode || orderId()?.slice(0,8)) + '&scale=3&includetext=true'" alt="Barcode" />
            <div class="patient-info">
              <span>{{ patient()?.firstName }} {{ patient()?.lastName }}</span>
              <span>{{ calculateAge(patient()?.dateOfBirth) || patient()?.age || 'N/A' }} {{ patient()?.gender?.[0]?.toUpperCase() }}</span>
            </div>
            <div class="test-info">
              <span>{{ currentPrintTest()?.testName || currentPrintTest()?.name || 'Multiple Tests' }} - {{ currentPrintTest()?.sampleType || 'Blood' }}</span>
              <span>Dr. {{ order()?.orderedByDoctorName }}</span>
            </div>
          </div>
        } @else {
          @for (test of order()?.tests; track test.testId || test.id) {
            <div class="barcode-label" style="break-after: page;">
              <img [src]="'https://bwipjs-api.metafloor.com/?bcid=code128&text=' + (order()?.sampleBarcode || orderId()?.slice(0,8)) + '&scale=3&includetext=true'" alt="Barcode" />
              <div class="patient-info">
                <span>{{ patient()?.firstName }} {{ patient()?.lastName }}</span>
                <span>{{ calculateAge(patient()?.dateOfBirth) || patient()?.age || 'N/A' }} {{ patient()?.gender?.[0]?.toUpperCase() }}</span>
              </div>
              <div class="test-info">
                <span>{{ test.testName || test.name }} - {{ test.sampleType || 'Blood' }}</span>
                <span>Dr. {{ order()?.orderedByDoctorName }}</span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Bill Mode -->
      <div class="print-bill">
        <div class="bill-header-row">
          <div class="bill-logo">
            <h2>HMS</h2>
            <div class="sub">HOSPITAL MANAGEMENT SYSTEM</div>
          </div>
          <div class="bill-right-logo">
            <img [src]="'https://bwipjs-api.metafloor.com/?bcid=code128&text=' + (order()?.sampleBarcode || orderId()?.slice(0,8) || 'NEW') + '&scale=3&includetext=true'" alt="Barcode" style="height: 40px;" />
          </div>
        </div>

        <div class="bill-title-row">
          <div class="bill-title">Investigation Cash Receipt</div>
        </div>

        <!-- Patient Details Box -->
        <div class="box">
          <div class="box-title">Patient Details</div>
          <div class="grid-2">
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PATIENT NAME</div><div class="sep">:</div><div class="value">{{ patient()?.firstName }} {{ patient()?.lastName }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">AGE / GENDER</div><div class="sep">:</div><div class="value">{{ calculateAge(patient()?.dateOfBirth) || patient()?.age || 'N/A' }} / {{ patient()?.gender }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PHONE</div><div class="sep">:</div><div class="value">{{ patient()?.phone || '—' }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">REF. DR</div><div class="sep">:</div><div class="value">Dr. {{ order()?.orderedByDoctorName || 'Self' }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">ADDRESS</div><div class="sep">:</div><div class="value">{{ patient()?.address || '—' }}</div></div>
            </div>
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">REQ. ID</div><div class="sep">:</div><div class="value">{{ orderId() | slice:0:10 }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">BILL ID</div><div class="sep">:</div><div class="value">{{ order()?.sampleBarcode || orderId()?.slice(0,8) }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">UID</div><div class="sep">:</div><div class="value">{{ patient()?.id | slice:0:8 }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">BILL DATE</div><div class="sep">:</div><div class="value">{{ (order()?.createdAt | date:'dd/MM/yy, hh:mm a') || '—' }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">ORGANISATION</div><div class="sep">:</div><div class="value">HMS Hospital</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PAY TYPE</div><div class="sep">:</div><div class="value">{{ (order()?.paymentMethod || 'CASH')?.toUpperCase() }}</div></div>
            </div>
          </div>
        </div>

        <!-- Investigation Details -->
        <div class="investigation-title">Investigation Details</div>
        <table class="investigation-table">
          <thead>
            <tr>
              <th style="text-transform: uppercase;">SNO.</th>
              <th style="text-transform: uppercase;">Test Name</th>
              <th style="text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            @for (test of order()?.tests; track test.testId || test.id; let idx = $index) {
              <tr>
                <td>{{ idx + 1 }}</td>
                <td>{{ test.testName || test.name }}</td>
                <td>{{ test.price || 0 }}</td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Payment Details Box -->
        <div class="box">
          <div class="box-title">Payment Details</div>
          <div class="grid-3">
            <div class="field"><div class="label" style="width: auto; margin-right: 10px; text-transform: uppercase;">TOTAL AMOUNT</div><div class="sep">:</div><div class="value">{{ order()?.totalAmount || 0 }}</div></div>
            <div class="field"><div class="label" style="width: auto; margin-right: 10px; text-transform: uppercase;">NET AMOUNT</div><div class="sep">:</div><div class="value">{{ order()?.totalAmount || 0 }}</div></div>
            <div class="field"><div class="label" style="width: auto; margin-right: 10px; text-transform: uppercase;">CONCESSION AMOUNT</div><div class="sep">:</div><div class="value">0</div></div>
          </div>
          <div style="margin-top: 10px;" class="grid-2">
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">IN WORDS</div><div class="sep">:</div><div class="value">Amount in Words Here.</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PRINT DATE</div><div class="sep">:</div><div class="value">{{ now | date:'dd/MM/yy, hh:mm a' }}</div></div>
            </div>
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">BILLED USER</div><div class="sep">:</div><div class="value">Admin</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PRINT USER</div><div class="sep">:</div><div class="value">Admin</div></div>
            </div>
          </div>
        </div>

        <!-- Footer Notes -->
        <div class="footer-notes">
          <div>Note : Cancellations and Refunds will be through Cheque only within 7 working days. For reports Please call between 9AM to 8PM on Monday to Saturday</div>
          <div>Powered by HMS</div>
        </div>

      </div>
    </div>


    <!-- Screen UI -->
    <div class="page">
      <div class="receipt-header">
        <div>
          <h1 class="receipt-title">Bill Receipt</h1>
          <div class="receipt-subtitle">#{{ orderId() | slice:0:8 }}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 12px; color: var(--text-secondary);">Bill Date: {{ (order()?.createdAt | date:'medium') || 'N/A' }}</span>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>
      </div>

      <!-- Sample Collection -->
      <div class="card">
        <div class="card-header">Sample Collection:</div>
        <div class="card-body">
          <div class="info-row" style="justify-content: space-between;">
            <div class="info-group">
              <span class="info-label">Order Number:</span>
              <input type="text" class="form-control" [value]="orderId() | slice:0:8" readonly />
              <button class="btn" (click)="dummyAction('Edit Order Number')">Edit</button>
            </div>
            <div class="info-group">
              <span class="info-label">Sample Collection Date:</span>
              <span class="info-value">{{ (order()?.sampleCollectedAt | date:'medium') || 'Pending' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accessioning -->
      <div class="card">
        <div class="card-header">Accessioning:</div>
        <div class="card-body" style="padding: 0;">
          <table class="screen-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Accession No.</th>
                <th>Sample</th>
                <th>Collection</th>
                <th>Receiving</th>
              </tr>
            </thead>
            <tbody>
              @for (test of order()?.tests; track test.testId || test.id) {
                <tr>
                  <td style="color: var(--text-secondary);">{{ test.testName || test.name }}</td>
                  <td>
                    <div style="display:flex; gap: 8px; align-items:center;">
                      <input type="text" class="form-control" [value]="order()?.sampleBarcode || '0126093642'" readonly style="width: 120px;" />
                      <button class="btn" (click)="dummyAction('Edit Accession No')">Edit</button>
                    </div>
                  </td>
                  <td style="font-size:12px;">Blood / Serum</td>
                  <td>
                    <button class="btn" (click)="collectAndPrint(test)">Collect & Print</button>
                  </td>
                  <td>
                    <button class="btn btn-primary" (click)="receiveAndPrint(test)">Receive & Print</button>
                  </td>
                </tr>
              }
              @if (!order()?.tests?.length) {
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted);">No tests found in this order.</td>
                </tr>
              }
            </tbody>
          </table>
          <div class="table-actions">
            <span style="font-size:12px; font-weight: 500; color: var(--text-primary); margin-right: 16px;">
              Note : This will update sample in outsource centre.
            </span>
            <button class="btn" (click)="dummyAction('Print all Samples')">Print all Samples ⌄</button>
            <button class="btn btn-primary" style="background: #60a5fa; border-color: #60a5fa;" (click)="collectAndPrintAll()">Collect & Print All</button>
            <button class="btn btn-primary" (click)="receiveAndPrintAll()">Receive & Print All</button>
          </div>
        </div>
      </div>

      <!-- Payment Details -->
      <div class="card">
        <div class="card-header">Payment Details:</div>
        <div class="card-body">
          <div class="info-row">
            <div class="info-group">
              <span class="info-label">Total Amount:</span>
              <span class="info-value" style="font-size: 16px;">₹{{ order()?.totalAmount || 0 }}</span>
            </div>
            <div class="info-group" style="margin-left: 24px;">
              <span class="info-label">Payment Method:</span>
              <select class="form-control" [ngModel]="order()?.paymentMethod || 'CASH'" (ngModelChange)="updatePaymentMethod($event)" style="width: 200px;">
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NETBANKING">Netbanking</option>
                <option value="CREDIT">Credit bill</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Actions -->
      <div class="card">
        <div class="card-header">Other Actions:</div>
        <div class="card-body">
          <div class="other-actions">
            <button class="btn" (click)="dummyAction('Print Patient Worksheet')">Print Patient Worksheet</button>
            <button class="btn" (click)="dummyAction('Upload File')">Upload File</button>
            <button class="btn" (click)="dummyAction('Print card')">Print card</button>
            <button class="btn btn-primary" style="background: #10b981; border-color: #10b981;" (click)="saveBill()">Save Bill</button>
            <button class="btn btn-primary" (click)="printReceipt()">Print Receipt</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class BillReceiptPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private labApi = inject(LabApiService);
  private patientApi = inject(PatientApiService);
  private billingApi = inject(BillingApiService);

  orderId = signal<string>('');
  order = signal<any>(null);
  patient = signal<any>(null);
  currentPrintTest = signal<any>(null);
  
  // Controls which template to show during window.print()
  printMode = signal<'barcode'|'bill'|'none'>('none');
  now = new Date();

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('orderId');
      if (id) {
        this.orderId.set(id);
        this.loadOrder(id);
      }
    });
  }

  loadOrder(id: string) {
    this.labApi.getOrder(id).subscribe({
      next: (res) => {
        this.order.set(res);
        if (res?.patientId) {
          this.patientApi.getOne(res.patientId).subscribe({
            next: (pat) => this.patient.set(pat)
          });
        }
      },
      error: () => alert('Failed to load order.')
    });
  }
  
  calculateAge(dob: string): string {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff); 
    return Math.abs(ageDate.getUTCFullYear() - 1970) + 'Y';
  }

  close() {
    this.router.navigate(['/laboratory']);
  }

  dummyAction(name: string) {
    alert(`Action '${name}' triggered.`);
  }

  collectAndPrint(test: any) {
    this.updateOrderStatus({ sampleCollected: true });
    this.currentPrintTest.set(test);
    this.printMode.set('barcode');
    setTimeout(() => {
      window.print();
      this.printMode.set('none');
    }, 100);
  }

  receiveAndPrint(test: any) {
    this.updateOrderStatus({ status: 'IN_PROGRESS' });
    this.currentPrintTest.set(test);
    this.printMode.set('bill');
    setTimeout(() => {
      window.print();
      this.printMode.set('none');
    }, 100);
  }

  collectAndPrintAll() {
    this.updateOrderStatus({ sampleCollected: true });
    this.currentPrintTest.set(null);
    this.printMode.set('barcode');
    setTimeout(() => {
      window.print();
      this.printMode.set('none');
    }, 100);
  }

  receiveAndPrintAll() {
    this.updateOrderStatus({ status: 'IN_PROGRESS' });
    this.currentPrintTest.set(null);
    this.printMode.set('bill');
    setTimeout(() => {
      window.print();
      this.printMode.set('none');
    }, 100);
  }

  printReceipt() {
    this.currentPrintTest.set(null);
    this.printMode.set('bill');
    this.saveBill(true);
  }

  saveBill(andPrint: boolean = false) {
    if (!this.order() || !this.patient()) return;

    if (this.order().isPaid) {
      if (!andPrint) {
        alert('This bill is already saved in the billing history.');
      } else {
        setTimeout(() => {
          window.print();
          this.printMode.set('none');
        }, 100);
      }
      return;
    }

    const payload = {
      patientId: this.patient().id,
      patientName: `${this.patient().firstName} ${this.patient().lastName}`,
      items: this.order().tests.map((t: any) => ({
        description: t.testName || t.name,
        category: 'LAB',
        quantity: 1,
        unitPrice: t.price || 0
      })),
      notes: `LAB_ORDER:${this.orderId()}`
    };

    this.billingApi.create(payload).subscribe({
      next: (res) => {
        // Mark as paid in lab order if applicable
        this.updateOrderStatus({ isPaid: true });
        if (!andPrint) {
          alert('Bill saved successfully!');
        } else {
          setTimeout(() => {
            window.print();
            this.printMode.set('none');
          }, 100);
        }
      },
      error: (err) => {
        console.error(err);
        if (andPrint) {
           setTimeout(() => {
             window.print();
             this.printMode.set('none');
           }, 100);
        } else {
           alert('Failed to save bill. It might already exist or the server encountered an error.');
        }
      }
    });
  }

  updatePaymentMethod(method: string) {
    this.updateOrderStatus({ paymentMethod: method });
  }

  private updateOrderStatus(payload: any) {
    this.labApi.updateOrder(this.orderId(), payload).subscribe({
      next: (res) => {
        this.order.set(res);
      },
      error: () => alert('Failed to update order status.')
    });
  }
}
