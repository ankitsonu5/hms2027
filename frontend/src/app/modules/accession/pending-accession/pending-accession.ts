import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabApiService } from '../../../core/services/lab-api.service';

@Component({
  selector: 'app-pending-accession',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      
      <div class="search-bar">
        <input type="text" class="form-control" placeholder="Select by Patient Id / Patient Name / Accession Number / Bill Id / Order Id / National ID" [(ngModel)]="searchQuery" (keyup.enter)="loadPendingOrders()">
        <button class="btn btn-secondary" (click)="loadPendingOrders()">Search</button>
      </div>

      <div class="tabs-bar">
        <button class="tab-pill" [class.active]="activeTab === 'sample'" (click)="activeTab = 'sample'">Sample-Wise</button>
        <button class="tab-pill" [class.active]="activeTab === 'bill'" (click)="activeTab = 'bill'">Bill-Wise</button>
        <button class="tab-pill" [class.active]="activeTab === 'emergency'" (click)="activeTab = 'emergency'">Emergency (0)</button>
      </div>

      <div class="card">
        <div class="table-wrap">
          @if (loading()) {
            <div class="empty-state">Loading...</div>
          } @else if (orders().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; stroke: #ccc">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 3v5h5M10 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              </div>
              <h3>Data Not Found</h3>
              <p>No pending samples for the selected time range.</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Tests</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td>{{ order.patientId }}</td>
                    <td>{{ order.tests?.length }} Tests</td>
                    <td>
                      <button class="btn btn-primary" (click)="markCollected(order.id)">Mark Accessioned</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-wrap { padding: var(--sp-6); max-width: 1200px; margin: 0 auto; }
      .page-header { margin-bottom: var(--sp-6); }
      .page-title { font-size: var(--text-2xl); font-weight: bold; margin: 0; }
      .search-bar { display: flex; gap: var(--sp-2); margin-bottom: var(--sp-6); }
      .form-control { flex: 1; padding: var(--sp-2) var(--sp-3); border: 1px solid var(--border-default); border-radius: var(--radius-md); outline: none; }
      .form-control:focus { border-color: var(--clr-primary-400); }
      .btn { padding: var(--sp-2) var(--sp-4); border-radius: var(--radius-md); cursor: pointer; border: none; font-weight: 500; }
      .btn-primary { background: var(--clr-primary-600); color: white; transition: background 0.2s; }
      .btn-primary:hover { background: var(--clr-primary-700); }
      .btn-secondary { background: var(--bg-surface); border: 1px solid var(--border-default); }
      
      .tabs-bar { display: flex; gap: var(--sp-4); margin-bottom: var(--sp-6); border-bottom: 1px solid var(--border-default); padding-bottom: var(--sp-4); }
      .tab-pill { padding: var(--sp-2) var(--sp-5); background: white; border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; color: var(--clr-neutral-600); font-weight: 500; font-size: 0.9rem; transition: all 0.2s; }
      .tab-pill.active { border-color: var(--clr-primary-600); color: var(--clr-primary-600); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      
      .card { background: white; border: 1px solid var(--border-default); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      .empty-state { padding: 4rem; text-align: center; color: var(--clr-neutral-500); }
      .empty-icon { margin-bottom: 1rem; }
      .empty-state h3 { color: var(--clr-neutral-800); margin: 0 0 0.5rem; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--border-default); text-align: left; }
      th { background: var(--bg-muted); font-size: 0.75rem; text-transform: uppercase; color: var(--clr-neutral-600); font-weight: 600; letter-spacing: 0.05em; }
    `
  ]
})
export class PendingAccession implements OnInit {
  private labApi = inject(LabApiService);
  
  orders = signal<any[]>([]);
  loading = signal(false);
  searchQuery = '';
  activeTab = 'sample';

  ngOnInit() {
    this.loadPendingOrders();
  }

  loadPendingOrders() {
    this.loading.set(true);
    this.labApi.listOrders({ status: 'ORDERED' }).subscribe({
      next: (res) => {
        this.orders.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
  
  markCollected(orderId: string) {
    this.labApi.updateOrder(orderId, { sampleCollected: true, status: 'SAMPLE_COLLECTED' }).subscribe({
      next: () => {
        window.alert('Sample marked as accessioned successfully!');
        this.loadPendingOrders();
      },
      error: (err) => {
        window.alert('Failed to mark accessioned. Please check console.');
        console.error(err);
      }
    });
  }
}
