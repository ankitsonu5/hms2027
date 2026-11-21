import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Department {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'CLINICAL' | 'SURGICAL' | 'CRITICAL_CARE' | 'EMERGENCY' | 'DIAGNOSTIC' | 'SUPPORT';
  headOfDepartment: string;
  location: string;
  floor?: string;
  extension?: string;
  phone?: string;
  email?: string;
  totalDoctors: number;
  totalBeds?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentApiService extends ApiService {
  list(params?: { search?: string; type?: string; status?: string }): Observable<Department[]> {
    return this.get<Department[]>('departments', params);
  }

  getOne(id: string): Observable<Department> {
    return this.get<Department>(`departments/${id}`);
  }

  create(data: Partial<Department>): Observable<Department> {
    return this.post<Department>('departments', data);
  }

  update(id: string, data: Partial<Department>): Observable<Department> {
    return this.patch<Department>(`departments/${id}`, data);
  }

  toggleStatus(id: string): Observable<Department> {
    return this.patch<Department>(`departments/${id}/toggle-status`, {});
  }

  remove(id: string): Observable<{ success: boolean; id: string }> {
    return this.del<{ success: boolean; id: string }>(`departments/${id}`);
  }
}
