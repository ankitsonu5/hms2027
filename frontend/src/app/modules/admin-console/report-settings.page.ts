import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabApiService } from '../../core/services/lab-api.service';

interface Signature {
  name: string;
  designation?: string;
  imageUrl?: string;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Letterhead, layout and signatures of the printed lab report. */
@Component({
  selector: 'hms-report-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="rs-page">
      <div class="rs-head">
        <div>
          <h1>Report settings</h1>
          <p class="sub">
            How the printed lab report looks. Changes apply to every report printed after saving.
          </p>
        </div>
        <div class="acts">
          @if (saved()) {
            <span class="ok">Saved</span>
          }
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="saving() || !s()"
            (click)="save()"
          >
            {{ saving() ? 'Saving…' : 'Save settings' }}
          </button>
        </div>
      </div>
      @if (error()) {
        <div class="alert">{{ error() }}</div>
      }

      @if (s(); as st) {
        <section class="card">
          <h2>Letterhead</h2>
          <div class="grid2">
            <div>
              <span class="lbl">Header image (full width, printed at the top of every page)</span>
              <div class="img-box" [style.height.px]="90">
                @if (st.headerImage) {
                  <img [src]="st.headerImage" alt="Header" />
                } @else {
                  <span class="muted"
                    >No image – the lab name and address below are printed instead</span
                  >
                }
              </div>
              <div class="row">
                <label class="btn btn-secondary btn-sm file"
                  >Upload<input type="file" accept="image/*" (change)="pick($event, 'headerImage')"
                /></label>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  (click)="st.headerImage = '/access-pathlab-header.jpeg'"
                >
                  Use default
                </button>
                @if (st.headerImage) {
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    (click)="st.headerImage = null"
                  >
                    Remove
                  </button>
                }
              </div>
            </div>
            <div>
              <span class="lbl">Footer image (optional, bottom of every page)</span>
              <div class="img-box" [style.height.px]="90">
                @if (st.footerImage) {
                  <img [src]="st.footerImage" alt="Footer" />
                } @else {
                  <span class="muted">No footer image</span>
                }
              </div>
              <div class="row">
                <label class="btn btn-secondary btn-sm file"
                  >Upload<input type="file" accept="image/*" (change)="pick($event, 'footerImage')"
                /></label>
                @if (st.footerImage) {
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    (click)="st.footerImage = null"
                  >
                    Remove
                  </button>
                }
              </div>
            </div>
          </div>
          <div class="grid4">
            <label
              >Header space (mm)<input
                class="form-control"
                type="number"
                min="0"
                max="120"
                [(ngModel)]="st.headerHeightMm"
            /></label>
            <label
              >Footer space (mm)<input
                class="form-control"
                type="number"
                min="0"
                max="80"
                [(ngModel)]="st.footerHeightMm"
            /></label>
            <label class="chk span2"
              ><input type="checkbox" [(ngModel)]="st.letterheadByDefault" /> Print with letterhead
              by default (untick when using pre-printed stationery)</label
            >
          </div>
          <div class="grid3">
            <label>Lab name<input class="form-control" [(ngModel)]="st.labName" /></label>
            <label>Address<input class="form-control" [(ngModel)]="st.labAddress" /></label>
            <label>Phone / email<input class="form-control" [(ngModel)]="st.labContact" /></label>
          </div>
        </section>

        <section class="card">
          <h2>Layout</h2>
          <div class="grid4">
            <label
              >Font
              <select class="form-control" [(ngModel)]="st.fontFamily">
                @for (f of fonts; track f) {
                  <option [value]="f">{{ f }}</option>
                }
              </select>
            </label>
            <label
              >Font size (pt)<input
                class="form-control"
                type="number"
                min="7"
                max="14"
                step="0.5"
                [(ngModel)]="st.fontSizePt"
            /></label>
            <label
              >Side margin (mm)<input
                class="form-control"
                type="number"
                min="0"
                max="40"
                [(ngModel)]="st.marginMm"
            /></label>
            <label
              >Abnormal value mark
              <select class="form-control" [(ngModel)]="st.flagStyle">
                <option value="HL">H / L next to value</option>
                <option value="ARROW">↑ / ↓ next to value</option>
                <option value="BOLD">Bold only</option>
              </select>
            </label>
          </div>
          <div class="checks">
            <label class="chk"
              ><input type="checkbox" [(ngModel)]="st.showUnitColumn" /> Unit column</label
            >
            <label class="chk"
              ><input type="checkbox" [(ngModel)]="st.showMethodColumn" /> Method column</label
            >
            <label class="chk"
              ><input type="checkbox" [(ngModel)]="st.boldAbnormal" /> Bold abnormal values</label
            >
            <label class="chk"
              ><input type="checkbox" [(ngModel)]="st.showSampleType" /> Show sample type</label
            >
            <label class="chk"
              ><input type="checkbox" [(ngModel)]="st.departmentOnNewPage" /> Each department on a
              new page</label
            >
          </div>
        </section>

        <section class="card">
          <h2>Signatures</h2>
          <p class="muted small">Printed at the end of the report, left to right.</p>
          <div class="signs">
            @for (sg of st.signatures; track $index; let i = $index) {
              <div class="sign">
                <div class="img-box sig">
                  @if (sg.imageUrl) {
                    <img [src]="sg.imageUrl" alt="Signature" />
                  } @else {
                    <span class="muted">No signature image</span>
                  }
                </div>
                <div class="row">
                  <label class="btn btn-secondary btn-sm file"
                    >Upload<input type="file" accept="image/*" (change)="pickSignature($event, sg)"
                  /></label>
                  @if (sg.imageUrl) {
                    <button type="button" class="btn btn-ghost btn-sm" (click)="sg.imageUrl = ''">
                      Remove image
                    </button>
                  }
                </div>
                <label
                  >Name<input class="form-control" [(ngModel)]="sg.name" placeholder="Dr. …"
                /></label>
                <label
                  >Designation / qualification<input
                    class="form-control"
                    [(ngModel)]="sg.designation"
                    placeholder="MD (Pathology)"
                /></label>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm danger"
                  (click)="removeSignature(i)"
                >
                  Remove signature
                </button>
              </div>
            }
            <button type="button" class="add-sign" (click)="addSignature()">+ Add signature</button>
          </div>
        </section>

        <section class="card">
          <h2>Closing text</h2>
          <div class="grid2">
            <label
              >End of report line<input class="form-control" [(ngModel)]="st.endOfReportText"
            /></label>
            <label
              >Footer notes (one per line)<textarea
                class="form-control"
                rows="3"
                [(ngModel)]="st.footerNotes"
              ></textarea>
            </label>
          </div>
        </section>
      } @else {
        <div class="card muted">Loading…</div>
      }
    </div>
  `,
  styles: [
    `
      .rs-page {
        padding: 20px 24px 40px;
        background: #f8fafc;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: 1100px;
      }
      .rs-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        flex-wrap: wrap;
      }
      h1 {
        margin: 0;
        font-family: var(--font-display);
        font-size: 22px;
      }
      .sub {
        margin: 4px 0 0;
        color: var(--text-secondary);
        font-size: 13px;
      }
      .acts {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .ok {
        color: var(--clr-success-600);
        font-weight: 600;
        font-size: 13px;
      }
      .alert {
        background: var(--clr-danger-100);
        color: #991b1b;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
      }
      .card {
        background: #fff;
        border: 1px solid var(--border-default);
        border-radius: 10px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      h2 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .grid3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .grid4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        align-items: end;
      }
      .span2 {
        grid-column: span 2;
      }
      label,
      .lbl {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-secondary);
      }
      .chk {
        flex-direction: row;
        align-items: center;
        gap: 6px;
        text-transform: none;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        letter-spacing: 0;
      }
      .checks {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 24px;
      }
      .img-box {
        border: 1px dashed var(--border-strong);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        overflow: hidden;
        margin-top: 4px;
      }
      .img-box img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .img-box.sig {
        height: 70px;
      }
      .row {
        display: flex;
        gap: 6px;
        margin-top: 6px;
        align-items: center;
      }
      .file {
        position: relative;
        overflow: hidden;
      }
      .file input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }
      .muted {
        color: var(--text-muted);
        font-size: 12px;
        text-transform: none;
        font-weight: 400;
        text-align: center;
        padding: 8px;
      }
      .small {
        margin: 0;
        text-align: left;
        padding: 0;
      }
      .signs {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
      }
      .sign {
        border: 1px solid var(--border-default);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .danger {
        color: var(--clr-danger-600);
        align-self: flex-start;
      }
      .add-sign {
        border: 1px dashed var(--clr-primary-500);
        background: var(--clr-primary-50);
        color: var(--clr-primary-700);
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        min-height: 120px;
      }
      @media (max-width: 800px) {
        .grid2,
        .grid3,
        .grid4 {
          grid-template-columns: 1fr;
        }
        .span2 {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class ReportSettingsPage implements OnInit {
  private api = inject(LabApiService);

  readonly fonts = [
    'Arial',
    'Calibri',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Tahoma',
  ];
  s = signal<any>(null);
  saving = signal(false);
  saved = signal(false);
  error = signal('');

  ngOnInit() {
    this.api.getReportSettings().subscribe({
      next: (s) =>
        this.s.set({ ...s, fontSizePt: Number(s.fontSizePt), signatures: s.signatures ?? [] }),
      error: (e) => this.error.set(e?.error?.message || 'Could not load settings'),
    });
  }

  private readImage(event: Event, apply: (dataUrl: string) => void) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      this.error.set('Image is larger than 2 MB. Please use a smaller / compressed image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      apply(reader.result as string);
      this.s.update((s) => ({ ...s }));
      this.error.set('');
    };
    reader.readAsDataURL(file);
  }

  pick(event: Event, field: 'headerImage' | 'footerImage') {
    this.readImage(event, (url) => (this.s()[field] = url));
  }

  pickSignature(event: Event, sg: Signature) {
    this.readImage(event, (url) => (sg.imageUrl = url));
  }

  addSignature() {
    this.s.update((s) => ({
      ...s,
      signatures: [...s.signatures, { name: '', designation: '', imageUrl: '' }],
    }));
  }

  removeSignature(i: number) {
    this.s.update((s) => ({
      ...s,
      signatures: s.signatures.filter((_: Signature, idx: number) => idx !== i),
    }));
  }

  save() {
    const st = this.s();
    const num = (v: any, d: number) =>
      v === '' || v == null || Number.isNaN(Number(v)) ? d : Number(v);
    const body = {
      headerImage: st.headerImage || undefined,
      footerImage: st.footerImage || undefined,
      headerHeightMm: Math.round(num(st.headerHeightMm, 38)),
      footerHeightMm: Math.round(num(st.footerHeightMm, 18)),
      letterheadByDefault: !!st.letterheadByDefault,
      labName: st.labName ?? '',
      labAddress: st.labAddress ?? '',
      labContact: st.labContact ?? '',
      marginMm: Math.round(num(st.marginMm, 12)),
      fontSizePt: num(st.fontSizePt, 10),
      fontFamily: st.fontFamily,
      showMethodColumn: !!st.showMethodColumn,
      showUnitColumn: !!st.showUnitColumn,
      flagStyle: st.flagStyle,
      boldAbnormal: !!st.boldAbnormal,
      showSampleType: !!st.showSampleType,
      departmentOnNewPage: !!st.departmentOnNewPage,
      endOfReportText: st.endOfReportText ?? '',
      footerNotes: st.footerNotes ?? '',
      signatures: (st.signatures as Signature[])
        .filter((g) => g.name?.trim())
        .map((g) => ({
          name: g.name.trim(),
          designation: g.designation?.trim() || undefined,
          imageUrl: g.imageUrl || undefined,
        })),
    };
    // Removing an image is sent as an explicit null so the server clears it.
    const payload: any = {
      ...body,
      headerImage: st.headerImage || null,
      footerImage: st.footerImage || null,
    };
    this.saving.set(true);
    this.error.set('');
    this.api.updateReportSettings(payload).subscribe({
      next: (s) => {
        this.saving.set(false);
        this.s.set({ ...s, fontSizePt: Number(s.fontSizePt), signatures: s.signatures ?? [] });
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (e) => {
        this.saving.set(false);
        const m = e?.error?.message;
        this.error.set(Array.isArray(m) ? m.join(', ') : m || 'Could not save settings');
      },
    });
  }
}
