import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

@Injectable({ providedIn: 'root' })
export class BillingApiService extends ApiService {
  list(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('billing', q);
  }
  getOne(id: string | number): Observable<any> {
    return this.get<any>(`billing/${id}`);
  }
  create(body: unknown): Observable<any> {
    return this.post<any>('billing', body);
  }
  update(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`billing/${id}`, body);
  }
  addPayment(id: string | number, body: unknown): Observable<any> {
    return this.post<any>(`billing/${id}/payments`, body);
  }
  cancel(id: string | number): Observable<any> {
    return this.del<any>(`billing/${id}`);
  }
}
