import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { IpdApiService } from '../../core/services/ipd-api.service';

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
                  <label class="field__label">Patient ID <span class="required">*</span></label>
                  <input
                    class="field__input"
                    [class.field__input--error]="isInvalid('patientId')"
                    formControlName="patientId"
                    placeholder="e.g. PAT-00123"
                  />
                  @if (isInvalid('patientId')) {
                    <span class="field__error">Patient ID is required.</span>
                  }
                </div>
              </div>
              <div class="field-row field-row--2col">
                <div class="field">
                  <label class="field__label">Admitting Doctor ID</label>
                  <input
                    class="field__input"
                    formControlName="admittingDoctorId"
                    placeholder="e.g. DOC-0042"
                  />
                </div>
                <div class="field">
                  <label class="field__label">Admitting Doctor Name</label>
                  <input
                    class="field__input"
                    formControlName="admittingDoctorName"
                    placeholder="Dr. Full Name"
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
                  <label class="field__label">Phone</label>
                  <input
                    class="field__input"
                    formControlName="attendantPhone"
                    placeholder="+91 XXXXX XXXXX"
                    type="tel"
                  />
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

  saving = signal(false);
  errorMsg = signal('');

  ngOnInit(): void {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      admittingDoctorId: [''],
      admittingDoctorName: [''],
      wardId: [''],
      bedId: [''],
      diagnosis: [''],
      admissionReason: [''],
      diet: [''],
      allergies: [''],
      attendantName: [''],
      attendantPhone: [''],
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

  loadVacantBeds(wardId: string): void {
    this.bedsLoading.set(true);
    this.api.listBeds({ wardId, status: 'VACANT' }).subscribe({
      next: (beds) => {
        this.vacantBeds.set(Array.isArray(beds) ? beds : []);
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
      },
    });
  }
}
