import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

/**
 * Shared page for administration modules that are on the roadmap but not built.
 * One component, driven by route data — swap an individual route's component
 * for the real page as each module lands.
 */
@Component({
  selector: 'hms-module-placeholder',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      :host {
        display: block;
      }

      .crumb {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-bottom: var(--sp-2);
      }

      h1 {
        font-family: var(--font-display);
        font-weight: var(--fw-display-bold);
        font-size: var(--text-xl);
        letter-spacing: var(--ls-tight);
        color: var(--text-primary);
      }

      .panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-3);
        margin-top: var(--sp-6);
        padding: var(--sp-12) var(--sp-6);
        text-align: center;
        background: var(--bg-surface);
        border: 1px dashed var(--border-strong);
        border-radius: var(--radius-lg);
      }

      .icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: var(--radius-full);
        color: var(--clr-primary-600);
        background: var(--clr-primary-50);
      }

      .panel strong {
        font-family: var(--font-display);
        font-size: var(--text-md);
        color: var(--text-primary);
      }

      .panel p {
        max-width: 46ch;
        font-size: var(--text-sm);
        line-height: var(--lh-relaxed);
        color: var(--text-secondary);
      }

      .back {
        margin-top: var(--sp-2);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--clr-primary-600);
        text-decoration: none;
      }

      .back:hover {
        text-decoration: underline;
      }
    `,
  ],
  template: `
    @if (parent()) {
      <div class="crumb">{{ parent() }}</div>
    }
    <h1>{{ title() }}</h1>

    <div class="panel">
      <span class="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M8 7V5a4 4 0 0 1 8 0v2M12 12v4" />
        </svg>
      </span>
      <strong>{{ title() }} is not built yet</strong>
      <p>
        This screen is wired up and routed, but the module behind it hasn't been
        implemented. It's a placeholder so the navigation is complete and clickable.
      </p>
      <a class="back" routerLink="/dashboard">← Back to Account Overview</a>
    </div>
  `,
})
export class ModulePlaceholderPage {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data, { initialValue: {} as any });

  title = () => this.data()['title'] ?? 'Module';
  parent = () => this.data()['parent'] ?? '';
}
