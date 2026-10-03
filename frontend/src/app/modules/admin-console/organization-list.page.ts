import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { OrganizationApiService } from '../../core/services/organization-api.service';
import { LabApiService } from '../../core/services/lab-api.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'hms-organization-list',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe],
  styles: [
    `
      .page-container { padding: var(--sp-6); background: #f8fafc; min-height: 100vh; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-6); }
      .page-title { font-size: var(--text-2xl); font-weight: var(--fw-bold); color: var(--clr-neutral-900); margin: 0; }
      
      .card { background: #fff; border: 1px solid var(--border-default); border-radius: var(--radius-lg); box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: var(--sp-6); padding: var(--sp-5); }
      .table-wrap { overflow-x: auto; margin: calc(var(--sp-5) * -1); margin-top: 0; }
      
      table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
      th { background: #f1f5f9; color: var(--clr-neutral-600); font-weight: var(--fw-semibold); text-align: left; padding: var(--sp-3) var(--sp-5); border-bottom: 1px solid var(--border-default); }
      td { padding: var(--sp-3) var(--sp-5); border-bottom: 1px solid var(--border-default); color: var(--clr-neutral-800); }
      tr:last-child td { border-bottom: none; }
      
      .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--sp-4); }
      .modal-content { max-height: 90vh; overflow-y: auto; background: #fff; }
      
      .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-4); }
      .form-field.full { grid-column: 1 / -1; }
      
      .dropdown-item:hover { background: #f8fafc !important; }
    `
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Referral Partners & Organizations</h1>
        <button class="btn btn-primary" (click)="openOrgModal()">+ Add Partner</button>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Type</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (organizations().length === 0) {
                <tr>
                  <td colspan="5" style="text-align:center; padding:var(--sp-5); color:var(--clr-neutral-500);">
                    No organizations found.
                  </td>
                </tr>
              }
              @for (org of organizations(); track org.id) {
                <tr>
                  <td><strong>{{ org.name }}</strong></td>
                  <td>{{ org.type || '-' }}</td>
                  <td>{{ org.contactPerson || '-' }}</td>
                  <td>{{ org.phone || '-' }}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" (click)="manageRates(org)">Manage Rates</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Organization Modal -->
      @if (showOrgModal()) {
        <div class="modal-overlay">
          <div class="modal-content card" style="max-width:500px; width:100%;">
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
              <h2 class="section-title" style="margin:0">Add New Partner</h2>
              <button class="btn btn-icon" (click)="closeOrgModal()">&#215;</button>
            </div>
            
            <form [formGroup]="orgForm" (ngSubmit)="saveOrg()">
              <div class="form-grid">
                <div class="form-field full">
                  <label class="form-label">Name <span class="required-star">*</span></label>
                  <input class="form-control" formControlName="name" placeholder="Hospital or Clinic Name" />
                </div>
                <div class="form-field">
                  <label class="form-label">Type</label>
                  <select class="form-control" formControlName="type">
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINIC">Clinic</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="form-label">Phone</label>
                  <input class="form-control" formControlName="phone" />
                </div>
                <div class="form-field full">
                  <label class="form-label">Contact Person</label>
                  <input class="form-control" formControlName="contactPerson" />
                </div>
                <div class="form-field full">
                  <label class="form-label">Address</label>
                  <input class="form-control" formControlName="address" />
                </div>
              </div>
              <div class="modal-footer" style="margin-top:var(--sp-4); display:flex; justify-content:flex-end; gap:var(--sp-3);">
                <button type="button" class="btn btn-outline" (click)="closeOrgModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="orgForm.invalid || saving()">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Manage Rates Modal -->
      @if (showRatesModal() && selectedOrg()) {
        <div class="modal-overlay">
          <div class="modal-content card" style="max-width:800px; width:100%;">
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
              <h2 class="section-title" style="margin:0">Manage Custom Rates: {{ selectedOrg().name }}</h2>
              <button class="btn btn-icon" (click)="closeRatesModal()">&#215;</button>
            </div>
            
            <div class="form-grid" style="margin-bottom:var(--sp-4);">
              <div class="form-field full">
                <label class="form-label">Search Test to Add/Update Rate</label>
                <div class="search-container" style="position:relative;">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search by test name or code..."
                    [ngModel]="testSearchTerm()"
                    (ngModelChange)="searchTests($event)"
                  />
                  @if (testSearchResults().length > 0) {
                    <div class="search-dropdown" style="position:absolute; top:100%; left:0; right:0; z-index:10; background:white; border:1px solid var(--clr-neutral-300); border-radius:var(--radius-md); box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1); max-height:200px; overflow-y:auto;">
                      @for (t of testSearchResults(); track t.id) {
                        <button type="button" class="dropdown-item" style="display:flex; justify-content:space-between; width:100%; padding:var(--sp-2); text-align:left; border:none; background:transparent; cursor:pointer;" (click)="selectTestForRate(t)">
                          <span><strong>{{ t.name }}</strong> <small>({{ t.code }})</small></span>
                          <span style="color:var(--clr-neutral-500);">Retail: ₹{{ t.price }}</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            @if (activeTest()) {
              <div class="card" style="background:var(--clr-neutral-50); margin-bottom:var(--sp-4);">
                <div style="font-weight:var(--fw-semibold); margin-bottom:var(--sp-2);">Set Rate for: {{ activeTest().name }} (Retail: ₹{{ activeTest().price }})</div>
                <div style="display:flex; gap:var(--sp-3); align-items:flex-end;">
                  <div class="form-field" style="margin:0; flex:1;">
                    <label class="form-label">Custom Partner Price (₹)</label>
                    <input type="number" class="form-control" [ngModel]="customPriceInput()" (ngModelChange)="customPriceInput.set($event)" />
                  </div>
                  <button class="btn btn-primary" (click)="saveRate()" [disabled]="savingRate()">Save Rate</button>
                  <button class="btn btn-outline" (click)="activeTest.set(null)">Cancel</button>
                </div>
              </div>
            }

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Custom Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  @if (rates().length === 0) {
                    <tr>
                      <td colspan="2" style="text-align:center; padding:var(--sp-4); color:var(--clr-neutral-500);">No custom rates defined yet.</td>
                    </tr>
                  }
                  @for (rate of rates(); track rate.id) {
                    <tr>
                      <td>{{ getTestName(rate.testId) }}</td>
                      <td style="font-weight:var(--fw-semibold); color:var(--clr-primary-700);">₹{{ rate.customPrice | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrganizationListPage implements OnInit {
  private orgApi = inject(OrganizationApiService);
  private labApi = inject(LabApiService);
  private fb = inject(FormBuilder);

  organizations = signal<any[]>([]);
  showOrgModal = signal(false);
  saving = signal(false);

  orgForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    type: ['HOSPITAL'],
    phone: [''],
    contactPerson: [''],
    address: ['']
  });

  // Rates Management
  showRatesModal = signal(false);
  selectedOrg = signal<any>(null);
  rates = signal<any[]>([]);
  
  testSearchTerm = signal('');
  testSearchResults = signal<any[]>([]);
  activeTest = signal<any>(null);
  customPriceInput = signal<number>(0);
  savingRate = signal(false);
  
  allTests = signal<any[]>([]);

  ngOnInit() {
    this.loadOrgs();
    this.labApi.listTests({ limit: 1000 }).subscribe(res => {
      this.allTests.set(res.data || []);
    });
  }

  loadOrgs() {
    this.orgApi.list().subscribe(res => {
      this.organizations.set(res || []);
    });
  }

  openOrgModal() {
    this.orgForm.reset({ type: 'HOSPITAL' });
    this.showOrgModal.set(true);
  }

  closeOrgModal() {
    this.showOrgModal.set(false);
  }

  saveOrg() {
    if (this.orgForm.invalid) return;
    this.saving.set(true);
    // Add create to organizationApiService
    this.orgApi.createOrg(this.orgForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeOrgModal();
        this.loadOrgs();
      },
      error: () => this.saving.set(false)
    });
  }

  manageRates(org: any) {
    this.selectedOrg.set(org);
    this.showRatesModal.set(true);
    this.loadRates(org.id);
  }

  closeRatesModal() {
    this.showRatesModal.set(false);
    this.selectedOrg.set(null);
    this.activeTest.set(null);
    this.testSearchTerm.set('');
    this.testSearchResults.set([]);
  }

  loadRates(orgId: string) {
    this.orgApi.getRates(orgId).subscribe(res => {
      // Map to get test names. Realistically backend should join LabTest to return testName.
      // We will assume backend returns it, or we display testId for now.
      // Let's call a bulk tests fetch if we need names, or modify backend to return testName.
      this.rates.set(res || []);
    });
  }

  searchTests(term: string) {
    this.testSearchTerm.set(term);
    if (!term.trim()) {
      this.testSearchResults.set([]);
      return;
    }
    this.labApi.listTests({ search: term, limit: 10 }).subscribe(res => {
      this.testSearchResults.set(res.data || []);
    });
  }

  getTestName(testId: string): string {
    const t = this.allTests().find(x => x.id === testId);
    return t ? t.name : testId;
  }

  selectTestForRate(test: any) {
    this.activeTest.set(test);
    this.customPriceInput.set(test.price); // default to retail
    this.testSearchResults.set([]);
    this.testSearchTerm.set('');
  }

  saveRate() {
    const org = this.selectedOrg();
    const test = this.activeTest();
    const price = Number(this.customPriceInput());
    if (!org || !test || isNaN(price)) return;
    
    this.savingRate.set(true);
    this.orgApi.upsertRate(org.id, { testId: test.id, customPrice: price }).subscribe({
      next: () => {
        this.savingRate.set(false);
        this.activeTest.set(null);
        this.loadRates(org.id);
      },
      error: () => this.savingRate.set(false)
    });
  }
}
