import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabApiService } from '../../../core/services/lab-api.service';

@Component({
  selector: 'app-accessed',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Accessed</h1>
      </div>
      
      <div class="search-bar">
        <input type="text" class="form-control" placeholder="Select by Patient Id / Patient Name / Accession Number / Bill Id / Order Id / National ID" [(ngModel)]="searchQuery" (keyup.enter)="loadAccessedOrders()">
        <button class="btn btn-secondary" (click)="loadAccessedOrders()">Search</button>
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
              <p>No accessed samples found.</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox"></th>
                  <th>Accession Id</th>
                  <th>Patient Details</th>
                  <th>Tests</th>
                  <th>Sample</th>
                  <th>Billing Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td><input type="checkbox"></td>
                    <td>{{ order.id | slice:0:10 }}</td>
                    <td>
                      <div><strong>{{ order.patientId }}</strong></div>
                      <div class="text-muted" style="font-size: 0.8em;">(ID: {{ order.patientId }})</div>
                    </td>
                    <td>
                      @for (test of order.tests; track test.testId) {
                        <div>{{ test.testName }}</div>
                      }
                    </td>
                    <td>
                      <span class="sample-dot"></span> Serum
                    </td>
                    <td>{{ order.createdAt | date: 'dd MMM, hh:mm a' }}</td>
                    <td>
                      <div class="actions">
                        <button class="btn btn-secondary btn-sm" (click)="alert('Redraw requested')">Redraw</button>
                        <button class="btn btn-primary btn-sm" (click)="printBarcode(order)">Print Barcode</button>
                        <button class="btn btn-primary btn-sm" (click)="printReport(order)">Print</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>

    <!-- Hidden Print Wrapper -->
    <div class="print-wrapper" [attr.data-print-mode]="printMode()">
      @if (activePrintOrder()) {
        <!-- Barcode Print Mode -->
        <div class="print-barcode">
          <div class="barcode-label" style="text-align: center; margin-top: 50px;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">{{ activePrintOrder().patientId }}</div>
            <img [src]="'https://bwipjs-api.metafloor.com/?bcid=code128&text=' + (activePrintOrder().id | slice:0:8) + '&scale=3&includetext=true'" alt="Barcode" style="max-height: 80px;" />
            <div style="font-size: 10px; margin-top: 4px;">Date: {{ activePrintOrder().createdAt | date:'short' }}</div>
          </div>
        </div>

        <!-- Report Print Mode -->
        <div class="print-report">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2>Test Report</h2>
            <p>Accession ID: {{ activePrintOrder().id }}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong>Patient Details:</strong>
            <p>ID: {{ activePrintOrder().patientId }}</p>
            <p>Billing Date: {{ activePrintOrder().createdAt | date: 'medium' }}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr>
                <th style="border-bottom: 2px solid #000; padding: 8px;">Test Name</th>
                <th style="border-bottom: 2px solid #000; padding: 8px;">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (test of activePrintOrder().tests; track test.testId) {
                <tr>
                  <td style="border-bottom: 1px solid #ccc; padding: 8px;">{{ test.testName }}</td>
                  <td style="border-bottom: 1px solid #ccc; padding: 8px;">Accessed</td>
                </tr>
              }
            </tbody>
          </table>
          
          <div style="margin-top: 50px; text-align: right;">
            <p>___________________</p>
            <p>Authorized Signatory</p>
          </div>
        </div>
      }
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
      .btn-secondary { background: var(--bg-surface); border: 1px solid var(--border-default); transition: background 0.2s; }
      .btn-secondary:hover { background: var(--bg-muted); }
      .btn-sm { padding: var(--sp-1) var(--sp-2); font-size: 0.8rem; }
      
      .card { background: white; border: 1px solid var(--border-default); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      .empty-state { padding: 4rem; text-align: center; color: var(--clr-neutral-500); }
      .empty-icon { margin-bottom: 1rem; }
      .empty-state h3 { color: var(--clr-neutral-800); margin: 0 0 0.5rem; }
      
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--border-default); text-align: left; }
      th { background: var(--bg-muted); font-size: 0.75rem; text-transform: uppercase; color: var(--clr-neutral-600); font-weight: 600; letter-spacing: 0.05em; }
      .text-muted { color: var(--clr-neutral-500); }
      .sample-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #d32f2f; margin-right: 4px; }
      .actions { display: flex; gap: 4px; }

      /* Print Styles */
      @media screen {
        .print-wrapper { display: none; }
      }
      
      @media print {
        .page-wrap { display: none !important; }
        .print-wrapper { display: block !important; width: 100%; }
        
        .print-wrapper[data-print-mode="barcode"] .print-report { display: none !important; }
        .print-wrapper[data-print-mode="report"] .print-barcode { display: none !important; }
      }
    `
  ]
})
export class Accessed implements OnInit {
  private labApi = inject(LabApiService);
  
  orders = signal<any[]>([]);
  loading = signal(false);
  searchQuery = '';

  activePrintOrder = signal<any>(null);
  printMode = signal<'barcode' | 'report' | 'none'>('none');

  ngOnInit() {
    this.loadAccessedOrders();
  }

  loadAccessedOrders() {
    this.loading.set(true);
    // Fetch orders that are SAMPLE_COLLECTED or higher
    this.labApi.listOrders({ status: 'SAMPLE_COLLECTED' }).subscribe({
      next: (res) => {
        this.orders.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  printBarcode(order: any) {
    this.activePrintOrder.set(order);
    this.printMode.set('barcode');
    // Wait for the remote barcode image to load
    setTimeout(() => {
      window.print();
      this.printMode.set('none');
    }, 800);
  }

  printReport(order: any) {
    this.activePrintOrder.set(order);
    this.printMode.set('report');
    setTimeout(() => {
      window.print();
      this.printMode.set('none');
    }, 800);
  }

  alert(msg: string) {
    window.alert(msg);
  }
}
