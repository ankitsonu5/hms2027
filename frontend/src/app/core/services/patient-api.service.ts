import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

@Injectable({ providedIn: 'root' })
export class PatientApiService extends ApiService {
  list(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('patients', q);
  }
  getOne(id: string | number): Observable<any> {
    return this.get<any>(`patients/${id}`);
  }
  search(uhid: string): Observable<any> {
    return this.get<any>('patients/search', { uhid });
  }
  create(body: unknown): Observable<any> {
    return this.post<any>('patients', body);
  }
  update(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`patients/${id}`, body);
  }
  remove(id: string | number): Observable<any> {
    return this.del<any>(`patients/${id}`);
  }
}
