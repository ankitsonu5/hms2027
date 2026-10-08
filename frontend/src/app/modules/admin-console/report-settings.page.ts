import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .page-container {
        padding: 24px;
        background: #f8fafc;
        min-height: 100vh;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }
      .main-tabs {
        display: flex;
        border-bottom: 2px solid #e2e8f0;
        margin-bottom: 24px;
      }
      .main-tab {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        position: relative;
      }
      .main-tab.active {
        color: #3b82f6;
      }
      .main-tab.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #3b82f6;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        margin-bottom: 24px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-group.full-width {
        grid-column: span 3;
      }
      .form-group label {
        font-size: 13px;
        color: #64748b;
      }
      .form-group label .req {
        color: #ef4444;
      }
      .form-control {
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-size: 13px;
        outline: none;
      }
      .form-control:focus {
        border-color: #3b82f6;
      }
      .select-wrap {
        position: relative;
        display: flex;
      }
      .select-wrap select {
        width: 100%;
        appearance: none;
        padding-right: 32px;
      }
      .select-wrap .icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: #94a3b8;
      }
      
      .checkbox-group {
        display: flex;
        gap: 24px;
        margin-top: 16px;
      }
      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #334155;
      }

      .accordion-panel {
        background: #f1f5f9;
        border-radius: 4px;
        margin-bottom: 12px;
      }
      .accordion-header {
        padding: 16px;
        font-size: 13px;
        font-weight: 500;
        color: #475569;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
      }
    `
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Report Settings</h1>
      </div>

      <div class="main-tabs">
        <div class="main-tab" [class.active]="activeTab() === 'SETTINGS'" (click)="activeTab.set('SETTINGS')">
          Report Settings
        </div>
        <div class="main-tab" [class.active]="activeTab() === 'ASSIGN'" (click)="activeTab.set('ASSIGN')">
          Assign Settings To Tests
        </div>
      </div>

      @if (activeTab() === 'SETTINGS') {
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Setting Name <span class="req">*</span></label>
            <input type="text" class="form-control" placeholder="Setting Name" />
          </div>

          <!-- Row 1 -->
          <div class="form-group">
            <label>Paper Size</label>
            <div class="select-wrap">
              <select class="form-control">
                <option>A4</option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>
          <div class="form-group">
            <label>Patient Info <span class="req">*</span></label>
            <input type="text" class="form-control" value="150" />
          </div>
          <div class="form-group">
            <label>Font Type <span class="req">*</span></label>
            <div class="select-wrap">
              <select class="form-control">
                <option>BookmanOld</option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="form-group">
            <label>Font Size <span class="req">*</span></label>
            <input type="number" class="form-control" value="10" />
          </div>
          <div class="form-group">
            <label>Primary Sign Position <span class="req">*</span></label>
            <div class="select-wrap">
              <select class="form-control">
                <option>Right</option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>
          <div class="form-group">
            <label>Max Approval <span class="req">*</span></label>
            <input type="number" class="form-control" value="2" />
          </div>

          <!-- Row 3 -->
          <div class="form-group">
            <label>Header Size <span class="req">*</span></label>
            <input type="number" class="form-control" value="85" />
          </div>
          <div class="form-group">
            <label>Vertical Spacing <span class="req">*</span></label>
            <div class="select-wrap">
              <select class="form-control">
                <option>Compressed</option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>
          <div class="form-group">
            <label>Min Approval <span class="req">*</span></label>
            <input type="number" class="form-control" value="1" />
          </div>

          <!-- Row 4 -->
          <div class="form-group">
            <label>Sign Size <span class="req">*</span></label>
            <input type="number" class="form-control" value="100" />
          </div>
          <div class="form-group">
            <label>Page No X <span class="req">*</span></label>
            <input type="number" class="form-control" value="519" />
          </div>
          <div class="form-group">
            <label>Date Format <span class="req">*</span></label>
            <div class="select-wrap">
              <select class="form-control">
                <option>Dec 01, 2015, 12:00 a.m.</option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>

          <!-- Row 5 -->
          <div class="form-group">
            <label>Footer Size <span class="req">*</span></label>
            <input type="number" class="form-control" value="78" />
          </div>
          <div class="form-group">
            <label>Page No Y <span class="req">*</span></label>
            <input type="number" class="form-control" value="13" />
          </div>
          <div class="form-group">
            <label>Paper Margin <span class="req">*</span></label>
            <input type="number" class="form-control" value="40" />
          </div>

          <!-- Row 6 -->
          <div class="form-group">
            <label>Template Name <span class="req">*</span></label>
            <div class="select-wrap">
              <select class="form-control">
                <option>PDF with underlined test labels...</option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>
          <div class="form-group full-width" style="grid-column: span 2;">
            <label>End of Report Text</label>
            <input type="text" class="form-control" value="**END OF REPORT**" />
          </div>

          <div class="form-group full-width">
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" /> Show PDF Header
              </label>
              <label class="checkbox-item">
                <input type="checkbox" /> Show PDF Footer
              </label>
            </div>
          </div>
        </div>

        <div class="accordion-panel">
          <div class="accordion-header" (click)="watermarkOpen.set(!watermarkOpen())">
            Upload Watermark
            <span>{{ watermarkOpen() ? '▲' : '▼' }}</span>
          </div>
          @if (watermarkOpen()) {
            <div style="padding: 16px; background: #fff;">
              <input type="file" />
            </div>
          }
        </div>

        <div class="accordion-panel">
          <div class="accordion-header" (click)="accreditationOpen.set(!accreditationOpen())">
            Upload Accreditation Image
            <span>{{ accreditationOpen() ? '▲' : '▼' }}</span>
          </div>
          @if (accreditationOpen()) {
            <div style="padding: 16px; background: #fff;">
              <input type="file" />
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReportSettingsPage {
  activeTab = signal<'SETTINGS' | 'ASSIGN'>('SETTINGS');
  watermarkOpen = signal(false);
  accreditationOpen = signal(false);
}
