import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

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

  getResults(orderId: string | number): Observable<any> {
    return this.get<any>(`laboratory/orders/${orderId}/results`);
  }
  saveResult(orderId: string | number, body: unknown): Observable<any> {
    return this.post<any>(`laboratory/orders/${orderId}/results`, body);
  }
}
