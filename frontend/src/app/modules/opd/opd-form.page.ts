import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OpdApiService } from '../../core/services/opd-api.service';
import { PatientPickerComponent } from '../../shared/components/patient-picker.component';

@Component({
  selector: 'hms-opd-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PatientPickerComponent],
  template: `
    <div class="opd-form-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">{{ isEdit ? 'Edit Consultation' : 'New Consultation' }}</h1>
          <p class="page-subtitle">
            {{ isEdit ? 'Update OPD encounter details' : 'Register a new OPD encounter' }}
          </p>
        </div>
      </div>

      @if (loadingRecord()) {
        <div class="state-loading"><span class="spinner"></span> Loading record...</div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit('COMPLETED')" novalidate>
          <!-- Section 1: Patient & Doctor -->
          <div class="form-section">
            <div class="section-header">
              <span class="section-number">1</span>
              <div>
                <h2 class="section-title">Patient &amp; Doctor</h2>
                <p class="section-desc">Core identifiers for this consultation</p>
              </div>
            </div>
            <div class="form-grid form-grid--3">
              <div class="field field--span2">
                <label class="field-label">Patient <span class="required">*</span></label>
                <hms-patient-picker
                  formControlName="patientId"
                  [invalid]="isInvalid('patientId')"
                />
                @if (isInvalid('patientId')) {
                  <span class="field-error">Select a patient to continue</span>
                }
              </div>
              <div class="field">
                <label class="field-label">Doctor ID</label>
                <input
                  type="text"
                  formControlName="doctorId"
                  class="form-control"
                  placeholder="e.g. DOC-001"
                />
              </div>
              <div class="field">
                <label class="field-label">Doctor Name</label>
                <input
                  type="text"
                  formControlName="doctorName"
                  class="form-control"
                  placeholder="Dr. Full Name"
                />
              </div>
              <div class="field">
                <label class="field-label">Visit Date</label>
                <input type="date" formControlName="visitDate" class="form-control" />
              </div>
              <div class="field">
                <label class="field-label">Token Number</label>
                <input
                  type="text"
                  formControlName="tokenNumber"
                  class="form-control"
                  placeholder="e.g. 42"
                />
              </div>
            </div>
          </div>

          <!-- Section 2: Clinical Notes -->
          <div class="form-section">
            <div class="section-header">
              <span class="section-number">2</span>
              <div>
                <h2 class="section-title">Clinical Notes</h2>
                <p class="section-desc">Presenting complaints, history, and examination findings</p>
              </div>
            </div>
            <div class="form-grid form-grid--1">
              <div class="field">
                <label class="field-label">Chief Complaints</label>
                <textarea
                  formControlName="chiefComplaints"
                  class="form-control form-control--textarea"
                  rows="3"
                  placeholder="Patient's presenting complaints..."
                ></textarea>
              </div>
              <div class="field">
                <label class="field-label">History</label>
                <textarea
                  formControlName="history"
                  class="form-control form-control--textarea"
                  rows="3"
                  placeholder="Past medical, surgical, family, social history..."
                ></textarea>
              </div>
              <div class="field">
                <label class="field-label">Examination Findings</label>
                <textarea
                  formControlName="examination"
                  class="form-control form-control--textarea"
                  rows="3"
                  placeholder="General and systemic examination findings..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Section 3: Diagnosis -->
          <div class="form-section">
            <div class="section-header">
              <span class="section-number">3</span>
              <div>
                <h2 class="section-title">Diagnosis</h2>
                <p class="section-desc">Clinical diagnosis and ICD classification</p>
              </div>
            </div>
            <div class="form-grid form-grid--2">
              <div class="field field--span2">
                <label class="field-label">Diagnosis</label>
                <textarea
                  formControlName="diagnosis"
                  class="form-control form-control--textarea"
                  rows="3"
                  placeholder="Clinical diagnosis..."
                ></textarea>
              </div>
              <div class="field">
                <label class="field-label">ICD Code</label>
                <input
                  type="text"
                  formControlName="icdCode"
                  class="form-control"
                  placeholder="e.g. J06.9"
                />
              </div>
            </div>
          </div>

          <!-- Section 4: Prescription -->
          <div class="form-section">
            <div class="section-header">
              <span class="section-number">4</span>
              <div>
                <h2 class="section-title">Prescription</h2>
                <p class="section-desc">Medicines prescribed during this visit</p>
              </div>
            </div>

            <div class="dynamic-list" formArrayName="prescription">
              @if (prescription.length === 0) {
                <p class="empty-list">No medicines added yet.</p>
              }
              @for (row of prescription.controls; track $index) {
                <div class="dynamic-row" [formGroupName]="$index">
                  <div class="row-field row-field--grow">
                    <label class="field-label">Drug Name</label>
                    <input
                      type="text"
                      formControlName="drugName"
                      class="form-control"
                      placeholder="e.g. Amoxicillin 500mg"
                    />
                  </div>
                  <div class="row-field">
                    <label class="field-label">Dosage</label>
                    <input
                      type="text"
                      formControlName="dosage"
                      class="form-control"
                      placeholder="e.g. 1-0-1"
                    />
                  </div>
                  <div class="row-field">
                    <label class="field-label">Duration</label>
                    <input
                      type="text"
                      formControlName="duration"
                      class="form-control"
                      placeholder="e.g. 5 days"
                    />
                  </div>
                  <div class="row-field row-field--grow">
                    <label class="field-label">Instructions</label>
                    <input
                      type="text"
                      formControlName="instructions"
                      class="form-control"
                      placeholder="e.g. After meals"
                    />
                  </div>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removePrescriptionRow($index)"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              }
            </div>
            <button type="button" class="btn btn-outline btn-sm" (click)="addPrescriptionRow()">
              + Add Medicine
            </button>
          </div>

          <!-- Section 5: Lab Orders -->
          <div class="form-section">
            <div class="section-header">
              <span class="section-number">5</span>
              <div>
                <h2 class="section-title">Lab Orders</h2>
                <p class="section-desc">Laboratory and diagnostic tests ordered</p>
              </div>
            </div>

            <div class="dynamic-list" formArrayName="labOrders">
              @if (labOrders.length === 0) {
                <p class="empty-list">No lab tests ordered yet.</p>
              }
              @for (row of labOrders.controls; track $index) {
                <div class="dynamic-row" [formGroupName]="$index">
                  <div class="row-field row-field--grow">
                    <label class="field-label">Test Name</label>
                    <input
                      type="text"
                      formControlName="testName"
                      class="form-control"
                      placeholder="e.g. Complete Blood Count"
                    />
                  </div>
                  <div class="row-field row-field--grow">
                    <label class="field-label">Notes</label>
                    <input
                      type="text"
                      formControlName="notes"
                      class="form-control"
                      placeholder="Special instructions..."
                    />
                  </div>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeLabOrderRow($index)"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              }
            </div>
            <button type="button" class="btn btn-outline btn-sm" (click)="addLabOrderRow()">
              + Add Test
            </button>
          </div>

          <!-- Section 6: Advice & Follow-up -->
          <div class="form-section">
            <div class="section-header">
              <span class="section-number">6</span>
              <div>
                <h2 class="section-title">Advice &amp; Follow-up</h2>
                <p class="section-desc">
                  Discharge instructions, follow-up date, and encounter status
                </p>
              </div>
            </div>
            <div class="form-grid form-grid--2">
              <div class="field field--span2">
                <label class="field-label">Advice</label>
                <textarea
                  formControlName="advice"
                  class="form-control form-control--textarea"
                  rows="3"
                  placeholder="Dietary advice, activity restrictions, home care..."
                ></textarea>
              </div>
              <div class="field">
                <label class="field-label">Follow-up Date</label>
                <input type="date" formControlName="followUpDate" class="form-control" />
              </div>
              <div class="field">
                <label class="field-label">Status</label>
                <select formControlName="status" class="form-control">
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REFERRED">Referred</option>
                  <option value="ADMITTED">Admitted</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="cancel()">Cancel</button>
            <button
              type="button"
              class="btn btn-outline"
              [disabled]="saving()"
              (click)="submit('PENDING')"
            >
              {{ saving() ? 'Saving…' : 'Save as Draft' }}
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              {{ saving() ? 'Saving…' : 'Mark Complete' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .opd-form-page {
        padding: var(--sp-6);
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      /* Header */
      .page-header {
        display: flex;
        align-items: flex-start;
        gap: var(--sp-4);
      }
      .page-title {
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: var(--text-2xl);
        color: var(--clr-neutral-900);
        margin: 0 0 var(--sp-1);
      }
      .page-subtitle {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
        margin: 0;
      }

      /* Loading state */
      .state-loading {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-10);
        justify-content: center;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
      }

      /* Form sections */
      .form-section {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }
      .section-header {
        display: flex;
        align-items: flex-start;
        gap: var(--sp-3);
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid var(--border-default);
        background: var(--bg-muted);
      }
      .section-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--clr-primary-600);
        color: #fff;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        flex-shrink: 0;
        margin-top: 2px;
      }
      .section-title {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-900);
        margin: 0 0 2px;
      }
      .section-desc {
        font-family: var(--font-body);
        font-size: var(--text-xs);
        color: var(--clr-neutral-500);
        margin: 0;
      }

      /* Grids */
      .form-grid {
        padding: var(--sp-5);
        display: grid;
        gap: var(--sp-4);
      }
      .form-grid--1 {
        grid-template-columns: 1fr;
      }
      .form-grid--2 {
        grid-template-columns: repeat(2, 1fr);
      }
      .form-grid--3 {
        grid-template-columns: repeat(3, 1fr);
      }
      .field--span2 {
        grid-column: 1 / -1;
      }

      /* Fields */
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .field-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-700);
      }
      .required {
        color: var(--clr-danger-500);
      }
      .field-error {
        font-family: var(--font-body);
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
      }

      .form-control {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-900);
        background: var(--bg-base);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-2) var(--sp-3);
        outline: none;
        transition: var(--transition-fast);
        width: 100%;
        box-sizing: border-box;
      }
      .form-control:focus {
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      .form-control.is-invalid {
        border-color: var(--clr-danger-400);
      }
      .form-control.is-invalid:focus {
        box-shadow: 0 0 0 3px var(--clr-danger-100);
      }
      .form-control--textarea {
        resize: vertical;
        min-height: 80px;
      }

      /* Dynamic list */
      .dynamic-list {
        padding: var(--sp-4) var(--sp-5) 0;
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }
      .empty-list {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-400);
        margin: 0;
        padding: var(--sp-3) 0;
      }
      .dynamic-row {
        display: flex;
        align-items: flex-end;
        gap: var(--sp-3);
        background: var(--bg-muted);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-3);
      }
      .row-field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
        min-width: 100px;
      }
      .row-field--grow {
        flex: 1;
      }
      .remove-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--clr-danger-200);
        background: var(--clr-danger-50);
        color: var(--clr-danger-600);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        flex-shrink: 0;
        margin-bottom: 1px;
        transition: var(--transition-fast);
      }
      .remove-btn:hover {
        background: var(--clr-danger-100);
        border-color: var(--clr-danger-400);
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
        border: 1px solid transparent;
        transition: var(--transition-fast);
        text-decoration: none;
      }
      .btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
        border-color: var(--clr-primary-600);
      }
      .btn-primary:not(:disabled):hover {
        background: var(--clr-primary-700);
        border-color: var(--clr-primary-700);
      }
      .btn-outline {
        background: transparent;
        color: var(--clr-primary-600);
        border-color: var(--clr-primary-300);
      }
      .btn-outline:not(:disabled):hover {
        background: var(--clr-primary-50);
      }
      .btn-ghost {
        background: transparent;
        color: var(--clr-neutral-600);
        border-color: var(--border-default);
      }
      .btn-ghost:hover {
        background: var(--bg-muted);
      }
      .btn-sm {
        padding: var(--sp-1) var(--sp-3);
        font-size: var(--text-xs);
      }

      /* Add medicine/test buttons */
      .form-section > .btn-outline {
        margin: var(--sp-3) var(--sp-5) var(--sp-5);
      }

      /* Form actions */
      .form-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--sp-3);
        padding: var(--sp-4) var(--sp-5);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }

      /* Spinner */
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--clr-neutral-200);
        border-top-color: var(--clr-primary-500);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 640px) {
        .form-grid--3 {
          grid-template-columns: 1fr 1fr;
        }
        .form-grid--2 {
          grid-template-columns: 1fr;
        }
        .dynamic-row {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class OpdFormPage implements OnInit {
  private api = inject(OpdApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  encounterId: string | null = null;
  loadingRecord = signal(false);
  saving = signal(false);

  form: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    doctorId: [''],
    doctorName: [''],
    visitDate: [this.todayIso()],
    tokenNumber: [''],
    chiefComplaints: [''],
    history: [''],
    examination: [''],
    diagnosis: [''],
    icdCode: [''],
    prescription: this.fb.array([]),
    labOrders: this.fb.array([]),
    advice: [''],
    followUpDate: [''],
    status: ['PENDING'],
  });

  get prescription(): FormArray {
    return this.form.get('prescription') as FormArray;
  }
  get labOrders(): FormArray {
    return this.form.get('labOrders') as FormArray;
  }

  ngOnInit(): void {
    this.encounterId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.encounterId;
    if (this.isEdit && this.encounterId) {
      this.loadRecord(this.encounterId);
      return;
    }
    // Handed off from patient registration / the patient list — patient is already known.
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    if (patientId) {
      this.form.patchValue({ patientId });
    }
  }

  private loadRecord(id: string): void {
    this.loadingRecord.set(true);
    this.api.getOne(id).subscribe({
      next: (data) => {
        // Patch flat fields
        this.form.patchValue({
          patientId: data.patientId ?? '',
          doctorId: data.doctorId ?? '',
          doctorName: data.doctorName ?? '',
          visitDate: data.visitDate ?? this.todayIso(),
          tokenNumber: data.tokenNumber ?? '',
          chiefComplaints: data.chiefComplaints ?? '',
          history: data.history ?? '',
          examination: data.examination ?? '',
          diagnosis: data.diagnosis ?? '',
          icdCode: data.icdCode ?? '',
          advice: data.advice ?? '',
          followUpDate: data.followUpDate ?? '',
          status: data.status ?? 'PENDING',
        });
        // Rebuild prescription FormArray
        (data.prescription ?? []).forEach((rx: any) =>
          this.prescription.push(this.newPrescriptionRow(rx)),
        );
        // Rebuild labOrders FormArray
        (data.labOrders ?? []).forEach((lo: any) => this.labOrders.push(this.newLabOrderRow(lo)));
        this.loadingRecord.set(false);
      },
      error: () => {
        this.loadingRecord.set(false);
      },
    });
  }

  addPrescriptionRow(): void {
    this.prescription.push(this.newPrescriptionRow());
  }

  removePrescriptionRow(index: number): void {
    this.prescription.removeAt(index);
  }

  addLabOrderRow(): void {
    this.labOrders.push(this.newLabOrderRow());
  }

  removeLabOrderRow(index: number): void {
    this.labOrders.removeAt(index);
  }

  private newPrescriptionRow(data?: any): FormGroup {
    return this.fb.group({
      drugName: [data?.drugName ?? ''],
      dosage: [data?.dosage ?? ''],
      duration: [data?.duration ?? ''],
      instructions: [data?.instructions ?? ''],
    });
  }

  private newLabOrderRow(data?: any): FormGroup {
    return this.fb.group({
      testName: [data?.testName ?? ''],
      notes: [data?.notes ?? ''],
    });
  }

  submit(overrideStatus?: string): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    // Empty strings fail backend validation (@IsOptional skips only null/undefined);
    // date/enum validators reject '' outright. Normalise blanks to null.
    const payload: Record<string, any> = Object.fromEntries(
      Object.entries(this.form.value).map(([k, v]) => [k, v === '' ? null : v]),
    );
    if (overrideStatus) payload['status'] = overrideStatus;

    const request$ =
      this.isEdit && this.encounterId
        ? this.api.update(this.encounterId, payload)
        : this.api.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/opd']);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/opd']);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
