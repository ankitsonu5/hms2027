import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EmergencyApiService } from '../../core/services/emergency-api.service';

@Component({
  selector: 'hms-emergency-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  styles: [
    `
      .page-wrap {
        padding: var(--sp-6, 1.5rem);
        background: var(--bg-base);
        min-height: 100%;
      }
      .page-header {
        display: flex;
        align-items: center;
        gap: var(--sp-3, 0.75rem);
        margin-bottom: var(--sp-6, 1.5rem);
      }
      .btn-back {
        background: none;
        border: 1px solid var(--border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        padding: var(--sp-1, 0.25rem) var(--sp-3, 0.75rem);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        font-weight: var(--fw-medium, 500);
        color: var(--clr-neutral-600, #4b5563);
        cursor: pointer;
        transition: background 0.1s;
      }
      .btn-back:hover {
        background: var(--bg-muted, #f9fafb);
      }
      .page-title {
        font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
        font-weight: var(--fw-bold, 700);
        font-size: var(--text-2xl, 1.5rem);
        color: var(--clr-neutral-900, #111827);
        margin: 0;
      }
      .form-body {
        display: flex;
        flex-direction: column;
        gap: var(--sp-5, 1.25rem);
        max-width: 860px;
      }
      .section-card {
        background: var(--bg-surface, #fff);
        border: 1px solid var(--border-default, #e5e7eb);
        border-radius: var(--radius-lg, 0.5rem);
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
        overflow: hidden;
      }
      .section-header {
        padding: var(--sp-3, 0.75rem) var(--sp-5, 1.25rem);
        background: var(--bg-muted, #f9fafb);
        border-bottom: 1px solid var(--border-default, #e5e7eb);
        display: flex;
        align-items: center;
        gap: var(--sp-2, 0.5rem);
      }
      .section-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        background: var(--clr-primary-600, #dc2626);
        color: #fff;
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-xs, 0.75rem);
        font-weight: var(--fw-bold, 700);
        flex-shrink: 0;
      }
      .section-title {
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-weight: var(--fw-semibold, 600);
        font-size: var(--text-sm, 0.875rem);
        color: var(--clr-neutral-700, #374151);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .section-body {
        padding: var(--sp-5, 1.25rem);
      }
      .field-row {
        display: grid;
        gap: var(--sp-4, 1rem);
        margin-bottom: var(--sp-4, 1rem);
      }
      .field-row:last-child {
        margin-bottom: 0;
      }
      .cols-3 {
        grid-template-columns: repeat(3, 1fr);
      }
      .cols-2 {
        grid-template-columns: repeat(2, 1fr);
      }
      .cols-6 {
        grid-template-columns: repeat(6, 1fr);
      }
      .col-full {
        grid-column: 1 / -1;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1, 0.25rem);
      }
      label {
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-xs, 0.75rem);
        font-weight: var(--fw-semibold, 600);
        color: var(--clr-neutral-600, #4b5563);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .input-big {
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        border: 2px solid var(--border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-lg, 1.125rem);
        font-weight: var(--fw-medium, 500);
        color: var(--clr-neutral-900, #111827);
        background: var(--bg-surface, #fff);
        transition: border-color 0.15s;
        width: 100%;
        box-sizing: border-box;
      }
      .input-big:focus {
        outline: none;
        border-color: var(--clr-primary-500, #ef4444);
        box-shadow: 0 0 0 3px var(--clr-primary-100, #fee2e2);
      }
      .input {
        padding: var(--sp-2, 0.5rem) var(--sp-3, 0.75rem);
        border: 1px solid var(--border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        color: var(--clr-neutral-900, #111827);
        background: var(--bg-surface, #fff);
        transition: border-color 0.15s;
        width: 100%;
        box-sizing: border-box;
      }
      .input:focus {
        outline: none;
        border-color: var(--clr-primary-500, #ef4444);
        box-shadow: 0 0 0 3px var(--clr-primary-100, #fee2e2);
      }
      .input.invalid {
        border-color: var(--clr-danger-500, #ef4444);
      }
      select.input {
        cursor: pointer;
      }
      textarea.input {
        resize: vertical;
        min-height: 80px;
      }
      .field-error {
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-xs, 0.75rem);
        color: var(--clr-danger-600, #dc2626);
        margin-top: 2px;
      }
      /* Checkbox row */
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: var(--sp-2, 0.5rem);
        margin-top: var(--sp-1, 0.25rem);
      }
      .checkbox-row input[type='checkbox'] {
        width: 1rem;
        height: 1rem;
        accent-color: var(--clr-primary-600, #dc2626);
        cursor: pointer;
      }
      .checkbox-label {
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        font-weight: var(--fw-medium, 500);
        color: var(--clr-neutral-700, #374151);
        text-transform: none;
        letter-spacing: 0;
        cursor: pointer;
      }
      /* Triage cards */
      .triage-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--sp-3, 0.75rem);
      }
      .triage-card {
        position: relative;
        border: 2px solid var(--border-default, #e5e7eb);
        border-radius: var(--radius-lg, 0.5rem);
        padding: var(--sp-4, 1rem);
        cursor: pointer;
        transition:
          border-color 0.15s,
          background 0.15s;
        text-align: center;
        user-select: none;
      }
      .triage-card input[type='radio'] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
      .triage-card-label {
        display: block;
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-weight: var(--fw-bold, 700);
        font-size: var(--text-xl, 1.25rem);
        letter-spacing: 0.08em;
        margin-bottom: var(--sp-1, 0.25rem);
      }
      .triage-card-sub {
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-xs, 0.75rem);
        color: var(--clr-neutral-500, #6b7280);
      }
      /* RED */
      .triage-red {
        border-color: var(--clr-danger-200, #fecaca);
      }
      .triage-red .triage-card-label {
        color: var(--clr-danger-600, #dc2626);
      }
      .triage-red:hover,
      .triage-red.active {
        border-color: var(--clr-danger-500, #ef4444);
        background: var(--clr-danger-50, #fff1f2);
      }
      .triage-red.active {
        border-width: 3px;
        background: var(--clr-danger-100, #fee2e2);
      }
      /* YELLOW */
      .triage-yellow {
        border-color: var(--clr-warning-200, #fde68a);
      }
      .triage-yellow .triage-card-label {
        color: var(--clr-warning-600, #ca8a04);
      }
      .triage-yellow:hover,
      .triage-yellow.active {
        border-color: var(--clr-warning-500, #eab308);
        background: var(--clr-warning-50, #fefce8);
      }
      .triage-yellow.active {
        border-width: 3px;
        background: var(--clr-warning-100, #fef9c3);
      }
      /* GREEN */
      .triage-green {
        border-color: var(--clr-success-200, #bbf7d0);
      }
      .triage-green .triage-card-label {
        color: var(--clr-success-600, #16a34a);
      }
      .triage-green:hover,
      .triage-green.active {
        border-color: var(--clr-success-500, #22c55e);
        background: var(--clr-success-50, #f0fdf4);
      }
      .triage-green.active {
        border-width: 3px;
        background: var(--clr-success-100, #dcfce7);
      }
      /* Vitals row */
      .vitals-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: var(--sp-3, 0.75rem);
      }
      /* Drugs list */
      .drug-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: var(--sp-2, 0.5rem);
        align-items: end;
        margin-bottom: var(--sp-2, 0.5rem);
      }
      .btn-remove {
        background: none;
        border: 1px solid var(--clr-danger-200, #fecaca);
        border-radius: var(--radius-sm, 0.25rem);
        padding: var(--sp-1, 0.25rem) var(--sp-2, 0.5rem);
        color: var(--clr-danger-600, #dc2626);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        transition: background 0.1s;
      }
      .btn-remove:hover {
        background: var(--clr-danger-50, #fff1f2);
      }
      .btn-add {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1, 0.25rem);
        background: none;
        border: 1px dashed var(--border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        padding: var(--sp-2, 0.5rem) var(--sp-3, 0.75rem);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
        font-weight: var(--fw-medium, 500);
        color: var(--clr-neutral-600, #4b5563);
        cursor: pointer;
        margin-top: var(--sp-2, 0.5rem);
        transition:
          border-color 0.1s,
          color 0.1s;
      }
      .btn-add:hover {
        border-color: var(--clr-primary-400, #f87171);
        color: var(--clr-primary-600, #dc2626);
      }
      /* Footer actions */
      .form-footer {
        display: flex;
        align-items: center;
        gap: var(--sp-3, 0.75rem);
        padding-top: var(--sp-2, 0.5rem);
      }
      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2, 0.5rem);
        padding: var(--sp-2, 0.5rem) var(--sp-5, 1.25rem);
        background: var(--clr-primary-600, #dc2626);
        color: #fff;
        border: none;
        border-radius: var(--radius-md, 0.375rem);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-weight: var(--fw-semibold, 600);
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        transition: background 0.15s;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--clr-primary-700, #b91c1c);
      }
      .btn-primary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-secondary {
        display: inline-flex;
        align-items: center;
        padding: var(--sp-2, 0.5rem) var(--sp-4, 1rem);
        background: none;
        border: 1px solid var(--border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        font-family: var(--font-label, 'Hanken Grotesk', sans-serif);
        font-weight: var(--fw-medium, 500);
        font-size: var(--text-sm, 0.875rem);
        color: var(--clr-neutral-600, #4b5563);
        cursor: pointer;
        transition: background 0.1s;
      }
      .btn-secondary:hover {
        background: var(--bg-muted, #f9fafb);
      }
      .error-banner {
        margin-bottom: var(--sp-4, 1rem);
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        background: var(--clr-danger-50, #fff1f2);
        border: 1px solid var(--clr-danger-200, #fecaca);
        border-radius: var(--radius-md, 0.375rem);
        color: var(--clr-danger-700, #b91c1c);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
      }
      .success-banner {
        margin-bottom: var(--sp-4, 1rem);
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        background: var(--clr-success-50, #f0fdf4);
        border: 1px solid var(--clr-success-200, #bbf7d0);
        border-radius: var(--radius-md, 0.375rem);
        color: var(--clr-success-700, #15803d);
        font-family: var(--font-body, 'Hanken Grotesk', sans-serif);
        font-size: var(--text-sm, 0.875rem);
      }
      @media (max-width: 768px) {
        .vitals-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .triage-cards {
          grid-template-columns: 1fr;
        }
        .cols-3 {
          grid-template-columns: 1fr 1fr;
        }
        .cols-6 {
          grid-template-columns: repeat(3, 1fr);
        }
        .drug-row {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <button class="btn-back" (click)="goBack()">← Back</button>
        <h1 class="page-title">{{ isEdit ? 'Edit Emergency' : 'New Emergency' }}</h1>
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }
      @if (saved()) {
        <div class="success-banner">Record saved. Treatment section is now available.</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body" novalidate>
        <!-- Section 1: Quick ID -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-number">1</span>
            <h2 class="section-title">Quick ID</h2>
          </div>
          <div class="section-body">
            <div class="field-row">
              <div class="field col-full">
                <label for="patientName">Patient Name *</label>
                <input
                  id="patientName"
                  type="text"
                  class="input-big"
                  formControlName="patientName"
                  placeholder="Full name of patient"
                  [class.invalid]="isInvalid('patientName')"
                  autocomplete="off"
                />
                @if (isInvalid('patientName')) {
                  <span class="field-error">Patient name is required.</span>
                }
              </div>
            </div>
            <div class="field-row cols-3">
              <div class="field">
                <label for="age">Age</label>
                <input
                  id="age"
                  type="number"
                  class="input"
                  formControlName="age"
                  placeholder="Years"
                  min="0"
                  max="150"
                />
              </div>
              <div class="field">
                <label for="gender">Gender</label>
                <select id="gender" class="input" formControlName="gender">
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="field">
                <label for="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  class="input"
                  formControlName="phone"
                  placeholder="10-digit number"
                />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="checkbox-row">
                  <input id="mlcCase" type="checkbox" formControlName="mlcCase" />
                  <label for="mlcCase" class="checkbox-label">MLC Case (Medico-Legal)</label>
                </div>
              </div>
              @if (form.get('mlcCase')?.value) {
                <div class="field">
                  <label for="mlcNumber">MLC Number</label>
                  <input
                    id="mlcNumber"
                    type="text"
                    class="input"
                    formControlName="mlcNumber"
                    placeholder="MLC reference number"
                  />
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Section 2: Triage -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-number">2</span>
            <h2 class="section-title">Triage</h2>
          </div>
          <div class="section-body">
            <div class="field" style="margin-bottom: var(--sp-4, 1rem);">
              <label>Triage Tag</label>
              <div class="triage-cards" style="margin-top: var(--sp-2, 0.5rem);">
                <div
                  class="triage-card triage-red"
                  [class.active]="form.get('triageTag')?.value === 'RED'"
                  (click)="setTriage('RED')"
                  (keydown.enter)="setTriage('RED')"
                  (keydown.space)="setTriage('RED')"
                  tabindex="0"
                  role="radio"
                  [attr.aria-checked]="form.get('triageTag')?.value === 'RED'"
                >
                  <input type="radio" formControlName="triageTag" value="RED" />
                  <span class="triage-card-label">RED</span>
                  <span class="triage-card-sub">Immediate — life threatening</span>
                </div>
                <div
                  class="triage-card triage-yellow"
                  [class.active]="form.get('triageTag')?.value === 'YELLOW'"
                  (click)="setTriage('YELLOW')"
                  (keydown.enter)="setTriage('YELLOW')"
                  (keydown.space)="setTriage('YELLOW')"
                  tabindex="0"
                  role="radio"
                  [attr.aria-checked]="form.get('triageTag')?.value === 'YELLOW'"
                >
                  <input type="radio" formControlName="triageTag" value="YELLOW" />
                  <span class="triage-card-label">YELLOW</span>
                  <span class="triage-card-sub">Delayed — stable but urgent</span>
                </div>
                <div
                  class="triage-card triage-green"
                  [class.active]="form.get('triageTag')?.value === 'GREEN'"
                  (click)="setTriage('GREEN')"
                  (keydown.enter)="setTriage('GREEN')"
                  (keydown.space)="setTriage('GREEN')"
                  tabindex="0"
                  role="radio"
                  [attr.aria-checked]="form.get('triageTag')?.value === 'GREEN'"
                >
                  <input type="radio" formControlName="triageTag" value="GREEN" />
                  <span class="triage-card-label">GREEN</span>
                  <span class="triage-card-sub">Minor — walking wounded</span>
                </div>
              </div>
            </div>
            <div class="field">
              <label for="chiefComplaint">Chief Complaint</label>
              <textarea
                id="chiefComplaint"
                class="input"
                formControlName="chiefComplaint"
                placeholder="Describe presenting complaint…"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Section 3: Vitals -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-number">3</span>
            <h2 class="section-title">Vitals</h2>
          </div>
          <div class="section-body">
            <div class="vitals-grid" formGroupName="vitals">
              <div class="field">
                <label for="bp">BP (mmHg)</label>
                <input
                  id="bp"
                  type="text"
                  class="input"
                  formControlName="bp"
                  placeholder="120/80"
                />
              </div>
              <div class="field">
                <label for="pulse">Pulse (bpm)</label>
                <input
                  id="pulse"
                  type="number"
                  class="input"
                  formControlName="pulse"
                  placeholder="72"
                />
              </div>
              <div class="field">
                <label for="temp">Temp (°F)</label>
                <input
                  id="temp"
                  type="number"
                  class="input"
                  formControlName="temp"
                  placeholder="98.6"
                  step="0.1"
                />
              </div>
              <div class="field">
                <label for="spo2">SpO₂ (%)</label>
                <input
                  id="spo2"
                  type="number"
                  class="input"
                  formControlName="spo2"
                  placeholder="98"
                  min="0"
                  max="100"
                />
              </div>
              <div class="field">
                <label for="rr">RR (/min)</label>
                <input id="rr" type="number" class="input" formControlName="rr" placeholder="18" />
              </div>
              <div class="field">
                <label for="weight">Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  class="input"
                  formControlName="weight"
                  placeholder="70"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Treatment (visible after initial save or in edit mode) -->
        @if (showTreatment()) {
          <div class="section-card">
            <div class="section-header">
              <span class="section-number">4</span>
              <h2 class="section-title">Treatment</h2>
            </div>
            <div class="section-body">
              <div class="field-row">
                <div class="field col-full">
                  <label for="attendedByDoctorName">Attended by Doctor</label>
                  <input
                    id="attendedByDoctorName"
                    type="text"
                    class="input"
                    formControlName="attendedByDoctorName"
                    placeholder="Doctor's name"
                  />
                </div>
              </div>
              <div class="field-row">
                <div class="field col-full">
                  <label for="treatmentNotes">Treatment Notes</label>
                  <textarea
                    id="treatmentNotes"
                    class="input"
                    formControlName="treatmentNotes"
                    placeholder="Describe treatment given, procedures performed…"
                    rows="4"
                  ></textarea>
                </div>
              </div>
              <div>
                <label>Drugs Administered</label>
                <div style="margin-top: var(--sp-2, 0.5rem);" formArrayName="drugsAdministered">
                  @for (drug of drugsArray.controls; track $index) {
                    <div class="drug-row" [formGroupName]="$index">
                      <div class="field">
                        <label>Drug Name</label>
                        <input
                          type="text"
                          class="input"
                          formControlName="drugName"
                          placeholder="e.g. Paracetamol"
                        />
                      </div>
                      <div class="field">
                        <label>Dose</label>
                        <input
                          type="text"
                          class="input"
                          formControlName="dose"
                          placeholder="500mg"
                        />
                      </div>
                      <div class="field">
                        <label>Route</label>
                        <select class="input" formControlName="route">
                          <option value="">Select</option>
                          <option value="IV">IV</option>
                          <option value="IM">IM</option>
                          <option value="SC">SC</option>
                          <option value="PO">PO (Oral)</option>
                          <option value="SL">SL</option>
                          <option value="INH">Inhaled</option>
                          <option value="TOP">Topical</option>
                        </select>
                      </div>
                      <div class="field">
                        <label>Time</label>
                        <input type="time" class="input" formControlName="time" />
                      </div>
                      <div>
                        <button type="button" class="btn-remove" (click)="removeDrug($index)">
                          ✕
                        </button>
                      </div>
                    </div>
                  }
                </div>
                <button type="button" class="btn-add" (click)="addDrug()">+ Add Drug</button>
              </div>
            </div>
          </div>
        }

        <!-- Section 5: Disposition -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-number">{{ showTreatment() ? '5' : '4' }}</span>
            <h2 class="section-title">Disposition</h2>
          </div>
          <div class="section-body">
            <div class="field" style="max-width: 280px;">
              <label for="disposition">Disposition</label>
              <select id="disposition" class="input" formControlName="disposition">
                <option value="">Select disposition</option>
                <option value="DISCHARGE">Discharge</option>
                <option value="ADMIT_ICU">Admit — ICU</option>
                <option value="ADMIT_OBSERVATION">Admit — Observation</option>
                <option value="ADMIT_WARD">Admit — Ward</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="form-footer">
          <button type="submit" class="btn-primary" [disabled]="saving()">
            {{ saving() ? 'Saving…' : isEdit ? 'Update Record' : 'Save Emergency' }}
          </button>
          <button type="button" class="btn-secondary" (click)="goBack()">Cancel</button>
        </div>
      </form>
    </div>
  `,
})
export class EmergencyFormPage implements OnInit {
  private api = inject(EmergencyApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isEdit = false;
  recordId: string | null = null;

  saving = signal(false);
  error = signal('');
  saved = signal(false);
  showTreatment = signal(false);

  form: FormGroup = this.fb.group({
    // Section 1
    patientName: ['', Validators.required],
    age: [null],
    gender: [''],
    phone: [''],
    mlcCase: [false],
    mlcNumber: [''],
    // Section 2
    triageTag: [''],
    chiefComplaint: [''],
    // Section 3
    vitals: this.fb.group({
      bp: [''],
      pulse: [null],
      temp: [null],
      spo2: [null],
      rr: [null],
      weight: [null],
    }),
    // Section 4
    attendedByDoctorName: [''],
    treatmentNotes: [''],
    drugsAdministered: this.fb.array([]),
    // Section 5
    disposition: [''],
  });

  get drugsArray(): FormArray {
    return this.form.get('drugsAdministered') as FormArray;
  }

  ngOnInit(): void {
    this.recordId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.recordId;

    if (this.isEdit && this.recordId) {
      this.showTreatment.set(true);
      this.api.getOne(this.recordId).subscribe({
        next: (data) => this.patchForm(data),
        error: () => this.error.set('Failed to load emergency record.'),
      });
    }
  }

  private patchForm(data: any): void {
    // Patch scalars
    this.form.patchValue({
      patientName: data.patientName ?? '',
      age: data.age ?? null,
      gender: data.gender ?? '',
      phone: data.phone ?? '',
      mlcCase: data.mlcCase ?? false,
      mlcNumber: data.mlcNumber ?? '',
      triageTag: data.triageTag ?? '',
      chiefComplaint: data.chiefComplaint ?? '',
      vitals: {
        bp: data.vitals?.bp ?? '',
        pulse: data.vitals?.pulse ?? null,
        temp: data.vitals?.temp ?? null,
        spo2: data.vitals?.spo2 ?? null,
        rr: data.vitals?.rr ?? null,
        weight: data.vitals?.weight ?? null,
      },
      attendedByDoctorName: data.attendedByDoctorName ?? '',
      treatmentNotes: data.treatmentNotes ?? '',
      disposition: data.disposition ?? '',
    });
    // Patch drug array
    if (Array.isArray(data.drugsAdministered)) {
      data.drugsAdministered.forEach((d: any) => this.addDrug(d));
    }
  }

  setTriage(tag: 'RED' | 'YELLOW' | 'GREEN'): void {
    this.form.get('triageTag')?.setValue(tag);
  }

  addDrug(values?: { drugName?: string; dose?: string; route?: string; time?: string }): void {
    this.drugsArray.push(
      this.fb.group({
        drugName: [values?.drugName ?? ''],
        dose: [values?.dose ?? ''],
        route: [values?.route ?? ''],
        time: [values?.time ?? ''],
      }),
    );
  }

  removeDrug(index: number): void {
    this.drugsArray.removeAt(index);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.saved.set(false);

    const payload = this.form.getRawValue();

    const req$ =
      this.isEdit && this.recordId
        ? this.api.update(this.recordId, payload)
        : this.api.create(payload);

    req$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (!this.isEdit) {
          // After first save, reveal treatment section and switch to edit mode
          this.recordId = res?.id ?? res?.data?.id ?? null;
          this.isEdit = true;
          this.saved.set(true);
          this.showTreatment.set(true);
          if (this.recordId) {
            this.router.navigate(['/emergency', this.recordId, 'edit'], { replaceUrl: true });
          }
        } else {
          this.router.navigate(['/emergency']);
        }
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save record. Please check your input and try again.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/emergency']);
  }
}
