import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface StatCard {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  iconPath: string;
  bg: string;
  fg: string;
}

interface ModuleTile {
  label: string;
  sub: string;
  route: string;
  iconPath: string;
  bg: string;
  fg: string;
}

@Component({
  selector: 'hms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- ── Header ── -->
    <div class="dash-header">
      <div>
        <h3 class="dash-title">Good morning, {{ userName }} 👋</h3>
        <p class="dash-date">{{ today }}</p>
      </div>
      <button class="btn btn-secondary btn-sm" (click)="auth.logout()">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>

    <!-- ── Stat Cards ── -->
    <div class="stat-grid">
      @for (card of stats; track card.label) {
        <div class="stat-card" [style.--fg]="card.fg" [style.--bg]="card.bg">
          <div class="stat-top">
            <div class="stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path [attr.d]="card.iconPath" />
              </svg>
            </div>
            @if (card.delta) {
              <span class="stat-delta" [class.up]="card.deltaUp" [class.dn]="!card.deltaUp">
                {{ card.deltaUp ? '▲' : '▼' }} {{ card.delta }}
              </span>
            }
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ card.value }}</span>
            <span class="stat-label">{{ card.label }}</span>
          </div>
        </div>
      }
    </div>

    <!-- ── Module Shortcuts ── -->
    <section>
      <h6 class="section-title">Quick Access</h6>
      <div class="module-grid">
        @for (tile of modules; track tile.route) {
          <a
            class="module-tile"
            [routerLink]="tile.route"
            [style.--fg]="tile.fg"
            [style.--bg]="tile.bg"
          >
            <div class="module-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path [attr.d]="tile.iconPath" />
              </svg>
            </div>
            <div class="module-meta">
              <span class="module-name">{{ tile.label }}</span>
              <span class="module-sub">{{ tile.sub }}</span>
            </div>
            <svg
              class="module-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </a>
        }
      </div>
    </section>

    <!-- ── Bottom two-col ── -->
    <div class="bottom-grid">
      <!-- OPD Queue -->
      <section class="card">
        <div class="card__head">
          <div class="card-head-left">
            <div class="card-icon" style="--ci-bg:#dbeafe;--ci-fg:#2563eb">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h6 class="card__title">Today's OPD Queue</h6>
          </div>
          <span class="badge badge-info">{{ appointments.length }} patients</span>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (apt of appointments; track apt.token) {
                <tr>
                  <td>
                    <span class="token-chip">{{ apt.token }}</span>
                  </td>
                  <td>
                    <div class="patient-cell">
                      <div class="avatar">{{ apt.initials }}</div>
                      <div>
                        <div class="col-primary">{{ apt.name }}</div>
                        <div class="meta">{{ apt.age }}y · {{ apt.gender }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ apt.doctor }}</td>
                  <td>
                    <span class="badge" [ngClass]="badgeClass(apt.statusColor)">{{
                      apt.status
                    }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Bed Occupancy -->
      <section class="card">
        <div class="card__head">
          <div class="card-head-left">
            <div class="card-icon" style="--ci-bg:#fef9c3;--ci-fg:#ca8a04">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 4v16M22 20H2M18 8H6a2 2 0 0 0-2 2v6h16v-6a2 2 0 0 0-2-2z" />
                <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h6 class="card__title">Bed Occupancy</h6>
          </div>
          <span class="badge badge-warning">78% full</span>
        </div>
        <div class="ward-list">
          @for (ward of wards; track ward.name) {
            <div class="ward-row">
              <div class="ward-meta">
                <span class="ward-name">{{ ward.name }}</span>
                <span class="ward-count">{{ ward.occupied }}/{{ ward.total }}</span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="(ward.occupied / ward.total) * 100"
                  [class.warn]="
                    ward.occupied / ward.total > 0.75 && ward.occupied / ward.total <= 0.9
                  "
                  [class.crit]="ward.occupied / ward.total > 0.9"
                ></div>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
      }

      /* ── Header ── */
      .dash-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .dash-title {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      .dash-date {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      /* ── Stat Cards ── */
      .stat-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-4);
      }
      .stat-card {
        flex: 1 1 260px;
        min-width: 0;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-left: 4px solid var(--fg);
        border-radius: var(--radius-xl);
        padding: var(--sp-4);
        box-shadow: var(--shadow-xs);
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        position: relative;
        overflow: hidden;
      }
      .stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        flex-shrink: 0;
        background: var(--bg);
        color: var(--fg);
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          width: 22px;
          height: 22px;
          overflow: visible;
        }
      }
      .stat-delta {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: var(--radius-full);
        white-space: nowrap;
        flex-shrink: 0;
        &.up {
          background: var(--clr-success-100);
          color: var(--clr-success-600);
        }
        &.dn {
          background: var(--clr-danger-100);
          color: var(--clr-danger-600);
        }
      }
      .stat-body {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .stat-value {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1;
      }
      .stat-label {
        font-family: var(--font-label);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      /* ── Module Grid ── */
      .section-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--sp-4);
      }
      .module-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: var(--sp-3);
      }
      .module-tile {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        padding: var(--sp-4) var(--sp-5);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        text-decoration: none;
        box-shadow: var(--shadow-xs);
        transition: all var(--transition-fast);
        &:hover {
          border-color: var(--fg);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          .module-icon {
            background: var(--fg);
            color: #fff;
          }
          .module-arrow {
            color: var(--fg);
            transform: translateX(3px);
          }
        }
      }
      .module-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        flex-shrink: 0;
        background: var(--bg);
        color: var(--fg);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
        svg {
          width: 24px;
          height: 24px;
          overflow: visible;
        }
      }
      .module-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .module-name {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
      }
      .module-sub {
        font-size: var(--text-xs);
        color: var(--text-muted);
      }
      .module-arrow {
        width: 16px;
        height: 16px;
        color: var(--border-strong);
        flex-shrink: 0;
        transition: all var(--transition-fast);
      }

      /* ── Bottom grid ── */
      .bottom-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-6);
      }
      @media (max-width: 1100px) {
        .bottom-grid {
          grid-template-columns: 1fr;
        }
      }

      /* ── Card ── */
      .card-head-left {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }
      .card-icon {
        width: 34px;
        height: 34px;
        border-radius: var(--radius-md);
        flex-shrink: 0;
        background: var(--ci-bg);
        color: var(--ci-fg);
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          width: 17px;
          height: 17px;
          overflow: visible;
        }
      }

      /* ── Table ── */
      .token-chip {
        font-family: var(--font-display);
        font-size: var(--text-xs);
        font-weight: 700;
        color: var(--clr-primary-600);
        background: var(--clr-primary-50);
        padding: 2px 8px;
        border-radius: 4px;
      }
      .patient-cell {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: var(--clr-neutral-200);
        color: var(--clr-neutral-700);
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .meta {
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      /* ── Ward / Progress ── */
      .ward-list {
        padding: var(--sp-4) var(--sp-5);
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
      }
      .ward-row {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
      }
      .ward-meta {
        display: flex;
        justify-content: space-between;
      }
      .ward-name {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--text-primary);
      }
      .ward-count {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }
      .progress-track {
        height: 6px;
        background: var(--border-default);
        border-radius: var(--radius-full);
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--clr-primary-500);
        border-radius: var(--radius-full);
        transition: width 0.4s ease;
        &.warn {
          background: var(--clr-warning-600);
        }
        &.crit {
          background: var(--clr-danger-600);
        }
      }
    `,
  ],
})
export class DashboardPage {
  auth = inject(AuthService);
  private router = inject(Router);

  get userName() {
    return this.auth.currentUser()?.name ?? 'Doctor';
  }

  today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  badgeClass(color: string) {
    return {
      'badge-info': color === 'info',
      'badge-success': color === 'success',
      'badge-warning': color === 'warning',
      'badge-danger': color === 'danger',
      'badge-neutral': color === 'neutral',
    };
  }

  stats: StatCard[] = [
    {
      label: 'OPD Today',
      value: 142,
      delta: '12% vs yesterday',
      deltaUp: true,
      bg: '#dbeafe',
      fg: '#2563eb',
      iconPath:
        'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    },
    {
      label: 'Beds Occupied',
      value: '78/100',
      delta: '3 discharged',
      deltaUp: false,
      bg: '#fef9c3',
      fg: '#ca8a04',
      iconPath: 'M2 4v16M22 20H2M6 8h12a2 2 0 0 1 2 2v6H4v-6a2 2 0 0 1 2-2z',
    },
    {
      label: 'Lab Pending',
      value: 28,
      bg: '#e0f2fe',
      fg: '#0284c7',
      iconPath: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 7h14l-4-7V3',
    },
    {
      label: "Today's Revenue",
      value: '₹1.24L',
      delta: '8% vs yesterday',
      deltaUp: true,
      bg: '#dcfce7',
      fg: '#16a34a',
      iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    },
    {
      label: 'Pharmacy Sales',
      value: '₹38.5k',
      delta: '5% vs yesterday',
      deltaUp: true,
      bg: '#f0fdf4',
      fg: '#15803d',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    },
    {
      label: 'Emergency Cases',
      value: 7,
      bg: '#fee2e2',
      fg: '#dc2626',
      iconPath:
        'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    },
  ];

  modules: ModuleTile[] = [
    {
      label: 'Patient Registration',
      sub: 'Register & search patients',
      route: '/patient',
      bg: '#dbeafe',
      fg: '#2563eb',
      iconPath:
        'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 8l2 2-2 2M15 10h6',
    },
    {
      label: 'OPD / EMR',
      sub: 'Consultations & prescriptions',
      route: '/opd',
      bg: '#e0f2fe',
      fg: '#0284c7',
      iconPath:
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6',
    },
    {
      label: 'Emergency',
      sub: 'Triage & acute care',
      route: '/emergency',
      bg: '#fee2e2',
      fg: '#dc2626',
      iconPath:
        'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    },
    {
      label: 'Laboratory',
      sub: 'Tests, orders & reports',
      route: '/laboratory',
      bg: '#f0fdf4',
      fg: '#16a34a',
      iconPath: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 7h14l-4-7V3',
    },
    {
      label: 'Pharmacy',
      sub: 'Drugs, stock & sales',
      route: '/pharmacy',
      bg: '#f0fdf4',
      fg: '#15803d',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    },
    {
      label: 'IPD & Wards',
      sub: 'Admissions & bed map',
      route: '/ipd',
      bg: '#fef9c3',
      fg: '#ca8a04',
      iconPath:
        'M2 4v16M22 20H2M6 8h12a2 2 0 0 1 2 2v6H4v-6a2 2 0 0 1 2-2zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    },
    {
      label: 'Radiology',
      sub: 'Imaging & reports',
      route: '/radiology',
      bg: '#f3e8ff',
      fg: '#7c3aed',
      iconPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 8v4M12 16h.01',
    },
    {
      label: 'Billing',
      sub: 'Invoices & payments',
      route: '/billing',
      bg: '#dcfce7',
      fg: '#16a34a',
      iconPath: 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22',
    },
    {
      label: 'Inventory',
      sub: 'Store & supply chain',
      route: '/inventory',
      bg: '#fef3c7',
      fg: '#d97706',
      iconPath:
        'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    },
    {
      label: 'Compliance',
      sub: 'NABH & govt schemes',
      route: '/compliance',
      bg: '#ffe4e6',
      fg: '#be123c',
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    },
    {
      label: 'Reports & MIS',
      sub: 'Analytics & dashboards',
      route: '/reports',
      bg: '#e0e7ff',
      fg: '#4338ca',
      iconPath: 'M18 20V10M12 20V4M6 20v-6',
    },
  ];

  appointments = [
    {
      token: 'T-001',
      name: 'Ravi Kumar',
      initials: 'RK',
      age: 45,
      gender: 'M',
      doctor: 'Dr. Sharma',
      status: 'In Consult',
      statusColor: 'info',
    },
    {
      token: 'T-002',
      name: 'Priya Devi',
      initials: 'PD',
      age: 32,
      gender: 'F',
      doctor: 'Dr. Reddy',
      status: 'Waiting',
      statusColor: 'warning',
    },
    {
      token: 'T-003',
      name: 'Anjali Singh',
      initials: 'AS',
      age: 28,
      gender: 'F',
      doctor: 'Dr. Sharma',
      status: 'Waiting',
      statusColor: 'warning',
    },
    {
      token: 'T-004',
      name: 'Suresh Babu',
      initials: 'SB',
      age: 61,
      gender: 'M',
      doctor: 'Dr. Krishna',
      status: 'Done',
      statusColor: 'success',
    },
    {
      token: 'T-005',
      name: 'Lakshmi P.',
      initials: 'LP',
      age: 38,
      gender: 'F',
      doctor: 'Dr. Reddy',
      status: 'Cancelled',
      statusColor: 'danger',
    },
  ];

  wards = [
    { name: 'General Ward A', occupied: 18, total: 20 },
    { name: 'ICU', occupied: 8, total: 10 },
    { name: 'Maternity Ward', occupied: 12, total: 15 },
    { name: 'Paediatrics', occupied: 7, total: 12 },
    { name: 'Surgical Ward', occupied: 14, total: 20 },
  ];
}
