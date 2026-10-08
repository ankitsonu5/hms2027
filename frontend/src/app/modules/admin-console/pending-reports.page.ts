import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabApiService } from '../../core/services/lab-api.service';
import { PatientApiService } from '../../core/services/patient-api.service';
import { OrganizationApiService } from '../../core/services/organization-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-pending-reports',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .page-container {
        padding: 24px;
        background: #f8fafc;
        min-height: 100vh;
      }
      .summary-cards {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
      }
      .card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 24px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
      }
      .card-title {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 8px;
        font-weight: 500;
      }
      .card-value-group {
        display: flex;
        gap: 32px;
        width: 100%;
        justify-content: center;
      }
      .card-value {
        text-align: center;
      }
      .card-value .number {
        font-size: 24px;
        font-weight: 600;
        color: #1e293b;
      }
      .card-value .label {
        font-size: 13px;
        color: #64748b;
      }
      .card-icon {
        position: absolute;
        right: 24px;
        top: 50%;
        transform: translateY(-50%);
        color: #cbd5e1;
        width: 32px;
        height: 32px;
      }
      
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .toolbar-left {
        display: flex;
        gap: 16px;
        align-items: center;
        font-size: 13px;
        color: #475569;
      }
      .toolbar-right {
        display: flex;
        gap: 12px;
      }
      .btn {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-primary {
        background: #eab308;
        color: #fff;
        border: none;
      }
      .btn-primary:hover {
        background: #ca8a04;
      }
      .btn-outline {
        background: #fff;
        border: 1px solid #3b82f6;
        color: #3b82f6;
      }
      .btn-outline:hover {
        background: #eff6ff;
      }
      
      .table-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        background: #f8fafc;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }
      td {
        padding: 12px 16px;
        font-size: 13px;
        color: #334155;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      .test-name {
        color: #3b82f6;
        max-width: 300px;
        line-height: 1.4;
      }
      .btn-print-sm {
        background: #4f82d1;
        color: #fff;
        border: none;
        padding: 6px 16px;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
      }
      .btn-print-sm:hover {
        background: #3b6cb5;
      }

      /* Modal CSS */
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
        width: 95vw;
        height: 95vh;
        border-radius: 8px;
        display: flex;
        overflow: hidden;
      }
      .modal-left {
        flex: 1;
        background: #1e1e1e;
        display: flex;
        flex-direction: column;
      }
      .pdf-toolbar {
        height: 48px;
        background: #323639;
        display: flex;
        align-items: center;
        padding: 0 16px;
        color: #fff;
        gap: 16px;
      }
      .pdf-viewer {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        overflow-y: auto;
      }
      .pdf-page-mock {
        background: #fff;
        width: 60%;
        min-height: 80vh;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        padding: 40px;
        display: flex;
        flex-direction: column;
      }
      
      .modal-right {
        width: 350px;
        background: #fff;
        display: flex;
        flex-direction: column;
        border-left: 1px solid #e2e8f0;
      }
      .modal-right-header {
        padding: 16px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .patient-info {
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
        margin-bottom: 4px;
      }
      .bill-info {
        font-size: 13px;
        color: #64748b;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #64748b;
      }
      .modal-right-body {
        flex: 1;
        padding: 16px;
      }
      .modal-right-footer {
        padding: 16px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      /* WhatsApp Button */
      .btn-whatsapp {
        background: #25D366;
        color: #fff;
        border: none;
        display: flex;
        justify-content: center;
      }
      .btn-whatsapp:hover {
        background: #128C7E;
      }
      .btn-secondary {
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
        justify-content: center;
      }
      .btn-secondary:hover {
        background: #e2e8f0;
      }
      .btn-blue {
        background: #4f82d1;
        color: #fff;
        border: none;
        justify-content: center;
      }
      .btn-blue:hover {
        background: #3b6cb5;
      }
      
      .toggle-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 13px;
      }
      .switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
      }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider {
        position: absolute; cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #cbd5e1; transition: .4s;
        border-radius: 20px;
      }
      .slider:before {
        position: absolute; content: "";
        height: 16px; width: 16px; left: 2px; bottom: 2px;
        background-color: white; transition: .4s;
        border-radius: 50%;
      }
      input:checked + .slider { background-color: #3b82f6; }
      input:checked + .slider:before { transform: translateX(16px); }

      /* Print Styles */
      @media print {
        body * {
          visibility: hidden;
        }
        .pdf-page-mock, .pdf-page-mock * {
          visibility: visible !important;
        }
        .pdf-page-mock {
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          box-shadow: none;
          padding: 0;
          margin: 0;
          background: white;
          overflow: visible;
        }
        .modal-right, .pdf-toolbar, .toggle-row, .summary-cards, .toolbar, .table-card {
          display: none !important;
        }
      }
    `
  ],
  template: `
    <div class="page-container">
      <div class="summary-cards">
        <div class="card">
          <div class="card-title">Print Done</div>
          <div class="card-value-group">
            <div class="card-value">
              <div class="number">0</div>
              <div class="label">Patients</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Pending Prints Patients</div>
          <div class="card-value-group">
            <div class="card-value">
              <div class="number">{{ reports().length }}</div>
              <div class="label">Total</div>
            </div>
          </div>
          <svg class="card-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        
        <div class="card">
          <div class="card-title">Pending Prints Reports</div>
          <div class="card-value-group">
            <div class="card-value">
              <div class="number">{{ reports().length }}</div>
              <div class="label">Total</div>
            </div>
          </div>
          <svg class="card-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/></svg>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <label><input type="checkbox"> Select All</label>
          <label><input type="checkbox"> Select Top 100 Reports</label>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary">Print ▼</button>
          <button class="btn btn-outline">Download Reports ▼</button>
        </div>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Patient Name ▼</th>
              <th>Test Name ▼</th>
              <th>Org Name ▼</th>
              <th>Referral ▼</th>
              <th style="width: 80px"></th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr><td colspan="6" style="text-align: center;">Loading reports...</td></tr>
            }
            @for (report of reports(); track report.id) {
              <tr>
                <td><input type="checkbox"></td>
                <td style="font-weight: 500;">{{ report.patientName }}</td>
                <td class="test-name">{{ report.testName }}</td>
                <td>{{ report.orgName }}</td>
                <td>{{ report.referral }}</td>
                <td>
                  <button class="btn-print-sm" (click)="openPreview(report)">Print</button>
                </td>
              </tr>
            }
            @if (!loading() && reports().length === 0) {
              <tr><td colspan="6" style="text-align: center;">No pending reports found.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- PDF Preview Modal -->
      @if (selectedReport()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <div class="modal-left">
              <div class="toggle-row">
                <span>With letterhead</span>
                <label class="switch"><input type="checkbox"><span class="slider"></span></label>
              </div>
              
              <div class="pdf-toolbar">
                <span>≡</span>
                <span style="margin-left: 16px;">{{ selectedReport()?.patientName }}...</span>
                <span style="margin-left: 16px; background: #555; padding: 2px 8px; border-radius: 4px;">1 / 2</span>
                <span style="margin-left: 16px;">56%</span>
                <span style="margin-left: auto;">⟳</span>
                <span style="margin-left: 16px;">⬇</span>
                <span style="margin-left: 16px;">🖨</span>
                <span style="margin-left: 16px;">⋮</span>
              </div>
              
              <div class="pdf-viewer">
                <div class="pdf-page-mock">
                  <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 24px;">
                    Lab Report (Preview)
                  </div>
                  <table style="width: 100%; border: 1px solid #000; font-size: 12px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 4px; border: 1px solid #000;"><strong>NAME:</strong> {{ selectedReport()?.patientName }}</td>
                      <td style="padding: 4px; border: 1px solid #000;"><strong>REFERRED BY:</strong> {{ selectedReport()?.referral }}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px; border: 1px solid #000;"><strong>ORG:</strong> {{ selectedReport()?.orgName }}</td>
                      <td style="padding: 4px; border: 1px solid #000;"><strong>STATUS:</strong> {{ selectedReport()?.status }}</td>
                    </tr>
                  </table>
                  
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
                    <thead>
                      <tr style="border-bottom: 2px solid #000;">
                        <th style="text-align: left; padding: 4px;">Test Parameter</th>
                        <th style="text-align: left; padding: 4px;">Result</th>
                        <th style="text-align: left; padding: 4px;">Ref. Interval</th>
                      </tr>
                    </thead>
                    <tbody>
                      @if (loadingResults()) {
                        <tr><td colspan="3" style="text-align: center; padding: 16px;">Loading results...</td></tr>
                      } @else if (selectedReportResults().length === 0) {
                        <tr><td colspan="3" style="text-align: center; padding: 16px; color: #94a3b8;">No results entered yet.</td></tr>
                      } @else {
                        @for (test of selectedReport()?.orderTests; track $index) {
                          <tr>
                            <td style="padding: 4px;">{{ test.testName || test.name }}</td>
                            <td style="padding: 4px;">
                              <strong>{{ getResultValue(test.testId || test.id) }}</strong>
                              @if (isAbnormal(test.testId || test.id)) { <span style="color: red; font-weight: bold;"> (Abnormal)</span> }
                            </td>
                            <td style="padding: 4px;">{{ test.normalRange || '-' }}</td>
                          </tr>
                        }
                      }
                    </tbody>
                  </table>
                  
                  <div style="margin-top: auto; padding-top: 24px;">
                    <div style="font-family: cursive; font-size: 20px;">Signature</div>
                    <div style="font-size: 12px;">Dr. Consultant<br>Pathologist</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-right">
              <div class="modal-right-header">
                <div>
                  <div class="patient-info">{{ selectedReport()?.patientName }}</div>
                  <div class="bill-info">Age/Gender: {{ selectedReport()?.patientDetails?.age || '-' }} / {{ selectedReport()?.patientDetails?.gender || '-' }}</div>
                  <div class="bill-info" style="margin-top: 8px;">Lab Bill Id<br>{{ selectedReport()?.id | slice:0:8 }}</div>
                </div>
                <button class="close-btn" (click)="closePreview()">×</button>
              </div>
              
              <div class="modal-right-body">
                <!-- Additional patient info could go here -->
              </div>
              
              <div class="modal-right-footer">
                <!-- Standard action buttons -->
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-blue" style="flex: 1" (click)="printReport()">Submit and Print Done</button>
                  <button class="btn btn-blue" style="flex: 1" (click)="printReport()">Print Done</button>
                </div>
                
                <!-- WhatsApp specific actions as requested -->
                <button class="btn btn-whatsapp" (click)="sendOnWhatsapp()">
                  <svg style="width: 16px; height: 16px; margin-right: 8px;" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.066.381-.057c.106-.123.462-.531.587-.714.125-.183.25-.153.409-.093.159.061 1.004.474 1.177.561.173.087.289.13.332.202.043.073.043.423-.101.827z" />
                  </svg>
                  Send on WhatsApp
                </button>
                <button class="btn btn-secondary" (click)="printAndSendOnWhatsapp()">
                  <svg style="width: 16px; height: 16px; margin-right: 8px;" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.066.381-.057c.106-.123.462-.531.587-.714.125-.183.25-.153.409-.093.159.061 1.004.474 1.177.561.173.087.289.13.332.202.043.073.043.423-.101.827z" />
                  </svg>
                  Print & Send on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PendingReportsPage implements OnInit {
  private labApi = inject(LabApiService);
  private patientApi = inject(PatientApiService);
  private orgApi = inject(OrganizationApiService);

  reports = signal<any[]>([]);
  loading = signal(false);
  selectedReport = signal<any | null>(null);
  selectedReportResults = signal<any[]>([]);
  loadingResults = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    // Fetch all lab orders
    this.labApi.listOrders({ limit: 100 }).subscribe({
      next: (res) => {
        const orders = res.data || [];
        
        // Resolve patients and orgs for each order
        const reportPromises = orders.map(order => {
          const patientReq = order.patientId ? this.patientApi.getOne(order.patientId).pipe(catchError(() => of(null))) : of(null);
          const orgReq = order.organizationId ? this.orgApi.getOne(order.organizationId).pipe(catchError(() => of(null))) : of(null);
          
          return new Promise<any>((resolve) => {
            forkJoin([patientReq, orgReq]).subscribe(([patient, org]) => {
              const testNames = order.tests?.map((t: any) => t.testName || t.name).join(', ') || 'No tests';
              resolve({
                id: order.id,
                patientName: patient ? `${patient.firstName} ${patient.lastName}` : (order.patientId || 'Unknown'),
                patientDetails: patient,
                testName: testNames,
                orderTests: order.tests,
                orgName: org ? org.name : (order.organizationId || 'Walkin'),
                referral: order.orderedByDoctorName || 'Self',
                status: order.status
              });
            });
          });
        });

        Promise.all(reportPromises).then(formattedReports => {
          this.reports.set(formattedReports);
          this.loading.set(false);
        });
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openPreview(report: any) {
    this.selectedReport.set(report);
    this.loadingResults.set(true);
    
    // Fetch results for this order
    this.labApi.getResults(report.id).subscribe({
      next: (results) => {
        this.selectedReportResults.set(results || []);
        this.loadingResults.set(false);
      },
      error: () => {
        this.selectedReportResults.set([]);
        this.loadingResults.set(false);
      }
    });
  }

  getResultValue(testId: string): string {
    const res = this.selectedReportResults().find(r => r.testId === testId);
    return res ? res.value : '-';
  }

  isAbnormal(testId: string): boolean {
    const res = this.selectedReportResults().find(r => r.testId === testId);
    return res ? res.isAbnormal : false;
  }

  closePreview() {
    this.selectedReport.set(null);
    this.selectedReportResults.set([]);
  }

  printReport() {
    window.print();
  }

  sendOnWhatsapp() {
    const report = this.selectedReport();
    if (!report) return;
    
    const phone = report.patientDetails?.contactNumber || report.patientDetails?.mobile || report.patientDetails?.phone || '';
    if (!phone) {
      alert('This patient does not have a valid mobile number recorded.');
      return;
    }
    
    const text = encodeURIComponent(`Hello ${report.patientName}, your lab report is ready. Lab Bill ID: ${report.id.substring(0,8)}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  printAndSendOnWhatsapp() {
    this.printReport();
    this.sendOnWhatsapp();
  }
}
