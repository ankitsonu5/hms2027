import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';
import { OrganizationApiService } from '../../core/services/organization-api.service';
import { PatientPickerComponent } from '../../shared/components/patient-picker.component';

@Component({
  selector: 'hms-lab-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, PatientPickerComponent],
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
        background: transparent;
        border: none;
        color: var(--clr-primary-600);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        cursor: pointer;
        padding: var(--sp-1) var(--sp-2);
        border-radius: var(--radius-md);
      }
      .back-btn:hover {
        background: var(--clr-primary-50);
      }
      .page-title {
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: var(--text-2xl);
        color: var(--clr-neutral-900);
        margin: 0;
      }
      .section-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: var(--sp-6);
        margin-bottom: var(--sp-5);
      }
      .section-title {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-700);
        margin: 0 0 var(--sp-4);
        padding-bottom: var(--sp-3);
        border-bottom: 1px solid var(--border-default);
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: var(--sp-4);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .form-group.span-2 {
        grid-column: span 2;
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
      .error-text {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
      }

      /* Test selection table */
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
      tr.selected td {
        background: var(--clr-primary-50);
      }
      tr:hover td {
        background: var(--bg-muted);
      }
      tr.selected:hover td {
        background: var(--clr-primary-100);
      }

      input[type='checkbox'] {
        width: 16px;
        height: 16px;
        accent-color: var(--clr-primary-600);
        cursor: pointer;
      }

      /* Selected tests summary */
      .summary-box {
        background: var(--bg-muted);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-4);
        margin-top: var(--sp-4);
      }
      .summary-title {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-600);
        margin: 0 0 var(--sp-3);
      }
      .summary-chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2);
        margin-bottom: var(--sp-3);
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1);
        padding: var(--sp-1) var(--sp-2);
        background: var(--clr-primary-100);
        color: var(--clr-primary-700);
        border-radius: var(--radius-full);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
      }
      .chip-remove {
        background: none;
        border: none;
        color: var(--clr-primary-500);
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        padding: 0;
      }
      .chip-remove:hover {
        color: var(--clr-danger-600);
      }
      .total-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: var(--sp-2);
      }
      .total-label {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-600);
      }
      .total-amount {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: var(--fw-bold);
        color: var(--clr-primary-700);
      }

      /* Checkbox row */
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        margin-bottom: var(--sp-3);
      }
      .checkbox-label {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-700);
      }

      /* Search Dropdown */
      .search-container {
        position: relative;
        margin-bottom: var(--sp-4);
      }
      .search-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 100;
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        max-height: 250px;
        overflow-y: auto;
      }
      .dropdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: var(--sp-3);
        border: none;
        background: none;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        cursor: pointer;
        border-bottom: 1px solid var(--border-default);
      }
      .dropdown-item:hover {
        background: var(--clr-primary-50);
      }
      .dropdown-item:last-child {
        border-bottom: none;
      }

      /* Form actions */
      .form-actions {
        display: flex;
        gap: var(--sp-3);
        justify-content: flex-end;
        margin-top: var(--sp-6);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-5);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        border: none;
        cursor: pointer;
        transition: var(--transition-base);
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
        color: var(--clr-neutral-700);
        border: 1px solid var(--border-default);
      }
      .btn-secondary:hover:not(:disabled) {
        background: var(--bg-muted);
      }

      /* Loading */
      .loading-text {
        text-align: center;
        padding: var(--sp-8);
        color: var(--clr-neutral-400);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
      .empty-tests {
        text-align: center;
        padding: var(--sp-6);
        color: var(--clr-neutral-400);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1 class="page-title">{{ isEdit() ? 'Edit Lab Order' : 'New Test' }}</h1>
      </div>

      <!-- Section 1: Patient & Doctor Info -->
      <div class="section-card">
        <p class="section-title">Patient & Referral</p>
        <form [formGroup]="orderForm">
          <div class="form-grid">
            <div class="form-group span-2">
              <label class="form-label">Patient *</label>
              <hms-patient-picker formControlName="patientId" [invalid]="isInvalid('patientId')" />
              @if (isInvalid('patientId')) {
                <span class="error-text">Select a patient to continue.</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Doctor ID</label>
              <input
                class="form-control"
                formControlName="orderedByDoctorId"
                placeholder="e.g. DOC-001"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Doctor Name</label>
              <input
                class="form-control"
                formControlName="orderedByDoctorName"
                placeholder="e.g. Dr. Sharma"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Encounter ID</label>
              <input class="form-control" formControlName="encounterId" placeholder="Optional" />
            </div>
            <div class="form-group span-2">
              <label class="form-label">Referral Partner / Organization</label>
              <select class="form-control" formControlName="organizationId" (change)="onOrganizationChange()">
                <option [value]="null">None (Retail Patient)</option>
                @for (org of organizations(); track org.id) {
                  <option [value]="org.id">{{ org.name }}</option>
                }
              </select>
            </div>
          </div>
        </form>
      </div>

      <!-- Section 2: Test Selection -->
      <div class="section-card">
        <p class="section-title">Select Tests</p>

        @if (testsLoading()) {
          <div class="loading-text">Loading available tests…</div>
        } @else if (availableTests().length === 0) {
          <div class="empty-tests">No tests available. Add tests in Test Master first.</div>
        } @else {
          <div class="search-container">
            <input
              type="text"
              class="form-control"
              placeholder="Search tests by name, code, or test ID..."
              [ngModel]="testSearchTerm()"
              (ngModelChange)="testSearchTerm.set($event)"
              [ngModelOptions]="{ standalone: true }"
            />
            @if (filteredTests().length > 0) {
              <div class="search-dropdown">
                @for (test of filteredTests(); track test.id) {
                  <button type="button" class="dropdown-item" (click)="addTest(test)">
                    <span>
                      <strong>{{ test.name }}</strong>
                      <span style="color:var(--clr-neutral-500); margin-left:8px;">ID: {{ test.numericId || '—' }} | {{ test.code || 'No Code' }}</span>
                    </span>
                    <span style="font-weight:var(--fw-semibold); color:var(--clr-primary-700)">₹{{ getPriceForTest(test) }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Selected tests summary -->
          <div class="summary-box">
            <p class="summary-title">Selected Tests ({{ selectedTests().length }})</p>
            @if (selectedTests().length === 0) {
              <p
                style="font-family:var(--font-body);font-size:var(--text-sm);color:var(--clr-neutral-400);margin:0 0 var(--sp-3)"
              >
                No tests selected yet. Search and select tests above.
              </p>
            } @else {
              <div class="table-wrap" style="margin-bottom:var(--sp-4);">
                <table>
                  <thead>
                    <tr>
                      <th>Test ID</th>
                      <th>Test Name</th>
                      <th>Code</th>
                      <th>Price</th>
                      <th style="width:40px; text-align:right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of selectedTests(); track t.id) {
                      <tr>
                        <td>{{ t.numericId || '—' }}</td>
                        <td>{{ t.name }}</td>
                        <td>{{ t.code }}</td>
                        <td>₹{{ getPriceForTest(t) }}</td>
                        <td style="text-align:right">
                          <button type="button" class="chip-remove" (click)="removeTest(t.id)" title="Remove" style="font-size:18px;">×</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-top:var(--sp-4);">
              <div class="concession-box" style="display:flex; gap:var(--sp-4); align-items:flex-end;">
                <div class="form-group">
                  <label class="form-label">General Concession (%)</label>
                  <input
                    type="number"
                    class="form-control"
                    style="width: 100px;"
                    [ngModel]="concessionPercentage()"
                    (ngModelChange)="concessionPercentage.set($event || 0)"
                    [ngModelOptions]="{ standalone: true }"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Reason for Concession</label>
                  <input
                    type="text"
                    class="form-control"
                    style="width: 250px;"
                    placeholder="e.g. Staff Discount"
                    [ngModel]="concessionReason()"
                    (ngModelChange)="concessionReason.set($event)"
                    [ngModelOptions]="{ standalone: true }"
                  />
                </div>
              </div>

              <div class="totals-block" style="text-align:right;">
                <div class="total-row" style="margin-bottom:var(--sp-1);">
                  <span class="total-label">Subtotal:</span>
                  <span class="total-amount" style="font-size:var(--text-lg); color:var(--clr-neutral-800)">₹{{ subtotal().toFixed(2) }}</span>
                </div>
                @if (concessionAmount() > 0) {
                  <div class="total-row" style="margin-bottom:var(--sp-1); color:var(--clr-danger-600);">
                    <span class="total-label" style="color:var(--clr-danger-600);">Discount ({{ concessionPercentage() }}%):</span>
                    <span class="total-amount" style="font-size:var(--text-lg); color:var(--clr-danger-600)">- ₹{{ concessionAmount().toFixed(2) }}</span>
                  </div>
                }
                <div class="total-row" style="border-top:1px solid var(--border-default); padding-top:var(--sp-2); margin-top:var(--sp-2);">
                  <span class="total-label">Total Amount:</span>
                  <span class="total-amount">₹{{ totalAmount().toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Section 3: Sample Collection (edit mode only) -->
      @if (isEdit()) {
        <div class="section-card">
          <p class="section-title">Sample Collection</p>
          <form [formGroup]="sampleForm">
            <div class="checkbox-row">
              <input type="checkbox" id="sampleCollected" formControlName="sampleCollected" />
              <label class="checkbox-label" for="sampleCollected">Sample Collected</label>
            </div>
            @if (sampleForm.get('sampleCollected')?.value) {
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Sample Barcode</label>
                  <input
                    class="form-control"
                    formControlName="sampleBarcode"
                    placeholder="e.g. BAR-20260628-001"
                  />
                </div>
              </div>
            }
          </form>
        </div>
      }

      <!-- Form Actions -->
      <div class="form-actions">
        <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
        <button class="btn btn-primary" [disabled]="submitting()" (click)="submit()">
          {{ submitting() ? 'Saving…' : isEdit() ? 'Update Order' : 'Create Order' }}
        </button>
      </div>
    </div>
  `,
})
export class LabOrderFormPage implements OnInit {
  private labApi = inject(LabApiService);
  private orgApi = inject(OrganizationApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isEdit = signal(false);
  orderId = signal<string | null>(null);

  organizations = signal<any[]>([]);
  orgRates = signal<Map<string, number>>(new Map());

  availableTests = signal<any[]>([]);
  testsLoading = signal(false);

  testSearchTerm = signal('');
  filteredTests = computed(() => {
    const term = this.testSearchTerm().toLowerCase().trim();
    if (!term) return [];
    return this.availableTests()
      .filter(t => 
        t.name.toLowerCase().includes(term) || 
        (t.code && t.code.toLowerCase().includes(term)) ||
        (t.numericId && t.numericId.toString().includes(term))
      )
      .slice(0, 10);
  });

  selectedTests = signal<any[]>([]);
  
  concessionPercentage = signal(0);
  concessionReason = signal('');

  subtotal = computed(() => this.selectedTests().reduce((sum, t) => sum + this.getPriceForTest(t), 0));
  concessionAmount = computed(() => (this.subtotal() * (this.concessionPercentage() || 0)) / 100);
  totalAmount = computed(() => this.subtotal() - this.concessionAmount());

  submitting = signal(false);

  orderForm: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    orderedByDoctorId: [''],
    orderedByDoctorName: [''],
    encounterId: [''],
    organizationId: [null],
  });

  sampleForm: FormGroup = this.fb.group({
    sampleCollected: [false],
    sampleBarcode: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.orderId.set(id);
      this.loadOrder(id);
    } else {
      // Handed off from a consultation / patient list — patient is already known.
      const patientId = this.route.snapshot.queryParamMap.get('patientId');
      if (patientId) {
        this.orderForm.patchValue({ patientId });
      }
    }
    this.loadOrganizations();
    this.loadTests();
  }

  loadOrganizations(): void {
    this.orgApi.list().subscribe(res => {
      this.organizations.set(res || []);
    });
  }

  onOrganizationChange(): void {
    const orgId = this.orderForm.value.organizationId;
    if (!orgId || orgId === 'null') {
      this.orgRates.set(new Map());
      return;
    }
    this.orgApi.getRates(orgId).subscribe(rates => {
      const map = new Map<string, number>();
      (rates || []).forEach((r: any) => {
        map.set(r.testId, Number(r.customPrice));
      });
      this.orgRates.set(map);
    });
  }

  getPriceForTest(test: any): number {
    const rates = this.orgRates();
    if (rates.has(test.id)) {
      return rates.get(test.id)!;
    }
    return Number(test.price ?? 0);
  }

  loadTests(): void {
    this.testsLoading.set(true);
    this.labApi.listTests({ limit: 1500 }).subscribe({
      next: (res) => {
        this.availableTests.set(res.data ?? []);
        this.testsLoading.set(false);
      },
      error: () => {
        this.availableTests.set([]);
        this.testsLoading.set(false);
      },
    });
  }

  loadOrder(id: string): void {
    this.labApi.getOrder(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          patientId: order.patientId,
          orderedByDoctorId: order.orderedByDoctorId,
          orderedByDoctorName: order.orderedByDoctorName,
          encounterId: order.encounterId,
        });
        this.sampleForm.patchValue({
          sampleCollected: order.sampleCollected,
          sampleBarcode: order.sampleBarcode,
        });
        if (order.tests?.length) {
          this.selectedTests.set(order.tests);
        }
      },
    });
  }

  isSelected(testId: string): boolean {
    return this.selectedTests().some((t) => t.id === testId);
  }

  addTest(test: any): void {
    if (!this.isSelected(test.id)) {
      this.selectedTests.update((list) => [...list, test]);
    }
    this.testSearchTerm.set('');
  }

  toggleTest(test: any): void {
    if (this.isSelected(test.id)) {
      this.selectedTests.update((list) => list.filter((t) => t.id !== test.id));
    } else {
      this.selectedTests.update((list) => [...list, test]);
    }
  }

  removeTest(testId: string): void {
    this.selectedTests.update((list) => list.filter((t) => t.id !== testId));
  }

  isInvalid(field: string): boolean {
    const ctrl = this.orderForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  submit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      alert('Please select a Patient before creating the order.');
      window.scrollTo(0, 0);
      return;
    }
    
    if (this.selectedTests().length === 0) {
      alert('Please select at least one test.');
      return;
    }
    
    this.submitting.set(true);

    const payload = {
      ...this.orderForm.value,
      orderedByDoctorId: this.orderForm.value.orderedByDoctorId || 'WALK-IN',
      orderedByDoctorName: this.orderForm.value.orderedByDoctorName || 'Self / Walk-in',
      organizationId: this.orderForm.value.organizationId || null,
      concessionPercentage: this.concessionPercentage(),
      concessionReason: this.concessionReason(),
      tests: this.selectedTests().map((t) => ({
        testId: t.id,
        testName: t.name || t.testName,
        price: this.getPriceForTest(t),
      })),
      paymentMethod: (this.orderForm.value.organizationId && this.orderForm.value.organizationId !== 'null') ? 'CREDIT' : 'CASH',
      totalAmount: this.totalAmount(),
      ...(this.isEdit() ? this.sampleForm.value : {}),
    };

    const req = this.isEdit()
      ? this.labApi.updateOrder(this.orderId()!, payload)
      : this.labApi.createOrder(payload);

    req.subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        if (res && res.id) {
          this.router.navigate(['/laboratory/receipt', res.id]);
        } else {
          this.router.navigate(['/laboratory']);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        alert('Failed to create order. Error: ' + (err?.error?.message || err.message || 'Unknown error'));
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/laboratory']);
  }
}
