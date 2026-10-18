import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { IpdApiService } from '../../core/services/ipd-api.service';
import { PatientApiService } from '../../core/services/patient-api.service';
import { ClinicianService } from '../../core/services/clinician.service';

@Component({
  selector: 'hms-ipd-admission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="form-page">
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" (click)="router.navigate(['/ipd'])">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h4 class="page-title">{{ isEdit ? 'Edit Admission' : 'Admit Patient' }}</h4>
          <p class="page-subtitle">
            {{ isEdit ? 'Update admission details' : 'Create a new inpatient admission' }}
          </p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-layout">
          <!-- Section 1: Patient & Doctor -->
          <section class="form-card">
            <div class="form-card__header">
              <span class="form-card__step">01</span>
              <h6 class="form-card__title">Patient & Doctor</h6>
            </div>
            <div class="form-card__body">
              <div class="field-row">
                <div class="field">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <label class="field__label" style="margin:0;">Select Patient <span class="required">*</span></label>
                    <a routerLink="/registration" style="font-size:0.8rem; color:var(--clr-primary-600); text-decoration:none;">
                      + Register New Patient
                    </a>
                  </div>
                  
                  <select
                    class="field__select"
                    (change)="onPatientSelect($event)"
                    [class.field__input--error]="isInvalid('patientId')"
                  >
                    <option value="">— Search / Choose Registered Patient —</option>
                    @for (pat of patients(); track pat.id) {
                      <option [value]="pat.id" [selected]="selectedPatient()?.id === pat.id">
                        {{ pat.firstName }} {{ pat.lastName }} ({{ pat.uhid || 'No UHID' }}) - 📞 {{ pat.phone }}
                      </option>
                    }
                  </select>

                  @if (selectedPatient()) {
                    <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:var(--radius-md); padding:10px 14px; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
                      <div>
                        <strong>{{ selectedPatient()?.firstName }} {{ selectedPatient()?.lastName }}</strong>
                        <div style="font-size:0.8rem; color:#475569;">
                          UHID: {{ selectedPatient()?.uhid }} • {{ getPatientAgeGender(selectedPatient()) }} • 📞 {{ selectedPatient()?.phone }}
                        </div>
                        <div style="font-size:0.75rem; color:#64748b;">
                          City: {{ selectedPatient()?.city || 'Varanasi' }} • Category: {{ selectedPatient()?.category || 'DIRECT' }}
                        </div>
                      </div>
                      <span style="font-size:0.75rem; background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:9999px; font-weight:bold;">
                        ✓ Patient Selected
                      </span>
                    </div>
                  } @else {
                    <div style="margin-top:6px;">
                      <input
                        class="field__input"
                        [class.field__input--error]="isInvalid('patientId')"
                        formControlName="patientId"
                        placeholder="Or enter Patient ID / UHID manually (e.g. UHID-2026-00001)"
                      />
                    </div>
                  }

                  @if (isInvalid('patientId')) {
                    <span class="field__error">Patient selection is required for admission.</span>
                  }
                </div>
              </div>

              <div class="field-row field-row--2col">
                <div class="field">
                  <label class="field__label">Admitting Doctor <span class="required">*</span></label>
                  <select
                    class="field__select"
                    [value]="form.value.admittingDoctorId || ''"
                    (change)="onDoctorSelect($event)"
                    [class.field__input--error]="isInvalid('admittingDoctorId')"
                  >
                    <option value="">— Select Admitting Doctor —</option>
                    @for (doc of doctors(); track doc.id) {
                      <option [value]="doc.id" [selected]="form.value.admittingDoctorId === doc.id">
                        {{ doc.name }}{{ doc.specialisation ? ' (' + doc.specialisation + ')' : '' }}
                      </option>
                    }
                  </select>
                  @if (doctorsLoading()) {
                    <span class="field__hint">Loading doctors…</span>
                  }
                  @if (isInvalid('admittingDoctorId')) {
                    <span class="field__error">Admitting doctor is required.</span>
                  }
                </div>
                <div class="field">
                  <label class="field__label">Doctor Name</label>
                  <input
                    class="field__input"
                    formControlName="admittingDoctorName"
                    placeholder="Doctor Name"
                    readonly
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Section 2: Ward & Bed -->
          <section class="form-card">
            <div class="form-card__header">
              <span class="form-card__step">02</span>
              <h6 class="form-card__title">Ward &amp; Bed</h6>
            </div>
            <div class="form-card__body">
              <div class="field-row field-row--2col">
                <div class="field">
                  <label class="field__label">Ward</label>
                  <select class="field__select" formControlName="wardId" (change)="onWardChange()">
                    <option value="">— Select Ward —</option>
                    @for (ward of wards(); track ward.id) {
                      <option [value]="ward.id">{{ ward.name }}</option>
                    }
                  </select>
                  @if (wardsLoading()) {
                    <span class="field__hint">Loading wards…</span>
                  }
                </div>
                <div class="field">
                  <label class="field__label">Bed (Vacant)</label>
                  <select
                    class="field__select"
                    formControlName="bedId"
                    [attr.disabled]="bedsLoading() || !form.value.wardId ? true : null"
                  >
                    <option value="">— Select Bed —</option>
                    @for (bed of vacantBeds(); track bed.id) {
                      <option [value]="bed.id">{{ bed.bedNumber ?? bed.number }}</option>
                    }
                  </select>
                  @if (bedsLoading()) {
                    <span class="field__hint">Loading beds…</span>
                  }
                  @if (!bedsLoading() && form.value.wardId && vacantBeds().length === 0) {
                    <span class="field__hint field__hint--warn">No vacant beds in this ward.</span>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Clinical -->
          <section class="form-card">
            <div class="form-card__header">
              <span class="form-card__step">03</span>
              <h6 class="form-card__title">Clinical Details</h6>
            </div>
            <div class="form-card__body">
              <div class="field-row field-row--2col">
                <div class="field">
                  <label class="field__label">Diagnosis</label>
                  <textarea
                    class="field__textarea"
                    formControlName="diagnosis"
                    rows="3"
                    placeholder="Primary diagnosis…"
                  ></textarea>
                </div>
                <div class="field">
                  <label class="field__label">Admission Reason</label>
                  <textarea
                    class="field__textarea"
                    formControlName="admissionReason"
                    rows="3"
                    placeholder="Reason for admission…"
                  ></textarea>
                </div>
              </div>
              <div class="field-row field-row--2col">
                <div class="field">
                  <label class="field__label">Diet</label>
                  <select class="field__select" formControlName="diet">
                    <option value="">— Select Diet —</option>
                    <option value="NORMAL">Normal</option>
                    <option value="DIABETIC">Diabetic</option>
                    <option value="RENAL">Renal</option>
                    <option value="CARDIAC">Cardiac</option>
                    <option value="LIQUID">Liquid</option>
                    <option value="NPO">NPO (Nothing by Mouth)</option>
                  </select>
                </div>
                <div class="field">
                  <label class="field__label">Known Allergies</label>
                  <textarea
                    class="field__textarea"
                    formControlName="allergies"
                    rows="3"
                    placeholder="List any known allergies…"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 4: Attendant -->
          <section class="form-card">
            <div class="form-card__header">
              <span class="form-card__step">04</span>
              <h6 class="form-card__title">Attendant Details</h6>
            </div>
            <div class="form-card__body">
              <div class="field-row field-row--3col">
                <div class="field">
                  <label class="field__label">Attendant Name</label>
                  <input
                    class="field__input"
                    formControlName="attendantName"
                    placeholder="Full name"
                  />
                </div>
                <div class="field">
                  <label class="field__label">Phone (10 digits)</label>
                  <input
                    class="field__input"
                    formControlName="attendantPhone"
                    placeholder="10-digit mobile number"
                    maxlength="10"
                    pattern="[0-9]{10}"
                    type="tel"
                    (input)="sanitizeAttendantPhone()"
                  />
                  @if (form.get('attendantPhone')?.touched && form.get('attendantPhone')?.hasError('pattern')) {
                    <span style="color: var(--clr-danger-600); font-size: 11px;">Must be exactly 10 digits</span>
                  }
                </div>
                <div class="field">
                  <label class="field__label">Relation</label>
                  <input
                    class="field__input"
                    formControlName="attendantRelation"
                    placeholder="e.g. Spouse, Parent"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Section 5: Finance -->
          <section class="form-card">
            <div class="form-card__header">
              <span class="form-card__step">05</span>
              <h6 class="form-card__title">Finance</h6>
            </div>
            <div class="form-card__body">
              <div class="field-row">
                <div class="field field--narrow">
                  <label class="field__label">Initial Deposit (₹)</label>
                  <input
                    class="field__input"
                    formControlName="depositAmount"
                    type="number"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer Actions -->
        <div class="form-footer">
          @if (errorMsg()) {
            <span class="error-msg">{{ errorMsg() }}</span>
          }
          <button type="button" class="btn btn--ghost" (click)="router.navigate(['/ipd'])">
            Cancel
          </button>
          <button type="submit" class="btn btn--primary" [disabled]="saving()">
            @if (saving()) {
              <svg
                class="spinner"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Saving…
            } @else {
              {{ isEdit ? 'Save Changes' : 'Admit Patient' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .form-page {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
        max-width: 900px;
      }

      /* ── Header ── */
      .page-header {
        display: flex;
        align-items: flex-start;
        gap: var(--sp-4);
      }

      .back-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        cursor: pointer;
        color: var(--text-muted);
        flex-shrink: 0;
        margin-top: 2px;
        transition: all var(--transition-fast);

        svg {
          width: 18px;
          height: 18px;
        }

        &:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }
      }

      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: var(--fw-display-bold);
        color: var(--text-primary);
        margin-bottom: var(--sp-1);
      }

      .page-subtitle {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      /* ── Form Layout ── */
      .form-layout {
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      /* ── Form Card ── */
      .form-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xs);
        overflow: hidden;
      }

      .form-card__header {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid var(--border-default);
        background: var(--bg-muted);
      }

      .form-card__step {
        font-family: var(--font-display);
        font-size: var(--text-xs);
        font-weight: var(--fw-display-bold);
        color: var(--clr-primary-600);
        background: var(--clr-primary-50);
        border: 1px solid var(--clr-primary-200);
        border-radius: var(--radius-md);
        padding: 2px 8px;
        letter-spacing: 0.05em;
      }

      .form-card__title {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
      }

      .form-card__body {
        padding: var(--sp-5);
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
      }

      /* ── Field Rows ── */
      .field-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-4);

        &--2col {
          grid-template-columns: 1fr 1fr;

          @media (max-width: 640px) {
            grid-template-columns: 1fr;
          }
        }

        &--3col {
          grid-template-columns: 1fr 1fr 1fr;

          @media (max-width: 768px) {
            grid-template-columns: 1fr 1fr;
          }

          @media (max-width: 480px) {
            grid-template-columns: 1fr;
          }
        }
      }

      /* ── Field ── */
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);

        &--narrow {
          max-width: 260px;
        }
      }

      .field__label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
        letter-spacing: 0.03em;
      }

      .required {
        color: var(--clr-danger-500);
      }

      .field__input,
      .field__select,
      .field__textarea {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-2) var(--sp-3);
        outline: none;
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast);
        width: 100%;
        box-sizing: border-box;

        &:focus {
          border-color: var(--clr-primary-400);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--clr-primary-400) 15%, transparent);
        }

        &::placeholder {
          color: var(--text-muted);
        }

        &--error {
          border-color: var(--clr-danger-400);

          &:focus {
            border-color: var(--clr-danger-400);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--clr-danger-400) 15%, transparent);
          }
        }

        &:disabled,
        &[disabled] {
          background: var(--bg-muted);
          color: var(--text-muted);
          cursor: not-allowed;
        }
      }

      .field__textarea {
        resize: vertical;
        min-height: 80px;
      }

      .field__error {
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
      }

      .field__hint {
        font-size: var(--text-xs);
        color: var(--text-muted);
        font-style: italic;

        &--warn {
          color: var(--clr-warning-600);
        }
      }

      /* ── Footer ── */
      .form-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--sp-3);
        flex-wrap: wrap;
      }

      .error-msg {
        font-size: var(--text-sm);
        color: var(--clr-danger-600);
        margin-right: auto;
      }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-5);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        border-radius: var(--radius-lg);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all var(--transition-fast);

        svg {
          width: 16px;
          height: 16px;
        }

        &--primary {
          background: var(--clr-primary-600);
          color: #fff;
          border-color: var(--clr-primary-600);

          &:hover:not(:disabled) {
            background: var(--clr-primary-700);
            border-color: var(--clr-primary-700);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        &--ghost {
          background: transparent;
          color: var(--text-secondary);
          border-color: var(--border-default);

          &:hover {
            background: var(--bg-muted);
          }
        }
      }

      /* ── Spinner ── */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .spinner {
        animation: spin 0.8s linear infinite;
      }
    `,
  ],
})
export class IpdAdmissionFormPage implements OnInit {
  private api = inject(IpdApiService);
  private patientApi = inject(PatientApiService);
  private clinicianService = inject(ClinicianService);
  private fb = inject(FormBuilder);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = false;
  editId: string | number | null = null;

  wards = signal<any[]>([]);
  wardsLoading = signal(false);
  vacantBeds = signal<any[]>([]);
  bedsLoading = signal(false);

  patients = signal<any[]>([]);
  selectedPatient = signal<any | null>(null);

  defaultDoctors = [
    { id: 'd32ca404-5d5f-4169-b601-a8d43f03fc6b', name: 'Dr. Krishna P Padagala', specialisation: 'Chief Physician / Admin' },
    { id: '76d77fe7-7cc4-482e-a89a-7ad7df453a0d', name: 'Dr. Jain', specialisation: 'Cardiologist' },
  ];
  doctors = signal<any[]>([...this.defaultDoctors]);
  doctorsLoading = signal(false);

  saving = signal(false);
  errorMsg = signal('');

  sanitizeAttendantPhone(): void {
    const val = this.form?.get('attendantPhone')?.value;
    if (val) {
      const clean = val.replace(/\D/g, '').slice(0, 10);
      if (clean !== val) {
        this.form.get('attendantPhone')?.setValue(clean, { emitEvent: false });
      }
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      admittingDoctorId: ['d32ca404-5d5f-4169-b601-a8d43f03fc6b', Validators.required],
      admittingDoctorName: ['Dr. Krishna P Padagala'],
      wardId: ['', Validators.required],
      bedId: ['', Validators.required],
      diagnosis: [''],
      admissionReason: [''],
      diet: ['NORMAL'],
      allergies: [''],
      attendantName: [''],
      attendantPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      attendantRelation: [''],
      depositAmount: [null],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.loadAdmission(id);
    }

    this.loadWards();
    this.loadPatients();
    this.loadDoctors();

    // Check query params if wardId and bedId are pre-selected
    const qWardId = this.route.snapshot.queryParamMap.get('wardId');
    const qBedId = this.route.snapshot.queryParamMap.get('bedId');
    if (qWardId) {
      this.form.patchValue({ wardId: qWardId });
      this.loadVacantBeds(qWardId, qBedId);
    }

    const qPatientId = this.route.snapshot.queryParamMap.get('patientId') || this.route.snapshot.queryParamMap.get('uhid');
    if (qPatientId) {
      this.form.patchValue({ patientId: qPatientId });
    }
  }

  loadPatients(): void {
    const qPatientId = this.route.snapshot.queryParamMap.get('patientId') || this.route.snapshot.queryParamMap.get('uhid');
    this.patientApi.list({ limit: 100 }).subscribe({
      next: (res) => {
        const list = res?.data || [];
        this.patients.set(list);
        const currentId = qPatientId || this.form.get('patientId')?.value;
        if (currentId) {
          const found = list.find((p: any) => p.id === currentId || p.uhid === currentId);
          if (found) {
            this.selectedPatient.set(found);
            this.form.patchValue({ patientId: found.uhid || found.id });
          }
        } else if (list.length === 1 && !this.isEdit) {
          // Auto select if single patient exists
          this.selectedPatient.set(list[0]);
          this.form.patchValue({ patientId: list[0].uhid || list[0].id });
        }
      },
    });
  }

  onPatientSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const patId = select.value;
    if (!patId) {
      this.selectedPatient.set(null);
      this.form.patchValue({ patientId: '' });
      return;
    }
    const found = this.patients().find((p: any) => p.id === patId);
    if (found) {
      this.selectedPatient.set(found);
      this.form.patchValue({ patientId: found.uhid || found.id });
    }
  }

  loadDoctors(): void {
    this.doctorsLoading.set(true);
    this.clinicianService.getClinicians().subscribe({
      next: (list) => {
        this.doctorsLoading.set(false);
        const fetched = Array.isArray(list) ? list : [];
        const formatted = fetched.map((c: any) => ({
          id: c.id,
          name: c.name?.toLowerCase().startsWith('dr') ? c.name : `Dr. ${c.name}`,
          specialisation: c.specialisation || c.department || 'Consultant',
        }));

        const merged = [...formatted];
        for (const def of this.defaultDoctors) {
          if (!merged.some((m) => m.id === def.id || m.name?.toLowerCase() === def.name?.toLowerCase())) {
            merged.push(def);
          }
        }
        this.doctors.set(merged);

        const currentDocId = this.form.get('admittingDoctorId')?.value;
        if (currentDocId) {
          const found = merged.find((d) => d.id === currentDocId);
          if (found && !this.form.get('admittingDoctorName')?.value) {
            this.form.patchValue({ admittingDoctorName: found.name });
          }
        }
      },
      error: () => {
        this.doctorsLoading.set(false);
        this.doctors.set(this.defaultDoctors);
      },
    });
  }

  onDoctorSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const docId = select.value;
    const found = this.doctors().find((d) => d.id === docId);
    if (found) {
      this.form.patchValue({
        admittingDoctorId: found.id,
        admittingDoctorName: found.name,
      });
    } else {
      this.form.patchValue({
        admittingDoctorId: '',
        admittingDoctorName: '',
      });
    }
  }

  getPatientAgeGender(patient: any): string {
    if (!patient) return '';
    const age = patient.age || (patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : '-');
    const gender = patient.gender || 'OTHER';
    return `${age}Y / ${gender}`;
  }

  loadWards(): void {
    this.wardsLoading.set(true);
    this.api.listWards().subscribe({
      next: (wards) => {
        this.wards.set(wards);
        this.wardsLoading.set(false);
      },
      error: () => {
        this.wards.set([]);
        this.wardsLoading.set(false);
      },
    });
  }

  loadAdmission(id: string): void {
    this.api.getAdmission(id).subscribe({
      next: (adm) => {
        this.form.patchValue({
          patientId: adm.patientId ?? '',
          admittingDoctorId: adm.admittingDoctorId ?? '',
          admittingDoctorName: adm.admittingDoctorName ?? '',
          wardId: adm.wardId ?? '',
          bedId: adm.bedId ?? '',
          diagnosis: adm.diagnosis ?? '',
          admissionReason: adm.admissionReason ?? '',
          diet: adm.diet ?? '',
          allergies: adm.allergies ?? '',
          attendantName: adm.attendantName ?? '',
          attendantPhone: adm.attendantPhone ?? '',
          attendantRelation: adm.attendantRelation ?? '',
          depositAmount: adm.depositAmount ?? null,
        });
        if (adm.admittingDoctorId && !this.doctors().some((d) => d.id === adm.admittingDoctorId)) {
          this.doctors.update((docs) => [
            ...docs,
            {
              id: adm.admittingDoctorId,
              name: adm.admittingDoctorName || 'Admitting Doctor',
              specialisation: 'Attending Physician',
            },
          ]);
        }
        if (adm.wardId) {
          this.loadVacantBeds(adm.wardId);
        }
      },
    });
  }

  onWardChange(): void {
    const wardId = this.form.value.wardId;
    this.vacantBeds.set([]);
    this.form.patchValue({ bedId: '' });
    if (!wardId) return;
    this.loadVacantBeds(wardId);
  }

  loadVacantBeds(wardId: string, preSelectBedId?: string | null): void {
    this.bedsLoading.set(true);
    this.api.listBeds({ wardId, status: 'VACANT' }).subscribe({
      next: (beds) => {
        this.vacantBeds.set(Array.isArray(beds) ? beds : []);
        if (preSelectBedId) {
          this.form.patchValue({ bedId: preSelectBedId });
        }
        this.bedsLoading.set(false);
      },
      error: () => {
        this.vacantBeds.set([]);
        this.bedsLoading.set(false);
      },
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    this.errorMsg.set('');
    const payload = this.form.value;

    const request =
      this.isEdit && this.editId
        ? this.api.updateAdmission(this.editId, payload)
        : this.api.createAdmission(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/ipd']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'An error occurred. Please try again.');
        if (payload.wardId) {
          this.loadVacantBeds(payload.wardId);
          this.form.patchValue({ bedId: '' });
        }
      },
    });
  }
}
