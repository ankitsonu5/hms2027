import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { BillingApiService } from '../../core/services/billing-api.service';

type ItemCategory = 'CONSULTATION' | 'LAB' | 'PHARMACY' | 'PROCEDURE' | 'BED' | 'OTHER';

@Component({
  selector: 'hms-billing-form',
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
        gap: var(--sp-3);
        margin-bottom: var(--sp-6);
      }
      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1);
        padding: var(--sp-1) var(--sp-2);
        background: transparent;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        color: var(--clr-neutral-600);
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .back-btn:hover {
        background: var(--bg-muted);
      }
      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-900);
        margin: 0;
      }

      .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: var(--sp-5);
        align-items: start;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        box-shadow: var(--shadow-sm);
      }
      .section-title {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--sp-4);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-4);
        margin-bottom: var(--sp-5);
      }
      .form-grid .full {
        grid-column: 1 / -1;
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
      .required-star {
        color: var(--clr-danger-500);
        margin-left: 2px;
      }
      .form-control {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        background: var(--bg-surface);
        color: var(--clr-neutral-900);
        transition: var(--transition-fast);
      }
      .form-control:focus {
        outline: none;
        border-color: var(--clr-primary-500);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      .form-control.invalid {
        border-color: var(--clr-danger-500);
      }
      .field-error {
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
      }
      textarea.form-control {
        resize: vertical;
        min-height: 72px;
      }

      /* Items table */
      .items-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-3);
      }
      .table-wrap {
        overflow-x: auto;
        margin-bottom: var(--sp-3);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }
      th {
        padding: var(--sp-2) var(--sp-3);
        text-align: left;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: var(--bg-muted);
        white-space: nowrap;
      }
      td {
        padding: var(--sp-2) var(--sp-2);
        border-top: 1px solid var(--border-default);
        vertical-align: top;
      }
      td .form-control {
        width: 100%;
        box-sizing: border-box;
      }
      .col-desc {
        min-width: 180px;
      }
      .col-cat {
        min-width: 140px;
      }
      .col-num {
        width: 80px;
      }
      .col-amount {
        width: 100px;
        white-space: nowrap;
        text-align: right;
        font-variant-numeric: tabular-nums;
        font-size: var(--text-sm);
        padding-top: calc(var(--sp-2) + 6px);
        color: var(--clr-neutral-800);
        font-weight: var(--fw-medium);
      }
      .col-remove {
        width: 40px;
        text-align: center;
      }
      .remove-btn {
        background: transparent;
        border: none;
        color: var(--clr-danger-500);
        font-size: 1.1rem;
        cursor: pointer;
        padding: var(--sp-1);
        border-radius: var(--radius-sm);
        line-height: 1;
        margin-top: 4px;
      }
      .remove-btn:hover {
        background: var(--clr-danger-50);
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
        border: none;
        transition: var(--transition-fast);
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--clr-primary-700);
      }
      .btn-outline {
        background: transparent;
        color: var(--clr-primary-600);
        border: 1px solid var(--clr-primary-300);
      }
      .btn-outline:hover {
        background: var(--clr-primary-50);
      }
      .btn-sm {
        padding: var(--sp-1) var(--sp-3);
        font-size: var(--text-xs);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Summary card */
      .summary-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        box-shadow: var(--shadow-sm);
        position: sticky;
        top: var(--sp-4);
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--sp-2) 0;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-700);
        border-bottom: 1px solid var(--border-default);
      }
      .summary-row:last-of-type {
        border-bottom: none;
      }
      .summary-row.total {
        padding-top: var(--sp-3);
        font-family: var(--font-label);
        font-size: var(--text-base);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-900);
      }
      .summary-row.discount {
        color: var(--clr-success-700);
      }
      .summary-amount {
        font-variant-numeric: tabular-nums;
        font-weight: var(--fw-medium);
      }

      .form-footer {
        display: flex;
        gap: var(--sp-3);
        align-items: center;
        margin-top: var(--sp-5);
        flex-wrap: wrap;
      }
      .status-field {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        margin-left: auto;
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
        padding: var(--sp-10);
        color: var(--clr-neutral-400);
        font-size: var(--text-sm);
      }
    `,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">&#8592; Back</button>
        <h1 class="page-title">{{ isEdit ? 'Edit Bill' : 'New Bill' }}</h1>
      </div>

      @if (loadingBill()) {
        <div class="loading">Loading bill…</div>
      } @else {
        @if (errorMsg()) {
          <div class="error-msg">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="layout">
            <!-- Left column -->
            <div>
              <!-- Header fields -->
              <div class="card" style="margin-bottom:var(--sp-4)">
                <div class="section-title">Bill Details</div>
                <div class="form-grid">
                  <div class="form-field">
                    <label class="form-label"
                      >Patient ID <span class="required-star">*</span></label
                    >
                    <input
                      class="form-control"
                      [class.invalid]="isInvalid('patientId')"
                      type="text"
                      formControlName="patientId"
                      placeholder="e.g. P-00123"
                    />
                    @if (isInvalid('patientId')) {
                      <span class="field-error">Patient ID is required.</span>
                    }
                  </div>

                  <div class="form-field">
                    <label class="form-label"
                      >Patient Name <span class="required-star">*</span></label
                    >
                    <input
                      class="form-control"
                      [class.invalid]="isInvalid('patientName')"
                      type="text"
                      formControlName="patientName"
                      placeholder="Full name"
                    />
                    @if (isInvalid('patientName')) {
                      <span class="field-error">Patient name is required.</span>
                    }
                  </div>

                  <div class="form-field">
                    <label class="form-label">Bill Date</label>
                    <input class="form-control" type="date" formControlName="billDate" />
                  </div>

                  <div class="form-field full">
                    <label class="form-label">Notes</label>
                    <textarea
                      class="form-control"
                      formControlName="notes"
                      placeholder="Optional notes…"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="card">
                <div class="items-header">
                  <div class="section-title" style="margin-bottom:0">Line Items</div>
                  <button type="button" class="btn btn-outline btn-sm" (click)="addRow()">
                    + Add Row
                  </button>
                </div>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th class="col-desc">Description</th>
                        <th class="col-cat">Category</th>
                        <th class="col-num">Qty</th>
                        <th class="col-num">Unit Price</th>
                        <th class="col-num">Disc %</th>
                        <th class="col-num">GST %</th>
                        <th class="col-amount">Amount</th>
                        <th class="col-remove"></th>
                      </tr>
                    </thead>
                    <tbody formArrayName="items">
                      @if (items.length === 0) {
                        <tr>
                          <td
                            colspan="8"
                            style="text-align:center;color:var(--clr-neutral-400);font-size:var(--text-sm);padding:var(--sp-5)"
                          >
                            No items yet. Click "+ Add Row" to begin.
                          </td>
                        </tr>
                      }
                      @for (row of items.controls; track $index) {
                        <tr [formGroupName]="$index">
                          <td class="col-desc">
                            <input
                              class="form-control"
                              [class.invalid]="isItemInvalid($index, 'description')"
                              type="text"
                              formControlName="description"
                              placeholder="Description"
                            />
                          </td>
                          <td class="col-cat">
                            <select class="form-control" formControlName="category">
                              <option value="CONSULTATION">Consultation</option>
                              <option value="LAB">Lab</option>
                              <option value="PHARMACY">Pharmacy</option>
                              <option value="PROCEDURE">Procedure</option>
                              <option value="BED">Bed</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="1"
                              formControlName="quantity"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="0"
                              step="0.01"
                              formControlName="unitPrice"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="0"
                              max="100"
                              formControlName="discountPct"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="0"
                              max="100"
                              formControlName="gstPct"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-amount">₹{{ rowAmount($index) | number: '1.2-2' }}</td>
                          <td class="col-remove">
                            <button
                              type="button"
                              class="remove-btn"
                              (click)="removeRow($index)"
                              title="Remove row"
                            >
                              &#215;
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Footer actions -->
              <div class="form-footer">
                <div class="form-field status-field">
                  <label class="form-label" style="margin-right:var(--sp-2)">Status</label>
                  <select class="form-control" formControlName="status" style="width:auto">
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <button type="button" class="btn btn-outline" (click)="goBack()">Cancel</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="submitting() || form.invalid"
                >
                  {{ submitting() ? 'Saving…' : isEdit ? 'Update Bill' : 'Create Bill' }}
                </button>
              </div>
            </div>

            <!-- Right column: summary -->
            <div>
              <div class="summary-card">
                <div class="section-title">Summary</div>
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span class="summary-amount">₹{{ totals().subtotal | number: '1.2-2' }}</span>
                </div>
                <div class="summary-row discount">
                  <span>Total Discount</span>
                  <span class="summary-amount">− ₹{{ totals().discount | number: '1.2-2' }}</span>
                </div>
                <div class="summary-row">
                  <span>Total GST</span>
                  <span class="summary-amount">+ ₹{{ totals().gst | number: '1.2-2' }}</span>
                </div>
                <div class="summary-row total">
                  <span>Grand Total</span>
                  <span class="summary-amount">₹{{ totals().grandTotal | number: '1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class BillingFormPage implements OnInit {
  private api = inject(BillingApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isEdit = false;
  billId: string | number | null = null;
  loadingBill = signal(false);
  submitting = signal(false);
  errorMsg = signal('');

  totals = signal({ subtotal: 0, discount: 0, gst: 0, grandTotal: 0 });

  form: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    patientName: ['', Validators.required],
    billDate: [this._today()],
    notes: [''],
    status: ['DRAFT'],
    items: this.fb.array([]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.billId = id;
      this.loadBill(id);
    } else {
      this.addRow();
    }
  }

  private loadBill(id: string) {
    this.loadingBill.set(true);
    this.api.getOne(id).subscribe({
      next: (bill: any) => {
        this.form.patchValue({
          patientId: bill.patientId,
          patientName: bill.patientName,
          billDate: bill.billDate?.slice(0, 10) ?? this._today(),
          notes: bill.notes ?? '',
          status: bill.status ?? 'DRAFT',
        });
        this.items.clear();
        const rows: any[] = bill.items ?? [];
        rows.forEach((item) => {
          this.items.push(this._makeRow(item));
        });
        if (this.items.length === 0) this.addRow();
        this.recalc();
        this.loadingBill.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Failed to load bill.');
        this.loadingBill.set(false);
      },
    });
  }

  addRow() {
    this.items.push(this._makeRow());
    this.recalc();
  }

  removeRow(index: number) {
    this.items.removeAt(index);
    this.recalc();
  }

  recalc() {
    let subtotal = 0;
    let discount = 0;
    let gst = 0;
    this.items.controls.forEach((_, i) => {
      const base = this._rowBase(i);
      const disc = this._rowDiscount(i, base);
      const gstAmt = this._rowGst(i, base - disc);
      subtotal += base;
      discount += disc;
      gst += gstAmt;
    });
    this.totals.set({
      subtotal,
      discount,
      gst,
      grandTotal: subtotal - discount + gst,
    });
  }

  rowAmount(index: number): number {
    const base = this._rowBase(index);
    const disc = this._rowDiscount(index, base);
    const gstAmt = this._rowGst(index, base - disc);
    return base - disc + gstAmt;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMsg.set('');

    const value = this.form.value;
    const body = {
      ...value,
      grandTotal: this.totals().grandTotal,
    };

    const req = this.isEdit ? this.api.update(this.billId!, body) : this.api.create(body);

    req.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/billing']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Save failed. Please try again.');
      },
    });
  }

  goBack() {
    this.router.navigate(['/billing']);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  isItemInvalid(index: number, field: string): boolean {
    const c = this.items.at(index)?.get(field);
    return !!(c && c.invalid && c.touched);
  }

  private _makeRow(data?: any): FormGroup {
    return this.fb.group({
      description: [data?.description ?? '', Validators.required],
      category: [data?.category ?? ('CONSULTATION' as ItemCategory)],
      quantity: [data?.quantity ?? 1],
      unitPrice: [data?.unitPrice ?? 0],
      discountPct: [data?.discountPct ?? 0],
      gstPct: [data?.gstPct ?? 0],
    });
  }

  private _rowBase(index: number): number {
    const row = this.items.at(index).value;
    const qty = Number(row.quantity) || 0;
    const unit = Number(row.unitPrice) || 0;
    return qty * unit;
  }

  private _rowDiscount(index: number, base: number): number {
    const row = this.items.at(index).value;
    const pct = Number(row.discountPct) || 0;
    return (base * pct) / 100;
  }

  private _rowGst(index: number, afterDiscount: number): number {
    const row = this.items.at(index).value;
    const pct = Number(row.gstPct) || 0;
    return (afterDiscount * pct) / 100;
  }

  private _today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
