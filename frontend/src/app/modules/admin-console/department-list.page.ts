import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DepartmentApiService, Department } from '../../core/services/department-api.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="dept-page">
      <!-- Breadcrumb & Top Bar -->
      <div class="top-nav">
        <div class="breadcrumbs">
          <span class="crumb-parent">Department Management</span>
          <span class="crumb-separator">/</span>
          <span class="crumb-current">Department List</span>
        </div>
        <div class="top-actions">
          <button class="btn btn-primary" (click)="openAddModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Department
          </button>
        </div>
      </div>

      <!-- Toast Feedback Message -->
      @if (feedback()) {
        <div class="feedback-toast">
          ✓ {{ feedback() }}
        </div>
      }

      <!-- KPI Summary Cards (Live from PostgreSQL DB) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Total Departments</span>
            <span class="kpi-value">{{ totalCount() }}</span>
            <span class="kpi-sub">{{ activeCount() }} active in hospital DB</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Clinical & Surgical</span>
            <span class="kpi-value">{{ clinicalCount() }}</span>
            <span class="kpi-sub">Specialty outpatient & OT</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--violet">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Diagnostic & Support</span>
            <span class="kpi-value">{{ diagnosticCount() }}</span>
            <span class="kpi-sub">Lab, Radiology, Pharmacy</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Allocated Specialists</span>
            <span class="kpi-value">{{ totalDoctorsCount() }}</span>
            <span class="kpi-sub">Assigned medical doctors</span>
          </div>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filter-panel">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Search by department name, code, HOD doctor, or location..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
          />
          @if (searchTerm()) {
            <button class="clear-btn" (click)="searchTerm.set('')">✕</button>
          }
        </div>

        <div class="filter-group">
          <label class="filter-label">Category:</label>
          <select class="filter-select" [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)">
            <option value="ALL">All Categories</option>
            <option value="CLINICAL">Clinical Specialties</option>
            <option value="SURGICAL">Surgical Specialties</option>
            <option value="CRITICAL_CARE">Critical Care / ICU</option>
            <option value="EMERGENCY">Emergency & Trauma</option>
            <option value="DIAGNOSTIC">Diagnostic & Labs</option>
            <option value="SUPPORT">Support & Services</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Status:</label>
          <select class="filter-select" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="table-card">
        <div class="table-card__head">
          <div>
            <h3 class="table-title">Hospital Departments Directory</h3>
            <p class="table-subtitle">
              @if (loading()) {
                <span>Connecting to PostgreSQL database...</span>
              } @else {
                <span>Showing {{ filteredDepartments().length }} of {{ departments().length }} departments from database</span>
              }
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="loadDepartments()" [disabled]="loading()">
            ↻ Refresh DB
          </button>
        </div>

        <div class="table-responsive">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Fetching live department records from PostgreSQL hms_db...</span>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 90px;">Code</th>
                  <th>Department Name & Scope</th>
                  <th>Category</th>
                  <th>Head of Department (HOD)</th>
                  <th>Location / Facility</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th style="text-align: right; width: 140px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (dept of filteredDepartments(); track dept.id) {
                  <tr [class.row-inactive]="!dept.isActive">
                    <td>
                      <span class="dept-code-tag">{{ dept.code }}</span>
                    </td>
                    <td>
                      <div class="dept-info">
                        <span class="dept-name">{{ dept.name }}</span>
                        <span class="dept-desc">{{ dept.description || 'General hospital clinical department' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="type-pill" [ngClass]="'type-pill--' + dept.type.toLowerCase()">
                        {{ formatType(dept.type) }}
                      </span>
                    </td>
                    <td>
                      <div class="hod-info">
                        <span class="hod-name">{{ dept.headOfDepartment || 'Unassigned' }}</span>
                        <span class="hod-doctors">{{ dept.totalDoctors || 1 }} Assigned Doctors</span>
                      </div>
                    </td>
                    <td>
                      <div class="loc-info">
                        <span class="loc-main">{{ dept.location || 'Main Hospital' }}</span>
                        <span class="loc-sub">{{ dept.floor || 'Ground Floor' }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="contact-info">
                        <span class="contact-ext">Ext: {{ dept.extension || '—' }}</span>
                        <span class="contact-phone">{{ dept.phone || '—' }}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="status-toggle"
                        [class.status-toggle--active]="dept.isActive"
                        (click)="toggleStatus(dept)"
                        title="Click to toggle status in DB"
                      >
                        <span class="status-dot"></span>
                        {{ dept.isActive ? 'Active' : 'Inactive' }}
                      </button>
                    </td>
                    <td style="text-align: right;">
                      <div class="action-buttons">
                        <button class="action-btn" (click)="viewDetails(dept)" title="View Details">
                          👁️
                        </button>
                        <button class="action-btn" (click)="openEditModal(dept)" title="Edit Department">
                          ✏️
                        </button>
                        <button class="action-btn action-btn--danger" (click)="deleteDepartment(dept)" title="Delete Department from DB">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8">
                      <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        <h4>No Departments Found</h4>
                        <p>No hospital departments match the current search filters.</p>
                        <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Reset Filters</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Add / Edit Department Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <div>
                <h3 class="modal-title">{{ isEdit() ? 'Edit Department' : 'Create New Department' }}</h3>
                <p class="modal-subtitle">Save directly to PostgreSQL hms_db database</p>
              </div>
              <button class="modal-close-btn" (click)="closeModal()">✕</button>
            </div>

            <form [formGroup]="deptForm" (ngSubmit)="saveDepartment()">
              <div class="modal-body">
                <div class="form-row form-row--2">
                  <div class="form-field">
                    <label class="form-label">Department Code <span class="req">*</span></label>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g. CARD, NEURO, RAD"
                      formControlName="code"
                      style="text-transform: uppercase;"
                    />
                    @if (deptForm.get('code')?.invalid && deptForm.get('code')?.touched) {
                      <span class="field-error">Code is required (e.g. GM, CARD).</span>
                    }
                  </div>

                  <div class="form-field">
                    <label class="form-label">Department Category <span class="req">*</span></label>
                    <select class="form-select" formControlName="type">
                      <option value="CLINICAL">Clinical Specialty (OPD/IPD)</option>
                      <option value="SURGICAL">Surgical Specialty (OT)</option>
                      <option value="CRITICAL_CARE">Critical Care / ICU</option>
                      <option value="EMERGENCY">Emergency & Trauma</option>
                      <option value="DIAGNOSTIC">Diagnostic & Laboratory</option>
                      <option value="SUPPORT">Hospital Support / Pharmacy</option>
                    </select>
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-label">Department Name <span class="req">*</span></label>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="e.g. Cardiology & Vascular Sciences"
                    formControlName="name"
                  />
                  @if (deptForm.get('name')?.invalid && deptForm.get('name')?.touched) {
                    <span class="field-error">Full department name is required.</span>
                  }
                </div>

                <div class="form-row form-row--2">
                  <div class="form-field">
                    <label class="form-label">Head of Department (HOD) <span class="req">*</span></label>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g. Dr. Krishna P Padagala"
                      formControlName="headOfDepartment"
                    />
                  </div>

                  <div class="form-field">
                    <label class="form-label">Total Assigned Doctors</label>
                    <input
                      type="number"
                      class="form-input"
                      placeholder="e.g. 4"
                      formControlName="totalDoctors"
                      min="0"
                    />
                  </div>
                </div>

                <div class="form-row form-row--2">
                  <div class="form-field">
                    <label class="form-label">Location / Block <span class="req">*</span></label>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g. OPD Block A, Wing West"
                      formControlName="location"
                    />
                  </div>

                  <div class="form-field">
                    <label class="form-label">Floor / Room Numbers</label>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g. 1st Floor, Room 101-105"
                      formControlName="floor"
                    />
                  </div>
                </div>

                <div class="form-row form-row--3">
                  <div class="form-field">
                    <label class="form-label">Intercom Extension</label>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g. 104"
                      formControlName="extension"
                    />
                  </div>

                  <div class="form-field">
                    <label class="form-label">Direct Phone (10 digits)</label>
                    <input
                      type="tel"
                      class="form-input"
                      placeholder="10-digit phone number"
                      maxlength="10"
                      pattern="[0-9]{10}"
                      formControlName="phone"
                      (input)="sanitizePhone()"
                    />
                    @if (deptForm.get('phone')?.touched && deptForm.get('phone')?.hasError('pattern')) {
                      <span class="field-error">Must be exactly 10 digits.</span>
                    }
                  </div>

                  <div class="form-field">
                    <label class="form-label">Official Email</label>
                    <input
                      type="email"
                      class="form-input"
                      placeholder="dept@hospital.org"
                      formControlName="email"
                    />
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-label">Description & Scope of Care</label>
                  <textarea
                    class="form-textarea"
                    rows="3"
                    placeholder="Brief description of clinical services, diagnostic facilities, and treatments offered..."
                    formControlName="description"
                  ></textarea>
                </div>

                <div class="form-field form-field--checkbox">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="isActive" />
                    <span>Department is active & accepting patient appointments and admissions</span>
                  </label>
                </div>
              </div>

              <div class="modal-foot">
                <button type="button" class="btn btn-secondary" (click)="closeModal()" [disabled]="saving()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="deptForm.invalid || saving()">
                  @if (saving()) {
                    <span>Saving to DB...</span>
                  } @else {
                    <span>{{ isEdit() ? 'Update in Database' : 'Save to Database' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- View Details Drawer/Modal -->
      @if (viewingDept(); as d) {
        <div class="modal-overlay" (click)="viewingDept.set(null)">
          <div class="modal-card modal-card--view" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <div style="display:flex; align-items:center; gap:12px;">
                <span class="dept-code-tag" style="font-size:16px; padding:6px 14px;">{{ d.code }}</span>
                <div>
                  <h3 class="modal-title">{{ d.name }}</h3>
                  <span class="type-pill" [ngClass]="'type-pill--' + d.type.toLowerCase()">
                    {{ formatType(d.type) }}
                  </span>
                </div>
              </div>
              <button class="modal-close-btn" (click)="viewingDept.set(null)">✕</button>
            </div>

            <div class="modal-body">
              <div class="view-grid">
                <div class="view-item">
                  <span class="view-label">Head of Department (HOD)</span>
                  <span class="view-value font-bold">{{ d.headOfDepartment || 'Unassigned' }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">Assigned Medical Doctors</span>
                  <span class="view-value">{{ d.totalDoctors || 1 }} Registered Specialists</span>
                </div>
                <div class="view-item">
                  <span class="view-label">Facility Location</span>
                  <span class="view-value">{{ d.location || 'Main Hospital' }} ({{ d.floor || 'Ground Floor' }})</span>
                </div>
                <div class="view-item">
                  <span class="view-label">Direct Contacts</span>
                  <span class="view-value">Ext: {{ d.extension || '—' }} • 📞 {{ d.phone || '—' }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">Department Email</span>
                  <span class="view-value">{{ d.email || '—' }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">Database Status</span>
                  <span class="view-value">
                    <span class="badge" [ngClass]="d.isActive ? 'badge-success' : 'badge-danger'">
                      {{ d.isActive ? 'ACTIVE IN DB' : 'INACTIVE IN DB' }}
                    </span>
                  </span>
                </div>
              </div>

              <div class="view-section">
                <h4 class="view-sec-title">Clinical Scope & Services</h4>
                <p class="view-desc">{{ d.description || 'General hospital clinical department operations.' }}</p>
              </div>

              <div class="view-section">
                <h4 class="view-sec-title">Quick Department Routing</h4>
                <div class="quick-links">
                  <a routerLink="/opd" class="quick-link-btn">
                    <span>🩺 OPD Consultation</span>
                    <span>View Queue →</span>
                  </a>
                  <a routerLink="/ipd" class="quick-link-btn">
                    <span>🏥 Inpatient Wards</span>
                    <span>Live Bed Map →</span>
                  </a>
                  <a routerLink="/billing" class="quick-link-btn">
                    <span>💳 Billing</span>
                    <span>History →</span>
                  </a>
                </div>
              </div>
            </div>

            <div class="modal-foot">
              <button class="btn btn-secondary" (click)="viewingDept.set(null)">Close</button>
              <button class="btn btn-primary" (click)="openEditModal(d); viewingDept.set(null)">
                ✏️ Edit This Department
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dept-page {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 40px;
      }

      .feedback-toast {
        background: #10b981;
        color: #ffffff;
        font-weight: 600;
        font-size: 13px;
        padding: 10px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        animation: fadeIn 0.2s ease;
      }

      /* ── Top Bar & Breadcrumbs ── */
      .top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }

      .crumb-parent {
        color: #64748b;
        font-weight: 500;
      }

      .crumb-separator {
        color: #cbd5e1;
      }

      .crumb-current {
        color: #0f172a;
        font-weight: 700;
        font-size: 18px;
      }

      /* ── KPI Grid ── */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }

      .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .kpi-icon--blue {
        background: #eff6ff;
        color: #2563eb;
      }

      .kpi-icon--emerald {
        background: #ecfdf5;
        color: #059669;
      }

      .kpi-icon--violet {
        background: #f5f3ff;
        color: #7c3aed;
      }

      .kpi-icon--amber {
        background: #fffbeb;
        color: #d97706;
      }

      .kpi-content {
        display: flex;
        flex-direction: column;
      }

      .kpi-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .kpi-value {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
        margin-top: 2px;
      }

      .kpi-sub {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 2px;
      }

      /* ── Filter Panel ── */
      .filter-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      }

      .search-wrap {
        position: relative;
        flex: 1;
        min-width: 260px;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
      }

      .search-input {
        width: 100%;
        padding: 8px 32px 8px 36px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .search-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .clear-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 12px;
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .filter-label {
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        white-space: nowrap;
      }

      .filter-select {
        padding: 7px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 13px;
        background: #ffffff;
        color: #334155;
        outline: none;
      }

      /* ── Table Card ── */
      .table-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .table-card__head {
        padding: 16px 20px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .table-title {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .table-subtitle {
        font-size: 12px;
        color: #64748b;
        margin: 2px 0 0;
      }

      .table-responsive {
        overflow-x: auto;
      }

      .loading-state {
        padding: 48px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #64748b;
        font-size: 14px;
      }

      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        text-align: left;
      }

      .data-table th {
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }

      .data-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .data-table tr:last-child td {
        border-bottom: none;
      }

      .data-table tr:hover td {
        background: #f8fafc;
      }

      .row-inactive td {
        opacity: 0.65;
        background: #fcfcfc;
      }

      /* ── Column Cells ── */
      .dept-code-tag {
        font-family: monospace;
        font-size: 12px;
        font-weight: 700;
        background: #f1f5f9;
        color: #334155;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        display: inline-block;
      }

      .dept-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        max-width: 280px;
      }

      .dept-name {
        font-weight: 600;
        color: #0f172a;
        font-size: 14px;
      }

      .dept-desc {
        font-size: 11px;
        color: #64748b;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .type-pill {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }

      .type-pill--clinical {
        background: #dbeafe;
        color: #1e40af;
      }

      .type-pill--surgical {
        background: #fae8ff;
        color: #86198f;
      }

      .type-pill--critical_care {
        background: #fee2e2;
        color: #991b1b;
      }

      .type-pill--emergency {
        background: #ffedd5;
        color: #c2410c;
      }

      .type-pill--diagnostic {
        background: #ede9fe;
        color: #5b21b6;
      }

      .type-pill--support {
        background: #e0f2fe;
        color: #0369a1;
      }

      .hod-info,
      .loc-info,
      .contact-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .hod-name,
      .loc-main,
      .contact-ext {
        font-weight: 600;
        color: #1e293b;
      }

      .hod-doctors,
      .loc-sub,
      .contact-phone {
        font-size: 11px;
        color: #64748b;
      }

      .status-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        color: #64748b;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .status-toggle--active {
        background: #dcfce7;
        color: #15803d;
        border-color: #86efac;
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
      }

      .badge-success {
        background: #dcfce7;
        color: #15803d;
      }

      .badge-danger {
        background: #fee2e2;
        color: #b91c1c;
      }

      .action-buttons {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
      }

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
      }

      .action-btn:hover {
        background: #f1f5f9;
      }

      .action-btn--danger:hover {
        background: #fee2e2;
        border-color: #fca5a5;
      }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.15s ease;
      }

      .btn-primary {
        background: #2563eb;
        color: #ffffff;
      }

      .btn-primary:hover:not(:disabled) {
        background: #1d4ed8;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #ffffff;
        color: #334155;
        border-color: #cbd5e1;
      }

      .btn-secondary:hover {
        background: #f8fafc;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
      }

      /* ── Empty State ── */
      .empty-state {
        padding: 48px 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .empty-state h4 {
        margin: 8px 0 0;
        font-size: 16px;
        color: #1e293b;
      }

      .empty-state p {
        margin: 0 0 12px;
        color: #64748b;
        font-size: 13px;
      }

      /* ── Modal Overlay ── */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .modal-card {
        background: #ffffff;
        border-radius: 14px;
        width: 100%;
        max-width: 640px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        animation: modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .modal-card--view {
        max-width: 580px;
      }

      @keyframes modalScale {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .modal-head {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      .modal-title {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .modal-subtitle {
        font-size: 12px;
        color: #64748b;
        margin: 3px 0 0;
      }

      .modal-close-btn {
        background: #f1f5f9;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #64748b;
        font-size: 14px;
      }

      .modal-close-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
      }

      .modal-body {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .modal-foot {
        padding: 16px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        border-radius: 0 0 14px 14px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      /* ── Form Controls in Modal ── */
      .form-row {
        display: grid;
        gap: 14px;
      }

      .form-row--2 {
        grid-template-columns: 1fr 1fr;
      }

      .form-row--3 {
        grid-template-columns: 1fr 1fr 1fr;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-label {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
      }

      .req {
        color: #dc2626;
      }

      .form-input,
      .form-select,
      .form-textarea {
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 13px;
        color: #0f172a;
        outline: none;
        background: #ffffff;
      }

      .form-input:focus,
      .form-select:focus,
      .form-textarea:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .form-textarea {
        resize: vertical;
      }

      .field-error {
        font-size: 11px;
        color: #dc2626;
      }

      .form-field--checkbox {
        flex-direction: row;
        align-items: center;
        margin-top: 4px;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #334155;
        cursor: pointer;
      }

      /* ── Details View Drawer ── */
      .view-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        background: #f8fafc;
        padding: 16px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
      }

      .view-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .view-label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
      }

      .view-value {
        font-size: 13px;
        color: #0f172a;
      }

      .font-bold {
        font-weight: 700;
      }

      .view-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .view-sec-title {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .view-desc {
        font-size: 13px;
        color: #475569;
        line-height: 1.5;
        margin: 0;
      }

      .quick-links {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
      }

      .quick-link-btn {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 12px;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #1e293b;
        font-weight: 600;
        transition: all 0.15s ease;
      }

      .quick-link-btn span:last-child {
        font-size: 11px;
        color: #2563eb;
        font-weight: 500;
      }

      .quick-link-btn:hover {
        border-color: #2563eb;
        background: #eff6ff;
        transform: translateY(-1px);
      }
    `,
  ],
})
export class DepartmentListPage implements OnInit {
  private svc = inject(DepartmentApiService);
  private fb = inject(FormBuilder);

  departments = signal<Department[]>([]);
  loading = signal(false);
  saving = signal(false);
  feedback = signal<string | null>(null);

  searchTerm = signal('');
  typeFilter = signal('ALL');
  statusFilter = signal('ALL');

  showModal = signal(false);
  isEdit = signal(false);
  editingId = signal<string | null>(null);
  viewingDept = signal<Department | null>(null);

  deptForm!: FormGroup;

  totalCount = computed(() => this.departments().length);
  activeCount = computed(() => this.departments().filter((d) => d.isActive).length);
  clinicalCount = computed(
    () => this.departments().filter((d) => d.type === 'CLINICAL' || d.type === 'SURGICAL').length
  );
  diagnosticCount = computed(
    () =>
      this.departments().filter(
        (d) => d.type === 'DIAGNOSTIC' || d.type === 'SUPPORT' || d.type === 'CRITICAL_CARE'
      ).length
  );
  totalDoctorsCount = computed(() =>
    this.departments().reduce((sum, d) => sum + (d.totalDoctors || 0), 0)
  );

  filteredDepartments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.departments().filter((d) => {
      const matchesSearch =
        !term ||
        (d.name && d.name.toLowerCase().includes(term)) ||
        (d.code && d.code.toLowerCase().includes(term)) ||
        (d.headOfDepartment && d.headOfDepartment.toLowerCase().includes(term)) ||
        (d.location && d.location.toLowerCase().includes(term));

      const matchesType = type === 'ALL' || d.type === type;
      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && d.isActive) ||
        (status === 'INACTIVE' && !d.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
  }

  private initForm(): void {
    this.deptForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', Validators.required],
      type: ['CLINICAL', Validators.required],
      headOfDepartment: ['', Validators.required],
      location: ['', Validators.required],
      floor: [''],
      extension: [''],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      email: [''],
      totalDoctors: [1, [Validators.min(0)]],
      description: [''],
      isActive: [true],
    });
  }

  loadDepartments(): void {
    this.loading.set(true);
    this.svc.list().subscribe({
      next: (list) => {
        this.departments.set(list || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load departments from DB', err);
        this.loading.set(false);
      },
    });
  }

  private showFeedback(msg: string): void {
    this.feedback.set(msg);
    setTimeout(() => this.feedback.set(null), 3500);
  }

  sanitizePhone(): void {
    const val = this.deptForm.get('phone')?.value;
    if (val) {
      const clean = val.replace(/\D/g, '').slice(0, 10);
      if (clean !== val) {
        this.deptForm.get('phone')?.setValue(clean, { emitEvent: false });
      }
    }
  }

  formatType(type: string): string {
    switch (type) {
      case 'CLINICAL':
        return 'Clinical Specialty';
      case 'SURGICAL':
        return 'Surgical Specialty';
      case 'CRITICAL_CARE':
        return 'Critical Care / ICU';
      case 'EMERGENCY':
        return 'Emergency & Trauma';
      case 'DIAGNOSTIC':
        return 'Diagnostic & Lab';
      case 'SUPPORT':
        return 'Support / Pharmacy';
      default:
        return type;
    }
  }

  openAddModal(): void {
    this.isEdit.set(false);
    this.editingId.set(null);
    this.deptForm.reset({
      code: '',
      name: '',
      type: 'CLINICAL',
      headOfDepartment: '',
      location: '',
      floor: '',
      extension: '',
      phone: '',
      email: '',
      totalDoctors: 2,
      description: '',
      isActive: true,
    });
    this.showModal.set(true);
  }

  openEditModal(dept: Department): void {
    this.isEdit.set(true);
    this.editingId.set(dept.id);
    this.deptForm.patchValue({
      code: dept.code,
      name: dept.name,
      type: dept.type,
      headOfDepartment: dept.headOfDepartment,
      location: dept.location,
      floor: dept.floor,
      extension: dept.extension,
      phone: dept.phone,
      email: dept.email,
      totalDoctors: dept.totalDoctors,
      description: dept.description,
      isActive: dept.isActive,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveDepartment(): void {
    if (this.deptForm.invalid || this.saving()) return;

    this.saving.set(true);
    const val = this.deptForm.value;

    if (this.isEdit() && this.editingId()) {
      const id = this.editingId()!;
      this.svc.update(id, val).subscribe({
        next: (updated) => {
          this.departments.update((list) =>
            list.map((d) => (d.id === id ? updated : d))
          );
          this.saving.set(false);
          this.closeModal();
          this.showFeedback(`Department "${updated.name}" updated successfully in database`);
        },
        error: (err) => {
          console.error('Error updating department in DB', err);
          this.saving.set(false);
          alert('Failed to update department in database.');
        },
      });
    } else {
      this.svc.create(val).subscribe({
        next: (created) => {
          this.departments.update((list) => [created, ...list]);
          this.saving.set(false);
          this.closeModal();
          this.showFeedback(`Department "${created.name}" created successfully in database`);
        },
        error: (err) => {
          console.error('Error creating department in DB', err);
          this.saving.set(false);
          alert('Failed to save department to database.');
        },
      });
    }
  }

  toggleStatus(dept: Department): void {
    this.svc.toggleStatus(dept.id).subscribe({
      next: (updated) => {
        this.departments.update((list) =>
          list.map((d) => (d.id === updated.id ? updated : d))
        );
        this.showFeedback(
          `Department "${dept.name}" marked as ${updated.isActive ? 'Active' : 'Inactive'} in DB`
        );
      },
      error: (err) => {
        console.error('Error toggling status', err);
        alert('Failed to update status in database.');
      },
    });
  }

  deleteDepartment(dept: Department): void {
    if (confirm(`Are you sure you want to permanently delete department "${dept.name}" (${dept.code}) from the database?`)) {
      this.svc.remove(dept.id).subscribe({
        next: () => {
          this.departments.update((list) => list.filter((d) => d.id !== dept.id));
          if (this.viewingDept()?.id === dept.id) {
            this.viewingDept.set(null);
          }
          this.showFeedback(`Department "${dept.name}" deleted from database`);
        },
        error: (err) => {
          console.error('Error deleting department', err);
          alert('Failed to delete department from database.');
        },
      });
    }
  }

  viewDetails(dept: Department): void {
    this.viewingDept.set(dept);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.typeFilter.set('ALL');
    this.statusFilter.set('ALL');
  }
}
