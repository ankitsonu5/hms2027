import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';

type TabId = 'sales' | 'drugs' | 'batches';

type Schedule = 'GENERAL' | 'SCHEDULE_H' | 'SCHEDULE_H1' | 'SCHEDULE_X' | 'NARCOTIC';

@Component({
  selector: 'hms-pharmacy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
        margin-bottom: var(--sp-5);
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
        color: var(--clr-neutral-500);
        border: 1px solid var(--border-default);
      }
      .btn-ghost:hover {
        background: var(--bg-muted);
        color: var(--clr-neutral-700);
      }
      .btn-danger-ghost {
        background: transparent;
        color: var(--clr-danger-600);
        border: 1px solid var(--clr-danger-200);
      }
      .btn-danger-ghost:hover {
        background: var(--clr-danger-50);
      }
      .tabs {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--border-default);
        margin-bottom: var(--sp-5);
      }
      .tab-btn {
        padding: var(--sp-2) var(--sp-5);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-500);
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .tab-btn:hover {
        color: var(--clr-primary-600);
      }
      .tab-btn.active {
        color: var(--clr-primary-600);
        border-bottom-color: var(--clr-primary-600);
      }
      .tab-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-4);
      }
      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
      th {
        background: var(--bg-muted);
        padding: var(--sp-3) var(--sp-4);
        text-align: left;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border-default);
      }
      td {
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--border-default);
        color: var(--clr-neutral-800);
        vertical-align: middle;
      }
      tr:last-child td {
        border-bottom: none;
      }
      tr:hover td {
        background: var(--bg-muted);
      }
      .badge {
        display: inline-block;
        padding: 2px var(--sp-2);
        border-radius: var(--radius-sm);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
      }
      .badge-neutral {
        background: var(--clr-neutral-100);
        color: var(--clr-neutral-600);
      }
      .badge-warning {
        background: var(--clr-warning-100);
        color: var(--clr-warning-700);
      }
      .badge-danger {
        background: var(--clr-danger-100);
        color: var(--clr-danger-700);
      }
      .inline-form-wrap {
        background: var(--bg-muted);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        margin-bottom: var(--sp-4);
      }
      .form-title {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-700);
        margin: 0 0 var(--sp-4) 0;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-600);
      }
      input,
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
      }
      input:focus,
      select:focus {
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      .form-actions {
        display: flex;
        gap: var(--sp-2);
        justify-content: flex-end;
      }
      .empty-state {
        text-align: center;
        padding: var(--sp-10) var(--sp-4);
        color: var(--clr-neutral-400);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
      .drug-selector-wrap {
        margin-bottom: var(--sp-4);
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }
      .drug-selector-wrap label {
        white-space: nowrap;
        font-size: var(--text-sm);
      }
      .drug-selector-wrap select {
        min-width: 280px;
      }
      .row-expiring td {
        color: var(--clr-danger-700) !important;
        background: var(--clr-danger-50) !important;
      }
      .loading-row td {
        text-align: center;
        color: var(--clr-neutral-400);
        padding: var(--sp-6);
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Pharmacy</h1>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'sales'"
          (click)="activeTab.set('sales')"
        >
          Sales
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'drugs'"
          (click)="activeTab.set('drugs')"
        >
          Drug Master
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'batches'"
          (click)="activeTab.set('batches')"
        >
          Stock / Batches
        </button>
      </div>

      <!-- SALES TAB -->
      @if (activeTab() === 'sales') {
        <div>
          <div class="tab-header">
            <span></span>
            <button class="btn btn-primary" (click)="goNewSale()">+ New Sale</button>
          </div>
          <div class="card">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment Mode</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (salesLoading()) {
                  <tr class="loading-row">
                    <td colspan="6">Loading sales...</td>
                  </tr>
                } @else if (sales().length === 0) {
                  <tr>
                    <td colspan="6">
                      <div class="empty-state">
                        No sales recorded yet. Click "New Sale" to start.
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (sale of sales(); track sale.id) {
                    <tr>
                      <td>{{ sale.patientName || sale.patientId || '—' }}</td>
                      <td>{{ sale.items?.length ?? sale.itemCount ?? '—' }}</td>
                      <td>₹{{ sale.totalAmount | number: '1.2-2' }}</td>
                      <td>{{ sale.paymentMode }}</td>
                      <td>{{ sale.createdAt | date: 'dd MMM yyyy' }}</td>
                      <td>
                        <button
                          class="btn btn-ghost"
                          style="font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);"
                        >
                          View
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

      <!-- DRUG MASTER TAB -->
      @if (activeTab() === 'drugs') {
        <div>
          <div class="tab-header">
            <span></span>
            <button class="btn btn-primary" (click)="startNewDrug()">
              {{ showDrugForm() && !editingDrugId() ? 'Cancel' : '+ Add Drug' }}
            </button>
          </div>

          @if (showDrugForm()) {
            <div class="inline-form-wrap">
              <p class="form-title">{{ editingDrugId() ? 'Edit Drug' : 'New Drug' }}</p>
              <form [formGroup]="drugForm" (ngSubmit)="submitDrug()">
                <div class="form-grid">
                  <div class="form-field">
                    <label>Generic Name *</label>
                    <input formControlName="genericName" placeholder="e.g. Paracetamol" />
                  </div>
                  <div class="form-field">
                    <label>Brand Name</label>
                    <input formControlName="brandName" placeholder="e.g. Calpol" />
                  </div>
                  <div class="form-field">
                    <label>Dosage Form *</label>
                    <select formControlName="dosageForm">
                      <option value="">Select form</option>
                      <option value="TABLET">Tablet</option>
                      <option value="CAPSULE">Capsule</option>
                      <option value="SYRUP">Syrup</option>
                      <option value="INJECTION">Injection</option>
                      <option value="CREAM">Cream</option>
                      <option value="DROPS">Drops</option>
                      <option value="INHALER">Inhaler</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Strength</label>
                    <input formControlName="strength" placeholder="e.g. 500mg" />
                  </div>
                  <div class="form-field">
                    <label>Schedule *</label>
                    <select formControlName="schedule">
                      <option value="GENERAL">General</option>
                      <option value="SCHEDULE_H">Schedule H</option>
                      <option value="SCHEDULE_H1">Schedule H1</option>
                      <option value="SCHEDULE_X">Schedule X</option>
                      <option value="NARCOTIC">Narcotic</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>MRP (₹) *</label>
                    <input
                      formControlName="mrp"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="form-field">
                    <label>Purchase Rate (₹)</label>
                    <input
                      formControlName="purchaseRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="form-field">
                    <label>Sale Rate (₹) *</label>
                    <input
                      formControlName="saleRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="form-field">
                    <label>GST %</label>
                    <input
                      formControlName="gstPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="startNewDrug()">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="drugForm.invalid || drugSaving()"
                  >
                    {{ drugSaving() ? 'Saving...' : 'Save Drug' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <div class="card">
            <table>
              <thead>
                <tr>
                  <th>Generic Name</th>
                  <th>Brand</th>
                  <th>Form</th>
                  <th>Schedule</th>
                  <th>MRP</th>
                  <th>Sale Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (drugsLoading()) {
                  <tr class="loading-row">
                    <td colspan="7">Loading drugs...</td>
                  </tr>
                } @else if (drugs().length === 0) {
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">No drugs in master. Click "Add Drug" to begin.</div>
                    </td>
                  </tr>
                } @else {
                  @for (drug of drugs(); track drug.id) {
                    <tr>
                      <td>{{ drug.genericName }}</td>
                      <td>{{ drug.brandName || '—' }}</td>
                      <td>{{ drug.dosageForm }}</td>
                      <td>
                        <span class="badge" [ngClass]="scheduleBadge(drug.schedule)">{{
                          scheduleLabel(drug.schedule)
                        }}</span>
                      </td>
                      <td>₹{{ drug.mrp | number: '1.2-2' }}</td>
                      <td>₹{{ drug.saleRate | number: '1.2-2' }}</td>
                      <td>
                        <button
                          class="btn btn-ghost"
                          style="font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);"
                          (click)="startEditDrug(drug)"
                        >
                          Edit
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

      <!-- BATCHES TAB -->
      @if (activeTab() === 'batches') {
        <div>
          <div class="drug-selector-wrap">
            <label>Select Drug:</label>
            <select (change)="onDrugSelect($event)">
              <option value="">— choose a drug —</option>
              @for (drug of drugs(); track drug.id) {
                <option [value]="drug.id">
                  {{ drug.genericName }}{{ drug.brandName ? ' (' + drug.brandName + ')' : '' }}
                </option>
              }
            </select>
          </div>

          @if (selectedDrugId()) {
            <div class="tab-header">
              <span></span>
              <button class="btn btn-primary" (click)="toggleBatchForm()">
                {{ showBatchForm() ? 'Cancel' : '+ Add Batch' }}
              </button>
            </div>

            @if (showBatchForm()) {
              <div class="inline-form-wrap">
                <p class="form-title">New Batch</p>
                <form [formGroup]="batchForm" (ngSubmit)="submitBatch()">
                  <div class="form-grid">
                    <div class="form-field">
                      <label>Batch Number *</label>
                      <input formControlName="batchNumber" placeholder="e.g. BT-2024-001" />
                    </div>
                    <div class="form-field">
                      <label>Expiry Date *</label>
                      <input formControlName="expiryDate" type="date" />
                    </div>
                    <div class="form-field">
                      <label>Quantity *</label>
                      <input formControlName="quantity" type="number" min="0" placeholder="0" />
                    </div>
                    <div class="form-field">
                      <label>Free Quantity</label>
                      <input formControlName="freeQuantity" type="number" min="0" placeholder="0" />
                    </div>
                    <div class="form-field">
                      <label>Purchase Rate (₹) *</label>
                      <input
                        formControlName="purchaseRate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div class="form-field">
                      <label>MRP (₹) *</label>
                      <input
                        formControlName="mrp"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div class="form-field">
                      <label>GST %</label>
                      <input
                        formControlName="gstPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                      />
                    </div>
                    <div class="form-field">
                      <label>GRN No</label>
                      <input formControlName="grnNo" placeholder="e.g. GRN-001" />
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-secondary" (click)="toggleBatchForm()">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="batchForm.invalid || batchSaving()"
                    >
                      {{ batchSaving() ? 'Saving...' : 'Save Batch' }}
                    </button>
                  </div>
                </form>
              </div>
            }

            <div class="card">
              <table>
                <thead>
                  <tr>
                    <th>Batch No</th>
                    <th>Expiry</th>
                    <th>Qty</th>
                    <th>MRP</th>
                    <th>Purchase Rate</th>
                    <th>GRN No</th>
                  </tr>
                </thead>
                <tbody>
                  @if (batchesLoading()) {
                    <tr class="loading-row">
                      <td colspan="6">Loading batches...</td>
                    </tr>
                  } @else if (batches().length === 0) {
                    <tr>
                      <td colspan="6">
                        <div class="empty-state">No batches found for this drug.</div>
                      </td>
                    </tr>
                  } @else {
                    @for (batch of batches(); track batch.id) {
                      <tr [class.row-expiring]="isExpiringSoon(batch.expiryDate)">
                        <td>{{ batch.batchNumber }}</td>
                        <td>{{ batch.expiryDate | date: 'MMM yyyy' }}</td>
                        <td>{{ batch.quantity }}</td>
                        <td>₹{{ batch.mrp | number: '1.2-2' }}</td>
                        <td>₹{{ batch.purchaseRate | number: '1.2-2' }}</td>
                        <td>{{ batch.grnNo || '—' }}</td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state" style="margin-top:var(--sp-6)">
              Select a drug above to view its stock batches.
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PharmacyPage implements OnInit {
  private api = inject(PharmacyApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab = signal<TabId>('sales');

  // Sales
  sales = signal<any[]>([]);
  salesLoading = signal(false);

  // Drugs
  drugs = signal<any[]>([]);
  drugsLoading = signal(false);
  showDrugForm = signal(false);
  drugSaving = signal(false);
  editingDrugId = signal<string | null>(null);

  // Batches
  batches = signal<any[]>([]);
  batchesLoading = signal(false);
  selectedDrugId = signal<string | null>(null);
  showBatchForm = signal(false);
  batchSaving = signal(false);

  drugForm: FormGroup = this.fb.group({
    genericName: ['', Validators.required],
    brandName: [''],
    dosageForm: ['', Validators.required],
    strength: [''],
    schedule: ['GENERAL', Validators.required],
    mrp: [null, [Validators.required, Validators.min(0)]],
    purchaseRate: [null],
    saleRate: [null, [Validators.required, Validators.min(0)]],
    gstPercent: [0],
  });

  batchForm: FormGroup = this.fb.group({
    batchNumber: ['', Validators.required],
    expiryDate: ['', Validators.required],
    quantity: [null, [Validators.required, Validators.min(0)]],
    freeQuantity: [0],
    purchaseRate: [null, [Validators.required, Validators.min(0)]],
    mrp: [null, [Validators.required, Validators.min(0)]],
    gstPercent: [0],
    grnNo: [''],
  });

  ngOnInit(): void {
    this.loadSales();
    this.loadDrugs();
  }

  loadSales(): void {
    this.salesLoading.set(true);
    this.api.listSales().subscribe({
      next: (res) => {
        this.sales.set(res.data ?? res);
        this.salesLoading.set(false);
      },
      error: () => this.salesLoading.set(false),
    });
  }

  loadDrugs(): void {
    this.drugsLoading.set(true);
    this.api.listDrugs().subscribe({
      next: (res) => {
        this.drugs.set(res.data ?? res);
        this.drugsLoading.set(false);
      },
      error: () => this.drugsLoading.set(false),
    });
  }

  goNewSale(): void {
    this.router.navigate(['/pharmacy/sale/new']);
  }

  startNewDrug(): void {
    this.editingDrugId.set(null);
    this.drugForm.reset({ schedule: 'GENERAL', gstPercent: 0 });
    this.showDrugForm.update((v) => !v);
  }

  startEditDrug(drug: any): void {
    this.editingDrugId.set(drug.id);
    this.drugForm.patchValue({
      genericName: drug.genericName,
      brandName: drug.brandName ?? '',
      dosageForm: drug.dosageForm,
      strength: drug.strength ?? '',
      schedule: drug.schedule,
      mrp: drug.mrp,
      purchaseRate: drug.purchaseRate ?? null,
      saleRate: drug.saleRate,
      gstPercent: drug.gstPercent ?? 0,
    });
    this.showDrugForm.set(true);
  }

  submitDrug(): void {
    if (this.drugForm.invalid) return;
    this.drugSaving.set(true);
    const id = this.editingDrugId();
    const call = id
      ? this.api.updateDrug(id, this.drugForm.value)
      : this.api.createDrug(this.drugForm.value);

    call.subscribe({
      next: (drug) => {
        if (id) {
          this.drugs.update((list) => list.map((d) => (d.id === id ? drug : d)));
        } else {
          this.drugs.update((list) => [drug, ...list]);
        }
        this.drugSaving.set(false);
        this.showDrugForm.set(false);
        this.editingDrugId.set(null);
        this.drugForm.reset({ schedule: 'GENERAL', gstPercent: 0 });
      },
      error: () => this.drugSaving.set(false),
    });
  }

  onDrugSelect(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedDrugId.set(id || null);
    this.showBatchForm.set(false);
    if (id) this.loadBatches(id);
    else this.batches.set([]);
  }

  loadBatches(drugId: string): void {
    this.batchesLoading.set(true);
    this.api.getBatches(drugId).subscribe({
      next: (res) => {
        this.batches.set(Array.isArray(res) ? res : (res.data ?? []));
        this.batchesLoading.set(false);
      },
      error: () => this.batchesLoading.set(false),
    });
  }

  toggleBatchForm(): void {
    this.showBatchForm.update((v) => !v);
    if (!this.showBatchForm()) this.batchForm.reset({ freeQuantity: 0, gstPercent: 0 });
  }

  submitBatch(): void {
    if (this.batchForm.invalid) return;
    const drugId = this.selectedDrugId();
    if (!drugId) return;
    this.batchSaving.set(true);
    const payload = { ...this.batchForm.value, drugId };
    this.api.addBatch(payload).subscribe({
      next: (batch) => {
        this.batches.update((b) => [batch, ...b]);
        this.batchSaving.set(false);
        this.showBatchForm.set(false);
        this.batchForm.reset({ freeQuantity: 0, gstPercent: 0 });
      },
      error: () => this.batchSaving.set(false),
    });
  }

  isExpiringSoon(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }

  scheduleBadge(schedule: Schedule): string {
    const map: Record<Schedule, string> = {
      GENERAL: 'badge-neutral',
      SCHEDULE_H: 'badge-warning',
      SCHEDULE_H1: 'badge-danger',
      SCHEDULE_X: 'badge-danger',
      NARCOTIC: 'badge-danger',
    };
    return map[schedule] ?? 'badge-neutral';
  }

  scheduleLabel(schedule: Schedule): string {
    const map: Record<Schedule, string> = {
      GENERAL: 'General',
      SCHEDULE_H: 'Sch H',
      SCHEDULE_H1: 'Sch H1',
      SCHEDULE_X: 'Sch X',
      NARCOTIC: 'Narcotic',
    };
    return map[schedule] ?? schedule;
  }
}
