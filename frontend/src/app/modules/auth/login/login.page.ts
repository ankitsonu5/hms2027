import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type LoginRole = 'center' | 'doctor';

@Component({
  selector: 'hms-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: var(--bg-base);
        font-family: var(--font-body);
        color: var(--text-primary);
      }

      /* ── Top bar ──────────────────────────────────────────────────────── */
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-4);
        height: 64px;
        padding: 0 var(--sp-8);
        background: var(--bg-surface);
        border-bottom: 1px solid var(--border-default);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }

      .brand-logo {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--clr-primary-600), var(--clr-primary-700));
        color: #fff;
        box-shadow: var(--shadow-sm);
      }

      .brand-name {
        font-family: var(--font-display);
        font-weight: var(--fw-display-black);
        font-size: var(--text-md);
        letter-spacing: var(--ls-tight);
        line-height: 1;
      }

      .brand-tag {
        font-family: var(--font-label);
        font-size: 0.625rem;
        font-weight: var(--fw-semibold);
        letter-spacing: var(--ls-widest);
        color: var(--text-muted);
        text-transform: uppercase;
        margin-top: 3px;
      }

      .topbar-help {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
        text-decoration: none;
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--radius-md);
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .topbar-help:hover {
        background: var(--bg-muted);
        color: var(--clr-primary-700);
      }

      /* ── Page grid ────────────────────────────────────────────────────── */
      .main {
        flex: 1;
        display: grid;
        grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
        gap: var(--sp-16);
        align-items: center;
        width: 100%;
        max-width: 1240px;
        margin: 0 auto;
        padding: var(--sp-12) var(--sp-8);
      }

      /* ── Form column ──────────────────────────────────────────────────── */
      .form-head {
        margin-bottom: var(--sp-6);
      }

      .form-title {
        font-family: var(--font-display);
        font-weight: var(--fw-display-black);
        font-size: var(--text-2xl);
        letter-spacing: var(--ls-tight);
        line-height: var(--lh-tight);
      }

      .form-subtitle {
        margin-top: var(--sp-2);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: var(--lh-normal);
      }

      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }

      /* ── Role tabs ────────────────────────────────────────────────────── */
      .tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-bottom: 1px solid var(--border-default);
        background: var(--clr-neutral-50);
      }

      .tab {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--sp-2);
        padding: var(--sp-4) var(--sp-3);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        background: transparent;
        border: 0;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        transition: color var(--transition-fast), background var(--transition-fast),
          border-color var(--transition-fast);
      }

      .tab:hover {
        color: var(--text-primary);
        background: var(--bg-muted);
      }

      .tab.active {
        color: var(--clr-primary-700);
        background: var(--bg-surface);
        border-bottom-color: var(--clr-primary-600);
      }

      .tab:focus-visible {
        outline: 2px solid var(--clr-primary-500);
        outline-offset: -2px;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
        padding: var(--sp-6);
      }

      /* ── Fields ───────────────────────────────────────────────────────── */
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
      }

      .field-label {
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        letter-spacing: var(--ls-wide);
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: var(--sp-3);
        display: grid;
        place-items: center;
        color: var(--text-muted);
        pointer-events: none;
      }

      .field-input {
        width: 100%;
        padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-10);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1.5px solid var(--border-default);
        border-radius: var(--radius-md);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .field-input::placeholder {
        color: var(--text-muted);
      }

      .field-input:focus {
        outline: none;
        border-color: var(--clr-primary-500);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--clr-primary-500) 12%, transparent);
      }

      .field-input.error {
        border-color: var(--clr-danger-600);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--clr-danger-600) 10%, transparent);
      }

      .field-input--pw {
        padding-right: var(--sp-10);
      }

      .toggle-btn {
        position: absolute;
        right: var(--sp-2);
        display: grid;
        place-items: center;
        padding: var(--sp-2);
        color: var(--text-muted);
        background: transparent;
        border: 0;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .toggle-btn:hover {
        color: var(--text-secondary);
        background: var(--bg-muted);
      }

      .field-error {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1);
        font-size: var(--text-xs);
        color: var(--clr-danger-600);
      }

      /* ── Forgot password ──────────────────────────────────────────────── */
      .field-foot {
        display: flex;
        justify-content: flex-end;
      }

      .link-btn {
        padding: 0;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--clr-primary-600);
        background: transparent;
        border: 0;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: color var(--transition-fast);
      }

      .link-btn:hover {
        color: var(--clr-primary-700);
        text-decoration: underline;
      }

      .reset-note {
        display: flex;
        gap: var(--sp-3);
        padding: var(--sp-3);
        font-size: var(--text-xs);
        line-height: var(--lh-normal);
        color: var(--clr-neutral-700);
        background: var(--clr-info-100);
        border: 1px solid color-mix(in srgb, var(--clr-info-600) 25%, transparent);
        border-radius: var(--radius-md);
      }

      .reset-note svg {
        flex: none;
        margin-top: 1px;
        color: var(--clr-info-600);
      }

      /* ── Server error ─────────────────────────────────────────────────── */
      .server-error {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-3);
        font-size: var(--text-sm);
        color: var(--clr-danger-600);
        background: var(--clr-danger-100);
        border: 1px solid color-mix(in srgb, var(--clr-danger-600) 25%, transparent);
        border-radius: var(--radius-md);
      }

      /* ── Submit ───────────────────────────────────────────────────────── */
      .submit-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--sp-2);
        padding: var(--sp-3) var(--sp-5);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-bold);
        color: #fff;
        background: var(--clr-primary-600);
        border: 0;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background var(--transition-fast), box-shadow var(--transition-fast),
          transform var(--transition-fast);
      }

      .submit-btn:hover:not(:disabled) {
        background: var(--clr-primary-700);
        box-shadow: var(--shadow-md);
      }

      .submit-btn:active:not(:disabled) {
        transform: translateY(1px);
      }

      .submit-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid color-mix(in srgb, #fff 40%, transparent);
        border-top-color: #fff;
        border-radius: var(--radius-full);
        animation: spin 700ms linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Visual column ────────────────────────────────────────────────── */
      .visual {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
        padding: var(--sp-12);
        border-radius: var(--radius-2xl);
        background: linear-gradient(150deg, var(--clr-primary-700) 0%, var(--clr-primary-900) 100%);
        color: #fff;
        overflow: hidden;
      }

      .visual::after {
        content: '';
        position: absolute;
        right: -80px;
        top: -80px;
        width: 300px;
        height: 300px;
        border-radius: var(--radius-full);
        background: rgb(255 255 255 / 0.06);
      }

      .visual-inner {
        position: relative;
        z-index: 1;
      }

      .visual-heading {
        font-family: var(--font-display);
        color: #fff;
        font-weight: var(--fw-display-black);
        font-size: var(--text-2xl);
        line-height: var(--lh-tight);
        letter-spacing: var(--ls-tight);
      }

      .visual-sub {
        margin-top: var(--sp-3);
        max-width: 46ch;
        font-size: var(--text-sm);
        line-height: var(--lh-relaxed);
        color: rgb(255 255 255 / 0.75);
      }

      .mock {
        width: 100%;
        height: auto;
        margin-top: var(--sp-8);
        border-radius: var(--radius-lg);
        box-shadow: 0 24px 48px -12px rgb(0 0 0 / 0.45);
      }

      .mock-label {
        font-family: var(--font-label);
        font-size: 8px;
        font-weight: 600;
        letter-spacing: 0.06em;
        fill: #94a3b8;
        text-transform: uppercase;
      }

      .mock-stat {
        font-family: var(--font-display);
        font-size: 17px;
        font-weight: 800;
        fill: #0f172a;
      }

      .mock-cap {
        font-family: var(--font-label);
        font-size: 9px;
        font-weight: 600;
        fill: #475569;
      }

      .features {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-3) var(--sp-6);
        margin-top: var(--sp-8);
        padding-top: var(--sp-6);
        border-top: 1px solid rgb(255 255 255 / 0.15);
      }

      .feature-item {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: rgb(255 255 255 / 0.85);
      }

      .feature-item svg {
        flex: none;
        color: var(--clr-primary-200);
      }

      /* ── Footer ───────────────────────────────────────────────────────── */
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--sp-2) var(--sp-4);
        padding: var(--sp-4) var(--sp-8);
        font-size: var(--text-xs);
        color: var(--text-muted);
        background: var(--bg-surface);
        border-top: 1px solid var(--border-default);
      }

      .footer strong {
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
      }

      /* ── Responsive ───────────────────────────────────────────────────── */
      @media (max-width: 1024px) {
        .main {
          grid-template-columns: minmax(0, 1fr);
          gap: var(--sp-8);
          max-width: 460px;
        }

        .visual {
          display: none;
        }
      }

      @media (max-width: 560px) {
        .topbar,
        .footer {
          padding-inline: var(--sp-4);
        }

        .main {
          padding: var(--sp-8) var(--sp-4);
        }

        .brand-tag {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .spinner {
          animation-duration: 2s;
        }

        * {
          transition-duration: 1ms !important;
        }
      }
    `,
  ],
  template: `
    <!-- ══ Top bar ═══════════════════════════════════════════════════════ -->
    <header class="topbar">
      <div class="brand">
        <div class="brand-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <div>
          <div class="brand-name">HMS 2027</div>
          <div class="brand-tag">Hospital Management System</div>
        </div>
      </div>

      <a class="topbar-help" href="mailto:support@sarthaktech.in?subject=HMS%202027%20sign-in%20help">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Need help?
      </a>
    </header>

    <!-- ══ Main ══════════════════════════════════════════════════════════ -->
    <main class="main">
      <!-- ── Form column ───────────────────────────────────────────────── -->
      <section>
        <div class="form-head">
          <h1 class="form-title">Welcome back</h1>
          <p class="form-subtitle">{{ subtitle() }}</p>
        </div>

        <div class="card">
          <!-- Role tabs -->
          <div class="tabs" role="tablist" aria-label="Login type">
            <button
              type="button"
              role="tab"
              class="tab"
              [class.active]="role() === 'center'"
              [attr.aria-selected]="role() === 'center'"
              (click)="role.set('center')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18M5 21V7l7-4 7 4v14" />
                <path d="M10 12h4M12 10v4" />
              </svg>
              Center Login
            </button>

            <button
              type="button"
              role="tab"
              class="tab"
              [class.active]="role() === 'doctor'"
              [attr.aria-selected]="role() === 'doctor'"
              (click)="role.set('doctor')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2v6a6 6 0 0 0 12 0V2" />
                <path d="M12 14v3a4 4 0 0 0 8 0v-1" />
                <circle cx="20" cy="15" r="2" />
              </svg>
              Doctor Login
            </button>
          </div>

          <form class="form" (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate>
            <!-- Email -->
            <div class="field">
              <label class="field-label" for="email">Email address</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  class="field-input"
                  [placeholder]="emailPlaceholder()"
                  autocomplete="email"
                  [(ngModel)]="email"
                  required
                  email
                  #emailRef="ngModel"
                  [class.error]="emailRef.invalid && emailRef.touched"
                />
              </div>
              @if (emailRef.invalid && emailRef.touched) {
                <span class="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {{ emailRef.errors?.['required'] ? 'Email is required' : 'Enter a valid email' }}
                </span>
              }
            </div>

            <!-- Password -->
            <div class="field">
              <label class="field-label" for="password">Password</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  name="password"
                  class="field-input field-input--pw"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  [(ngModel)]="password"
                  required
                  minlength="6"
                  #passwordRef="ngModel"
                  [class.error]="passwordRef.invalid && passwordRef.touched"
                />
                <button
                  type="button"
                  class="toggle-btn"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  tabindex="-1"
                >
                  @if (showPassword()) {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  } @else {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                </button>
              </div>
              @if (passwordRef.invalid && passwordRef.touched) {
                <span class="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {{ passwordRef.errors?.['required'] ? 'Password is required' : 'Minimum 6 characters' }}
                </span>
              }
              <div class="field-foot">
                <button
                  type="button"
                  class="link-btn"
                  [attr.aria-expanded]="showReset()"
                  (click)="showReset.set(!showReset())"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            @if (showReset()) {
              <div class="reset-note" role="status">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
                <span>
                  Self-service reset isn't enabled yet. Ask your HMS administrator to set a new
                  password for your account.
                </span>
              </div>
            }

            @if (serverError()) {
              <div class="server-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {{ serverError() }}
              </div>
            }

            <button type="submit" class="submit-btn" [disabled]="loading() || loginForm.invalid">
              @if (loading()) {
                <span class="spinner"></span>Signing in…
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
                Sign in to HMS
              }
            </button>
          </form>
        </div>
      </section>

      <!-- ── Visual column ─────────────────────────────────────────────── -->
      <aside class="visual" aria-hidden="true">
        <div class="visual-inner">
          <h2 class="visual-heading">Smart Care.<br />Seamless Flow.</h2>
          <p class="visual-sub">
            One platform for Patient Registration, OPD, IPD, Lab, Pharmacy, Billing and
            Compliance — built for Indian hospitals.
          </p>

          <!-- Dashboard preview -->
          <svg class="mock" viewBox="0 0 480 300" role="img">
            <rect width="480" height="300" rx="12" fill="#ffffff" />
            <rect width="480" height="30" rx="12" fill="#f1f5f9" />
            <rect y="18" width="480" height="12" fill="#f1f5f9" />
            <circle cx="18" cy="15" r="3.5" fill="#cbd5e1" />
            <circle cx="30" cy="15" r="3.5" fill="#cbd5e1" />
            <circle cx="42" cy="15" r="3.5" fill="#cbd5e1" />
            <rect x="60" y="10" width="120" height="10" rx="5" fill="#e2e8f0" />

            <!-- sidebar -->
            <rect x="0" y="30" width="76" height="270" fill="#f8fafc" />
            <rect x="12" y="46" width="52" height="8" rx="4" fill="#dbeafe" />
            <rect x="12" y="66" width="44" height="6" rx="3" fill="#e2e8f0" />
            <rect x="12" y="82" width="50" height="6" rx="3" fill="#e2e8f0" />
            <rect x="12" y="98" width="40" height="6" rx="3" fill="#e2e8f0" />
            <rect x="12" y="114" width="48" height="6" rx="3" fill="#e2e8f0" />
            <rect x="12" y="130" width="36" height="6" rx="3" fill="#e2e8f0" />

            <!-- stat tiles -->
            <rect x="92" y="46" width="116" height="58" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text class="mock-label" x="104" y="66">OPD Today</text>
            <text class="mock-stat" x="104" y="90">128</text>

            <rect x="220" y="46" width="116" height="58" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text class="mock-label" x="232" y="66">Beds Free</text>
            <text class="mock-stat" x="232" y="90">24</text>

            <rect x="348" y="46" width="116" height="58" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text class="mock-label" x="360" y="66">Lab Pending</text>
            <text class="mock-stat" x="360" y="90">17</text>

            <!-- chart -->
            <rect x="92" y="120" width="244" height="160" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text class="mock-cap" x="104" y="140">Bed occupancy · this week</text>
            <rect x="108" y="228" width="20" height="36" rx="3" fill="#bfdbfe" />
            <rect x="140" y="210" width="20" height="54" rx="3" fill="#bfdbfe" />
            <rect x="172" y="190" width="20" height="74" rx="3" fill="#93c5fd" />
            <rect x="204" y="168" width="20" height="96" rx="3" fill="#60a5fa" />
            <rect x="236" y="182" width="20" height="82" rx="3" fill="#3b82f6" />
            <rect x="268" y="156" width="20" height="108" rx="3" fill="#2563eb" />
            <rect x="300" y="172" width="20" height="92" rx="3" fill="#1d4ed8" />
            <line x1="104" y1="268" x2="324" y2="268" stroke="#e2e8f0" stroke-width="1.5" />

            <!-- queue list -->
            <rect x="348" y="120" width="116" height="160" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text class="mock-cap" x="360" y="140">Triage queue</text>
            <circle cx="366" cy="158" r="4" fill="#dc2626" />
            <rect x="376" y="154" width="64" height="7" rx="3.5" fill="#e2e8f0" />
            <circle cx="366" cy="180" r="4" fill="#ca8a04" />
            <rect x="376" y="176" width="72" height="7" rx="3.5" fill="#e2e8f0" />
            <circle cx="366" cy="202" r="4" fill="#16a34a" />
            <rect x="376" y="198" width="56" height="7" rx="3.5" fill="#e2e8f0" />
            <circle cx="366" cy="224" r="4" fill="#16a34a" />
            <rect x="376" y="220" width="68" height="7" rx="3.5" fill="#e2e8f0" />
            <circle cx="366" cy="246" r="4" fill="#cbd5e1" />
            <rect x="376" y="242" width="60" height="7" rx="3.5" fill="#f1f5f9" />
          </svg>
        </div>

        <div class="features">
          <span class="feature-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Multi-role access
          </span>
          <span class="feature-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Bidirectional lab flow
          </span>
          <span class="feature-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Bill-Scan OCR
          </span>
          <span class="feature-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            NABH-ready compliance
          </span>
        </div>
      </aside>
    </main>

    <!-- ══ Footer ════════════════════════════════════════════════════════ -->
    <footer class="footer">
      <span>Powered for <strong>Dr. Krishna P Padagala</strong> · Sarthak Tech</span>
      <span>HMS 2027 · v1.0.0-beta</span>
    </footer>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  serverError = signal('');
  showPassword = signal(false);
  showReset = signal(false);

  /**
   * Presentational only — the API's /auth/login takes just email + password and
   * derives roles from the user record. Swap to a role-scoped call here once the
   * backend accepts one.
   */
  role = signal<LoginRole>('center');

  subtitle = computed(() =>
    this.role() === 'doctor'
      ? 'Sign in to view your OPD queue, orders and reports'
      : 'Sign in to your HMS account to continue',
  );

  emailPlaceholder = computed(() =>
    this.role() === 'doctor' ? 'doctor@hospital.org' : 'you@hospital.org',
  );

  onSubmit(): void {
    this.serverError.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.serverError.set(err?.error?.message ?? 'Invalid email or password.');
        this.loading.set(false);
      },
    });
  }
}
