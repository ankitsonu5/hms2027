import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'hms-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styles: [
    `
      :host {
        display: flex;
        min-height: 100vh;
        font-family: var(--font-body);
      }

      /* ── Left panel ─────────────────────────────────────────── */
      .left {
        flex: 1;
        background: linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px 52px;
        position: relative;
        overflow: hidden;
      }

      /* decorative blobs */
      .blob {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        pointer-events: none;
      }
      .blob-1 {
        width: 380px;
        height: 380px;
        top: -120px;
        right: -100px;
      }
      .blob-2 {
        width: 240px;
        height: 240px;
        bottom: 40px;
        left: -60px;
      }
      .blob-3 {
        width: 140px;
        height: 140px;
        bottom: 200px;
        right: 80px;
        background: rgba(255, 255, 255, 0.08);
      }

      /* grid dots */
      .dots {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
      }

      .left-top {
        position: relative;
        z-index: 1;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 64px;
      }
      .brand-logo {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .brand-name {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.01em;
      }
      .brand-tag {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
        letter-spacing: 0.04em;
        margin-top: 1px;
      }

      .hero-heading {
        font-family: var(--font-display);
        font-size: 2.4rem;
        font-weight: 800;
        color: #fff;
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin-bottom: 16px;
      }
      .hero-sub {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
        max-width: 360px;
        margin-bottom: 40px;
      }

      .features {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .feature-item {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .feature-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .feature-text {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 500;
      }

      .left-bottom {
        position: relative;
        z-index: 1;
      }
      .client-tag {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        letter-spacing: 0.03em;
      }
      .client-name {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
      }

      /* ── Right panel ─────────────────────────────────────────── */
      .right {
        width: 480px;
        min-width: 400px;
        background: #fff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 56px 52px;
        position: relative;
      }

      .form-head {
        margin-bottom: 36px;
      }
      .form-title {
        font-family: var(--font-display);
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }
      .form-subtitle {
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field-label {
        font-family: var(--font-label);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .input-wrap {
        position: relative;
      }
      .input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
      }

      .field-input {
        font-family: var(--font-body);
        font-size: 0.9375rem;
        color: var(--text-primary);
        background: var(--bg-base);
        border: 1.5px solid var(--border-default);
        border-radius: 10px;
        padding: 12px 14px 12px 42px;
        width: 100%;
        outline: none;
        transition:
          border-color 150ms ease,
          box-shadow 150ms ease,
          background 150ms ease;
        &::placeholder {
          color: var(--text-muted);
        }
        &:focus {
          border-color: var(--clr-primary-500);
          background: #fff;
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--clr-primary-500) 12%, transparent);
        }
        &.error {
          border-color: var(--clr-danger-600);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--clr-danger-600) 10%, transparent);
        }
      }

      .field-input--pw {
        padding-right: 44px;
      }

      .toggle-btn {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: var(--text-muted);
        cursor: pointer;
        transition:
          color 150ms ease,
          background 150ms ease;
      }
      .toggle-btn:hover {
        color: var(--clr-primary-500);
        background: color-mix(in srgb, var(--clr-primary-500) 10%, transparent);
      }

      .field-error {
        font-size: 0.75rem;
        color: var(--clr-danger-600);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .server-error {
        background: var(--clr-danger-100);
        color: var(--clr-danger-600);
        border: 1px solid color-mix(in srgb, var(--clr-danger-600) 20%, transparent);
        border-radius: 10px;
        padding: 12px 16px;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .submit-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #fff;
        border: none;
        border-radius: 10px;
        font-family: var(--font-body);
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition:
          opacity 150ms ease,
          transform 150ms ease,
          box-shadow 150ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 4px;
        box-shadow: 0 4px 12px color-mix(in srgb, #2563eb 35%, transparent);
        &:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px color-mix(in srgb, #2563eb 40%, transparent);
        }
        &:active:not(:disabled) {
          transform: translateY(0);
        }
        &:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }

      .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.65s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .form-footer {
        margin-top: 32px;
        text-align: center;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      /* responsive */
      @media (max-width: 860px) {
        :host {
          flex-direction: column;
        }
        .left {
          padding: 32px;
          min-height: auto;
        }
        .hero-heading {
          font-size: 1.75rem;
        }
        .features {
          display: none;
        }
        .right {
          width: 100%;
          min-width: unset;
          padding: 40px 32px;
        }
      }
    `,
  ],
  template: `
    <!-- ══ Left Panel ══════════════════════════════════════════ -->
    <div class="left">
      <div class="dots"></div>
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <div class="left-top">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-logo">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="3" y="11" width="20" height="4" rx="2" fill="white" />
              <rect x="11" y="3" width="4" height="20" rx="2" fill="white" />
            </svg>
          </div>
          <div>
            <div class="brand-name">HMS 2027</div>
            <div class="brand-tag">HOSPITAL MANAGEMENT SYSTEM</div>
          </div>
        </div>

        <!-- Hero -->
        <h1 class="hero-heading">Smart Care.<br />Seamless Flow.</h1>
        <p class="hero-sub">
          One platform for Patient Registration, OPD, IPD, Lab, Pharmacy, Billing and Compliance —
          built for Indian hospitals.
        </p>

        <!-- Feature bullets -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span class="feature-text">Multi-role access — Doctor, Nurse, Pharmacist & more</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 7h14l-4-7V3" />
              </svg>
            </div>
            <span class="feature-text">Integrated Lab with bidirectional result flow</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span class="feature-text">Bill-Scan OCR — stock entry in under 2 minutes</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span class="feature-text">NABH-ready compliance & govt scheme integration</span>
          </div>
        </div>
      </div>

      <div class="left-bottom">
        <p class="client-tag">
          Powered for <span class="client-name">Dr. Krishna P Padagala</span> · Sarthak Tech
        </p>
      </div>
    </div>

    <!-- ══ Right Panel ══════════════════════════════════════════ -->
    <div class="right">
      <div class="form-head">
        <h2 class="form-title">Welcome back</h2>
        <p class="form-subtitle">Sign in to your HMS account to continue</p>
      </div>

      <form class="form" (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate>
        <!-- Email -->
        <div class="field">
          <label class="field-label" for="email">Email address</label>
          <div class="input-wrap">
            <span class="input-icon">
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
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              name="email"
              class="field-input"
              placeholder="you@hospital.org"
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              } @else {
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
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
              {{
                passwordRef.errors?.['required'] ? 'Password is required' : 'Minimum 6 characters'
              }}
            </span>
          }
        </div>

        <!-- Server error -->
        @if (serverError()) {
          <div class="server-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {{ serverError() }}
          </div>
        }

        <!-- Submit -->
        <button type="submit" class="submit-btn" [disabled]="loading() || loginForm.invalid">
          @if (loading()) {
            <span class="spinner"></span>Signing in…
          } @else {
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Sign in to HMS
          }
        </button>
      </form>

      <p class="form-footer">HMS 2027 &nbsp;·&nbsp; Sarthak Tech &nbsp;·&nbsp; v1.0.0-beta</p>
    </div>
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
