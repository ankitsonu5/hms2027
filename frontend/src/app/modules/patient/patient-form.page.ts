import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PatientApiService } from '../../core/services/patient-api.service';

@Component({
  selector: 'hms-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--text-primary);
      }
      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xs);
        overflow: hidden;
      }
      .card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid var(--border-default);
      }
      .card__title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
      }
      .card__body {
        padding: var(--sp-5);
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--sp-4) var(--sp-6);
      }
      .form-grid--3 {
        grid-template-columns: repeat(3, 1fr);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .col-span-2 {
        grid-column: span 2;
      }
      .col-span-full {
        grid-column: 1/-1;
      }
      .form-label {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      .form-control {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        padding: 8px 12px;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        color: var(--text-primary);
        outline: none;
        width: 100%;
        transition:
          border-color 150ms ease,
          box-shadow 150ms ease;
      }
      .form-control:focus {
        border-color: var(--clr-primary-500);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--clr-primary-500) 15%, transparent);
      }
      .form-control.ng-invalid.ng-touched {
        border-color: var(--clr-danger-600);
      }
      .form-error {
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
        margin-top: 2px;
      }
      .form-actions {
        display: flex;
        gap: var(--sp-3);
        justify-content: flex-end;
        padding-top: var(--sp-5);
        border-top: 1px solid var(--border-default);
        margin-top: var(--sp-6);
      }
      .btn {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: 500;
        padding: 8px 20px;
        border-radius: var(--radius-md);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 150ms ease;
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
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
        color: var(--text-primary);
        border-color: var(--border-default);
      }
      .btn-secondary:hover {
        background: var(--bg-muted);
      }
      .btn-danger {
        background: var(--clr-danger-600);
        color: #fff;
      }
      .btn-danger:hover {
        background: #b91c1c;
      }
      .btn-sm {
        padding: 5px 12px;
        font-size: 12px;
      }
      textarea.form-control {
        resize: vertical;
        min-height: 80px;
      }
      .section-divider {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-muted);
        padding-bottom: var(--sp-3);
        border-bottom: 1px solid var(--border-default);
        margin-bottom: var(--sp-2);
        grid-column: 1/-1;
      }
    `,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit Patient' : 'New Patient' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit(true)">
        <!-- Basic Info -->
        <div class="card" style="margin-bottom: var(--sp-5)">
          <div class="card__head">
            <span class="card__title">Basic Information</span>
          </div>
          <div class="card__body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input
                  class="form-control"
                  formControlName="firstName"
                  type="text"
                  placeholder="First name"
                />
                @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                  <span class="form-error">First name is required.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input
                  class="form-control"
                  formControlName="lastName"
                  type="text"
                  placeholder="Last name"
                />
                @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                  <span class="form-error">Last name is required.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Gender *</label>
                <select class="form-control" formControlName="gender">
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                @if (form.get('gender')?.invalid && form.get('gender')?.touched) {
                  <span class="form-error">Gender is required.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Date of Birth *</label>
                <input class="form-control" formControlName="dob" type="date" />
                @if (form.get('dob')?.invalid && form.get('dob')?.touched) {
                  <span class="form-error">Date of birth is required.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input
                  class="form-control"
                  formControlName="phone"
                  type="tel"
                  placeholder="Primary phone"
                />
                @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
                  <span class="form-error">Phone is required.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Alternate Phone</label>
                <input
                  class="form-control"
                  formControlName="altPhone"
                  type="tel"
                  placeholder="Alternate phone"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  class="form-control"
                  formControlName="email"
                  type="email"
                  placeholder="Email address"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Blood Group</label>
                <select class="form-control" formControlName="bloodGroup">
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div class="form-group col-span-full">
                <label class="form-label">Address</label>
                <textarea
                  class="form-control"
                  formControlName="address"
                  placeholder="Street address"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">City</label>
                <input class="form-control" formControlName="city" type="text" placeholder="City" />
              </div>

              <div class="form-group">
                <label class="form-label">Pincode</label>
                <input
                  class="form-control"
                  formControlName="pincode"
                  type="text"
                  placeholder="Pincode"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Aadhaar Number</label>
                <input
                  class="form-control"
                  formControlName="aadhaar"
                  type="text"
                  placeholder="12-digit Aadhaar"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Category -->
        <div class="card">
          <div class="card__head">
            <span class="card__title">Registration Category</span>
          </div>
          <div class="card__body">
            <div class="form-grid">
              <div class="form-group col-span-full">
                <label class="form-label">Category *</label>
                <select class="form-control" formControlName="category">
                  <option value="">Select category</option>
                  <option value="DIRECT">Direct</option>
                  <option value="B2B_REFERRAL">B2B Referral</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
                @if (form.get('category')?.invalid && form.get('category')?.touched) {
                  <span class="form-error">Category is required.</span>
                }
              </div>

              @if (form.get('category')?.value === 'B2B_REFERRAL') {
                <div class="form-group col-span-full">
                  <label class="form-label">Referred By Doctor</label>
                  <input
                    class="form-control"
                    formControlName="referredByDoctorName"
                    type="text"
                    placeholder="Referring doctor name"
                  />
                </div>
              }

              @if (form.get('category')?.value === 'CORPORATE') {
                <div class="form-group">
                  <label class="form-label">Corporate ID</label>
                  <input
                    class="form-control"
                    formControlName="corporateId"
                    type="text"
                    placeholder="Corporate ID"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Employee ID</label>
                  <input
                    class="form-control"
                    formControlName="employeeId"
                    type="text"
                    placeholder="Employee ID"
                  />
                </div>
              }

              @if (form.get('category')?.value === 'INSURANCE') {
                <div class="form-group">
                  <label class="form-label">Insurer ID</label>
                  <input
                    class="form-control"
                    formControlName="insurerId"
                    type="text"
                    placeholder="Insurer ID"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Policy Number</label>
                  <input
                    class="form-control"
                    formControlName="policyNumber"
                    type="text"
                    placeholder="Policy number"
                  />
                </div>
              }
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
              @if (isEdit) {
                <button type="submit" class="btn btn-primary" [disabled]="saving">
                  {{ saving ? 'Saving…' : 'Update Patient' }}
                </button>
              } @else {
                <button
                  type="button"
                  class="btn btn-secondary"
                  [disabled]="saving"
                  (click)="onSubmit(false)"
                >
                  {{ saving ? 'Saving…' : 'Save Only' }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="saving">
                  {{ saving ? 'Saving…' : 'Save & Start OPD →' }}
                </button>
              }
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class PatientFormPage implements OnInit {
  private svc = inject(PatientApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  patientId?: string;
  saving = false;

  form: FormGroup = this.fb.group({
    // Basic Info
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    gender: ['', Validators.required],
    dob: ['', Validators.required],
    phone: ['', Validators.required],
    altPhone: [''],
    email: [''],
    bloodGroup: [''],
    address: [''],
    city: [''],
    pincode: [''],
    aadhaar: [''],
    // Category
    category: ['', Validators.required],
    referredByDoctorName: [''],
    corporateId: [''],
    employeeId: [''],
    insurerId: [''],
    policyNumber: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.patientId = id;
      this.svc.getOne(id).subscribe((patient) => {
        this.form.patchValue(patient);
      });
    }
  }

  onSubmit(startOpd: boolean): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    // Empty strings fail backend validation (@IsOptional skips only null/undefined)
    const payload = Object.fromEntries(
      Object.entries(this.form.value).map(([k, v]) => [k, v === '' ? null : v]),
    );
    const action = this.isEdit
      ? this.svc.update(this.patientId!, payload)
      : this.svc.create(payload);

    action.subscribe({
      next: (patient) => {
        this.saving = false;
        if (!this.isEdit && startOpd && patient?.id) {
          // Registration desk hands the patient straight to the consultation.
          this.router.navigate(['/opd/new'], { queryParams: { patientId: patient.id } });
          return;
        }
        this.router.navigate(['/patient']);
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/patient']);
  }
}
