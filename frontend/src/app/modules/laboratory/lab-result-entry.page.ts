import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';

@Component({
  selector: 'hms-lab-result-entry',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
      .page-subtitle {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
        margin: 0;
      }

      /* Order meta card */
      .meta-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-4) var(--sp-6);
        margin-bottom: var(--sp-5);
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-6);
      }
      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .meta-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .meta-value {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-800);
      }

      /* Results form */
      .results-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        margin-bottom: var(--sp-5);
      }
      .results-card-header {
        padding: var(--sp-4) var(--sp-6);
        border-bottom: 1px solid var(--border-default);
        background: var(--bg-muted);
      }
      .results-card-title {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-700);
        margin: 0;
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
        white-space: nowrap;
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

      .form-control {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-900);
        background: var(--bg-surface);
        width: 100%;
        max-width: 220px;
        transition: var(--transition-base);
      }
      .form-control:focus {
        outline: none;
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }

      .checkbox-wrap {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }
      input[type='checkbox'] {
        width: 16px;
        height: 16px;
        accent-color: var(--clr-danger-600);
        cursor: pointer;
      }
      .abnormal-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-danger-600);
      }
      .normal-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        color: var(--clr-neutral-400);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--sp-2);
        border-radius: var(--radius-full);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
      }
      .badge-warning {
        background: var(--clr-warning-100);
        color: var(--clr-warning-700);
      }
      .badge-info {
        background: var(--clr-info-100);
        color: var(--clr-info-700);
      }
      .badge-success {
        background: var(--clr-success-100);
        color: var(--clr-success-700);
      }
      .badge-neutral {
        background: var(--clr-neutral-100);
        color: var(--clr-neutral-600);
      }

      /* Actions */
      .form-actions {
        display: flex;
        gap: var(--sp-3);
        justify-content: flex-end;
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

      /* States */
      .loading-state,
      .error-state {
        text-align: center;
        padding: var(--sp-12);
        color: var(--clr-neutral-400);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
      .error-state {
        color: var(--clr-danger-500);
      }

      .success-banner {
        background: var(--clr-success-50);
        border: 1px solid var(--clr-success-200);
        border-radius: var(--radius-md);
        padding: var(--sp-3) var(--sp-4);
        margin-bottom: var(--sp-4);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-success-700);
      }
    `,
  ],
  template: `
    <div class="page-wrap">
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <div>
          <h1 class="page-title">Enter Results</h1>
          @if (order()) {
            <p class="page-subtitle">Order #{{ order().id }} — Patient {{ order().patientId }}</p>
          }
        </div>
      </div>

      @if (loadingOrder()) {
        <div class="loading-state">Loading order…</div>
      } @else if (loadError()) {
        <div class="error-state">Failed to load order. Please go back and try again.</div>
      } @else if (order()) {
        <!-- Success banner -->
        @if (saved()) {
          <div class="success-banner">Results saved successfully.</div>
        }

        <!-- Order meta -->
        <div class="meta-card">
          <div class="meta-item">
            <span class="meta-label">Patient</span>
            <span class="meta-value">{{ order().patientId }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Doctor</span>
            <span class="meta-value">{{
              order().orderedByDoctorName || order().orderedByDoctorId || '—'
            }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status</span>
            <span class="badge" [ngClass]="statusBadge(order().status)">{{
              statusLabel(order().status)
            }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">{{ order().createdAt | date: 'dd MMM yyyy' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Total</span>
            <span class="meta-value">₹{{ order().totalAmount ?? 0 }}</span>
          </div>
        </div>

        <!-- Results form -->
        <div class="results-card">
          <div class="results-card-header">
            <p class="results-card-title">Test Results</p>
          </div>
          <form [formGroup]="resultsForm">
            <div formArrayName="results">
              <table>
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Normal Range</th>
                    <th>Result Value</th>
                    <th>Abnormal?</th>
                  </tr>
                </thead>
                <tbody>
                  @for (ctrl of resultsArray.controls; track $index) {
                    <tr [formGroupName]="$index">
                      <td>
                        <strong>{{ getTestMeta($index, 'name') }}</strong>
                      </td>
                      <td>{{ getTestMeta($index, 'category') }}</td>
                      <td>{{ getTestMeta($index, 'unit') || '—' }}</td>
                      <td>{{ getTestMeta($index, 'normalRange') || '—' }}</td>
                      <td>
                        <input
                          class="form-control"
                          formControlName="value"
                          placeholder="Enter value"
                        />
                      </td>
                      <td>
                        <div class="checkbox-wrap">
                          <input
                            type="checkbox"
                            [id]="'abnormal-' + $index"
                            formControlName="isAbnormal"
                          />
                          @if (ctrl.get('isAbnormal')?.value) {
                            <label class="abnormal-label" [for]="'abnormal-' + $index"
                              >Abnormal</label
                            >
                          } @else {
                            <label class="normal-label" [for]="'abnormal-' + $index">Normal</label>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </form>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
          <button class="btn btn-primary" [disabled]="submitting()" (click)="saveResults()">
            {{ submitting() ? 'Saving…' : 'Save Results' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class LabResultPage implements OnInit {
  private labApi = inject(LabApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  order = signal<any>(null);
  loadingOrder = signal(false);
  loadError = signal(false);

  submitting = signal(false);
  saved = signal(false);

  // Parallel array that holds test metadata for display (same index as resultsArray)
  private testsMeta: any[] = [];

  resultsForm: FormGroup = this.fb.group({
    results: this.fb.array([]),
  });

  get resultsArray(): FormArray {
    return this.resultsForm.get('results') as FormArray;
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(orderId: string): void {
    this.loadingOrder.set(true);
    this.loadError.set(false);

    this.labApi.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.buildForm(order, orderId);
        this.loadingOrder.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loadingOrder.set(false);
      },
    });
  }

  buildForm(order: any, orderId: string): void {
    const tests: any[] = order.tests ?? [];
    this.testsMeta = tests;

    // Pre-load existing results if any
    this.labApi.getResults(orderId).subscribe({
      next: (existingResults: any[]) => {
        const resultMap: Record<string, any> = {};
        if (Array.isArray(existingResults)) {
          existingResults.forEach((r: any) => {
            if (r.testId) resultMap[r.testId] = r;
          });
        }

        this.resultsArray.clear();
        tests.forEach((test) => {
          const existing = resultMap[test.id] ?? {};
          this.resultsArray.push(
            this.fb.group({
              testId: [test.id],
              value: [existing.value ?? ''],
              isAbnormal: [existing.isAbnormal ?? false],
            }),
          );
        });
      },
      error: () => {
        // No existing results — build empty form rows
        this.resultsArray.clear();
        tests.forEach((test) => {
          this.resultsArray.push(
            this.fb.group({
              testId: [test.id],
              value: [''],
              isAbnormal: [false],
            }),
          );
        });
      },
    });
  }

  getTestMeta(index: number, field: string): string {
    return this.testsMeta[index]?.[field] ?? '';
  }

  saveResults(): void {
    this.submitting.set(true);
    this.saved.set(false);

    const orderId = this.order()?.id;
    const payload = { results: this.resultsForm.value.results };

    this.labApi.saveResult(orderId, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.set(true);
        // Scroll to top to show banner
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ORDERED: 'Ordered',
      SAMPLE_COLLECTED: 'Sample Collected',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    };
    return map[status] ?? status;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      ORDERED: 'badge-warning',
      SAMPLE_COLLECTED: 'badge-info',
      IN_PROGRESS: 'badge-info',
      COMPLETED: 'badge-success',
    };
    return map[status] ?? 'badge-neutral';
  }

  goBack(): void {
    this.router.navigate(['/laboratory']);
  }
}
