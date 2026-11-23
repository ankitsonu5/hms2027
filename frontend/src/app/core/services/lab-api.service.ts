import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

export interface LabMaster {
  id: string;
  kind: 'UNIT' | 'SAMPLE_TYPE' | 'CATEGORY' | 'METHOD' | 'INSTRUMENT' | 'OUTSOURCE_CENTER';
  name: string;
  sortOrder: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class LabApiService extends ApiService {
  listTests(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('laboratory/tests', q);
  }
  createTest(body: unknown): Observable<any> {
    return this.post<any>('laboratory/tests', body);
  }
  updateTest(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`laboratory/tests/${id}`, body);
  }
  restoreTest(id: string | number): Observable<any> {
    return this.post<any>(`laboratory/tests/${id}/restore`, {});
  }
  deleteTest(id: string): Observable<any> {
    return this.del<any>(`laboratory/tests/${id}`);
  }

  // ── Test master: definitions with parameters and normal values ─────────────
  getTestDefinition(id: string): Observable<any> {
    return this.get<any>(`laboratory/tests/${id}`);
  }
  createTestDefinition(body: unknown): Observable<any> {
    return this.post<any>('laboratory/test-definitions', body);
  }
  updateTestDefinition(id: string, body: unknown): Observable<any> {
    return this.http.put<any>(`${this.base}/laboratory/test-definitions/${id}`, body);
  }
  duplicateTest(id: string): Observable<any> {
    return this.post<any>(`laboratory/tests/${id}/duplicate`, {});
  }
  saveParameterRanges(parameterId: string, ranges: unknown[]): Observable<any> {
    return this.http.put<any>(`${this.base}/laboratory/parameters/${parameterId}/ranges`, { ranges });
  }

  // ── Test master: lookup lists ──────────────────────────────────────────────
  listMasters(kind?: string): Observable<LabMaster[]> {
    return this.get<LabMaster[]>('laboratory/masters', kind ? { kind } : undefined);
  }
  createMaster(kind: string, name: string, sortOrder?: number): Observable<LabMaster> {
    return this.post<LabMaster>('laboratory/masters', { kind, name, sortOrder });
  }
  updateMaster(id: string, body: Partial<LabMaster>): Observable<LabMaster> {
    return this.patch<LabMaster>(`laboratory/masters/${id}`, body);
  }
  deleteMaster(id: string): Observable<any> {
    return this.del<any>(`laboratory/masters/${id}`);
  }
  seedStandardTests(): Observable<{ created: string[]; skipped: string[] }> {
    return this.post<any>('laboratory/masters/seed-standard', {});
  }

  listOrders(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('laboratory/orders', q);
  }
  getOrder(id: string | number): Observable<any> {
    return this.get<any>(`laboratory/orders/${id}`);
  }
  createOrder(body: unknown): Observable<any> {
    return this.post<any>('laboratory/orders', body);
  }
  updateOrder(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`laboratory/orders/${id}`, body);
  }
  deleteOrder(id: string | number): Observable<any> {
    return this.del<any>(`laboratory/orders/${id}`);
  }

  // ── Result entry & report ──────────────────────────────────────────────────
  getWorksheet(orderId: string): Observable<any> {
    return this.get<any>(`laboratory/orders/${orderId}/worksheet`);
  }
  saveOrderResults(orderId: string, body: { results: any[]; approve?: boolean }): Observable<any> {
    return this.http.put<any>(`${this.base}/laboratory/orders/${orderId}/results`, body);
  }
  approveReport(orderId: string, approve: boolean): Observable<any> {
    return this.post<any>(`laboratory/orders/${orderId}/approve`, { approve });
  }
  markReportPrinted(orderId: string): Observable<any> {
    return this.post<any>(`laboratory/orders/${orderId}/printed`, {});
  }
  getReportSettings(): Observable<any> {
    return this.get<any>('laboratory/report-settings');
  }
  updateReportSettings(body: unknown): Observable<any> {
    return this.http.put<any>(`${this.base}/laboratory/report-settings`, body);
  }

  getResults(orderId: string | number): Observable<any> {
    return this.get<any>(`laboratory/orders/${orderId}/results`);
  }
  saveResult(orderId: string | number, body: unknown): Observable<any> {
    return this.post<any>(`laboratory/orders/${orderId}/results`, body);
  }
}
