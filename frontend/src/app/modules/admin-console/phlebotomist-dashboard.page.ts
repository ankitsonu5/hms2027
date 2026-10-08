import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PhlebotomistApiService, PhlebotomistModel } from '../../core/services/phlebotomist-api.service';

interface SamplePickupTask {
  id: string;
  patientName: string;
  patientAgeGender: string;
  patientPhone: string;
  address: string;
  scheduledTime: string;
  tests: string;
  tubesRequired: string;
  status: 'SCHEDULED' | 'COLLECTED' | 'IN_TRANSIT' | 'DELIVERED_TO_LAB';
}

@Component({
  selector: 'hms-phlebotomist-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  styles: [
    `
      .page-container {
        padding: var(--sp-6);
        background: #f8fafc;
        min-height: 100vh;
        font-family: var(--font-body, system-ui, sans-serif);
      }

      .breadcrumbs {
        font-size: 13px;
        color: #64748b;
        margin-bottom: var(--sp-2);
      }
      .breadcrumbs strong {
        color: #0f172a;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--sp-6);
        gap: var(--sp-4);
        flex-wrap: wrap;
      }
      .page-title {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px 0;
      }
      .page-subtitle {
        font-size: 13px;
        color: #64748b;
        margin: 0;
      }

      /* KPI Cards */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--sp-4);
        margin-bottom: var(--sp-6);
      }
      .kpi-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: var(--sp-4);
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
      }
      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      }
      .kpi-icon.blue { background: #eff6ff; color: #2563eb; }
      .kpi-icon.green { background: #f0fdf4; color: #16a34a; }
      .kpi-icon.amber { background: #fefce8; color: #ca8a04; }
      .kpi-icon.purple { background: #faf5ff; color: #9333ea; }

      .kpi-value {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
      }
      .kpi-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        margin-top: 2px;
      }

      /* Filter Toolbar */
      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        margin-bottom: var(--sp-6);
      }
      .toolbar {
        padding: var(--sp-4);
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--sp-3);
        background: #ffffff;
      }
      .search-box {
        position: relative;
        flex: 1;
        min-width: 260px;
        max-width: 420px;
      }
      .search-box input {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 13px;
        background: #f8fafc;
        outline: none;
        transition: border-color 0.15s, background-color 0.15s;
      }
      .search-box input:focus {
        border-color: #2563eb;
        background: #fff;
      }
      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
        font-size: 14px;
      }
      .filter-group {
        display: flex;
        gap: var(--sp-2);
        align-items: center;
        flex-wrap: wrap;
      }
      .filter-select {
        padding: 7px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 13px;
        background: #fff;
        color: #334155;
        outline: none;
        cursor: pointer;
      }

      /* Status Badges */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .status-badge.available { background: #dcfce7; color: #15803d; }
      .status-badge.on_field { background: #e0f2fe; color: #0369a1; }
      .status-badge.off_duty { background: #f1f5f9; color: #475569; }
      .status-badge.on_leave { background: #fee2e2; color: #b91c1c; }

      /* Table */
      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th {
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        text-align: left;
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
      }
      td {
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
      }
      tbody tr {
        transition: background-color 0.1s ease;
      }
      tbody tr:hover {
        background-color: #f8fafc;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 13px;
        flex-shrink: 0;
      }
      .phlebo-meta {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .phlebo-name {
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 2px;
      }
      .phlebo-id {
        font-size: 11px;
        color: #64748b;
        background: #f1f5f9;
        padding: 1px 6px;
        border-radius: 4px;
        display: inline-block;
      }

      .zone-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #1e293b;
        font-weight: 500;
      }
      .vehicle-info {
        font-size: 12px;
        color: #64748b;
      }

      .progress-bar-container {
        width: 110px;
        background: #e2e8f0;
        border-radius: 9999px;
        height: 6px;
        overflow: hidden;
        margin-top: 4px;
      }
      .progress-bar-fill {
        height: 100%;
        background: #2563eb;
        border-radius: 9999px;
      }

      /* Buttons */
      .btn {
        padding: 7px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid transparent;
        transition: all 0.15s ease;
      }
      .btn-primary { background: #2563eb; color: #fff; border-color: #2563eb; }
      .btn-primary:hover { background: #1d4ed8; }
      .btn-outline { background: #fff; border-color: #cbd5e1; color: #334155; }
      .btn-outline:hover { background: #f1f5f9; border-color: #94a3b8; }
      .btn-sm { padding: 4px 10px; font-size: 12px; }
      .btn-icon { padding: 6px; color: #64748b; background: transparent; border: none; cursor: pointer; border-radius: 4px; }
      .btn-icon:hover { background: #f1f5f9; color: #0f172a; }
      .action-btns { display: flex; gap: 6px; align-items: center; }

      /* Slide-out Drawer */
      .drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.35);
        z-index: 1000;
        display: flex;
        justify-content: flex-end;
      }
      .drawer {
        width: 100%;
        max-width: 520px;
        background: #fff;
        height: 100vh;
        overflow-y: auto;
        box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
      }
      .drawer-header {
        padding: 16px 20px;
        background: #0f172a;
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .drawer-body {
        padding: 20px;
        flex: 1;
      }

      .task-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .task-patient {
        font-weight: 600;
        color: #0f172a;
        font-size: 14px;
      }
      .task-time {
        font-size: 12px;
        color: #2563eb;
        font-weight: 600;
        background: #eff6ff;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .task-detail {
        font-size: 12px;
        color: #475569;
        margin-top: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .kit-box {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 12px 14px;
        margin-bottom: 18px;
      }
      .kit-title {
        font-size: 13px;
        font-weight: 700;
        color: #1e40af;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .kit-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .kit-tag {
        font-size: 11px;
        background: #fff;
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid #dbeafe;
        color: #1e3a8a;
        font-weight: 500;
      }
    `,
  ],
  template: `
    <div class="page-container">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs">
        Home Collection > <strong>Phlebotomist Dashboard</strong>
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Phlebotomist Dashboard</h1>
          <p class="page-subtitle">
            Live field operations, sample collection tracking, capacity meters, and real-time phlebotomist duty monitoring.
          </p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <a routerLink="/registration/home-collection/collections" class="btn btn-outline" style="text-decoration: none;">
            🏠 Home Collections
          </a>
          <a routerLink="/registration/home-collection/calendar" class="btn btn-outline" style="text-decoration: none;">
            📅 Calendar
          </a>
          <a routerLink="/registration/home-collection/phlebotomists" class="btn btn-primary" style="text-decoration: none;">
            👨‍⚕️ Phlebotomists
          </a>
        </div>
      </div>

      <!-- Top KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">👨‍⚕️</div>
          <div>
            <div class="kpi-value">{{ phlebotomists().length }}</div>
            <div class="kpi-label">Total Phlebotomists</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon green">🟢</div>
          <div>
            <div class="kpi-value">{{ countByStatus('AVAILABLE') }}</div>
            <div class="kpi-label">Available / On Duty</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon amber">🛵</div>
          <div>
            <div class="kpi-value">{{ countByStatus('ON_FIELD') }}</div>
            <div class="kpi-label">On Field (Collecting)</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon purple">🩸</div>
          <div>
            <div class="kpi-value">{{ totalSamplesCollectedToday() }}</div>
            <div class="kpi-label">Samples Collected Today</div>
          </div>
        </div>
      </div>

      <!-- Main Card & Data Table -->
      <div class="card">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, ID, phone, zone..."
              [(ngModel)]="searchQuery"
            />
          </div>

          <div class="filter-group">
            <select class="filter-select" [(ngModel)]="selectedZone">
              <option value="">All Zones</option>
              <option value="Zone 1">Zone 1 - Krishna Nagar / Ramnagar</option>
              <option value="Zone 2">Zone 2 - MVP Colony & Lawson Bay</option>
              <option value="Zone 3">Zone 3 - Gajuwaka</option>
              <option value="Zone 4">Zone 4 - Madhurawada</option>
            </select>

            <select class="filter-select" [(ngModel)]="selectedStatus">
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_FIELD">On Field (Collecting)</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </div>

        <!-- Table View -->
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Phlebotomist</th>
                <th>Contact</th>
                <th>Assigned Zone</th>
                <th>Vehicle</th>
                <th>Sample Capacity</th>
                <th>Duty Status</th>
                <th>Rating</th>
                <th style="text-align: right;">Pickups</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredPhlebotomists().length === 0) {
                <tr>
                  <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    No phlebotomists found matching your filter.
                  </td>
                </tr>
              }

              @for (ph of filteredPhlebotomists(); track ph.id) {
                <tr>
                  <!-- Phlebotomist Info -->
                  <td>
                    <div class="phlebo-meta">
                      <div class="avatar">{{ getInitials(ph.name) }}</div>
                      <div>
                        <div class="phlebo-name">{{ ph.name }}</div>
                        <span class="phlebo-id">{{ ph.employeeId || 'PHL-NA' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Contact -->
                  <td>
                    <div><strong>{{ ph.phone }}</strong></div>
                    <div style="font-size: 11px; color: #64748b;">{{ ph.email || '-' }}</div>
                  </td>

                  <!-- Zone -->
                  <td>
                    <div class="zone-tag">
                      <span style="color: #ef4444;">📍</span>
                      <span>{{ ph.zone || 'Unassigned' }}</span>
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      {{ ph.specialization || 'Routine Blood & Urine' }}
                    </div>
                  </td>

                  <!-- Vehicle -->
                  <td>
                    <div><strong>{{ ph.vehicleType || 'Bike' }}</strong></div>
                    <div class="vehicle-info">{{ ph.vehicleNumber || 'AP31-Temp' }}</div>
                  </td>

                  <!-- Capacity & Progress -->
                  <td>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;">
                      <span>{{ ph.todayCollections || 0 }} / {{ ph.maxDailyCapacity || 15 }}</span>
                      <span style="color: #64748b;">{{ getCapacityPercent(ph) }}%</span>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar-fill" [style.width.%]="getCapacityPercent(ph)"></div>
                    </div>
                  </td>

                  <!-- Status with Quick Switcher -->
                  <td>
                    <select
                      [ngModel]="ph.status"
                      (ngModelChange)="changeStatus(ph, $event)"
                      style="border: none; background: transparent; font-weight: 600; cursor: pointer;"
                    >
                      <option value="AVAILABLE">🟢 Available</option>
                      <option value="ON_FIELD">🛵 On Field</option>
                      <option value="OFF_DUTY">⚪ Off Duty</option>
                      <option value="ON_LEAVE">🔴 On Leave</option>
                    </select>
                  </td>

                  <!-- Rating -->
                  <td>
                    <span style="color: #f59e0b; font-weight: 700;">★ {{ ph.rating || 4.8 }}</span>
                  </td>

                  <!-- Action Buttons -->
                  <td style="text-align: right;">
                    <button class="btn btn-outline btn-sm" (click)="viewPickups(ph)" title="View today's sample collection assignments">
                      📋 Pickups
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Slide-Out Drawer for Sample Pickups & Tasks -->
      @if (selectedPhlebo()) {
        <div class="drawer-overlay" (click)="closeDrawer()">
          <div class="drawer" (click)="$event.stopPropagation()">
            <div class="drawer-header">
              <div>
                <div style="font-size: 18px; font-weight: 700;">{{ selectedPhlebo()?.name }}</div>
                <div style="font-size: 12px; color: #94a3b8;">{{ selectedPhlebo()?.employeeId }} • {{ selectedPhlebo()?.phone }}</div>
              </div>
              <button class="btn-icon" style="color: #fff;" (click)="closeDrawer()">✕</button>
            </div>

            <div class="drawer-body">
              <!-- Phlebotomist Quick Stats -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; margin-bottom: 16px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <div style="font-size: 18px; font-weight: 700; color: #0f172a;">{{ selectedPhlebo()?.todayCollections || 0 }}</div>
                  <div style="font-size: 11px; color: #64748b;">Collected Today</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <div style="font-size: 18px; font-weight: 700; color: #0f172a;">{{ selectedPhlebo()?.maxDailyCapacity || 15 }}</div>
                  <div style="font-size: 11px; color: #64748b;">Max Capacity</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">★ {{ selectedPhlebo()?.rating || 4.8 }}</div>
                  <div style="font-size: 11px; color: #64748b;">Patient Rating</div>
                </div>
              </div>

              <!-- Cold Chain Kit Inventory Checklist -->
              <div class="kit-box">
                <div class="kit-title">
                  <span>🧊</span>
                  <span>Phlebotomy Collection Kit (Cold Chain Certified)</span>
                </div>
                <div class="kit-tags">
                  <span class="kit-tag">💜 EDTA (Purple)</span>
                  <span class="kit-tag">💛 SST Gel (Gold)</span>
                  <span class="kit-tag">🩶 Fluoride (Grey)</span>
                  <span class="kit-tag">🧴 Tourniquet & Swabs</span>
                  <span class="kit-tag">❄️ Ice Box Temp: 4.2°C (Optimal)</span>
                </div>
              </div>

              <!-- Today's Home Collection Assignments -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">
                  Today's Patient Sample Pickups ({{ sampleTasks.length }})
                </h3>
                @if (sampleTasks.length > 0) {
                  <span class="status-badge on_field">Live Route</span>
                }
              </div>

              @if (sampleTasks.length === 0) {
                <div style="text-align: center; padding: 32px 16px; color: #94a3b8; font-size: 13px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
                  No active sample collection pickups assigned to this phlebotomist today.
                </div>
              }

              @for (task of sampleTasks; track task.id) {
                <div class="task-card">
                  <div class="task-header">
                    <div>
                      <span class="task-patient">{{ task.patientName }}</span>
                      <span style="font-size: 12px; color: #64748b; margin-left: 6px;">({{ task.patientAgeGender }})</span>
                    </div>
                    <span class="task-time">{{ task.scheduledTime }}</span>
                  </div>

                  <div class="task-detail">
                    <span>📍</span>
                    <span>{{ task.address }}</span>
                  </div>

                  <div class="task-detail">
                    <span>🧪</span>
                    <span><strong>Tests:</strong> {{ task.tests }}</span>
                  </div>

                  <div class="task-detail">
                    <span>🩸</span>
                    <span><strong>Tubes:</strong> {{ task.tubesRequired }}</span>
                  </div>

                  <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span class="status-badge" [ngClass]="task.status === 'COLLECTED' ? 'available' : (task.status === 'IN_TRANSIT' ? 'on_field' : 'off_duty')">
                      {{ task.status.replace('_', ' ') }}
                    </span>
                    <a href="tel:{{ task.patientPhone }}" class="btn btn-outline btn-sm" style="font-size: 11px;">
                      📞 Call Patient
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PhlebotomistDashboardPage implements OnInit {
  private api = inject(PhlebotomistApiService);

  phlebotomists = signal<PhlebotomistModel[]>([]);
  loading = signal(false);

  searchQuery = '';
  selectedZone = '';
  selectedStatus = '';

  selectedPhlebo = signal<PhlebotomistModel | null>(null);
  sampleTasks: SamplePickupTask[] = [];

  filteredPhlebotomists = computed(() => {
    let list = this.phlebotomists();
    const q = (this.searchQuery || '').toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.employeeId && p.employeeId.toLowerCase().includes(q)) ||
          (p.phone && p.phone.toLowerCase().includes(q)) ||
          (p.zone && p.zone.toLowerCase().includes(q))
      );
    }
    if (this.selectedZone) {
      list = list.filter((p) => p.zone && p.zone.toLowerCase().includes(this.selectedZone.toLowerCase()));
    }
    if (this.selectedStatus) {
      list = list.filter((p) => p.status === this.selectedStatus);
    }
    return list;
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (data) => {
        this.phlebotomists.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.phlebotomists.set([]);
        this.loading.set(false);
      },
    });
  }

  countByStatus(status: string): number {
    return this.phlebotomists().filter((p) => p.status === status).length;
  }

  totalSamplesCollectedToday(): number {
    return this.phlebotomists().reduce((sum, p) => sum + (p.todayCollections || 0), 0);
  }

  getCapacityPercent(ph: PhlebotomistModel): number {
    const max = ph.maxDailyCapacity || 15;
    const current = ph.todayCollections || 0;
    return Math.min(100, Math.round((current / max) * 100));
  }

  getInitials(name: string): string {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  changeStatus(ph: PhlebotomistModel, newStatus: string) {
    ph.status = newStatus;
    this.api.update(ph.id, { status: newStatus }).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  viewPickups(ph: PhlebotomistModel) {
    this.selectedPhlebo.set(ph);
  }

  closeDrawer() {
    this.selectedPhlebo.set(null);
  }
}
