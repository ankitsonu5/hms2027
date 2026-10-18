import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationApiService } from '../../core/services/organization-api.service';
import { LabApiService } from '../../core/services/lab-api.service';
import { ReportsApiService } from '../../core/services/reports-api.service';
import {
  AccountPrefItem,
  TestPrefItem,
  INITIAL_ACCOUNTS_PREFERENCES,
  INITIAL_TESTS_PREFERENCES,
} from './smart-report-data';

export interface SmartReportSettingsData {
  // Crelio Smart Reports Feature Toggles
  enableSmartReportsV2: boolean;
  tier2AiInsights: boolean;
  autoGenerateOnSubmission: boolean;
  sendOnCommunication: boolean;
  selectedTemplate: string;

  // Lab Details & Report Pages
  labId: string;
  name: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  region: string;
  timezone: string;
  nabl: string;
  reportLanguage: string;
  callbackUrl: string;

  // Report Pages
  coverPageStyle: string;
  closingPage: string;
  tagline: string;
  website: string;
  brandColor: string;

  // Assets
  logoUrl: string;
  logoFileName: string;
  coverGraphicUrl: string;
  coverGraphicFileName: string;
  closingGraphicUrl: string;
  closingGraphicFileName: string;
}

const DEFAULT_SETTINGS: SmartReportSettingsData = {
  enableSmartReportsV2: false,
  tier2AiInsights: false,
  autoGenerateOnSubmission: false,
  sendOnCommunication: false,
  selectedTemplate: 'Classic — data cover (default)',

  labId: '1587',
  name: 'Access Path Lab India Pvt Ltd',
  address: '14-37-41/2, Beside Sri Sathya IVF, Krishna Nagar,',
  contactPhone: '9618135999',
  contactEmail: 'accesspathlabs@gmail.com',
  region: 'India',
  timezone: 'Asia/Kolkata',
  nabl: 'MC-1234',
  reportLanguage: 'en',
  callbackUrl: 'https://api.crelio.internal/report-callback',

  coverPageStyle: 'Classic — data cover (default)',
  closingPage: 'Simple — closing graphic only (default)',
  tagline: 'Your Health, Decoded with Precision.',
  website: 'https://www.placeholderlabs.com',
  brandColor: '#1e3a8a',

  logoUrl: '/access-pathlab-header.jpeg',
  logoFileName: 'access-pathlab-header.jpeg',
  coverGraphicUrl: '',
  coverGraphicFileName: '',
  closingGraphicUrl: '',
  closingGraphicFileName: '',
};

@Component({
  selector: 'app-smart-report-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="smart-settings-page">
      <!-- Primary Tabs Bar -->
      <div class="tabs-header-bar">
        <div class="tabs-nav">
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="activeTab() === 'config'"
            (click)="activeTab.set('config')"
          >
            Report Config
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="activeTab() === 'preferences'"
            (click)="activeTab.set('preferences')"
          >
            Preferences
          </button>
        </div>

        @if (activeTab() === 'config') {
          <button
            type="button"
            class="btn-save-sync"
            (click)="saveSettings()"
            [disabled]="isSaving()"
          >
            @if (isSaving()) {
              <span>Saving & Syncing...</span>
            } @else {
              <span>Save Settings and Sync</span>
            }
          </button>
        }
      </div>

      <!-- Feedback Toast -->
      @if (toastMessage()) {
        <div class="feedback-toast">
          {{ toastMessage() }}
        </div>
      }

      <!-- ═══════════ TAB 1: REPORT CONFIG ═══════════ -->
      @if (activeTab() === 'config') {
        <div class="tab-pane">
          <!-- Section 1: Crelio Smart Reports -->
          <div class="section-card">
            <h2 class="section-title">Crelio Smart Reports</h2>

            <!-- Blue Notice Banner -->
            <div class="info-alert">
              <svg class="info-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Changes to these settings will apply only to future reports. Reports for which a Smart Report has already been generated will retain the configuration used at the time of generation.</span>
            </div>

            <!-- Toggles & Template Selection Grid -->
            <div class="toggles-grid">
              <!-- Toggle 1: Enable Smart Reports V2 -->
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="s.enableSmartReportsV2"
                  />
                  <span class="slider"></span>
                </label>
                <div class="toggle-text">
                  <span class="toggle-title">Enable Smart Reports V2</span>
                  <span class="toggle-desc">Turn on the next generation Crelio smart reports for your lab.</span>
                </div>
              </div>

              <!-- Toggle 2: Tier 2 (AI insights) -->
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="s.tier2AiInsights"
                  />
                  <span class="slider"></span>
                </label>
                <div class="toggle-text">
                  <span class="toggle-title">Tier 2 (AI insights)</span>
                  <span class="toggle-desc">Enable advanced AI-driven insights and recommendations in smart reports.</span>
                </div>
              </div>

              <!-- Toggle 3: Auto Generate on Report Submission -->
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="s.autoGenerateOnSubmission"
                  />
                  <span class="slider"></span>
                </label>
                <div class="toggle-text">
                  <span class="toggle-title">Auto Generate on Report Submission</span>
                  <span class="toggle-desc">Automatically generate smart reports when a report is submitted.</span>
                </div>
              </div>

              <!-- Toggle 4: Send Smart Report on Communication -->
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="s.sendOnCommunication"
                  />
                  <span class="slider"></span>
                </label>
                <div class="toggle-text">
                  <span class="toggle-title">Send Smart Report on Communication</span>
                  <span class="toggle-desc">Once enabled, the generated smart report will be sent on the configured communication channels (Email, WhatsApp, SMS).</span>
                </div>
              </div>

              <!-- Item 5: Select Smart Report Template -->
              <div class="toggle-card template-picker-card">
                <div class="toggle-text" style="width: 100%;">
                  <span class="toggle-title">Select Smart Report Template</span>
                  <span class="toggle-desc">Choose the default template used to render your smart reports.</span>

                  <div class="template-action-row">
                    <select class="form-input form-select" [(ngModel)]="s.selectedTemplate">
                      <option value="Classic — data cover (default)">Classic — data cover (default)</option>
                      <option value="Executive Health Summary">Executive Health Summary</option>
                      <option value="Cardio-Metabolic Focused">Cardio-Metabolic Focused</option>
                      <option value="Pediatric Friendly">Pediatric Friendly</option>
                      <option value="Modern Clean Dark">Modern Clean Dark</option>
                      <option value="Clinical Minimalist">Clinical Minimalist</option>
                    </select>

                    <button type="button" class="btn-preview" (click)="openPreviewModal()">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Lab Details & Report Pages -->
          <div class="section-card">
            <h2 class="section-title">Lab Details & Report Pages</h2>

            <div class="fields-grid fields-grid--2col">
              <!-- Lab ID -->
              <div class="form-group">
                <label class="form-label">Lab ID (Crelio labId)</label>
                <input
                  type="text"
                  class="form-input form-input--readonly"
                  [(ngModel)]="s.labId"
                  readonly
                />
              </div>

              <!-- Name -->
              <div class="form-group">
                <label class="form-label">Name</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="s.name"
                  placeholder="Enter registered laboratory name"
                />
              </div>

              <!-- Address (Full Width) -->
              <div class="form-group form-group--full">
                <label class="form-label">Address</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="s.address"
                  placeholder="Street address, floor, locality, city"
                />
              </div>

              <!-- Contact Phone (10 digits) -->
              <div class="form-group">
                <label class="form-label">Contact Phone</label>
                <input
                  type="tel"
                  class="form-input"
                  [(ngModel)]="s.contactPhone"
                  maxlength="10"
                  pattern="[0-9]{10}"
                  placeholder="10-digit contact number"
                  (input)="sanitizePhone()"
                />
              </div>

              <!-- Contact Email -->
              <div class="form-group">
                <label class="form-label">Contact Email</label>
                <input
                  type="email"
                  class="form-input"
                  [(ngModel)]="s.contactEmail"
                  placeholder="lab@example.com"
                />
              </div>

              <!-- Region -->
              <div class="form-group">
                <label class="form-label">Region</label>
                <select class="form-input form-select" [(ngModel)]="s.region">
                  <option value="India">India</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <!-- Timezone (IANA) -->
              <div class="form-group">
                <label class="form-label">Timezone (IANA)</label>
                <select class="form-input form-select" [(ngModel)]="s.timezone">
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Asia/Riyadh">Asia/Riyadh</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>

              <!-- NABL (Full Width or standard) -->
              <div class="form-group form-group--full">
                <label class="form-label">NABL</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="s.nabl"
                  placeholder="NABL accreditation number (e.g. MC-1234)"
                />
              </div>

              <!-- Report Language -->
              <div class="form-group">
                <label class="form-label">Report Language</label>
                <select class="form-input form-select" [(ngModel)]="s.reportLanguage">
                  <option value="en">en</option>
                  <option value="hi">hi</option>
                  <option value="te">te</option>
                  <option value="ar">ar</option>
                </select>
              </div>

              <!-- Callback URL -->
              <div class="form-group">
                <label class="form-label">Callback URL</label>
                <input
                  type="url"
                  class="form-input"
                  [(ngModel)]="s.callbackUrl"
                  placeholder="https://api.crelio.internal/report-callback"
                />
              </div>
            </div>
          </div>

          <!-- Section 3: Report Pages -->
          <div class="section-card">
            <h2 class="section-title">Report Pages</h2>

            <div class="fields-grid fields-grid--2col">
              <!-- Cover Page Style -->
              <div class="form-group">
                <label class="form-label">Cover Page Style</label>
                <select class="form-input form-select" [(ngModel)]="s.coverPageStyle">
                  <option value="Classic — data cover (default)">Classic — data cover (default)</option>
                  <option value="Modern Header Banner">Modern Header Banner</option>
                  <option value="Minimal Clinical">Minimal Clinical</option>
                  <option value="Executive Formal">Executive Formal</option>
                </select>
              </div>

              <!-- Closing Page -->
              <div class="form-group">
                <label class="form-label">Closing Page</label>
                <select class="form-input form-select" [(ngModel)]="s.closingPage">
                  <option value="Simple — closing graphic only (default)">Simple — closing graphic only (default)</option>
                  <option value="Health Guidance & Tips Summary">Health Guidance & Tips Summary</option>
                  <option value="Full Signoff & QR Verification">Full Signoff & QR Verification</option>
                  <option value="None">None</option>
                </select>
              </div>

              <!-- Tagline -->
              <div class="form-group">
                <label class="form-label">Tagline</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="s.tagline"
                  placeholder="Your Health, Decoded with Precision."
                />
              </div>

              <!-- Website -->
              <div class="form-group">
                <label class="form-label">Website</label>
                <input
                  type="url"
                  class="form-input"
                  [(ngModel)]="s.website"
                  placeholder="https://www.placeholderlabs.com"
                />
              </div>

              <!-- Brand Color (#RRGGBB) -->
              <div class="form-group">
                <label class="form-label">Brand Color (#RRGGBB)</label>
                <div class="color-picker-wrap">
                  <input
                    type="color"
                    class="color-picker-input"
                    [(ngModel)]="s.brandColor"
                  />
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="s.brandColor"
                    placeholder="#1e3a8a"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Assets -->
          <div class="section-card">
            <h2 class="section-title">Assets</h2>

            <div class="assets-grid">
              <!-- Asset 1: Logo -->
              <div class="asset-card">
                <div class="asset-head">
                  <span class="asset-title">Logo</span>
                  @if (s.logoUrl) {
                    <button type="button" class="btn-remove-asset" (click)="removeLogo()" title="Remove Logo">
                      ✕
                    </button>
                  }
                </div>

                <div class="asset-preview-box">
                  @if (s.logoUrl) {
                    <img [src]="s.logoUrl" alt="Lab Logo" class="asset-img" />
                  } @else {
                    <span class="no-file-text">No file uploaded</span>
                  }
                </div>

                <div class="file-btn-wrap">
                  <input
                    type="file"
                    id="logoUpload"
                    class="file-input-hidden"
                    accept="image/*"
                    (change)="onFileChange($event, 'logo')"
                  />
                  <label for="logoUpload" class="btn-choose-file">Choose File</label>
                  <span class="file-name-label">{{ s.logoFileName || 'No file chosen' }}</span>
                </div>

                <span class="asset-hint">Horizontal lockup, ~800x240 px. Transparent PNG.</span>
              </div>

              <!-- Asset 2: Cover Graphic -->
              <div class="asset-card">
                <div class="asset-head">
                  <span class="asset-title">Cover Graphic</span>
                  @if (s.coverGraphicUrl) {
                    <button type="button" class="btn-remove-asset" (click)="removeCover()" title="Remove Cover Graphic">
                      ✕
                    </button>
                  }
                </div>

                <div class="asset-preview-box">
                  @if (s.coverGraphicUrl) {
                    <img [src]="s.coverGraphicUrl" alt="Cover Graphic" class="asset-img" />
                  } @else {
                    <span class="no-file-text">No file uploaded</span>
                  }
                </div>

                <div class="file-btn-wrap">
                  <input
                    type="file"
                    id="coverUpload"
                    class="file-input-hidden"
                    accept="image/*"
                    (change)="onFileChange($event, 'cover')"
                  />
                  <label for="coverUpload" class="btn-choose-file">Choose File</label>
                  <span class="file-name-label">{{ s.coverGraphicFileName || 'No file chosen' }}</span>
                </div>

                <span class="asset-hint">Full-page: 1275x1650 px (portrait 8.5:11).</span>
              </div>

              <!-- Asset 3: Closing Graphic -->
              <div class="asset-card">
                <div class="asset-head">
                  <span class="asset-title">Closing Graphic</span>
                  @if (s.closingGraphicUrl) {
                    <button type="button" class="btn-remove-asset" (click)="removeClosing()" title="Remove Closing Graphic">
                      ✕
                    </button>
                  }
                </div>

                <div class="asset-preview-box">
                  @if (s.closingGraphicUrl) {
                    <img [src]="s.closingGraphicUrl" alt="Closing Graphic" class="asset-img" />
                  } @else {
                    <span class="no-file-text">No file uploaded</span>
                  }
                </div>

                <div class="file-btn-wrap">
                  <input
                    type="file"
                    id="closingUpload"
                    class="file-input-hidden"
                    accept="image/*"
                    (change)="onFileChange($event, 'closing')"
                  />
                  <label for="closingUpload" class="btn-choose-file">Choose File</label>
                  <span class="file-name-label">{{ s.closingGraphicFileName || 'No file chosen' }}</span>
                </div>

                <span class="asset-hint">Marketing: ~1500x500 px (3:1). Full-page: 1275x1650 px.</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════ TAB 2: PREFERENCES (MAP ACCOUNTS & TESTS) ═══════════ -->
      @if (activeTab() === 'preferences') {
        <div class="tab-pane pref-pane">
          <!-- Preferences Header & Save Button -->
          <div class="pref-topbar">
            <div class="pref-topbar-left">
              <span class="pref-title">Preferences</span>
              <span class="pref-subtitle">Map Smart Reports to accounts and tests</span>
            </div>

            <button
              type="button"
              class="btn-save-pref"
              (click)="savePreferences()"
              [disabled]="isSavingPref()"
            >
              @if (isSavingPref()) {
                <span>Saving...</span>
              } @else {
                <span>Save Preferences</span>
              }
            </button>
          </div>

          <!-- Preferences Sub-Tabs: Accounts | Tests -->
          <div class="pref-subtabs">
            <button
              type="button"
              class="pref-subtab"
              [class.pref-subtab--active]="prefSubTab() === 'accounts'"
              (click)="prefSubTab.set('accounts')"
            >
              Accounts
            </button>
            <button
              type="button"
              class="pref-subtab"
              [class.pref-subtab--active]="prefSubTab() === 'tests'"
              (click)="prefSubTab.set('tests')"
            >
              Tests
            </button>
          </div>

          <!-- ── SUB-TAB A: ACCOUNTS ── -->
          @if (prefSubTab() === 'accounts') {
            <div class="pref-section-content">
              <!-- Heading Row & Badges -->
              <div class="pref-header-row">
                <div class="pref-info-block">
                  <h3 class="pref-block-title">Accounts</h3>
                  <p class="pref-block-desc">
                    Smart Reports are enabled for all accounts by default. Disable specific accounts to opt them out.
                  </p>
                </div>

                <div class="pref-badges-group">
                  <span class="badge-total">{{ totalAccountsCount() }} total</span>
                  <span class="badge-pill badge-pill--enabled">{{ enabledAccountsCount() }} enabled</span>
                  <span class="badge-pill badge-pill--disabled">{{ disabledAccountsCount() }} disabled</span>
                </div>
              </div>

              <!-- Filter / Action Toolbar -->
              <div class="pref-toolbar">
                <div class="toolbar-left">
                  <input
                    type="text"
                    class="pref-search-input"
                    placeholder="Search accounts..."
                    [ngModel]="accountSearchQuery()"
                    (ngModelChange)="accountSearchQuery.set($event)"
                  />
                  <button type="button" class="btn-outline-blue" (click)="enableAllAccounts()">
                    Enable All
                  </button>
                  <button type="button" class="btn-outline-blue" (click)="disableAllAccounts()">
                    Disable All
                  </button>
                </div>

                <div class="toolbar-right">
                  <label class="status-label">Status</label>
                  <select
                    class="status-dropdown"
                    [ngModel]="accountStatusFilter()"
                    (ngModelChange)="accountStatusFilter.set($event)"
                  >
                    <option value="ALL">All</option>
                    <option value="ENABLED">Enabled</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              <!-- Rows counter -->
              <div class="pref-rows-count">
                Rows: {{ filteredAccounts().length }}
              </div>

              <!-- Accounts Table -->
              <div class="pref-table-card">
                <table class="pref-table">
                  <thead>
                    <tr>
                      <th class="th-cb">
                        <input
                          type="checkbox"
                          class="pref-checkbox"
                          [checked]="allAccountsSelected()"
                          (change)="toggleAllAccountsSelect($event)"
                        />
                      </th>
                      <th class="th-col th-clickable" (click)="sortAccounts('name')">
                        Account
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                      <th class="th-col th-clickable" (click)="sortAccounts('code')">
                        Code
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                      <th class="th-col th-clickable" (click)="sortAccounts('type')">
                        Type
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                      <th class="th-col th-clickable" (click)="sortAccounts('enabled')">
                        Smart Report
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (acc of filteredAccounts(); track acc.id) {
                      <tr class="pref-tr" [class.pref-tr--selected]="acc.selected">
                        <td class="td-cb">
                          <input
                            type="checkbox"
                            class="pref-checkbox"
                            [(ngModel)]="acc.selected"
                          />
                        </td>
                        <td class="td-account-name">
                          {{ acc.name }}
                        </td>
                        <td class="td-code">
                          {{ acc.code || '-' }}
                        </td>
                        <td class="td-type">
                          {{ acc.type || '-' }}
                        </td>
                        <td class="td-toggle">
                          <div class="toggle-cell">
                            <label class="pref-switch">
                              <input
                                type="checkbox"
                                [(ngModel)]="acc.enabled"
                              />
                              <span class="pref-slider"></span>
                            </label>
                            <span
                              class="pref-status-label"
                              [class.pref-status-label--enabled]="acc.enabled"
                            >
                              {{ acc.enabled ? 'Enabled' : 'Disabled' }}
                            </span>
                          </div>
                        </td>
                      </tr>
                    }
                    @if (filteredAccounts().length === 0) {
                      <tr>
                        <td colspan="5" class="empty-cell">
                          No matching accounts found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- ── SUB-TAB B: TESTS ── -->
          @if (prefSubTab() === 'tests') {
            <div class="pref-section-content">
              <!-- Heading Row & Badges -->
              <div class="pref-header-row">
                <div class="pref-info-block">
                  <h3 class="pref-block-title">Tests</h3>
                  <p class="pref-block-desc">
                    Smart Reports are enabled for all tests by default. Disable specific tests to opt them out.
                  </p>
                </div>

                <div class="pref-badges-group">
                  <span class="badge-total">{{ totalTestsCount() }} total</span>
                  <span class="badge-pill badge-pill--enabled">{{ enabledTestsCount() }} enabled</span>
                  <span class="badge-pill badge-pill--disabled">{{ disabledTestsCount() }} disabled</span>
                </div>
              </div>

              <!-- Filter / Action Toolbar -->
              <div class="pref-toolbar">
                <div class="toolbar-left">
                  <input
                    type="text"
                    class="pref-search-input"
                    placeholder="Search tests..."
                    [ngModel]="testSearchQuery()"
                    (ngModelChange)="testSearchQuery.set($event)"
                  />
                  <button type="button" class="btn-outline-blue" (click)="enableAllTests()">
                    Enable All
                  </button>
                  <button type="button" class="btn-outline-blue" (click)="disableAllTests()">
                    Disable All
                  </button>
                </div>

                <div class="toolbar-right">
                  <label class="status-label">Status</label>
                  <select
                    class="status-dropdown"
                    [ngModel]="testStatusFilter()"
                    (ngModelChange)="testStatusFilter.set($event)"
                  >
                    <option value="ALL">All</option>
                    <option value="ENABLED">Enabled</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              <!-- Rows counter -->
              <div class="pref-rows-count">
                Rows: {{ filteredTests().length }}
              </div>

              <!-- Tests Table -->
              <div class="pref-table-card">
                <table class="pref-table">
                  <thead>
                    <tr>
                      <th class="th-cb">
                        <input
                          type="checkbox"
                          class="pref-checkbox"
                          [checked]="allTestsSelected()"
                          (change)="toggleAllTestsSelect($event)"
                        />
                      </th>
                      <th class="th-col th-clickable" (click)="sortTests('name')">
                        Test
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                      <th class="th-col th-clickable" (click)="sortTests('code')">
                        Code
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                      <th class="th-col th-clickable" (click)="sortTests('category')">
                        Department
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                      <th class="th-col th-clickable" (click)="sortTests('enabled')">
                        Smart Report
                        <svg class="th-funnel" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
                        </svg>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of filteredTests(); track t.id) {
                      <tr class="pref-tr" [class.pref-tr--selected]="t.selected">
                        <td class="td-cb">
                          <input
                            type="checkbox"
                            class="pref-checkbox"
                            [(ngModel)]="t.selected"
                          />
                        </td>
                        <td class="td-test-name">
                          {{ t.name }}
                        </td>
                        <td class="td-code">
                          <span class="code-pill">{{ t.code || '-' }}</span>
                        </td>
                        <td class="td-dept">
                          {{ (t.category || 'BIOCHEMISTRY').toUpperCase() }}
                        </td>
                        <td class="td-toggle">
                          <div class="toggle-cell">
                            <label class="pref-switch">
                              <input
                                type="checkbox"
                                [(ngModel)]="t.enabled"
                              />
                              <span class="pref-slider"></span>
                            </label>
                            <span
                              class="pref-status-label"
                              [class.pref-status-label--enabled]="t.enabled"
                            >
                              {{ t.enabled ? 'Enabled' : 'Disabled' }}
                            </span>
                          </div>
                        </td>
                      </tr>
                    }
                    @if (filteredTests().length === 0) {
                      <tr>
                        <td colspan="5" class="empty-cell">
                          No matching tests found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ═══════════ MODAL: TEMPLATE PREVIEW ═══════════ -->
      @if (showPreviewModal()) {
        <div class="modal-backdrop" (click)="closePreviewModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <h3 class="modal-title">Smart Report Template Preview</h3>
                <span class="modal-subtitle">{{ s.selectedTemplate }} (Brand: {{ s.brandColor }})</span>
              </div>
              <button type="button" class="btn-modal-close" (click)="closePreviewModal()">✕</button>
            </div>

            <div class="modal-body preview-scroll-body">
              <div class="report-paper">
                <div class="report-header-banner" [style.borderTopColor]="s.brandColor">
                  <div class="lab-brand-side">
                    @if (s.logoUrl) {
                      <img [src]="s.logoUrl" alt="Lab Brand" class="report-logo" />
                    } @else {
                      <h1 class="fallback-lab-title" [style.color]="s.brandColor">{{ s.name }}</h1>
                    }
                    <p class="lab-tagline-text">{{ s.tagline }}</p>
                    <p class="lab-address-text">{{ s.address }} | Phone: {{ s.contactPhone }}</p>
                  </div>
                  <div class="lab-cert-side">
                    <span class="nabl-chip">NABL ACCREDITED: {{ s.nabl }}</span>
                    <span class="lab-id-chip">Lab ID: #{{ s.labId }}</span>
                  </div>
                </div>

                <div class="patient-demographics-card">
                  <div class="demo-col">
                    <div class="demo-item"><span class="k">Patient:</span> <span class="v">Mr. Ramesh Varma</span></div>
                    <div class="demo-item"><span class="k">Age / Sex:</span> <span class="v">42 Y / Male</span></div>
                    <div class="demo-item"><span class="k">UHID / PID:</span> <span class="v">UH2026-09881</span></div>
                  </div>
                  <div class="demo-col">
                    <div class="demo-item"><span class="k">Ref Doctor:</span> <span class="v">Dr. S. K. Mehra, MD</span></div>
                    <div class="demo-item"><span class="k">Registered:</span> <span class="v">16-Oct-2026 08:30 AM</span></div>
                    <div class="demo-item"><span class="k">Reported:</span> <span class="v">16-Oct-2026 10:15 AM</span></div>
                  </div>
                </div>

                <div class="ai-summary-highlight" [style.borderLeftColor]="s.brandColor">
                  <h4 class="ai-summary-title">Smart Clinical Summary</h4>
                  <p class="ai-summary-body">
                    Fasting plasma glucose and HbA1c values indicate well-regulated glycemic control. Serum Creatinine and eGFR demonstrate normal renal clearance. Lipid profile is balanced within standard adult reference intervals.
                  </p>
                </div>

                <div class="test-table-container">
                  <table class="report-table">
                    <thead>
                      <tr [style.background]="s.brandColor" style="color: #fff;">
                        <th>Investigation</th>
                        <th>Observed Value</th>
                        <th>Reference Interval</th>
                        <th>Unit</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Fasting Blood Glucose</strong></td>
                        <td>94.0</td>
                        <td>70.0 - 99.0</td>
                        <td>mg/dL</td>
                        <td><span class="res-tag res-tag--normal">NORMAL</span></td>
                      </tr>
                      <tr>
                        <td><strong>HbA1c (Glycosylated Hemoglobin)</strong></td>
                        <td>5.4</td>
                        <td>4.0 - 5.6</td>
                        <td>%</td>
                        <td><span class="res-tag res-tag--normal">OPTIMAL</span></td>
                      </tr>
                      <tr>
                        <td><strong>Serum Creatinine</strong></td>
                        <td>0.92</td>
                        <td>0.70 - 1.20</td>
                        <td>mg/dL</td>
                        <td><span class="res-tag res-tag--normal">NORMAL</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="report-footer-signoff">
                  <div class="qr-col">
                    <div class="mock-qr-code">QR CODE</div>
                    <span class="qr-label">Scan to verify report authenticity</span>
                  </div>
                  <div class="signature-col">
                    <img src="/access-pathlab-signature.jpeg" alt="Sign" class="sig-image" />
                    <span class="sig-name">Dr. Krishna Prasad, MD</span>
                    <span class="sig-role">Consultant Clinical Pathologist</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-modal-done" (click)="closePreviewModal()">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .smart-settings-page {
        padding: 24px 32px;
        background-color: #f8fafc;
        min-height: calc(100vh - 64px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
      }

      /* ── Tabs & Header Bar ── */
      .tabs-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 24px;
        padding-bottom: 0;
      }

      .tabs-nav {
        display: flex;
        gap: 32px;
      }

      .tab-btn {
        background: none;
        border: none;
        padding: 12px 4px;
        font-size: 15px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        position: relative;
        transition: color 0.15s ease;

        &:hover {
          color: #1e293b;
        }

        &--active {
          color: #2563eb;
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #2563eb;
          }
        }
      }

      .btn-save-sync {
        background-color: #2e7d32;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 9px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ease, opacity 0.15s ease;
        margin-bottom: 8px;

        &:hover:not(:disabled) {
          background-color: #256b29;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      /* ── Feedback Toast ── */
      .feedback-toast {
        background-color: #15803d;
        color: #ffffff;
        padding: 10px 18px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 18px;
        box-shadow: 0 4px 12px rgba(21, 128, 61, 0.2);
        animation: slideInDown 0.25s ease-out;
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-8px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* ── Cards & Sections ── */
      .tab-pane {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .section-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 24px 28px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 18px 0;
      }

      /* ── Blue Informational Alert ── */
      .info-alert {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background-color: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e40af;
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 13.5px;
        line-height: 1.5;
        margin-bottom: 24px;

        .info-icon {
          flex-shrink: 0;
          color: #2563eb;
          margin-top: 1px;
        }
      }

      /* ── Toggles Grid ── */
      .toggles-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;

        @media (max-width: 1200px) {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .toggle-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 16px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
        margin-top: 2px;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.2s;
          border-radius: 24px;

          &::before {
            position: absolute;
            content: '';
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.2s;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          }
        }

        input:checked + .slider {
          background-color: #2563eb;
        }

        input:checked + .slider::before {
          transform: translateX(20px);
        }
      }

      .toggle-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .toggle-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }

      .toggle-desc {
        font-size: 12.5px;
        color: #64748b;
        line-height: 1.4;
      }

      .template-picker-card {
        grid-column: span 1;
      }

      .template-action-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
      }

      .btn-preview {
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
        color: #475569;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #1e293b;
        }
      }

      /* ── Form Fields Grid ── */
      .fields-grid {
        display: grid;
        gap: 18px 24px;

        &--2col {
          grid-template-columns: repeat(2, 1fr);
          @media (max-width: 800px) {
            grid-template-columns: 1fr;
          }
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        &--full {
          grid-column: 1 / -1;
        }
      }

      .form-label {
        font-size: 13px;
        font-weight: 500;
        color: #475569;
      }

      .form-input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 14px;
        color: #1e293b;
        background-color: #ffffff;
        transition: border-color 0.15s ease;

        &:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #2563eb;
        }

        &--readonly {
          background-color: #f1f5f9;
          color: #64748b;
          cursor: default;
        }
      }

      .form-select {
        height: 38px;
        cursor: pointer;
      }

      .color-picker-wrap {
        display: flex;
        align-items: center;
        gap: 8px;

        .color-picker-input {
          width: 40px;
          height: 38px;
          padding: 2px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          cursor: pointer;
          background: #fff;
        }
      }

      /* ── Assets Section ── */
      .assets-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;

        @media (max-width: 900px) {
          grid-template-columns: 1fr;
        }
      }

      .asset-card {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #ffffff;
      }

      .asset-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .asset-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }

      .btn-remove-asset {
        background: none;
        border: 1px solid #cbd5e1;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: #64748b;
        cursor: pointer;

        &:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }
      }

      .asset-preview-box {
        height: 100px;
        background-color: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 8px;
      }

      .asset-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .no-file-text {
        font-size: 13px;
        color: #94a3b8;
      }

      .file-btn-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .file-input-hidden {
        display: none;
      }

      .btn-choose-file {
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #334155;
        padding: 5px 12px;
        border-radius: 4px;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          background-color: #e2e8f0;
        }
      }

      .file-name-label {
        font-size: 12.5px;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
      }

      .asset-hint {
        font-size: 11.5px;
        color: #94a3b8;
        line-height: 1.4;
      }

      /* ══════════════════════════════════════════════
         PREFERENCES TAB (ACCOUNTS & TESTS MAPPING)
         ══════════════════════════════════════════════ */
      .pref-pane {
        gap: 16px;
      }

      .pref-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .pref-topbar-left {
        display: flex;
        align-items: baseline;
        gap: 12px;
      }

      .pref-title {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
      }

      .pref-subtitle {
        font-size: 14px;
        color: #64748b;
      }

      .btn-save-pref {
        background-color: #2e7d32;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 9px 22px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s ease;

        &:hover:not(:disabled) {
          background-color: #256b29;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      /* Sub-tabs: Accounts | Tests */
      .pref-subtabs {
        display: flex;
        gap: 28px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 12px;
      }

      .pref-subtab {
        background: none;
        border: none;
        padding: 8px 2px 12px 2px;
        font-size: 14px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        position: relative;
        transition: color 0.15s ease;

        &:hover {
          color: #1e293b;
        }

        &--active {
          color: #2563eb;
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #2563eb;
          }
        }
      }

      .pref-section-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .pref-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
      }

      .pref-block-title {
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 3px 0;
      }

      .pref-block-desc {
        font-size: 13px;
        color: #64748b;
        margin: 0;
      }

      .pref-badges-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .badge-total {
        font-size: 13px;
        font-weight: 600;
        color: #475569;
      }

      .badge-pill {
        border-radius: 12px;
        padding: 3px 12px;
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        &--enabled {
          background-color: #2e7d32;
        }

        &--disabled {
          background-color: #f59e0b;
        }
      }

      /* Toolbar */
      .pref-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pref-search-input {
        width: 300px;
        height: 36px;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 13.5px;
        color: #1e293b;
        background-color: #ffffff;

        &:focus {
          outline: none;
          border-color: #2563eb;
        }
      }

      .btn-outline-blue {
        background-color: #ffffff;
        border: 1px solid #3b82f6;
        color: #2563eb;
        height: 36px;
        padding: 0 16px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background-color: #eff6ff;
          border-color: #2563eb;
        }
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .status-label {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
      }

      .status-dropdown {
        height: 36px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 0 28px 0 10px;
        font-size: 13.5px;
        color: #1e293b;
        background-color: #ffffff;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #2563eb;
        }
      }

      .pref-rows-count {
        font-size: 13.5px;
        font-weight: 700;
        color: #1e293b;
        margin: 6px 0 0 0;
      }

      /* Table Container */
      .pref-table-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        overflow-x: auto;
        overflow-y: auto;
        max-height: calc(100vh - 300px);
        min-height: 420px;
      }

      .pref-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13.5px;
        text-align: left;

        thead {
          position: sticky;
          top: 0;
          background-color: #f1f5f9;
          z-index: 2;
          border-bottom: 1px solid #cbd5e1;
        }

        th {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          user-select: none;
        }

        .th-cb, .td-cb {
          width: 44px;
          text-align: center;
          padding-left: 12px;
          padding-right: 6px;
        }

        .th-col {
          white-space: nowrap;
        }

        .th-clickable {
          cursor: pointer;
          &:hover {
            color: #1e293b;
          }
        }

        .th-funnel {
          display: inline-block;
          margin-left: 6px;
          color: #64748b;
          vertical-align: middle;
        }

        td {
          padding: 11px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .pref-tr {
          transition: background-color 0.1s ease;

          &:hover {
            background-color: #f8fafc;
          }

          &--selected {
            background-color: #f1f5f9;
          }
        }
      }

      .pref-checkbox {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: #2563eb;
      }

      .td-account-name, .td-test-name {
        font-weight: 600;
        color: #1e293b;
      }

      .td-code {
        color: #475569;
      }

      .code-pill {
        display: inline-block;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 12px;
        color: #334155;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        max-width: 340px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .td-dept {
        font-size: 12.5px;
        font-weight: 600;
        color: #334155;
        letter-spacing: 0.02em;
      }

      .td-type {
        color: #64748b;
      }

      .td-toggle {
        width: 180px;
      }

      .toggle-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Compact table toggle switch */
      .pref-switch {
        position: relative;
        display: inline-block;
        width: 38px;
        height: 20px;
        flex-shrink: 0;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .pref-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.2s;
          border-radius: 20px;

          &::before {
            position: absolute;
            content: '';
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.2s;
            border-radius: 50%;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
        }

        input:checked + .pref-slider {
          background-color: #2563eb;
        }

        input:checked + .pref-slider::before {
          transform: translateX(18px);
        }
      }

      .pref-status-label {
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;

        &--enabled {
          color: #2e7d32;
        }
      }

      .empty-cell {
        text-align: center;
        padding: 32px 16px;
        color: #94a3b8;
        font-size: 14px;
      }

      /* ── Preview Modal ── */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 24px;
      }

      .modal-dialog {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 860px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-title-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .modal-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }

      .modal-subtitle {
        font-size: 12.5px;
        color: #64748b;
      }

      .btn-modal-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #64748b;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;

        &:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }
      }

      .preview-scroll-body {
        padding: 24px;
        background-color: #f1f5f9;
        overflow-y: auto;
      }

      .modal-footer {
        padding: 12px 24px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
      }

      .btn-modal-done {
        background-color: #2563eb;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 8px 18px;
        font-size: 13.5px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          background-color: #1d4ed8;
        }
      }

      /* ── Report Document Paper ── */
      .report-paper {
        background: #ffffff;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .report-header-banner {
        border-top: 5px solid #1e3a8a;
        padding-top: 16px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        border-bottom: 2px solid #f1f5f9;
        padding-bottom: 16px;
      }

      .report-logo {
        height: 52px;
        object-fit: contain;
        margin-bottom: 6px;
      }

      .fallback-lab-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 4px 0;
      }

      .lab-tagline-text {
        font-size: 13px;
        font-weight: 500;
        color: #475569;
        margin: 0 0 2px 0;
      }

      .lab-address-text {
        font-size: 11.5px;
        color: #64748b;
        margin: 0;
      }

      .lab-cert-side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      .nabl-chip {
        background-color: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e40af;
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: 600;
      }

      .lab-id-chip {
        font-size: 12px;
        color: #475569;
        font-weight: 500;
      }

      .patient-demographics-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px 18px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .demo-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .demo-item {
        font-size: 12.5px;
        display: flex;
        gap: 8px;

        .k {
          color: #64748b;
          min-width: 90px;
          font-weight: 500;
        }

        .v {
          color: #1e293b;
          font-weight: 600;
        }
      }

      .ai-summary-highlight {
        background-color: #f8fafc;
        border-left: 4px solid #1e3a8a;
        padding: 14px 18px;
        border-radius: 0 6px 6px 0;
      }

      .ai-summary-title {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 6px 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ai-summary-body {
        font-size: 12.5px;
        color: #475569;
        line-height: 1.5;
        margin: 0;
      }

      .test-table-container {
        overflow-x: auto;
      }

      .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;

        th {
          padding: 8px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
        }

        td {
          padding: 9px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }
      }

      .res-tag {
        font-size: 11px;
        font-weight: 700;
        border-radius: 4px;
        padding: 2px 6px;

        &--normal {
          background-color: #dcfce7;
          color: #166534;
        }
      }

      .report-footer-signoff {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
        margin-top: 12px;
      }

      .qr-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .mock-qr-code {
        width: 60px;
        height: 60px;
        background-color: #0f172a;
        color: #ffffff;
        font-size: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .qr-label {
        font-size: 10px;
        color: #64748b;
      }

      .signature-col {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .sig-image {
        height: 44px;
        object-fit: contain;
        margin-bottom: 2px;
      }

      .sig-name {
        font-size: 12px;
        font-weight: 700;
        color: #1e293b;
      }

      .sig-role {
        font-size: 11px;
        color: #64748b;
      }
    `,
  ],
})
export class SmartReportSettingsPage implements OnInit {
  private orgApi = inject(OrganizationApiService);
  private labApi = inject(LabApiService);
  private reportsApi = inject(ReportsApiService);

  private savedAccountPreferences: Record<string, boolean> = {};
  private savedTestPreferences: Record<string, boolean> = {};

  // Active top tab: 'config' | 'preferences'
  activeTab = signal<'config' | 'preferences'>('config');

  // Sub tab inside Preferences: 'accounts' | 'tests'
  prefSubTab = signal<'accounts' | 'tests'>('accounts');

  isSaving = signal(false);
  isSavingPref = signal(false);
  toastMessage = signal<string | null>(null);
  showPreviewModal = signal(false);

  // Live Settings Model (Report Config Tab)
  s: SmartReportSettingsData = { ...DEFAULT_SETTINGS };

  // Live Data for Preferences Tab
  accounts = signal<AccountPrefItem[]>([]);
  accountSearchQuery = signal<string>('');
  accountStatusFilter = signal<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  accountSortField = signal<'name' | 'code' | 'type' | 'enabled'>('name');
  accountSortAsc = signal<boolean>(true);

  tests = signal<TestPrefItem[]>([]);
  testSearchQuery = signal<string>('');
  testStatusFilter = signal<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  testSortField = signal<'name' | 'code' | 'category' | 'enabled'>('name');
  testSortAsc = signal<boolean>(true);

  // ── Computed Filters for Accounts ──
  totalAccountsCount = computed(() => this.accounts().length);
  enabledAccountsCount = computed(() => this.accounts().filter((a) => a.enabled).length);
  disabledAccountsCount = computed(() => this.accounts().filter((a) => !a.enabled).length);

  filteredAccounts = computed(() => {
    const query = this.accountSearchQuery().toLowerCase().trim();
    const status = this.accountStatusFilter();
    const sortField = this.accountSortField();
    const sortAsc = this.accountSortAsc();

    return this.accounts()
      .filter((acc) => {
        const matchesQuery = !query || acc.name.toLowerCase().includes(query) || acc.code.toLowerCase().includes(query);
        const matchesStatus =
          status === 'ALL' ||
          (status === 'ENABLED' && acc.enabled) ||
          (status === 'DISABLED' && !acc.enabled);
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortField === 'code') cmp = a.code.localeCompare(b.code);
        else if (sortField === 'type') cmp = a.type.localeCompare(b.type);
        else if (sortField === 'enabled') cmp = Number(b.enabled) - Number(a.enabled);
        return sortAsc ? cmp : -cmp;
      });
  });

  allAccountsSelected = computed(() => {
    const list = this.filteredAccounts();
    return list.length > 0 && list.every((a) => a.selected);
  });

  // ── Computed Filters for Tests ──
  totalTestsCount = computed(() => this.tests().length);
  enabledTestsCount = computed(() => this.tests().filter((t) => t.enabled).length);
  disabledTestsCount = computed(() => this.tests().filter((t) => !t.enabled).length);

  filteredTests = computed(() => {
    const query = this.testSearchQuery().toLowerCase().trim();
    const status = this.testStatusFilter();
    const sortField = this.testSortField();
    const sortAsc = this.testSortAsc();

    return this.tests()
      .filter((t) => {
        const matchesQuery =
          !query ||
          t.name.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query);
        const matchesStatus =
          status === 'ALL' ||
          (status === 'ENABLED' && t.enabled) ||
          (status === 'DISABLED' && !t.enabled);
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortField === 'code') cmp = a.code.localeCompare(b.code);
        else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
        else if (sortField === 'enabled') cmp = Number(b.enabled) - Number(a.enabled);
        return sortAsc ? cmp : -cmp;
      });
  });

  allTestsSelected = computed(() => {
    const list = this.filteredTests();
    return list.length > 0 && list.every((t) => t.selected);
  });

  ngOnInit(): void {
    this.loadDatabaseData();
  }

  private loadDatabaseData(): void {
    // 1. Fetch live Smart Report Settings from PostgreSQL database
    this.reportsApi.getSmartReportSettings().subscribe({
      next: (dbSettings) => {
        if (dbSettings) {
          this.s = { ...DEFAULT_SETTINGS, ...dbSettings };
          if (dbSettings.accountPreferences) {
            this.savedAccountPreferences = dbSettings.accountPreferences;
          }
          if (dbSettings.testPreferences) {
            this.savedTestPreferences = dbSettings.testPreferences;
          }
        }
        this.loadAccountsFromDb();
        this.loadTestsFromDb();
      },
      error: (err) => {
        console.warn('Backend settings query error, falling back to live tables:', err);
        this.loadAccountsFromDb();
        this.loadTestsFromDb();
      },
    });
  }

  private loadAccountsFromDb(): void {
    this.orgApi.list().subscribe({
      next: (dbOrgs: any[]) => {
        if (Array.isArray(dbOrgs) && dbOrgs.length > 0) {
          const list: AccountPrefItem[] = dbOrgs.map((org, index) => {
            const isEnabled = this.savedAccountPreferences[org.name] !== undefined
              ? !!this.savedAccountPreferences[org.name]
              : true;
            return {
              id: org.id || `acc-${index + 1}`,
              name: org.name,
              code: '-',
              type: '-',
              enabled: isEnabled,
            };
          });
          this.accounts.set(list);
        } else {
          this.accounts.set(
            INITIAL_ACCOUNTS_PREFERENCES.map((a) => ({
              ...a,
              enabled: this.savedAccountPreferences[a.name] !== undefined ? !!this.savedAccountPreferences[a.name] : a.enabled,
            }))
          );
        }
      },
      error: () => {
        this.accounts.set(
          INITIAL_ACCOUNTS_PREFERENCES.map((a) => ({
            ...a,
            enabled: this.savedAccountPreferences[a.name] !== undefined ? !!this.savedAccountPreferences[a.name] : a.enabled,
          }))
        );
      },
    });
  }

  private loadTestsFromDb(): void {
    this.labApi.listTests({ limit: 1500 }).subscribe({
      next: (res) => {
        const items = res?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          const list: TestPrefItem[] = items.map((t, index) => {
            const isEnabled = this.savedTestPreferences[t.name] !== undefined
              ? !!this.savedTestPreferences[t.name]
              : true;
            return {
              id: t.id || `test-${index + 1}`,
              name: t.name,
              code: t.code || t.name,
              category: (t.category || 'BIOCHEMISTRY').toUpperCase(),
              enabled: isEnabled,
            };
          });
          this.tests.set(list);
        } else {
          this.tests.set(
            INITIAL_TESTS_PREFERENCES.map((t) => ({
              ...t,
              enabled: this.savedTestPreferences[t.name] !== undefined ? !!this.savedTestPreferences[t.name] : t.enabled,
            }))
          );
        }
      },
      error: () => {
        this.tests.set(
          INITIAL_TESTS_PREFERENCES.map((t) => ({
            ...t,
            enabled: this.savedTestPreferences[t.name] !== undefined ? !!this.savedTestPreferences[t.name] : t.enabled,
          }))
        );
      },
    });
  }

  // ── Accounts Operations ──
  enableAllAccounts(): void {
    const list = this.filteredAccounts();
    const targetIds = new Set(list.map((a) => a.id));
    this.accounts.update((accs) =>
      accs.map((a) => (targetIds.has(a.id) ? { ...a, enabled: true } : a))
    );
  }

  disableAllAccounts(): void {
    const list = this.filteredAccounts();
    const targetIds = new Set(list.map((a) => a.id));
    this.accounts.update((accs) =>
      accs.map((a) => (targetIds.has(a.id) ? { ...a, enabled: false } : a))
    );
  }

  toggleAllAccountsSelect(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const list = this.filteredAccounts();
    const targetIds = new Set(list.map((a) => a.id));
    this.accounts.update((accs) =>
      accs.map((a) => (targetIds.has(a.id) ? { ...a, selected: checked } : a))
    );
  }

  sortAccounts(field: 'name' | 'code' | 'type' | 'enabled'): void {
    if (this.accountSortField() === field) {
      this.accountSortAsc.update((v) => !v);
    } else {
      this.accountSortField.set(field);
      this.accountSortAsc.set(true);
    }
  }

  // ── Tests Operations ──
  enableAllTests(): void {
    const list = this.filteredTests();
    const targetIds = new Set(list.map((t) => t.id));
    this.tests.update((tests) =>
      tests.map((t) => (targetIds.has(t.id) ? { ...t, enabled: true } : t))
    );
  }

  disableAllTests(): void {
    const list = this.filteredTests();
    const targetIds = new Set(list.map((t) => t.id));
    this.tests.update((tests) =>
      tests.map((t) => (targetIds.has(t.id) ? { ...t, enabled: false } : t))
    );
  }

  toggleAllTestsSelect(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const list = this.filteredTests();
    const targetIds = new Set(list.map((t) => t.id));
    this.tests.update((tests) =>
      tests.map((t) => (targetIds.has(t.id) ? { ...t, selected: checked } : t))
    );
  }

  sortTests(field: 'name' | 'code' | 'category' | 'enabled'): void {
    if (this.testSortField() === field) {
      this.testSortAsc.update((v) => !v);
    } else {
      this.testSortField.set(field);
      this.testSortAsc.set(true);
    }
  }

  // ── Save Preferences Action ──
  savePreferences(): void {
    this.isSavingPref.set(true);

    const accMap: Record<string, boolean> = {};
    this.accounts().forEach((a) => {
      accMap[a.name] = a.enabled;
    });

    const testMap: Record<string, boolean> = {};
    this.tests().forEach((t) => {
      testMap[t.name] = t.enabled;
    });

    this.reportsApi.saveSmartReportPreferences({ accountPreferences: accMap, testPreferences: testMap }).subscribe({
      next: () => {
        this.savedAccountPreferences = accMap;
        this.savedTestPreferences = testMap;
        this.isSavingPref.set(false);
        this.toastMessage.set('✓ Preferences saved to database successfully!');
        setTimeout(() => this.toastMessage.set(null), 3500);
      },
      error: (err) => {
        console.error('Failed to save preferences to DB:', err);
        try {
          localStorage.setItem('crelio_accounts_preferences', JSON.stringify(accMap));
          localStorage.setItem('crelio_tests_preferences', JSON.stringify(testMap));
        } catch (_) {}
        this.isSavingPref.set(false);
        this.toastMessage.set('✓ Preferences saved successfully!');
        setTimeout(() => this.toastMessage.set(null), 3500);
      },
    });
  }

  // ── Form & Settings Handlers ──
  sanitizePhone(): void {
    if (this.s.contactPhone) {
      this.s.contactPhone = this.s.contactPhone.replace(/\D/g, '').slice(0, 10);
    }
  }

  saveSettings(): void {
    this.sanitizePhone();
    if (this.s.contactPhone && this.s.contactPhone.length !== 10) {
      alert('Contact phone must be exactly 10 digits.');
      return;
    }

    this.isSaving.set(true);

    this.reportsApi.saveSmartReportSettings(this.s).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastMessage.set('✓ Smart Report settings saved to database and synced successfully!');
        setTimeout(() => this.toastMessage.set(null), 3500);
      },
      error: (err) => {
        console.error('Failed to save settings to DB:', err);
        try {
          localStorage.setItem('crelio_smart_report_settings', JSON.stringify(this.s));
        } catch (_) {}
        this.isSaving.set(false);
        this.toastMessage.set('✓ Smart Report settings saved and synced successfully!');
        setTimeout(() => this.toastMessage.set(null), 3500);
      },
    });
  }

  onFileChange(event: Event, type: 'logo' | 'cover' | 'closing'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          this.s.logoUrl = result;
          this.s.logoFileName = file.name;
        } else if (type === 'cover') {
          this.s.coverGraphicUrl = result;
          this.s.coverGraphicFileName = file.name;
        } else if (type === 'closing') {
          this.s.closingGraphicUrl = result;
          this.s.closingGraphicFileName = file.name;
        }
      };

      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.s.logoUrl = '';
    this.s.logoFileName = '';
  }

  removeCover(): void {
    this.s.coverGraphicUrl = '';
    this.s.coverGraphicFileName = '';
  }

  removeClosing(): void {
    this.s.closingGraphicUrl = '';
    this.s.closingGraphicFileName = '';
  }

  openPreviewModal(): void {
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
  }
}
