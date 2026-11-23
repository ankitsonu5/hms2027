import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClinicianService } from '../../core/services/clinician.service';
import {
  DoctorPickerComponent,
  doctorDisplayName,
} from '../../shared/components/doctor-picker.component';

/**
 * Doctor master. Doctors added here appear in every "Doctor" / "Referred by"
 * field (OPD, Laboratory, IPD). Email is optional: referring doctors who never
 * log in don't need one.
 */
@Component({
  selector: 'hms-clinician-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [
    `
      .page {
        padding: var(--sp-6);
        background: #f8fafc;
        min-height: 100vh;
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 18px;
      }
      .head h1 {
        font-size: var(--text-2xl);
        font-weight: 700;
        margin: 0;
        color: #0f172a;
      }
      .head p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 14px;
      }
      .bar {
        display: flex;
        gap: 12px;
        margin-bottom: 14px;
      }
      .bar input {
        max-width: 320px;
      }
      .card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: 12px;
        overflow: hidden;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      th {
        background: #f1f5f9;
        color: #475569;
        font-weight: 600;
        text-align: left;
        padding: 10px 16px;
        border-bottom: 1px solid var(--border-default);
      }
      td {
        padding: 10px 16px;
        border-bottom: 1px solid var(--border-default);
        color: #1e293b;
      }
      tr:last-child td {
        border-bottom: none;
      }
      .name {
        font-weight: 600;
      }
      .muted {
        color: #94a3b8;
      }
      .acts {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }
      .empty {
        text-align: center;
        padding: 40px;
        color: #64748b;
      }
      .overlay {
        position: fixed;
        inset: 0;
        background: rgb(15 23 42 / 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
      }
      .modal {
        background: #fff;
        border-radius: 12px;
        width: 100%;
        max-width: 560px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 22px;
      }
      .modal h2 {
        margin: 0 0 16px;
        font-size: 18px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .full {
        grid-column: 1 / -1;
      }
      .err {
        color: #b91c1c;
        font-size: 13px;
        margin-top: 10px;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      .hint {
        font-size: 12px;
        color: #64748b;
        margin-top: 4px;
      }
      @media (max-width: 640px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `
    <div class="page">
      <div class="head">
        <div>
          <h1>Clinician Management</h1>
          <p>Doctors added here can be picked in OPD, Laboratory (Referred by) and IPD forms.</p>
        </div>
        <button class="btn btn-primary" (click)="openNew()">+ Add Doctor</button>
      </div>

      <div class="bar">
        <input
          class="form-control"
          placeholder="Search name, specialisation, phone…"
          [value]="q()"
          (input)="q.set($any($event.target).value)"
        />
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialisation</th>
              <th>Reg. No.</th>
              <th>Phone</th>
              <th>Timing</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr>
                <td colspan="6" class="empty">Loading…</td>
              </tr>
            } @else if (!filtered().length) {
              <tr>
                <td colspan="6" class="empty">
                  {{
                    q() ? 'No doctor matches your search.' : 'No doctors yet. Click "+ Add Doctor".'
                  }}
                </td>
              </tr>
            }
            @for (d of filtered(); track d.id) {
              <tr>
                <td class="name">{{ display(d.name) }}</td>
                <td>{{ d.specialisation || '—' }}</td>
                <td>{{ d.registrationNo || '—' }}</td>
                <td>{{ d.phone || '—' }}</td>
                <td>
                  @if (d.availableFrom || d.availableTo) {
                    {{ d.availableFrom || '?' }} – {{ d.availableTo || '?' }}
                  } @else {
                    <span class="muted">—</span>
                  }
                </td>
                <td>
                  <div class="acts">
                    <button class="btn btn-ghost btn-sm" (click)="openEdit(d)">Edit</button>
                    <button class="btn btn-danger-ghost btn-sm" (click)="remove(d)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (modal()) {
      <div class="overlay" (click)="close()">
        <form
          class="modal"
          [formGroup]="form"
          (click)="$event.stopPropagation()"
          (ngSubmit)="save()"
        >
          <h2>{{ editId() ? 'Edit doctor' : 'Add doctor' }}</h2>
          <div class="grid">
            <div class="full">
              <label class="form-label">Doctor name *</label>
              <input
                class="form-control"
                formControlName="name"
                placeholder="e.g. Dr. Rajesh Sharma"
              />
            </div>
            <div>
              <label class="form-label">Specialisation</label>
              <input
                class="form-control"
                formControlName="specialisation"
                placeholder="e.g. General Physician"
                list="specs"
              />
              <datalist id="specs">
                @for (s of specs; track s) {
                  <option [value]="s"></option>
                }
              </datalist>
            </div>
            <div>
              <label class="form-label">Registration no.</label>
              <input
                class="form-control"
                formControlName="registrationNo"
                placeholder="e.g. UPMC-12345"
              />
            </div>
            <div>
              <label class="form-label">Phone</label>
              <input class="form-control" formControlName="phone" placeholder="10-digit mobile" />
            </div>
            <div>
              <label class="form-label">Email</label>
              <input class="form-control" formControlName="email" placeholder="Optional" />
              <div class="hint">Only needed if the doctor will log in.</div>
            </div>
            <div>
              <label class="form-label">Available from</label>
              <input class="form-control" type="time" formControlName="availableFrom" />
            </div>
            <div>
              <label class="form-label">Available to</label>
              <input class="form-control" type="time" formControlName="availableTo" />
            </div>
          </div>
          @if (error()) {
            <div class="err">{{ error() }}</div>
          }
          <div class="foot">
            <button type="button" class="btn btn-ghost" (click)="close()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
})
export class ClinicianListPage implements OnInit {
  private api = inject(ClinicianService);
  private fb = inject(FormBuilder);

  doctors = signal<any[]>([]);
  loading = signal(true);
  q = signal('');
  modal = signal(false);
  editId = signal<string | null>(null);
  saving = signal(false);
  error = signal('');

  specs = [
    'General Physician',
    'Pathologist',
    'Gynaecologist',
    'Paediatrician',
    'Orthopaedic',
    'Cardiologist',
    'ENT',
    'Dermatologist',
    'General Surgeon',
    'Radiologist',
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    specialisation: [''],
    registrationNo: [''],
    phone: [''],
    email: ['', Validators.email],
    availableFrom: [''],
    availableTo: [''],
  });

  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (!q) return this.doctors();
    return this.doctors().filter((d) =>
      [d.name, d.specialisation, d.phone, d.registrationNo].join(' ').toLowerCase().includes(q),
    );
  });

  display = doctorDisplayName;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getClinicians().subscribe({
      next: (list) => {
        this.doctors.set(list ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openNew() {
    this.editId.set(null);
    this.form.reset();
    this.error.set('');
    this.modal.set(true);
  }

  openEdit(d: any) {
    this.editId.set(d.id);
    this.form.reset({
      name: d.name ?? '',
      specialisation: d.specialisation ?? '',
      registrationNo: d.registrationNo ?? '',
      phone: d.phone ?? '',
      email: d.email?.endsWith('@doctors.local') ? '' : (d.email ?? ''),
      availableFrom: d.availableFrom ?? '',
      availableTo: d.availableTo ?? '',
    });
    this.error.set('');
    this.modal.set(true);
  }

  close() {
    if (!this.saving()) this.modal.set(false);
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: any = { ...v, name: doctorDisplayName(v.name) };
    if (!body.email) delete body.email;
    this.saving.set(true);
    this.error.set('');
    const id = this.editId();
    const req = id ? this.api.updateClinician(id, body) : this.api.createClinician(body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.modal.set(false);
        DoctorPickerComponent.invalidate();
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e?.error?.message || 'Could not save the doctor');
      },
    });
  }

  remove(d: any) {
    if (!confirm(`Delete ${doctorDisplayName(d.name)} from the doctor list?`)) return;
    this.api.deleteClinician(d.id).subscribe({
      next: () => {
        DoctorPickerComponent.invalidate();
        this.load();
      },
      error: (e) => alert(e?.error?.message || 'Could not delete'),
    });
  }
}
