import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { IpdApiService } from '../../core/services/ipd-api.service';

type TabId = 'admissions' | 'bedmap';

type AdmissionStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';
type BedStatus = 'VACANT' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

@Component({
  selector: 'hms-ipd',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="ipd-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h4 class="page-title">Inpatient Department</h4>
          <p class="page-subtitle">Manage admissions, beds, and wards</p>
        </div>
        @if (activeTab === 'admissions') {
          <button class="btn btn--primary" (click)="router.navigate(['/ipd/admit'])">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Admit Patient
          </button>
        }
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          [class.tab--active]="activeTab === 'admissions'"
          (click)="setTab('admissions')"
        >
          Admissions
        </button>
        <button class="tab" [class.tab--active]="activeTab === 'bedmap'" (click)="setTab('bedmap')">
          Bed Map
        </button>
      </div>

      <!-- ADMISSIONS TAB -->
      @if (activeTab === 'admissions') {
        <div class="card">
          <!-- Filters -->
          <div class="filter-bar">
            <select
              class="filter-select"
              [(ngModel)]="filterStatus"
              (change)="loadAdmissions()"
              [ngModelOptions]="{ standalone: true }"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISCHARGED">Discharged</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
            <select
              class="filter-select"
              [(ngModel)]="filterWardId"
              (change)="loadAdmissions()"
              [ngModelOptions]="{ standalone: true }"
            >
              <option value="">All Wards</option>
              @for (ward of wards(); track ward.id) {
                <option [value]="ward.id">{{ ward.name }}</option>
              }
            </select>
            @if (loading()) {
              <span class="loading-text">Loading...</span>
            }
          </div>

          <!-- Table -->
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Adm No</th>
                  <th>Patient ID</th>
                  <th>Ward</th>
                  <th>Bed</th>
                  <th>Doctor</th>
                  <th>Admission Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (!loading() && admissions().length === 0) {
                  <tr>
                    <td colspan="8" class="empty-cell">No admissions found.</td>
                  </tr>
                }
                @for (adm of admissions(); track adm.id) {
                  <tr>
                    <td>
                      <span class="adm-no">{{ adm.admissionNumber ?? adm.id }}</span>
                    </td>
                    <td class="text-mono">{{ adm.patientId }}</td>
                    <td>{{ adm.wardName ?? adm.wardId }}</td>
                    <td>{{ adm.bedNumber ?? adm.bedId }}</td>
                    <td>{{ adm.admittingDoctorName ?? adm.admittingDoctorId ?? '—' }}</td>
                    <td>{{ formatDate(adm.admissionDate ?? adm.createdAt) }}</td>
                    <td>
                      <span class="badge" [class]="statusBadgeClass(adm.status)">{{
                        adm.status
                      }}</span>
                    </td>
                    <td>
                      <div class="action-row">
                        <button class="action-btn" title="View" (click)="viewAdmission(adm)">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        @if (adm.status === 'ACTIVE') {
                          <button
                            class="action-btn action-btn--danger"
                            title="Discharge"
                            (click)="confirmDischarge(adm)"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- BED MAP TAB -->
      @if (activeTab === 'bedmap') {
        <div class="bedmap-section">
          <!-- Ward selector -->
          <div class="ward-selector-bar">
            <label class="ward-selector-label">Select Ward</label>
            <select
              class="filter-select filter-select--ward"
              [(ngModel)]="selectedWardId"
              (change)="onWardChange()"
              [ngModelOptions]="{ standalone: true }"
            >
              <option value="">— Choose a ward —</option>
              @for (ward of wards(); track ward.id) {
                <option [value]="ward.id">{{ ward.name }}</option>
              }
            </select>
            @if (selectedWardId && beds().length > 0) {
              <span class="bed-summary">
                <span class="bed-summary__occupied">{{ occupiedCount }}</span> /
                <span class="bed-summary__total">{{ beds().length }}</span>
                <span class="bed-summary__label">occupied</span>
              </span>
            }
          </div>

          @if (!selectedWardId) {
            <div class="empty-state">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 9v11" />
                <path d="M21 20H3" />
                <rect x="5" y="9" width="14" height="11" rx="2" />
                <path d="M9 9V5a3 3 0 0 1 6 0v4" />
              </svg>
              <p>Select a ward to view its bed map.</p>
            </div>
          }

          @if (selectedWardId && bedLoading()) {
            <div class="empty-state">
              <p class="loading-text">Loading beds...</p>
            </div>
          }

          @if (selectedWardId && !bedLoading()) {
            <div class="bed-grid">
              @for (bed of beds(); track bed.id) {
                <div class="bed-card" [class]="bedCardClass(bed.status)">
                  <div class="bed-card__number">{{ bed.bedNumber ?? bed.number }}</div>
                  <div class="bed-card__status">
                    <span class="badge" [class]="bedBadgeClass(bed.status)">{{ bed.status }}</span>
                  </div>
                  @if (bed.status === 'OCCUPIED' && bed.patientName) {
                    <div class="bed-card__patient">{{ bed.patientName }}</div>
                  }
                </div>
              }
              @if (beds().length === 0) {
                <div class="empty-state empty-state--inline">
                  <p>No beds found for this ward.</p>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Discharge Confirm Dialog -->
      @if (showDischargeDialog()) {
        <div class="dialog-backdrop" (click)="cancelDischarge()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <h6 class="dialog__title">Confirm Discharge</h6>
            <p class="dialog__body">
              Discharge admission
              <strong>{{ dischargeTarget()?.admissionNumber ?? dischargeTarget()?.id }}</strong
              >? This action cannot be undone.
            </p>
            <div class="dialog__actions">
              <button class="btn btn--ghost" (click)="cancelDischarge()">Cancel</button>
              <button class="btn btn--danger" (click)="doDischarge()" [disabled]="discharging()">
                {{ discharging() ? 'Discharging…' : 'Discharge' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ipd-page {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
      }

      /* ── Page Header ── */
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--sp-3);
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

      /* ── Tabs ── */
      .tabs {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--border-default);
      }

      .tab {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-muted);
        background: none;
        border: none;
        padding: var(--sp-3) var(--sp-5);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition:
          color var(--transition-fast),
          border-color var(--transition-fast);

        &:hover {
          color: var(--text-primary);
        }

        &--active {
          color: var(--clr-primary-600);
          border-bottom-color: var(--clr-primary-600);
          font-weight: var(--fw-semibold);
        }
      }

      /* ── Card ── */
      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xs);
        overflow: hidden;
      }

      /* ── Filter Bar ── */
      .filter-bar {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid var(--border-default);
        background: var(--bg-muted);
        flex-wrap: wrap;
      }

      .filter-select {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-2) var(--sp-3);
        cursor: pointer;
        outline: none;
        transition: border-color var(--transition-fast);
        min-width: 160px;

        &:focus {
          border-color: var(--clr-primary-400);
        }
      }

      .loading-text {
        font-size: var(--text-sm);
        color: var(--text-muted);
        font-style: italic;
      }

      /* ── Table ── */
      .table-wrap {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);

        th {
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: var(--fw-medium);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: var(--sp-3) var(--sp-5);
          text-align: left;
          background: var(--bg-muted);
          white-space: nowrap;
        }

        td {
          padding: var(--sp-3) var(--sp-5);
          border-bottom: 1px solid var(--border-default);
          color: var(--text-secondary);
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover td {
          background: var(--bg-muted);
        }
      }

      .adm-no {
        font-family: var(--font-display);
        font-size: var(--text-sm);
        font-weight: var(--fw-display-bold);
        color: var(--clr-primary-600);
        background: var(--clr-primary-50);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        white-space: nowrap;
      }

      .text-mono {
        font-family: monospace;
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      .empty-cell {
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
        padding: var(--sp-8) !important;
      }

      /* ── Actions ── */
      .action-row {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }

      .action-btn {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-muted);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        cursor: pointer;
        color: var(--text-muted);
        transition: all var(--transition-fast);

        svg {
          width: 14px;
          height: 14px;
        }

        &:hover {
          background: var(--clr-primary-50);
          border-color: var(--clr-primary-300);
          color: var(--clr-primary-600);
        }

        &--danger:hover {
          background: var(--clr-danger-50);
          border-color: var(--clr-danger-300);
          color: var(--clr-danger-600);
        }
      }

      /* ── Badge ── */
      .badge {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: var(--fw-medium);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        display: inline-flex;
        align-items: center;
        white-space: nowrap;

        &--info {
          background: var(--clr-info-100);
          color: var(--clr-info-600);
        }
        &--success {
          background: var(--clr-success-100);
          color: var(--clr-success-600);
        }
        &--warning {
          background: var(--clr-warning-100);
          color: var(--clr-warning-600);
        }
        &--danger {
          background: var(--clr-danger-100);
          color: var(--clr-danger-600);
        }
        &--neutral {
          background: var(--bg-muted);
          color: var(--text-muted);
        }
      }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-4);
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

          &:hover {
            background: var(--clr-primary-700);
            border-color: var(--clr-primary-700);
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

        &--danger {
          background: var(--clr-danger-600);
          color: #fff;
          border-color: var(--clr-danger-600);

          &:hover:not(:disabled) {
            background: var(--clr-danger-700);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }

      /* ── Bed Map ── */
      .bedmap-section {
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      .ward-selector-bar {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        flex-wrap: wrap;
      }

      .ward-selector-label {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
      }

      .filter-select--ward {
        min-width: 220px;
      }

      .bed-summary {
        font-size: var(--text-sm);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .bed-summary__occupied {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-base);
        color: var(--clr-danger-600);
      }

      .bed-summary__total {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-base);
        color: var(--text-primary);
      }

      .bed-summary__label {
        color: var(--text-muted);
      }

      .bed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--sp-4);
      }

      .bed-card {
        background: var(--bg-surface);
        border: 2px solid var(--border-default);
        border-radius: var(--radius-xl);
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-2);
        box-shadow: var(--shadow-xs);
        transition: box-shadow var(--transition-fast);

        &:hover {
          box-shadow: var(--shadow-sm);
        }

        &--vacant {
          border-color: var(--clr-success-400);
          background: color-mix(in srgb, var(--clr-success-100) 40%, var(--bg-surface));
        }

        &--occupied {
          border-color: var(--clr-danger-400);
          background: color-mix(in srgb, var(--clr-danger-100) 40%, var(--bg-surface));
        }

        &--cleaning {
          border-color: var(--clr-warning-400);
          background: color-mix(in srgb, var(--clr-warning-100) 40%, var(--bg-surface));
        }

        &--maintenance {
          border-color: var(--clr-neutral-400);
          background: color-mix(in srgb, var(--clr-neutral-100) 40%, var(--bg-surface));
        }
      }

      .bed-card__number {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--fw-display-bold);
        color: var(--text-primary);
        line-height: 1;
      }

      .bed-card__status {
        display: flex;
        justify-content: center;
      }

      .bed-card__patient {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        text-align: center;
        font-weight: var(--fw-medium);
        word-break: break-word;
      }

      /* ── Empty State ── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--sp-3);
        padding: var(--sp-12);
        color: var(--text-muted);
        font-size: var(--text-sm);
        text-align: center;

        svg {
          width: 48px;
          height: 48px;
          opacity: 0.3;
        }

        &--inline {
          padding: var(--sp-6);
          grid-column: 1 / -1;
        }
      }

      /* ── Discharge Dialog ── */
      .dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--sp-4);
      }

      .dialog {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        padding: var(--sp-6);
        max-width: 420px;
        width: 100%;
      }

      .dialog__title {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: var(--fw-display-bold);
        color: var(--text-primary);
        margin-bottom: var(--sp-3);
      }

      .dialog__body {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--sp-5);

        strong {
          color: var(--text-primary);
        }
      }

      .dialog__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--sp-3);
      }
    `,
  ],
})
export class IpdPage implements OnInit {
  private api = inject(IpdApiService);
  router = inject(Router);

  activeTab: TabId = 'admissions';

  // Admissions
  admissions = signal<any[]>([]);
  wards = signal<any[]>([]);
  loading = signal(false);
  filterStatus = '';
  filterWardId = '';

  // Discharge dialog
  showDischargeDialog = signal(false);
  dischargeTarget = signal<any>(null);
  discharging = signal(false);

  // Bed map
  beds = signal<any[]>([]);
  selectedWardId = '';
  bedLoading = signal(false);

  get occupiedCount(): number {
    return this.beds().filter((b) => b.status === 'OCCUPIED').length;
  }

  ngOnInit(): void {
    this.loadWards();
    this.loadAdmissions();
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  loadWards(): void {
    this.api.listWards().subscribe({
      next: (wards) => this.wards.set(wards),
      error: () => this.wards.set([]),
    });
  }

  loadAdmissions(): void {
    this.loading.set(true);
    const q: Record<string, any> = {};
    if (this.filterStatus) q['status'] = this.filterStatus;
    if (this.filterWardId) q['wardId'] = this.filterWardId;
    this.api.listAdmissions(q).subscribe({
      next: (res) => {
        this.admissions.set(Array.isArray(res) ? res : (res.data ?? []));
        this.loading.set(false);
      },
      error: () => {
        this.admissions.set([]);
        this.loading.set(false);
      },
    });
  }

  onWardChange(): void {
    this.beds.set([]);
    if (!this.selectedWardId) return;
    this.bedLoading.set(true);
    this.api.listBeds({ wardId: this.selectedWardId }).subscribe({
      next: (beds) => {
        this.beds.set(Array.isArray(beds) ? beds : []);
        this.bedLoading.set(false);
      },
      error: () => {
        this.beds.set([]);
        this.bedLoading.set(false);
      },
    });
  }

  viewAdmission(adm: any): void {
    this.router.navigate(['/ipd', adm.id, 'edit']);
  }

  confirmDischarge(adm: any): void {
    this.dischargeTarget.set(adm);
    this.showDischargeDialog.set(true);
  }

  cancelDischarge(): void {
    this.showDischargeDialog.set(false);
    this.dischargeTarget.set(null);
  }

  doDischarge(): void {
    if (!this.dischargeTarget()) return;
    this.discharging.set(true);
    this.api.discharge(this.dischargeTarget().id).subscribe({
      next: () => {
        this.discharging.set(false);
        this.showDischargeDialog.set(false);
        this.dischargeTarget.set(null);
        this.loadAdmissions();
      },
      error: () => {
        this.discharging.set(false);
      },
    });
  }

  formatDate(val: string | Date | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  statusBadgeClass(status: AdmissionStatus): string {
    const map: Record<AdmissionStatus, string> = {
      ACTIVE: 'badge--info',
      DISCHARGED: 'badge--success',
      TRANSFERRED: 'badge--warning',
    };
    return map[status] ?? 'badge--neutral';
  }

  bedCardClass(status: BedStatus): string {
    const map: Record<BedStatus, string> = {
      VACANT: 'bed-card--vacant',
      OCCUPIED: 'bed-card--occupied',
      CLEANING: 'bed-card--cleaning',
      MAINTENANCE: 'bed-card--maintenance',
    };
    return map[status] ?? '';
  }

  bedBadgeClass(status: BedStatus): string {
    const map: Record<BedStatus, string> = {
      VACANT: 'badge--success',
      OCCUPIED: 'badge--danger',
      CLEANING: 'badge--warning',
      MAINTENANCE: 'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }
}
