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
  deleteWard(id: string | number): Observable<any> {
    return this.del<any>(`ipd/wards/${id}`);
  }

  listBeds(q?: Record<string, any>): Observable<any[]> {
    return this.get<any[]>('ipd/beds', q);
  }
  createBed(body: unknown): Observable<any> {
    return this.post<any>('ipd/beds', body);
  }
  updateBedStatus(id: string | number, status: string): Observable<any> {
    return this.patch<any>(`ipd/beds/${id}/status`, { status });
  }
  deleteBed(id: string | number): Observable<any> {
    return this.del<any>(`ipd/beds/${id}`);
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
  transferBed(
    id: string | number,
    body: { targetWardId: string; targetBedId: string; reason?: string },
  ): Observable<any> {
    return this.post<any>(`ipd/admissions/${id}/transfer`, body);
  }
  addVitals(id: string | number, body: any): Observable<any> {
    return this.post<any>(`ipd/admissions/${id}/vitals`, body);
  }
  addClinicalNote(id: string | number, body: any): Observable<any> {
    return this.post<any>(`ipd/admissions/${id}/notes`, body);
  }
  discharge(
    id: string | number,
    body?: { dischargeSummary?: string; dischargeCondition?: string },
  ): Observable<any> {
    return this.post<any>(`ipd/admissions/${id}/discharge`, body || {});
  }
  getAdmissionBill(admissionId: string | number): Observable<any> {
    return this.get<any>(`ipd/admissions/${admissionId}/bill`);
  }
  updateAdmissionBill(admissionId: string | number, body: any): Observable<any> {
    return this.patch<any>(`ipd/admissions/${admissionId}/bill`, body);
  }
}
