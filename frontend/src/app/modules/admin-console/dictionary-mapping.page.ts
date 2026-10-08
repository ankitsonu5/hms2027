import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'hms-dictionary-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .page-container {
        padding: var(--sp-6);
        background: #f8fafc;
        min-height: 100vh;
      }
      .page-header {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--sp-6);
      }
      .page-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 24px;
        color: #1e293b;
        margin: 0;
      }
      
      /* Main Tabs */
      .main-tabs {
        display: flex;
        gap: 24px;
        border-bottom: 2px solid #e2e8f0;
        margin-bottom: 24px;
      }
      .main-tab {
        padding: 12px 0;
        font-weight: 600;
        font-size: 14px;
        color: #64748b;
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
      }
      .main-tab:hover {
        color: #0ea5e9;
      }
      .main-tab.active {
        color: #0ea5e9;
      }
      .main-tab.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #0ea5e9;
      }

      /* Section Header */
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .section-title-wrap h2 {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 4px 0;
      }
      .section-title-wrap p {
        font-size: 13px;
        color: #475569;
        margin: 0;
      }
      .actions-wrap {
        display: flex;
        gap: 12px;
      }
      .btn-outline {
        background: #fff;
        border: 1px solid #cbd5e1;
        color: #3b82f6;
        padding: 6px 14px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-outline:hover {
        background: #f1f5f9;
      }

      /* Sub Tabs */
      .sub-tabs {
        display: flex;
        gap: 24px;
        border-bottom: 2px solid #e2e8f0;
        margin-bottom: 12px;
      }
      .sub-tab {
        padding: 8px 0;
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        position: relative;
      }
      .sub-tab.active {
        color: #3b82f6;
      }
      .sub-tab.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #3b82f6;
      }

      .rows-count {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 12px;
      }

      /* Table */
      .table-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th, td {
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        text-align: left;
      }
      th {
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        border-right: 1px solid #e2e8f0;
      }
      th:last-child {
        border-right: none;
      }
      td.lab-test-col {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 400px;
      }
      .view-details {
        color: #3b82f6;
        font-size: 12px;
        text-decoration: none;
        cursor: pointer;
      }

      /* Select Box */
      .select-box-wrap {
        position: relative;
        width: 300px;
      }
      .select-box-wrap select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-size: 13px;
        color: #334155;
        appearance: none;
        background: #fff;
      }
      .select-box-wrap select:focus {
        outline: none;
        border-color: #3b82f6;
      }
      .select-box-wrap .icons {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        gap: 8px;
        color: #94a3b8;
        pointer-events: none;
      }

      /* Status Badges */
      .badge-unmapped {
        background: #be123c;
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
      }
      .badge-mapped {
        background: #10b981;
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
      }

      /* Accordion rows for Parameter Mapping */
      .accordion-row td {
        cursor: pointer;
        background: #fff;
        font-weight: 500;
      }
      .accordion-row:hover td {
        background: #f8fafc;
      }
      .accordion-icon {
        display: inline-block;
        margin-right: 8px;
        color: #64748b;
        transition: transform 0.2s;
      }
      .accordion-row.open .accordion-icon {
        transform: rotate(90deg);
      }
      .expanded-content {
        background: #f8fafc;
        padding: 24px;
        border-bottom: 1px solid #e2e8f0;
      }
      .inner-select {
        margin-bottom: 24px;
      }
      .inner-select label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 8px;
      }
      .inner-table {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
      }
      .inner-table table {
        width: 100%;
      }
      .inner-table th {
        background: #f1f5f9;
        font-size: 12px;
        padding: 8px 16px;
      }
      .inner-table td {
        font-size: 12px;
        padding: 8px 16px;
      }
      .remove-icon {
        color: #000;
        font-weight: 700;
        cursor: pointer;
        padding: 4px;
      }
      .remove-icon:hover {
        color: #ef4444;
      }

      /* Modals */
      .modal-backdrop {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }
      .modal-container {
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: 700px;
        max-width: 90vw;
        display: flex;
        flex-direction: column;
      }
      .modal-container.small {
        width: 500px;
      }
      .modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #94a3b8;
        cursor: pointer;
      }
      .modal-close:hover {
        color: #475569;
      }
      .modal-body {
        padding: 24px;
      }
      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
      }
      .modal-footer.between {
        justify-content: space-between;
      }
      .btn-primary {
        background: #5c7cb6;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-primary:hover {
        background: #47669d;
      }
      .btn-cancel {
        background: #fff;
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-cancel:hover {
        background: #fef2f2;
      }

      /* Request Addition Specific */
      .request-add-row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      /* Custom Autocomplete */
      .custom-autocomplete {
        position: relative;
        flex: 1;
      }
      .custom-autocomplete .input-wrap {
        display: flex;
        align-items: center;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        background: #fff;
        padding: 0 12px;
        transition: border-color 0.2s;
      }
      .custom-autocomplete.open .input-wrap,
      .custom-autocomplete .input-wrap:focus-within {
        border-color: #5c7cb6;
        box-shadow: 0 0 0 1px #5c7cb6;
      }
      .custom-autocomplete input {
        flex: 1;
        border: none;
        outline: none;
        padding: 10px 0;
        font-size: 13px;
        color: #334155;
      }
      .custom-autocomplete .icons {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #64748b;
        font-size: 12px;
      }
      .custom-autocomplete .sep {
        color: #cbd5e1;
      }
      .custom-autocomplete .dropdown-menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10;
        max-height: 250px;
        overflow-y: auto;
      }
      .dropdown-item {
        padding: 10px 12px;
        font-size: 13px;
        color: #334155;
        cursor: pointer;
      }
      .dropdown-item:hover {
        background: #eef2ff;
      }

      /* Wizard Steps */
      .wizard-steps {
        display: flex;
        margin-bottom: 32px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
      }
      .step {
        flex: 1;
        text-align: center;
        padding: 12px;
        font-size: 12px;
        color: #94a3b8;
        background: #fff;
        position: relative;
        font-weight: 500;
      }
      .step.active {
        background: #e2e8f0;
        color: #64748b;
      }
      .step:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 16px;
        background: url('data:image/svg+xml;utf8,<svg preserveAspectRatio="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,5 0,10" fill="%23e2e8f0"/></svg>') no-repeat right center;
        background-size: 100% 100%;
        transform: translateX(100%);
        z-index: 1;
      }
      .step.active:not(:last-child)::after {
        background: url('data:image/svg+xml;utf8,<svg preserveAspectRatio="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,5 0,10" fill="%23fff"/></svg>') no-repeat right center;
        background-size: 100% 100%;
      }

      .bulk-upload-content {
        text-align: center;
        padding: 24px 0;
      }
      .bulk-upload-content h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 15px;
        font-weight: 700;
      }
      .bulk-upload-content p {
        margin: 0 0 24px 0;
        color: #64748b;
        font-size: 13px;
      }
      .upload-link {
        color: #5c7cb6;
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 24px;
      }
    `
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Dictionary Mapping</h1>
      </div>

      <div class="main-tabs">
        <div class="main-tab" [class.active]="activeMainTab() === 'TEST'" (click)="activeMainTab.set('TEST')">
          Master Test Mapping
        </div>
        <div class="main-tab" [class.active]="activeMainTab() === 'PARAMETER'" (click)="activeMainTab.set('PARAMETER')">
          Master Parameter Mapping
        </div>
      </div>

      @if (activeMainTab() === 'TEST') {
        <div class="section-header">
          <div class="section-title-wrap">
            <h2>Test Mapping</h2>
            <p>Efficiently Aligning Lab Center Test Lists with Master Test Lists for Streamlined Operations</p>
          </div>
          <div class="actions-wrap">
            <button class="btn-outline" (click)="showRequestAddition = true">Request Addition</button>
            <button class="btn-outline">Download Excel</button>
            <button class="btn-outline">Bulk Un-map Tests</button>
          </div>
        </div>

        <div class="sub-tabs">
          <div class="sub-tab" [class.active]="activeSubTabTest() === 'ALL'" (click)="activeSubTabTest.set('ALL')">All Tests</div>
          <div class="sub-tab" [class.active]="activeSubTabTest() === 'MAPPED'" (click)="activeSubTabTest.set('MAPPED')">Mapped Tests</div>
          <div class="sub-tab" [class.active]="activeSubTabTest() === 'UNMAPPED'" (click)="activeSubTabTest.set('UNMAPPED')">Un-Mapped Tests</div>
        </div>

        <div class="rows-count">Rows: {{ filteredTests().length }}</div>

        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th style="width: 40px"><input type="checkbox" /></th>
                <th style="width: 400px">
                  Lab Test List
                  <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; float: right;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg>
                </th>
                <th>Master Test List</th>
                <th style="width: 120px">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (test of filteredTests(); track test.id) {
                <tr>
                  <td><input type="checkbox" /></td>
                  <td class="lab-test-col">
                    <span>{{ test.name }}</span>
                    <a class="view-details">View Details</a>
                  </td>
                  <td>
                    <div class="select-box-wrap">
                      <select [value]="test.mappedTo" (change)="updateMapping(test.id, $event)">
                        <option value="">Select test to map</option>
                        <option value="Lactate">Lactate</option>
                        <option value="Total IgE">Total IgE</option>
                        <option value="TIBC - Total Iron Binding Capacity">TIBC - Total Iron Binding Capacity</option>
                        <option value="Haptoglobin">Haptoglobin</option>
                        <option value="Serum Iron">Serum Iron</option>
                        <option value="Anti-dsDNA">Anti-dsDNA</option>
                        <option value="HEPATITIS C VIRUS ( HCV )">HEPATITIS C VIRUS ( HCV )</option>
                        <option value="Homocysteine">Homocysteine</option>
                      </select>
                      <div class="icons">
                        <span>✕</span>
                        <span>▼</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    @if (test.status === 'MAPPED') {
                      <span class="badge-mapped">Mapped</span>
                    } @else {
                      <span class="badge-unmapped">Unmapped</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeMainTab() === 'PARAMETER') {
        <div class="section-header">
          <div class="section-title-wrap">
            <h2>Parameter Mapping</h2>
            <p>Efficiently Aligning Lab Center Test Lists with Master Test Lists for Streamlined Operations</p>
          </div>
          <div class="actions-wrap">
            <button class="btn-outline" (click)="showRequestAddition = true">Request Addition</button>
            <button class="btn-outline">Download Master Parameter List</button>
            <button class="btn-outline">Bulk Un-map Tests</button>
            <button class="btn-outline" (click)="showBulkMapping = true">Bulk Map Parameters</button>
          </div>
        </div>

        <div class="sub-tabs">
          <div class="sub-tab" [class.active]="activeSubTabParam() === 'ALL'" (click)="activeSubTabParam.set('ALL')">All Parameters</div>
          <div class="sub-tab" [class.active]="activeSubTabParam() === 'MAPPED'" (click)="activeSubTabParam.set('MAPPED')">Mapped Parameters</div>
          <div class="sub-tab" [class.active]="activeSubTabParam() === 'UNMAPPED'" (click)="activeSubTabParam.set('UNMAPPED')">Unmapped Parameters</div>
        </div>

        <div class="rows-count">Rows: {{ parameters().length }}</div>

        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>
                  Master Parameter
                  <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="color: #666; float: right;"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (param of parameters(); track param.id) {
                <tr class="accordion-row" [class.open]="param.expanded" (click)="param.expanded = !param.expanded">
                  <td>
                    <span class="accordion-icon">▶</span>
                    {{ param.name }}
                  </td>
                </tr>
                @if (param.expanded) {
                  <tr>
                    <td style="padding: 0;">
                      <div class="expanded-content">
                        <div class="inner-select">
                          <label>Select parameter to map</label>
                          <div class="select-box-wrap">
                            <select>
                              <option value="">Select parameter to map</option>
                            </select>
                            <div class="icons">
                              <span>▼</span>
                            </div>
                          </div>
                        </div>

                        <div class="rows-count" style="margin-bottom: 8px;">Rows: {{ param.mappedItems?.length || 0 }}</div>
                        <div class="inner-table">
                          <table>
                            <thead>
                              <tr>
                                <th style="width: 40px"><input type="checkbox" /></th>
                                <th>Lab Parameter</th>
                                <th>Lab Test Name</th>
                                <th>Unit</th>
                                <th>Status</th>
                                <th style="width: 40px"></th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (item of param.mappedItems; track item.id) {
                                <tr>
                                  <td><input type="checkbox" /></td>
                                  <td>{{ item.labParameter }}</td>
                                  <td>{{ item.labTestName }}</td>
                                  <td>{{ item.unit }}</td>
                                  <td><span class="badge-mapped">Mapped</span></td>
                                  <td><span class="remove-icon">×</span></td>
                                </tr>
                              }
                              @if (!param.mappedItems || param.mappedItems.length === 0) {
                                <tr>
                                  <td colspan="6" style="text-align: center; color: #64748b; padding: 24px;">No mappings configured</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modals -->
      @if (showRequestAddition) {
        <div class="modal-backdrop">
          <div class="modal-container small">
            <div class="modal-header">
              <h3>Request Addition in Master Parameter List</h3>
              <button class="modal-close" (click)="showRequestAddition = false">×</button>
            </div>
            <div class="modal-body">
              <div class="request-add-row">
                <div class="custom-autocomplete" [class.open]="showDropdown">
                  <div class="input-wrap">
                    <input type="text" placeholder="Enter name of the parameter" 
                           [value]="parameterSearch()"
                           (input)="parameterSearch.set($any($event.target).value)"
                           (focus)="showDropdown = true" 
                           (blur)="hideDropdown()" />
                    <div class="icons">
                      <span class="sep">|</span>
                      <span>▼</span>
                    </div>
                  </div>
                  @if (showDropdown) {
                    <div class="dropdown-menu">
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('H.Pylori IgM Antibody')">H.Pylori IgM Antibody</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Note:')">Note:</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Impression:')">Impression:</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Associated test')">Associated test</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Leptospira IgM Ab')">Leptospira IgM Ab</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Note:')">Note:</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Impression:')">Impression:</div>
                      <div class="dropdown-item" (mousedown)="selectDropdownItem('Advised:')">Advised:</div>
                    </div>
                  }
                </div>
                <button class="btn-primary">Add</button>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-primary" (click)="showRequestAddition = false">Save</button>
            </div>
          </div>
        </div>
      }

      @if (showBulkMapping) {
        <div class="modal-backdrop">
          <div class="modal-container">
            <div class="modal-header">
              <h3>Bulk Mapping</h3>
              <button class="modal-close" (click)="showBulkMapping = false">×</button>
            </div>
            <div class="modal-body">
              <div class="wizard-steps">
                <div class="step active">1. Upload File</div>
                <div class="step" style="border-left: none;">2. Review Upload</div>
                <div class="step" style="border-left: none;">3. Dictionary Mapping</div>
              </div>

              <div class="bulk-upload-content">
                <h4>Upload Excel</h4>
                <p>Use the template below to map lab parameter in bulk</p>
                <button class="btn-outline">Download Template</button>
                <br />
                <a class="upload-link">
                  Upload File 
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                </a>
              </div>
            </div>
            <div class="modal-footer between">
              <button class="btn-cancel" (click)="showBulkMapping = false">Cancel</button>
              <button class="btn-primary" (click)="showBulkMapping = false">Proceed</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DictionaryMappingPage {
  activeMainTab = signal<'TEST' | 'PARAMETER'>('TEST');
  activeSubTabTest = signal<'ALL' | 'MAPPED' | 'UNMAPPED'>('ALL');
  activeSubTabParam = signal<'ALL' | 'MAPPED' | 'UNMAPPED'>('ALL');

  showRequestAddition = false;
  showBulkMapping = false;
  showDropdown = false;
  parameterSearch = signal('');

  hideDropdown() {
    setTimeout(() => this.showDropdown = false, 150);
  }

  selectDropdownItem(val: string) {
    this.parameterSearch.set(val);
    this.showDropdown = false;
  }

  // Reduced to just a couple of examples for demonstration.
  // Note: These are dummy arrays since there is no backend Dictionary Mapping API yet.
  tests = signal([
    { id: '1', name: 'H. Pylori IgM antibodies', mappedTo: '', status: 'UNMAPPED' },
    { id: '2', name: 'Lactate', mappedTo: 'Lactate', status: 'MAPPED' },
  ]);

  parameters = signal([
    { 
      id: 'p1', 
      name: '17-Hydroxyprogesterone', 
      expanded: true,
      mappedItems: [
        { id: 'm1', labParameter: '17 Alpha Hydroxy Progesterone', labTestName: '17 OH Progesterone', unit: 'ng/ml' },
        { id: 'm2', labParameter: '17Alpha Hydroxy Progesteron serum', labTestName: '17 OH Progesterone', unit: 'ng/ml' }
      ]
    },
    { id: 'p2', name: 'ACTH', expanded: false, mappedItems: [] },
  ]);

  filteredTests = computed(() => {
    const subTab = this.activeSubTabTest();
    if (subTab === 'ALL') return this.tests();
    return this.tests().filter(t => t.status === subTab);
  });

  updateMapping(id: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.tests.update(tests => 
      tests.map(t => {
        if (t.id === id) {
          return { ...t, mappedTo: value, status: value ? 'MAPPED' : 'UNMAPPED' };
        }
        return t;
      })
    );
  }
}
