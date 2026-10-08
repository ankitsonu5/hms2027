import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabApiService } from '../../core/services/lab-api.service';

@Component({
  selector: 'app-cancelled-tests',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .page-container {
        padding: 24px;
        background: #f8fafc;
        min-height: 100vh;
      }
      .page-header {
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }
      .rows-count {
        font-size: 13px;
        font-weight: 600;
        color: #000;
        margin-bottom: 12px;
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
        background: #f1f5f9;
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
      }
      
      .group-row td {
        background: #f8fafc;
        font-weight: 500;
        color: #475569;
        cursor: pointer;
      }
      .accordion-icon {
        display: inline-block;
        margin-right: 8px;
        color: #64748b;
        transition: transform 0.2s;
      }
      .group-row.open .accordion-icon {
        transform: rotate(90deg);
      }

      .test-name {
        padding-left: 32px !important;
      }

      .btn-outline {
        background: #fff;
        border: 1px solid #3b82f6;
        color: #3b82f6;
        padding: 4px 16px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      .btn-outline:hover {
        background: #eff6ff;
      }
      .filter-icon {
        color: #94a3b8;
        margin-left: 4px;
      }
    `
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Cancelled Tests</h1>
      </div>

      <div class="rows-count">Rows: {{ totalCount() }}</div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Test Name <span class="filter-icon">▼</span></th>
              <th>Price (₹) <span class="filter-icon">▼</span></th>
              <th>Action <span class="filter-icon">▼</span></th>
            </tr>
          </thead>
          <tbody>
            @for (group of groupedData(); track group.category) {
              <tr class="group-row" [class.open]="group.expanded" (click)="group.expanded = !group.expanded">
                <td colspan="3">
                  <span class="accordion-icon">▶</span>
                  {{ group.category || 'UNCATEGORIZED' }} ({{ group.tests.length }})
                </td>
              </tr>
              @if (group.expanded) {
                @for (test of group.tests; track test.id) {
                  <tr>
                    <td class="test-name">{{ test.name }}</td>
                    <td>₹ {{ test.price }}</td>
                    <td>
                      <button class="btn-outline" (click)="restoreTest(test.id)">Enable</button>
                    </td>
                  </tr>
                }
              }
            }
            @if (groupedData().length === 0) {
              <tr>
                <td colspan="3" style="text-align: center; padding: 24px; color: #64748b;">No cancelled tests found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CancelledTestsPage implements OnInit {
  groupedData = signal<{ category: string, expanded: boolean, tests: any[] }[]>([]);
  totalCount = signal(0);

  constructor(private labApi: LabApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.labApi.listTests({ isActive: false, limit: 1000 }).subscribe(res => {
      this.totalCount.set(res.total);
      
      const tests = res.data || [];
      const grouped = tests.reduce((acc: any, test: any) => {
        const cat = test.category || 'UNCATEGORIZED';
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(test);
        return acc;
      }, {});

      const result = Object.keys(grouped).map(cat => ({
        category: cat,
        expanded: true,
        tests: grouped[cat]
      })).sort((a, b) => a.category.localeCompare(b.category));

      this.groupedData.set(result);
    });
  }

  restoreTest(id: string) {
    if (confirm('Are you sure you want to restore this test?')) {
      this.labApi.restoreTest(id).subscribe(() => {
        this.loadData();
      });
    }
  }
}
