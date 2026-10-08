import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">
      
      <div class="tabs-container">
        <button class="tab-btn" [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'">Payments & Billings</button>
        <button class="tab-btn" [class.active]="activeTab === 'patients'" (click)="activeTab = 'patients'">Patients</button>
        <button class="tab-btn" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">Reports & Services</button>
      </div>

      <div class="search-form">
        <div class="form-row">
          <input type="text" class="form-control" placeholder="Enter patient name / Id / contact / NIC">
          
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Enter referral name">
            <button class="btn btn-outline" (click)="alert('List clicked')">List ▾</button>
          </div>

          <div class="input-group">
            <input type="text" class="form-control" placeholder="Enter organization name">
            <button class="btn btn-outline" (click)="alert('List clicked')">List ▾</button>
          </div>
        </div>

        <div class="form-footer">
          <span class="note"><strong>Note :</strong> Choose more than one parameter to load faster.</span>
          <div class="actions">
            <a href="#" class="more-options" (click)="$event.preventDefault(); alert('More options')">More Options</a>
            <div class="date-picker">
              📅 October 6, 2026 12:00 AM - October 6, 2026 11:59 PM ▾
            </div>
            <button class="btn btn-primary" (click)="alert('Search executed')">Search</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [
    `
      .page-wrap { padding: var(--sp-6); max-width: 1200px; margin: 0 auto; background: var(--bg-muted); min-height: 100vh; }
      
      .tabs-container { display: flex; background: white; border: 1px solid var(--border-default); margin-bottom: var(--sp-4); border-radius: var(--radius-md); overflow: hidden; }
      .tab-btn { flex: 1; padding: var(--sp-3); border: none; background: white; border-right: 1px solid var(--border-default); cursor: pointer; color: var(--clr-neutral-600); font-weight: 500; }
      .tab-btn:last-child { border-right: none; }
      .tab-btn.active { background: var(--bg-surface); color: var(--clr-primary-600); border-bottom: 2px solid var(--clr-primary-600); }

      .search-form { padding: var(--sp-4) 0; }
      .form-row { display: flex; gap: var(--sp-4); margin-bottom: var(--sp-6); }
      .form-control { flex: 1; padding: var(--sp-2) var(--sp-3); border: 1px solid var(--border-default); border-radius: var(--radius-sm); outline: none; }
      .form-control:focus { border-color: var(--clr-primary-400); }
      .input-group { display: flex; flex: 1; }
      .input-group .form-control { border-radius: var(--radius-sm) 0 0 var(--radius-sm); border-right: none; }
      .btn-outline { background: white; border: 1px solid var(--border-default); padding: 0 var(--sp-3); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; cursor: pointer; }
      
      .form-footer { display: flex; justify-content: space-between; align-items: center; }
      .note { font-size: 0.9rem; color: var(--clr-neutral-600); }
      .actions { display: flex; gap: var(--sp-4); align-items: center; }
      .more-options { color: var(--clr-primary-600); text-decoration: none; font-size: 0.9rem; }
      .date-picker { padding: var(--sp-2) var(--sp-3); border: 1px solid var(--border-default); background: white; border-radius: var(--radius-sm); font-size: 0.9rem; cursor: pointer; }
      .btn-primary { background: var(--clr-primary-600); color: white; border: none; padding: var(--sp-2) var(--sp-6); border-radius: var(--radius-md); cursor: pointer; font-weight: 500; transition: background 0.2s; }
      .btn-primary:hover { background: var(--clr-primary-700); }
    `
  ]
})
export class AdvancedSearch {
  activeTab = 'payments';

  alert(msg: string) {
    window.alert(msg);
  }
}
