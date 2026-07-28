import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2"/>
      <rect x="14" y="3" width="7" height="7" rx="2"/>
      <rect x="14" y="14" width="7" height="7" rx="2"/>
      <rect x="3" y="14" width="7" height="7" rx="2"/>
    </svg>`,
  },
  {
    label: 'Patient Registration',
    route: '/patient',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4"/>
      <path d="M19 15v6M16 18h6"/>
    </svg>`,
  },
  {
    label: 'OPD / EMR',
    route: '/opd',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a6 6 0 0 1-5 5.92V5.5z"/>
      <path d="M9.5 5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v7a6 6 0 0 1-5 5.92"/>
      <path d="M15 13.5V16a4 4 0 0 0 4 4v0a4 4 0 0 0 4-4v-2"/>
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  {
    label: 'Emergency',
    route: '/emergency',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
      <path d="M12 8v4M10 12h4"/>
    </svg>`,
  },
  {
    label: 'Laboratory',
    route: '/laboratory',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3v6.5L4.5 17A2 2 0 0 0 6.4 20h11.2a2 2 0 0 0 1.9-2.5L16 9.5V3"/>
      <path d="M8 3h8"/>
      <path d="M6 15h12"/>
      <circle cx="10" cy="17" r=".5" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="17" r=".5" fill="currentColor" stroke="none"/>
    </svg>`,
    badge: 3,
  },
  {
    label: 'Pharmacy',
    route: '/pharmacy',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>`,
  },
  {
    label: 'IPD / Wards',
    route: '/ipd',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 20v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/>
      <path d="M2 16V9"/>
      <path d="M22 16V9"/>
      <path d="M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/>
      <circle cx="16.5" cy="5.5" r="1.5"/>
      <path d="M2 20h20"/>
    </svg>`,
  },
  {
    label: 'Radiology',
    route: '/radiology',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2"/>
      <path d="M3 10h18"/>
      <path d="M8 6V4M16 6V4"/>
      <circle cx="12" cy="15" r="2.5"/>
      <path d="M7 15h2.5M14.5 15H17"/>
    </svg>`,
  },
  {
    label: 'Billing',
    route: '/billing',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
      <path d="M14 8H8M16 12H8M13 16H8"/>
    </svg>`,
  },
  {
    label: 'Inventory',
    route: '/inventory',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5Z"/>
      <path d="m2 17 10 5 10-5"/>
      <path d="m2 12 10 5 10-5"/>
    </svg>`,
  },
  {
    label: 'Compliance',
    route: '/compliance',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`,
  },
  {
    label: 'Reports & MIS',
    route: '/reports',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3v18h18"/>
      <path d="m7 16 4-4 4 4 5-5"/>
      <circle cx="7" cy="16" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="20" cy="11" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
];

@Component({
  selector: 'hms-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout" [class.layout--collapsed]="sidebarCollapsed()">
      @if (sidebarMobileOpen()) {
        <div class="layout__overlay" (click)="sidebarMobileOpen.set(false)"></div>
      }

      <hms-sidebar
        [navItems]="navItems"
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="sidebarMobileOpen()"
        (toggleCollapsed)="sidebarCollapsed.set(!sidebarCollapsed())"
        (navClose)="sidebarMobileOpen.set(false)"
      />
      <hms-topbar
        [pageTitle]="pageTitle()"
        userName="Dr. Krishna"
        userRole="Administrator"
        userInitials="DK"
        (menuToggle)="sidebarMobileOpen.set(!sidebarMobileOpen())"
      />
      <main class="layout__main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .layout {
        --_sidebar: var(--sidebar-width);
        min-height: 100vh;

        &--collapsed {
          --_sidebar: var(--sidebar-collapsed-width);
        }
      }

      .layout__overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 199;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .layout__main {
        margin-left: var(--_sidebar);
        margin-top: var(--topbar-height);
        padding: var(--sp-6);
        min-height: calc(100vh - var(--topbar-height));
        transition: margin-left var(--transition-normal);

        @media (max-width: 768px) {
          margin-left: 0;
          padding: var(--sp-4);
        }
      }
    `,
  ],
})
export class ShellComponent {
  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  navItems = NAV_ITEMS;

  pageTitle = computed(() => 'Dashboard');
}
