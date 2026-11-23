import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ClinicianService } from '../../core/services/clinician.service';

export interface PickedDoctor {
  id: string;
  name: string;
  specialisation?: string;
}

/** Doctors are fetched once per app session and shared by every picker. */
let cache: PickedDoctor[] | null = null;

export function doctorDisplayName(name: string): string {
  const n = (name || '').trim();
  return /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`;
}

/**
 * Doctor name field: pick a doctor from the clinician master or just type any
 * name (e.g. an outside referring doctor). The control holds the name text;
 * `picked` emits the chosen doctor, or null when the text is typed by hand.
 */
@Component({
  selector: 'hms-doctor-picker',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DoctorPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="dp">
      <input
        type="text"
        class="form-control"
        autocomplete="off"
        [placeholder]="placeholder()"
        [value]="text()"
        [disabled]="disabled()"
        (input)="onType($any($event.target).value)"
        (focus)="openList()"
        (blur)="onBlur()"
        (keydown)="onKey($event)"
      />
      @if (linked()) {
        <span class="dp__tag" title="Selected from doctor list">✓</span>
      }
      @if (open() && (matches().length || text().trim())) {
        <ul
          class="dp__list"
          role="listbox"
          [style.top.px]="pos().top"
          [style.left.px]="pos().left"
          [style.width.px]="pos().width"
        >
          @for (d of matches(); track d.id; let i = $index) {
            <li
              role="option"
              [class.active]="i === active()"
              (mousedown)="$event.preventDefault(); choose(d)"
            >
              <span class="dp__name">{{ d.name }}</span>
              @if (d.specialisation) {
                <span class="dp__spec">{{ d.specialisation }}</span>
              }
            </li>
          }
          @if (text().trim() && !exact()) {
            <li class="dp__free" (mousedown)="$event.preventDefault(); useTyped()">
              Use "{{ text().trim() }}" (not in doctor list)
            </li>
          }
          @if (!matches().length && !text().trim()) {
            <li class="dp__empty">No doctors in the list yet</li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .dp {
        position: relative;
      }
      .dp__tag {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #16a34a;
        font-weight: 700;
        font-size: 13px;
        pointer-events: none;
      }
      .dp__list {
        position: fixed;
        z-index: 1100;
        margin: 0;
        padding: 4px;
        list-style: none;
        background: #fff;
        border: 1px solid var(--border-default, #e2e8f0);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgb(15 23 42 / 0.12);
        max-height: 260px;
        overflow-y: auto;
      }
      .dp__list li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      .dp__list li.active,
      .dp__list li:hover {
        background: #eff6ff;
      }
      .dp__name {
        font-weight: 600;
        color: #0f172a;
      }
      .dp__spec {
        font-size: 12px;
        color: #64748b;
      }
      .dp__free {
        color: #2563eb;
        font-style: italic;
      }
      .dp__empty {
        color: #94a3b8;
        cursor: default !important;
      }
    `,
  ],
})
export class DoctorPickerComponent implements ControlValueAccessor {
  private api = inject(ClinicianService);
  private host = inject(ElementRef<HTMLElement>);

  /** The list is position:fixed so cards with overflow:hidden can't clip it. */
  pos = signal({ top: 0, left: 0, width: 0 });

  placeholder = input('Select or type doctor name');
  picked = output<PickedDoctor | null>();

  doctors = signal<PickedDoctor[]>(cache ?? []);
  text = signal('');
  open = signal(false);
  active = signal(-1);
  disabled = signal(false);
  linked = signal(false);

  matches = computed(() => {
    const q = this.text()
      .trim()
      .toLowerCase()
      .replace(/^dr\.?\s*/, '');
    const list = this.doctors();
    if (!q) return list.slice(0, 50);
    return list
      .filter((d) => `${d.name} ${d.specialisation ?? ''}`.toLowerCase().includes(q))
      .slice(0, 50);
  });
  exact = computed(() => {
    const t = this.text().trim().toLowerCase();
    return this.doctors().some((d) => d.name.toLowerCase() === t);
  });

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (!cache) this.load();
    // Inner panels scroll too, so listen in the capture phase to follow them.
    const onScroll = () => this.onViewportChange();
    window.addEventListener('scroll', onScroll, true);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', onScroll, true));
  }

  private load() {
    this.api.getClinicians().subscribe({
      next: (list) => {
        cache = (Array.isArray(list) ? list : []).map((c: any) => ({
          id: c.id,
          name: doctorDisplayName(c.name),
          specialisation: c.specialisation || '',
        }));
        this.doctors.set(cache);
        this.linked.set(this.exact());
      },
      error: () => this.doctors.set([]),
    });
  }

  /** Lets the clinician master page refresh every picker after a change. */
  static invalidate() {
    cache = null;
  }

  writeValue(v: string | null): void {
    this.text.set(v ?? '');
    this.linked.set(this.exact());
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled.set(d);
  }

  private place() {
    const el = this.host.nativeElement.querySelector('input') as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.pos.set({ top: r.bottom + 4, left: r.left, width: r.width });
  }

  @HostListener('window:resize')
  onViewportChange() {
    if (this.open()) this.place();
  }

  openList() {
    this.place();
    this.open.set(true);
    this.active.set(-1);
  }

  onType(v: string) {
    this.text.set(v);
    this.place();
    this.open.set(true);
    this.active.set(this.matches().length ? 0 : -1);
    this.onChange(v);
    // A hand-typed name that exactly matches a listed doctor still links to them.
    const hit = this.doctors().find((d) => d.name.toLowerCase() === v.trim().toLowerCase());
    this.linked.set(!!hit);
    this.picked.emit(hit ?? null);
  }

  choose(d: PickedDoctor) {
    this.text.set(d.name);
    this.onChange(d.name);
    this.linked.set(true);
    this.picked.emit(d);
    this.open.set(false);
  }

  useTyped() {
    this.open.set(false);
  }

  onBlur() {
    this.onTouched();
    setTimeout(() => this.open.set(false), 120);
  }

  onKey(e: KeyboardEvent) {
    const n = this.matches().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.open.set(true);
      if (n) this.active.set((this.active() + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (n) this.active.set((this.active() - 1 + n) % n);
    } else if (e.key === 'Enter' && this.open()) {
      const d = this.matches()[this.active()];
      if (d) {
        e.preventDefault();
        this.choose(d);
      } else {
        this.open.set(false);
      }
    } else if (e.key === 'Escape') {
      this.open.set(false);
    }
  }
}
