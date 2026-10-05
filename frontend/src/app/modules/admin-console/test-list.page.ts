import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';

@Component({
  selector: 'hms-test-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
        overflow: hidden;
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
                  <th>Profile Name</th>
                  <th>Profile Code</th>
                  <th>Price (₹)</th>
                  <th>Outsourced</th>
                  <th>Auto Approval</th>
                  <th style="width: 40px"></th>
                </tr>
              } @else {
                <tr>
                  <th style="width: 40px"><input type="checkbox" /></th>
                  <th>Test Name</th>
                  <th>Test Code</th>
                  <th>Price (₹)</th>
                  <th>Sample Type</th>
                  <th>Department</th>
                  <th>Outsourced</th>
                  <th>Auto Approval</th>
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
                      <td>
                        <strong>{{ test.name }}</strong>
                        <span class="status-badge">Not Verified</span>
                      </td>
                      <td>{{ test.code || 'undefined' }}</td>
                      <td>₹{{ test.price ?? 0 }}</td>
                      @if (activeMainTab() !== 'PROFILE') {
                        <td>{{ test.sampleType || '—' }}</td>
                        <td>{{ (test.category || '—') | uppercase }}</td>
                      }
                      <td>No</td> <!-- Mocked -->
                      <td>No</td> <!-- Mocked -->
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
          <div class="modal-body">
            <div class="modal-tabs">
              <div class="modal-tab active">Test Information</div>
              <div class="modal-tab">Report Parameters</div>
              <div class="modal-tab">Supplementary Test</div>
              <div class="modal-tab">Report Templating</div>
              <div class="modal-tab">Parent Test Mapping</div>
              <div class="modal-tab">Report Settings</div>
            </div>

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
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
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
