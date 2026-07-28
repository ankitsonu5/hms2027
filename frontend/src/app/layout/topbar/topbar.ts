import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'hms-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <button class="topbar__hamburger" (click)="menuToggle.emit()" aria-label="Toggle menu">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h5 class="topbar__title">{{ pageTitle() }}</h5>
        @if (breadcrumb()) {
          <span class="topbar__breadcrumb">{{ breadcrumb() }}</span>
        }
      </div>

      <div class="topbar__right">
        <!-- Notifications -->
        <button class="topbar__icon-btn" title="Notifications">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="topbar__icon-btn-dot"></span>
        </button>

        <div class="topbar__divider"></div>

        <!-- User menu -->
        <div class="topbar__user-wrap">
          <button class="topbar__user" (click)="dropdownOpen.update((v) => !v)">
            <div class="topbar__avatar">{{ userInitials() }}</div>
            <div class="topbar__user-info">
              <span class="topbar__user-name">{{ userName() }}</span>
              <span class="topbar__user-role">{{ userRole() }}</span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              [style.transform]="dropdownOpen() ? 'rotate(180deg)' : ''"
              style="transition: transform 0.2s ease; flex-shrink:0"
            >
              <path d="M3 5l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          @if (dropdownOpen()) {
            <!-- Backdrop -->
            <div class="topbar__backdrop" (click)="dropdownOpen.set(false)"></div>

            <!-- Dropdown -->
            <div class="topbar__dropdown">
              <div class="topbar__dropdown-header">
                <div class="topbar__avatar topbar__avatar--lg">{{ userInitials() }}</div>
                <div>
                  <p class="topbar__dropdown-name">{{ userName() }}</p>
                  <p class="topbar__dropdown-role">{{ userRole() }}</p>
                </div>
              </div>

              <div class="topbar__dropdown-divider"></div>

              <button class="topbar__dropdown-item" (click)="dropdownOpen.set(false)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>

              <div class="topbar__dropdown-divider"></div>

              <button
                class="topbar__dropdown-item topbar__dropdown-item--danger"
                (click)="logout()"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
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
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        position: fixed;
        top: 0;
        right: 0;
        left: var(--sidebar-width);
        height: var(--topbar-height);
        background: var(--bg-surface);
        border-bottom: 1px solid var(--border-default);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--sp-6);
        z-index: 90;
        transition: left var(--transition-normal);
      }

      :host-context(.layout--collapsed) .topbar {
        left: var(--sidebar-collapsed-width);
      }

      @media (max-width: 768px) {
        .topbar {
          left: 0 !important;
          padding: 0 var(--sp-4);
        }
      }

      .topbar__left {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }

      .topbar__hamburger {
        display: none;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        border: none;
        background: none;
        color: var(--text-secondary);
        cursor: pointer;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition:
          background var(--transition-fast),
          color var(--transition-fast);

        &:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          display: flex;
        }
      }

      .topbar__title {
        font-family: var(--font-body);
        font-size: var(--text-md);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
      }

      .topbar__breadcrumb {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .topbar__right {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }

      .topbar__icon-btn {
        position: relative;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        border: none;
        background: none;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background var(--transition-fast),
          color var(--transition-fast);

        &:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }
      }

      .topbar__icon-btn-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 7px;
        height: 7px;
        background: var(--clr-danger-600);
        border-radius: var(--radius-full);
        border: 2px solid var(--bg-surface);
      }

      .topbar__divider {
        width: 1px;
        height: 24px;
        background: var(--border-default);
      }

      /* ── User wrap (relative container for dropdown) ── */
      .topbar__user-wrap {
        position: relative;
      }

      .topbar__user {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-1) var(--sp-2);
        border-radius: var(--radius-md);
        border: none;
        background: none;
        cursor: pointer;
        color: var(--text-secondary);
        transition: background var(--transition-fast);

        &:hover {
          background: var(--bg-muted);
        }
      }

      .topbar__avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: var(--clr-primary-100);
        color: var(--clr-primary-700);
        font-family: var(--font-display);
        font-size: var(--text-sm);
        font-weight: var(--fw-display-bold);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &--lg {
          width: 40px;
          height: 40px;
          font-size: var(--text-base);
        }
      }

      .topbar__user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        @media (max-width: 480px) {
          display: none;
        }
      }

      .topbar__user-name {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        line-height: 1.2;
      }

      .topbar__user-role {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: var(--fw-medium);
        letter-spacing: var(--ls-wide);
        text-transform: uppercase;
        color: var(--text-muted);
        line-height: 1.2;
      }

      /* ── Backdrop ── */
      .topbar__backdrop {
        position: fixed;
        inset: 0;
        z-index: 998;
      }

      /* ── Dropdown ── */
      .topbar__dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 220px;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        z-index: 999;
        overflow: hidden;
        animation: dropIn 0.15s ease;
      }

      @keyframes dropIn {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .topbar__dropdown-header {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-4);
      }

      .topbar__dropdown-name {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        margin: 0 0 2px;
      }

      .topbar__dropdown-role {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: var(--fw-medium);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin: 0;
      }

      .topbar__dropdown-divider {
        height: 1px;
        background: var(--border-default);
        margin: 0;
      }

      .topbar__dropdown-item {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        width: 100%;
        padding: var(--sp-3) var(--sp-4);
        border: none;
        background: none;
        cursor: pointer;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
        text-align: left;
        transition:
          background 0.12s ease,
          color 0.12s ease;

        &:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }

        svg {
          flex-shrink: 0;
          opacity: 0.7;
        }

        &--danger {
          color: var(--clr-danger-600);
          &:hover {
            background: #fff1f2;
            color: var(--clr-danger-700);
          }
          svg {
            opacity: 1;
          }
        }
      }
    `,
  ],
})
export class TopbarComponent {
  private auth = inject(AuthService);

  pageTitle = input<string>('Dashboard');
  breadcrumb = input<string>('');
  userName = input<string>('Admin');
  userRole = input<string>('Administrator');
  userInitials = input<string>('AD');
  menuToggle = output<void>();
  userMenuClick = output<void>();

  dropdownOpen = signal(false);

  logout(): void {
    this.dropdownOpen.set(false);
    this.auth.logout();
  }
}
