import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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

export interface OverviewResponse {
  rangeMonths: number;
  generatedAt: string;
  org: { name: string; email: string };
  finance: { total: number; paid: number; due: number; series: MonthPoint[] };
  collections: { total: number; byMode: { mode: string; amount: number }[] };
  patients: { total: number; series: PatientMonthPoint[] };
  /** No rating is captured anywhere in the schema — surfaced so the UI can show an honest empty state. */
  rating: { available: false; reason: string };
  financeExceptions: { total: number; buckets: Bucket[] };
  operationExceptions: { total: number; buckets: Bucket[] };
  logins: { total: number; scope: string; byRole: Bucket[] };
}

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async overview(tenantId: string, months = 12): Promise<OverviewResponse> {
    const span = Math.min(Math.max(months, 1), 36);

    const [org, finance, collections, patients, financeExc, operationExc, logins] = await Promise.all([
      this.org(tenantId),
      this.finance(tenantId, span),
      this.collections(tenantId, span),
      this.patients(tenantId, span),
      this.financeExceptions(tenantId),
      this.operationExceptions(tenantId),
      this.logins(tenantId),
    ]);

    return {
      rangeMonths: span,
      generatedAt: new Date().toISOString(),
      org,
      finance,
      collections,
      patients,
      rating: {
        available: false,
        reason: 'No patient-rating field exists in the schema yet.',
      },
      financeExceptions: financeExc,
      operationExceptions: operationExc,
      logins,
    };
  }

  /** Organisation identity for the page header. */
  private async org(tenantId: string) {
    const [r] = await this.db.query(
      `select name, email from tenants where id = $1::uuid`,
      [tenantId],
    );
    return { name: r?.name ?? 'Hospital', email: r?.email ?? '' };
  }

  /** Month spine so empty months still render as gaps rather than collapsing the axis. */
  private monthSpine(span: number): string {
    return `
      select to_char(d, 'YYYY-MM') as month
      from generate_series(
        date_trunc('month', now()) - make_interval(months => ${span - 1}),
        date_trunc('month', now()),
        interval '1 month'
      ) d
    `;
  }

  private async finance(tenantId: string, span: number) {
    const rows = await this.db.query(
      `
      with months as (${this.monthSpine(span)})
      select m.month,
             coalesce(sum(b."paidAmount"), 0)::float    as paid,
             coalesce(sum(b."balanceAmount"), 0)::float as due
      from months m
      left join bills b
        on to_char(b."billDate"::date, 'YYYY-MM') = m.month
       and b."tenantId" = $1
       and b."isActive" = true
       and b.status <> 'CANCELLED'
      group by m.month
      order by m.month
      `,
      [tenantId],
    );

    const series: MonthPoint[] = rows.map((r: any) => ({
      month: r.month,
      paid: Number(r.paid),
      due: Number(r.due),
    }));

    const paid = series.reduce((s, r) => s + r.paid, 0);
    const due = series.reduce((s, r) => s + r.due, 0);
    return { total: paid + due, paid, due, series };
  }

  private async collections(tenantId: string, span: number) {
    const rows = await this.db.query(
      `
      select "paymentMode"::text            as mode,
             coalesce(sum(amount), 0)::float as amount
      from payments
      where "tenantId" = $1
        and "isActive" = true
        and "paymentDate" >= date_trunc('month', now()) - make_interval(months => $2::int)
      group by 1
      order by 2 desc
      `,
      [tenantId, span - 1],
    );

    const byMode = rows.map((r: any) => ({ mode: r.mode, amount: Number(r.amount) }));
    return { total: byMode.reduce((s, r) => s + r.amount, 0), byMode };
  }

  /**
   * "New" = registered that month. "Repeat" = had an OPD visit that month but
   * registered in an earlier month.
   */
  private async patients(tenantId: string, span: number) {
    const rows = await this.db.query(
      `
      with months as (${this.monthSpine(span)})
      select m.month,
        (select count(*) from patients p
          where p."tenantId" = $1 and p."isActive" = true
            and to_char(p."createdAt", 'YYYY-MM') = m.month)::int as fresh,
        (select count(distinct e."patientId") from opd_encounters e
          join patients p2 on p2.id::text = e."patientId"
          where e."tenantId" = $1 and e."isActive" = true
            and to_char(e."visitDate"::date, 'YYYY-MM') = m.month
            and to_char(p2."createdAt", 'YYYY-MM') < m.month)::int as repeat
      from months m
      order by m.month
      `,
      [tenantId],
    );

    const series: PatientMonthPoint[] = rows.map((r: any) => ({
      month: r.month,
      fresh: Number(r.fresh),
      repeat: Number(r.repeat),
    }));

    return { total: series.reduce((s, r) => s + r.fresh + r.repeat, 0), series };
  }

  private async financeExceptions(tenantId: string) {
    const [r] = await this.db.query(
      `
      select
        (select count(*) from bills
          where "tenantId" = $1 and status = 'CANCELLED')::int as cancelled,
        (select count(*) from payments
          where "tenantId" = $1 and "isActive" = false)::int as reversed,
        (select count(*) from bills
          where "tenantId" = $1 and status = 'DRAFT'
            and "createdAt" < now() - interval '7 days')::int as stale
      `,
      [tenantId],
    );

    const buckets: Bucket[] = [
      { label: 'Cancelled bills', count: Number(r.cancelled) },
      { label: 'Reversed payments', count: Number(r.reversed) },
      { label: 'Stale drafts (7d+)', count: Number(r.stale) },
    ];
    return { total: buckets.reduce((s, b) => s + b.count, 0), buckets };
  }

  private async operationExceptions(tenantId: string) {
    const [r] = await this.db.query(
      `
      select
        (select count(*) from lab_orders
          where "tenantId" = $1 and "isActive" = false)::int as cancelled,
        (select count(*) from lab_orders
          where "tenantId" = $1 and "isActive" = true
            and "sampleCollected" = false and status = 'ORDERED'
            and "createdAt" < now() - interval '1 day')::int as sample_pending,
        (select count(*) from lab_orders
          where "tenantId" = $1 and "isActive" = true
            and status = 'IN_PROGRESS'
            and "updatedAt" < now() - interval '1 day')::int as result_overdue
      `,
      [tenantId],
    );

    const buckets: Bucket[] = [
      { label: 'Cancelled orders', count: Number(r.cancelled) },
      { label: 'Sample pending 24h+', count: Number(r.sample_pending) },
      { label: 'Result overdue 24h+', count: Number(r.result_overdue) },
    ];
    return { total: buckets.reduce((s, b) => s + b.count, 0), buckets };
  }

  /** Distinct users whose lastLoginAt lands today, split by role. */
  private async logins(tenantId: string) {
    const rows = await this.db.query(
      `
      select r.role::text as label, count(*)::int as count
      from users u, unnest(u.roles) as r(role)
      where u."tenantId" = $1::uuid
        and u."lastLoginAt"::date = current_date
      group by 1
      order by 2 desc
      `,
      [tenantId],
    );

    const byRole: Bucket[] = rows.map((r: any) => ({
      label: r.label,
      count: Number(r.count),
    }));
    return { total: byRole.reduce((s, b) => s + b.count, 0), scope: 'today', byRole };
  }
}
