import { Component, OnInit, computed, signal } from '@angular/core';
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
  id: string;
  tokenNo: number;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  type: 'New' | 'Follow-up' | 'Emergency';
  department: string;
  reason?: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  status: 'Confirmed' | 'Arrived' | 'In-Consultation' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Insurance';
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  createdAt: string;
}

const DOCTORS: Doctor[] = [
  {
    id: 'DOC-101',
    name: 'Dr. Krishna P Padagala',
    specialization: 'MD, General Medicine',
    department: 'General Medicine',
    availableTime: '09:00 AM - 01:00 PM',
    roomNo: 'OPD Room 102',
  },
  {
    id: 'DOC-102',
    name: 'Dr. Arun Sharma',
    specialization: 'DM, Cardiology',
    department: 'Cardiology',
    availableTime: '10:00 AM - 02:00 PM',
    roomNo: 'Cardio Suite 204',
  },
  {
    id: 'DOC-103',
    name: 'Dr. Priya Verma',
    specialization: 'MS, Orthopedics',
    department: 'Orthopedics',
    availableTime: '11:00 AM - 03:00 PM',
    roomNo: 'Ortho Clinic 108',
  },
  {
    id: 'DOC-104',
    name: 'Dr. Rajesh Gupta',
    specialization: 'MD, Pediatrics',
    department: 'Pediatrics',
    availableTime: '09:30 AM - 01:30 PM',
    roomNo: 'Pediatric Wing 105',
  },
];

@Component({
  selector: 'hms-appointment-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [
    `
      :host {
        display: block;
        padding-bottom: 3rem;
      }

      /* ── Breadcrumb & Top Bar ── */
      .top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .crumb-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 13px;
        color: #64748b;
      }

      .crumb-bar a {
        color: #2563eb;
        text-decoration: none;
      }

      .crumb-bar a:hover {
        text-decoration: underline;
      }

      /* ── Header with Right-Side Dropdowns ── */
      .calendar-page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .page-title-group h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .page-subtitle {
        font-size: 12px;
        color: #64748b;
        margin-top: 3px;
      }

      /* 3 Dropdown Buttons in Right Corner */
      .dropdown-controls-group {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #ffffff;
        padding: 6px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .dropdown-label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .filter-select-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .top-dropdown {
        appearance: none;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 6px 26px 6px 10px;
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
        cursor: pointer;
        outline: none;
        transition: all 0.15s ease;
      }

      .top-dropdown:focus,
      .top-dropdown:hover {
        border-color: #1e40af;
        background: #ffffff;
      }

      .select-chevron {
        position: absolute;
        right: 8px;
        pointer-events: none;
        color: #64748b;
      }

      /* ── 4 Top KPI Cards ── */
      .kpi-cards-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      @media (max-width: 960px) {
        .kpi-cards-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 540px) {
        .kpi-cards-grid {
          grid-template-columns: 1fr;
        }
      }

      .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.1rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        position: relative;
        overflow: hidden;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .kpi-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }

      .card-total::before { background: #2563eb; }
      .card-completed::before { background: #16a34a; }
      .card-pending::before { background: #d97706; }
      .card-cancelled::before { background: #dc2626; }

      .kpi-info-col {
        display: flex;
        flex-direction: column;
      }

      .kpi-label {
        font-size: 12px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        margin-bottom: 4px;
      }

      .kpi-value {
        font-size: 1.85rem;
        font-weight: 800;
        line-height: 1;
        color: #0f172a;
      }

      .kpi-subtext {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 4px;
      }

      .kpi-icon-badge {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .badge-total { background: #eff6ff; color: #1e40af; }
      .badge-completed { background: #f0fdf4; color: #15803d; }
      .badge-pending { background: #fffbeb; color: #b45309; }
      .badge-cancelled { background: #fef2f2; color: #b91c1c; }

      /* ── Big Structured Calendar (Clean White Modern UI) ── */
      .big-calendar-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        margin-bottom: 1.5rem;
        overflow: hidden;
      }

      .calendar-banner {
        background: #ffffff;
        border-bottom: 1px solid #f1f5f9;
        padding: 0.85rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .cal-period-title {
        font-size: 1rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .quick-actions-bar {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-today-pill {
        border: 1px solid #bfdbfe;
        background: #eff6ff;
        color: #1e40af;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-today-pill:hover {
        background: #dbeafe;
      }

      .cal-legend-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
      }

      .cal-legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .legend-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }

      /* Calendar Days Grid */
      .cal-weekdays-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: #fafbfc;
        border-bottom: 1px solid #f1f5f9;
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        padding: 9px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .cal-grid-body {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: #f1f5f9;
        gap: 1px;
        border: 1px solid #f1f5f9;
      }

      /* Date Cell (Normal Calendar Format with Color Points on Every Date) */
      .date-block-cell {
        background: #ffffff;
        min-height: 54px;
        padding: 6px 4px 4px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        cursor: pointer;
        position: relative;
        transition: background 0.12s ease, box-shadow 0.12s ease;
      }

      .date-block-cell:hover {
        background: #f8fafc;
      }

      .date-block-cell.is-other-month {
        background: #fcfcfd;
        opacity: 0.35;
      }

      .date-block-cell.is-selected {
        background: #eff6ff !important;
        box-shadow: inset 0 0 0 2px #2563eb;
        z-index: 2;
      }

      /* Date Number Circle */
      .date-number-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
        transition: all 0.15s ease;
      }

      .date-block-cell.is-today .date-number-badge {
        background-color: #1e40af !important;
        color: #ffffff !important;
        font-weight: 800 !important;
        box-shadow: 0 1px 4px rgba(30, 64, 175, 0.4);
      }

      /* Color Points Row (Present on EVERY Date, Zero Text) */
      .color-points-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 14px;
      }

      .color-point {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
      }

      .point-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
      }

      .pt-blue { color: #1e40af; }
      .pt-blue .point-dot { background-color: #2563eb; }

      .pt-green { color: #15803d; }
      .pt-green .point-dot { background-color: #16a34a; }

      .pt-amber { color: #b45309; }
      .pt-amber .point-dot { background-color: #f59e0b; }

      .pt-red { color: #b91c1c; }
      .pt-red .point-dot { background-color: #dc2626; }

      .color-point.is-zero {
        opacity: 0.35;
        color: #94a3b8;
      }
      .color-point.is-zero .point-dot {
        opacity: 0.35;
      }

      /* ── Detailed Table for Selected Date ── */
      .selected-date-section {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        overflow: hidden;
      }

      .table-header-banner {
        background: #f8fafc;
        border-bottom: 1px solid #cbd5e1;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .table-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .date-count-pill {
        background: #1e40af;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }

      th {
        background: #f8fafc;
        text-align: left;
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 12px 14px;
        border-bottom: 1px solid #f1f5f9;
        color: #1e293b;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }

      .token-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: #1e40af;
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        margin-right: 6px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
      }

      .st-completed { background: #dcfce7; color: #15803d; }
      .st-pending { background: #fef3c7; color: #b45309; }
      .st-cancelled { background: #fee2e2; color: #b91c1c; text-decoration: line-through; }
      .st-confirmed { background: #dbeafe; color: #1e40af; }
      .st-inconsultation { background: #f3e8ff; color: #6b21a8; }

      .prio-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .prio-normal { background: #f1f5f9; color: #475569; }
      .prio-urgent { background: #ffedd5; color: #c2410c; }
      .prio-emergency { background: #fee2e2; color: #dc2626; font-weight: 800; }

      .empty-date-state {
        padding: 3.5rem 1rem;
        text-align: center;
        color: #64748b;
      }

      .btn-outline-sm {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #1e40af;
        font-weight: 700;
        font-size: 11px;
        padding: 5px 12px;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s ease;
      }

      .btn-outline-sm:hover {
        background: #eff6ff;
        border-color: #1e40af;
      }
    `,
  ],
  template: `
    <!-- Top Breadcrumb -->
    <div class="top-nav">
      <div class="crumb-bar">
        <a routerLink="/dashboard">Home</a>
        <span>›</span>
        <a routerLink="/registration">Registration</a>
        <span>›</span>
        <a routerLink="/registration/appointments/list">Appointments</a>
        <span>›</span>
        <strong style="color: #0f172a;">Calendar Dashboard</strong>
      </div>

      <a routerLink="/registration/appointments/list" class="btn-outline-sm">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Switch to List View
      </a>
    </div>

    <!-- Header Section with 3 Dropdowns at Top-Right Corner -->
    <div class="calendar-page-header">
      <div class="page-title-group">
        <h1>
          📅 Appointments Calendar
        </h1>
        <div class="page-subtitle">
          Dynamic calendar metrics with time-period filters and drill-down appointment details
        </div>
      </div>

      <!-- 3 Dropdown Buttons (Years, Months, Weeks) in Top Right Corner -->
      <div class="dropdown-controls-group">
        <!-- 1. Year Dropdown -->
        <div class="filter-select-box">
          <select
            class="top-dropdown"
            [ngModel]="selectedYear()"
            (ngModelChange)="onYearChange($event)"
            title="Filter by Year"
          >
            @for (y of availableYears; track y) {
              <option [value]="y">Year: {{ y }}</option>
            }
          </select>
          <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        <!-- 2. Month Dropdown -->
        <div class="filter-select-box">
          <select
            class="top-dropdown"
            [ngModel]="selectedMonth()"
            (ngModelChange)="onMonthChange($event)"
            title="Filter by Month"
          >
            <option value="ALL">All Months</option>
            @for (m of monthNames; track $index) {
              <option [value]="$index">{{ m }}</option>
            }
          </select>
          <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        <!-- 3. Week Dropdown -->
        <div class="filter-select-box">
          <select
            class="top-dropdown"
            [ngModel]="selectedWeek()"
            (ngModelChange)="selectedWeek.set($event)"
            title="Filter by Week"
          >
            <option value="ALL">All Weeks</option>
            <option value="W1">Week 1 (1st - 7th)</option>
            <option value="W2">Week 2 (8th - 14th)</option>
            <option value="W3">Week 3 (15th - 21st)</option>
            <option value="W4">Week 4 (22nd - 28th)</option>
            <option value="W5">Week 5 (29th - End)</option>
          </select>
          <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════ -->
    <!-- TOP 4 KPI CARDS (Data dynamic based on Year, Month, Week)          -->
    <!-- ═════════════════════════════════════════════════════════════════ -->
    <div class="kpi-cards-grid">
      <!-- 1. Total Appointments -->
      <div class="kpi-card card-total">
        <div class="kpi-info-col">
          <span class="kpi-label">Total Appointments</span>
          <span class="kpi-value">{{ kpiTotal() }}</span>
          <span class="kpi-subtext">Selected period total</span>
        </div>
        <div class="kpi-icon-badge badge-total">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
      </div>

      <!-- 2. Completed Appointments -->
      <div class="kpi-card card-completed">
        <div class="kpi-info-col">
          <span class="kpi-label">Completed</span>
          <span class="kpi-value" style="color: #15803d;">{{ kpiCompleted() }}</span>
          <span class="kpi-subtext">Consultations done</span>
        </div>
        <div class="kpi-icon-badge badge-completed">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
      </div>

      <!-- 3. Pending Appointments -->
      <div class="kpi-card card-pending">
        <div class="kpi-info-col">
          <span class="kpi-label">Pending</span>
          <span class="kpi-value" style="color: #b45309;">{{ kpiPending() }}</span>
          <span class="kpi-subtext">Awaiting / In-progress</span>
        </div>
        <div class="kpi-icon-badge badge-pending">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>

      <!-- 4. Cancelled Appointments -->
      <div class="kpi-card card-cancelled">
        <div class="kpi-info-col">
          <span class="kpi-label">Cancelled</span>
          <span class="kpi-value" style="color: #b91c1c;">{{ kpiCancelled() }}</span>
          <span class="kpi-subtext">Revoked appointments</span>
        </div>
        <div class="kpi-icon-badge badge-cancelled">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════ -->
    <!-- BIG STRUCTURED CALENDAR (Clean & Structured with 4 Counters/Cell)  -->
    <!-- ═════════════════════════════════════════════════════════════════ -->
    <div class="big-calendar-card">
      <div class="calendar-banner">
        <div class="cal-period-title">
          <span>{{ calendarHeaderTitle() }}</span>
          <button type="button" class="btn-today-pill" (click)="goToToday()">
            Go to Today
          </button>
        </div>

        <div class="cal-legend-row">
          <div class="cal-legend-item">
            <span class="legend-dot" style="background: #3b82f6;"></span>
            <span>Total</span>
          </div>
          <div class="cal-legend-item">
            <span class="legend-dot" style="background: #22c55e;"></span>
            <span>Completed</span>
          </div>
          <div class="cal-legend-item">
            <span class="legend-dot" style="background: #f59e0b;"></span>
            <span>Pending</span>
          </div>
          <div class="cal-legend-item">
            <span class="legend-dot" style="background: #ef4444;"></span>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      <!-- Week Days Header -->
      <div class="cal-weekdays-header">
        <div>Sunday</div>
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
        <div>Saturday</div>
      </div>

      <!-- Calendar Days Grid -->
      <div class="cal-grid-body">
        @for (cell of calendarCells(); track cell.key) {
          <div
            class="date-block-cell"
            [class.is-other-month]="!cell.isCurrentMonth"
            [class.is-today]="cell.isToday"
            [class.is-selected]="cell.dateStr === selectedDate()"
            (click)="selectDate(cell.dateStr)"
            [title]="cell.dateStr + ' (Total: ' + cell.totalCount + ', Completed: ' + cell.completedCount + ', Pending: ' + cell.pendingCount + ', Cancelled: ' + cell.cancelledCount + ')'"
          >
            <!-- Date Number Badge (Today is Blue) -->
            <span class="date-number-badge">{{ cell.dayNum }}</span>

            <!-- Color Points (Dots + count only; empty days remain clean and blank) -->
            <div class="color-points-row">
              @if (cell.totalCount > 0) {
                <span class="color-point pt-blue" title="Total Appointments: {{ cell.totalCount }}">
                  <span class="point-dot"></span>{{ cell.totalCount }}
                </span>
                @if (cell.completedCount > 0) {
                  <span class="color-point pt-green" title="Completed: {{ cell.completedCount }}">
                    <span class="point-dot"></span>{{ cell.completedCount }}
                  </span>
                }
                @if (cell.pendingCount > 0) {
                  <span class="color-point pt-amber" title="Pending: {{ cell.pendingCount }}">
                    <span class="point-dot"></span>{{ cell.pendingCount }}
                  </span>
                }
                @if (cell.cancelledCount > 0) {
                  <span class="color-point pt-red" title="Cancelled: {{ cell.cancelledCount }}">
                    <span class="point-dot"></span>{{ cell.cancelledCount }}
                  </span>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════ -->
    <!-- COMPLETE DATA TABLE PRESENTED ON DATE CLICK                      -->
    <!-- ═════════════════════════════════════════════════════════════════ -->
    <div class="selected-date-section">
      <div class="table-header-banner">
        <div class="table-title">
          <span>📋 Appointments for {{ formatFullDate(selectedDate()) }}</span>
          <span class="date-count-pill">{{ selectedDateAppointments().length }} Records</span>
        </div>

        <div style="font-size: 12px; color: #64748b;">
          Clicking any date block above displays that day's complete data
        </div>
      </div>

      @if (selectedDateAppointments().length === 0) {
        <div class="empty-date-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 8px;">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div style="font-size: 14px; font-weight: 700; color: #334155;">
            No appointments scheduled for {{ formatFullDate(selectedDate()) }}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 12px 0;">
            Select another date from the calendar or book an appointment.
          </p>
          <a routerLink="/registration/appointments/list" class="btn-outline-sm">
            + Book Appointment in List
          </a>
        </div>
      } @else {
        <div style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>Token & ID</th>
                <th>Patient Details</th>
                <th>Doctor & Department</th>
                <th>Slot & Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              @for (apt of selectedDateAppointments(); track apt.id) {
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <span class="token-badge">#{{ apt.tokenNo }}</span>
                      <div>
                        <strong style="color: #1e40af;">{{ apt.id }}</strong>
                        <div style="font-size: 11px; color: #64748b;">{{ apt.time }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #0f172a;">{{ apt.patientName }}</div>
                    <div style="font-size: 11px; color: #64748b;">
                      {{ apt.patientId }} · {{ apt.gender }}, {{ apt.age }}y · 📞 {{ apt.mobileNumber }}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #1e293b;">{{ apt.doctorName }}</div>
                    <div style="font-size: 11px; color: #64748b;">{{ apt.department }}</div>
                  </td>
                  <td>
                    <div><strong>{{ apt.time }}</strong></div>
                    <div style="font-size: 11px; color: #64748b;">Type: {{ apt.type }}</div>
                  </td>
                  <td>
                    <span
                      class="prio-badge"
                      [class.prio-normal]="apt.priority === 'Normal'"
                      [class.prio-urgent]="apt.priority === 'Urgent'"
                      [class.prio-emergency]="apt.priority === 'Emergency'"
                    >
                      {{ apt.priority }}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="getStatusPillClass(apt.status)">
                      ● {{ apt.status }}
                    </span>
                  </td>
                  <td>
                    <span style="font-weight: 600; color: #15803d; font-size: 11px;">
                      {{ apt.paymentStatus }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AppointmentCalendarPage implements OnInit {
  today = new Date();
  todayStr = this.today.toISOString().split('T')[0];

  availableYears = [2025, 2026, 2027, 2028];
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Top Right Dropdown Filters
  selectedYear = signal<number>(this.today.getFullYear());
  selectedMonth = signal<string | number>(this.today.getMonth()); // 0-indexed or 'ALL'
  selectedWeek = signal<string>('ALL'); // 'ALL', 'W1', 'W2', 'W3', 'W4', 'W5'

  // Selected date for detailed table view
  selectedDate = signal<string>(this.todayStr);

  // Appointments store
  appointments = signal<Appointment[]>([]);

  ngOnInit(): void {
    const saved = localStorage.getItem('hms_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.appointments.set(parsed);
          return;
        }
      } catch {
        // fallback to seed
      }
    }

    // Default Seed Appointments across multiple dates of the current month
    const seed = this.createSeedAppointments();
    this.appointments.set(seed);
    localStorage.setItem('hms_appointments', JSON.stringify(seed));
  }

  // Handle dropdown changes
  onYearChange(newYear: any): void {
    this.selectedYear.set(Number(newYear));
    this.syncSelectedDateToCurrentView();
  }

  onMonthChange(newMonth: any): void {
    this.selectedMonth.set(newMonth === 'ALL' ? 'ALL' : Number(newMonth));
    this.syncSelectedDateToCurrentView();
  }

  syncSelectedDateToCurrentView(): void {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const currentM = m === 'ALL' ? this.today.getMonth() : Number(m);
    // If today is in the selected month & year, select today; otherwise select 1st of month
    if (this.today.getFullYear() === y && this.today.getMonth() === currentM) {
      this.selectedDate.set(this.todayStr);
    } else {
      const dStr = `${y}-${String(currentM + 1).padStart(2, '0')}-01`;
      this.selectedDate.set(dStr);
    }
  }

  goToToday(): void {
    this.selectedYear.set(this.today.getFullYear());
    this.selectedMonth.set(this.today.getMonth());
    this.selectedWeek.set('ALL');
    this.selectedDate.set(this.todayStr);
  }

  selectDate(dateStr: string): void {
    this.selectedDate.set(dateStr);
  }

  // ── Filtered Appointments based on Year, Month, Week Dropdowns ──
  filteredAppointmentsByPeriod = computed(() => {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const w = this.selectedWeek();

    return this.appointments().filter((a) => {
      if (!a.date) return false;
      const parts = a.date.split('-');
      if (parts.length !== 3) return false;
      const aptYear = Number(parts[0]);
      const aptMonth = Number(parts[1]) - 1; // 0-indexed
      const aptDay = Number(parts[2]);

      // Year match
      if (aptYear !== y) return false;

      // Month match
      if (m !== 'ALL' && aptMonth !== Number(m)) return false;

      // Week match
      if (w !== 'ALL') {
        if (w === 'W1' && (aptDay < 1 || aptDay > 7)) return false;
        if (w === 'W2' && (aptDay < 8 || aptDay > 14)) return false;
        if (w === 'W3' && (aptDay < 15 || aptDay > 21)) return false;
        if (w === 'W4' && (aptDay < 22 || aptDay > 28)) return false;
        if (w === 'W5' && aptDay < 29) return false;
      }

      return true;
    });
  });

  // ── Top 4 KPI Metrics (Dynamic based on selected time period) ──
  kpiTotal = computed(() => this.filteredAppointmentsByPeriod().length);

  kpiCompleted = computed(
    () => this.filteredAppointmentsByPeriod().filter((a) => a.status === 'Completed').length,
  );

  kpiPending = computed(
    () =>
      this.filteredAppointmentsByPeriod().filter((a) =>
        ['Confirmed', 'Arrived', 'In-Consultation'].includes(a.status),
      ).length,
  );

  kpiCancelled = computed(
    () => this.filteredAppointmentsByPeriod().filter((a) => a.status === 'Cancelled').length,
  );

  // ── Calendar Title ──
  calendarHeaderTitle = computed(() => {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const w = this.selectedWeek();
    let mLabel = m === 'ALL' ? 'All Months' : this.monthNames[Number(m)];
    let wLabel = w === 'ALL' ? '' : ` · ${w}`;
    return `${mLabel} ${y}${wLabel}`;
  });

  // ── Calendar Days Grid (Structured with 4 counters in each cell) ──
  calendarCells = computed(() => {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const currentM = m === 'ALL' ? this.today.getMonth() : Number(m);
    const today = this.todayStr;
    const allApts = this.appointments();

    const firstDayIndex = new Date(y, currentM, 1).getDay();
    const daysInMonth = new Date(y, currentM + 1, 0).getDate();
    const prevMonthDays = new Date(y, currentM, 0).getDate();

    const cells: Array<{
      key: string;
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      totalCount: number;
      completedCount: number;
      pendingCount: number;
      cancelledCount: number;
    }> = [];

    // Helper to calculate cell counters
    const getCounts = (dateStr: string) => {
      const dayApts = allApts.filter((a) => a.date === dateStr);
      const total = dayApts.length;
      const completed = dayApts.filter((a) => a.status === 'Completed').length;
      const pending = dayApts.filter((a) =>
        ['Confirmed', 'Arrived', 'In-Consultation'].includes(a.status),
      ).length;
      const cancelled = dayApts.filter((a) => a.status === 'Cancelled').length;
      return { total, completed, pending, cancelled };
    };

    // Previous month overflow
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      const prevM = currentM === 0 ? 11 : currentM - 1;
      const prevY = currentM === 0 ? y - 1 : y;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      const counts = getCounts(dateStr);
      cells.push({
        key: `prev-${dNum}`,
        dayNum: dNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        totalCount: counts.total,
        completedCount: counts.completed,
        pendingCount: counts.pending,
        cancelledCount: counts.cancelled,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(currentM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const counts = getCounts(dateStr);
      cells.push({
        key: `curr-${d}`,
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        totalCount: counts.total,
        completedCount: counts.completed,
        pendingCount: counts.pending,
        cancelledCount: counts.cancelled,
      });
    }

    // Next month overflow (complete 35 or 42 slots)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let n = 1; n <= remaining; n++) {
      const nextM = currentM === 11 ? 0 : currentM + 1;
      const nextY = currentM === 11 ? y + 1 : y;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      const counts = getCounts(dateStr);
      cells.push({
        key: `next-${n}`,
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        totalCount: counts.total,
        completedCount: counts.completed,
        pendingCount: counts.pending,
        cancelledCount: counts.cancelled,
      });
    }

    // If Week filter is applied, only return days belonging to that week
    const w = this.selectedWeek();
    if (w !== 'ALL') {
      return cells.filter((c) => {
        if (!c.isCurrentMonth) return false;
        if (w === 'W1') return c.dayNum >= 1 && c.dayNum <= 7;
        if (w === 'W2') return c.dayNum >= 8 && c.dayNum <= 14;
        if (w === 'W3') return c.dayNum >= 15 && c.dayNum <= 21;
        if (w === 'W4') return c.dayNum >= 22 && c.dayNum <= 28;
        if (w === 'W5') return c.dayNum >= 29;
        return true;
      });
    }

    return cells;
  });

  // ── Selected Date Appointments for Table ──
  selectedDateAppointments = computed(() => {
    const dt = this.selectedDate();
    return this.appointments().filter((a) => a.date === dt);
  });

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        return d.toLocaleDateString('en-US', options);
      }
    } catch {
      // fallback
    }
    return dateStr;
  }

  getStatusPillClass(status: Appointment['status']): Record<string, boolean> {
    switch (status) {
      case 'Completed':
        return { 'st-completed': true };
      case 'Cancelled':
        return { 'st-cancelled': true };
      case 'Confirmed':
        return { 'st-confirmed': true };
      case 'In-Consultation':
        return { 'st-inconsultation': true };
      default:
        return { 'st-pending': true };
    }
  }

  // Helper: Seed Appointments to display rich data across days
  private createSeedAppointments(): Appointment[] {
    const y = this.today.getFullYear();
    const m = String(this.today.getMonth() + 1).padStart(2, '0');
    const day = this.today.getDate();

    const dToday = `${y}-${m}-${String(day).padStart(2, '0')}`;
    const dMinus1 = `${y}-${m}-${String(Math.max(1, day - 1)).padStart(2, '0')}`;
    const dMinus2 = `${y}-${m}-${String(Math.max(1, day - 2)).padStart(2, '0')}`;
    const dPlus1 = `${y}-${m}-${String(day + 1).padStart(2, '0')}`;
    const dPlus2 = `${y}-${m}-${String(day + 2).padStart(2, '0')}`;

    return [
      {
        id: 'APT-2026-00101',
        tokenNo: 1,
        patientId: 'UHID-2026-00012',
        patientName: 'Ramesh Kumar',
        age: 48,
        gender: 'Male',
        mobileNumber: '9876543210',
        date: dToday,
        time: '09:30 AM',
        type: 'Follow-up',
        department: 'General Medicine',
        priority: 'Normal',
        status: 'In-Consultation',
        paymentStatus: 'Paid',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Krishna P Padagala',
        doctorSpecialization: 'MD, General Medicine',
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
        date: dToday,
        time: '10:15 AM',
        type: 'New',
        department: 'Cardiology',
        priority: 'Urgent',
        status: 'Arrived',
        paymentStatus: 'Paid',
        doctorId: 'DOC-102',
        doctorName: 'Dr. Arun Sharma',
        doctorSpecialization: 'DM, Cardiology',
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
        date: dToday,
        time: '11:00 AM',
        type: 'New',
        department: 'Orthopedics',
        priority: 'Normal',
        status: 'Completed',
        paymentStatus: 'Paid',
        doctorId: 'DOC-103',
        doctorName: 'Dr. Priya Verma',
        doctorSpecialization: 'MS, Orthopedics',
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
        date: dToday,
        time: '11:30 AM',
        type: 'Emergency',
        department: 'Pediatrics',
        priority: 'Emergency',
        status: 'Cancelled',
        paymentStatus: 'Pending',
        doctorId: 'DOC-104',
        doctorName: 'Dr. Rajesh Gupta',
        doctorSpecialization: 'MD, Pediatrics',
        createdAt: new Date().toISOString(),
      },
      // Yesterday Appointments
      {
        id: 'APT-2026-00095',
        tokenNo: 1,
        patientId: 'UHID-2026-00008',
        patientName: 'Meera Nambiar',
        age: 39,
        gender: 'Female',
        mobileNumber: '9123456780',
        date: dMinus1,
        time: '10:00 AM',
        type: 'New',
        department: 'General Medicine',
        priority: 'Normal',
        status: 'Completed',
        paymentStatus: 'Paid',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Krishna P Padagala',
        doctorSpecialization: 'MD, General Medicine',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'APT-2026-00096',
        tokenNo: 2,
        patientId: 'UHID-2026-00009',
        patientName: 'Harish Chandra',
        age: 54,
        gender: 'Male',
        mobileNumber: '9876541122',
        date: dMinus1,
        time: '11:15 AM',
        type: 'Follow-up',
        department: 'Cardiology',
        priority: 'Normal',
        status: 'Completed',
        paymentStatus: 'Paid',
        doctorId: 'DOC-102',
        doctorName: 'Dr. Arun Sharma',
        doctorSpecialization: 'DM, Cardiology',
        createdAt: new Date().toISOString(),
      },
      // Day Minus 2
      {
        id: 'APT-2026-00090',
        tokenNo: 1,
        patientId: 'UHID-2026-00003',
        patientName: 'Kavita Joshi',
        age: 28,
        gender: 'Female',
        mobileNumber: '9845123456',
        date: dMinus2,
        time: '02:30 PM',
        type: 'New',
        department: 'Orthopedics',
        priority: 'Normal',
        status: 'Completed',
        paymentStatus: 'Paid',
        doctorId: 'DOC-103',
        doctorName: 'Dr. Priya Verma',
        doctorSpecialization: 'MS, Orthopedics',
        createdAt: new Date().toISOString(),
      },
      // Tomorrow Appointments
      {
        id: 'APT-2026-00108',
        tokenNo: 1,
        patientId: 'UHID-2026-00041',
        patientName: 'Deepak Saxena',
        age: 45,
        gender: 'Male',
        mobileNumber: '9899001122',
        date: dPlus1,
        time: '09:00 AM',
        type: 'New',
        department: 'General Medicine',
        priority: 'Normal',
        status: 'Confirmed',
        paymentStatus: 'Pending',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Krishna P Padagala',
        doctorSpecialization: 'MD, General Medicine',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'APT-2026-00109',
        tokenNo: 2,
        patientId: 'UHID-2026-00042',
        patientName: 'Pooja Agarwal',
        age: 33,
        gender: 'Female',
        mobileNumber: '9811223344',
        date: dPlus1,
        time: '10:30 AM',
        type: 'Follow-up',
        department: 'Cardiology',
        priority: 'Urgent',
        status: 'Confirmed',
        paymentStatus: 'Paid',
        doctorId: 'DOC-102',
        doctorName: 'Dr. Arun Sharma',
        doctorSpecialization: 'DM, Cardiology',
        createdAt: new Date().toISOString(),
      },
      // Day Plus 2
      {
        id: 'APT-2026-00112',
        tokenNo: 1,
        patientId: 'UHID-2026-00048',
        patientName: 'Sanjay Varma',
        age: 50,
        gender: 'Male',
        mobileNumber: '9765438899',
        date: dPlus2,
        time: '11:00 AM',
        type: 'New',
        department: 'Orthopedics',
        priority: 'Normal',
        status: 'Confirmed',
        paymentStatus: 'Pending',
        doctorId: 'DOC-103',
        doctorName: 'Dr. Priya Verma',
        doctorSpecialization: 'MS, Orthopedics',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
