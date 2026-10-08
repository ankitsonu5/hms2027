import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';

@Component({
  selector: 'hms-test-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styles: [
    `
      .page-container {
        padding: var(--sp-4) var(--sp-6);
        background: #f8fafc;
        min-height: 100vh;
      }
      .top-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--sp-2);
        margin-bottom: var(--sp-4);
      }
      .top-actions button {
        background: #fff;
        border: 1px solid var(--clr-primary-300);
        color: var(--clr-primary-700);
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--radius-sm);
        font-weight: var(--fw-medium);
        font-size: var(--text-sm);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .top-actions button.primary {
        background: var(--clr-primary-600);
        color: #fff;
        border: none;
      }
      .top-actions button:hover {
        opacity: 0.9;
      }
      .dropdown-container {
        position: relative;
        display: inline-block;
      }
      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: #fff;
        border: 1px solid var(--border-default);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        border-radius: var(--radius-sm);
        min-width: 160px;
        z-index: 100;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
      }
      .dropdown-menu button {
        border: none;
        background: transparent;
        color: var(--clr-neutral-800);
        padding: 8px 16px;
        text-align: left;
        width: 100%;
        border-radius: 0;
        justify-content: flex-start;
      }
      .dropdown-menu button:hover {
        background: var(--clr-neutral-50);
        color: var(--clr-primary-700);
      }
      .tabs {
        display: flex;
        border-bottom: 1px solid var(--border-default);
        margin-bottom: var(--sp-2);
        gap: var(--sp-6);
      }
      .tab {
        padding: var(--sp-3) 0;
        cursor: pointer;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-500);
        border-bottom: 2px solid transparent;
      }
      .tab.active {
        color: var(--clr-primary-700);
        border-bottom: 2px solid var(--clr-primary-600);
      }
      .search-filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-4);
        margin: var(--sp-3) 0;
        flex-wrap: wrap;
      }
      .search-box {
        position: relative;
        flex: 1;
        max-width: 460px;
        min-width: 260px;
        display: flex;
        align-items: center;
      }
      .search-box svg {
        position: absolute;
        left: 12px;
        color: #94a3b8;
        pointer-events: none;
      }
      .search-box input {
        width: 100%;
        padding: 9px 34px 9px 36px;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        background: #ffffff;
        color: var(--clr-neutral-800);
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .search-box input:focus {
        border-color: var(--clr-primary-600);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      }
      .clear-btn {
        position: absolute;
        right: 10px;
        background: #e2e8f0;
        border: none;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 11px;
        line-height: 1;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .clear-btn:hover {
        background: #cbd5e1;
        color: #1e293b;
      }
      .empty-search-state {
        padding: 48px 24px;
        text-align: center;
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        margin-top: 12px;
      }
      .empty-search-state h3 {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 6px 0;
      }
      .empty-search-state p {
        font-size: 13px;
        color: #64748b;
        margin: 0 0 16px 0;
      }
      .btn-clear-search {
        background: var(--clr-primary-600);
        color: #ffffff;
        border: none;
        padding: 6px 14px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-clear-search:hover {
        background: #1d4ed8;
      }
      .row-count {
        font-size: var(--text-sm);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-800);
      }
      .table-card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        overflow-x: auto;
      }
      .table-card table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
      }
      .table-card th {
        background: var(--clr-neutral-50);
        color: var(--clr-neutral-600);
        font-weight: var(--fw-semibold);
        text-align: left;
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--border-default);
      }
      .table-card td {
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--border-default);
        color: var(--clr-neutral-800);
        white-space: nowrap;
      }
      .group-header {
        background: #fafafa;
        cursor: pointer;
      }
      .group-header td {
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-700);
      }
      .group-header .icon {
        display: inline-block;
        margin-right: var(--sp-2);
        transition: transform 0.2s;
      }
      .group-header.collapsed .icon {
        transform: rotate(-90deg);
      }
      .status-badge {
        background: var(--clr-warning-100);
        color: var(--clr-warning-700);
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        font-weight: var(--fw-bold);
        text-transform: uppercase;
      }
      .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--clr-neutral-500);
        font-size: 18px;
        line-height: 1;
      }
      .loading {
        padding: var(--sp-6);
        text-align: center;
        color: var(--clr-neutral-500);
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-content {
        background: #fff;
        border-radius: 8px;
        width: 900px;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      .modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-title {
        font-size: 18px;
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-900);
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        color: var(--clr-neutral-500);
      }
      .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }
      .modal-tabs {
        display: flex;
        border-bottom: 2px solid #eee;
        margin-bottom: 24px;
        gap: 24px;
      }
      .modal-tab {
        padding: 12px 4px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        color: #666;
        font-size: 14px;
        font-weight: 500;
      }
      .modal-tab.active {
        border-color: var(--clr-primary-600);
        color: var(--clr-primary-700);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 16px;
        align-items: center;
        margin-bottom: 16px;
      }
      .form-grid label {
        text-align: left;
        color: #555;
        font-size: 14px;
      }
      .form-grid input[type="text"], .form-grid select, .form-grid input[type="number"] {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .checkbox-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #555;
        grid-column: 2;
      }
      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #ddd;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .btn-cancel {
        background: #fff;
        border: 1px solid #ddd;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-save {
        background: var(--clr-primary-600);
        color: #fff;
        border: none;
        padding: 8px 24px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-save:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .invalid-feedback {
        color: var(--clr-danger-600);
        font-size: 12px;
        grid-column: 2;
        margin-top: -12px;
        margin-bottom: 8px;
      }
      
      /* Parameter Builder */
      .parameters-builder {
        display: flex;
        height: 550px;
        border: 1px solid var(--border-default);
        margin-top: var(--sp-4);
        background: #fff;
        border-radius: var(--radius-sm);
      }
      .pb-sidebar {
        width: 260px;
        border-right: 1px solid var(--border-default);
        background: #f8fafc;
        display: flex;
        flex-direction: column;
      }
      .pb-sidebar-header {
        padding: var(--sp-3);
        font-weight: var(--fw-bold);
        border-bottom: 1px solid var(--border-default);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
      }
      .pb-item {
        padding: var(--sp-3);
        border-bottom: 1px solid var(--border-default);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }
      .pb-item.active {
        background: #e2e8f0;
        border-left: 3px solid var(--clr-primary-600);
      }
      .pb-content {
        flex: 1;
        padding: var(--sp-6);
        overflow-y: auto;
      }
      .add-param-dropdown {
        position: absolute;
        top: 80px;
        right: 24px;
      }
      .add-param-btn {
        background: var(--clr-primary-600);
        color: white;
        border: none;
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
      }
      .param-menu {
        position: absolute;
        right: 0;
        top: 100%;
        background: white;
        border: 1px solid var(--border-default);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 50;
        min-width: 180px;
        text-align: left;
        border-radius: var(--radius-sm);
        margin-top: 4px;
      }
      .param-menu-item {
        padding: var(--sp-2) var(--sp-3);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: var(--clr-neutral-800);
        position: relative;
      }
      .param-menu-item:hover {
        background: #f1f5f9;
        color: var(--clr-primary-600);
      }
      .sub-menu {
        position: absolute;
        right: 100%;
        top: 0;
        background: white;
        border: 1px solid var(--border-default);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        min-width: 220px;
        display: none;
        border-radius: var(--radius-sm);
      }
      .param-menu-item:hover .sub-menu {
        display: block;
      }
      .param-form-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--sp-4);
        font-weight: var(--fw-bold);
        font-size: 14px;
      }
      .param-tabs {
        display: flex;
        gap: var(--sp-4);
        border-bottom: 1px solid var(--border-default);
        margin: var(--sp-4) 0;
      }
      .param-tab {
        padding: var(--sp-2) 0;
        cursor: pointer;
        color: var(--clr-neutral-500);
        font-size: 13px;
        font-weight: 500;
        margin-bottom: -1px;
        border-bottom: 2px solid transparent;
      }
      .param-tab.active {
        color: var(--clr-primary-600);
        border-bottom: 2px solid var(--clr-primary-600);
      }
      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--sp-3);
        margin-top: var(--sp-4);
      }
      .checkbox-grid label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #555;
      }
      .param-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-4);
        margin-bottom: var(--sp-4);
      }
      .param-form-grid .full-width {
        grid-column: 1 / -1;
      }
      .param-form-grid label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: #555;
      }
      .form-control {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        outline: none;
      }
      .form-control:focus {
        border-color: var(--clr-primary-600);
      }
      @media print {
        .top-actions, .tabs {
          display: none !important;
        }
        .page-container {
          padding: 0;
          background: #fff;
        }
        .table-card {
          border: none;
          box-shadow: none;
        }
      }
    `
  ],
  template: `
    <div class="page-container">
      <div class="top-actions">
        <div class="dropdown-container">
          <button type="button" (click)="toggleExportMenu()">Export ▾</button>
          @if (showExportMenu()) {
            <div class="dropdown-menu">
              <button type="button" (click)="exportExcel()">Export as Excel</button>
              <button type="button" (click)="exportPdf()">Export as PDF</button>
            </div>
          }
        </div>
        <button type="button">Go to old version</button>
        <button type="button">Parameter Wise Export</button>
        <button type="button">Bulk Actions ▾</button>
        <button type="button" class="primary" (click)="openAddModal('PROFILE')">Add Profile</button>
        <button type="button" class="primary" (click)="openAddModal('TEST')">Add New Report</button>
      </div>

      <div class="tabs">
        <div class="tab" [class.active]="activeMainTab() === 'TEST'" (click)="activeMainTab.set('TEST')">Tests</div>
        <div class="tab" [class.active]="activeMainTab() === 'PROFILE'" (click)="activeMainTab.set('PROFILE')">Profile Tests</div>
        <div class="tab" [class.active]="activeMainTab() === 'BILL_ONLY'" (click)="activeMainTab.set('BILL_ONLY')">Bill Only Test</div>
      </div>

      <!-- Search Toolbar -->
      <div class="search-filter-bar">
        <div class="search-box">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search by test name, test code, department..."
          />
          @if (searchQuery()) {
            <button type="button" class="clear-btn" (click)="clearSearch()" title="Clear search">✕</button>
          }
        </div>
        <div class="row-count">Rows: {{ filteredTests().length }}</div>
      </div>

      @if (loading()) {
        <div class="loading">Loading tests...</div>
      } @else if (filteredTests().length === 0) {
        <div class="empty-search-state">
          <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
          <h3>No tests found</h3>
          <p>No tests match "{{ searchQuery() }}" in {{ activeMainTab() === 'TEST' ? 'Tests' : activeMainTab() === 'PROFILE' ? 'Profile Tests' : 'Bill Only Tests' }}.</p>
          @if (searchQuery()) {
            <button type="button" class="btn-clear-search" (click)="clearSearch()">Clear Search</button>
          }
        </div>
      } @else {
        <div class="table-card">
          <table>
            <thead>
              @if (activeMainTab() === 'PROFILE') {
                <tr>
                  <th style="width: 40px"><input type="checkbox" /></th>
                  <th style="white-space: nowrap;">Profile Name <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Profile Code <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Price (₹) <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Outsourced <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Auto Approval <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="width: 40px"></th>
                </tr>
              } @else {
                <tr>
                  <th style="width: 40px"><input type="checkbox" /></th>
                  <th style="white-space: nowrap;">Test Name <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Test Code <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Price (₹) <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Sample Type <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Department <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Outsourced <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Outsource Center <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="white-space: nowrap;">Auto Approval <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; margin-left: 4px; vertical-align: middle;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg></th>
                  <th style="width: 40px"></th>
                </tr>
              }
            </thead>
            <tbody>
              @for (group of groupedFiltered(); track group.category) {
                <!-- Only show group headers if it's the TESTS tab -->
                @if (activeMainTab() === 'TEST') {
                  <tr class="group-header" [class.collapsed]="!group.expanded" (click)="toggleGroup(group)">
                    <td colspan="10">
                      <span class="icon">▼</span>
                      {{ (group.category || 'UNASSIGNED') | uppercase }} ({{ group.items.length }})
                    </td>
                  </tr>
                }
                
                @if (group.expanded || activeMainTab() !== 'TEST') {
                  @for (test of group.items; track test.id) {
                    <tr>
                      <td><input type="checkbox" /></td>
                      <td style="white-space: normal; min-width: 250px;">
                        <strong>{{ test.name }}</strong>
                        <span class="status-badge">Not Verified</span>
                      </td>
                      <td style="white-space: normal; min-width: 150px;">{{ test.code || 'undefined' }}</td>
                      <td>₹{{ test.price ?? 0 }}</td>
                      @if (activeMainTab() !== 'PROFILE') {
                        <td>{{ test.sampleType || '—' }}</td>
                        <td>{{ (test.category || '—') | uppercase }}</td>
                      }
                      <td>No</td> <!-- Mocked -->
                      @if (activeMainTab() !== 'PROFILE') {
                        <td>Self</td> <!-- Mocked Outsource Center -->
                      }
                      <td>No</td> <!-- Mocked Auto Approval -->
                      <td><button class="action-btn">⋮</button></td>
                    </tr>
                  }
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- ADD MODAL -->
    @if (showModal()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ addingType() === 'PROFILE' ? 'Add Profile' : 'Test List (Add Report)' }}</h2>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body" style="position: relative;">
            <div class="modal-tabs">
              <div class="modal-tab" [class.active]="activeModalTab() === 'Info'" (click)="activeModalTab.set('Info')">Test Information</div>
              <div class="modal-tab" [class.active]="activeModalTab() === 'Params'" (click)="activeModalTab.set('Params')">Report Parameters</div>
              <div class="modal-tab">Supplementary Test</div>
              <div class="modal-tab">Report Templating</div>
              <div class="modal-tab">Parent Test Mapping</div>
              <div class="modal-tab" [class.active]="activeModalTab() === 'ReportSettings'" (click)="activeModalTab.set('ReportSettings')">Report Settings</div>
            </div>

            @if (activeModalTab() === 'Info') {
              <form [formGroup]="testForm">
                <div class="form-grid">
                  <label>Test Name <span style="color:red">*</span></label>
                  <input type="text" formControlName="name" placeholder="Enter Test Name" />
                  @if (isInvalid('name')) { <div class="invalid-feedback">Required</div> }
                </div>

                <div class="form-grid">
                  <label>Sample Type</label>
                  <select formControlName="sampleType">
                    <option value="">Sample Type</option>
                    <option value="Serum">Serum</option>
                    <option value="Plasma">Plasma</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Urine">Urine</option>
                  </select>
                </div>

                <div class="form-grid">
                  <label>Test Code</label>
                  <input type="text" formControlName="code" placeholder="Enter Test Code" />
                </div>

                <div class="form-grid">
                  <label>Integration Code</label>
                  <input type="text" formControlName="integrationCode" placeholder="Enter the Integration Code" />
                </div>

                <div class="form-grid">
                  <label>Procedure Code</label>
                  <select formControlName="procedureCode">
                    <option value="">Select Procedure Code</option>
                    <option value="PROC-1">PROC-1</option>
                    <option value="PROC-2">PROC-2</option>
                  </select>
                </div>

                <div class="form-grid">
                  <label>LOINC Code</label>
                  <input type="text" formControlName="loincCode" placeholder="Enter LOINC Code" />
                </div>

                <div class="form-grid">
                  <label>Short Text</label>
                  <input type="text" formControlName="shortText" placeholder="Enter Short Text" />
                </div>

                <div class="form-grid">
                  <label>Test Alias</label>
                  <input type="text" formControlName="testAlias" placeholder="Type an alias and press Enter" />
                </div>

                <div class="form-grid">
                  <label>Test Type (Category) <span style="color:red">*</span></label>
                  <select formControlName="category">
                    <option value="Pathology">Pathology</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Serology">Serology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                  @if (isInvalid('category')) { <div class="invalid-feedback">Required</div> }
                </div>

                <div class="form-grid">
                  <label>Price (₹) <span style="color:red">*</span></label>
                  <input type="number" formControlName="price" placeholder="0" min="0" />
                  @if (isInvalid('price')) { <div class="invalid-feedback">Required</div> }
                </div>

                <div class="form-grid">
                  <label>ICD(s) TO PIN</label>
                  <input type="text" formControlName="icdToPin" placeholder="Select ICD Code" />
                </div>

                <div class="form-grid">
                  <div></div>
                  <div class="checkbox-wrap">
                    <input type="checkbox" id="autoAdd" />
                    <label for="autoAdd" style="text-align: left; margin: 0">Auto-add to the test</label>
                  </div>
                </div>
              </form>
            } @else if (activeModalTab() === 'Params') {
              <div class="add-param-dropdown">
                <button class="add-param-btn" (click)="showParamMenu.set(!showParamMenu())">Add New Parameter ▾</button>
                @if (showParamMenu()) {
                  <div class="param-menu">
                    <div class="param-menu-item">
                      Pathology <span>›</span>
                      <div class="sub-menu">
                        <div class="param-menu-item" (click)="addParameter('Test With Normal Range')">Test With Normal Range</div>
                        <div class="param-menu-item" (click)="addParameter('Test With Descriptive Range')">Test With Descriptive Range</div>
                        <div class="param-menu-item" (click)="addParameter('Test With Age Specific Range')">Test With Age Specific Range</div>
                        <div class="param-menu-item" (click)="addParameter('Descriptive (No Ranges)')">Descriptive (No Ranges)</div>
                        <div class="param-menu-item" (click)="addParameter('List Field')">List Field</div>
                        <div class="param-menu-item" (click)="addParameter('File')">File</div>
                        <div class="param-menu-item" (click)="addParameter('Graph')">Graph</div>
                        <div class="param-menu-item" (click)="addParameter('Image')">Image</div>
                      </div>
                    </div>
                    <div class="param-menu-item">
                      Radiology <span>›</span>
                      <div class="sub-menu">
                        <div class="param-menu-item" (click)="addParameter('Descriptive (No Ranges)')">Descriptive (No Ranges)</div>
                        <div class="param-menu-item" (click)="addParameter('File')">File</div>
                        <div class="param-menu-item" (click)="addParameter('List Field')">List Field</div>
                        <div class="param-menu-item" (click)="addParameter('Image')">Image</div>
                      </div>
                    </div>
                    <div class="param-menu-item">
                      Style <span>›</span>
                      <div class="sub-menu">
                        <div class="param-menu-item" (click)="addParameter('Heading With Separator Line')">Heading With Separator Line</div>
                        <div class="param-menu-item" (click)="addParameter('Heading')">Heading</div>
                        <div class="param-menu-item" (click)="addParameter('Heading In Center')">Heading In Center</div>
                        <div class="param-menu-item" (click)="addParameter('Space')">Space</div>
                        <div class="param-menu-item" (click)="addParameter('Separator Line')">Separator Line</div>
                        <div class="param-menu-item" (click)="addParameter('Page Break')">Page Break</div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div class="parameters-builder">
                <div class="pb-sidebar">
                  <div class="pb-sidebar-header">
                    <span>Test Parameters ({{ testParameters().length }})</span>
                  </div>
                  @for (param of testParameters(); track param.id; let i = $index) {
                    <div class="pb-item" [class.active]="selectedParam()?.id === param.id" (click)="selectedParam.set(param)">
                      <div>
                        <strong>{{ param.name || param.type }}</strong>
                        <div style="font-size:11px;color:#666;margin-top:2px;">{{ param.type }}</div>
                      </div>
                      <span style="color:#999;font-size:16px;" (click)="$event.stopPropagation(); removeParam(param.id)">✕</span>
                    </div>
                  }
                </div>
                <div class="pb-content" (click)="showParamMenu.set(false)">
                  @if (selectedParam()) {
                    <div class="param-form-header">
                      <span>Parameters Information</span>
                      <a href="javascript:void(0)" style="color:#666;font-size:12px;font-weight:normal;">Duplicate/Copy</a>
                    </div>
                    
                    @if (selectedParam()!.type === 'Heading With Separator Line' || selectedParam()!.type === 'Heading' || selectedParam()!.type === 'Heading In Center') {
                      <div class="param-form-grid">
                        <div class="full-width">
                          <label>Name <span style="color:red">*</span></label>
                          <input type="text" [(ngModel)]="selectedParam()!.name" class="form-control" placeholder="Enter Name">
                        </div>
                      </div>
                    } @else if (selectedParam()!.type === 'Space' || selectedParam()!.type === 'Separator Line' || selectedParam()!.type === 'Page Break') {
                      <!-- Intentionally empty to skip rendering anything but Other Info -->
                    } @else if (selectedParam()!.type === 'Image') {
                      <div class="param-form-grid">
                        <div class="full-width">
                          <label>Enter Component Title <span style="color:red">*</span></label>
                          <input type="text" [(ngModel)]="selectedParam()!.name" class="form-control" placeholder="Image">
                        </div>
                        <div class="full-width">
                          <label>Max Rows <span style="color:red">*</span></label>
                          <select class="form-control"><option>Select number of Rows</option></select>
                        </div>
                        <div class="full-width">
                          <label>Max Columns <span style="color:red">*</span></label>
                          <select class="form-control"><option>Select number of Columns</option></select>
                        </div>
                      </div>
                    } @else if (selectedParam()!.type === 'File') {
                      <div class="param-form-grid">
                        <div class="full-width">
                          <label>Name <span style="color:red">*</span></label>
                          <input type="text" [(ngModel)]="selectedParam()!.name" class="form-control" placeholder="File">
                        </div>
                        <div class="full-width">
                          <label>Integration Code</label>
                          <input type="text" [(ngModel)]="selectedParam()!.integrationCode" class="form-control" placeholder="Enter the Integration Code">
                        </div>
                        <div class="full-width">
                          <label>LOINC Code</label>
                          <input type="text" [(ngModel)]="selectedParam()!.loincCode" class="form-control" placeholder="Enter LOINC Code">
                        </div>
                        <div class="full-width">
                          <label>Height of image on pdf <span style="color:red">*</span></label>
                          <input type="text" class="form-control" placeholder="Enter the height of image on pdf">
                        </div>
                        <div class="full-width">
                          <label>Default image on pdf</label>
                          <div style="color: var(--clr-primary-600); cursor: pointer; font-size: 13px; margin: 4px 0;">Upload File ⬆️</div>
                          <div style="font-size: 11px; color: #888;">Info: You will be asked to upload the file for this test at the time of Report Entry</div>
                        </div>
                        <div class="full-width">
                          <label>Dictionary</label>
                          <select class="form-control" [(ngModel)]="selectedParam()!.dictionary">
                            <option value="">Select Dictionary</option>
                          </select>
                        </div>
                        <div class="full-width">
                          <label>Linked Parameters <span style="color:#2563eb;font-weight:bold;">ℹ️</span></label>
                          <select class="form-control" [(ngModel)]="selectedParam()!.linkedParameter">
                            <option value="">Select Parameter to link</option>
                          </select>
                          <div style="font-size:11px;color:#888;margin-top:4px;">Any update to this parameter will update the linked parameter as well (Remove existing linking to link another parameter)</div>
                        </div>
                      </div>
                    } @else {
                      <div class="param-form-grid">
                        <div>
                          <label>Name <span style="color:red">*</span></label>
                          <input type="text" [(ngModel)]="selectedParam()!.name" class="form-control" placeholder="Enter Name">
                        </div>
                        @if (selectedParam()!.type !== 'Descriptive (No Ranges)') {
                          <div>
                            <label>Unit</label>
                            <input type="text" [(ngModel)]="selectedParam()!.unit" class="form-control" placeholder="Enter The Value Unit">
                          </div>
                        }
                        <div class="full-width">
                          <label>Method</label>
                          <input type="text" [(ngModel)]="selectedParam()!.method" class="form-control" placeholder="Enter the Method Name">
                        </div>
                        <div class="full-width">
                          <label>Integration Code</label>
                          <input type="text" [(ngModel)]="selectedParam()!.integrationCode" class="form-control" placeholder="Enter the Integration Code">
                        </div>
                        <div class="full-width">
                          <label>LOINC Code</label>
                          <input type="text" [(ngModel)]="selectedParam()!.loincCode" class="form-control" placeholder="Enter LOINC Code">
                        </div>
                        <div class="full-width">
                          <label>Dictionary</label>
                          <select class="form-control" [(ngModel)]="selectedParam()!.dictionary">
                            <option value="">Select Dictionary</option>
                          </select>
                        </div>
                        <div class="full-width">
                          <label>Linked Parameters <span style="color:#2563eb;font-weight:bold;">ℹ️</span></label>
                          <select class="form-control" [(ngModel)]="selectedParam()!.linkedParameter">
                            <option value="">Select Parameter to link</option>
                          </select>
                          <div style="font-size:11px;color:#888;margin-top:4px;">Any update to this parameter will update the linked parameter as well (Remove existing linking to link another parameter)</div>
                        </div>
                        @if (selectedParam()!.type === 'Test With Normal Range' || selectedParam()!.type === 'Test With Age Specific Range') {
                          <div>
                            <label>Delta Check Threshold (In %)</label>
                            <input type="text" [(ngModel)]="selectedParam()!.deltaCheck" class="form-control" placeholder="10">
                          </div>
                        }
                      </div>

                      @if (selectedParam()!.type === 'List Field') {
                        <div class="param-tabs">
                          <div class="param-tab" [class.active]="paramTab() === 'Normal'" (click)="paramTab.set('Normal')">Normal Ranges</div>
                        </div>
                        
                        <div class="param-form-grid" style="align-items: center;">
                          <div style="font-size: 13px; color: #555;">Male Range</div>
                          <div style="display:flex; gap:12px; align-items:center; grid-column: 2;">
                            <input type="text" class="form-control" placeholder="Lower Range"> - 
                            <input type="text" class="form-control" placeholder="Upper Range">
                          </div>
                          
                          <div style="font-size: 13px; color: #555; align-self: start;">Descriptive</div>
                          <div style="grid-column: 2;">
                            <textarea class="form-control" rows="2" placeholder="Enter Description"></textarea>
                            <div style="text-align: right; font-size: 12px; color: #555; margin-top: 4px;">
                              <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer;"><input type="checkbox"> Advance Editor</label>
                            </div>
                          </div>
                          
                          <div style="font-size: 13px; color: #555; margin-top: 16px;">Female Range</div>
                          <div style="display:flex; gap:12px; align-items:center; grid-column: 2; margin-top: 16px;">
                            <input type="text" class="form-control" placeholder="Lower Range"> - 
                            <input type="text" class="form-control" placeholder="Upper Range">
                          </div>
                          
                          <div style="font-size: 13px; color: #555; align-self: start;">Descriptive</div>
                          <div style="grid-column: 2;">
                            <textarea class="form-control" rows="2" placeholder="Enter Description"></textarea>
                            <div style="text-align: right; font-size: 12px; color: #555; margin-top: 4px;">
                              <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer;"><input type="checkbox"> Advance Editor</label>
                            </div>
                          </div>
                          
                          <div style="font-size: 13px; color: #555; margin-top: 16px; align-self: start;">Enter values</div>
                          <div style="grid-column: 2; margin-top: 16px;">
                            <textarea class="form-control" rows="2" placeholder="Enter value and click add value till all values are entered (Entering # not allowed)"></textarea>
                            <div style="text-align: right; font-size: 12px; color: #555; margin-top: 8px; display: flex; gap: 12px; justify-content: flex-end;">
                              <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer;"><input type="checkbox"> Mark As Critical</label>
                              <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer;"><input type="checkbox"> Highlight</label>
                            </div>
                            
                            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px;">
                              <button type="button" style="padding: 6px 16px; background: white; border: 1px solid var(--clr-primary-600); color: var(--clr-primary-600); border-radius: 4px; font-size: 13px; cursor: pointer;">Add value</button>
                              <button type="button" style="padding: 6px 16px; background: white; border: 1px solid var(--clr-danger-600); color: var(--clr-danger-600); border-radius: 4px; font-size: 13px; cursor: pointer;">Delete value</button>
                            </div>
                          </div>
                        </div>
                      } @else if (selectedParam()!.type === 'Test With Normal Range' || selectedParam()!.type === 'Descriptive (No Ranges)') {
                        <div class="param-tabs">
                          <div class="param-tab" [class.active]="paramTab() === 'Normal'" (click)="paramTab.set('Normal')">Normal Ranges</div>
                          <div class="param-tab" [class.active]="paramTab() === 'Critical'" (click)="paramTab.set('Critical')">Critical Ranges</div>
                          <div class="param-tab" [class.active]="paramTab() === 'Calculation'" (click)="paramTab.set('Calculation')">Calculation</div>
                          <div class="param-tab" [class.active]="paramTab() === 'Rerun'" (click)="paramTab.set('Rerun')">Rerun</div>
                        </div>

                        @if (paramTab() === 'Normal' || paramTab() === 'Critical') {
                          @if (paramTab() === 'Critical') {
                            <div style="display:flex; justify-content:flex-end; margin-bottom: 8px;">
                              <label style="font-size: 13px; color: #555;"><input type="checkbox" style="margin-right: 4px;"> Same as Normal Ranges</label>
                            </div>
                          }
                          <div class="param-form-grid" style="align-items: center;">
                            <div style="font-size: 13px; color: #555;">Male Range</div>
                            <div style="display:flex; gap:12px; align-items:center; grid-column: 2;">
                              <input type="text" class="form-control" placeholder="Lower Range"> - 
                              <input type="text" class="form-control" placeholder="Upper Range">
                            </div>
                            <div style="font-size: 13px; color: #555; margin-top: 16px;">Female Range</div>
                            <div style="display:flex; gap:12px; align-items:center; grid-column: 2; margin-top: 16px;">
                              <input type="text" class="form-control" placeholder="Lower Range"> - 
                              <input type="text" class="form-control" placeholder="Upper Range">
                            </div>
                          </div>
                        } @else if (paramTab() === 'Calculation') {
                          <div class="param-form-grid" style="align-items:center;">
                            <div style="font-size: 13px; color: #555;">Select Formula from Presets</div>
                            <div style="grid-column:2">
                              <select class="form-control"><option>Select Preset</option></select>
                              <div style="text-align:right; font-size:12px; color:var(--clr-primary-600); cursor:pointer; margin-top:4px;">Custom Calculation</div>
                            </div>
                            <div style="font-size: 13px; color: #555; margin-top: 24px;">Formula Preview</div>
                            <div style="grid-column:2; margin-top: 24px;">
                              <textarea class="form-control" rows="3" disabled style="background: #f1f5f9;"></textarea>
                            </div>
                          </div>
                        }
                      }
                    }

                    @if (selectedParam()!.type !== 'Image') {
                      <div style="font-size: 13px; color: #555; margin-top: 24px; margin-bottom: 8px;">Other Info</div>
                      <div class="checkbox-grid">
                        <label><input type="checkbox"> Hide Parameter</label>
                        <label><input type="checkbox"> Customized Parameter</label>
                        <label><input type="checkbox"> Highlight this value</label>
                        <label><input type="checkbox"> Underline this value</label>
                        <label><input type="checkbox"> Non-editable field</label>
                        <label><input type="checkbox"> Optional field</label>
                        <label><input type="checkbox"> Has Impressions</label>
                        <label><input type="checkbox"> Hide Parameter Trends</label>
                        <label><input type="checkbox"> Report only when Positive</label>
                        <label><input type="checkbox"> Block Saving Report</label>
                      </div>
                    }

                  } @else {
                    <div style="color:#888; text-align:center; margin-top: 80px;">Select a parameter from the left or add a new one from the dropdown above.</div>
                  }
                </div>
              </div>
            } @else if (activeModalTab() === 'ReportSettings') {
              <div class="report-settings-tab" style="padding: 16px 24px; max-height: 70vh; overflow-y: auto;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="background: #475569; color: white; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 500;">Default Setting</span>
                </div>
                
                <div class="param-form-grid" style="grid-template-columns: repeat(3, 1fr);">
                  <div class="full-width" style="grid-column: span 3;">
                    <label>Setting Name <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().settingName" disabled style="background: #e2e8f0; color: #334155; font-weight: 500;">
                  </div>
                  
                  <div>
                    <label>Paper Size</label>
                    <select class="form-control" [(ngModel)]="reportSettings().paperSize"><option value="A4">A4</option><option value="Letter">Letter</option></select>
                  </div>
                  <div>
                    <label>Patient Info <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().patientInfo">
                  </div>
                  <div>
                    <label>Font Type <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().fontType"><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option></select>
                  </div>
                  
                  <div>
                    <label>Font Size <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().fontSize"><option value="8">8</option><option value="9">9</option><option value="10">10</option></select>
                  </div>
                  <div>
                    <label>Primary Sign Position <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().primarySignPosition"><option value="Left">Left</option><option value="Center">Center</option><option value="Right">Right</option></select>
                  </div>
                  <div>
                    <label>Max Approval <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().maxApproval"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>
                  </div>

                  <div>
                    <label>Header Size <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().headerSize">
                  </div>
                  <div>
                    <label>Vertical Spacing <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().verticalSpacing"><option value="None">None</option><option value="Small">Small</option></select>
                  </div>
                  <div>
                    <label>Min Approval <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().minApproval"><option value="1">1</option><option value="2">2</option></select>
                  </div>

                  <div>
                    <label>Sign Size <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().signSize">
                  </div>
                  <div>
                    <label>Page No X <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().pageNoX">
                  </div>
                  <div>
                    <label>Date Format <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().dateFormat"><option value="01/12/2015, 12:00 AM">01/12/2015, 12:00 AM</option></select>
                  </div>

                  <div>
                    <label>Footer Size <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().footerSize">
                  </div>
                  <div>
                    <label>Page No Y <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().pageNoY">
                  </div>
                  <div>
                    <label>Paper Margin <span style="color:red">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().paperMargin">
                  </div>

                  <div style="grid-column: span 2;">
                    <label>Template Name <span style="color:red">*</span></label>
                    <select class="form-control" [(ngModel)]="reportSettings().templateName"><option value="PDF with 4 columns (Mobile Number)">PDF with 4 columns (Mobile Number)</option></select>
                  </div>
                  <div>
                    <label>End of Report Text</label>
                    <input type="text" class="form-control" [(ngModel)]="reportSettings().endOfReportText">
                  </div>
                </div>

                <div style="display: flex; gap: 24px; margin-top: 16px; margin-bottom: 24px;">
                  <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#555; cursor: pointer;">
                    <input type="checkbox" [(ngModel)]="reportSettings().showPdfHeader"> Show PDF Header
                  </label>
                  <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#555; cursor: pointer;">
                    <input type="checkbox" [(ngModel)]="reportSettings().showPdfFooter"> Show PDF Footer
                  </label>
                </div>

                <div style="background: #e2e8f0; padding: 12px 16px; border-radius: 4px; margin-bottom: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #475569;">Upload Watermark</span>
                  <span style="color: #475569;">▾</span>
                </div>
                <div style="background: #e2e8f0; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #475569;">Upload Accreditation Image</span>
                  <span style="color: #475569;">▾</span>
                </div>

                <div style="font-size: 13px; color: #555; margin-bottom: 16px;">Other Info</div>
                <div style="text-align: center; font-size: 13px; color: #64748b; margin-bottom: 16px;">
                  All the below checked fields will be shown on the PDF w.r.t. the report
                </div>

                <div class="checkbox-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px 24px; margin-bottom: 32px;">
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showPatientName"> Patient Name</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showPatientAge"> Patient Age</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showRegistrationNo"> Registration No</label>
                  
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showReferringDoctor"> Referring Doctor</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showReportId"> Report ID</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showReportDate"> Report Date</label>
                  
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showSampleDate"> Sample Date</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showSampleId"> Sample ID</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showFloatingSignature"> Floating Signature</label>

                  <label><input type="checkbox" [(ngModel)]="reportSettings().showRegisteredBy"> Registered By</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showReportedBy"> Reported by</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showEndOfReport"> End of Report</label>

                  <label><input type="checkbox" [(ngModel)]="reportSettings().hideReportName"> Hide report name</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showHorizontalLine"> Show horizontal line</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showOrganization"> Show Organization</label>

                  <label><input type="checkbox" [(ngModel)]="reportSettings().showPrintDate"> Print Date</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showLabCode"> Lab Code</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showHpeNo"> HPE No.</label>

                  <label><input type="checkbox" [(ngModel)]="reportSettings().showCalculatedAge"> Calculated Age</label>
                  <label><input type="checkbox" [(ngModel)]="reportSettings().showPageNumber"> Page Number</label>
                  <div style="display:none;"></div>
                  
                  <label><input type="checkbox" [(ngModel)]="reportSettings().enableQr"> Enable QR</label>
                </div>

                <div style="margin-bottom: 16px;">
                  <label style="font-size: 13px; color: #555; display: block; margin-bottom: 8px;">Helper Comment :</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="reportSettings().helperComment" placeholder="Describe why this change is needed" style="background: #e2e8f0; resize: vertical; border: none; border-radius: 4px;"></textarea>
                  <div style="text-align: left; font-size: 11px; color: #64748b; margin-top: 4px;">{{ reportSettings().helperComment?.length || 0 }}/250</div>
                </div>
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="saveTest()" [disabled]="saving()">Save</button>
          </div>
        </div>
      </div>
    }
  `
})
export class TestListPage implements OnInit {
  private labApi = inject(LabApiService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  tests = signal<any[]>([]);

  activeMainTab = signal<'TEST' | 'PROFILE' | 'BILL_ONLY'>('TEST');

  // Modal State
  showModal = signal(false);
  saving = signal(false);
  addingType = signal<'TEST' | 'PROFILE'>('TEST');
  showExportMenu = signal(false);
  
  // Parameters Builder State
  activeModalTab = signal<'Info' | 'Params' | 'ReportSettings'>('Info');
  showParamMenu = signal(false);
  testParameters = signal<any[]>([]);
  selectedParam = signal<any | null>(null);
  paramTab = signal<'Normal'|'Critical'|'Calculation'|'Rerun'>('Normal');

  reportSettings = signal<any>({
    settingName: 'Default Report Setting',
    paperSize: 'A4',
    patientInfo: '140',
    fontType: 'Arial',
    fontSize: '9',
    primarySignPosition: 'Right',
    maxApproval: '2',
    headerSize: '120',
    verticalSpacing: 'None',
    minApproval: '1',
    signSize: '90',
    pageNoX: '519',
    dateFormat: '01/12/2015, 12:00 AM',
    footerSize: '90',
    pageNoY: '13',
    paperMargin: '40',
    templateName: 'PDF with 4 columns (Mobile Number)',
    endOfReportText: '**END OF REPORT**',
    showPdfHeader: false,
    showPdfFooter: false,
    helperComment: '',
    showPatientName: true,
    showPatientAge: true,
    showRegistrationNo: true,
    showReferringDoctor: true,
    showReportId: true,
    showReportDate: true,
    showSampleDate: true,
    showSampleId: true,
    showFloatingSignature: false,
    showRegisteredBy: false,
    showReportedBy: false,
    showEndOfReport: true,
    hideReportName: false,
    showHorizontalLine: false,
    showOrganization: true,
    showPrintDate: false,
    showLabCode: false,
    showHpeNo: true,
    showCalculatedAge: true,
    showPageNumber: true,
    enableQr: true
  });

  testForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: [''],
    sampleType: [''],
    integrationCode: [''],
    procedureCode: [''],
    loincCode: [''],
    shortText: [''],
    testAlias: [''],
    category: ['Pathology', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    icdToPin: ['']
  });

  searchQuery = signal('');

  filteredTests = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.tests().filter(t => {
      const matchType = (t.testType || 'TEST') === this.activeMainTab();
      if (!matchType) return false;
      if (!q) return true;
      const name = (t.name || '').toLowerCase();
      const code = (t.code || t.testCode || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const sample = (t.sampleType || '').toLowerCase();
      const alias = (t.testAlias || '').toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        cat.includes(q) ||
        sample.includes(q) ||
        alias.includes(q)
      );
    });
  });

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  groupedFiltered = computed(() => {
    const list = this.filteredTests();
    if (this.activeMainTab() !== 'TEST') {
      // Don't group by category for profiles and bill only, just return a single un-headed group
      return [{ category: '', items: list, expanded: true }];
    }

    const groupsMap = new Map<string, any[]>();
    for (const t of list) {
      const cat = t.category || 'Unassigned';
      if (!groupsMap.has(cat)) groupsMap.set(cat, []);
      groupsMap.get(cat)!.push(t);
    }
    const grouped = Array.from(groupsMap.entries()).map(([category, items]) => ({
      category,
      items,
      expanded: true
    }));
    grouped.sort((a, b) => a.category.localeCompare(b.category));
    return grouped;
  });

  ngOnInit() {
    this.loadTests();
  }

  loadTests() {
    this.loading.set(true);
    this.labApi.listTests({ limit: 1500 }).subscribe({
      next: (res) => {
        this.tests.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleGroup(group: any) {
    if (this.activeMainTab() === 'TEST') {
      group.expanded = !group.expanded;
    }
  }

  openAddModal(type: 'TEST' | 'PROFILE') {
    this.addingType.set(type);
    this.testForm.reset({ category: 'Pathology', price: 0 });
    this.activeModalTab.set('Info');
    this.testParameters.set([]);
    this.selectedParam.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }
  
  addParameter(type: string) {
    const newParam = {
      id: Date.now(),
      type,
      name: type,
      unit: '',
      method: '',
      integrationCode: '',
      loincCode: '',
      dictionary: '',
      linkedParameter: '',
      deltaCheck: '10'
    };
    this.testParameters.update(p => [...p, newParam]);
    this.selectedParam.set(newParam);
    this.showParamMenu.set(false);
  }

  removeParam(id: number) {
    this.testParameters.update(p => p.filter(x => x.id !== id));
    if (this.selectedParam()?.id === id) {
      this.selectedParam.set(null);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.testForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  toggleExportMenu() {
    this.showExportMenu.update(v => !v);
  }

  exportExcel() {
    this.showExportMenu.set(false);
    const tests = this.filteredTests();
    if (!tests || tests.length === 0) {
      alert('No data to export');
      return;
    }
    
    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const text = String(str);
      return `"${text.replace(/"/g, '""')}"`;
    };

    let headers = [];
    let rows = [];

    if (this.activeMainTab() === 'PROFILE') {
      headers = ['Profile Name', 'Profile Code', 'Price', 'Outsourced', 'Auto Approval'];
      rows = tests.map(t => [
        escapeCsv(t.name),
        escapeCsv(t.testCode),
        t.price || 0,
        t.outsourced ? 'Yes' : 'No',
        t.autoApproval ? 'Yes' : 'No'
      ]);
    } else {
      headers = ['Test Name', 'Test Code', 'Price', 'Sample Type', 'Department', 'Outsourced', 'Auto Approval'];
      rows = tests.map(t => [
        escapeCsv(t.name),
        escapeCsv(t.testCode),
        t.price || 0,
        escapeCsv(t.sampleType),
        escapeCsv(t.category),
        t.outsourced ? 'Yes' : 'No',
        t.autoApproval ? 'Yes' : 'No'
      ]);
    }
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'test_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportPdf() {
    this.showExportMenu.set(false);
    window.print();
  }

  saveTest() {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      alert('Please fill all required fields in Test Information tab (Test Name, Category, Price)');
      this.activeModalTab.set('Info');
      return;
    }
    
    this.saving.set(true);
    const formVal = this.testForm.value;

    const priceNum = formVal.price !== null && formVal.price !== '' && !isNaN(Number(formVal.price))
      ? Number(formVal.price)
      : 0;

    const fullPayload: Record<string, any> = {
      name: (formVal.name || '').trim(),
      code: (formVal.code || '').trim() || undefined,
      category: formVal.category || 'Pathology',
      price: priceNum,
      testType: this.addingType() || 'TEST',
      sampleType: formVal.sampleType || undefined,
      integrationCode: formVal.integrationCode || undefined,
      procedureCode: formVal.procedureCode || undefined,
      loincCode: formVal.loincCode || undefined,
      shortText: formVal.shortText || undefined,
      testAlias: formVal.testAlias || undefined,
      icdToPin: formVal.icdToPin || undefined,
      parameters: this.testParameters(),
      reportSettings: this.reportSettings()
    };
    Object.keys(fullPayload).forEach((k) => fullPayload[k] === undefined && delete fullPayload[k]);

    // Fallback payload with base fields in case backend has older DTO
    const basePayload: Record<string, any> = {
      name: fullPayload['name'],
      code: fullPayload['code'],
      category: fullPayload['category'],
      price: fullPayload['price'],
    };
    Object.keys(basePayload).forEach((k) => basePayload[k] === undefined && delete basePayload[k]);

    this.labApi.createTest(fullPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadTests(); // Refresh the list
      },
      error: (err) => {
        const errorMsg = JSON.stringify(err?.error?.message || err?.message || '');
        // If the server rejected because optional fields do not exist on older VPS DTO, retry with base payload
        if (err?.status === 400 && errorMsg.includes('should not exist')) {
          console.warn('Backend rejected newer DTO fields, retrying with core fields fallback...', basePayload);
          this.labApi.createTest(basePayload).subscribe({
            next: () => {
              this.saving.set(false);
              this.closeModal();
              this.loadTests();
            },
            error: (fallbackErr) => {
              this.handleSaveError(fallbackErr);
            }
          });
          return;
        }

        this.handleSaveError(err);
      }
    });
  }

  private handleSaveError(err: any) {
    console.error('Failed to save lab test:', err);
    this.saving.set(false);
    const rawMsg = err?.error?.message || err?.message;
    const msg = Array.isArray(rawMsg) ? rawMsg.join('\n') : (rawMsg || 'Failed to save. Please verify the form and try again.');
    alert(`Failed to save: ${msg}`);
  }
}
