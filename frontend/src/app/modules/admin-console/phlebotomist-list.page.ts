import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PhlebotomistApiService, PhlebotomistModel } from '../../core/services/phlebotomist-api.service';

@Component({
  selector: 'hms-phlebotomist-list',
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

      /* Card & Table */
      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        margin-bottom: var(--sp-6);
      }

      .toolbar {
        padding: 14px 18px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
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
        box-sizing: border-box;
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
        gap: 8px;
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

      .zone-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #1e293b;
        font-weight: 500;
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

      /* Buttons */
      .btn {
        padding: 8px 16px;
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
      .btn-primary {
        background: #2563eb;
        color: #fff;
        border-color: #2563eb;
      }
      .btn-primary:hover {
        background: #1d4ed8;
      }
      .btn-outline {
        background: #fff;
        border-color: #cbd5e1;
        color: #334155;
      }
      .btn-outline:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
      .btn-icon {
        padding: 6px 10px;
        color: #64748b;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        border-radius: 5px;
        font-size: 13px;
      }
      .btn-icon:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
      .btn-danger {
        color: #dc2626;
        border-color: #fecaca;
        background: #fff5f5;
      }
      .btn-danger:hover {
        background: #fee2e2;
        color: #b91c1c;
      }
      .action-btns {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: flex-end;
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--sp-4);
      }
      .modal-card {
        background: #fff;
        border-radius: 12px;
        max-width: 620px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      }
      .modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .modal-body {
        padding: 20px;
      }
      .modal-footer {
        padding: 14px 20px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        background: #f8fafc;
      }

      .form-section-title {
        font-size: 12px;
        font-weight: 700;
        color: #2563eb;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 14px 0 8px 0;
        grid-column: 1 / -1;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
      }
      .form-section-title:first-child {
        margin-top: 0;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      .form-field.full {
        grid-column: 1 / -1;
      }
      .form-label {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        margin-bottom: 4px;
        display: block;
      }
      .form-control {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 13px;
        color: #0f172a;
        outline: none;
        box-sizing: border-box;
      }
      .form-control:focus {
        border-color: #2563eb;
      }
    `,
  ],
  template: `
    <div class="page-container">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs">
        Home Collection > <strong>Phlebotomists</strong>
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Phlebotomists</h1>
          <p class="page-subtitle">
            Add, edit, and manage registered phlebotomists, their contact details, assigned collection zones, and vehicle info.
          </p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <a routerLink="/registration/home-collection/collections" class="btn btn-outline" style="text-decoration: none;">
            🏠 Home Collections
          </a>
          <a routerLink="/registration/home-collection/calendar" class="btn btn-outline" style="text-decoration: none;">
            📅 Calendar
          </a>
          <a routerLink="/registration/home-collection/phlebotomist-dashboard" class="btn btn-outline" style="text-decoration: none;">
            📊 Dashboard
          </a>
          <button class="btn btn-primary" (click)="openAddModal()">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Add Phlebotomist
          </button>
        </div>
      </div>

      <!-- Card Table -->
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
              <option value="ON_FIELD">On Field</option>
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
                <th>Contact Details</th>
                <th>Assigned Zone</th>
                <th>Vehicle Info</th>
                <th>Specialization</th>
                <th>Capacity</th>
                <th>Duty Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    Loading phlebotomists…
                  </td>
                </tr>
              } @else if (filteredPhlebotomists().length === 0) {
                <tr>
                  <td colspan="8" style="text-align: center; padding: 48px; color: #64748b;">
                    <div style="font-size: 28px; margin-bottom: 8px;">👨‍⚕️</div>
                    <div style="font-weight: 600; font-size: 15px; color: #0f172a;">No Phlebotomists Found</div>
                    <div style="font-size: 13px; margin: 4px 0 16px 0; color: #94a3b8;">
                      Click the button below to register your first phlebotomist.
                    </div>
                    <button class="btn btn-primary" (click)="openAddModal()">
                      + Add Phlebotomist
                    </button>
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

                  <!-- Contact Details -->
                  <td>
                    <div><strong>{{ ph.phone }}</strong></div>
                    <div style="font-size: 11px; color: #64748b;">{{ ph.email || '-' }}</div>
                  </td>

                  <!-- Zone -->
                  <td>
                    <div class="zone-badge">
                      <span style="color: #ef4444;">📍</span>
                      <span>{{ ph.zone || 'Unassigned' }}</span>
                    </div>
                  </td>

                  <!-- Vehicle Info -->
                  <td>
                    <div><strong>{{ ph.vehicleType || 'Motorcycle' }}</strong></div>
                    <div style="font-size: 11px; color: #64748b;">{{ ph.vehicleNumber || '-' }}</div>
                  </td>

                  <!-- Specialization -->
                  <td>
                    <div style="font-size: 12px; color: #334155;">{{ ph.specialization || 'Routine Blood Collection' }}</div>
                    @if (ph.notes) {
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">{{ ph.notes }}</div>
                    }
                  </td>

                  <!-- Max Capacity -->
                  <td>
                    <div><strong>{{ ph.maxDailyCapacity || 15 }}</strong> pickups/day</div>
                  </td>

                  <!-- Status -->
                  <td>
                    <span class="status-badge" [ngClass]="(ph.status || 'AVAILABLE').toLowerCase()">
                      {{ ph.status || 'AVAILABLE' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td style="text-align: right;">
                    <div class="action-btns">
                      <button class="btn btn-icon" (click)="openEditModal(ph)" title="Edit Phlebotomist">
                        ✏️ Edit
                      </button>
                      <button class="btn btn-icon btn-danger" (click)="deletePhlebo(ph)" title="Delete Phlebotomist">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay">
          <div class="modal-card">
            <div class="modal-header">
              <h2 class="modal-title">{{ isEditing() ? 'Edit Phlebotomist Details' : 'Add New Phlebotomist' }}</h2>
              <button class="btn-icon" (click)="closeModal()">✕</button>
            </div>

            <form [formGroup]="phleboForm" (ngSubmit)="savePhlebotomist()">
              <div class="modal-body">
                <div class="form-grid">
                  <!-- Section 1: Basic Information -->
                  <div class="form-section-title">Personal & Contact Info</div>

                  <div class="form-field full">
                    <label class="form-label">Full Name <span style="color: #ef4444;">*</span></label>
                    <input class="form-control" formControlName="name" placeholder="e.g. Rahul Sharma" />
                  </div>

                  <div class="form-field">
                    <label class="form-label">Employee ID / Code</label>
                    <input class="form-control" formControlName="employeeId" placeholder="e.g. PHL-101" />
                  </div>

                  <div class="form-field">
                    <label class="form-label">Mobile Phone Number <span style="color: #ef4444;">*</span></label>
                    <input class="form-control" formControlName="phone" placeholder="e.g. +91 98480 12345" />
                  </div>

                  <div class="form-field full">
                    <label class="form-label">Email Address</label>
                    <input class="form-control" formControlName="email" type="email" placeholder="e.g. rahul@accesspathlab.com" />
                  </div>

                  <!-- Section 2: Area & Vehicle -->
                  <div class="form-section-title">Territory & Vehicle Details</div>

                  <div class="form-field full">
                    <label class="form-label">Assigned Zone / Territory <span style="color: #ef4444;">*</span></label>
                    <input class="form-control" formControlName="zone" placeholder="e.g. Zone 1 - Krishna Nagar & Ramnagar" />
                  </div>

                  <div class="form-field">
                    <label class="form-label">Vehicle Type</label>
                    <select class="form-control" formControlName="vehicleType">
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Car / Van">Car / Van</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Public Transit">Public Transit</option>
                    </select>
                  </div>

                  <div class="form-field">
                    <label class="form-label">Vehicle Number</label>
                    <input class="form-control" formControlName="vehicleNumber" placeholder="e.g. AP31-CQ-7821" />
                  </div>

                  <!-- Section 3: Skills & Capacity -->
                  <div class="form-section-title">Capacity & Specialization</div>

                  <div class="form-field">
                    <label class="form-label">Duty Status</label>
                    <select class="form-control" formControlName="status">
                      <option value="AVAILABLE">Available</option>
                      <option value="ON_FIELD">On Field (Collecting)</option>
                      <option value="OFF_DUTY">Off Duty</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>

                  <div class="form-field">
                    <label class="form-label">Daily Capacity (Max Pickups)</label>
                    <input class="form-control" type="number" formControlName="maxDailyCapacity" placeholder="15" />
                  </div>

                  <div class="form-field full">
                    <label class="form-label">Sample Collection Specialization</label>
                    <input class="form-control" formControlName="specialization" placeholder="e.g. Pediatric Blood Draw, Vacutainer Certified, COVID Swabs" />
                  </div>

                  <div class="form-field full">
                    <label class="form-label">Notes / Instructions</label>
                    <textarea class="form-control" rows="2" formControlName="notes" placeholder="Any special notes, certifications or route preferences..."></textarea>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="phleboForm.invalid">
                  {{ isEditing() ? 'Save Changes' : 'Create Phlebotomist' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class PhlebotomistListPage implements OnInit {
  private api = inject(PhlebotomistApiService);
  private fb = inject(FormBuilder);

  phlebotomists = signal<PhlebotomistModel[]>([]);
  loading = signal(false);

  searchQuery = '';
  selectedZone = '';
  selectedStatus = '';

  showModal = signal(false);
  isEditing = signal(false);
  editingId: string | null = null;

  phleboForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    employeeId: [''],
    phone: ['', Validators.required],
    email: [''],
    zone: ['', Validators.required],
    vehicleType: ['Motorcycle'],
    vehicleNumber: [''],
    status: ['AVAILABLE'],
    specialization: ['Routine Blood & Vacutainer Draw'],
    maxDailyCapacity: [15],
    notes: [''],
  });

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

  getInitials(name: string): string {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingId = null;
    const nextCode = `PHL-${100 + this.phlebotomists().length + 1}`;
    this.phleboForm.reset({
      name: '',
      employeeId: nextCode,
      phone: '',
      email: '',
      zone: 'Zone 1 - Krishna Nagar & Ramnagar',
      vehicleType: 'Motorcycle',
      vehicleNumber: '',
      status: 'AVAILABLE',
      specialization: 'Routine Blood & Vacutainer Draw',
      maxDailyCapacity: 15,
      notes: '',
    });
    this.showModal.set(true);
  }

  openEditModal(ph: PhlebotomistModel) {
    this.isEditing.set(true);
    this.editingId = ph.id;
    this.phleboForm.patchValue({
      name: ph.name,
      employeeId: ph.employeeId,
      phone: ph.phone,
      email: ph.email,
      zone: ph.zone,
      vehicleType: ph.vehicleType || 'Motorcycle',
      vehicleNumber: ph.vehicleNumber || '',
      status: ph.status,
      specialization: ph.specialization,
      maxDailyCapacity: ph.maxDailyCapacity || 15,
      notes: ph.notes || '',
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  savePhlebotomist() {
    if (this.phleboForm.invalid) return;
    const val = this.phleboForm.value;

    if (this.isEditing() && this.editingId) {
      this.api.update(this.editingId, val).subscribe({
        next: (updated) => {
          this.phlebotomists.update((list) =>
            list.map((p) => (p.id === this.editingId ? { ...p, ...val } : p))
          );
          this.closeModal();
        },
        error: () => {
          this.phlebotomists.update((list) =>
            list.map((p) => (p.id === this.editingId ? { ...p, ...val } : p))
          );
          this.closeModal();
        },
      });
    } else {
      this.api.create(val).subscribe({
        next: (created) => {
          this.phlebotomists.update((list) => [...list, created]);
          this.closeModal();
        },
        error: () => {
          const newItem: PhlebotomistModel = {
            id: String(Date.now()),
            ...val,
            todayCollections: 0,
            rating: 5.0,
          };
          this.phlebotomists.update((list) => [...list, newItem]);
          this.closeModal();
        },
      });
    }
  }

  deletePhlebo(ph: PhlebotomistModel) {
    if (!confirm(`Are you sure you want to remove phlebotomist ${ph.name}?`)) return;
    this.api.delete(ph.id).subscribe({
      next: () => {
        this.phlebotomists.update((list) => list.filter((p) => p.id !== ph.id));
      },
      error: () => {
        this.phlebotomists.update((list) => list.filter((p) => p.id !== ph.id));
      },
    });
  }
}
