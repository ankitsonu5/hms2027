import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accession-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      
      @if (editingSample()) {
        <div class="header-row">
          <h1 class="page-title">
            <span class="breadcrumb" (click)="editingSample.set(null)">Accession Settings</span> > Edit Sample Type
          </h1>
        </div>

        <div class="form-container">
          <div class="form-group">
            <label>Sample Name *</label>
            <input type="text" class="form-control" [(ngModel)]="draftSample().name">
          </div>

          <div class="form-group">
            <label>Sample Type *</label>
            <select class="form-control" [(ngModel)]="draftSample().type">
              <option value="EDTA WB">EDTA WB</option>
              <option value="Serum">Serum</option>
              <option value="Urine">Urine</option>
            </select>
          </div>

          <div class="form-group">
            <label>Container Type</label>
            <div class="custom-dropdown" (click)="dropdownOpen.set(!dropdownOpen())">
              <div class="dropdown-selected" [class.open]="dropdownOpen()">
                <span class="color-dot" [style.background]="selectedContainer()?.color"></span>
                <span>{{ selectedContainer()?.name }}</span>
                
                <div class="dropdown-actions">
                  <span class="clear-btn" (click)="$event.stopPropagation(); selectedContainer.set(null)">✕</span>
                  <span class="arrow-btn">▾</span>
                </div>
              </div>

              @if (dropdownOpen()) {
                <div class="dropdown-list">
                  @for (c of containerTypes; track c.name) {
                    <div class="dropdown-item" (click)="$event.stopPropagation(); selectContainer(c)">
                      <span class="color-dot" [style.background]="c.color"></span>
                      {{ c.name }}
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="row">
            <div class="form-group flex-1">
              <label>Accession ID Abbreviation</label>
              <input type="text" class="form-control" placeholder="(Max 2 digit)">
            </div>
            <div class="form-group flex-1">
              <label>Use as</label>
              <select class="form-control">
                <option>Prefix</option>
                <option>Suffix</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Sample Description</label>
            <textarea class="form-control" rows="3" placeholder="Sample Description"></textarea>
          </div>

          <div class="form-group">
            <label>Collection Instruction</label>
            <textarea class="form-control" rows="3" placeholder="Collection Instruction"></textarea>
          </div>

          <div class="form-group">
            <label>Prompt Instruction ℹ️</label>
            <textarea class="form-control" rows="3" placeholder="Prompt Instruction"></textarea>
          </div>

          <div class="form-group">
            <label class="flex-between">General Instruction <span>Templates</span></label>
            <textarea class="form-control" rows="3" placeholder="General Instruction"></textarea>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="newSeries">
            <label for="newSeries">Make new series of Accession Numbers</label>
          </div>

          <div class="form-actions">
            <button class="btn btn-outline text-danger" (click)="deleteSample()">Delete</button>
            <div class="right-actions">
              <button class="btn btn-secondary" (click)="editingSample.set(null)">Cancel</button>
              <button class="btn btn-primary" (click)="updateSample()">Update Sample</button>
            </div>
          </div>
        </div>
      } @else {
        <div class="header-row">
          <h1 class="page-title">Accession Settings > Sample Type List</h1>
          <button class="btn btn-primary" (click)="alert('Add Sample Type clicked')">Add Sample Type</button>
        </div>

        <div class="tabs-bar">
          <button class="tab-pill" [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Sample Type List</button>
          <button class="tab-pill" [class.active]="activeTab === 'mapping'" (click)="activeTab = 'mapping'">Sample Mapping</button>
        </div>

        <div class="toolbar">
          <span></span>
          <div class="tools">
            <button class="btn btn-ghost" (click)="alert('Filter Rows')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filter Rows
            </button>
            <button class="btn btn-ghost" (click)="alert('Refresh')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              Refresh
            </button>
          </div>
        </div>

        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Sample Name</th>
                  <th>Sample Type</th>
                  <th>Container Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (sample of sampleTypes(); track sample.id; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td>{{ sample.name }}</td>
                    <td>{{ sample.type }}</td>
                    <td>
                      <span class="color-dot" [style.background]="getContainerColor(sample.container)"></span> {{ sample.container }}
                    </td>
                    <td>
                      <button class="btn btn-text" (click)="editSample(sample)">Edit Sample</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-wrap { padding: var(--sp-6); max-width: 1000px; margin: 0 auto; }
      .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-6); }
      .page-title { font-size: var(--text-xl); font-weight: bold; margin: 0; color: var(--clr-neutral-800); }
      .breadcrumb { color: var(--clr-neutral-500); font-weight: normal; cursor: pointer; }
      .breadcrumb:hover { text-decoration: underline; }
      
      .btn { padding: var(--sp-2) var(--sp-4); border-radius: var(--radius-md); cursor: pointer; border: none; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; }
      .btn-primary { background: var(--clr-primary-600); color: white; transition: background 0.2s; }
      .btn-primary:hover { background: var(--clr-primary-700); }
      .btn-secondary { background: var(--bg-surface); border: 1px solid var(--border-default); transition: background 0.2s; }
      .btn-secondary:hover { background: var(--bg-muted); }
      .btn-outline { background: white; border: 1px solid var(--border-default); transition: background 0.2s; }
      .btn-outline:hover { background: var(--bg-muted); }
      .text-danger { color: #d32f2f; }
      
      .btn-ghost { background: transparent; color: var(--clr-neutral-600); font-size: 0.9rem; padding: var(--sp-1) var(--sp-2); }
      .btn-ghost:hover { background: var(--bg-muted); }
      .btn-text { background: transparent; color: var(--clr-primary-600); font-size: 0.9rem; border: none; cursor: pointer; padding: 0; }
      .btn-text:hover { text-decoration: underline; }
      
      .tabs-bar { display: flex; gap: var(--sp-4); margin-bottom: var(--sp-4); border-bottom: 1px solid var(--border-default); padding-bottom: var(--sp-4); }
      .tab-pill { padding: var(--sp-2) var(--sp-5); background: white; border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; color: var(--clr-neutral-600); font-weight: 500; font-size: 0.9rem; transition: all 0.2s; }
      .tab-pill.active { border-color: var(--clr-primary-600); color: var(--clr-primary-600); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      
      .toolbar { display: flex; justify-content: space-between; margin-bottom: var(--sp-2); }
      .tools { display: flex; gap: var(--sp-2); }
      .card { background: white; border: 1px solid var(--border-default); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--border-default); text-align: left; }
      th { background: var(--bg-muted); font-size: 0.75rem; text-transform: uppercase; color: var(--clr-neutral-600); font-weight: 600; letter-spacing: 0.05em; }
      
      /* Form Styles */
      .form-container { background: white; }
      .form-group { margin-bottom: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-1); }
      .form-group label { font-size: 0.85rem; color: var(--clr-neutral-600); }
      .flex-between { display: flex; justify-content: space-between; }
      .form-control { padding: var(--sp-2) var(--sp-3); border: 1px solid var(--border-default); border-radius: var(--radius-sm); outline: none; font-size: 0.9rem; width: 100%; }
      .form-control:focus { border-color: var(--clr-primary-400); }
      textarea.form-control { resize: vertical; }
      .row { display: flex; gap: var(--sp-4); }
      .flex-1 { flex: 1; }
      
      /* Custom Dropdown for Container Type */
      .custom-dropdown { position: relative; width: 100%; font-size: 0.9rem; }
      .dropdown-selected { display: flex; align-items: center; padding: var(--sp-2) var(--sp-3); border: 1px solid var(--border-default); border-radius: var(--radius-sm); cursor: pointer; background: white; }
      .dropdown-selected.open { border-color: var(--clr-primary-400); outline: 1px solid var(--clr-primary-400); }
      .dropdown-actions { margin-left: auto; display: flex; align-items: center; gap: var(--sp-2); color: var(--clr-neutral-500); }
      .clear-btn { cursor: pointer; font-size: 0.8rem; }
      .clear-btn:hover { color: var(--clr-neutral-800); }
      .dropdown-list { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--border-default); border-top: none; z-index: 10; max-height: 250px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .dropdown-item { display: flex; align-items: center; padding: var(--sp-2) var(--sp-3); cursor: pointer; border-bottom: 1px solid var(--border-default); }
      .dropdown-item:last-child { border-bottom: none; }
      .dropdown-item:hover { background: var(--bg-muted); }
      
      .color-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #9c27b0; margin-right: 8px; flex-shrink: 0; }
      .checkbox-group { display: flex; align-items: center; gap: 8px; justify-content: center; margin: var(--sp-6) 0; font-size: 0.9rem; }
      .form-actions { display: flex; justify-content: space-between; align-items: center; padding-top: var(--sp-4); margin-top: var(--sp-4); }
      .right-actions { display: flex; gap: var(--sp-3); }
    `
  ]
})
export class AccessionSettings {
  activeTab = 'list';
  editingSample = signal<any | null>(null);
  draftSample = signal<any | null>(null);
  dropdownOpen = signal(false);
  selectedContainer = signal<any | null>(null);

  containerTypes = [
    { name: 'Blood culture', color: '#e4cd75' },
    { name: 'Citrate Tube', color: '#5b8deb' },
    { name: 'Serum Separator Tube', color: '#e3bc57' },
    { name: 'Serum Tube', color: '#d32f2f' },
    { name: 'Rapid Serum Tube', color: '#db7c4e' },
    { name: 'Plasma Separator Tube', color: '#9dc98a' },
    { name: 'Haparin Tube', color: '#4caf50' },
    { name: 'EDTA Tube', color: '#9c27b0' },
    { name: 'PPT Separator Tube', color: '#e5e0d8' },
    { name: 'Fluoride Tube', color: '#7e7e7e' },
  ];

  sampleTypes = signal([
    { id: 1, name: 'EDTA WB', type: 'EDTA WB', container: 'EDTA Tube' },
    { id: 2, name: 'Serum', type: 'Serum', container: 'Serum Tube' },
    { id: 3, name: 'Urine', type: 'Urine', container: 'Urine Container' }
  ]);
  
  editSample(sample: any) {
    this.editingSample.set(sample);
    this.draftSample.set({ ...sample });
    const match = this.containerTypes.find(c => c.name === sample.container);
    this.selectedContainer.set(match || { name: sample.container, color: '#9c27b0' });
    this.dropdownOpen.set(false);
  }

  selectContainer(c: any) {
    this.selectedContainer.set(c);
    this.dropdownOpen.set(false);
  }

  updateSample() {
    const draft = this.draftSample();
    const original = this.editingSample();
    
    if (draft && original) {
      // Ensure the chosen container type is saved back to draft
      draft.container = this.selectedContainer()?.name || '';
      
      this.sampleTypes.update(types => 
        types.map(t => t.id === original.id ? { ...draft } : t)
      );
      
      window.alert('Sample ' + draft.name + ' updated successfully!');
      this.editingSample.set(null);
    }
  }

  deleteSample() {
    const original = this.editingSample();
    if (original && window.confirm('Are you sure you want to delete ' + original.name + '?')) {
      this.sampleTypes.update(types => types.filter(t => t.id !== original.id));
      this.editingSample.set(null);
    }
  }

  getContainerColor(name: string) {
    const match = this.containerTypes.find(c => c.name === name);
    return match ? match.color : '#9c27b0';
  }

  alert(msg: string) {
    window.alert(msg);
  }
}
