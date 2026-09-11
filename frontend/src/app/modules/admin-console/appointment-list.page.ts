import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  availableTime: string;
  roomNo: string;
}

export interface Appointment {
  id: string; // Auto-generated APT-2026-XXXXX
  tokenNo: number;
  // 1. Patient Details
  patientId: string; // Auto-generated UHID
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  // 2. Appointment Details
  date: string;
  time: string;
  type: 'New' | 'Follow-up' | 'Emergency';
  department: string;
  reason?: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  status: 'Confirmed' | 'Arrived' | 'In-Consultation' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Insurance';
  // 3. Doctor Details
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  createdAt: string;
}

const DOCTOR_CATALOG: Doctor[] = [
  {
    id: 'DOC-101',
    name: 'Dr. Krishna P Padagala',
    specialization: 'MD, General Medicine & Diabetology',
    department: 'General Medicine',
    availableTime: '09:00 AM - 01:00 PM',
    roomNo: 'OPD Room 102',
  },
  {
    id: 'DOC-102',
    name: 'Dr. Arun Sharma',
    specialization: 'DM, Interventional Cardiology',
    department: 'Cardiology',
    availableTime: '10:00 AM - 02:00 PM',
    roomNo: 'Cardio Suite 204',
  },
  {
    id: 'DOC-103',
    name: 'Dr. Priya Verma',
    specialization: 'MS, Orthopedics & Joint Replacement',
    department: 'Orthopedics',
    availableTime: '11:00 AM - 03:00 PM',
    roomNo: 'Ortho Clinic 108',
  },
  {
    id: 'DOC-104',
    name: 'Dr. Rajesh Gupta',
    specialization: 'MD, Pediatrics & Child Health',
    department: 'Pediatrics',
    availableTime: '09:30 AM - 01:30 PM',
    roomNo: 'Pediatric Wing 105',
  },
  {
    id: 'DOC-105',
    name: 'Dr. Sunita Rao',
    specialization: 'MS, Obstetrics & Gynecology',
    department: 'Gynecology & Obstetrics',
    availableTime: '02:00 PM - 06:00 PM',
    roomNo: 'Women Care 201',
  },
  {
    id: 'DOC-106',
    name: 'Dr. Vikram Malhotra',
    specialization: 'MD, Dermatology & Venereology',
    department: 'Dermatology',
    availableTime: '04:00 PM - 08:00 PM',
    roomNo: 'Skin Clinic 302',
  },
  {
    id: 'DOC-107',
    name: 'Dr. Ananya Sen',
    specialization: 'MS, ENT & Head-Neck Surgery',
    department: 'ENT',
    availableTime: '10:00 AM - 02:00 PM',
    roomNo: 'ENT Clinic 110',
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-2026-00101',
    tokenNo: 1,
    patientId: 'UHID-2026-00012',
    patientName: 'Ramesh Kumar',
    age: 48,
    gender: 'Male',
    mobileNumber: '9876543210',
    email: 'ramesh.kumar@gmail.com',
    address: 'Flat 302, Green Valley Apartments, Hyderabad',
    bloodGroup: 'B+',
    date: new Date().toISOString().split('T')[0],
    time: '09:30 AM',
    type: 'Follow-up',
    department: 'General Medicine',
    reason: 'Monthly blood sugar & BP checkup',
    priority: 'Normal',
    status: 'Arrived',
    paymentStatus: 'Paid',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Krishna P Padagala',
    doctorSpecialization: 'MD, General Medicine & Diabetology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-2026-00102',
    tokenNo: 2,
    patientId: 'UHID-2026-00018',
    patientName: 'Sneha Patel',
    age: 32,
    gender: 'Female',
    mobileNumber: '9823456789',
    email: 'sneha.patel@yahoo.com',
    address: 'Plot 45, Banjara Hills Road No. 12',
    bloodGroup: 'O+',
    date: new Date().toISOString().split('T')[0],
    time: '10:15 AM',
    type: 'New',
    department: 'Cardiology',
    reason: 'Occasional chest tightness and palpitations',
    priority: 'Urgent',
    status: 'In-Consultation',
    paymentStatus: 'Paid',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Arun Sharma',
    doctorSpecialization: 'DM, Interventional Cardiology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-2026-00103',
    tokenNo: 3,
    patientId: 'UHID-2026-00025',
    patientName: 'Vijay Deshmukh',
    age: 61,
    gender: 'Male',
    mobileNumber: '9765432190',
    address: 'Sector 4, KPHB Colony',
    bloodGroup: 'A+',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    type: 'New',
    department: 'Orthopedics',
    reason: 'Severe right knee pain after walking',
    priority: 'Normal',
    status: 'Confirmed',
    paymentStatus: 'Pending',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Priya Verma',
    doctorSpecialization: 'MS, Orthopedics & Joint Replacement',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-2026-00104',
    tokenNo: 4,
    patientId: 'UHID-2026-00031',
    patientName: 'Master Aarav Reddy',
    age: 7,
    gender: 'Male',
    mobileNumber: '9988776655',
    email: 'reddy.family@gmail.com',
    address: 'H.No 12-4, Madhapur',
    bloodGroup: 'AB+',
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    type: 'New',
    department: 'Pediatrics',
    reason: 'High grade fever and cough since 3 days',
    priority: 'Emergency',
    status: 'Arrived',
    paymentStatus: 'Paid',
    doctorId: 'DOC-104',
    doctorName: 'Dr. Rajesh Gupta',
    doctorSpecialization: 'MD, Pediatrics & Child Health',
    createdAt: new Date().toISOString(),
  },
];

@Component({
  selector: 'hms-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [
    `
      :host {
        display: block;
        padding-bottom: var(--sp-12);
      }

      /* ── Breadcrumb & Top Bar ── */
      .top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-4);
        flex-wrap: wrap;
        gap: var(--sp-3);
      }

      .crumb-bar {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: var(--text-xs);
        color: var(--text-secondary);
      }

      .crumb-bar a {
        color: var(--clr-primary-600);
        text-decoration: none;
      }

      .crumb-bar a:hover {
        text-decoration: underline;
      }

      .head-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }

      h1 {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-xl);
        color: var(--text-primary);
        letter-spacing: var(--ls-tight);
        margin: 0;
      }

      .subtitle {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-top: var(--sp-1);
      }

      /* ── Primary Action Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        padding: 8px 16px;
        border-radius: var(--radius-md);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
        text-decoration: none;
      }

      .btn-primary {
        background: #1e40af;
        color: #ffffff;
      }

      .btn-primary:hover {
        background: #1d4ed8;
      }

      .btn-outline {
        background: var(--bg-surface);
        color: var(--text-primary);
        border-color: var(--border-default);
      }

      .btn-outline:hover {
        background: var(--bg-card);
        border-color: var(--border-strong);
      }

      .btn-sm {
        padding: 4px 10px;
        font-size: 11px;
      }

      /* ── Tabs Strip ── */
      .tabs {
        display: flex;
        gap: var(--sp-1);
        border-bottom: 1px solid var(--border-default);
        margin-bottom: var(--sp-4);
      }

      .tab {
        padding: var(--sp-2) var(--sp-4);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        transition: all 0.15s;
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
      }

      .tab:hover {
        color: var(--text-primary);
      }

      .tab.active {
        color: #1e40af;
        border-bottom-color: #1e40af;
      }

      .tab-count {
        font-size: 11px;
        background: var(--clr-primary-50);
        color: #1e40af;
        padding: 1px 7px;
        border-radius: 99px;
      }

      /* ── Metric Summary Cards ── */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }

      .kpi-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-3) var(--sp-4);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .kpi-meta .kpi-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text-secondary);
        letter-spacing: 0.04em;
      }

      .kpi-meta .kpi-val {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin-top: 2px;
      }

      .kpi-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bg-blue { background: #eff6ff; color: #1e40af; }
      .bg-purple { background: #f5f3ff; color: #6d28d9; }
      .bg-amber { background: #fffbeb; color: #b45309; }
      .bg-green { background: #f0fdf4; color: #15803d; }
      .bg-rose { background: #fff1f2; color: #be123c; }

      /* ── Filter / Search Toolbar ── */
      .toolbar {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-3);
        margin-bottom: var(--sp-4);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--sp-3);
      }

      .search-box {
        position: relative;
        flex: 1;
        min-width: 240px;
      }

      .search-box svg {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
      }

      .search-input {
        width: 100%;
        padding: 8px 10px 8px 34px;
        font-size: var(--text-xs);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        outline: none;
      }

      .search-input:focus {
        border-color: #1e40af;
        box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
      }

      .filter-select {
        padding: 8px 12px;
        font-size: var(--text-xs);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        outline: none;
        cursor: pointer;
      }

      /* ── Table Container ── */
      .table-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-xs);
        text-align: left;
      }

      thead {
        background: #f8fafc;
        border-bottom: 1px solid var(--border-default);
      }

      th {
        padding: 10px 14px;
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary);
        white-space: nowrap;
      }

      td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-default);
        vertical-align: middle;
      }

      tbody tr:hover {
        background: #f8fafc;
      }

      /* ── Specific Cell Styling ── */
      .token-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-full);
        background: #1e40af;
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        margin-right: 6px;
      }

      .patient-name {
        font-weight: 600;
        color: var(--text-primary);
      }

      .sub-info {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 99px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .pill-normal { background: #f1f5f9; color: #475569; }
      .pill-urgent { background: #fef3c7; color: #b45309; }
      .pill-emergency { background: #fee2e2; color: #b91c1c; }

      .pill-confirmed { background: #eff6ff; color: #1d4ed8; }
      .pill-arrived { background: #f3e8ff; color: #7e22ce; }
      .pill-progress { background: #fef3c7; color: #d97706; }
      .pill-completed { background: #dcfce7; color: #15803d; }
      .pill-cancelled { background: #f1f5f9; color: #64748b; }

      .actions-cell {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      /* ── FORM SECTION STYLING (Add Appointment) ── */
      .form-wrapper {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-6);
      }

      .section-block {
        margin-bottom: var(--sp-6);
        padding-bottom: var(--sp-6);
        border-bottom: 1px solid var(--border-default);
      }

      .section-block:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        margin-bottom: var(--sp-4);
      }

      .section-header h2 {
        font-family: var(--font-display);
        font-size: var(--text-md);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }

      .sec-badge {
        font-size: 11px;
        font-weight: 700;
        background: #1e40af;
        color: #fff;
        width: 22px;
        height: 22px;
        border-radius: var(--radius-full);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--sp-4);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .field.col-span-2 {
        grid-column: span 2;
      }

      label {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-secondary);
        letter-spacing: 0.04em;
      }

      label .req {
        color: #dc2626;
        margin-left: 2px;
      }

      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        padding: 8px 12px;
        font-size: var(--text-xs);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        outline: none;
        transition: border-color 0.15s;
      }

      .form-input:focus,
      .form-select:focus,
      .form-textarea:focus {
        border-color: #1e40af;
        box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
      }

      .form-input[readonly] {
        background: #f1f5f9;
        cursor: not-allowed;
        font-weight: 600;
      }

      /* Radio group */
      .radio-group {
        display: flex;
        gap: var(--sp-4);
        align-items: center;
        height: 36px;
      }

      .radio-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-xs);
        cursor: pointer;
        text-transform: none;
        color: var(--text-primary);
        font-weight: normal;
      }

      .doctor-preview-card {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: var(--radius-md);
        padding: var(--sp-4);
        margin-top: var(--sp-4);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--sp-3);
      }

      .doc-meta-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: #1e40af;
      }

      .doc-meta-value {
        font-weight: 600;
        font-size: var(--text-xs);
        color: #0f172a;
        margin-top: 2px;
      }

      .form-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--sp-3);
        margin-top: var(--sp-6);
        padding-top: var(--sp-4);
        border-top: 1px solid var(--border-default);
      }

      /* Printable Token Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }

      .slip-card {
        background: #ffffff;
        border-radius: var(--radius-lg);
        width: 380px;
        padding: var(--sp-6);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        text-align: center;
      }

      .slip-header {
        border-bottom: 1px dashed #cbd5e1;
        padding-bottom: var(--sp-3);
        margin-bottom: var(--sp-4);
      }

      .slip-token {
        font-size: 36px;
        font-weight: 900;
        color: #1e40af;
        margin: var(--sp-2) 0;
      }

      .slip-rows {
        text-align: left;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: var(--sp-4);
      }

      .slip-row {
        display: flex;
        justify-content: space-between;
      }

      .slip-row .k { color: #64748b; }
      .slip-row .v { font-weight: 600; color: #0f172a; }
    `,
  ],
  template: `
    <!-- Top Breadcrumb & Navigation -->
    <div class="top-nav">
      <div class="crumb-bar">
        <a routerLink="/registration">← Back to Registration</a>
        <span>/</span>
        <span>Appointments</span>
        <span>/</span>
        <strong>Appointment List</strong>
      </div>
    </div>

    <!-- Main Heading Bar -->
    <div class="head-title">
      <div>
        <h1>Appointments Management</h1>
        <div class="subtitle">
          Manage OPD consultation queues, scheduled patient visits, and token slots
        </div>
      </div>
      <div>
        @if (activeTab() === 'list') {
          <button class="btn btn-primary" (click)="openAddForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Appointment
          </button>
        } @else {
          <button class="btn btn-outline" (click)="activeTab.set('list')">
            ← Back to Appointment List
          </button>
        }
      </div>
    </div>

    <!-- Mode Tabs: List View vs Add Form -->
    <div class="tabs">
      <button
        class="tab"
        [class.active]="activeTab() === 'list'"
        (click)="activeTab.set('list')"
      >
        <span>Appointment List</span>
        <span class="tab-count">{{ appointments().length }}</span>
      </button>

      <button
        class="tab"
        [class.active]="activeTab() === 'form'"
        (click)="openAddForm()"
      >
        <span>🏥 Add Appointment</span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- VIEW 1: APPOINTMENT LIST                                       -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    @if (activeTab() === 'list') {
      <!-- KPI Metric Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-meta">
            <div class="kpi-label">Total Appointments</div>
            <div class="kpi-val">{{ totalCount() }}</div>
          </div>
          <div class="kpi-icon bg-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-meta">
            <div class="kpi-label">Waiting in Queue</div>
            <div class="kpi-val">{{ waitingCount() }}</div>
          </div>
          <div class="kpi-icon bg-purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-meta">
            <div class="kpi-label">In-Consultation</div>
            <div class="kpi-val">{{ inProgressCount() }}</div>
          </div>
          <div class="kpi-icon bg-amber">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-meta">
            <div class="kpi-label">Completed Today</div>
            <div class="kpi-val">{{ completedCount() }}</div>
          </div>
          <div class="kpi-icon bg-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Search by patient name, mobile, UHID, or appointment ID..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
        </div>

        <select class="filter-select" [ngModel]="selectedDoctorFilter()" (ngModelChange)="selectedDoctorFilter.set($event)">
          <option value="ALL">All Doctors</option>
          @for (doc of doctors; track doc.id) {
            <option [value]="doc.name">{{ doc.name }}</option>
          }
        </select>

        <select class="filter-select" [ngModel]="selectedStatusFilter()" (ngModelChange)="selectedStatusFilter.set($event)">
          <option value="ALL">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Arrived">Arrived</option>
          <option value="In-Consultation">In-Consultation</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select class="filter-select" [ngModel]="selectedPriorityFilter()" (ngModelChange)="selectedPriorityFilter.set($event)">
          <option value="ALL">All Priorities</option>
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>

      <!-- Appointment Table -->
      <div class="table-card">
        @if (filteredAppointments().length === 0) {
          <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
            <p style="font-weight: 600; font-size: 14px;">No appointments found matching your filters.</p>
            <button class="btn btn-outline btn-sm" style="margin-top: 8px;" (click)="resetFilters()">
              Clear Filters
            </button>
          </div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Token & ID</th>
                <th>Patient Details</th>
                <th>Doctor & Dept</th>
                <th>Slot & Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (apt of filteredAppointments(); track apt.id) {
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <span class="token-badge">#{{ apt.tokenNo }}</span>
                      <div>
                        <strong style="color: #1e40af;">{{ apt.id }}</strong>
                        <div class="sub-info">{{ apt.time }} · {{ apt.date }}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="patient-name">{{ apt.patientName }}</div>
                    <div class="sub-info">
                      {{ apt.patientId }} · {{ apt.gender }}, {{ apt.age }}y · 📞 {{ apt.mobileNumber }}
                    </div>
                  </td>

                  <td>
                    <div style="font-weight: 600; color: var(--text-primary);">{{ apt.doctorName }}</div>
                    <div class="sub-info">{{ apt.department }}</div>
                  </td>

                  <td>
                    <div><strong>{{ apt.type }}</strong> Visit</div>
                    <div class="sub-info" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {{ apt.reason || 'General Consultation' }}
                    </div>
                  </td>

                  <td>
                    <span
                      class="pill"
                      [class.pill-normal]="apt.priority === 'Normal'"
                      [class.pill-urgent]="apt.priority === 'Urgent'"
                      [class.pill-emergency]="apt.priority === 'Emergency'"
                    >
                      {{ apt.priority }}
                    </span>
                  </td>

                  <td>
                    <span
                      class="pill"
                      [class.pill-confirmed]="apt.status === 'Confirmed'"
                      [class.pill-arrived]="apt.status === 'Arrived'"
                      [class.pill-progress]="apt.status === 'In-Consultation'"
                      [class.pill-completed]="apt.status === 'Completed'"
                      [class.pill-cancelled]="apt.status === 'Cancelled'"
                    >
                      ● {{ apt.status }}
                    </span>
                  </td>

                  <td style="text-align: right;">
                    <div class="actions-cell" style="justify-content: flex-end;">
                      @if (apt.status === 'Confirmed') {
                        <button class="btn btn-outline btn-sm" (click)="updateStatus(apt, 'Arrived')">
                          Arrive
                        </button>
                      }
                      @if (apt.status === 'Arrived') {
                        <button class="btn btn-primary btn-sm" (click)="updateStatus(apt, 'In-Consultation')">
                          Call Next
                        </button>
                      }
                      @if (apt.status === 'In-Consultation') {
                        <button class="btn btn-primary btn-sm" (click)="updateStatus(apt, 'Completed')">
                          Complete
                        </button>
                      }

                      <button class="btn btn-outline btn-sm" title="Print Token Slip" (click)="openSlip(apt)">
                        🖨️ Print
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    }

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- VIEW 2: ADD APPOINTMENT FORM                                    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    @if (activeTab() === 'form') {
      <div class="form-wrapper">
        <form (ngSubmit)="saveAppointment()">

          <!-- ── 1. PATIENT DETAILS ─────────────────────────────────── -->
          <div class="section-block">
            <div class="section-header">
              <span class="sec-badge">1</span>
              <h2>Patient Details</h2>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Patient ID (UHID)</label>
                <input type="text" class="form-input" [value]="formPatientId()" readonly />
              </div>

              <div class="field">
                <label>Patient Name <span class="req">*</span></label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Enter full patient name"
                  [(ngModel)]="formPatientName"
                  name="patientName"
                  required
                />
              </div>

              <div class="field">
                <label>Age <span class="req">*</span></label>
                <input
                  type="number"
                  class="form-input"
                  placeholder="Age (years)"
                  min="0"
                  max="125"
                  [(ngModel)]="formAge"
                  name="age"
                  required
                />
              </div>

              <div class="field">
                <label>Gender <span class="req">*</span></label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" [(ngModel)]="formGender" name="gender" value="Male" /> Male
                  </label>
                  <label class="radio-label">
                    <input type="radio" [(ngModel)]="formGender" name="gender" value="Female" /> Female
                  </label>
                  <label class="radio-label">
                    <input type="radio" [(ngModel)]="formGender" name="gender" value="Other" /> Other
                  </label>
                </div>
              </div>

              <div class="field">
                <label>Mobile Number <span class="req">*</span></label>
                <input
                  type="tel"
                  class="form-input"
                  placeholder="10-digit mobile number"
                  [(ngModel)]="formMobile"
                  name="mobile"
                  maxlength="10"
                  required
                />
              </div>

              <div class="field">
                <label>Email Address <span style="font-weight: normal; color: var(--text-secondary);">(optional)</span></label>
                <input
                  type="email"
                  class="form-input"
                  placeholder="patient@example.com"
                  [(ngModel)]="formEmail"
                  name="email"
                />
              </div>

              <div class="field">
                <label>Blood Group <span style="font-weight: normal; color: var(--text-secondary);">(optional)</span></label>
                <select class="form-select" [(ngModel)]="formBloodGroup" name="bloodGroup">
                  <option value="">Select Blood Group...</option>
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

              <div class="field col-span-2">
                <label>Address <span style="font-weight: normal; color: var(--text-secondary);">(optional)</span></label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="City, locality, house/flat number"
                  [(ngModel)]="formAddress"
                  name="address"
                />
              </div>
            </div>
          </div>

          <!-- ── 2. APPOINTMENT DETAILS ──────────────────────────────── -->
          <div class="section-block">
            <div class="section-header">
              <span class="sec-badge">2</span>
              <h2>Appointment Details</h2>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Appointment ID</label>
                <input type="text" class="form-input" [value]="formAppointmentId()" readonly />
              </div>

              <div class="field">
                <label>Appointment Date <span class="req">*</span></label>
                <input
                  type="date"
                  class="form-input"
                  [(ngModel)]="formDate"
                  name="date"
                  required
                />
              </div>

              <div class="field">
                <label>Appointment Time Slot <span class="req">*</span></label>
                <select class="form-select" [(ngModel)]="formTime" name="time" required>
                  <option value="">Select Slot...</option>
                  <option value="09:00 AM">09:00 AM - 09:30 AM</option>
                  <option value="09:30 AM">09:30 AM - 10:00 AM</option>
                  <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                  <option value="10:30 AM">10:30 AM - 11:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                  <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                  <option value="12:00 PM">12:00 PM - 12:30 PM</option>
                  <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                  <option value="03:00 PM">03:00 PM - 03:30 PM</option>
                  <option value="04:00 PM">04:00 PM - 04:30 PM</option>
                  <option value="05:00 PM">05:00 PM - 05:30 PM</option>
                  <option value="06:00 PM">06:00 PM - 06:30 PM</option>
                </select>
              </div>

              <div class="field">
                <label>Appointment Type <span class="req">*</span></label>
                <select class="form-select" [(ngModel)]="formType" name="type" required>
                  <option value="New">New Consultation</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div class="field">
                <label>Priority <span class="req">*</span></label>
                <select class="form-select" [(ngModel)]="formPriority" name="priority" required>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div class="field col-span-2">
                <label>Reason for Visit / Symptoms</label>
                <textarea
                  class="form-textarea"
                  rows="2"
                  placeholder="e.g. Fever since 2 days, headache, blood pressure monitoring..."
                  [(ngModel)]="formReason"
                  name="reason"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ── 3. DOCTOR DETAILS (DROPDOWN AUTO-SELECTION) ─────────── -->
          <div class="section-block">
            <div class="section-header">
              <span class="sec-badge">3</span>
              <h2>Doctor Details</h2>
            </div>

            <div class="form-grid">
              <div class="field col-span-2">
                <label>Select Doctor <span class="req">*</span></label>
                <select
                  class="form-select"
                  [ngModel]="selectedDoctorId"
                  (ngModelChange)="onDoctorSelected($event)"
                  name="selectedDoctor"
                  required
                >
                  <option value="">-- Choose Doctor from Dropdown --</option>
                  @for (doc of doctors; track doc.id) {
                    <option [value]="doc.id">
                      {{ doc.name }} ({{ doc.specialization }}) · {{ doc.department }}
                    </option>
                  }
                </select>
              </div>
            </div>

            <!-- Auto-populated Doctor Info Card -->
            @if (selectedDoctor(); as d) {
              <div class="doctor-preview-card">
                <div>
                  <div class="doc-meta-label">Doctor ID</div>
                  <div class="doc-meta-value">{{ d.id }}</div>
                </div>

                <div>
                  <div class="doc-meta-label">Doctor Name</div>
                  <div class="doc-meta-value">{{ d.name }}</div>
                </div>

                <div>
                  <div class="doc-meta-label">Department</div>
                  <div class="doc-meta-value">{{ d.department }}</div>
                </div>

                <div>
                  <div class="doc-meta-label">Specialization</div>
                  <div class="doc-meta-value">{{ d.specialization }}</div>
                </div>

                <div>
                  <div class="doc-meta-label">Available Timings</div>
                  <div class="doc-meta-value">🕒 {{ d.availableTime }}</div>
                </div>

                <div>
                  <div class="doc-meta-label">Consultation Room</div>
                  <div class="doc-meta-value">🚪 {{ d.roomNo }}</div>
                </div>
              </div>
            }
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="activeTab.set('list')">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!formPatientName || !formAge || !formMobile || !selectedDoctorId || !formDate || !formTime"
            >
              Confirm & Book Appointment
            </button>
          </div>
        </form>
      </div>
    }

    <!-- Token Print Slip Modal -->
    @if (activeSlip(); as slip) {
      <div class="modal-overlay" (click)="closeSlip()">
        <div class="slip-card" (click)="$event.stopPropagation()">
          <div class="slip-header">
            <h3 style="margin: 0; color: #1e40af; font-size: 16px;">CITY CARE HOSPITAL & MEDICAL CENTER</h3>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">OPD APPOINTMENT TOKEN SLIP</div>
          </div>

          <div style="font-size: 11px; color: #64748b;">TOKEN NUMBER</div>
          <div class="slip-token">#{{ slip.tokenNo }}</div>

          <div class="slip-rows">
            <div class="slip-row">
              <span class="k">Appointment ID:</span>
              <span class="v">{{ slip.id }}</span>
            </div>
            <div class="slip-row">
              <span class="k">Date & Time:</span>
              <span class="v">{{ slip.date }} · {{ slip.time }}</span>
            </div>
            <div class="slip-row">
              <span class="k">Patient Name:</span>
              <span class="v">{{ slip.patientName }} ({{ slip.gender }}, {{ slip.age }}y)</span>
            </div>
            <div class="slip-row">
              <span class="k">UHID:</span>
              <span class="v">{{ slip.patientId }}</span>
            </div>
            <div class="slip-row">
              <span class="k">Doctor:</span>
              <span class="v">{{ slip.doctorName }}</span>
            </div>
            <div class="slip-row">
              <span class="k">Department:</span>
              <span class="v">{{ slip.department }}</span>
            </div>
            <div class="slip-row">
              <span class="k">Priority / Type:</span>
              <span class="v">{{ slip.priority }} · {{ slip.type }}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 16px;">
            <button class="btn btn-primary btn-sm" (click)="printSlip()">
              🖨️ Print Slip
            </button>
            <button class="btn btn-outline btn-sm" (click)="closeSlip()">
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppointmentListPage implements OnInit {
  doctors = DOCTOR_CATALOG;
  appointments = signal<Appointment[]>(INITIAL_APPOINTMENTS);

  activeTab = signal<'list' | 'form'>('list');
  searchQuery = signal('');
  selectedDoctorFilter = signal('ALL');
  selectedStatusFilter = signal('ALL');
  selectedPriorityFilter = signal('ALL');

  // Form Signals & Models
  formPatientId = signal('UHID-2026-00042');
  formAppointmentId = signal('APT-2026-00105');
  formPatientName = '';
  formAge: number | null = null;
  formGender: 'Male' | 'Female' | 'Other' = 'Male';
  formMobile = '';
  formEmail = '';
  formAddress = '';
  formBloodGroup = '';

  formDate = new Date().toISOString().split('T')[0];
  formTime = '10:00 AM';
  formType: 'New' | 'Follow-up' | 'Emergency' = 'New';
  formPriority: 'Normal' | 'Urgent' | 'Emergency' = 'Normal';
  formReason = '';

  selectedDoctorId = '';
  selectedDoctor = signal<Doctor | null>(null);

  // Active slip for printing
  activeSlip = signal<Appointment | null>(null);

  ngOnInit(): void {
    const saved = localStorage.getItem('hms_appointments');
    if (saved) {
      try {
        this.appointments.set(JSON.parse(saved));
      } catch {
        // use default
      }
    }
  }

  // ── Counters ──
  totalCount = computed(() => this.appointments().length);
  waitingCount = computed(() => this.appointments().filter((a) => a.status === 'Arrived').length);
  inProgressCount = computed(() => this.appointments().filter((a) => a.status === 'In-Consultation').length);
  completedCount = computed(() => this.appointments().filter((a) => a.status === 'Completed').length);

  // ── Filtered List ──
  filteredAppointments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const doc = this.selectedDoctorFilter();
    const st = this.selectedStatusFilter();
    const prio = this.selectedPriorityFilter();

    return this.appointments().filter((a) => {
      const matchQuery =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        a.mobileNumber.includes(q) ||
        a.patientId.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q);

      const matchDoc = doc === 'ALL' || a.doctorName === doc;
      const matchStatus = st === 'ALL' || a.status === st;
      const matchPrio = prio === 'ALL' || a.priority === prio;

      return matchQuery && matchDoc && matchStatus && matchPrio;
    });
  });

  openAddForm(): void {
    const nextNum = this.appointments().length + 1;
    this.formPatientId.set(`UHID-2026-${String(nextNum + 40).padStart(5, '0')}`);
    this.formAppointmentId.set(`APT-2026-${String(nextNum + 100).padStart(5, '0')}`);
    this.formPatientName = '';
    this.formAge = null;
    this.formMobile = '';
    this.formEmail = '';
    this.formAddress = '';
    this.formBloodGroup = '';
    this.formReason = '';
    this.selectedDoctorId = '';
    this.selectedDoctor.set(null);
    this.activeTab.set('form');
  }

  onDoctorSelected(docId: string): void {
    this.selectedDoctorId = docId;
    const found = this.doctors.find((d) => d.id === docId) || null;
    this.selectedDoctor.set(found);
  }

  saveAppointment(): void {
    if (!this.formPatientName || !this.formAge || !this.formMobile || !this.selectedDoctor()) {
      return;
    }

    const doc = this.selectedDoctor()!;
    const newApt: Appointment = {
      id: this.formAppointmentId(),
      tokenNo: this.appointments().length + 1,
      patientId: this.formPatientId(),
      patientName: this.formPatientName,
      age: Number(this.formAge),
      gender: this.formGender,
      mobileNumber: this.formMobile,
      email: this.formEmail || undefined,
      address: this.formAddress || undefined,
      bloodGroup: this.formBloodGroup || undefined,
      date: this.formDate,
      time: this.formTime,
      type: this.formType,
      department: doc.department,
      reason: this.formReason || undefined,
      priority: this.formPriority,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
      createdAt: new Date().toISOString(),
    };

    const updated = [newApt, ...this.appointments()];
    this.appointments.set(updated);
    localStorage.setItem('hms_appointments', JSON.stringify(updated));

    // Show slip for the newly created appointment
    this.activeSlip.set(newApt);
    this.activeTab.set('list');
  }

  updateStatus(apt: Appointment, newStatus: Appointment['status']): void {
    const updated = this.appointments().map((a) =>
      a.id === apt.id ? { ...a, status: newStatus } : a,
    );
    this.appointments.set(updated);
    localStorage.setItem('hms_appointments', JSON.stringify(updated));
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedDoctorFilter.set('ALL');
    this.selectedStatusFilter.set('ALL');
    this.selectedPriorityFilter.set('ALL');
  }

  openSlip(apt: Appointment): void {
    this.activeSlip.set(apt);
  }

  closeSlip(): void {
    this.activeSlip.set(null);
  }

  printSlip(): void {
    window.print();
  }
}
