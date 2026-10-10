import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import {
  HomeCollectionService,
  HomeCollection,
  COMMON_LAB_TESTS,
  ZONES,
  TIME_SLOTS,
} from '../../core/services/home-collection.service';
import { PhlebotomistModel } from '../../core/services/phlebotomist-api.service';
import { PatientApiService } from '../../core/services/patient-api.service';
import { BillingApiService } from '../../core/services/billing-api.service';

@Component({
  selector: 'hms-home-collection-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [
    `
      :host {
        display: block;
        padding: var(--sp-6);
        background: #f8fafc;
        min-height: 100vh;
        font-family: var(--font-body, system-ui, sans-serif);
      }

      /* ── Top Bar & Breadcrumb ── */
      .top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-3);
        flex-wrap: wrap;
        gap: var(--sp-3);
      }

      .crumb-bar {
        font-size: 13px;
        color: #64748b;
      }
      .crumb-bar strong {
        color: #0f172a;
      }
      .crumb-bar a {
        color: #2563eb;
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
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .subtitle {
        font-size: 13px;
        color: #64748b;
        margin-top: 3px;
      }

      /* ── Action Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
        text-decoration: none;
      }

      .btn-primary {
        background: #2563eb;
        color: #ffffff;
      }
      .btn-primary:hover {
        background: #1d4ed8;
      }

      .btn-outline {
        background: #ffffff;
        color: #334155;
        border-color: #cbd5e1;
      }
      .btn-outline:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }

      .btn-sm {
        padding: 5px 10px;
        font-size: 12px;
      }

      /* ── Tabs Strip ── */
      .tabs {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: var(--sp-4);
        flex-wrap: wrap;
      }

      .tab {
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        transition: all 0.15s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .tab:hover {
        color: #0f172a;
      }
      .tab.active {
        color: #2563eb;
        border-bottom-color: #2563eb;
      }

      .tab-count {
        font-size: 11px;
        background: #eff6ff;
        color: #2563eb;
        padding: 1px 7px;
        border-radius: 99px;
      }

      /* ── KPI Summary Cards ── */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }

      .kpi-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
      }

      .kpi-icon {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .kpi-icon.blue { background: #eff6ff; color: #2563eb; }
      .kpi-icon.amber { background: #fefce8; color: #ca8a04; }
      .kpi-icon.purple { background: #faf5ff; color: #9333ea; }
      .kpi-icon.green { background: #f0fdf4; color: #16a34a; }

      .kpi-value {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
      }
      .kpi-label {
        font-size: 12px;
        color: #64748b;
        margin-top: 2px;
      }

      /* ── Filter Toolbar ── */
      .filter-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 10px 10px 0 0;
        padding: 12px 16px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
        border-bottom: 1px solid #f1f5f9;
      }

      .search-box {
        position: relative;
        flex: 1;
        min-width: 240px;
        max-width: 380px;
      }
      .search-box input {
        width: 100%;
        padding: 7px 12px 7px 34px;
        font-size: 13px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        outline: none;
        background: #f8fafc;
        box-sizing: border-box;
      }
      .search-box input:focus {
        background: #fff;
        border-color: #2563eb;
      }
      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 13px;
        color: #94a3b8;
      }

      .filter-select {
        padding: 7px 12px;
        font-size: 13px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #fff;
        color: #334155;
        outline: none;
        cursor: pointer;
      }

      /* Date Picker Popup */
      .date-trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        color: #1e293b;
      }
      .date-picker-wrap {
        position: relative;
      }
      .date-popup {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        background: #fff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        z-index: 50;
        padding: 12px;
        width: 270px;
      }
      .cal-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .cal-nav-btn {
        background: #f1f5f9;
        border: none;
        border-radius: 4px;
        padding: 2px 8px;
        cursor: pointer;
        font-weight: bold;
      }
      .cal-month-title {
        font-size: 12px;
        font-weight: 700;
        color: #0f172a;
      }
      .cal-days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        text-align: center;
        font-size: 11px;
      }
      .cal-day-name {
        color: #94a3b8;
        font-weight: 600;
        padding: 4px 0;
      }
      .cal-day-cell {
        padding: 5px 0;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid transparent;
      }
      .cal-day-cell:hover {
        background: #eff6ff;
      }
      .cal-day-cell.other-month {
        color: #cbd5e1;
      }
      .cal-day-cell.today {
        border-color: #2563eb;
        font-weight: 700;
      }
      .cal-day-cell.selected {
        background: #2563eb;
        color: #fff;
        font-weight: 700;
      }
      .cal-footer {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #e2e8f0;
        margin-top: 8px;
        padding-top: 8px;
      }
      .cal-link-btn {
        background: none;
        border: none;
        font-size: 11px;
        color: #2563eb;
        font-weight: 600;
        cursor: pointer;
      }

      /* ── Table Card ── */
      .table-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-top: none;
        border-radius: 0 0 10px 10px;
        overflow-x: auto;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      thead {
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      th {
        padding: 11px 14px;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: left;
        white-space: nowrap;
      }
      td {
        padding: 13px 14px;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
      }
      tbody tr:hover {
        background-color: #f8fafc;
      }

      .token-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: #2563eb;
        color: #fff;
        font-weight: 700;
        font-size: 11px;
        margin-right: 6px;
      }
      .col-id-text {
        font-weight: 700;
        color: #0f172a;
        font-size: 12px;
      }
      .patient-name {
        font-weight: 600;
        color: #0f172a;
      }
      .patient-sub {
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
      }
      .addr-text {
        font-size: 11px;
        color: #475569;
        margin-top: 3px;
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .test-tag {
        display: inline-block;
        font-size: 11px;
        background: #f1f5f9;
        color: #1e293b;
        padding: 2px 7px;
        border-radius: 4px;
        margin-right: 4px;
        margin-bottom: 3px;
        font-weight: 500;
      }
      .tube-tag {
        display: inline-block;
        font-size: 10px;
        background: #fef3c7;
        color: #92400e;
        padding: 1px 6px;
        border-radius: 3px;
        margin-right: 4px;
        font-weight: 600;
      }
      .tube-tag.edta { background: #fae8ff; color: #86198f; }
      .tube-tag.fluoride { background: #f1f5f9; color: #475569; }
      .tube-tag.sst { background: #fef9c3; color: #854d0e; }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .st-scheduled { background: #e0f2fe; color: #0369a1; }
      .st-collected { background: #fef3c7; color: #b45309; }
      .st-transit { background: #faf5ff; color: #7e22ce; }
      .st-delivered { background: #dcfce7; color: #15803d; }
      .st-cancelled { background: #fee2e2; color: #b91c1c; }

      .temp-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        background: #eff6ff;
        color: #1e40af;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }

      /* ── Form View ── */
      .form-container {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        max-width: 900px;
        margin: 0 auto;
      }
      .form-title {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px 0;
      }
      .form-sub {
        font-size: 13px;
        color: #64748b;
        margin: 0 0 20px 0;
      }

      .patient-type-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      .type-btn {
        padding: 8px 16px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .type-btn.active {
        background: #eff6ff;
        border-color: #2563eb;
        color: #2563eb;
      }

      .form-section {
        margin-bottom: 20px;
      }
      .form-section-title {
        font-size: 12px;
        font-weight: 700;
        color: #2563eb;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        padding-bottom: 4px;
        border-bottom: 1px solid #e2e8f0;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      .form-grid.three-col {
        grid-template-columns: repeat(3, 1fr);
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
        font-size: 13px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        outline: none;
        box-sizing: border-box;
        color: #0f172a;
      }
      .form-control:focus {
        border-color: #2563eb;
      }

      .test-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 8px;
        margin-top: 8px;
      }
      .test-checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        background: #f8fafc;
        transition: all 0.15s;
      }
      .test-checkbox-label:hover {
        background: #eff6ff;
        border-color: #bfdbfe;
      }
      .test-checkbox-label.selected {
        background: #eff6ff;
        border-color: #2563eb;
      }

      /* ── Modals ── */
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
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
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

      /* Printable Slip styling */
      .slip-card {
        border: 2px dashed #cbd5e1;
        border-radius: 8px;
        padding: 16px;
        background: #fff;
      }
      .slip-head {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 8px;
        margin-bottom: 12px;
      }
      .barcode-box {
        font-family: monospace;
        letter-spacing: 4px;
        font-size: 16px;
        font-weight: bold;
        background: #f1f5f9;
        padding: 6px 12px;
        display: inline-block;
        border: 1px solid #cbd5e1;
      }
    `,
  ],
  template: `
    <!-- Top Nav & Breadcrumbs -->
    <div class="top-nav">
      <div class="crumb-bar">
        Home Collection > <strong>Home Collections</strong>
      </div>
      <div style="display: flex; gap: 8px;">
        <a routerLink="/registration/home-collection/calendar" class="btn btn-outline">
          📅 Collection Calendar
        </a>
        <a routerLink="/registration/home-collection/phlebotomist-dashboard" class="btn btn-outline">
          📊 Phlebotomist Dashboard
        </a>
        <a routerLink="/registration/home-collection/phlebotomists" class="btn btn-outline">
          👨‍⚕️ Phlebotomists
        </a>
      </div>
    </div>

    <!-- Header -->
    <div class="head-title">
      <div>
        <h1>
          <span>🏠</span> Home Sample Collections
        </h1>
        <div class="subtitle">
          Schedule, manage, and track doorstep specimen pickups, cold-chain monitoring, and phlebotomist field assignments.
        </div>
      </div>
      <div>
        @if (activeTab() === 'list') {
          <button class="btn btn-primary" (click)="openScheduleForm()">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Schedule Home Collection
          </button>
        } @else {
          <button class="btn btn-outline" (click)="activeTab.set('list')">
            ← Back to Collections List
          </button>
        }
      </div>
    </div>

    <!-- Tabs Strip -->
    <div class="tabs">
      <button class="tab" [class.active]="activeTab() === 'list' && statusFilter() === 'ALL'" (click)="setTabFilter('list', 'ALL')">
        All Collections <span class="tab-count">{{ collections().length }}</span>
      </button>
      <button class="tab" [class.active]="activeTab() === 'list' && statusFilter() === 'SCHEDULED'" (click)="setTabFilter('list', 'SCHEDULED')">
        Scheduled <span class="tab-count">{{ scheduledCount() }}</span>
      </button>
      <button class="tab" [class.active]="activeTab() === 'list' && statusFilter() === 'TRANSIT'" (click)="setTabFilter('list', 'TRANSIT')">
        In Transit / Collected <span class="tab-count">{{ transitCount() }}</span>
      </button>
      <button class="tab" [class.active]="activeTab() === 'list' && statusFilter() === 'DELIVERED_TO_LAB'" (click)="setTabFilter('list', 'DELIVERED_TO_LAB')">
        Delivered to Lab <span class="tab-count">{{ deliveredCount() }}</span>
      </button>
      <button class="tab" [class.active]="activeTab() === 'form'" (click)="openScheduleForm()">
        + Schedule Collection
      </button>
    </div>

    <!-- LIST VIEW -->
    @if (activeTab() === 'list') {
      <!-- 4 Top KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">📦</div>
          <div>
            <div class="kpi-value">{{ collections().length }}</div>
            <div class="kpi-label">Total Bookings</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon amber">⏳</div>
          <div>
            <div class="kpi-value">{{ scheduledCount() }}</div>
            <div class="kpi-label">Scheduled / Pending</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon purple">🛵</div>
          <div>
            <div class="kpi-value">{{ transitCount() }}</div>
            <div class="kpi-label">On Field / In Transit</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon green">🧪</div>
          <div>
            <div class="kpi-value">{{ deliveredCount() }}</div>
            <div class="kpi-label">Delivered to Lab (Completed)</div>
          </div>
        </div>
      </div>

      <!-- Filter Card -->
      <div class="filter-card">
        <!-- Search -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search patient, UHID, collection ID, mobile..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <!-- Date Dropdown Filter -->
        <div class="date-picker-wrap">
          <button class="date-trigger" (click)="toggleDatePopup()">
            📅 <span>{{ formattedDateDisplay() }}</span> ▾
          </button>

          @if (showDatePopup()) {
            <div class="date-popup">
              <div class="cal-nav">
                <button class="cal-nav-btn" (click)="prevCalMonth()">‹</button>
                <span class="cal-month-title">{{ monthNames[calMonth()] }} {{ calYear() }}</span>
                <button class="cal-nav-btn" (click)="nextCalMonth()">›</button>
              </div>

              <div class="cal-days-grid">
                <div class="cal-day-name">Su</div>
                <div class="cal-day-name">Mo</div>
                <div class="cal-day-name">Tu</div>
                <div class="cal-day-name">We</div>
                <div class="cal-day-name">Th</div>
                <div class="cal-day-name">Fr</div>
                <div class="cal-day-name">Sa</div>

                @for (cell of calendarCells(); track cell.key) {
                  <div
                    class="cal-day-cell"
                    [class.other-month]="!cell.isCurrentMonth"
                    [class.today]="cell.isToday"
                    [class.selected]="cell.isSelected"
                    (click)="selectDate(cell.dateStr)"
                  >
                    {{ cell.dayNum }}
                  </div>
                }
              </div>

              <div class="cal-footer">
                <button class="cal-link-btn" (click)="selectToday()">Today</button>
                <button class="cal-link-btn" (click)="selectAllDates()">All Dates</button>
              </div>
            </div>
          }
        </div>

        <!-- Zone Filter -->
        <select class="filter-select" [(ngModel)]="selectedZone">
          <option value="ALL">All Zones</option>
          @for (z of zones; track z) {
            <option [value]="z">{{ z }}</option>
          }
        </select>

        <!-- Phlebotomist Filter -->
        <select class="filter-select" [(ngModel)]="selectedPhlebo">
          <option value="ALL">All Phlebotomists</option>
          @for (p of phlebotomists(); track p.id) {
            <option [value]="p.id">{{ p.name }} ({{ p.employeeId || 'PHL' }})</option>
          }
        </select>

        <!-- Status Filter -->
        <select class="filter-select" [(ngModel)]="statusFilter">
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="SAMPLE_COLLECTED">Sample Collected</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED_TO_LAB">Delivered to Lab</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button class="btn btn-outline btn-sm" (click)="resetFilters()">
          ↺ Reset
        </button>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>ID / Token</th>
              <th>Patient Details</th>
              <th>Schedule & Fasting</th>
              <th>Tests Ordered & Tubes</th>
              <th>Assigned Phlebotomist</th>
              <th>Duty Status</th>
              <th>Temp / Cold Chain</th>
              <th>Payment</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredCollections().length === 0) {
              <tr>
                <td colspan="9" style="text-align: center; padding: 48px; color: #64748b;">
                  <div style="font-size: 28px; margin-bottom: 8px;">🏠</div>
                  <div style="font-weight: 700; font-size: 15px; color: #0f172a;">No Home Collections Found</div>
                  <div style="font-size: 13px; margin: 4px 0 16px 0; color: #94a3b8;">
                    No home sample pickup requests match your filter criteria.
                  </div>
                  <button class="btn btn-primary" (click)="openScheduleForm()">
                    + Schedule New Collection
                  </button>
                </td>
              </tr>
            }

            @for (col of filteredCollections(); track col.id) {
              <tr>
                <!-- ID & Sequence -->
                <td>
                  <div style="display: flex; align-items: center;">
                    <span class="token-badge">{{ col.seqNo }}</span>
                    <div>
                      <div class="col-id-text">{{ col.id }}</div>
                      <div style="font-size: 10px; color: #94a3b8;">{{ col.barcode || 'N/A' }}</div>
                    </div>
                  </div>
                </td>

                <!-- Patient Details -->
                <td>
                  <div class="patient-name">{{ col.patientName }}</div>
                  <div class="patient-sub">{{ col.patientId }} • {{ col.age }}y / {{ col.gender }}</div>
                  <div class="patient-sub">📞 <strong>{{ col.mobileNumber }}</strong></div>
                  <div class="addr-text">
                    <span>📍</span>
                    <span>{{ col.address }} @if (col.landmark) { ({{ col.landmark }}) }</span>
                  </div>
                </td>

                <!-- Schedule -->
                <td>
                  <div><strong>{{ col.date }}</strong></div>
                  <div style="font-size: 11px; color: #2563eb; font-weight: 600;">{{ col.timeSlot }}</div>
                  @if (col.fastingRequired) {
                    <span style="font-size: 10px; background: #fee2e2; color: #b91c1c; font-weight: 700; padding: 1px 6px; border-radius: 4px; display: inline-block; margin-top: 3px;">
                      ⚠️ Fasting 10-12h
                    </span>
                  }
                </td>

                <!-- Tests & Tubes -->
                <td>
                  <div>
                    @for (t of col.tests; track t) {
                      <span class="test-tag">{{ t }}</span>
                    }
                  </div>
                  <div style="margin-top: 4px;">
                    @for (tb of col.tubesRequired; track tb) {
                      <span class="tube-tag" [ngClass]="getTubeClass(tb)">🧪 {{ tb }}</span>
                    }
                  </div>
                </td>

                <!-- Phlebotomist -->
                <td>
                  <div><strong>{{ col.phlebotomistName }}</strong></div>
                  <div style="font-size: 11px; color: #64748b;">📞 {{ col.phlebotomistPhone }}</div>
                  @if (col.phlebotomistVehicle) {
                    <div style="font-size: 10px; color: #94a3b8;">🛵 {{ col.phlebotomistVehicle }}</div>
                  }
                </td>

                <!-- Status with Quick Switcher -->
                <td>
                  <select
                    [ngModel]="col.status"
                    (ngModelChange)="onStatusChange(col, $event)"
                    style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 6px; font-size: 11px; font-weight: 600; cursor: pointer; outline: none;"
                  >
                    <option value="SCHEDULED">🔵 Scheduled</option>
                    <option value="SAMPLE_COLLECTED">🟡 Sample Collected</option>
                    <option value="IN_TRANSIT">🟣 In Transit</option>
                    <option value="DELIVERED_TO_LAB">🟢 Delivered to Lab</option>
                    <option value="CANCELLED">🔴 Cancelled</option>
                  </select>
                </td>

                <!-- Cold Chain Temp -->
                <td>
                  @if (col.temperatureCelsius) {
                    <span class="temp-tag">❄️ {{ col.temperatureCelsius }}°C</span>
                  } @else {
                    <span style="font-size: 11px; color: #94a3b8;">Kit Ambient</span>
                  }
                </td>

                <!-- Payment -->
                <td>
                  <div style="font-weight: 700; color: #0f172a;">₹{{ col.totalAmount }}</div>
                  <div style="font-size: 11px; color: #16a34a; font-weight: 600;">{{ col.paymentStatus }}</div>
                </td>

                <!-- Actions -->
                <td style="text-align: right;">
                  <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-outline btn-sm" (click)="viewDetails(col)" title="View Details">
                      👁️ Details
                    </button>
                    <button class="btn btn-outline btn-sm" (click)="printSlip(col)" title="Print Slip">
                      🖨️ Slip
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- FORM VIEW: Schedule New Home Collection -->
    @if (activeTab() === 'form') {
      <div class="form-container">
        <h2 class="form-title">Schedule Doorstep Specimen Collection</h2>
        <p class="form-sub">Enter patient details, pick address & collection zone, select laboratory tests, and assign a phlebotomist.</p>

        <!-- Patient Type Selector -->
        <div class="patient-type-tabs">
          <button class="type-btn" [class.active]="formPatientType === 'new'" (click)="setPatientType('new')">
            + New Patient
          </button>
          <button class="type-btn" [class.active]="formPatientType === 'existing'" (click)="setPatientType('existing')">
            Existing Registered Patient (UHID)
          </button>
        </div>

        <form (ngSubmit)="saveCollection()">
          <!-- Section 1: Patient Information -->
          <div class="form-section">
            <div class="form-section-title">1. Patient Information</div>
            
            @if (formPatientType === 'existing') {
              <div class="form-field full" style="margin-bottom: 12px;">
                <label class="form-label">Search / Select Registered Patient</label>
                <select class="form-control" [(ngModel)]="selectedExistingPatientId" name="existingPatient" (change)="onExistingPatientChange()">
                  <option value="">-- Choose Existing Patient --</option>
                  @for (p of knownPatients; track p.uhid) {
                    <option [value]="p.uhid">{{ p.name }} ({{ p.uhid }}) - {{ p.mobileNumber }}</option>
                  }
                </select>
              </div>
            }

            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Patient UHID</label>
                <input class="form-control" [value]="formPatientId" readonly style="background: #f1f5f9;" />
              </div>

              <div class="form-field">
                <label class="form-label">Full Name <span style="color: #ef4444;">*</span></label>
                <input class="form-control" [(ngModel)]="formPatientName" name="patientName" placeholder="Enter patient full name" required />
              </div>

              <div class="form-field">
                <label class="form-label">Age <span style="color: #ef4444;">*</span></label>
                <input class="form-control" type="number" [(ngModel)]="formAge" name="age" placeholder="Age in years" required />
              </div>

              <div class="form-field">
                <label class="form-label">Gender <span style="color: #ef4444;">*</span></label>
                <select class="form-control" [(ngModel)]="formGender" name="gender">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Mobile Number <span style="color: #ef4444;">*</span></label>
                <input class="form-control" [(ngModel)]="formMobile" name="mobile" placeholder="Enter 10-digit mobile number" required />
              </div>

              <div class="form-field">
                <label class="form-label">Email Address</label>
                <input class="form-control" type="email" [(ngModel)]="formEmail" name="email" placeholder="patient@email.com (optional)" />
              </div>
            </div>
          </div>

          <!-- Section 2: Address & Territory -->
          <div class="form-section">
            <div class="form-section-title">2. Collection Address & Zone</div>
            <div class="form-grid">
              <div class="form-field full">
                <label class="form-label">Door / Flat / Street Address <span style="color: #ef4444;">*</span></label>
                <input class="form-control" [(ngModel)]="formAddress" name="address" placeholder="House/Flat No., Building, Street address" required />
              </div>

              <div class="form-field">
                <label class="form-label">Prominent Landmark</label>
                <input class="form-control" [(ngModel)]="formLandmark" name="landmark" placeholder="Nearby Landmark (optional)" />
              </div>

              <div class="form-field">
                <label class="form-label">Collection Zone / Territory <span style="color: #ef4444;">*</span></label>
                <select class="form-control" [(ngModel)]="formZone" name="zone" (change)="onZoneChange()">
                  @for (z of zones; track z) {
                    <option [value]="z">{{ z }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Section 3: Schedule & Phlebotomist -->
          <div class="form-section">
            <div class="form-section-title">3. Schedule & Phlebotomist Assignment</div>
            <div class="form-grid three-col">
              <div class="form-field">
                <label class="form-label">Pickup Date <span style="color: #ef4444;">*</span></label>
                <input class="form-control" type="date" [(ngModel)]="formDate" name="pickupDate" required />
              </div>

              <div class="form-field">
                <label class="form-label">Time Slot <span style="color: #ef4444;">*</span></label>
                <select class="form-control" [(ngModel)]="formTimeSlot" name="timeSlot">
                  @for (slot of timeSlots; track slot) {
                    <option [value]="slot">{{ slot }}</option>
                  }
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Priority</label>
                <select class="form-control" [(ngModel)]="formPriority" name="priority">
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div class="form-field full">
                <label class="form-label">Assign Phlebotomist <span style="color: #ef4444;">*</span></label>
                <select class="form-control" [(ngModel)]="selectedPhleboId" name="phleboId" (change)="onPhleboSelect()" required>
                  <option value="">-- Choose Field Phlebotomist --</option>
                  @for (ph of phlebotomists(); track ph.id) {
                    <option [value]="ph.id">
                      {{ ph.name }} ({{ ph.employeeId || 'PHL' }}) - {{ ph.zone || 'General Zone' }} • [{{ ph.status }}]
                    </option>
                  }
                </select>
              </div>

              <div class="form-field full" style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="fastingCheck" [(ngModel)]="formFastingRequired" name="fasting" style="width: 16px; height: 16px;" />
                <label for="fastingCheck" style="font-size: 13px; font-weight: 600; color: #b91c1c; cursor: pointer;">
                  Fasting required for 10-12 hours prior to collection
                </label>
              </div>
            </div>
          </div>

          <!-- Section 4: Laboratory Tests Ordered -->
          <div class="form-section">
            <div class="form-section-title">4. Laboratory Tests & Required Specimen Tubes</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
              Select the diagnostic tests ordered. Vacutainer tubes will be computed automatically for the phlebotomist kit.
            </div>

            <div class="test-selection-grid">
              @for (test of commonTests; track test.name) {
                <label
                  class="test-checkbox-label"
                  [class.selected]="isTestSelected(test.name)"
                  (click)="toggleTest(test)"
                >
                  <input
                    type="checkbox"
                    [checked]="isTestSelected(test.name)"
                    style="margin-top: 2px;"
                    (click)="$event.stopPropagation(); toggleTest(test)"
                  />
                  <div>
                    <div style="font-weight: 600;">{{ test.name }}</div>
                    <div style="font-size: 10px; color: #64748b;">Tube: {{ test.tube }} • ₹{{ test.price }}</div>
                  </div>
                </label>
              }
            </div>

            <!-- Auto-computed tubes summary -->
            @if (selectedTests.length > 0) {
              <div style="margin-top: 12px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <div style="font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">
                  🧪 Required Collection Tubes for Kit:
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  @for (tube of computedTubes(); track tube) {
                    <span class="tube-tag" [ngClass]="getTubeClass(tube)">{{ tube }}</span>
                  }
                </div>
              </div>
            }

            <div class="form-field full" style="margin-top: 14px;">
              <label class="form-label">Special Instructions for Phlebotomist</label>
              <textarea class="form-control" rows="2" [(ngModel)]="formInstructions" name="instructions" placeholder="Enter special instructions (e.g., fasting patient, call before arrival, special handling)"></textarea>
            </div>
          </div>

          <!-- Section 5: Billing & Payment -->
          <div class="form-section">
            <div class="form-section-title">5. Payment Details</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Total Test Amount (₹)</label>
                <input class="form-control" type="number" [(ngModel)]="formTotalAmount" name="totalAmount" style="font-weight: 700; color: #0f172a; background: #fff;" />
              </div>

              <div class="form-field">
                <label class="form-label">Payment Mode</label>
                <select class="form-control" [(ngModel)]="formPaymentMode" name="paymentMode">
                  <option value="Paid">Online Paid (Pre-paid)</option>
                  <option value="Cash on Collection">Cash on Collection</option>
                  <option value="UPI on Collection">UPI on Collection (QR Code)</option>
                  <option value="Insurance">Insurance / Corporate Bill</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <button type="button" class="btn btn-outline" (click)="activeTab.set('list')">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="selectedTests.length === 0 || !formPatientName || !formMobile">
              Schedule Collection & Print Slip
            </button>
          </div>
        </form>
      </div>
    }

    <!-- DETAIL MODAL -->
    @if (selectedCollection()) {
      <div class="modal-overlay" (click)="closeDetails()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Home Collection Details ({{ selectedCollection()?.id }})</h2>
            <button class="btn btn-outline btn-sm" (click)="closeDetails()">✕</button>
          </div>
          <div class="modal-body">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div>
                <div style="font-size: 16px; font-weight: 700; color: #0f172a;">{{ selectedCollection()?.patientName }}</div>
                <div style="font-size: 12px; color: #64748b;">
                  {{ selectedCollection()?.patientId }} • {{ selectedCollection()?.age }} years / {{ selectedCollection()?.gender }}
                </div>
                <div style="font-size: 12px; color: #1e293b; margin-top: 2px;">
                  📞 <strong>{{ selectedCollection()?.mobileNumber }}</strong>
                </div>
              </div>
              <span class="status-pill" [ngClass]="getStatusPillClass(selectedCollection()?.status)">
                {{ selectedCollection()?.status }}
              </span>
            </div>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Doorstep Pickup Address</div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">
                📍 {{ selectedCollection()?.address }}
              </div>
              @if (selectedCollection()?.landmark) {
                <div style="font-size: 12px; color: #64748b;">Landmark: {{ selectedCollection()?.landmark }}</div>
              }
              <div style="font-size: 12px; color: #2563eb; margin-top: 2px;">{{ selectedCollection()?.zone }}</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div style="background: #f8fafc; padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748b;">Schedule</div>
                <div style="font-size: 13px; font-weight: 600;">{{ selectedCollection()?.date }}</div>
                <div style="font-size: 11px; color: #2563eb;">{{ selectedCollection()?.timeSlot }}</div>
                @if (selectedCollection()?.fastingRequired) {
                  <span style="font-size: 10px; color: #b91c1c; font-weight: 700;">⚠️ Fasting required</span>
                }
              </div>

              <div style="background: #f8fafc; padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748b;">Assigned Phlebotomist</div>
                <div style="font-size: 13px; font-weight: 600;">{{ selectedCollection()?.phlebotomistName }}</div>
                <div style="font-size: 11px; color: #64748b;">📞 {{ selectedCollection()?.phlebotomistPhone }}</div>
                @if (selectedCollection()?.phlebotomistVehicle) {
                  <div style="font-size: 10px; color: #94a3b8;">{{ selectedCollection()?.phlebotomistVehicle }}</div>
                }
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Tests Ordered:</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                @for (t of selectedCollection()?.tests; track t) {
                  <span class="test-tag" style="font-size: 12px; padding: 4px 8px;">{{ t }}</span>
                }
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Vacutainer Specimen Tubes Required:</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                @for (tb of selectedCollection()?.tubesRequired; track tb) {
                  <span class="tube-tag" [ngClass]="getTubeClass(tb)" style="font-size: 11px; padding: 3px 8px;">🧪 {{ tb }}</span>
                }
              </div>
            </div>

            @if (selectedCollection()?.specialInstructions) {
              <div style="background: #fefce8; border: 1px solid #fef08a; padding: 10px; border-radius: 6px; font-size: 12px; color: #854d0e; margin-bottom: 14px;">
                <strong>Special Note:</strong> {{ selectedCollection()?.specialInstructions }}
              </div>
            }

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              <div>
                <span style="font-size: 12px; color: #64748b;">Payment:</span>
                <span style="font-size: 13px; font-weight: 700; color: #16a34a; margin-left: 6px;">{{ selectedCollection()?.paymentStatus }}</span>
              </div>
              <div style="font-size: 16px; font-weight: 800; color: #0f172a;">
                Total: ₹{{ selectedCollection()?.totalAmount }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeDetails()">Close</button>
            <button class="btn btn-primary" (click)="printSlip(selectedCollection()!)">🖨️ Print Slip</button>
          </div>
        </div>
      </div>
    }

    <!-- PRINT SLIP MODAL -->
    @if (activeSlip()) {
      <div class="modal-overlay" (click)="closeSlip()">
        <div class="modal-card" style="max-width: 520px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Doorstep Sample Collection Slip</h2>
            <button class="btn btn-outline btn-sm" (click)="closeSlip()">✕</button>
          </div>
          <div class="modal-body">
            <div class="slip-card">
              <div class="slip-head">
                <div>
                  <div style="font-size: 16px; font-weight: 800; color: #1e40af;">HMS MEDCONNECT</div>
                  <div style="font-size: 11px; color: #64748b;">Home Sample Collection Order Slip</div>
                </div>
                <div style="text-align: right;">
                  <div class="barcode-box">*{{ activeSlip()?.barcode || 'BC91823001' }}*</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">{{ activeSlip()?.id }}</div>
                </div>
              </div>

              <div style="margin-bottom: 12px; font-size: 12px;">
                <div><strong>Patient:</strong> {{ activeSlip()?.patientName }} ({{ activeSlip()?.patientId }})</div>
                <div><strong>Age / Gender:</strong> {{ activeSlip()?.age }} yrs / {{ activeSlip()?.gender }}</div>
                <div><strong>Mobile:</strong> {{ activeSlip()?.mobileNumber }}</div>
                <div><strong>Address:</strong> {{ activeSlip()?.address }}</div>
                <div><strong>Zone:</strong> {{ activeSlip()?.zone }}</div>
                <div><strong>Scheduled:</strong> {{ activeSlip()?.date }} • {{ activeSlip()?.timeSlot }}</div>
                <div><strong>Phlebotomist:</strong> {{ activeSlip()?.phlebotomistName }} ({{ activeSlip()?.phlebotomistPhone }})</div>
              </div>

              <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">Tests Ordered:</div>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                  @for (t of activeSlip()?.tests; track t) {
                    <li>{{ t }}</li>
                  }
                </ul>
              </div>

              <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">Tubes Required:</div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  @for (tb of activeSlip()?.tubesRequired; track tb) {
                    <span class="tube-tag" [ngClass]="getTubeClass(tb)">{{ tb }}</span>
                  }
                </div>
              </div>

              <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 12px;">
                <div><strong>Amount:</strong> ₹{{ activeSlip()?.totalAmount }} ({{ activeSlip()?.paymentStatus }})</div>
                <div style="color: #64748b;">Cold-Chain: 2°C - 8°C</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeSlip()">Close</button>
            <button class="btn btn-primary" (click)="doPrint()">🖨️ Print Now</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class HomeCollectionListPage implements OnInit {
  private colService = inject(HomeCollectionService);
  private route = inject(ActivatedRoute);

  collections = this.colService.collections;
  phlebotomists = this.colService.phlebotomists;

  zones = ZONES;
  timeSlots = TIME_SLOTS;
  commonTests = COMMON_LAB_TESTS;

  activeTab = signal<'list' | 'form'>('list');
  searchQuery = '';
  selectedZone = 'ALL';
  selectedPhlebo = 'ALL';
  statusFilter = signal<string>('ALL');

  // Date picker state
  todayStr = new Date().toISOString().split('T')[0];
  selectedDateFilter = signal<string>('ALL');
  showDatePopup = signal(false);

  calYear = signal(new Date().getFullYear());
  calMonth = signal(new Date().getMonth());

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Modals
  selectedCollection = signal<HomeCollection | null>(null);
  activeSlip = signal<HomeCollection | null>(null);

  // Form state
  formPatientType: 'new' | 'existing' = 'new';
  selectedExistingPatientId = '';
  formPatientId = '';
  formPatientName = '';
  formAge: number | null = null;
  formGender: 'Male' | 'Female' | 'Other' = 'Male';
  formMobile = '';
  formEmail = '';
  formAddress = '';
  formLandmark = '';
  formZone = ZONES[0];
  formDate = new Date().toISOString().split('T')[0];
  formTimeSlot = TIME_SLOTS[0];
  formPriority: 'Normal' | 'Urgent' | 'VIP' = 'Normal';
  formFastingRequired = false;
  selectedPhleboId = '';
  formInstructions = '';
  formPaymentMode: HomeCollection['paymentStatus'] = 'Paid';
  selectedTests: string[] = ['Complete Blood Count (CBC)'];
  formTotalAmount = 350;
  private patientApi = inject(PatientApiService);
  private billingApi = inject(BillingApiService);

  knownPatients: Array<{
    uhid: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    mobileNumber: string;
    address: string;
    landmark?: string;
    zone: string;
  }> = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'new') {
        this.openScheduleForm();
        if (params['uhid']) {
          this.formPatientType = 'existing';
          this.selectedExistingPatientId = params['uhid'];
        }
      }
    });

    if (this.phlebotomists().length > 0) {
      this.selectedPhleboId = this.phlebotomists()[0].id;
    }

    this.loadRegisteredPatients();
    this.loadNextUhid();
  }

  loadRegisteredPatients(): void {
    this.patientApi.list({ limit: 100 }).subscribe({
      next: (res: any) => {
        const list = res?.data || res?.items || res || [];
        if (Array.isArray(list)) {
          this.knownPatients = list.map((p: any) => ({
            uhid: p.uhid || p.id,
            name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
            age: p.age || (p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 30),
            gender: p.gender || 'Male',
            mobileNumber: p.phone || p.mobileNumber || '',
            address: p.address || '',
            landmark: p.landmark || '',
            zone: p.zone || ZONES[0],
          }));
          if (this.formPatientType === 'new') {
            this.loadNextUhid();
          } else if (this.formPatientType === 'existing' && this.selectedExistingPatientId) {
            this.onExistingPatientChange();
          }
        }
      },
      error: () => {
        this.knownPatients = [];
      },
    });
  }

  loadNextUhid(): void {
    const fallback = this.calculateNextLocalUhid();
    if (fallback) {
      this.formPatientId = fallback;
    }
    this.patientApi.peekNextUhid().subscribe({
      next: (res) => {
        if (res?.uhid) {
          this.formPatientId = res.uhid;
        } else if (!this.formPatientId) {
          this.formPatientId = this.calculateNextLocalUhid();
        }
      },
      error: () => {
        if (!this.formPatientId) {
          this.formPatientId = this.calculateNextLocalUhid();
        }
      },
    });
  }

  calculateNextLocalUhid(): string {
    const year = new Date().getFullYear();
    const prefix = `UHID-${year}-`;
    let maxNum = 0;
    for (const p of this.knownPatients) {
      if (p.uhid && p.uhid.startsWith(prefix)) {
        const num = parseInt(p.uhid.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    for (const c of this.collections()) {
      if (c.patientId && c.patientId.startsWith(prefix)) {
        const num = parseInt(c.patientId.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `${prefix}${String(maxNum + 1).padStart(5, '0')}`;
  }

  // Counters
  scheduledCount = computed(() => this.collections().filter((c) => c.status === 'SCHEDULED' || c.status === 'ASSIGNED').length);
  transitCount = computed(() => this.collections().filter((c) => c.status === 'IN_TRANSIT' || c.status === 'SAMPLE_COLLECTED').length);
  deliveredCount = computed(() => this.collections().filter((c) => c.status === 'DELIVERED_TO_LAB').length);

  // Filtered Collections
  filteredCollections = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const zone = this.selectedZone;
    const phlebo = this.selectedPhlebo;
    const st = this.statusFilter();
    const dt = this.selectedDateFilter();

    return this.collections().filter((col) => {
      const matchQuery =
        !q ||
        col.patientName.toLowerCase().includes(q) ||
        col.mobileNumber.includes(q) ||
        col.id.toLowerCase().includes(q) ||
        col.patientId.toLowerCase().includes(q) ||
        col.phlebotomistName.toLowerCase().includes(q) ||
        col.address.toLowerCase().includes(q) ||
        col.tests.some((t) => t.toLowerCase().includes(q));

      const matchZone = zone === 'ALL' || col.zone === zone;
      const matchPhlebo = phlebo === 'ALL' || col.phlebotomistId === phlebo;
      const matchDate = dt === 'ALL' || col.date === dt;

      let matchStatus = true;
      if (st === 'SCHEDULED') matchStatus = col.status === 'SCHEDULED' || col.status === 'ASSIGNED';
      else if (st === 'TRANSIT') matchStatus = col.status === 'SAMPLE_COLLECTED' || col.status === 'IN_TRANSIT';
      else if (st !== 'ALL') matchStatus = col.status === st;

      return matchQuery && matchZone && matchPhlebo && matchDate && matchStatus;
    });
  });

  setTabFilter(tab: 'list' | 'form', status: string): void {
    this.activeTab.set(tab);
    this.statusFilter.set(status);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedZone = 'ALL';
    this.selectedPhlebo = 'ALL';
    this.statusFilter.set('ALL');
    this.selectedDateFilter.set('ALL');
  }

  // Date Calendar Popup
  toggleDatePopup(): void {
    this.showDatePopup.update((v) => !v);
  }

  prevCalMonth(): void {
    if (this.calMonth() === 0) {
      this.calMonth.set(11);
      this.calYear.update((y) => y - 1);
    } else {
      this.calMonth.update((m) => m - 1);
    }
  }

  nextCalMonth(): void {
    if (this.calMonth() === 11) {
      this.calMonth.set(0);
      this.calYear.update((y) => y + 1);
    } else {
      this.calMonth.update((m) => m + 1);
    }
  }

  selectDate(dStr: string): void {
    this.selectedDateFilter.set(dStr);
    this.showDatePopup.set(false);
  }

  selectToday(): void {
    this.selectedDateFilter.set(this.todayStr);
    this.calYear.set(new Date().getFullYear());
    this.calMonth.set(new Date().getMonth());
    this.showDatePopup.set(false);
  }

  selectAllDates(): void {
    this.selectedDateFilter.set('ALL');
    this.showDatePopup.set(false);
  }

  formattedDateDisplay(): string {
    const val = this.selectedDateFilter();
    if (!val || val === 'ALL') return 'All Dates';
    if (val === this.todayStr) return 'Today';
    return val;
  }

  calendarCells = computed(() => {
    const year = this.calYear();
    const month = this.calMonth();
    const today = this.todayStr;
    const selected = this.selectedDateFilter();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: Array<{
      key: string;
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        key: `p-${dayNum}`,
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        isSelected: dateStr === selected,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        key: `c-${d}`,
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        isSelected: dateStr === selected,
      });
    }

    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let n = 1; n <= remaining; n++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      cells.push({
        key: `n-${n}`,
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        isSelected: dateStr === selected,
      });
    }

    return cells;
  });

  // Status Change
  onStatusChange(col: HomeCollection, newStatus: any): void {
    this.colService.updateStatus(col.id, newStatus);
  }

  // Modals
  viewDetails(col: HomeCollection): void {
    this.selectedCollection.set(col);
  }
  closeDetails(): void {
    this.selectedCollection.set(null);
  }

  printSlip(col: HomeCollection): void {
    this.activeSlip.set(col);
  }
  closeSlip(): void {
    this.activeSlip.set(null);
  }
  doPrint(): void {
    window.print();
  }

  // Form Methods
  openScheduleForm(): void {
    this.formPatientType = 'new';
    this.formPatientId = this.calculateNextLocalUhid();
    this.loadNextUhid();
    this.formPatientName = '';
    this.formAge = null;
    this.formGender = 'Male';
    this.formMobile = '';
    this.formEmail = '';
    this.formAddress = '';
    this.formLandmark = '';
    this.formZone = ZONES[0];
    this.formDate = new Date().toISOString().split('T')[0];
    this.formTimeSlot = TIME_SLOTS[0];
    this.formPriority = 'Normal';
    this.formFastingRequired = false;
    this.formInstructions = '';
    this.selectedTests = ['Complete Blood Count (CBC)'];
    this.selectedPhleboId = this.phlebotomists().length > 0 ? this.phlebotomists()[0].id : '';
    this.activeTab.set('form');
  }

  setPatientType(type: 'new' | 'existing'): void {
    this.formPatientType = type;
    if (type === 'new') {
      this.selectedExistingPatientId = '';
      this.formPatientId = this.calculateNextLocalUhid();
      this.loadNextUhid();
      this.formPatientName = '';
      this.formAge = null;
      this.formGender = 'Male';
      this.formMobile = '';
      this.formAddress = '';
      this.formLandmark = '';
    }
  }

  onExistingPatientChange(): void {
    const pat = this.knownPatients.find((p) => p.uhid === this.selectedExistingPatientId);
    if (pat) {
      this.formPatientId = pat.uhid;
      this.formPatientName = pat.name;
      this.formAge = pat.age;
      this.formGender = pat.gender;
      this.formMobile = pat.mobileNumber;
      this.formAddress = pat.address;
      this.formLandmark = pat.landmark || '';
      this.formZone = pat.zone;
    }
  }

  onZoneChange(): void {
    // Optionally auto-select phlebotomist matching this zone
    const match = this.phlebotomists().find((p) => p.zone && p.zone.includes(this.formZone.split(' - ')[0]));
    if (match) {
      this.selectedPhleboId = match.id;
    }
  }

  onPhleboSelect(): void {
    // Phlebotomist chosen
  }

  isTestSelected(testName: string): boolean {
    return this.selectedTests.includes(testName);
  }

  toggleTest(test: (typeof COMMON_LAB_TESTS)[0]): void {
    if (this.selectedTests.includes(test.name)) {
      this.selectedTests = this.selectedTests.filter((t) => t !== test.name);
    } else {
      this.selectedTests.push(test.name);
      if (test.fasting) {
        this.formFastingRequired = true;
      }
    }
    
    let sum = 0;
    for (const tName of this.selectedTests) {
      const match = this.commonTests.find((c) => c.name === tName);
      if (match) sum += match.price;
    }
    this.formTotalAmount = sum || 500;
  }

  computedTubes = computed(() => {
    const tubes = new Set<string>();
    for (const tName of this.selectedTests) {
      const match = this.commonTests.find((c) => c.name === tName);
      if (match) tubes.add(match.tube);
    }
    return Array.from(tubes);
  });


  saveCollection(): void {
    if (!this.formPatientName || !this.formMobile || this.selectedTests.length === 0) {
      return;
    }

    const assignedPhlebo = this.phlebotomists().find((p) => p.id === this.selectedPhleboId) || {
      id: 'PHL-101',
      name: 'Rahul Sharma',
      phone: '+91 98480 12345',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'AP31-CQ-7821',
    };

    if (this.formPatientType === 'new') {
      const nameParts = this.formPatientName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || '.';
      const ageNum = Number(this.formAge) || 30;
      const birthYear = new Date().getFullYear() - ageNum;
      const dob = `${birthYear}-01-01`;

      const payload = {
        firstName,
        lastName,
        gender: this.formGender,
        dob,
        phone: this.formMobile,
        email: this.formEmail || undefined,
        address: this.formAddress || undefined,
        category: 'DIRECT',
      };

      this.patientApi.create(payload).subscribe({
        next: (created) => {
          const officialUhid = created?.uhid || this.formPatientId;
          this.finishSaveCollection(officialUhid, assignedPhlebo);
          this.knownPatients.unshift({
            uhid: officialUhid,
            name: `${firstName} ${lastName}`.trim(),
            age: ageNum,
            gender: this.formGender,
            mobileNumber: this.formMobile,
            address: this.formAddress,
            landmark: this.formLandmark,
            zone: this.formZone,
          });
          this.loadNextUhid();
        },
        error: (err) => {
          console.warn('Could not register patient to backend, saving collection locally with fallback UHID', err);
          this.finishSaveCollection(this.formPatientId, assignedPhlebo);
        },
      });
    } else {
      this.finishSaveCollection(this.formPatientId, assignedPhlebo);
    }
  }

  private finishSaveCollection(patientId: string, assignedPhlebo: any): void {
    const newCol = this.colService.addCollection({
      patientId,
      patientName: this.formPatientName,
      age: Number(this.formAge || 30),
      gender: this.formGender,
      mobileNumber: this.formMobile,
      email: this.formEmail || undefined,
      address: this.formAddress,
      landmark: this.formLandmark || undefined,
      zone: this.formZone,
      date: this.formDate,
      timeSlot: this.formTimeSlot,
      fastingRequired: this.formFastingRequired,
      priority: this.formPriority,
      tests: [...this.selectedTests],
      tubesRequired: this.computedTubes(),
      specialInstructions: this.formInstructions || undefined,
      phlebotomistId: assignedPhlebo.id,
      phlebotomistName: assignedPhlebo.name,
      phlebotomistPhone: assignedPhlebo.phone || '+91 98480 12345',
      phlebotomistVehicle: assignedPhlebo.vehicleType ? `${assignedPhlebo.vehicleType} (${assignedPhlebo.vehicleNumber || ''})` : undefined,
      status: 'SCHEDULED',
      paymentStatus: this.formPaymentMode,
      totalAmount: this.formTotalAmount,
      temperatureCelsius: 4.0,
    });

    this.activeSlip.set(newCol);
    this.activeTab.set('list');

    // Create a bill for the scheduled home collection
    const billPayload = {
      patientId: patientId,
      patientName: this.formPatientName,
      items: [
        {
          description: `Home Collection - ${this.selectedTests.join(', ')}`,
          category: 'LAB',
          quantity: 1,
          unitPrice: Number(this.formTotalAmount),
          discount: 0,
          gst: 0
        }
      ],
      notes: `Home collection scheduled. Mode: ${this.formPaymentMode}`
    };

    this.billingApi.create(billPayload).subscribe({
      next: (res) => {
        console.log('Bill created for home collection:', res);
        if ((this.formPaymentMode === 'Paid' || this.formPaymentMode === 'UPI on Collection' || this.formPaymentMode === 'Cash on Collection') && res && res.id) {
          const pm = this.formPaymentMode === 'Paid' ? 'UPI' : (this.formPaymentMode === 'UPI on Collection' ? 'UPI' : 'CASH');
          this.billingApi.addPayment(res.id, {
            amount: Number(this.formTotalAmount),
            paymentMode: pm,
            transactionRef: 'Home Collection'
          }).subscribe({
            next: () => console.log('Payment recorded automatically.'),
            error: (err) => console.error('Failed to add payment:', err)
          });
        }
      },
      error: (err) => console.error('Failed to create bill:', err)
    });
  }

  getTubeClass(tubeName: string): string {
    const lower = tubeName.toLowerCase();
    if (lower.includes('edta') || lower.includes('purple')) return 'edta';
    if (lower.includes('fluoride') || lower.includes('grey')) return 'fluoride';
    if (lower.includes('sst') || lower.includes('gel') || lower.includes('yellow')) return 'sst';
    return '';
  }

  getStatusPillClass(status?: string): string {
    switch (status) {
      case 'SCHEDULED':
      case 'ASSIGNED':
        return 'st-scheduled';
      case 'SAMPLE_COLLECTED':
        return 'st-collected';
      case 'IN_TRANSIT':
        return 'st-transit';
      case 'DELIVERED_TO_LAB':
        return 'st-delivered';
      case 'CANCELLED':
        return 'st-cancelled';
      default:
        return 'st-scheduled';
    }
  }
}
