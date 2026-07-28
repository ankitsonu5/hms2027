import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

@Injectable({ providedIn: 'root' })
export class PharmacyApiService extends ApiService {
  listDrugs(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('pharmacy/drugs', q);
  }
  getDrug(id: string | number): Observable<any> {
    return this.get<any>(`pharmacy/drugs/${id}`);
  }
  createDrug(body: unknown): Observable<any> {
    return this.post<any>('pharmacy/drugs', body);
  }
  updateDrug(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`pharmacy/drugs/${id}`, body);
  }

  getBatches(drugId: string | number): Observable<any> {
    return this.get<any>(`pharmacy/drugs/${drugId}/batches`);
  }
  addBatch(body: unknown): Observable<any> {
    return this.post<any>('pharmacy/batches', body);
  }

  listSales(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('pharmacy/sales', q);
  }
  createSale(body: unknown): Observable<any> {
    return this.post<any>('pharmacy/sales', body);
  }
}
