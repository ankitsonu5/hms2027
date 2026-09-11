import { Component, inject, signal, OnInit } from '@angular/core';

interface Patient {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
}
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { API_BASE } from '../../core/api-base';

@Component({
  selector: 'hms-register-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      :host {
        display: block;
      }

      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--sp-3);
        margin-bottom: var(--sp-3);
      }

      h1 {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-xl);
        letter-spacing: var(--ls-tight);
      }

      .pid {
        font-size: var(--text-xs);
        color: var(--text-secondary);
      }

      .pid b {
        font-family: var(--font-display);
        color: var(--text-primary);
      }

      .cols {
        width: 100%;
      }

      /* ── Tabs ── */
      .tabs {
        display: flex;
        gap: var(--sp-1);
        margin-bottom: var(--sp-3);
        border-bottom: 1px solid var(--border-default);
      }

      .tab {
        padding: var(--sp-2) var(--sp-4);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        background: transparent;
        border: 0;
        border-bottom: 2px solid transparent;
        cursor: pointer;
      }

      .tab.active {
        color: var(--clr-primary-700);
        border-bottom-color: var(--clr-primary-600);
      }

      .tab .count {
        margin-left: var(--sp-2);
        padding: 1px 7px;
        font-size: var(--text-xs);
        border-radius: var(--radius-full);
        background: var(--bg-muted);
        color: var(--text-secondary);
      }

      /* ── Patient lookup ── */
      .search {
        position: relative;
        width: 100%;
        margin-bottom: var(--sp-3);
      }

      .results {
        display: flex;
        flex-direction: column;
        margin-top: var(--sp-2);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      /* ── Patient rows ── */
      .prow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-4);
        padding: var(--sp-3) var(--sp-4);
        text-align: left;
        background: transparent;
        border: 0;
        border-bottom: 1px solid var(--border-default);
        cursor: pointer;
        width: 100%;
      }

      .prow:last-child {
        border-bottom: 0;
      }

      .prow:hover {
        background: var(--bg-muted);
      }

      .prow__name {
        font-weight: var(--fw-semibold);
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      .prow__meta {
        font-size: var(--text-xs);
        color: var(--text-secondary);
      }

      .list {
        width: 100%;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      /* ── Service picker ── */
      .picker {
        width: 100%;
        margin-bottom: var(--sp-5);
        padding: var(--sp-5);
        background: var(--clr-primary-50);
        border: 1px solid var(--clr-primary-200);
        border-radius: var(--radius-lg);
      }

      .picker__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }

      .services {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--sp-3);
      }

      .service {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--sp-1);
        padding: var(--sp-4);
        text-align: left;
        background: var(--bg-surface);
        border: 1.5px solid var(--border-default);
        border-radius: var(--radius-md);
        cursor: pointer;
      }

      .service:hover {
        border-color: var(--clr-primary-500);
        box-shadow: var(--shadow-sm);
      }

      .service b {
        font-family: var(--font-display);
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      .service span {
        font-size: var(--text-xs);
        color: var(--text-secondary);
      }

      .empty-list {
        padding: var(--sp-8);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      @media (max-width: 620px) {
        .services {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .panel {
        padding: var(--sp-4) var(--sp-5);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xs);
      }

      .panel__title {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-base);
        margin-bottom: var(--sp-4);
        padding-bottom: var(--sp-3);
        border-bottom: 1px solid var(--border-default);
      }

      .row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--sp-2) var(--sp-5);
      }

      .row--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      /* narrow + wide, for Designation beside Patient Name */
      .row--nw {
        grid-template-columns: 220px minmax(0, 1fr);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-bottom: var(--sp-2);
        min-width: 0;
      }

      /* Read-only id, styled to sit level with the inputs beside it */
      .field--mid {
        justify-content: flex-end;
        padding-bottom: 8px;
      }

      .pid-value {
        padding: 7px 0;
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      label,
      .legend {
        font-family: var(--font-label);
        font-size: 10.5px;
        font-weight: var(--fw-semibold);
        letter-spacing: var(--ls-wide);
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .req {
        color: var(--clr-danger-600);
      }

      input[type='text'],
      input[type='email'],
      input[type='tel'],
      input[type='number'],
      input[type='date'],
      select {
        width: 100%;
        padding: 7px 10px;
        font-family: var(--font-body);
        font-size: 13px;
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1.5px solid var(--border-default);
        border-radius: var(--radius-md);
      }

      input:focus,
      select:focus {
        outline: none;
        border-color: var(--clr-primary-500);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--clr-primary-500) 12%, transparent);
      }

      input.invalid {
        border-color: var(--clr-danger-600);
      }

      .opts {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2) var(--sp-4);
      }

      .opts--grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--sp-2) var(--sp-3);
      }

      .opt {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-regular);
        letter-spacing: var(--ls-normal);
        text-transform: none;
        color: var(--text-primary);
        cursor: pointer;
      }

      .opt input {
        accent-color: var(--clr-primary-600);
        margin: 0;
      }

      .phone {
        display: grid;
        grid-template-columns: 54px minmax(0, 1fr);
        gap: var(--sp-2);
      }

      .cc {
        display: grid;
        place-items: center;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: var(--bg-muted);
        border: 1.5px solid var(--border-default);
        border-radius: var(--radius-md);
      }

      .age {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 96px;
        gap: var(--sp-2);
      }

      .group {
        margin-bottom: var(--sp-2);
      }

      .group > .legend {
        display: block;
        margin-bottom: 4px;
      }

      /* ── Actions ── */
      .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
        margin-top: var(--sp-3);
        padding-top: var(--sp-3);
        border-top: 1px solid var(--border-default);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: 8px var(--sp-5);
        font-family: var(--font-label);
        font-size: var(--text-sm);
        font-weight: var(--fw-bold);
        border-radius: var(--radius-md);
        border: 1.5px solid transparent;
        cursor: pointer;
      }

      .btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .btn--ghost {
        color: var(--text-secondary);
        background: var(--bg-surface);
        border-color: var(--border-strong);
      }

      .btn--ghost:hover:not(:disabled) {
        background: var(--bg-muted);
      }

      .btn--primary {
        color: #fff;
        background: var(--clr-primary-600);
      }

      .btn--primary:hover:not(:disabled) {
        background: var(--clr-primary-700);
      }

      .btn--outline {
        color: var(--clr-primary-700);
        background: var(--clr-primary-50);
        border-color: var(--clr-primary-200);
      }

      .right-actions {
        display: flex;
        gap: var(--sp-3);
      }

      .note {
        margin-top: var(--sp-4);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      .banner {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        margin-bottom: var(--sp-4);
        padding: var(--sp-3);
        font-size: var(--text-sm);
        border-radius: var(--radius-md);
      }

      .banner--ok {
        color: var(--clr-success-600);
        background: var(--clr-success-100);
      }

      .banner--err {
        color: var(--clr-danger-600);
        background: var(--clr-danger-100);
      }

      @media (max-width: 620px) {
        .row,
        .row--3,
        .opts--grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ],
  template: `
    <div class="head">
      <h1>Register Patient</h1>
    </div>

    <div class="tabs">
      <button type="button" class="tab" [class.active]="tab() === 'new'" (click)="tab.set('new')">
        Register Patient
      </button>
      <button type="button" class="tab" [class.active]="tab() === 'registered'" (click)="showRegistered()">
        Registered
        <span class="count">{{ registered().length }}</span>
      </button>
    </div>

    @if (okMsg()) {
      <div class="banner banner--ok">{{ okMsg() }}</div>
    }
    @if (errMsg()) {
      <div class="banner banner--err">{{ errMsg() }}</div>
    }

    <!-- Pick what the selected patient is here for -->
    @if (selected(); as p) {
      <div class="picker">
        <div class="picker__head">
          <div>
            <div class="prow__name">{{ p.firstName }} {{ p.lastName }}</div>
            <div class="prow__meta">{{ p.uhid }} · {{ p.gender }} · {{ p.phone }}</div>
          </div>
          <button type="button" class="btn btn--ghost" (click)="selected.set(null)">Close</button>
        </div>
        <div class="services">
          @for (sv of services; track sv.key) {
            <button type="button" class="service" (click)="go(sv, p)">
              <b>{{ sv.label }}</b>
              <span>{{ sv.hint }}</span>
            </button>
          }
        </div>
      </div>
    }

    @if (tab() === 'registered') {
      <div class="list">
        @if (registered().length) {
          @for (p of registered(); track p.id) {
            <button type="button" class="prow" (click)="selected.set(p)">
              <span>
                <span class="prow__name">{{ p.firstName }} {{ p.lastName }}</span><br />
                <span class="prow__meta">{{ p.uhid }} · {{ p.gender }} · {{ p.phone }}</span>
              </span>
              <span class="prow__meta">Choose service →</span>
            </button>
          }
        } @else {
          <div class="empty-list">No patients registered today yet.</div>
        }
      </div>
    }

    <form #f="ngForm" (ngSubmit)="submit(false)" novalidate [hidden]="tab() !== 'new'">
      <div class="search">
        <input
          type="text"
          placeholder="Select patient by name, phone or UHID"
          [(ngModel)]="q"
          name="q"
          [ngModelOptions]="{ standalone: true }"
          (input)="search()"
        />
        @if (results().length) {
          <div class="results">
            @for (p of results(); track p.id) {
              <button type="button" class="prow" (click)="pick(p)">
                <span>
                  <span class="prow__name">{{ p.firstName }} {{ p.lastName }}</span><br />
                  <span class="prow__meta">{{ p.uhid }} · {{ p.gender }} · {{ p.phone }}</span>
                </span>
              </button>
            }
          </div>
        }
      </div>

      <div class="cols">
        <!-- ══ Demographics ═══════════════════════════════════════════ -->
        <section class="panel">
          <div class="row row--3">
            <div class="field">
              <label>Patient Id</label>
              <div class="pid-value">{{ patientId() }}</div>
            </div>
            <div class="field">
              <label for="ptype">Patient Type</label>
              <select id="ptype" name="patientType" [(ngModel)]="m.patientType">
                <option value="">Select…</option>
                @for (o of patientTypes; track o.value) {
                  <option [value]="o.value">{{ o.label }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label for="optid">Optional Patient ID</label>
              <input id="optid" type="text" name="optionalPatientId" [(ngModel)]="m.optionalPatientId" />
            </div>
          </div>

          <div class="row row--nw">
            <div class="field">
              <label for="desig">Designation</label>
              <select id="desig" name="designation" [(ngModel)]="m.designation">
                <option value="">Designation</option>
                @for (o of designations; track o) { <option [value]="o">{{ o }}</option> }
              </select>
            </div>
            <div class="field">
              <label for="pname">Patient Name <span class="req">*</span></label>
              <input
                id="pname" type="text" name="name" required
                [(ngModel)]="m.name" #nameRef="ngModel"
                [class.invalid]="nameRef.invalid && nameRef.touched"
              />
            </div>
          </div>

          <div class="row">
          <div class="group">
            <span class="legend">Gender <span class="req">*</span></span>
            <div class="opts">
              @for (g of genders; track g.value) {
                <label class="opt">
                  <input type="radio" name="gender" [value]="g.value" [(ngModel)]="m.gender" required />
                  {{ g.label }}
                </label>
              }
            </div>
          </div>
          <div class="group">
            <span class="legend">Phone Number Belongs To</span>
            <div class="opts">
              <label class="opt">
                <input type="radio" name="phoneBelongsTo" value="PATIENT" [(ngModel)]="m.phoneBelongsTo" />
                Patient
              </label>
              <label class="opt">
                <input type="radio" name="phoneBelongsTo" value="RELATIVE" [(ngModel)]="m.phoneBelongsTo" />
                Relative/Guardian
              </label>
            </div>
          </div>
          </div>

          <div class="row">
            <div class="field">
              <label for="age">Age</label>
              <div class="age">
                <input id="age" type="number" min="0" name="age" [(ngModel)]="m.age" />
                <select name="ageUnit" [(ngModel)]="m.ageUnit" aria-label="Age unit">
                  <option value="Year">Year</option>
                  <option value="Month">Month</option>
                  <option value="Day">Day</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label for="phone">Contact Number</label>
              <div class="phone">
                <span class="cc">+91</span>
                <input id="phone" type="tel" name="phone" placeholder="081234 56789" [(ngModel)]="m.phone" />
              </div>
            </div>
          </div>



          <div class="row">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" placeholder="Email" [(ngModel)]="m.email" />
          </div>
            <div class="field field--mid">
              <label class="opt">
                <input type="checkbox" name="whatsappConsent" [(ngModel)]="m.whatsappConsent" />
                Send WhatsApp message to patient
              </label>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label for="org">Organization</label>
              <input id="org" type="text" name="organization" [(ngModel)]="m.organization" />
            </div>
            <div class="field">
              <label for="ref">Referral</label>
              <input id="ref" type="text" name="referral" [(ngModel)]="m.referral" />
            </div>
          </div>

          <div class="field">
            <label for="addr">Address</label>
            <input id="addr" type="text" name="address" [(ngModel)]="m.address" />
          </div>

          <div class="row">
            <div class="field">
              <label for="city">City</label>
              <input id="city" type="text" name="city" [(ngModel)]="m.city" />
            </div>
            <div class="field">
              <label for="state">State</label>
              <input id="state" type="text" name="state" placeholder="State" [(ngModel)]="m.state" />
            </div>
          </div>

          <div class="row row--3">
            <div class="field">
              <label for="district">District</label>
              <input id="district" type="text" name="district" placeholder="District" [(ngModel)]="m.district" />
            </div>
            <div class="field">
              <label for="pincode">Pincode</label>
              <input id="pincode" type="text" name="pincode" [(ngModel)]="m.pincode" />
            </div>
            <div class="field">
              <label for="country">Country</label>
              <select id="country" name="country" [(ngModel)]="m.country">
                <option value="">Select Country</option>
                @for (c of countries; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </div>
          </div>


          <div class="actions">
            <button type="button" class="btn btn--ghost" (click)="clear(f)">Clear</button>
            <div class="right-actions">
              <button type="submit" class="btn btn--outline" [disabled]="saving()">
                {{ saving() ? 'Saving…' : 'Register' }}
              </button>
              <button type="button" class="btn btn--primary" [disabled]="saving()" (click)="submit(true)">
                Register &amp; Bill
              </button>
            </div>
          </div>
        </section>

      </div>
    </form>
  `,
})
export class RegisterPatientPage implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  patientId = signal('—');
  saving = signal(false);
  okMsg = signal('');
  errMsg = signal('');

  tab = signal<'new' | 'registered'>('new');
  registered = signal<Patient[]>([]);
  selected = signal<Patient | null>(null);

  q = '';
  results = signal<Patient[]>([]);
  private searchTimer?: ReturnType<typeof setTimeout>;

  /** What a registered patient can be sent to next. */
  services = [
    { key: 'appointment', label: 'Book Appointment', hint: 'Doctor consultation', route: '/registration/appointments/list' },
    { key: 'lab', label: 'Lab Test', hint: 'Order tests & billing', route: '/laboratory' },
    { key: 'pharmacy', label: 'Pharmacy', hint: 'Dispense & billing', route: '/pharmacy' },
  ];

  designations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Master', 'Baby', 'Baby of'];
  /** Short code is stored; the full label is what the desk sees. */
  patientTypes = [
    { value: 'D', label: 'Direct (D)' },
    { value: 'I', label: 'Indirect (I)' },
    { value: 'OP', label: 'OPD (OP)' },
    { value: 'IP', label: 'IPD (IP)' },
    { value: 'G', label: 'Green (G)' },
    { value: 'R', label: 'Red (R)' },
    { value: 'RB', label: 'RB' },
    { value: 'ML', label: 'Main Lab (ML)' },
    { value: 'HC', label: 'Health Camp (HC)' },
    { value: 'CC', label: 'Corporate (CC)' },
    { value: 'F', label: 'Foreign Worker (F)' },
    { value: 'VIP', label: 'VIP' },
    { value: 'FAC_OPT_OUT', label: 'Facility Opt-out' },
    { value: 'GLB_OPT_OUT', label: 'Global Opt-out' },
    { value: 'FAC_REOPT_IN', label: 'Facility Re-opt-in' },
    { value: 'GLB_REOPT_IN', label: 'Global Re-opt-in' },
  ];
  genders = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];
  categories = [
    { value: 'DIRECT', label: 'Direct' },
    { value: 'B2B_REFERRAL', label: 'B2B Referral' },
    { value: 'CORPORATE', label: 'Corporate' },
    { value: 'INSURANCE', label: 'Insurance' },
  ];
  countries = ['India', 'Nepal', 'Bhutan', 'Bangladesh', 'Sri Lanka', 'United Arab Emirates', 'Other'];






  m = this.blankDemographics();


  private blankDemographics() {
    return {
      patientType: '',
      optionalPatientId: '',
      designation: '',
      name: '',
      gender: '',
      age: null as number | null,
      ageUnit: 'Year',
      phone: '',
      phoneBelongsTo: 'PATIENT',
      whatsappConsent: true,
      email: '',
      organization: 'Walkin',
      referral: '.SELF.',
      address: '',
      city: '',
      state: '',
      district: '',
      pincode: '',
      country: 'India',
      category: '',
    };
  }


  ngOnInit(): void {
    this.loadRegistered();
    this.loadNextUhid();
  }

  /** Advisory preview of the id this registration will get. */
  private loadNextUhid(): void {
    this.http
      .get<{ uhid: string }>(`${API_BASE}/patients/next-uhid`)
      .subscribe({ next: (r) => this.patientId.set(r.uhid) });
  }

  showRegistered(): void {
    this.tab.set('registered');
    this.loadRegistered();
  }

  loadRegistered(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.http
      .get<{ data: Patient[] }>(`${API_BASE}/patients`, { params: { date: today, limit: 100 } })
      .subscribe({ next: (r) => this.registered.set(r.data ?? []) });
  }

  /** Debounced so typing doesn't fire a request per keystroke. */
  search(): void {
    clearTimeout(this.searchTimer);
    const term = this.q.trim();
    if (term.length < 2) {
      this.results.set([]);
      return;
    }
    this.searchTimer = setTimeout(() => {
      this.http
        .get<{ data: Patient[] }>(`${API_BASE}/patients`, { params: { search: term, limit: 8 } })
        .subscribe({ next: (r) => this.results.set(r.data ?? []) });
    }, 250);
  }

  pick(p: Patient): void {
    this.selected.set(p);
    this.results.set([]);
    this.q = '';
  }

  go(sv: { route: string }, p: Patient): void {
    this.router.navigate([sv.route], { queryParams: { patientId: p.id, uhid: p.uhid } });
  }

  clear(f?: any): void {
    this.m = this.blankDemographics();
    this.okMsg.set('');
    this.errMsg.set('');
    f?.resetForm?.({ ...this.m });
  }

  /** The API stores a date of birth; the desk enters an age, so derive one. */
  private dobFromAge(): string {
    const d = new Date();
    const n = Number(this.m.age) || 0;
    if (this.m.ageUnit === 'Year') d.setFullYear(d.getFullYear() - n);
    else if (this.m.ageUnit === 'Month') d.setMonth(d.getMonth() - n);
    else d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  submit(alsoBill = false): void {
    this.okMsg.set('');
    this.errMsg.set('');

    if (!this.m.name.trim() || !this.m.gender) {
      this.errMsg.set('Patient Name and Gender are required.');
      return;
    }

    const [firstName, ...rest] = this.m.name.trim().split(/\s+/);
    const payload: Record<string, unknown> = {
      firstName,
      lastName: rest.join(' '),
      gender: this.m.gender,
      dob: this.dobFromAge(),
      phone: this.m.phone || '',
      designation: this.m.designation || undefined,
      patientType: this.m.patientType || undefined,
      optionalPatientId: this.m.optionalPatientId || undefined,
      email: this.m.email || undefined,
      address: this.m.address || undefined,
      city: this.m.city || undefined,
      state: this.m.state || undefined,
      district: this.m.district || undefined,
      pincode: this.m.pincode || undefined,
      country: this.m.country || undefined,
      organization: this.m.organization || undefined,
      referredByDoctorName: this.m.referral || undefined,
      phoneBelongsTo: this.m.phoneBelongsTo,
      whatsappConsent: this.m.whatsappConsent,
      category: this.m.category || undefined,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    this.saving.set(true);
    this.http.post<{ id: string; uhid: string }>(`${API_BASE}/patients`, payload).subscribe({
      next: (p) => {
        this.saving.set(false);
        this.patientId.set(p.uhid);
        // clear() resets the banners too, so set the message after it.
        // clear() resets the banners too, so set the message after it.
        this.clear();
        this.okMsg.set(`Patient registered — UHID ${p.uhid}`);
        this.loadRegistered();
        this.loadNextUhid();
        if (alsoBill) this.router.navigate(['/billing/new'], { queryParams: { patientId: p.id, uhid: p.uhid } });
      },
      error: (e) => {
        this.saving.set(false);
        const msg = e?.error?.message;
        this.errMsg.set(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Could not register the patient.'));
      },
    });
  }
}
