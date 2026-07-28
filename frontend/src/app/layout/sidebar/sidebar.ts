import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: number;
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

      <!-- Nav label -->
      @if (!collapsed()) {
        <p class="sidebar__section-label">MAIN MENU</p>
      }

      <!-- Nav -->
      <nav class="sidebar__nav">
        @for (item of navItems(); track item.route) {
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
        font-size: var(--text-sm);
        font-weight: 500;
        white-space: nowrap;
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
        overflow: hidden;
        text-overflow: ellipsis;
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

  navItems = input<NavItem[]>([]);
  collapsed = input<boolean>(false);
  mobileOpen = input<boolean>(false);
  toggleCollapsed = output<void>();
  navClose = output<void>();

  safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
