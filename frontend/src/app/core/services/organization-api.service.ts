import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrganizationApiService extends ApiService {
  list(): Observable<any[]> {
    return this.get<any[]>('organizations');
  }
  getRates(id: string): Observable<any[]> {
    return this.get<any[]>(`organizations/${id}/rates`);
  }
  createOrg(body: any): Observable<any> {
    return this.post<any>('organizations', body);
  }
  upsertRate(id: string, body: any): Observable<any> {
    return this.http.put<any>(`${this.base}/organizations/${id}/rates`, body);
  }
}
