import { Component, inject, input, output, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface NavItem {
  label: string;
  icon: string;
  /** Empty when the module has no page yet — such items render disabled. */
  route: string;
  roles?: string[];
  badge?: number;
  /** No page exists for this module yet; shown greyed with a "Soon" tag. */
  disabled?: boolean;
  /** Renders as an expandable group; `route` is then only used to detect the active branch. */
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'hms-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()" [class.mobile-open]="mobileOpen()">
      <!-- Brand -->
      <div class="sidebar__brand">
        <div class="sidebar__logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="url(#logoGrad)" />
            <path d="M10 16h12M16 10v12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
            <defs>
              <linearGradient
                id="logoGrad"
                x1="0"
                y1="0"
                x2="32"
                y2="32"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#3b82f6" />
                <stop offset="1" stop-color="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        @if (!collapsed()) {
          <div class="sidebar__brand-text">
            <span class="sidebar__brand-name">HMS</span>
            <span class="sidebar__brand-sub">MedConnect</span>
          </div>
        }
        <button class="sidebar__close" (click)="navClose.emit()" aria-label="Close menu">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Module context header -->
      @if (context(); as ctx) {
        <a class="sidebar__context" routerLink="/dashboard" [title]="'Back to main menu'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          @if (!collapsed()) {
            <span class="sidebar__context-title">{{ ctx.title }}</span>
          }
        </a>
      }

      <!-- Nav -->
      <nav class="sidebar__nav">
        @for (section of sections(); track section.title) {
          @if (section.title) {
            @if (!collapsed()) {
              <p class="sidebar__section-label">{{ section.title }}</p>
            } @else {
              <span class="sidebar__rule"></span>
            }
          }

          @for (item of section.items; track item.label) {
            @if (item.children?.length) {
              <button
                type="button"
                class="sidebar__item sidebar__group"
                [class.sidebar__item--branch]="isOpen(item)"
                [attr.aria-expanded]="isOpen(item)"
                [title]="collapsed() ? item.label : ''"
                (click)="toggle(item)"
              >
                <span class="sidebar__icon-wrap">
                  <span class="sidebar__icon" [innerHTML]="safe(item.icon)"></span>
                </span>
                @if (!collapsed()) {
                  <span class="sidebar__label">{{ item.label }}</span>
                  <svg
                    class="sidebar__chevron"
                    [class.open]="isOpen(item)"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                }
              </button>

              @if (isOpen(item) && !collapsed()) {
                <div class="sidebar__sub">
                  @for (child of item.children!; track child.route) {
                    <a
                      class="sidebar__subitem"
                      [routerLink]="child.route"
                      routerLinkActive="sidebar__subitem--active"
                      (click)="navClose.emit()"
                    >
                      {{ child.label }}
                    </a>
                  }
                </div>
              }
            } @else if (item.disabled) {
              <span
                class="sidebar__item sidebar__item--soon"
                [title]="item.label + ' — module not built yet'"
                aria-disabled="true"
              >
                <span class="sidebar__icon-wrap">
                  <span class="sidebar__icon" [innerHTML]="safe(item.icon)"></span>
                </span>
                @if (!collapsed()) {
                  <span class="sidebar__label">{{ item.label }}</span>
                  <span class="sidebar__soon">Soon</span>
                }
              </span>
            } @else {
              <a
                class="sidebar__item"
                [routerLink]="item.route"
                routerLinkActive="sidebar__item--active"
                [title]="collapsed() ? item.label : ''"
                (click)="navClose.emit()"
              >
                <span class="sidebar__icon-wrap">
                  <span class="sidebar__icon" [innerHTML]="safe(item.icon)"></span>
                </span>
                @if (!collapsed()) {
                  <span class="sidebar__label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="sidebar__badge">{{ item.badge }}</span>
                  }
                }
                @if (collapsed() && item.badge) {
                  <span class="sidebar__badge sidebar__badge--dot"></span>
                }
              </a>
            }
          }
        }
      </nav>

      <!-- Collapse toggle -->
      <button class="sidebar__toggle" (click)="toggleCollapsed.emit()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            [attr.d]="collapsed() ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        @if (!collapsed()) {
          <span class="sidebar__toggle-label">Collapse</span>
        }
      </button>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: var(--sidebar-width);
        background: #fff;
        border-right: 1px solid var(--border-default);
        display: flex;
        flex-direction: column;
        transition:
          width var(--transition-normal),
          transform var(--transition-normal);
        z-index: 200;
        overflow: hidden;

        &.collapsed {
          width: var(--sidebar-collapsed-width);
        }

        @media (max-width: 768px) {
          transform: translateX(-100%);
          width: var(--sidebar-width) !important;
          box-shadow: none;

          &.mobile-open {
            transform: translateX(0);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          }
        }
      }

      /* ── Brand ── */
      .sidebar__brand {
        height: var(--topbar-height);
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: 0 var(--sp-4);
        border-bottom: 1px solid var(--border-default);
        flex-shrink: 0;
        background: #fff;
      }

      .sidebar__logo {
        flex-shrink: 0;
        display: flex;
      }

      .sidebar__brand-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        overflow: hidden;
      }

      .sidebar__brand-name {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: 800;
        color: #1e40af;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .sidebar__brand-sub {
        font-family: var(--font-label);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-muted);
        line-height: 1;
      }

      .sidebar__close {
        display: none;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-md);
        border: none;
        background: var(--bg-muted);
        color: var(--text-muted);
        cursor: pointer;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-left: auto;
        transition:
          background var(--transition-fast),
          color var(--transition-fast);

        &:hover {
          background: var(--border-default);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          display: flex;
        }
      }

      /* ── Module context header ── */
      .sidebar__context {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        margin: var(--sp-3) var(--sp-3) 0;
        padding: var(--sp-3);
        border-radius: var(--radius-lg);
        color: var(--clr-primary-700);
        background: var(--clr-primary-50);
        text-decoration: none;
        transition: background var(--transition-fast);
      }

      .sidebar__context:hover {
        background: var(--clr-primary-100);
      }

      .sidebar__context-title {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-sm);
        letter-spacing: var(--ls-tight);
      }

      /* ── Expandable groups ── */
      .sidebar__group {
        width: 100%;
        border: 0;
        background: transparent;
        text-align: left;
        font: inherit;
        cursor: pointer;
      }

      .sidebar__item--branch {
        color: var(--text-primary);
      }

      .sidebar__chevron {
        flex-shrink: 0;
        margin-left: auto;
        color: var(--text-muted);
        transition: transform var(--transition-fast);
      }

      .sidebar__chevron.open {
        transform: rotate(180deg);
      }

      .sidebar__sub {
        display: flex;
        flex-direction: column;
        gap: 1px;
        margin: 2px 0 var(--sp-2) 30px;
        padding-left: var(--sp-3);
        border-left: 1.5px solid var(--border-default);
      }

      .sidebar__subitem {
        padding: 7px var(--sp-3);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: 12.5px;
        line-height: 1.3;
        color: var(--text-secondary);
        text-decoration: none;
        transition:
          background 0.15s ease,
          color 0.15s ease;

        &:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }
      }

      .sidebar__subitem--active {
        color: var(--clr-primary-700);
        background: var(--clr-primary-50);
        font-weight: 600;
      }

      /* ── Disabled ("Soon") items ── */
      .sidebar__item--soon {
        cursor: default;
        opacity: 0.45;

        &:hover {
          background: transparent;
          color: var(--text-secondary);
        }
      }

      .sidebar__soon {
        margin-left: auto;
        padding: 2px 5px;
        font-family: var(--font-label);
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-muted);
        background: var(--bg-muted);
        border-radius: var(--radius-full);
      }

      /* Divider standing in for the section label while collapsed */
      .sidebar__rule {
        height: 1px;
        margin: var(--sp-3) var(--sp-2);
        background: var(--border-default);
        flex-shrink: 0;
      }

      /* ── Section label ── */
      .sidebar__section-label {
        font-family: var(--font-label);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: var(--sp-4) var(--sp-4) var(--sp-2);
        flex-shrink: 0;
      }

      /* ── Nav ── */
      .sidebar__nav {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0 var(--sp-3) var(--sp-3);
        display: flex;
        flex-direction: column;
        gap: 2px;

        /* subtle scrollbar */
        &::-webkit-scrollbar {
          width: 3px;
        }
        &::-webkit-scrollbar-track {
          background: transparent;
        }
        &::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 99px;
        }
      }

      .sidebar__item {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: 9px var(--sp-3);
        border-radius: var(--radius-lg);
        color: var(--text-secondary);
        text-decoration: none;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 500;
        position: relative;
        transition:
          background 0.15s ease,
          color 0.15s ease;
        cursor: pointer;

        &:hover {
          background: #f0f4ff;
          color: #1d4ed8;

          .sidebar__icon-wrap {
            background: #dbeafe;
            color: #1d4ed8;
          }
        }

        &--active {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #1d4ed8;
          font-weight: 600;

          /* left accent bar */
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 20%;
            bottom: 20%;
            width: 3px;
            background: #2563eb;
            border-radius: 0 3px 3px 0;
          }

          .sidebar__icon-wrap {
            background: #2563eb;
            color: #fff;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          }
        }
      }

      /* ── Icon wrap ── */
      .sidebar__icon-wrap {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: var(--bg-muted);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background 0.15s ease,
          color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .sidebar__icon {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: inherit;

        ::ng-deep svg {
          width: 18px;
          height: 18px;
          overflow: visible;
          stroke: currentColor;
        }
      }

      .sidebar__label {
        flex: 1;
        min-width: 0;
        /* Long admin labels ("Test and Profile Management") wrap instead of clipping. */
        white-space: normal;
        overflow-wrap: anywhere;
        line-height: 1.25;
      }

      .sidebar__badge {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 700;
        background: #2563eb;
        color: #fff;
        border-radius: 99px;
        padding: 1px 8px;
        flex-shrink: 0;
        line-height: 1.6;

        &--dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 7px;
          height: 7px;
          padding: 0;
          border-radius: 99px;
          border: 2px solid #fff;
        }
      }

      /* ── Collapse toggle ── */
      .sidebar__toggle {
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--sp-2);
        background: none;
        border: none;
        border-top: 1px solid var(--border-default);
        color: var(--text-muted);
        cursor: pointer;
        flex-shrink: 0;
        padding: 0 var(--sp-4);
        font-family: var(--font-body);
        font-size: var(--text-xs);
        font-weight: 500;
        transition:
          color 0.15s ease,
          background 0.15s ease;

        &:hover {
          background: #f8fafc;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          display: none;
        }
      }

      .sidebar__toggle-label {
        white-space: nowrap;
      }
    `,
  ],
})
export class SidebarComponent {
  private sanitizer = inject(DomSanitizer);

  sections = input<NavSection[]>([]);
  /** Set while inside a module that replaces the sidebar with its own menu. */
  context = input<{ title: string } | null>(null);

  private router = inject(Router);
  /** Current URL, so the branch containing the active page opens on its own. */
  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  /** Explicit user toggles win over the URL-derived default. */
  private manual = signal<Record<string, boolean>>({});

  isOpen(item: NavItem): boolean {
    const override = this.manual()[item.label];
    return override ?? this.url().startsWith(item.route);
  }

  toggle(item: NavItem): void {
    const next = !this.isOpen(item);
    this.manual.update((m) => ({ ...m, [item.label]: next }));
  }
  collapsed = input<boolean>(false);
  mobileOpen = input<boolean>(false);
  toggleCollapsed = output<void>();
  navClose = output<void>();

  safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
