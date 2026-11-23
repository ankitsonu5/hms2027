import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RefRange, rangeText } from '../../laboratory/lab-range';

interface RangeRow extends RefRange {
  rangeType: 'NUMERIC' | 'TEXT';
  gender: 'ANY' | 'MALE' | 'FEMALE';
  minAge: number;
  minAgeUnit: 'DAYS' | 'MONTHS' | 'YEARS';
  maxAge: number;
  maxAgeUnit: 'DAYS' | 'MONTHS' | 'YEARS';
  customDisplay: boolean;
}

/**
 * Modal for the normal values of one parameter. Each row is a band for a
 * gender and age window; the band that fits the patient is printed on the
 * report and used to flag the result.
 */
@Component({
  selector: 'hms-normal-value-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="nv-overlay" (click)="cancel.emit()">
      <div class="nv-modal" (click)="$event.stopPropagation()">
        <header class="nv-head">
          <div>
            <h2>Normal values</h2>
            <p>
              {{ parameterName }}
              @if (unit) {
                <span class="unit">({{ unit }})</span>
              }
            </p>
          </div>
          <button type="button" class="x" (click)="cancel.emit()" aria-label="Close">×</button>
        </header>

        <div class="nv-body">
          <p class="hint">
            Add one row per gender / age band. The narrowest band that matches the patient is used;
            a Male or Female row wins over "Any". Leave lower or upper blank for "&lt; x" or "&gt;
            x" ranges.
          </p>

          @for (r of rows(); track $index; let i = $index) {
            <div class="nv-row">
              <div class="nv-row-head">
                <strong>Range {{ i + 1 }}</strong>
                <div class="seg">
                  <button
                    type="button"
                    [class.on]="r.rangeType === 'NUMERIC'"
                    (click)="r.rangeType = 'NUMERIC'"
                  >
                    Numeric
                  </button>
                  <button
                    type="button"
                    [class.on]="r.rangeType === 'TEXT'"
                    (click)="r.rangeType = 'TEXT'"
                  >
                    Text
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm del"
                  (click)="remove(i)"
                  title="Remove range"
                >
                  Remove
                </button>
              </div>

              <div class="grid">
                <label
                  >Gender
                  <select class="form-control" [(ngModel)]="r.gender">
                    <option value="ANY">Any</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </label>
                <label
                  >Min age
                  <div class="pair">
                    <input class="form-control" type="number" min="0" [(ngModel)]="r.minAge" />
                    <select class="form-control" [(ngModel)]="r.minAgeUnit">
                      <option value="DAYS">Days</option>
                      <option value="MONTHS">Months</option>
                      <option value="YEARS">Years</option>
                    </select>
                  </div>
                </label>
                <label
                  >Max age
                  <div class="pair">
                    <input class="form-control" type="number" min="0" [(ngModel)]="r.maxAge" />
                    <select class="form-control" [(ngModel)]="r.maxAgeUnit">
                      <option value="DAYS">Days</option>
                      <option value="MONTHS">Months</option>
                      <option value="YEARS">Years</option>
                    </select>
                  </div>
                </label>
              </div>

              @if (r.rangeType === 'NUMERIC') {
                <div class="grid grid-4">
                  <label
                    >Lower value
                    <input class="form-control" type="number" step="any" [(ngModel)]="r.lowerValue"
                  /></label>
                  <label
                    >Upper value
                    <input class="form-control" type="number" step="any" [(ngModel)]="r.upperValue"
                  /></label>
                  <label
                    >Critical low
                    <input
                      class="form-control"
                      type="number"
                      step="any"
                      [(ngModel)]="r.criticalLow"
                      placeholder="optional"
                  /></label>
                  <label
                    >Critical high
                    <input
                      class="form-control"
                      type="number"
                      step="any"
                      [(ngModel)]="r.criticalHigh"
                      placeholder="optional"
                  /></label>
                </div>
              } @else {
                <div class="grid grid-1">
                  <label
                    >Expected value (e.g. Negative, Absent, 0 - 5)
                    <input class="form-control" [(ngModel)]="r.textValue" />
                  </label>
                </div>
              }

              <div class="grid grid-2">
                <label>
                  <span class="lbl-row">
                    Printed on report as
                    <span class="chk"
                      ><input type="checkbox" [(ngModel)]="r.customDisplay" /> custom text</span
                    >
                  </span>
                  @if (r.customDisplay) {
                    <textarea
                      class="form-control"
                      rows="2"
                      [(ngModel)]="r.displayText"
                      placeholder="e.g. Desirable: < 200"
                    ></textarea>
                  } @else {
                    <div class="preview">{{ preview(r) || '—' }}</div>
                  }
                </label>
                <label
                  >Remark (printed under the result)
                  <textarea
                    class="form-control"
                    rows="2"
                    [(ngModel)]="r.remark"
                    placeholder="optional"
                  ></textarea>
                </label>
              </div>
            </div>
          }

          <button type="button" class="btn btn-secondary btn-sm" (click)="add()">
            + Add range
          </button>
          @if (error()) {
            <div class="err">{{ error() }}</div>
          }
        </div>

        <footer class="nv-foot">
          <button type="button" class="btn btn-secondary" (click)="cancel.emit()">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="save()">Done</button>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      .nv-overlay {
        position: fixed;
        inset: 0;
        background: rgb(15 23 42 / 0.45);
        z-index: 1000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 40px 16px;
        overflow-y: auto;
      }
      .nv-modal {
        background: #fff;
        border-radius: 10px;
        width: min(880px, 100%);
        box-shadow: 0 20px 40px rgb(0 0 0 / 0.2);
      }
      .nv-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-default);
      }
      .nv-head h2 {
        margin: 0;
        font-size: 18px;
        font-family: var(--font-display);
      }
      .nv-head p {
        margin: 2px 0 0;
        color: var(--text-secondary);
        font-weight: 600;
      }
      .unit {
        font-weight: 400;
        color: var(--text-muted);
      }
      .x {
        border: 0;
        background: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-muted);
      }
      .nv-body {
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .hint {
        margin: 0;
        font-size: 12px;
        color: var(--text-secondary);
      }
      .nv-row {
        border: 1px solid var(--border-default);
        border-radius: 8px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #fcfdff;
      }
      .nv-row-head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .nv-row-head .del {
        margin-left: auto;
        color: var(--clr-danger-600);
      }
      .seg {
        display: inline-flex;
        border: 1px solid var(--border-default);
        border-radius: 6px;
        overflow: hidden;
      }
      .seg button {
        border: 0;
        background: #fff;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
      }
      .seg button.on {
        background: var(--clr-primary-600);
        color: #fff;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1.4fr 1.4fr;
        gap: 10px;
      }
      .grid-4 {
        grid-template-columns: repeat(4, 1fr);
      }
      .grid-2 {
        grid-template-columns: 1fr 1fr;
      }
      .grid-1 {
        grid-template-columns: 1fr;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-secondary);
      }
      .pair {
        display: flex;
        gap: 6px;
      }
      .pair input {
        width: 80px;
      }
      .lbl-row {
        display: flex;
        justify-content: space-between;
      }
      .chk {
        text-transform: none;
        font-weight: 500;
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }
      .preview {
        padding: 8px 12px;
        border: 1px dashed var(--border-strong);
        border-radius: 6px;
        font-size: 14px;
        text-transform: none;
        color: var(--text-primary);
        font-weight: 500;
        min-height: 38px;
        white-space: pre-line;
      }
      .err {
        color: var(--clr-danger-600);
        font-size: 13px;
      }
      .nv-foot {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 14px 20px;
        border-top: 1px solid var(--border-default);
      }
      @media (max-width: 700px) {
        .grid,
        .grid-4,
        .grid-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class NormalValueEditorComponent implements OnInit {
  @Input() parameterName = '';
  @Input() unit: string | null | undefined;
  @Input() ranges: RefRange[] = [];
  @Output() saved = new EventEmitter<RefRange[]>();
  @Output() cancel = new EventEmitter<void>();

  rows = signal<RangeRow[]>([]);
  error = signal('');

  ngOnInit() {
    const src = this.ranges?.length ? this.ranges : [{}];
    this.rows.set(src.map((r) => this.toRow(r)));
  }

  private toRow(r: RefRange): RangeRow {
    return {
      ...r,
      rangeType: (r.rangeType as any) || 'NUMERIC',
      gender: (r.gender as any) || 'ANY',
      minAge: r.minAge ?? 0,
      minAgeUnit: (r.minAgeUnit as any) || 'YEARS',
      maxAge: r.maxAge ?? 120,
      maxAgeUnit: (r.maxAgeUnit as any) || 'YEARS',
      lowerValue: r.lowerValue ?? null,
      upperValue: r.upperValue ?? null,
      criticalLow: r.criticalLow ?? null,
      criticalHigh: r.criticalHigh ?? null,
      customDisplay: !!r.displayText?.trim(),
    };
  }

  preview(r: RangeRow) {
    return rangeText({ ...r, displayText: null });
  }

  add() {
    const last = this.rows().at(-1);
    this.rows.update((rs) => [
      ...rs,
      this.toRow(last ? { ...last, id: undefined, displayText: null, remark: null } : {}),
    ]);
  }

  remove(i: number) {
    this.rows.update((rs) => rs.filter((_, idx) => idx !== i));
  }

  save() {
    const num = (v: any) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
    const out: RefRange[] = [];
    for (const [i, r] of this.rows().entries()) {
      const lower = num(r.lowerValue);
      const upper = num(r.upperValue);
      if (r.rangeType === 'NUMERIC' && lower == null && upper == null && !r.displayText?.trim()) {
        this.error.set(`Range ${i + 1}: enter a lower or upper value`);
        return;
      }
      if (r.rangeType === 'TEXT' && !r.textValue?.trim()) {
        this.error.set(`Range ${i + 1}: enter the expected value`);
        return;
      }
      if (lower != null && upper != null && lower > upper) {
        this.error.set(`Range ${i + 1}: lower value is greater than upper value`);
        return;
      }
      out.push({
        rangeType: r.rangeType,
        gender: r.gender,
        minAge: Math.max(0, Math.floor(num(r.minAge) ?? 0)),
        minAgeUnit: r.minAgeUnit,
        maxAge: Math.max(0, Math.floor(num(r.maxAge) ?? 120)),
        maxAgeUnit: r.maxAgeUnit,
        lowerValue: r.rangeType === 'NUMERIC' ? lower : null,
        upperValue: r.rangeType === 'NUMERIC' ? upper : null,
        criticalLow: r.rangeType === 'NUMERIC' ? num(r.criticalLow) : null,
        criticalHigh: r.rangeType === 'NUMERIC' ? num(r.criticalHigh) : null,
        textValue: r.rangeType === 'TEXT' ? r.textValue?.trim() : null,
        displayText: r.customDisplay ? r.displayText?.trim() || null : null,
        remark: r.remark?.trim() || null,
      });
    }
    this.error.set('');
    this.saved.emit(out);
  }
}
