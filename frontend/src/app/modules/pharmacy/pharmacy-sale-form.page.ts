import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';

interface DrugResult {
  id: string | number;
  genericName: string;
  brandName?: string;
  mrp: number;
  saleRate: number;
}

@Component({
  selector: 'hms-pharmacy-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      .page-wrap {
        padding: var(--sp-6);
        max-width: 900px;
        margin: 0 auto;
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
        font-family: var(--font-label);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
        background: transparent;
        border: none;
        cursor: pointer;
        padding: var(--sp-1) var(--sp-2);
        border-radius: var(--radius-sm);
        transition: var(--transition-fast);
      }
      .back-btn:hover {
        background: var(--bg-muted);
        color: var(--clr-neutral-700);
      }
      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-900);
        margin: 0;
      }
      .section {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        margin-bottom: var(--sp-4);
        box-shadow: var(--shadow-sm);
      }
      .section-title {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 var(--sp-4) 0;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: var(--sp-3);
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .form-field.full {
        grid-column: 1 / -1;
      }
      label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-600);
      }
      input[type='text'],
      input[type='number'],
      input[type='date'],
      select {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-900);
        background: var(--bg-surface);
        transition: var(--transition-fast);
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      input:focus,
      select:focus {
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      input[readonly] {
        background: var(--bg-muted);
        color: var(--clr-neutral-500);
      }
      .drug-rows-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: var(--sp-2);
        padding: 0 0 var(--sp-2) 0;
        border-bottom: 1px solid var(--border-default);
        margin-bottom: var(--sp-2);
      }
      .drug-rows-header span {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .drug-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: var(--sp-2);
        align-items: start;
        margin-bottom: var(--sp-3);
        position: relative;
      }
      .drug-search-wrap {
        position: relative;
      }
      .drug-results {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        z-index: 100;
        max-height: 200px;
        overflow-y: auto;
      }
      .drug-result-item {
        padding: var(--sp-2) var(--sp-3);
        cursor: pointer;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-800);
        transition: var(--transition-fast);
      }
      .drug-result-item:hover {
        background: var(--bg-muted);
      }
      .drug-result-name {
        font-weight: var(--fw-medium);
      }
      .drug-result-sub {
        font-size: var(--text-xs);
        color: var(--clr-neutral-400);
      }
      .remove-row-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 36px;
        border: 1px solid var(--clr-danger-200);
        border-radius: var(--radius-md);
        background: transparent;
        color: var(--clr-danger-500);
        cursor: pointer;
        font-size: 1.1rem;
        transition: var(--transition-fast);
        flex-shrink: 0;
      }
      .remove-row-btn:hover {
        background: var(--clr-danger-50);
      }
      .remove-row-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .add-row-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1);
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        cursor: pointer;
        border: 1px dashed var(--border-strong);
        background: transparent;
        color: var(--clr-neutral-500);
        transition: var(--transition-fast);
        margin-top: var(--sp-2);
      }
      .add-row-btn:hover {
        background: var(--bg-muted);
        color: var(--clr-neutral-700);
      }
      .summary-grid {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
        align-items: flex-end;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        width: 260px;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-600);
      }
      .summary-row.total {
        font-family: var(--font-label);
        font-weight: var(--fw-bold);
        font-size: var(--text-base);
        color: var(--clr-neutral-900);
        border-top: 2px solid var(--border-default);
        padding-top: var(--sp-2);
      }
      .payment-section {
        display: flex;
        gap: var(--sp-5);
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .checkbox-field {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding-bottom: var(--sp-2);
      }
      .checkbox-field input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      .checkbox-field label {
        font-size: var(--text-sm);
        color: var(--clr-neutral-700);
        cursor: pointer;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--sp-3);
        margin-top: var(--sp-2);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        padding: var(--sp-2) var(--sp-5);
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
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-secondary {
        background: var(--bg-surface);
        color: var(--clr-neutral-700);
        border: 1px solid var(--border-default);
      }
      .btn-secondary:hover {
        background: var(--bg-muted);
      }
      .running-total {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        color: var(--clr-neutral-600);
        background: var(--bg-muted);
        border-radius: var(--radius-md);
        padding: var(--sp-2) var(--sp-3);
        margin-top: var(--sp-3);
      }
      .running-total strong {
        color: var(--clr-neutral-900);
        font-size: var(--text-base);
      }
      .error-msg {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
        margin-top: var(--sp-2);
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">&#8592; Back</button>
        <h1 class="page-title">New Sale</h1>
      </div>

      <form [formGroup]="saleForm" (ngSubmit)="submitSale()">
        <!-- Patient Info -->
        <div class="section">
          <p class="section-title">Patient Info</p>
          <div class="form-grid">
            <div class="form-field">
              <label>Patient Name</label>
              <input type="text" formControlName="patientName" placeholder="Enter patient name" />
            </div>
            <div class="form-field">
              <label>Patient ID</label>
              <input type="text" formControlName="patientId" placeholder="Optional" />
            </div>
            <div class="form-field">
              <label>Prescription Ref</label>
              <input type="text" formControlName="prescriptionRef" placeholder="Rx / OPD ref" />
            </div>
          </div>
        </div>

        <!-- Drug Rows -->
        <div class="section">
          <p class="section-title">Drug Items</p>

          <div class="drug-rows-header">
            <span>Drug</span>
            <span>Qty</span>
            <span>MRP</span>
            <span>Sale Rate</span>
            <span></span>
          </div>

          <div formArrayName="items">
            @for (row of itemControls; track $index) {
              <div class="drug-row" [formGroupName]="$index">
                <!-- Drug search -->
                <div class="drug-search-wrap">
                  <input
                    type="text"
                    formControlName="drugSearch"
                    placeholder="Search drug..."
                    (input)="onDrugSearch($index, $event)"
                    (blur)="closeDrugResults($index)"
                  />
                  @if (drugSearchResults[$index]?.length) {
                    <div class="drug-results">
                      @for (drug of drugSearchResults[$index]; track drug.id) {
                        <div class="drug-result-item" (mousedown)="selectDrug($index, drug)">
                          <div class="drug-result-name">{{ drug.genericName }}</div>
                          @if (drug.brandName) {
                            <div class="drug-result-sub">
                              {{ drug.brandName }} · ₹{{ drug.saleRate }}
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Qty -->
                <input
                  type="number"
                  formControlName="quantity"
                  min="1"
                  placeholder="1"
                  (input)="recalc()"
                />

                <!-- MRP (auto-filled, readonly) -->
                <input type="number" formControlName="mrp" readonly placeholder="—" />

                <!-- Sale Rate (auto-filled, readonly) -->
                <input type="number" formControlName="saleRate" readonly placeholder="—" />

                <!-- Remove row -->
                <button
                  type="button"
                  class="remove-row-btn"
                  (click)="removeRow($index)"
                  [disabled]="itemControls.length === 1"
                  title="Remove row"
                >
                  &#215;
                </button>
              </div>
            }
          </div>

          <button type="button" class="add-row-btn" (click)="addRow()">+ Add Item</button>

          <div class="running-total">
            Running Total: <strong>₹{{ runningTotal() | number: '1.2-2' }}</strong>
          </div>
        </div>

        <!-- Payment -->
        <div class="section">
          <p class="section-title">Payment</p>
          <div class="payment-section">
            <div class="form-field">
              <label>Payment Mode</label>
              <select formControlName="paymentMode" style="min-width:160px">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div class="checkbox-field">
              <input type="checkbox" id="isPaid" formControlName="isPaid" />
              <label for="isPaid">Mark as Paid</label>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="section">
          <p class="section-title">Summary</p>
          <div class="summary-grid">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ subtotal() | number: '1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Discount</span>
              <span style="display:flex;align-items:center;gap:var(--sp-2)">
                ₹
                <input
                  type="number"
                  formControlName="discount"
                  min="0"
                  placeholder="0"
                  style="width:80px;text-align:right"
                  (input)="recalc()"
                />
              </span>
            </div>
            <div class="summary-row">
              <span>GST</span>
              <span>₹{{ gstTotal() | number: '1.2-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₹{{ grandTotal() | number: '1.2-2' }}</span>
            </div>
          </div>
        </div>

        @if (errorMsg()) {
          <p class="error-msg">{{ errorMsg() }}</p>
        }

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Saving...' : 'Create Sale' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class PharmacySaleFormPage implements OnInit {
  private api = inject(PharmacyApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal<string | null>(null);

  drugSearchResults: DrugResult[][] = [];
  private searchTimers: ReturnType<typeof setTimeout>[] = [];

  subtotal = signal(0);
  gstTotal = signal(0);
  grandTotal = signal(0);
  runningTotal = signal(0);

  saleForm: FormGroup = this.fb.group({
    patientName: [''],
    patientId: [''],
    prescriptionRef: [''],
    items: this.fb.array([this.makeItemRow()]),
    paymentMode: ['CASH', Validators.required],
    isPaid: [false],
    discount: [0],
  });

  get itemsArray(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  get itemControls(): FormGroup[] {
    return this.itemsArray.controls as FormGroup[];
  }

  ngOnInit(): void {
    this.drugSearchResults = [[]];
    this.recalc();
  }

  makeItemRow(): FormGroup {
    return this.fb.group({
      drugId: [null],
      drugSearch: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      mrp: [{ value: null, disabled: false }],
      saleRate: [{ value: null, disabled: false }],
      gstPercent: [0],
    });
  }

  addRow(): void {
    this.itemsArray.push(this.makeItemRow());
    this.drugSearchResults.push([]);
    this.searchTimers.push(undefined as any);
    this.recalc();
  }

  removeRow(index: number): void {
    if (this.itemsArray.length === 1) return;
    this.itemsArray.removeAt(index);
    this.drugSearchResults.splice(index, 1);
    this.searchTimers.splice(index, 1);
    this.recalc();
  }

  onDrugSearch(index: number, event: Event): void {
    const q = (event.target as HTMLInputElement).value.trim();
    clearTimeout(this.searchTimers[index]);
    if (q.length < 2) {
      this.drugSearchResults[index] = [];
      return;
    }
    this.searchTimers[index] = setTimeout(() => {
      this.api.listDrugs({ search: q, limit: 8 }).subscribe({
        next: (res) => {
          this.drugSearchResults[index] = res.data ?? res;
        },
      });
    }, 300);
  }

  closeDrugResults(index: number): void {
    setTimeout(() => {
      this.drugSearchResults[index] = [];
    }, 200);
  }

  selectDrug(index: number, drug: DrugResult): void {
    const row = this.itemControls[index];
    row.patchValue({
      drugId: drug.id,
      drugSearch: `${drug.genericName}${drug.brandName ? ' (' + drug.brandName + ')' : ''}`,
      mrp: drug.mrp,
      saleRate: drug.saleRate,
    });
    this.drugSearchResults[index] = [];
    this.recalc();
  }

  recalc(): void {
    let sub = 0;
    let gst = 0;
    for (const row of this.itemControls) {
      const qty = Number(row.get('quantity')?.value) || 0;
      const rate = Number(row.get('saleRate')?.value) || 0;
      const gstPct = Number(row.get('gstPercent')?.value) || 0;
      const lineTotal = qty * rate;
      sub += lineTotal;
      gst += lineTotal * (gstPct / 100);
    }
    const disc = Number(this.saleForm.get('discount')?.value) || 0;
    const total = sub + gst - disc;
    this.subtotal.set(sub);
    this.gstTotal.set(gst);
    this.grandTotal.set(Math.max(0, total));
    this.runningTotal.set(sub);
  }

  submitSale(): void {
    if (this.saleForm.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);

    const formVal = this.saleForm.getRawValue();
    const items = formVal.items
      .filter((i: any) => i.drugId)
      .map((i: any) => ({
        drugId: i.drugId,
        quantity: i.quantity,
        mrp: i.mrp,
        saleRate: i.saleRate,
        gstPercent: i.gstPercent,
      }));

    const payload = {
      patientId: formVal.patientId || undefined,
      patientName: formVal.patientName || undefined,
      prescriptionRef: formVal.prescriptionRef || undefined,
      items,
      paymentMode: formVal.paymentMode,
      isPaid: formVal.isPaid,
      discount: Number(formVal.discount) || 0,
      subtotal: this.subtotal(),
      gstTotal: this.gstTotal(),
      totalAmount: this.grandTotal(),
    };

    this.api.createSale(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/pharmacy']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Failed to create sale. Please try again.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/pharmacy']);
  }
}
