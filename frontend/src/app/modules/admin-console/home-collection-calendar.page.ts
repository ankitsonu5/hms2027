import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  HomeCollectionService,
  HomeCollection,
  ZONES,
  TIME_SLOTS,
} from '../../core/services/home-collection.service';

@Component({
  selector: 'hms-home-collection-calendar',
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

      /* ── Header with Controls Group ── */
      .calendar-page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
      }

      .page-title-group h1 {
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .page-subtitle {
        font-size: 13px;
        color: #64748b;
        margin-top: 3px;
      }

      .dropdown-controls-group {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #ffffff;
        padding: 6px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        flex-wrap: wrap;
      }

      .dropdown-label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .top-dropdown {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
        cursor: pointer;
        outline: none;
      }
      .top-dropdown:hover, .top-dropdown:focus {
        border-color: #2563eb;
        background: #fff;
      }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 14px;
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
        padding: 4px 8px;
        font-size: 11px;
      }

      /* ── 4 Top KPI Cards ── */
      .kpi-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }

      .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        position: relative;
        overflow: hidden;
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
      .card-pending::before { background: #f59e0b; }
      .card-cancelled::before { background: #dc2626; }

      .kpi-info-col {
        display: flex;
        flex-direction: column;
      }
      .kpi-label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 2px;
      }
      .kpi-value {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
      }
      .kpi-icon-box {
        width: 42px;
        height: 42px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .card-total .kpi-icon-box { background: #eff6ff; }
      .card-completed .kpi-icon-box { background: #f0fdf4; }
      .card-pending .kpi-icon-box { background: #fefce8; }
      .card-cancelled .kpi-icon-box { background: #fff1f2; }

      /* ── Calendar Container ── */
      .calendar-container {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        margin-bottom: 24px;
      }

      .calendar-nav-bar {
        padding: 14px 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;
        flex-wrap: wrap;
        gap: 10px;
      }

      .cal-title-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .cal-main-title {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
      }
      .cal-count-badge {
        font-size: 12px;
        background: #eff6ff;
        color: #1e40af;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
      }

      .cal-nav-buttons {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cal-btn {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        color: #334155;
      }
      .cal-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
      }

      /* ── Calendar Grid ── */
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-top: 1px solid #e2e8f0;
      }

      .cal-header-cell {
        background: #f8fafc;
        padding: 10px 8px;
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e2e8f0;
        border-right: 1px solid #f1f5f9;
      }

      .cal-day-cell {
        min-height: 108px;
        padding: 8px;
        border-bottom: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        background: #ffffff;
        cursor: pointer;
        transition: background 0.1s;
        display: flex;
        flex-direction: column;
      }
      .cal-day-cell:hover {
        background: #f8fafc;
      }
      .cal-day-cell.other-month {
        background: #fafafa;
        color: #94a3b8;
      }
      .cal-day-cell.is-today {
        background: #eff6ff;
      }
      .cal-day-cell.is-selected {
        outline: 2px solid #2563eb;
        outline-offset: -2px;
        background: #f0fdf4;
      }

      .day-cell-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .day-number {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .is-today .day-number {
        background: #2563eb;
        color: #ffffff;
      }

      .day-chip-count {
        font-size: 10px;
        font-weight: 700;
        background: #f1f5f9;
        color: #475569;
        padding: 1px 5px;
        border-radius: 4px;
      }

      /* Event chips on calendar day */
      .event-chips-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
        overflow: hidden;
      }
      .event-chip {
        font-size: 10px;
        font-weight: 600;
        padding: 3px 6px;
        border-radius: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .chip-scheduled { background: #e0f2fe; color: #0369a1; border-left: 2px solid #0284c7; }
      .chip-collected { background: #fef3c7; color: #b45309; border-left: 2px solid #d97706; }
      .chip-transit { background: #faf5ff; color: #7e22ce; border-left: 2px solid #9333ea; }
      .chip-delivered { background: #dcfce7; color: #15803d; border-left: 2px solid #16a34a; }
      .chip-cancelled { background: #fee2e2; color: #b91c1c; border-left: 2px solid #dc2626; }

      /* ── Day Details Table Section (Under Calendar) ── */
      .day-details-container {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .day-details-header {
        padding: 14px 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
        flex-wrap: wrap;
        gap: 8px;
      }
      .day-details-title {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th {
        background: #f8fafc;
        text-align: left;
        padding: 11px 14px;
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
        background: #2563eb;
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        margin-right: 6px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
      }
      .st-delivered { background: #dcfce7; color: #15803d; }
      .st-pending { background: #e0f2fe; color: #0369a1; }
      .st-transit { background: #faf5ff; color: #7e22ce; }
      .st-cancelled { background: #fee2e2; color: #b91c1c; }

      .empty-day-state {
        padding: 3rem 1rem;
        text-align: center;
        color: #64748b;
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
        max-width: 580px;
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
    `,
  ],
  template: `
    <!-- Top Nav & Breadcrumbs -->
    <div class="top-nav">
      <div class="crumb-bar">
        Home Collection > <strong>Calendar</strong>
      </div>
      <div style="display: flex; gap: 8px;">
        <a routerLink="/registration/home-collection/collections" class="btn btn-outline">
          📋 Collections List
        </a>
        <a routerLink="/registration/home-collection/phlebotomist-dashboard" class="btn btn-outline">
          📊 Phlebotomist Dashboard
        </a>
        <a routerLink="/registration/home-collection/phlebotomists" class="btn btn-outline">
          👨‍⚕️ Phlebotomists
        </a>
      </div>
    </div>

    <!-- Calendar Page Header with Right-Side Filter Controls -->
    <div class="calendar-page-header">
      <div class="page-title-group">
        <h1>
          <span>📅</span> Home Collection Calendar
        </h1>
        <div class="page-subtitle">
          Interactive schedule of doorstep specimen collections, route planning, and phlebotomist workload.
        </div>
      </div>

      <div class="dropdown-controls-group">
        <span class="dropdown-label">Period:</span>

        <!-- Year Dropdown -->
        <select class="top-dropdown" [ngModel]="selectedYear()" (ngModelChange)="selectedYear.set(+$event)">
          <option [value]="2025">2025</option>
          <option [value]="2026">2026</option>
          <option [value]="2027">2027</option>
        </select>

        <!-- Month Dropdown -->
        <select class="top-dropdown" [ngModel]="selectedMonth()" (ngModelChange)="onMonthChange($event)">
          <option value="ALL">All Months</option>
          @for (m of monthNames; track $index) {
            <option [value]="$index">{{ m }}</option>
          }
        </select>

        <!-- Zone Dropdown -->
        <select class="top-dropdown" [(ngModel)]="selectedZoneFilter">
          <option value="ALL">All Zones</option>
          @for (z of zones; track z) {
            <option [value]="z">{{ z }}</option>
          }
        </select>

        <!-- Phlebotomist Dropdown -->
        <select class="top-dropdown" [(ngModel)]="selectedPhleboFilter">
          <option value="ALL">All Phlebotomists</option>
          @for (p of phlebotomists(); track p.id) {
            <option [value]="p.id">{{ p.name }}</option>
          }
        </select>

        <a routerLink="/registration/home-collection/collections" [queryParams]="{ action: 'new' }" class="btn btn-primary btn-sm">
          + Schedule
        </a>
      </div>
    </div>

    <!-- 4 Top KPI Cards -->
    <div class="kpi-cards-grid">
      <div class="kpi-card card-total">
        <div class="kpi-info-col">
          <span class="kpi-label">Total Pickups</span>
          <span class="kpi-value">{{ kpiTotal() }}</span>
        </div>
        <div class="kpi-icon-box">📦</div>
      </div>

      <div class="kpi-card card-completed">
        <div class="kpi-info-col">
          <span class="kpi-label">Delivered to Lab</span>
          <span class="kpi-value">{{ kpiDelivered() }}</span>
        </div>
        <div class="kpi-icon-box">🧪</div>
      </div>

      <div class="kpi-card card-pending">
        <div class="kpi-info-col">
          <span class="kpi-label">Scheduled / In Transit</span>
          <span class="kpi-value">{{ kpiPending() }}</span>
        </div>
        <div class="kpi-icon-box">🛵</div>
      </div>

      <div class="kpi-card card-cancelled">
        <div class="kpi-info-col">
          <span class="kpi-label">Cancelled</span>
          <span class="kpi-value">{{ kpiCancelled() }}</span>
        </div>
        <div class="kpi-icon-box">✕</div>
      </div>
    </div>

    <!-- Main Calendar Box -->
    <div class="calendar-container">
      <div class="calendar-nav-bar">
        <div class="cal-title-section">
          <div class="cal-main-title">{{ currentCalendarTitle() }}</div>
          <span class="cal-count-badge">{{ filteredPeriodCollections().length }} Collections Scheduled</span>
        </div>

        <div class="cal-nav-buttons">
          <button class="cal-btn" (click)="goToPreviousMonth()">‹ Prev Month</button>
          <button class="cal-btn" (click)="goToToday()">Today</button>
          <button class="cal-btn" (click)="goToNextMonth()">Next Month ›</button>
        </div>
      </div>

      <!-- Days of Week Header -->
      <div class="calendar-grid">
        <div class="cal-header-cell">Sun</div>
        <div class="cal-header-cell">Mon</div>
        <div class="cal-header-cell">Tue</div>
        <div class="cal-header-cell">Wed</div>
        <div class="cal-header-cell">Thu</div>
        <div class="cal-header-cell">Fri</div>
        <div class="cal-header-cell">Sat</div>

        <!-- 35/42 Day Cells -->
        @for (cell of calendarDays(); track cell.dateStr) {
          <div
            class="cal-day-cell"
            [class.other-month]="!cell.isCurrentMonth"
            [class.is-today]="cell.isToday"
            [class.is-selected]="cell.dateStr === selectedDate()"
            (click)="selectDay(cell.dateStr)"
          >
            <div class="day-cell-top">
              <span class="day-number">{{ cell.dayNumber }}</span>
              @if (cell.collections.length > 0) {
                <span class="day-chip-count">{{ cell.collections.length }} pickups</span>
              }
            </div>

            <div class="event-chips-list">
              @for (c of cell.collections.slice(0, 3); track c.id) {
                <div class="event-chip" [ngClass]="getChipClass(c.status)" (click)="$event.stopPropagation(); openDetails(c)" [title]="c.patientName + ' (' + c.tests.join(', ') + ')'">
                  <span>{{ c.patientName.split(' ')[0] }}</span>
                  <span style="font-size: 9px; opacity: 0.85;">• {{ c.timeSlot.split(' ')[0] }}</span>
                </div>
              }
              @if (cell.collections.length > 3) {
                <div style="font-size: 9px; color: #2563eb; font-weight: 700; text-align: center;">
                  +{{ cell.collections.length - 3 }} more
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Day Details Section (List of pickups for the currently selected date) -->
    <div class="day-details-container">
      <div class="day-details-header">
        <div class="day-details-title">
          <span>📋</span> Pickups Scheduled for {{ formatPrettyDate(selectedDate()) }}
          <span style="font-size: 12px; background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-weight: 700;">
            {{ selectedDayCollections().length }} Pickups
          </span>
        </div>
        <div>
          <a routerLink="/registration/home-collection/collections" [queryParams]="{ action: 'new' }" class="btn btn-outline btn-sm">
            + Schedule on this Day
          </a>
        </div>
      </div>

      @if (selectedDayCollections().length === 0) {
        <div class="empty-day-state">
          <div style="font-size: 26px; margin-bottom: 6px;">🏠</div>
          <div style="font-weight: 700; color: #0f172a;">No Pickups Scheduled for {{ formatPrettyDate(selectedDate()) }}</div>
          <div style="font-size: 13px; color: #94a3b8; margin: 4px 0 14px 0;">
            Phlebotomist routes are open on this date.
          </div>
          <a routerLink="/registration/home-collection/collections" [queryParams]="{ action: 'new' }" class="btn btn-primary btn-sm">
            + Schedule Home Collection
          </a>
        </div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Collection ID</th>
              <th>Patient Details</th>
              <th>Time Slot & Fasting</th>
              <th>Zone & Address</th>
              <th>Tests Ordered</th>
              <th>Phlebotomist</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (col of selectedDayCollections(); track col.id) {
              <tr>
                <td>
                  <span class="token-badge">{{ col.seqNo }}</span>
                  <strong>{{ col.id }}</strong>
                </td>
                <td>
                  <div style="font-weight: 600; color: #0f172a;">{{ col.patientName }}</div>
                  <div style="font-size: 11px; color: #64748b;">{{ col.patientId }} • {{ col.age }}y / {{ col.gender }}</div>
                  <div style="font-size: 11px; color: #1e293b;">📞 {{ col.mobileNumber }}</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: #2563eb;">{{ col.timeSlot }}</div>
                  @if (col.fastingRequired) {
                    <span style="font-size: 10px; color: #b91c1c; font-weight: 700;">⚠️ Fasting required</span>
                  }
                </td>
                <td>
                  <div style="font-weight: 600; color: #0f172a;">{{ col.zone }}</div>
                  <div style="font-size: 11px; color: #64748b;">📍 {{ col.address }}</div>
                </td>
                <td>
                  <div style="font-size: 12px; color: #334155;">{{ col.tests.join(', ') }}</div>
                </td>
                <td>
                  <div style="font-weight: 600;">{{ col.phlebotomistName }}</div>
                  <div style="font-size: 11px; color: #64748b;">📞 {{ col.phlebotomistPhone }}</div>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="getStatusPillClass(col.status)">
                    {{ col.status }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-outline btn-sm" (click)="openDetails(col)">
                    👁️ View Details
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- DETAIL MODAL -->
    @if (activeModalCollection()) {
      <div class="modal-overlay" (click)="closeDetails()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Collection Details ({{ activeModalCollection()?.id }})</h2>
            <button class="btn btn-outline btn-sm" (click)="closeDetails()">✕</button>
          </div>
          <div class="modal-body">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div>
                <div style="font-size: 16px; font-weight: 700; color: #0f172a;">{{ activeModalCollection()?.patientName }}</div>
                <div style="font-size: 12px; color: #64748b;">{{ activeModalCollection()?.patientId }} • {{ activeModalCollection()?.age }} yrs / {{ activeModalCollection()?.gender }}</div>
                <div style="font-size: 12px; color: #1e293b; margin-top: 2px;">📞 {{ activeModalCollection()?.mobileNumber }}</div>
              </div>
              <span class="status-pill" [ngClass]="getStatusPillClass(activeModalCollection()?.status)">
                {{ activeModalCollection()?.status }}
              </span>
            </div>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Doorstep Pickup Location</div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">
                📍 {{ activeModalCollection()?.address }}
              </div>
              @if (activeModalCollection()?.landmark) {
                <div style="font-size: 12px; color: #64748b;">Landmark: {{ activeModalCollection()?.landmark }}</div>
              }
              <div style="font-size: 12px; color: #2563eb; margin-top: 2px;">{{ activeModalCollection()?.zone }}</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div style="background: #f8fafc; padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748b;">Date & Time Slot</div>
                <div style="font-size: 13px; font-weight: 600;">{{ activeModalCollection()?.date }}</div>
                <div style="font-size: 11px; color: #2563eb;">{{ activeModalCollection()?.timeSlot }}</div>
                @if (activeModalCollection()?.fastingRequired) {
                  <span style="font-size: 10px; color: #b91c1c; font-weight: 700;">⚠️ Fasting required</span>
                }
              </div>

              <div style="background: #f8fafc; padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: #64748b;">Assigned Phlebotomist</div>
                <div style="font-size: 13px; font-weight: 600;">{{ activeModalCollection()?.phlebotomistName }}</div>
                <div style="font-size: 11px; color: #64748b;">📞 {{ activeModalCollection()?.phlebotomistPhone }}</div>
                @if (activeModalCollection()?.phlebotomistVehicle) {
                  <div style="font-size: 10px; color: #94a3b8;">🛵 {{ activeModalCollection()?.phlebotomistVehicle }}</div>
                }
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Tests Ordered:</div>
              <div style="font-size: 13px; color: #334155;">{{ activeModalCollection()?.tests?.join(', ') }}</div>
            </div>

            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Tubes Required:</div>
              <div style="font-size: 13px; color: #854d0e;">🧪 {{ activeModalCollection()?.tubesRequired?.join(', ') }}</div>
            </div>

            @if (activeModalCollection()?.specialInstructions) {
              <div style="background: #fefce8; border: 1px solid #fef08a; padding: 10px; border-radius: 6px; font-size: 12px; color: #854d0e; margin-bottom: 12px;">
                <strong>Note:</strong> {{ activeModalCollection()?.specialInstructions }}
              </div>
            }

            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              <div><strong>Amount:</strong> ₹{{ activeModalCollection()?.totalAmount }} ({{ activeModalCollection()?.paymentStatus }})</div>
              @if (activeModalCollection()?.temperatureCelsius) {
                <div style="color: #2563eb; font-weight: 600;">❄️ Temp: {{ activeModalCollection()?.temperatureCelsius }}°C</div>
              }
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeDetails()">Close</button>
            <a routerLink="/registration/home-collection/collections" class="btn btn-primary">Open in Collections Manager</a>
          </div>
        </div>
      </div>
    }
  `,
})
export class HomeCollectionCalendarPage implements OnInit {
  private colService = inject(HomeCollectionService);

  collections = this.colService.collections;
  phlebotomists = this.colService.phlebotomists;

  zones = ZONES;
  timeSlots = TIME_SLOTS;

  today = new Date();
  todayStr = new Date().toISOString().split('T')[0];

  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number | 'ALL'>(new Date().getMonth());
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);

  selectedZoneFilter = 'ALL';
  selectedPhleboFilter = 'ALL';

  activeModalCollection = signal<HomeCollection | null>(null);

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  ngOnInit(): void {
    // Initialized
  }

  onMonthChange(newMonth: any): void {
    this.selectedMonth.set(newMonth === 'ALL' ? 'ALL' : Number(newMonth));
  }

  goToPreviousMonth(): void {
    const curM = this.selectedMonth();
    if (curM === 'ALL' || curM === 0) {
      this.selectedMonth.set(11);
      this.selectedYear.update((y) => y - 1);
    } else {
      this.selectedMonth.update((m) => (m as number) - 1);
    }
  }

  goToNextMonth(): void {
    const curM = this.selectedMonth();
    if (curM === 'ALL' || curM === 11) {
      this.selectedMonth.set(0);
      this.selectedYear.update((y) => y + 1);
    } else {
      this.selectedMonth.update((m) => (m as number) + 1);
    }
  }

  goToToday(): void {
    this.selectedYear.set(this.today.getFullYear());
    this.selectedMonth.set(this.today.getMonth());
    this.selectedDate.set(this.todayStr);
  }

  selectDay(dateStr: string): void {
    this.selectedDate.set(dateStr);
  }

  currentCalendarTitle = computed(() => {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    if (m === 'ALL') return `All Months ${y}`;
    return `${this.monthNames[m]} ${y}`;
  });

  // Filter collections for current year/month/phlebo/zone
  filteredPeriodCollections = computed(() => {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const z = this.selectedZoneFilter;
    const ph = this.selectedPhleboFilter;

    return this.collections().filter((col) => {
      if (!col.date) return false;
      const parts = col.date.split('-');
      if (parts.length !== 3) return false;

      const colY = Number(parts[0]);
      const colM = Number(parts[1]) - 1;

      if (colY !== y) return false;
      if (m !== 'ALL' && colM !== m) return false;
      if (z !== 'ALL' && col.zone !== z) return false;
      if (ph !== 'ALL' && col.phlebotomistId !== ph) return false;

      return true;
    });
  });

  // KPI Metrics
  kpiTotal = computed(() => this.filteredPeriodCollections().length);
  kpiDelivered = computed(() => this.filteredPeriodCollections().filter((c) => c.status === 'DELIVERED_TO_LAB').length);
  kpiPending = computed(() => this.filteredPeriodCollections().filter((c) => c.status === 'SCHEDULED' || c.status === 'ASSIGNED' || c.status === 'IN_TRANSIT' || c.status === 'SAMPLE_COLLECTED').length);
  kpiCancelled = computed(() => this.filteredPeriodCollections().filter((c) => c.status === 'CANCELLED').length);

  // Calendar Day Cells
  calendarDays = computed(() => {
    const year = this.selectedYear();
    const m = this.selectedMonth();
    const month = m === 'ALL' ? this.today.getMonth() : m;
    const today = this.todayStr;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      collections: HomeCollection[];
    }> = [];

    const periodCols = this.filteredPeriodCollections();

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayCols = periodCols.filter((c) => c.date === dateStr);
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        collections: dayCols,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayCols = periodCols.filter((c) => c.date === dateStr);
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        collections: dayCols,
      });
    }

    // Next month filler days
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let n = 1; n <= remaining; n++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      const dayCols = periodCols.filter((c) => c.date === dateStr);
      cells.push({
        dayNumber: n,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        collections: dayCols,
      });
    }

    return cells;
  });

  // Collections for currently selected day
  selectedDayCollections = computed(() => {
    const sel = this.selectedDate();
    return this.filteredPeriodCollections().filter((c) => c.date === sel);
  });

  getChipClass(status: string): string {
    switch (status) {
      case 'DELIVERED_TO_LAB':
        return 'chip-delivered';
      case 'IN_TRANSIT':
        return 'chip-transit';
      case 'SAMPLE_COLLECTED':
        return 'chip-collected';
      case 'CANCELLED':
        return 'chip-cancelled';
      default:
        return 'chip-scheduled';
    }
  }

  getStatusPillClass(status?: string): string {
    switch (status) {
      case 'DELIVERED_TO_LAB':
        return 'st-delivered';
      case 'IN_TRANSIT':
      case 'SAMPLE_COLLECTED':
        return 'st-transit';
      case 'CANCELLED':
        return 'st-cancelled';
      default:
        return 'st-pending';
    }
  }

  formatPrettyDate(val: string): string {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = mNames[Number(parts[1]) - 1] || parts[1];
      return `${parts[2]} ${m}, ${parts[0]}`;
    }
    return val;
  }

  openDetails(col: HomeCollection): void {
    this.activeModalCollection.set(col);
  }

  closeDetails(): void {
    this.activeModalCollection.set(null);
  }
}
