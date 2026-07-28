import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

@Injectable({ providedIn: 'root' })
export class EmergencyApiService extends ApiService {
  list(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('emergency', q);
  }
  getOne(id: string | number): Observable<any> {
    return this.get<any>(`emergency/${id}`);
  }
  create(body: unknown): Observable<any> {
    return this.post<any>('emergency', body);
  }
  update(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`emergency/${id}`, body);
  }
  remove(id: string | number): Observable<any> {
    return this.del<any>(`emergency/${id}`);
  }
}
