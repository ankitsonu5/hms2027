import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const BASE = 'http://localhost:3000/api/v1';

export interface MonthPoint {
  month: string;
  paid: number;
  due: number;
}

export interface PatientMonthPoint {
  month: string;
  fresh: number;
  repeat: number;
}

export interface Bucket {
  label: string;
  count: number;
}

export interface Overview {
  rangeMonths: number;
  generatedAt: string;
  org: { name: string; email: string };
  finance: { total: number; paid: number; due: number; series: MonthPoint[] };
  collections: { total: number; byMode: { mode: string; amount: number }[] };
  patients: { total: number; series: PatientMonthPoint[] };
  rating: { available: boolean; reason: string };
  financeExceptions: { total: number; buckets: Bucket[] };
  operationExceptions: { total: number; buckets: Bucket[] };
  logins: { total: number; scope: string; byRole: Bucket[] };
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private http = inject(HttpClient);

  overview(months = 12) {
    return this.http.get<Overview>(`${BASE}/reports/overview`, { params: { months } });
  }
}
