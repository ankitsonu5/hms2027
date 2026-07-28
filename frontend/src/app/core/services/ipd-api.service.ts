import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

@Injectable({ providedIn: 'root' })
export class IpdApiService extends ApiService {
  listWards(): Observable<any[]> {
    return this.get<any[]>('ipd/wards');
  }
  createWard(body: unknown): Observable<any> {
    return this.post<any>('ipd/wards', body);
  }

  listBeds(q?: Record<string, any>): Observable<any[]> {
    return this.get<any[]>('ipd/beds', q);
  }

  listAdmissions(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('ipd/admissions', q);
  }
  getAdmission(id: string | number): Observable<any> {
    return this.get<any>(`ipd/admissions/${id}`);
  }
  createAdmission(body: unknown): Observable<any> {
    return this.post<any>('ipd/admissions', body);
  }
  updateAdmission(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`ipd/admissions/${id}`, body);
  }
  discharge(id: string | number): Observable<any> {
    return this.post<any>(`ipd/admissions/${id}/discharge`, {});
  }
}
