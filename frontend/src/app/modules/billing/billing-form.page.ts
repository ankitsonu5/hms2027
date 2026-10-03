import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { BillingApiService } from '../../core/services/billing-api.service';
import { LabApiService } from '../../core/services/lab-api.service';
import { OrganizationApiService } from '../../core/services/organization-api.service';
import { PatientPickerComponent } from '../../shared/components/patient-picker.component';

type ItemCategory = 'CONSULTATION' | 'LAB' | 'PHARMACY' | 'PROCEDURE' | 'BED' | 'OTHER';

@Component({
  selector: 'hms-billing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, PatientPickerComponent],
  styles: [
    `
      @media screen {
        .print-wrapper { display: none; }
      }
      @media print {
        @page { margin: 0; }
        body { padding: 20px !important; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { display: none !important; }
        .print-wrapper { display: block !important; width: 100%; }

        .print-bill { font-family: Arial, sans-serif; color: #000; width: 100%; }
        .bill-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
        .bill-logo h2 { margin: 0; color: #4b2354; font-size: 28px; font-weight: bold; }
        .bill-logo .sub { color: #000; font-size: 16px; font-weight: normal; margin-top: -4px; }
        .bill-right-logo { text-align: right; }
        .bill-right-logo h3 { margin: 0; color: #4b2354; font-size: 24px; }
        .bill-title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; }
        .bill-title { font-size: 14px; font-weight: bold; text-decoration: underline; }
        .box { border: 2px solid #000; padding: 10px 15px; margin-bottom: 20px; }
        .box-title { font-weight: bold; text-decoration: underline; margin-bottom: 10px; font-size: 14px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .field { display: flex; font-size: 12px; margin-bottom: 4px; }
        .field .label { width: 100px; }
        .field .sep { margin-right: 8px; }
        .field .value { font-weight: bold; }
        .investigation-title { font-weight: bold; text-decoration: underline; font-size: 14px; margin-bottom: 10px; padding: 0 15px; }
        .investigation-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; padding: 0 15px; }
        .investigation-table th { text-align: left; text-decoration: underline; font-size: 12px; padding: 5px 15px; font-weight: bold; }
        .investigation-table th:last-child { text-align: right; }
        .investigation-table td { padding: 5px 15px; font-size: 12px; }
        .investigation-table td:last-child { text-align: right; }
        .footer-notes { font-size: 10px; line-height: 1.6; margin-top: 10px; }
      }

      .page {
        padding: var(--sp-6);
        padding: var(--sp-6);
        background: transparent;
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-bottom: var(--sp-6);
      }
      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1);
        padding: var(--sp-1) var(--sp-2);
        background: transparent;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        color: var(--clr-neutral-600);
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .back-btn:hover {
        background: var(--bg-muted);
      }
      .page-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-900);
        margin: 0;
      }

      .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: var(--sp-5);
        align-items: start;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        box-shadow: var(--shadow-sm);
      }
      .section-title {
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--sp-4);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-4);
        margin-bottom: var(--sp-5);
      }
      .form-grid .full {
        grid-column: 1 / -1;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }
      .form-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-600);
      }
      .required-star {
        color: var(--clr-danger-500);
        margin-left: 2px;
      }
      .form-control {
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        background: var(--bg-surface);
        color: var(--clr-neutral-900);
        transition: var(--transition-fast);
      }
      .form-control:focus {
        outline: none;
        border-color: var(--clr-primary-500);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      .form-control.invalid {
        border-color: var(--clr-danger-500);
      }
      .field-error {
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
      }
      textarea.form-control {
        resize: vertical;
        min-height: 72px;
      }

      /* Items table */
      .items-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-3);
      }
      .table-wrap {
        margin-bottom: var(--sp-3);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }
      th {
        padding: var(--sp-2) var(--sp-3);
        text-align: left;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: var(--bg-muted);
        white-space: nowrap;
      }
      td {
        padding: var(--sp-2) var(--sp-2);
        border-top: 1px solid var(--border-default);
        vertical-align: top;
      }
      td .form-control {
        width: 100%;
        box-sizing: border-box;
      }
      .col-desc {
        min-width: 180px;
      }
      .col-cat {
        min-width: 140px;
      }
      .col-num {
        width: 80px;
      }
      .col-amount {
        width: 100px;
        white-space: nowrap;
        text-align: right;
        font-variant-numeric: tabular-nums;
        font-size: var(--text-sm);
        padding-top: calc(var(--sp-2) + 6px);
        color: var(--clr-neutral-800);
        font-weight: var(--fw-medium);
      }
      .col-remove {
        width: 40px;
        text-align: center;
      }
      .remove-btn {
        background: transparent;
        border: none;
        color: var(--clr-danger-500);
        font-size: 1.1rem;
        cursor: pointer;
        padding: var(--sp-1);
        border-radius: var(--radius-sm);
        line-height: 1;
        margin-top: 4px;
      }
      .remove-btn:hover {
        background: var(--clr-danger-50);
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--radius-md);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
      }
      .btn-primary {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--clr-primary-700);
      }
      .btn-outline {
        background: transparent;
        color: var(--clr-primary-600);
        border: 1px solid var(--clr-primary-300);
      }
      .btn-outline:hover {
        background: var(--clr-primary-50);
      }
      .btn-sm {
        padding: var(--sp-1) var(--sp-3);
        font-size: var(--text-xs);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Summary card */
      .summary-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--sp-5);
        box-shadow: var(--shadow-sm);
        position: sticky;
        top: var(--sp-4);
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--sp-2) 0;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-700);
        border-bottom: 1px solid var(--border-default);
      }
      .summary-row:last-of-type {
        border-bottom: none;
      }
      .summary-row.total {
        padding-top: var(--sp-3);
        font-family: var(--font-label);
        font-size: var(--text-base);
        font-weight: var(--fw-bold);
        color: var(--clr-neutral-900);
      }
      .summary-row.discount {
        color: var(--clr-success-700);
      }
      .summary-amount {
        font-variant-numeric: tabular-nums;
        font-weight: var(--fw-medium);
      }

      .form-footer {
        display: flex;
        gap: var(--sp-3);
        align-items: center;
        margin-top: var(--sp-5);
        flex-wrap: wrap;
      }
      .status-field {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        margin-left: auto;
      }

      .error-msg {
        padding: var(--sp-3) var(--sp-4);
        background: var(--clr-danger-50);
        border: 1px solid var(--clr-danger-200);
        border-radius: var(--radius-md);
        color: var(--clr-danger-700);
        font-size: var(--text-sm);
        margin-bottom: var(--sp-4);
      }
      .loading {
        text-align: center;
        padding: var(--sp-10);
        color: var(--clr-neutral-400);
        font-size: var(--text-sm);
      }

      /* Search Dropdown */
      .search-container {
        position: relative;
        margin-bottom: var(--sp-4);
      }
      .search-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 100;
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        max-height: 250px;
        overflow-y: auto;
      }
      .dropdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: var(--sp-3);
        border: none;
        background: none;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        cursor: pointer;
        border-bottom: 1px solid var(--border-default);
      }
      .dropdown-item:hover {
        background: var(--clr-primary-50);
      }
      .dropdown-item:last-child {
        border-bottom: none;
      }
    `,
  ],
  template: `
    <!-- Print Layout (Matched to bill.docx) -->
    <div class="print-wrapper">
      <div class="print-bill">
        <div class="bill-header-row">
          <div class="bill-logo">
            <h2>HMS</h2>
            <div class="sub">HOSPITAL MANAGEMENT SYSTEM</div>
          </div>
          <div class="bill-right-logo">
            <img [src]="'https://bwipjs-api.metafloor.com/?bcid=code128&text=' + (billId || 'NEW') + '&scale=3&includetext=true'" alt="Barcode" style="height: 40px;" />
          </div>
        </div>
        
        <div class="bill-title-row">
          <div class="bill-title">Investigation Cash Receipt</div>
        </div>

        <div class="box">
          <div class="box-title">Patient Details</div>
          <div class="grid-2">
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PATIENT NAME</div><div class="sep">:</div><div class="value">{{ form.get('patientName')?.value }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">AGE / GENDER</div><div class="sep">:</div><div class="value">N/A</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PHONE</div><div class="sep">:</div><div class="value">—</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">REF. DR</div><div class="sep">:</div><div class="value">Self</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">ADDRESS</div><div class="sep">:</div><div class="value">—</div></div>
            </div>
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">REQ. ID</div><div class="sep">:</div><div class="value">—</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">BILL ID</div><div class="sep">:</div><div class="value">{{ billId || 'NEW' }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">UID</div><div class="sep">:</div><div class="value">{{ form.get('patientId')?.value }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">BILL DATE</div><div class="sep">:</div><div class="value">{{ form.get('billDate')?.value | date:'dd/MM/yy' }}</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">ORGANISATION</div><div class="sep">:</div><div class="value">HMS Hospital</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PAY TYPE</div><div class="sep">:</div><div class="value">CASH</div></div>
            </div>
          </div>
        </div>

        <div class="investigation-title">Investigation Details</div>
        <table class="investigation-table">
          <thead>
            <tr>
              <th style="text-transform: uppercase;">SNO.</th>
              <th style="text-transform: uppercase;">Test Name</th>
              <th style="text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items.controls; track $index; let idx = $index) {
              <tr>
                <td>{{ idx + 1 }}</td>
                <td>{{ item.get('description')?.value }}</td>
                <td>{{ rowAmount(idx) | number:'1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="box">
          <div class="box-title">Payment Details</div>
          <div class="grid-3">
            <div class="field"><div class="label" style="width: auto; margin-right: 10px; text-transform: uppercase;">TOTAL AMOUNT</div><div class="sep">:</div><div class="value">{{ totals().subtotal + totals().gst | number:'1.2-2' }}</div></div>
            <div class="field"><div class="label" style="width: auto; margin-right: 10px; text-transform: uppercase;">NET AMOUNT</div><div class="sep">:</div><div class="value">{{ totals().grandTotal | number:'1.2-2' }}</div></div>
            <div class="field"><div class="label" style="width: auto; margin-right: 10px; text-transform: uppercase;">CONCESSION AMOUNT</div><div class="sep">:</div><div class="value">{{ totals().discount | number:'1.2-2' }}</div></div>
          </div>
          <div style="margin-top: 10px;" class="grid-2">
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">IN WORDS</div><div class="sep">:</div><div class="value">Amount in Words Here.</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PRINT DATE</div><div class="sep">:</div><div class="value">{{ now | date:'dd/MM/yy, hh:mm a' }}</div></div>
            </div>
            <div>
              <div class="field"><div class="label" style="text-transform: uppercase;">BILLED USER</div><div class="sep">:</div><div class="value">Admin</div></div>
              <div class="field"><div class="label" style="text-transform: uppercase;">PRINT USER</div><div class="sep">:</div><div class="value">Admin</div></div>
            </div>
          </div>
        </div>

        <div class="footer-notes">
          <div>Note : Cancellations and Refunds will be through Cheque only within 7 working days. For reports Please call between 9AM to 8PM on Monday to Saturday</div>
          <div>Powered by HMS</div>
        </div>
      </div>
    </div>
    
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">&#8592; Back</button>
        <h1 class="page-title">{{ isEdit ? 'Edit Bill' : 'Add Test to Bill' }}</h1>
      </div>

      @if (loadingBill()) {
        <div class="loading">Loading bill…</div>
      } @else {
        @if (errorMsg()) {
          <div class="error-msg">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="layout">
            <!-- Left column -->
            <div>
              <!-- Header fields -->
              <div class="card" style="margin-bottom:var(--sp-4)">
                <div class="section-title">Bill Details</div>
                <div class="form-grid">
                  <div class="form-field full">
                    <label class="form-label" style="color:var(--clr-primary-600)">Bill ID (Search to modify existing bill)</label>
                    <div class="search-container">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Type Bill Number or Patient Name..."
                        [ngModel]="billSearchTerm()"
                        (ngModelChange)="onBillSearch($event)"
                        [ngModelOptions]="{ standalone: true }"
                        (focus)="onBillFocus()"
                        (blur)="hideBillDropdown()"
                      />
                      @if (showBillDropdown() && billSearchResults().length > 0) {
                        <div class="search-dropdown">
                          @for (b of billSearchResults(); track b.id) {
                            <button type="button" class="dropdown-item" (mousedown)="selectBill(b.id)">
                              <span>
                                <strong>{{ b.billNumber }}</strong>
                                <span style="color:var(--clr-neutral-500); margin-left:8px;">{{ b.patientName }}</span>
                              </span>
                              <span style="font-weight:var(--fw-semibold); color:var(--clr-primary-700)">₹{{ b.grandTotal }}</span>
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="form-label">Patient <span class="required-star">*</span></label>
                    <hms-patient-picker 
                      formControlName="patientId" 
                      [invalid]="isInvalid('patientId')" 
                      (patientSelected)="onPatientSelected($event)" 
                    />
                    @if (isInvalid('patientId')) {
                      <span class="field-error">Patient is required.</span>
                    }
                  </div>

                  <div class="form-field">
                    <label class="form-label">Patient Name <span class="required-star">*</span></label>
                    <input
                      class="form-control"
                      [class.invalid]="isInvalid('patientName')"
                      type="text"
                      formControlName="patientName"
                      placeholder="Full name"
                    />
                    @if (isInvalid('patientName')) {
                      <span class="field-error">Patient name is required.</span>
                    }
                  </div>

                  <div class="form-field">
                    <label class="form-label">Bill Date</label>
                    <input class="form-control" type="date" formControlName="billDate" />
                  </div>

                  <div class="form-field full">
                    <label class="form-label">Notes</label>
                    <textarea
                      class="form-control"
                      formControlName="notes"
                      placeholder="Optional notes…"
                    ></textarea>
                  </div>

                  <div class="form-field full">
                    <label class="form-label">Referral Partner / Organization</label>
                    <select class="form-control" formControlName="organizationId" (change)="onOrganizationChange()">
                      <option [value]="null">None (Retail Patient)</option>
                      @for (org of organizations(); track org.id) {
                        <option [value]="org.id">{{ org.name }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="card">
                <div class="items-header">
                  <div class="section-title" style="margin-bottom:0">Line Items</div>
                  <button type="button" class="btn btn-outline btn-sm" (click)="addRow()">
                    + Add Test
                  </button>
                </div>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th class="col-desc">Description</th>
                        <th class="col-cat">Category</th>
                        <th class="col-num">Qty</th>
                        <th class="col-num">Unit Price</th>
                        <th class="col-num">Disc %</th>
                        <th class="col-num">GST %</th>
                        <th class="col-amount">Amount</th>
                        <th class="col-remove"></th>
                      </tr>
                    </thead>
                    <tbody formArrayName="items">
                      @if (items.length === 0) {
                        <tr>
                          <td
                            colspan="8"
                            style="text-align:center;color:var(--clr-neutral-400);font-size:var(--text-sm);padding:var(--sp-5)"
                          >
                            No items yet. Click "+ Add Row" to begin.
                          </td>
                        </tr>
                      }
                      @for (row of items.controls; track $index; let rowIndex = $index) {
                        <tr [formGroupName]="rowIndex">
                          <td class="col-desc" style="position: relative;">
                            <input
                              class="form-control"
                              [class.invalid]="isItemInvalid(rowIndex, 'description')"
                              type="text"
                              formControlName="description"
                              placeholder="Description or test name..."
                              (input)="onRowTestSearch(rowIndex, $event)"
                              (focus)="activeRowIndex.set(rowIndex)"
                              (blur)="hideRowTestDropdown()"
                            />
                            @if (activeRowIndex() === rowIndex && rowTestSearchResults().length > 0) {
                              <div class="search-dropdown">
                                @for (t of rowTestSearchResults(); track t.id) {
                                  <button type="button" class="dropdown-item" (mousedown)="selectRowTest(rowIndex, t)">
                                    <span>
                                      <strong>{{ t.name }}</strong>
                                      <span style="color:var(--clr-neutral-500); margin-left:8px;">{{ t.code || t.numericId }}</span>
                                    </span>
                                    <span style="font-weight:var(--fw-semibold); color:var(--clr-primary-700)">₹{{ t.price }}</span>
                                  </button>
                                }
                              </div>
                            }
                          </td>
                          <td class="col-cat">
                            <select class="form-control" formControlName="category">
                              <option value="CONSULTATION">Consultation</option>
                              <option value="LAB">Lab</option>
                              <option value="PHARMACY">Pharmacy</option>
                              <option value="PROCEDURE">Procedure</option>
                              <option value="BED">Bed</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="1"
                              formControlName="quantity"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="0"
                              step="0.01"
                              formControlName="unitPrice"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="0"
                              max="100"
                              formControlName="discountPct"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-num">
                            <input
                              class="form-control"
                              type="number"
                              min="0"
                              max="100"
                              formControlName="gstPct"
                              (input)="recalc()"
                            />
                          </td>
                          <td class="col-amount">₹{{ rowAmount($index) | number: '1.2-2' }}</td>
                          <td class="col-remove">
                            <button
                              type="button"
                              class="remove-btn"
                              (click)="removeRow($index)"
                              title="Remove row"
                            >
                              &#215;
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="card" style="margin-top:var(--sp-4)">
                <div class="section-title">General Concession</div>
                <div class="form-grid">
                  <div class="form-field">
                    <label class="form-label">Concession Reason</label>
                    <select class="form-control" formControlName="concessionReason" (change)="applyConcession()">
                      <option value="">None</option>
                      <option value="Staff Family">Staff Family</option>
                      <option value="Senior Citizen">Senior Citizen</option>
                      <option value="Special Case">Special Case</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Discount %</label>
                    <input
                      class="form-control"
                      type="number"
                      min="0"
                      max="100"
                      formControlName="concessionPercentage"
                      placeholder="e.g. 10"
                      (input)="applyConcession()"
                    />
                  </div>
                </div>
              </div>

              <!-- Footer actions -->
              <div class="form-footer">
                <div class="form-field status-field">
                  <label class="form-label" style="margin-right:var(--sp-2)">Status</label>
                  <select class="form-control" formControlName="status" style="width:auto">
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <button type="button" class="btn btn-outline" (click)="goBack()">Cancel</button>
                @if (isEdit) {
                  <button type="button" class="btn btn-outline" (click)="printBill()">Print Bill</button>
                }
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="submitting() || form.invalid"
                >
                  {{ submitting() ? 'Saving…' : isEdit ? 'Update Bill' : 'Create Bill' }}
                </button>
              </div>
            </div>

            <!-- Right column: summary -->
            <div>
              <div class="summary-card">
                <div class="section-title">Summary</div>
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span class="summary-amount">₹{{ totals().subtotal | number: '1.2-2' }}</span>
                </div>
                <div class="summary-row discount">
                  <span>Total Discount</span>
                  <span class="summary-amount">− ₹{{ totals().discount | number: '1.2-2' }}</span>
                </div>
                <div class="summary-row">
                  <span>Total GST</span>
                  <span class="summary-amount">+ ₹{{ totals().gst | number: '1.2-2' }}</span>
                </div>
                <div class="summary-row total">
                  <span>Grand Total</span>
                  <span class="summary-amount">₹{{ totals().grandTotal | number: '1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class BillingFormPage implements OnInit {
  private api = inject(BillingApiService);
  private labApi = inject(LabApiService);
  private orgApi = inject(OrganizationApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isEdit = false;
  billId: string | number | null = null;
  loadingBill = signal(false);
  submitting = signal(false);
  errorMsg = signal('');
  now = new Date();

  organizations = signal<any[]>([]);
  organizationRates = signal<any[]>([]);

  billSearchTerm = signal('');
  billSearchResults = signal<any[]>([]);
  showBillDropdown = signal(false);

  activeRowIndex = signal<number | null>(null);
  rowTestSearchResults = signal<any[]>([]);

  totals = signal({ subtotal: 0, discount: 0, gst: 0, grandTotal: 0 });

  form: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    patientName: ['', Validators.required],
    billDate: [this._today()],
    notes: [''],
    status: ['DRAFT'],
    organizationId: [null],
    concessionReason: [''],
    concessionPercentage: [null],
    items: this.fb.array([]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.orgApi.list().subscribe({
      next: (res) => this.organizations.set(res || [])
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.billId = id;
      this.loadBill(id);
    } else {
      this.addRow();
    }
  }

  private loadBill(id: string) {
    this.loadingBill.set(true);
    this.api.getOne(id).subscribe({
      next: (bill: any) => {
        this.form.patchValue({
          patientId: bill.patientId,
          patientName: bill.patientName,
          billDate: bill.billDate?.slice(0, 10) ?? this._today(),
          notes: bill.notes ?? '',
          status: bill.status ?? 'DRAFT',
          organizationId: bill.organizationId ?? null,
          concessionReason: bill.concessionReason ?? '',
          concessionPercentage: bill.concessionPercentage ?? null,
        });
        if (bill.organizationId) {
          this.orgApi.getRates(bill.organizationId).subscribe(rates => {
            this.organizationRates.set(rates || []);
          });
        }
        this.items.clear();
        const rows: any[] = bill.items ?? [];
        rows.forEach((item) => {
          this.items.push(this._makeRow(item));
        });
        if (this.items.length === 0) this.addRow();
        this.recalc();
        this.loadingBill.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Failed to load bill.');
        this.loadingBill.set(false);
      },
    });
  }

  onPatientSelected(patient: any) {
    if (patient) {
      this.form.patchValue({
        patientName: `${patient.firstName} ${patient.lastName}`,
      });
    } else {
      this.form.patchValue({ patientName: '' });
    }
  }

  onBillFocus() {
    this.showBillDropdown.set(true);
    if (!this.billSearchTerm().trim()) {
      // Load recent bills when clicking before typing anything
      this.api.list({ limit: 10 }).subscribe({
        next: (res: any) => {
          this.billSearchResults.set(res?.data ?? []);
        },
        error: () => this.billSearchResults.set([])
      });
    }
  }

  onBillSearch(term: string) {
    this.billSearchTerm.set(term);
    if (!term.trim()) {
      this.onBillFocus();
      return;
    }
    this.api.list({ search: term, limit: 10 }).subscribe({
      next: (res: any) => {
        this.billSearchResults.set(res?.data ?? []);
      },
      error: () => this.billSearchResults.set([])
    });
  }

  hideBillDropdown() {
    setTimeout(() => {
      this.showBillDropdown.set(false);
    }, 200);
  }

  onRowTestSearch(index: number, event: Event) {
    const term = (event.target as HTMLInputElement).value;
    if (!term.trim()) {
      this.rowTestSearchResults.set([]);
      return;
    }
    // Search tests
    this.labApi.listTests({ limit: 10 }).subscribe({
      next: (res) => {
        // Front-end filtering since listTests might not have a search query yet
        const t = term.toLowerCase();
        const tests = (res.data ?? []).filter((test: any) => 
          test.name.toLowerCase().includes(t) || 
          (test.code && test.code.toLowerCase().includes(t)) ||
          (test.numericId && String(test.numericId).includes(t))
        );
        this.rowTestSearchResults.set(tests);
      },
      error: () => this.rowTestSearchResults.set([])
    });
  }

  hideRowTestDropdown() {
    setTimeout(() => {
      this.activeRowIndex.set(null);
    }, 200);
  }

  selectRowTest(index: number, test: any) {
    const row = this.items.at(index);
    if (row) {
      let price = Number(test.price ?? 0);
      
      // Check if there is an organization rate for this test
      const orgRate = this.organizationRates().find(r => r.testId === test.id);
      if (orgRate) {
        price = Number(orgRate.customPrice);
      }

      // Apply active concession if any
      const concessionPct = Number(this.form.value.concessionPercentage) || 0;

      row.patchValue({
        description: test.name,
        category: 'LAB',
        unitPrice: price,
        quantity: 1,
        discountPct: concessionPct,
        gstPct: 0,
        // Optional: keep track of the original test ID to refresh prices on org change
        testId: test.id 
      });
      this.recalc();
    }
    this.activeRowIndex.set(null);
    this.rowTestSearchResults.set([]);
  }

  selectBill(id: string) {
    this.isEdit = true;
    this.billId = id;
    this.billSearchTerm.set('');
    this.showBillDropdown.set(false);
    this.router.navigate(['/billing', id], { replaceUrl: true });
    this.loadBill(id);
  }

  addRow() {
    this.items.push(this._makeRow());
    this.recalc();
  }

  removeRow(index: number) {
    this.items.removeAt(index);
    this.recalc();
  }

  recalc() {
    let subtotal = 0;
    let discount = 0;
    let gst = 0;
    this.items.controls.forEach((_, i) => {
      const base = this._rowBase(i);
      const disc = this._rowDiscount(i, base);
      const gstAmt = this._rowGst(i, base - disc);
      subtotal += base;
      discount += disc;
      gst += gstAmt;
    });
    this.totals.set({
      subtotal,
      discount,
      gst,
      grandTotal: subtotal - discount + gst,
    });
  }

  rowAmount(index: number): number {
    const base = this._rowBase(index);
    const disc = this._rowDiscount(index, base);
    const gstAmt = this._rowGst(index, base - disc);
    return base - disc + gstAmt;
  }

  printBill() {
    setTimeout(() => {
      window.print();
    }, 100);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMsg.set('');

    const formValue = this.form.value;
    const items = formValue.items.map((item: any, i: number) => {
      const base = this._rowBase(i);
      const discount = this._rowDiscount(i, base);
      const gst = this._rowGst(i, base - discount);
      return {
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: discount,
        gst: gst,
      };
    });

    const body: any = {
      patientId: formValue.patientId,
      patientName: formValue.patientName,
      notes: formValue.notes,
      organizationId: formValue.organizationId,
      concessionReason: formValue.concessionReason,
      concessionPercentage: formValue.concessionPercentage,
      items: items,
    };

    if (this.isEdit) {
      body.status = formValue.status;
    }

    const req = this.isEdit ? this.api.update(this.billId!, body) : this.api.create(body);

    req.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/billing']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Save failed. Please try again.');
      },
    });
  }

  goBack() {
    this.router.navigate(['/billing']);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  isItemInvalid(index: number, field: string): boolean {
    const c = this.items.at(index)?.get(field);
    return !!(c && c.invalid && c.touched);
  }

  private _makeRow(data?: any): FormGroup {
    return this.fb.group({
      description: [data?.description ?? '', Validators.required],
      category: [data?.category ?? ('CONSULTATION' as ItemCategory)],
      quantity: [data?.quantity ?? 1],
      unitPrice: [data?.unitPrice ?? 0],
      discountPct: [data?.discountPct ?? 0],
      gstPct: [data?.gstPct ?? 0],
      testId: [data?.testId ?? null],
    });
  }

  onOrganizationChange() {
    const orgId = this.form.value.organizationId;
    if (orgId && orgId !== 'null') {
      this.form.patchValue({ status: 'PENDING' });
      this.orgApi.getRates(orgId).subscribe(rates => {
        this.organizationRates.set(rates || []);
        // Note: You could auto-update existing test prices here if they are in the table
      });
    } else {
      this.form.patchValue({ status: 'DRAFT' });
      this.organizationRates.set([]);
    }
  }

  applyConcession() {
    const pct = Number(this.form.value.concessionPercentage) || 0;
    for (let i = 0; i < this.items.length; i++) {
      const row = this.items.at(i);
      row.patchValue({ discountPct: pct }, { emitEvent: false });
    }
    this.recalc();
  }

  private _rowBase(index: number): number {
    const row = this.items.at(index).value;
    const qty = Number(row.quantity) || 0;
    const unit = Number(row.unitPrice) || 0;
    return qty * unit;
  }

  private _rowDiscount(index: number, base: number): number {
    const row = this.items.at(index).value;
    const pct = Number(row.discountPct) || 0;
    return (base * pct) / 100;
  }

  private _rowGst(index: number, afterDiscount: number): number {
    const row = this.items.at(index).value;
    const pct = Number(row.gstPct) || 0;
    return (afterDiscount * pct) / 100;
  }

  private _today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
