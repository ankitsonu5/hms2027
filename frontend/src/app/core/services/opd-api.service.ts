import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedRes } from './api.service';

@Injectable({ providedIn: 'root' })
export class OpdApiService extends ApiService {
  list(q?: Record<string, any>): Observable<PagedRes<any>> {
    return this.get<PagedRes<any>>('opd', q);
  }
  getOne(id: string | number): Observable<any> {
    return this.get<any>(`opd/${id}`);
  }
  create(body: unknown): Observable<any> {
    return this.post<any>('opd', body);
  }
  update(id: string | number, body: unknown): Observable<any> {
    return this.patch<any>(`opd/${id}`, body);
  }
  remove(id: string | number): Observable<any> {
    return this.del<any>(`opd/${id}`);
  }
}
