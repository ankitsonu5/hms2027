import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagedRes<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const BASE = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected http = inject(HttpClient);
  protected base = BASE;
  protected get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let p = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') p = p.set(k, String(v));
      });
    return this.http.get<T>(`${this.base}/${path}`, { params: p });
  }
  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${path}`, body);
  }
  protected patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.base}/${path}`, body);
  }
  protected del<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}/${path}`);
  }
}
