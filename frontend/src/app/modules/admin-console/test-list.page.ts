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
      .row-count {
        font-size: var(--text-sm);
        font-weight: var(--fw-bold);
        margin-bottom: var(--sp-3);
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

      @if (loading()) {
        <div class="loading">Loading tests...</div>
      } @else {
        <div class="row-count">Rows: {{ filteredTests().length }}</div>

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

  filteredTests = computed(() => {
    return this.tests().filter(t => (t.testType || 'TEST') === this.activeMainTab());
  });

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
    const payload = {
      ...this.testForm.value,
      testType: this.addingType()
    };

    this.labApi.createTest(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadTests(); // Refresh the list
      },
      error: (err) => {
        console.error(err);
        this.saving.set(false);
        alert('Failed to save. Please try again.');
      }
    });
  }
}
