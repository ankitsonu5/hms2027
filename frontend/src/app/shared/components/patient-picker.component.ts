import { Component, DestroyRef, forwardRef, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientApiService } from '../../core/services/patient-api.service';

export interface PickedPatient {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: string;
  phone?: string;
}

/**
 * Search-as-you-type patient selector. Writes the patient's `id` to the form
 * control while showing the human-readable identity (name, UHID, age/gender).
 */
@Component({
  selector: 'hms-patient-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PatientPickerComponent),
      multi: true,
    },
  ],
  template: `
    @if (selected(); as p) {
      <div class="picked" [class.picked--locked]="locked()">
        <div class="picked__avatar">{{ initials(p) }}</div>
        <div class="picked__meta">
          <span class="picked__name">{{ p.firstName }} {{ p.lastName }}</span>
          <span class="picked__sub">
            <span class="mono">{{ p.uhid }}</span>
            @if (summary(p); as s) {
              <span class="dot">·</span>{{ s }}
            }
            @if (p.phone) {
              <span class="dot">·</span>{{ p.phone }}
            }
          </span>
        </div>
        @if (!locked()) {
          <button type="button" class="picked__change" (click)="clear()">Change</button>
        }
      </div>
    } @else {
      <div class="picker">
        <input
          type="text"
          class="form-control"
          [class.is-invalid]="invalid()"
          [ngModel]="term()"
          (ngModelChange)="onTerm($event)"
          (focus)="focused.set(true)"
          (blur)="onBlur()"
          placeholder="Search by name, phone or UHID…"
          autocomplete="off"
        />

        @if (focused() && term().length > 0) {
          <div class="menu">
            @if (loading()) {
              <div class="menu__note">Searching…</div>
            } @else if (results().length === 0) {
              <div class="menu__note">
                No patient found for “{{ term() }}”.
                <a class="menu__link" (mousedown)="registerNew()">Register new patient</a>
              </div>
            } @else {
              @for (p of results(); track p.id) {
                <button type="button" class="option" (mousedown)="choose(p)">
                  <span class="option__avatar">{{ initials(p) }}</span>
                  <span class="option__meta">
                    <span class="option__name">{{ p.firstName }} {{ p.lastName }}</span>
                    <span class="option__sub">
                      <span class="mono">{{ p.uhid }}</span>
                      @if (summary(p); as s) {
                        <span class="dot">·</span>{{ s }}
                      }
                      @if (p.phone) {
                        <span class="dot">·</span>{{ p.phone }}
                      }
                    </span>
                  </span>
                </button>
              }
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }
      .mono {
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
      }
      .dot {
        margin: 0 6px;
        opacity: 0.5;
      }

      .form-control {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-900);
        background: var(--bg-base);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--sp-2) var(--sp-3);
        outline: none;
        transition: var(--transition-fast);
        width: 100%;
        box-sizing: border-box;
      }
      .form-control:focus {
        border-color: var(--clr-primary-400);
        box-shadow: 0 0 0 3px var(--clr-primary-100);
      }
      .form-control.is-invalid {
        border-color: var(--clr-danger-400);
      }

      /* Selected patient */
      .picked {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--clr-primary-200);
        background: var(--clr-primary-50);
        border-radius: var(--radius-md);
      }
      .picked--locked {
        border-color: var(--border-default);
        background: var(--bg-muted);
      }
      .picked__avatar,
      .option__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--clr-primary-600);
        color: #fff;
        font-family: var(--font-label);
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        flex-shrink: 0;
      }
      .picked__meta,
      .option__meta {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex: 1;
        text-align: left;
      }
      .picked__name,
      .option__name {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--clr-neutral-900);
      }
      .picked__sub,
      .option__sub {
        font-family: var(--font-body);
        font-size: var(--text-xs);
        color: var(--clr-neutral-500);
      }
      .picked__change {
        border: 1px solid var(--border-default);
        background: var(--bg-surface);
        color: var(--clr-neutral-700);
        font-family: var(--font-label);
        font-size: var(--text-xs);
        padding: var(--sp-1) var(--sp-3);
        border-radius: var(--radius-sm);
        cursor: pointer;
        flex-shrink: 0;
      }
      .picked__change:hover {
        background: var(--bg-muted);
      }

      /* Dropdown */
      .menu {
        position: absolute;
        z-index: 30;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        max-height: 280px;
        overflow-y: auto;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md, 0 8px 24px rgb(0 0 0 / 12%));
        padding: 4px;
      }
      .menu__note {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--clr-neutral-500);
        padding: var(--sp-3);
      }
      .menu__link {
        color: var(--clr-primary-600);
        cursor: pointer;
        font-weight: var(--fw-medium);
        margin-left: 4px;
      }
      .menu__link:hover {
        text-decoration: underline;
      }
      .option {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        width: 100%;
        padding: var(--sp-2);
        border: none;
        background: transparent;
        border-radius: var(--radius-sm);
        cursor: pointer;
        text-align: left;
      }
      .option:hover {
        background: var(--clr-primary-50);
      }
    `,
  ],
})
export class PatientPickerComponent implements ControlValueAccessor {
  private api = inject(PatientApiService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** Renders the selection read-only — used when the patient is fixed by context. */
  locked = input(false);
  invalid = input(false);

  term = signal('');
  results = signal<PickedPatient[]>([]);
  selected = signal<PickedPatient | null>(null);
  loading = signal(false);
  focused = signal(false);

  private search$ = new Subject<string>();
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loading.set(true);
          return this.api
            .list({ search: q, limit: 8 })
            .pipe(catchError(() => of({ data: [] as PickedPatient[] })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.results.set(res?.data ?? []);
        this.loading.set(false);
      });
  }

  writeValue(id: string | null): void {
    if (!id) {
      this.selected.set(null);
      this.term.set('');
      return;
    }
    if (this.selected()?.id === id) return;
    this.api.getOne(id).subscribe({
      next: (p: any) => this.selected.set(p),
      error: () => this.selected.set(null),
    });
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onTerm(value: string): void {
    this.term.set(value);
    if (value.trim().length === 0) {
      this.results.set([]);
      return;
    }
    this.search$.next(value.trim());
  }

  choose(p: PickedPatient): void {
    this.selected.set(p);
    this.results.set([]);
    this.term.set('');
    this.focused.set(false);
    this.onChange(p.id);
    this.onTouched();
  }

  clear(): void {
    this.selected.set(null);
    this.onChange('');
    this.onTouched();
  }

  registerNew(): void {
    this.router.navigate(['/patient/new'], { queryParams: { next: 'opd' } });
  }

  onBlur(): void {
    // Let a pending mousedown on an option land before the menu unmounts.
    setTimeout(() => {
      this.focused.set(false);
      this.onTouched();
    }, 150);
  }

  initials(p: PickedPatient): string {
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
  }

  summary(p: PickedPatient): string {
    const bits: string[] = [];
    const age = this.age(p.dob);
    if (age !== null) bits.push(`${age}y`);
    if (p.gender) bits.push(p.gender.charAt(0) + p.gender.slice(1).toLowerCase());
    return bits.join(', ');
  }

  private age(dob?: string): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
    return years;
  }
}
