import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PhlebotomistModel {
  id: string;
  name: string;
  employeeId?: string;
  phone?: string;
  email?: string;
  zone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  status: 'AVAILABLE' | 'ON_FIELD' | 'OFF_DUTY' | 'ON_LEAVE' | string;
  specialization?: string;
  maxDailyCapacity?: number;
  todayCollections?: number;
  rating?: number;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PhlebotomistApiService extends ApiService {
  list(): Observable<PhlebotomistModel[]> {
    return this.get<PhlebotomistModel[]>('phlebotomists');
  }

  getOne(id: string): Observable<PhlebotomistModel> {
    return this.get<PhlebotomistModel>(`phlebotomists/${id}`);
  }

  create(body: Partial<PhlebotomistModel>): Observable<PhlebotomistModel> {
    return this.post<PhlebotomistModel>('phlebotomists', body);
  }

  update(id: string, body: Partial<PhlebotomistModel>): Observable<PhlebotomistModel> {
    return this.http.put<PhlebotomistModel>(`${this.base}/phlebotomists/${id}`, body);
  }

  delete(id: string): Observable<any> {
    return this.del<any>(`phlebotomists/${id}`);
  }
}
