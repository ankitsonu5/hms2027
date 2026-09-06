import {
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
  OnDestroy,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Validated categorical palette (dataviz six-checks, light mode on #ffffff).
 * Fixed slot order — never cycled, never re-ordered per chart.
 */
export const SERIES = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
];

/** Thin wrapper that owns one Chart.js instance and rebuilds it when config changes. */
@Component({
  selector: 'hms-chart',
  standalone: true,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }
      canvas {
        width: 100% !important;
      }
    `,
  ],
  template: `<canvas #cv [style.height.px]="height()"></canvas>`,
})
export class ChartComponent implements OnDestroy {
  config = input.required<ChartConfiguration<any>>();
  height = input(220);

  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private chart?: Chart;

  constructor() {
    effect(() => {
      const cfg = this.config();
      const el = this.cv().nativeElement;
      this.chart?.destroy();
      this.chart = new Chart(el, cfg);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
