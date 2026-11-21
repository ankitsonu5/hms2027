import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../api-base';

@Injectable({ providedIn: 'root' })
export class ClinicianService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/clinicians`;

  getClinicians(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createClinician(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateClinician(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteClinician(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
