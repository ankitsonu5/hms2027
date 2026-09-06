import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem, NavSection } from '../sidebar/sidebar';
import { ADMIN_MENU, MENU_CONTEXTS, AdminGroup } from '../../core/admin-menu';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { TopbarComponent } from '../topbar/topbar';

const toNav = (menu: AdminGroup[]): NavItem[] =>
  menu.map((g) => ({
    label: g.label,
    icon: g.icon,
    route: g.path,
    children: g.children?.map((c) => ({
      label: c.label,
      icon: '',
      route: c.link ?? `${g.path}/${c.path}`,
    })),
  }));

const ADMIN_ITEMS: NavItem[] = toNav(ADMIN_MENU);


/** Friendly titles for routes that don't declare their own `data.title`. */
const ROUTE_TITLES: Record<string, string> = {
  dashboard: 'Account Overview',
  patient: 'Patient Registration',
  opd: 'OPD / EMR',
  emergency: 'Emergency',
  laboratory: 'Laboratory',
  pharmacy: 'Pharmacy',
  ipd: 'IPD / Wards',
  radiology: 'Radiology',
  billing: 'Billing',
  inventory: 'Inventory',
  compliance: 'Compliance',
  reports: 'Reports & MIS',
};

const NAV_SECTIONS: NavSection[] = [{ title: '', items: ADMIN_ITEMS }];

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
        [sections]="sections()"
        [context]="context()"
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
        /* Contains .layout__main's top margin. Without this the margin collapses
           out, pushing .layout down by the topbar height while its 100vh
           min-height stays put — leaving every page a phantom 60px of scroll. */
        display: flow-root;

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
  private router = inject(Router);
  private activated = inject(ActivatedRoute);

  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  /** Current URL, used to swap the sidebar when a module owns its own menu. */
  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map((): string => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private activeContext = computed(() =>
    MENU_CONTEXTS.find((c) => this.url().startsWith(c.prefix)) ?? null,
  );

  context = computed(() => {
    const c = this.activeContext();
    return c ? { title: c.title } : null;
  });

  sections = computed<NavSection[]>(() => {
    const c = this.activeContext();
    return c ? [{ title: '', items: toNav(c.items) }] : NAV_SECTIONS;
  });


  /** Deepest activated route's `data.title`, else a friendly name for the first URL segment. */
  pageTitle = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map((): string => {
        // A child route can exist in the tree before its snapshot is populated,
        // so every hop here has to tolerate a half-built route.
        let r = this.activated;
        while (r?.firstChild) r = r.firstChild;
        const fromData = r?.snapshot?.data?.['title'] as string | undefined;
        if (fromData) return fromData;
        const seg = this.router.url.split('?')[0].split('/').filter(Boolean)[0] ?? '';
        return ROUTE_TITLES[seg] ?? 'HMS 2027';
      }),
    ),
    { initialValue: 'Account Overview' },
  );
}
