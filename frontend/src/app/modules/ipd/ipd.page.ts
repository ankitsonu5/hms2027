import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IpdApiService } from '../../core/services/ipd-api.service';

type TabId = 'admissions' | 'bedmap' | 'wards';
type AdmissionStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';
type BedStatus = 'VACANT' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

@Component({
  selector: 'hms-ipd',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  styles: [
    `
      .ipd-page {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
        padding: var(--sp-6);
        background: #f8fafc;
        min-height: 100vh;
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
        font-size: var(--text-2xl);
        font-weight: var(--fw-display-bold);
        color: var(--text-primary);
        margin: 0 0 var(--sp-1) 0;
      }

      .page-subtitle {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin: 0;
      }

      /* ── KPI Summary Cards ── */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: var(--sp-4);
      }

      .kpi-card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-4) var(--sp-5);
        box-shadow: var(--shadow-xs);
        display: flex;
        align-items: center;
        gap: var(--sp-4);
      }

      .kpi-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      }

      .kpi-icon.blue { background: #eff6ff; color: #2563eb; }
      .kpi-icon.emerald { background: #ecfdf5; color: #059669; }
      .kpi-icon.amber { background: #fffbeb; color: #d97706; }
      .kpi-icon.indigo { background: #eef2ff; color: #4f46e5; }

      .kpi-value {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        line-height: 1.1;
      }

      .kpi-label {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: var(--fw-semibold);
        margin-top: 2px;
      }

      /* ── Tabs ── */
      .tabs {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--border-default);
        background: #fff;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        padding: 0 var(--sp-3);
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
        transition: all 0.2s;
      }

      .tab:hover {
        color: var(--text-primary);
      }

      .tab--active {
        color: var(--clr-primary-600);
        border-bottom-color: var(--clr-primary-600);
        font-weight: var(--fw-semibold);
      }

      /* ── Card ── */
      .card {
        background: #fff;
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
        background: #f8fafc;
        flex-wrap: wrap;
      }

      .search-input {
        flex: 1;
        min-width: 220px;
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        outline: none;
        background: #fff;
      }

      .filter-select {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        background: #fff;
        outline: none;
        color: var(--clr-neutral-700);
      }

      /* ── Table ── */
      .table-wrap {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
        text-align: left;
      }

      .table th {
        background: #f8fafc;
        color: var(--clr-neutral-600);
        font-weight: var(--fw-semibold);
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 2px solid var(--border-default);
        white-space: nowrap;
      }

      .table td {
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--border-default);
        color: var(--clr-neutral-800);
        vertical-align: middle;
      }

      .table tbody tr:hover {
        background: #f8fafc;
      }

      /* ── Bed Map Section ── */
      .bedmap-container {
        padding: var(--sp-5);
      }

      .bed-controls-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--sp-3);
        margin-bottom: var(--sp-5);
        padding-bottom: var(--sp-4);
        border-bottom: 1px solid var(--border-default);
      }

      .bed-stats-strip {
        display: flex;
        gap: var(--sp-3);
        flex-wrap: wrap;
      }

      .bed-stat-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: var(--fw-semibold);
      }

      .pill-vacant { background: #dcfce7; color: #15803d; }
      .pill-occupied { background: #fee2e2; color: #b91c1c; }
      .pill-cleaning { background: #fef3c7; color: #b45309; }
      .pill-maintenance { background: #f1f5f9; color: #475569; }

      .bed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: var(--sp-4);
      }

      .bed-tile {
        background: #fff;
        border: 2px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--sp-3);
        transition: all 0.2s;
        box-shadow: var(--shadow-xs);
      }

      .bed-tile--vacant {
        border-color: #86efac;
        background: #f0fdf4;
      }

      .bed-tile--occupied {
        border-color: #fca5a5;
        background: #fef2f2;
      }

      .bed-tile--cleaning {
        border-color: #fde047;
        background: #fefce8;
      }

      .bed-tile--maintenance {
        border-color: #cbd5e1;
        background: #f8fafc;
      }

      .bed-tile__top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .bed-tile__number {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-900);
      }

      .bed-tile__patient {
        font-size: var(--text-xs);
        color: var(--clr-neutral-700);
      }

      .bed-tile__actions {
        display: flex;
        gap: var(--sp-2);
        margin-top: var(--sp-2);
      }

      /* ── Wards Setup Grid ── */
      .ward-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--sp-5);
        padding: var(--sp-5);
      }

      .ward-card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        box-shadow: var(--shadow-xs);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--sp-4);
      }

      .ward-card__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .ward-card__title {
        font-family: var(--font-display);
        font-size: var(--text-md);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }

      .ward-card__type {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        margin-top: 2px;
      }

      /* ── Badges ── */
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: var(--fw-semibold);
      }

      .badge--active { background: #dcfce7; color: #15803d; }
      .badge--discharged { background: #f1f5f9; color: #475569; }
      .badge--vacant { background: #dcfce7; color: #15803d; }
      .badge--occupied { background: #fee2e2; color: #b91c1c; }
      .badge--cleaning { background: #fef3c7; color: #b45309; }
      .badge--maintenance { background: #f1f5f9; color: #475569; }
      .badge--ipd { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
        text-decoration: none;
      }

      .btn--primary {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .btn--primary:hover { background: var(--clr-primary-700); }

      .btn--outline {
        background: #fff;
        border-color: var(--border-default);
        color: var(--clr-neutral-700);
      }
      .btn--outline:hover { background: #f8fafc; border-color: var(--clr-neutral-400); }

      .btn--danger {
        background: #fee2e2;
        color: #b91c1c;
        border-color: #fca5a5;
      }
      .btn--danger:hover { background: #fecaca; }

      .btn--success {
        background: #dcfce7;
        color: #15803d;
        border-color: #86efac;
      }
      .btn--success:hover { background: #bbf7d0; }

      .btn--sm {
        padding: 4px 10px;
        font-size: 0.8rem;
      }

      /* ── Modal Backdrops ── */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--sp-4);
      }

      .modal-box {
        background: #fff;
        border-radius: var(--radius-xl);
        padding: var(--sp-6);
        max-width: 860px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
      }

      .form-control {
        padding: 6px 10px;
        border: 1px solid var(--border-default);
        border-radius: 4px;
        font-size: 13px;
        background: #fff;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--clr-primary-500);
      }
    `,
  ],
  template: `
    <div class="ipd-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Inpatient Department (IPD)</h2>
          <p class="page-subtitle">
            Ward &amp; Bed matrix, admission management, clinical monitoring, and inpatient billing
          </p>
        </div>
        <div style="display: flex; gap: var(--sp-3);">
          <button class="btn btn--outline" (click)="loadAdmissions(); loadAllBeds();">
            🔄 Refresh Data
          </button>
          <a routerLink="/ipd/admit" class="btn btn--primary">
            + Admit Patient
          </a>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">🏥</div>
          <div>
            <div class="kpi-value">{{ totalOccupiedBeds() }}</div>
            <div class="kpi-label">Active Inpatients</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon emerald">🛏️</div>
          <div>
            <div class="kpi-value">{{ totalVacantBeds() }}</div>
            <div class="kpi-label">Vacant Beds Available</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon amber">🏢</div>
          <div>
            <div class="kpi-value">{{ wards().length }}</div>
            <div class="kpi-label">Hospital Wards</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon indigo">📊</div>
          <div>
            <div class="kpi-value">
              {{ totalBedsCount() > 0 ? ((totalOccupiedBeds() / totalBedsCount()) * 100 | number:'1.0-0') : 0 }}%
            </div>
            <div class="kpi-label">Bed Occupancy Rate</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs">
        <button
          class="tab"
          [class.tab--active]="activeTab === 'admissions'"
          (click)="setTab('admissions')"
        >
          📋 Inpatient Admissions
        </button>
        <button
          class="tab"
          [class.tab--active]="activeTab === 'bedmap'"
          (click)="setTab('bedmap')"
        >
          🛏️ Live Bed Map &amp; Occupancy
        </button>
        <button
          class="tab"
          [class.tab--active]="activeTab === 'wards'"
          (click)="setTab('wards')"
        >
          ⚙️ Wards &amp; Beds Setup
        </button>
      </div>

      <!-- ==================== TAB 1: ADMISSIONS ==================== -->
      @if (activeTab === 'admissions') {
        <div class="card">
          <!-- Filter Bar -->
          <div class="filter-bar">
            <input
              type="text"
              class="search-input"
              [(ngModel)]="searchAdmissionQuery"
              placeholder="Search by Patient Name, UHID, Adm No, Bed, Doctor..."
            />

            <select class="filter-select" [(ngModel)]="filterStatus" (change)="loadAdmissions()">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Inpatients</option>
              <option value="DISCHARGED">Discharged</option>
            </select>

            <select class="filter-select" [(ngModel)]="filterWardId" (change)="loadAdmissions()">
              <option value="">All Wards</option>
              @for (ward of wards(); track ward.id) {
                <option [value]="ward.id">{{ ward.name }}</option>
              }
            </select>

            <button class="btn btn--outline btn--sm" (click)="loadAdmissions()">🔄 Refresh</button>
          </div>

          <!-- Table -->
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Adm No / Date</th>
                  <th>Patient Details</th>
                  <th>Ward &amp; Bed</th>
                  <th>Attending Doctor</th>
                  <th>Reason / Diagnosis</th>
                  <th>IPD Bill &amp; Financials</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (filteredAdmissions().length === 0) {
                  <tr>
                    <td colspan="8" style="text-align:center; padding:var(--sp-10); color:var(--text-muted);">
                      <div style="font-size:2rem; margin-bottom:4px;">🛏️</div>
                      <strong>No admissions found.</strong>
                      <p style="margin:4px 0 0; font-size:0.8rem;">Click "+ Admit Patient" to admit an inpatient.</p>
                    </td>
                  </tr>
                }
                @for (adm of filteredAdmissions(); track adm.id) {
                  <tr>
                    <td>
                      <div style="font-weight:bold; color:var(--clr-primary-700);">
                        {{ adm.admissionNumber || adm.id }}
                      </div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">
                        {{ adm.admissionDate | date:'mediumDate' }}
                      </div>
                    </td>

                    <td>
                      <strong>{{ adm.patientName || adm.patientId }}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted);">
                        {{ adm.patientUhid || adm.patientId }} • 📞 {{ adm.patientPhone || '—' }}
                      </div>
                    </td>

                    <td>
                      <div style="font-weight:bold;">{{ adm.wardName || 'Ward' }}</div>
                      <span class="badge badge--vacant" style="font-size:0.75rem;">
                        Bed: {{ adm.bedNumber || adm.bedId }}
                      </span>
                    </td>

                    <td>
                      <div>{{ adm.admittingDoctorName || 'Dr. Krishna P Padagala' }}</div>
                    </td>

                    <td>
                      <div>{{ adm.diagnosis || adm.admissionReason || 'Inpatient Care' }}</div>
                      @if (adm.diet) {
                        <div style="font-size:0.7rem; color:var(--text-muted);">Diet: {{ adm.diet }}</div>
                      }
                    </td>

                    <td>
                      @if (adm.billNumber) {
                        <div style="font-weight:bold; color:#6d28d9; display:flex; align-items:center; gap:4px;">
                          <span>{{ adm.billNumber }}</span>
                          <span class="badge badge--ipd" style="font-size:10px;">IPD</span>
                        </div>
                        <div style="font-size:0.75rem; color:#475569;">
                          Total: ₹{{ (adm.billGrandTotal || 0) | number:'1.2-2' }} • Paid: ₹{{ (adm.billPaidAmount || 0) | number:'1.2-2' }}
                        </div>
                        <div style="font-size:0.75rem; margin-top:1px;">
                          @if (adm.billBalanceAmount > 0) {
                            <span style="color:#dc2626; font-weight:600;">Due: ₹{{ adm.billBalanceAmount | number:'1.2-2' }}</span>
                          } @else {
                            <span style="color:#16a34a; font-weight:600;">✓ Settled</span>
                          }
                        </div>
                      } @else {
                        <div style="font-size:0.75rem; color:#475569;">Deposit: ₹{{ (adm.depositAmount || 0) | number:'1.2-2' }}</div>
                        <span style="font-size:0.7rem; color:#94a3b8;">Click Edit Bill to view</span>
                      }
                    </td>

                    <td>
                      @if (adm.status === 'ACTIVE') {
                        <span class="badge badge--active">● Active Inpatient</span>
                      } @else {
                        <span class="badge badge--discharged">✓ Discharged</span>
                      }
                    </td>

                    <td style="text-align: right;">
                      <div style="display:flex; gap:4px; justify-content:flex-end;">
                        <button
                          class="btn btn--outline btn--sm"
                          style="border-color:#7c3aed; color:#7c3aed;"
                          (click)="openEditBillModal(adm)"
                          title="Edit Inpatient Bill Amounts"
                        >
                          💰 Edit Bill
                        </button>
                        <button class="btn btn--outline btn--sm" (click)="viewAdmissionDetails(adm)">
                          👁️ View
                        </button>
                        @if (adm.status === 'ACTIVE') {
                          <button class="btn btn--danger btn--sm" (click)="confirmDischarge(adm)">
                            Discharge
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

      <!-- ==================== TAB 2: LIVE BED MAP ==================== -->
      @if (activeTab === 'bedmap') {
        <div class="card bedmap-container">
          <!-- Ward Selector and Counts Strip -->
          <div class="bed-controls-bar">
            <div style="display:flex; align-items:center; gap:var(--sp-3);">
              <label style="font-weight:bold; font-size:var(--text-sm);">Select Ward:</label>
              <select
                class="filter-select"
                [(ngModel)]="selectedWardId"
                (change)="onWardChange()"
                style="min-width: 250px;"
              >
                @for (ward of wards(); track ward.id) {
                  <option [value]="ward.id">
                    {{ ward.name }} ({{ ward.type }}) — ₹{{ (ward.dailyRate || 500) }}/day
                  </option>
                }
              </select>
            </div>

            <!-- Stats Pills for Selected Ward -->
            <div class="bed-stats-strip">
              <span class="bed-stat-pill pill-vacant">
                🟢 Vacant: {{ wardVacantCount() }}
              </span>
              <span class="bed-stat-pill pill-occupied">
                🔴 Occupied: {{ wardOccupiedCount() }}
              </span>
              <span class="bed-stat-pill pill-cleaning">
                🟡 Cleaning: {{ wardCleaningCount() }}
              </span>
              <span class="bed-stat-pill pill-maintenance">
                ⚙️ Maint: {{ wardMaintenanceCount() }}
              </span>
            </div>
          </div>

          <!-- Bed Map Grid -->
          @if (bedLoading()) {
            <div style="text-align:center; padding:var(--sp-12); color:var(--text-muted);">
              Loading ward beds...
            </div>
          } @else if (beds().length === 0) {
            <div style="text-align:center; padding:var(--sp-12); color:var(--text-muted);">
              <p>No beds found in this ward.</p>
              <button class="btn btn--primary btn--sm" (click)="openAddBedModal(selectedWardId)">
                + Add Bed to Ward
              </button>
            </div>
          } @else {
            <div class="bed-grid">
              @for (bed of beds(); track bed.id) {
                <div class="bed-tile" [class]="'bed-tile--' + bed.status.toLowerCase()">
                  <div>
                    <div class="bed-tile__top">
                      <div class="bed-tile__number">🛏️ {{ bed.bedNumber }}</div>
                      <span class="badge" [class]="'badge--' + bed.status.toLowerCase()">
                        {{ bed.status }}
                      </span>
                    </div>

                    @if (bed.status === 'OCCUPIED') {
                      <div class="bed-tile__patient" style="margin-top:8px;">
                        <strong style="font-size:0.85rem; color:#0f172a;">{{ bed.patientName || 'Admitted Patient' }}</strong>
                        <div style="font-size:0.75rem; color:#475569;">
                          {{ bed.patientUhid || 'Inpatient' }} • {{ bed.admissionNumber }}
                        </div>
                        <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">
                          Dr. {{ bed.admittingDoctorName || 'Consultant' }}
                        </div>
                      </div>
                    } @else if (bed.status === 'CLEANING') {
                      <div style="font-size:0.75rem; color:#b45309; margin-top:6px;">
                        🧹 Sanitization &amp; Linen Change in progress
                      </div>
                    } @else if (bed.status === 'MAINTENANCE') {
                      <div style="font-size:0.75rem; color:#475569; margin-top:6px;">
                        🔧 Bed under maintenance
                      </div>
                    } @else {
                      <div style="font-size:0.75rem; color:#15803d; margin-top:6px;">
                        ✓ Clean &amp; Ready for admission
                      </div>
                    }
                  </div>

                  <!-- Quick Action Buttons on Bed Tile -->
                  <div class="bed-tile__actions">
                    @if (bed.status === 'VACANT') {
                      <button
                        class="btn btn--primary btn--sm"
                        style="width:100%;"
                        (click)="admitIntoBed(bed)"
                      >
                        + Admit Here
                      </button>
                    } @else if (bed.status === 'CLEANING') {
                      <button
                        class="btn btn--success btn--sm"
                        style="width:100%;"
                        (click)="setBedStatus(bed, 'VACANT')"
                      >
                        ✓ Mark Vacant / Ready
                      </button>
                    } @else if (bed.status === 'MAINTENANCE') {
                      <button
                        class="btn btn--outline btn--sm"
                        style="width:100%;"
                        (click)="setBedStatus(bed, 'VACANT')"
                      >
                        ✓ Restore to Vacant
                      </button>
                    } @else if (bed.status === 'OCCUPIED') {
                      <div style="display:flex; gap:4px; width:100%;">
                        @if (bed.admissionId) {
                          <button
                            class="btn btn--outline btn--sm"
                            style="flex:1; border-color:#7c3aed; color:#7c3aed;"
                            (click)="openEditBillModal({ id: bed.admissionId, patientName: bed.patientName })"
                            title="Edit Inpatient Bill Amounts"
                          >
                            💰 Bill
                          </button>
                        }
                        <button
                          class="btn btn--outline btn--sm"
                          style="flex:1;"
                          (click)="setBedStatus(bed, 'CLEANING')"
                        >
                          Free / Clean
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ==================== TAB 3: WARDS & BEDS SETUP ==================== -->
      @if (activeTab === 'wards') {
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--sp-4) var(--sp-5); border-bottom:1px solid var(--border-default); background:#f8fafc;">
            <div>
              <h3 style="margin:0; font-size:var(--text-md); font-family:var(--font-display);">Hospital Wards &amp; Bed Units</h3>
              <p style="margin:2px 0 0; font-size:var(--text-xs); color:var(--text-muted);">Configure wards, capacities, daily tariffs, and bed inventories</p>
            </div>
            <button class="btn btn--primary btn--sm" (click)="openAddWardModal()">
              + Create New Ward
            </button>
          </div>

          <div class="ward-cards-grid">
            @for (w of wards(); track w.id) {
              <div class="ward-card">
                <div class="ward-card__header">
                  <div>
                    <h4 class="ward-card__title">{{ w.name }}</h4>
                    <span class="ward-card__type">{{ w.type }} WARD</span>
                  </div>
                  <span class="badge badge--active" style="font-size:0.75rem;">
                    Active
                  </span>
                </div>

                <div style="display:flex; flex-direction:column; gap:6px; font-size:var(--text-sm);">
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Configured Capacity:</span>
                    <strong>{{ w.totalBeds }} Beds</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Daily Bed Tariff:</span>
                    <strong style="color:var(--clr-primary-700);">₹{{ (w.dailyRate || 500) | number:'1.2-2' }} / day</strong>
                  </div>
                </div>

                <div style="display:flex; gap:var(--sp-2); justify-content:flex-end; border-top:1px solid var(--border-default); padding-top:var(--sp-3);">
                  <button class="btn btn--outline btn--sm" (click)="goToWardBedMap(w.id)">
                    👁️ View Beds
                  </button>
                  <button class="btn btn--outline btn--sm" (click)="openAddBedModal(w.id)">
                    + Add Bed
                  </button>
                  <button class="btn btn--danger btn--sm" (click)="deleteWard(w)">
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ==================== EDIT IPD BILL MODAL ==================== -->
      @if (showEditBillModal()) {
        <div class="modal-backdrop" (click)="closeEditBillModal()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
              <div>
                <h3 style="margin:0; font-size:18px; color:#1e293b;">
                  Edit IPD Inpatient Bill: {{ currentBill()?.billNumber || 'Bill Details' }}
                  <span class="badge badge--ipd" style="margin-left:6px;">Inpatient Stay</span>
                </h3>
                <div style="font-size:13px; color:#64748b; margin-top:2px;">
                  Patient: <strong>{{ currentAdmissionForBill()?.patientName }}</strong>
                  @if (currentAdmissionForBill()?.wardName) {
                    • Ward: {{ currentAdmissionForBill()?.wardName }} ({{ currentAdmissionForBill()?.bedNumber }})
                  }
                </div>
              </div>
              <button class="btn btn--outline btn--sm" (click)="closeEditBillModal()">✕ Close</button>
            </div>

            <!-- Items Table -->
            <div style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <label style="font-weight:600; font-size:14px; color:#334155;">Inpatient Services, Bed Charges &amp; Medications</label>
                <button class="btn btn--outline btn--sm" type="button" (click)="addEditBillItem()">
                  + Add Line Item / Charge
                </button>
              </div>

              <div style="border:1px solid #e2e8f0; border-radius:6px; overflow:hidden;">
                <table style="width:100%; font-size:13px;">
                  <thead style="background:#f8fafc;">
                    <tr>
                      <th style="padding:8px 12px;">Description</th>
                      <th style="padding:8px 12px; width:130px;">Category</th>
                      <th style="padding:8px 12px; width:70px;">Qty</th>
                      <th style="padding:8px 12px; width:110px;">Unit Price (₹)</th>
                      <th style="padding:8px 12px; width:110px; text-align:right;">Amount (₹)</th>
                      <th style="padding:8px 12px; width:50px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of editBillItems; track $index) {
                      <tr>
                        <td style="padding:6px 12px;">
                          <input
                            type="text"
                            class="form-control"
                            style="width:100%; padding:4px 8px; font-size:13px;"
                            [(ngModel)]="item.description"
                            (ngModelChange)="recalcBillTotals()"
                          />
                        </td>
                        <td style="padding:6px 12px;">
                          <select
                            class="form-control"
                            style="width:100%; padding:4px 8px; font-size:12px;"
                            [(ngModel)]="item.category"
                          >
                            <option value="BED">Bed Tariff</option>
                            <option value="CONSULTATION">Consultation</option>
                            <option value="PROCEDURE">Procedure / Nursing</option>
                            <option value="PHARMACY">Pharmacy</option>
                            <option value="LAB">Lab / Test</option>
                            <option value="OTHER">Other / Fee</option>
                          </select>
                        </td>
                        <td style="padding:6px 12px;">
                          <input
                            type="number"
                            min="1"
                            class="form-control"
                            style="width:100%; padding:4px 8px; font-size:13px;"
                            [(ngModel)]="item.quantity"
                            (ngModelChange)="recalcBillTotals()"
                          />
                        </td>
                        <td style="padding:6px 12px;">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            class="form-control"
                            style="width:100%; padding:4px 8px; font-size:13px;"
                            [(ngModel)]="item.unitPrice"
                            (ngModelChange)="recalcBillTotals()"
                          />
                        </td>
                        <td style="padding:6px 12px; text-align:right; font-weight:600;">
                          ₹{{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                        </td>
                        <td style="padding:6px 12px; text-align:center;">
                          <button
                            type="button"
                            (click)="removeEditBillItem($index)"
                            style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:14px;"
                            title="Remove charge"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    }
                    @if (editBillItems.length === 0) {
                      <tr>
                        <td colspan="6" style="text-align:center; padding:16px; color:#94a3b8;">
                          No items added yet. Click "+ Add Line Item / Charge" to add items.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Financial Summary Box -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:16px;">
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
                <div>
                  <label style="font-size:12px; color:#475569; font-weight:600;">Total Inpatient Bill (₹)</label>
                  <div style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:4px;">
                    ₹{{ editBillGrandTotal | number:'1.2-2' }}
                  </div>
                </div>

                <div>
                  <label style="font-size:12px; color:#475569; font-weight:600;">Paid / Deposit Received (₹) <span style="color:#2563eb;">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    style="font-size:16px; font-weight:bold; color:#15803d; width:100%; margin-top:4px;"
                    [(ngModel)]="editBillPaidAmount"
                    (ngModelChange)="recalcBillTotals()"
                  />
                </div>

                <div>
                  <label style="font-size:12px; color:#475569; font-weight:600;">Outstanding Balance Due (₹)</label>
                  <div
                    style="font-size:22px; font-weight:bold; margin-top:4px;"
                    [style.color]="editBillBalanceAmount > 0 ? '#dc2626' : '#16a34a'"
                  >
                    ₹{{ editBillBalanceAmount | number:'1.2-2' }}
                    @if (editBillBalanceAmount <= 0) {
                      <span style="font-size:12px; color:#16a34a; font-weight:normal; margin-left:6px;">✓ Fully Settled</span>
                    }
                  </div>
                </div>
              </div>

              <div style="margin-top:12px;">
                <label style="font-size:12px; color:#475569; font-weight:600;">Billing Notes / Inpatient Remarks</label>
                <input
                  type="text"
                  class="form-control"
                  style="width:100%; margin-top:4px;"
                  [(ngModel)]="editBillNotes"
                  placeholder="e.g. Bed tariff updated, emergency cardiac charges added, discharge clearance"
                />
              </div>
            </div>

            @if (editBillError) {
              <div style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:13px;">
                {{ editBillError }}
              </div>
            }

            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button class="btn btn--outline" type="button" (click)="closeEditBillModal()">Cancel</button>
              <button
                class="btn btn--primary"
                type="button"
                [disabled]="editBillSaving"
                (click)="saveEditBill()"
              >
                {{ editBillSaving ? 'Saving Updates…' : '💾 Save IPD Bill Changes' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Add Ward Modal -->
      @if (showAddWardModal()) {
        <div class="modal-backdrop" (click)="closeAddWardModal()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 style="margin:0 0 var(--sp-3) 0; font-family:var(--font-display);">Create New Ward</h3>

            <div style="display:flex; flex-direction:column; gap:var(--sp-3); margin-bottom:var(--sp-4);">
              <div>
                <label style="font-size:var(--text-xs); font-weight:bold; display:block; margin-bottom:4px;">
                  Ward Name <span style="color:red;">*</span>
                </label>
                <input
                  type="text"
                  class="search-input"
                  style="width:100%;"
                  [(ngModel)]="newWardName"
                  placeholder="e.g. Cardiac Care Ward or Deluxe Suite"
                />
              </div>

              <div>
                <label style="font-size:var(--text-xs); font-weight:bold; display:block; margin-bottom:4px;">
                  Ward Type <span style="color:red;">*</span>
                </label>
                <select class="filter-select" style="width:100%;" [(ngModel)]="newWardType">
                  <option value="GENERAL">General Ward</option>
                  <option value="ICU">ICU / CCU</option>
                  <option value="PRIVATE">Private Deluxe</option>
                  <option value="SURGICAL">Surgical &amp; Recovery</option>
                  <option value="MATERNITY">Maternity &amp; Neonatal</option>
                  <option value="PAEDIATRICS">Paediatrics</option>
                </select>
              </div>

              <div>
                <label style="font-size:var(--text-xs); font-weight:bold; display:block; margin-bottom:4px;">
                  Daily Bed Tariff (₹) <span style="color:red;">*</span>
                </label>
                <input
                  type="number"
                  class="search-input"
                  style="width:100%;"
                  [(ngModel)]="newWardDailyRate"
                  placeholder="e.g. 1500"
                />
              </div>

              <div>
                <label style="font-size:var(--text-xs); font-weight:bold; display:block; margin-bottom:4px;">
                  Initial Beds Count (Auto-generated)
                </label>
                <input
                  type="number"
                  class="search-input"
                  style="width:100%;"
                  [(ngModel)]="newWardTotalBeds"
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:var(--sp-2);">
              <button class="btn btn--outline" (click)="closeAddWardModal()">Cancel</button>
              <button class="btn btn--primary" (click)="saveNewWard()">Create Ward</button>
            </div>
          </div>
        </div>
      }

      <!-- Add Bed Modal -->
      @if (showAddBedModal()) {
        <div class="modal-backdrop" (click)="closeAddBedModal()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 style="margin:0 0 var(--sp-3) 0; font-family:var(--font-display);">Add Bed to Ward</h3>

            <div style="display:flex; flex-direction:column; gap:var(--sp-3); margin-bottom:var(--sp-4);">
              <div>
                <label style="font-size:var(--text-xs); font-weight:bold; display:block; margin-bottom:4px;">
                  Select Ward <span style="color:red;">*</span>
                </label>
                <select class="filter-select" style="width:100%;" [(ngModel)]="addBedWardId">
                  @for (w of wards(); track w.id) {
                    <option [value]="w.id">{{ w.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label style="font-size:var(--text-xs); font-weight:bold; display:block; margin-bottom:4px;">
                  Bed Number / Identifier <span style="color:red;">*</span>
                </label>
                <input
                  type="text"
                  class="search-input"
                  style="width:100%;"
                  [(ngModel)]="newBedNumber"
                  placeholder="e.g. GM-11 or ICU-07"
                />
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:var(--sp-2);">
              <button class="btn btn--outline" (click)="closeAddBedModal()">Cancel</button>
              <button class="btn btn--primary" (click)="saveNewBed()">Add Bed</button>
            </div>
          </div>
        </div>
      }

      <!-- View Admission Details Modal -->
      @if (selectedAdmission()) {
        <div class="modal-backdrop" (click)="closeAdmissionDetails()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-default); padding-bottom:var(--sp-3); margin-bottom:var(--sp-4);">
              <h3 style="margin:0; font-family:var(--font-display);">
                Inpatient File: {{ selectedAdmission()?.admissionNumber }}
              </h3>
              <button class="btn btn--outline btn--sm" (click)="closeAdmissionDetails()">✕</button>
            </div>

            <div style="font-size:var(--text-sm); display:flex; flex-direction:column; gap:var(--sp-3);">
              <div>
                <span style="color:var(--text-muted); font-size:var(--text-xs);">PATIENT &amp; ADMISSION</span>
                <div style="font-weight:bold; font-size:var(--text-md);">{{ selectedAdmission()?.patientName }} ({{ selectedAdmission()?.patientUhid || selectedAdmission()?.patientId }})</div>
                <div>Admitted on: {{ selectedAdmission()?.admissionDate | date:'medium' }}</div>
              </div>

              <div style="background:#f8fafc; padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid var(--border-default);">
                <div>Ward: <strong>{{ selectedAdmission()?.wardName }}</strong></div>
                <div>Bed: <strong>{{ selectedAdmission()?.bedNumber }}</strong></div>
                <div>Attending Doctor: <strong>{{ selectedAdmission()?.admittingDoctorName }}</strong></div>
              </div>

              <!-- Financial Box inside Dossier -->
              <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:var(--radius-md); padding:var(--sp-4);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <strong style="color:#6d28d9;">Inpatient Billing &amp; Deposit Summary</strong>
                  <button
                    class="btn btn--outline btn--sm"
                    style="border-color:#7c3aed; color:#7c3aed;"
                    (click)="openEditBillModal(selectedAdmission())"
                  >
                    ✏️ Manage Bill Amounts
                  </button>
                </div>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; font-size:13px;">
                  <div>
                    <span style="color:#64748b; font-size:11px;">BILL TOTAL</span>
                    <div style="font-weight:bold; font-size:16px;">₹{{ (selectedAdmission()?.billGrandTotal || selectedAdmission()?.depositAmount || 0) | number:'1.2-2' }}</div>
                  </div>
                  <div>
                    <span style="color:#64748b; font-size:11px;">PAID / DEPOSIT</span>
                    <div style="font-weight:bold; font-size:16px; color:#15803d;">₹{{ (selectedAdmission()?.billPaidAmount || selectedAdmission()?.depositAmount || 0) | number:'1.2-2' }}</div>
                  </div>
                  <div>
                    <span style="color:#64748b; font-size:11px;">BALANCE DUE</span>
                    <div style="font-weight:bold; font-size:16px; color:#dc2626;">₹{{ (selectedAdmission()?.billBalanceAmount || 0) | number:'1.2-2' }}</div>
                  </div>
                </div>
              </div>

              <div>
                <strong>Diagnosis &amp; Clinical Notes:</strong>
                <p style="margin:4px 0 0; color:var(--text-secondary);">
                  {{ selectedAdmission()?.diagnosis || selectedAdmission()?.admissionReason || 'Clinical in-patient observation.' }}
                </p>
              </div>

              @if (selectedAdmission()?.attendantName) {
                <div>
                  <strong>Attendant / Guardian:</strong>
                  <div>{{ selectedAdmission()?.attendantName }} ({{ selectedAdmission()?.attendantRelation }}) • 📞 {{ selectedAdmission()?.attendantPhone }}</div>
                </div>
              }
            </div>

            <div style="margin-top:var(--sp-5); display:flex; justify-content:flex-end;">
              <button class="btn btn--primary" (click)="closeAdmissionDetails()">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Discharge Confirm Dialog -->
      @if (showDischargeDialog()) {
        <div class="modal-backdrop" (click)="cancelDischarge()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 style="margin:0 0 var(--sp-2) 0; font-family:var(--font-display);">Confirm Discharge</h3>
            <p style="font-size:var(--text-sm); color:var(--text-secondary); line-height:1.5;">
              Are you sure you want to discharge patient <strong>{{ dischargeTarget()?.patientName }}</strong> ({{ dischargeTarget()?.admissionNumber }})?
              The assigned bed will automatically be released and marked for cleaning.
            </p>

            <div style="display:flex; justify-content:flex-end; gap:var(--sp-3); margin-top:var(--sp-5);">
              <button class="btn btn--outline" (click)="cancelDischarge()">Cancel</button>
              <button class="btn btn--danger" (click)="doDischarge()" [disabled]="discharging()">
                {{ discharging() ? 'Discharging…' : 'Confirm Discharge' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class IpdPage implements OnInit {
  private api = inject(IpdApiService);
  router = inject(Router);

  activeTab: TabId = 'admissions';

  // Admissions list
  admissions = signal<any[]>([]);
  wards = signal<any[]>([]);
  loading = signal(false);
  filterStatus = '';
  filterWardId = '';
  searchAdmissionQuery = '';

  // Discharge Dialog
  showDischargeDialog = signal(false);
  dischargeTarget = signal<any>(null);
  discharging = signal(false);

  // Admission View
  selectedAdmission = signal<any | null>(null);

  // Bed Map
  beds = signal<any[]>([]);
  allHospitalBeds = signal<any[]>([]);
  selectedWardId = '';
  bedLoading = signal(false);

  // Wards & Bed Modals
  showAddWardModal = signal(false);
  newWardName = '';
  newWardType = 'GENERAL';
  newWardDailyRate = 500;
  newWardTotalBeds = 10;

  showAddBedModal = signal(false);
  addBedWardId = '';
  newBedNumber = '';

  // Edit IPD Bill Modal state
  showEditBillModal = signal(false);
  currentBill = signal<any | null>(null);
  currentAdmissionForBill = signal<any | null>(null);
  editBillItems: any[] = [];
  editBillGrandTotal = 0;
  editBillPaidAmount = 0;
  editBillBalanceAmount = 0;
  editBillNotes = '';
  editBillSaving = false;
  editBillError = '';

  ngOnInit(): void {
    this.loadWards();
    this.loadAdmissions();
    this.loadAllBeds();
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
    if (tab === 'bedmap') {
      if (!this.selectedWardId && this.wards().length > 0) {
        this.selectedWardId = this.wards()[0].id;
      }
      this.onWardChange();
    }
  }

  loadWards(): void {
    this.api.listWards().subscribe({
      next: (wards) => {
        this.wards.set(wards);
        if (!this.selectedWardId && wards.length > 0) {
          this.selectedWardId = wards[0].id;
        }
      },
      error: () => this.wards.set([]),
    });
  }

  loadAllBeds(): void {
    this.api.listBeds().subscribe({
      next: (beds) => this.allHospitalBeds.set(beds || []),
      error: () => this.allHospitalBeds.set([]),
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

  filteredAdmissions = computed(() => {
    let list = this.admissions();
    const q = this.searchAdmissionQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          (a.patientName && a.patientName.toLowerCase().includes(q)) ||
          (a.patientId && a.patientId.toLowerCase().includes(q)) ||
          (a.admissionNumber && a.admissionNumber.toLowerCase().includes(q)) ||
          (a.bedNumber && a.bedNumber.toLowerCase().includes(q)) ||
          (a.admittingDoctorName && a.admittingDoctorName.toLowerCase().includes(q)) ||
          (a.billNumber && a.billNumber.toLowerCase().includes(q)),
      );
    }
    return list;
  });

  totalBedsCount = computed(() => this.allHospitalBeds().length);
  totalVacantBeds = computed(() => this.allHospitalBeds().filter((b) => b.status === 'VACANT').length);
  totalOccupiedBeds = computed(() => this.allHospitalBeds().filter((b) => b.status === 'OCCUPIED').length);

  wardVacantCount = computed(() => this.beds().filter((b) => b.status === 'VACANT').length);
  wardOccupiedCount = computed(() => this.beds().filter((b) => b.status === 'OCCUPIED').length);
  wardCleaningCount = computed(() => this.beds().filter((b) => b.status === 'CLEANING').length);
  wardMaintenanceCount = computed(() => this.beds().filter((b) => b.status === 'MAINTENANCE').length);

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

  setBedStatus(bed: any, newStatus: string): void {
    this.api.updateBedStatus(bed.id, newStatus).subscribe({
      next: () => {
        this.onWardChange();
        this.loadAllBeds();
      },
    });
  }

  admitIntoBed(bed: any): void {
    this.router.navigate(['/ipd/admit'], {
      queryParams: { wardId: this.selectedWardId, bedId: bed.id },
    });
  }

  viewAdmissionDetails(adm: any): void {
    this.selectedAdmission.set(adm);
  }

  closeAdmissionDetails(): void {
    this.selectedAdmission.set(null);
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
        this.loadAllBeds();
        if (this.activeTab === 'bedmap') {
          this.onWardChange();
        }
      },
      error: () => {
        this.discharging.set(false);
      },
    });
  }

  // ─── Edit IPD Bill Modal Logic ──────────────────────────────────────────────

  openEditBillModal(adm: any): void {
    this.currentAdmissionForBill.set(adm);
    this.editBillError = '';
    this.showEditBillModal.set(true);

    this.api.getAdmissionBill(adm.id).subscribe({
      next: (bill) => {
        this.currentBill.set(bill);
        this.editBillItems = Array.isArray(bill.items)
          ? bill.items.map((it: any) => ({
              description: it.description || '',
              category: it.category || 'OTHER',
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || 0,
            }))
          : [];
        if (this.editBillItems.length === 0) {
          this.editBillItems.push({
            description: `Bed Tariff - ${adm.wardName || 'Ward'} (${adm.bedNumber || 'Bed'})`,
            category: 'BED',
            quantity: 1,
            unitPrice: Number(adm.wardDailyRate || 500),
          });
        }
        this.editBillPaidAmount = Number(bill.paidAmount) || 0;
        this.editBillNotes = bill.notes || '';
        this.recalcBillTotals();
      },
      error: (err) => {
        this.editBillError = err?.error?.message ?? 'Failed to load admission bill.';
      },
    });
  }

  closeEditBillModal(): void {
    this.showEditBillModal.set(false);
    this.currentBill.set(null);
    this.currentAdmissionForBill.set(null);
    this.editBillItems = [];
    this.editBillError = '';
  }

  addEditBillItem(): void {
    const adm = this.currentAdmissionForBill();
    this.editBillItems.push({
      description: 'Consultant Round / Medical Service',
      category: 'CONSULTATION',
      quantity: 1,
      unitPrice: 500,
    });
    this.recalcBillTotals();
  }

  removeEditBillItem(index: number): void {
    this.editBillItems.splice(index, 1);
    this.recalcBillTotals();
  }

  recalcBillTotals(): void {
    const sum = this.editBillItems.reduce((acc, it) => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.unitPrice) || 0;
      return acc + q * p;
    }, 0);
    this.editBillGrandTotal = parseFloat(sum.toFixed(2));
    const paid = Number(this.editBillPaidAmount) || 0;
    this.editBillBalanceAmount = Math.max(0, parseFloat((this.editBillGrandTotal - paid).toFixed(2)));
  }

  saveEditBill(): void {
    const adm = this.currentAdmissionForBill();
    if (!adm) return;

    this.editBillSaving = true;
    this.editBillError = '';

    const payload = {
      items: this.editBillItems.map((it) => ({
        description: it.description || 'Service',
        category: it.category || 'OTHER',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
      })),
      grandTotal: this.editBillGrandTotal,
      paidAmount: Number(this.editBillPaidAmount) || 0,
      notes: this.editBillNotes,
    };

    this.api.updateAdmissionBill(adm.id, payload).subscribe({
      next: () => {
        this.editBillSaving = false;
        this.closeEditBillModal();
        this.loadAdmissions();
      },
      error: (err) => {
        this.editBillSaving = false;
        this.editBillError = err?.error?.message ?? 'Failed to save bill changes.';
      },
    });
  }

  // Wards Setup Modal Handlers
  openAddWardModal(): void {
    this.newWardName = '';
    this.newWardType = 'GENERAL';
    this.newWardDailyRate = 500;
    this.newWardTotalBeds = 10;
    this.showAddWardModal.set(true);
  }

  closeAddWardModal(): void {
    this.showAddWardModal.set(false);
  }

  saveNewWard(): void {
    if (!this.newWardName.trim()) {
      alert('Please enter a ward name');
      return;
    }
    this.api
      .createWard({
        name: this.newWardName.trim(),
        type: this.newWardType,
        dailyRate: Number(this.newWardDailyRate || 500),
        totalBeds: Number(this.newWardTotalBeds || 0),
      })
      .subscribe({
        next: () => {
          this.closeAddWardModal();
          this.loadWards();
          this.loadAllBeds();
        },
      });
  }

  deleteWard(w: any): void {
    if (confirm(`Are you sure you want to remove ${w.name}?`)) {
      this.api.deleteWard(w.id).subscribe({
        next: () => {
          this.loadWards();
          this.loadAllBeds();
        },
      });
    }
  }

  openAddBedModal(wardId?: string): void {
    this.addBedWardId = wardId || (this.wards().length > 0 ? this.wards()[0].id : '');
    this.newBedNumber = '';
    this.showAddBedModal.set(true);
  }

  closeAddBedModal(): void {
    this.showAddBedModal.set(false);
  }

  saveNewBed(): void {
    if (!this.newBedNumber.trim() || !this.addBedWardId) {
      alert('Please enter a bed number and select a ward');
      return;
    }
    this.api
      .createBed({
        wardId: this.addBedWardId,
        bedNumber: this.newBedNumber.trim(),
        status: 'VACANT',
      })
      .subscribe({
        next: () => {
          this.closeAddBedModal();
          this.loadAllBeds();
          if (this.selectedWardId === this.addBedWardId) {
            this.onWardChange();
          }
        },
      });
  }

  goToWardBedMap(wardId: string): void {
    this.selectedWardId = wardId;
    this.activeTab = 'bedmap';
    this.onWardChange();
  }
}
