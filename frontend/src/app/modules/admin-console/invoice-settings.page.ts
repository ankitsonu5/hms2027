import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-settings',
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

      .card {
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        margin-bottom: 24px;
      }
      .card-header {
        margin-bottom: 24px;
      }
      .card-header h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #1e293b;
      }
      .card-header p {
        margin: 0;
        font-size: 13px;
        color: #64748b;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
        padding-left: 12px;
        margin-bottom: 16px;
      }

      .setting-row {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 16px;
        padding: 0 12px;
      }
      .setting-row > div {
        flex: 1;
      }
      .form-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .form-group label {
        font-size: 13px;
        color: #64748b;
        min-width: 60px;
      }
      .form-control {
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-size: 13px;
        outline: none;
        width: 100%;
        max-width: 250px;
      }
      .form-control:focus {
        border-color: #3b82f6;
      }
      
      .toggle-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #64748b;
      }
      
      /* Toggle switch CSS */
      .switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
      }
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #cbd5e1;
        transition: .4s;
        border-radius: 20px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #3b82f6;
      }
      input:checked + .slider:before {
        transform: translateX(16px);
      }

      .upload-box {
        text-align: center;
      }
      .upload-box .image-placeholder {
        color: #94a3b8;
        font-size: 13px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .btn-outline {
        background: #fff;
        border: 1px solid #3b82f6;
        color: #3b82f6;
        padding: 6px 16px;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
      }
      .btn-outline:hover {
        background: #eff6ff;
      }

      .helper-comment {
        padding: 0 12px;
        margin-bottom: 24px;
      }
      .helper-comment label {
        display: block;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 8px;
      }
      .helper-comment textarea {
        width: 100%;
        max-width: 500px;
        padding: 12px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        background: #f8fafc;
        font-size: 13px;
        min-height: 80px;
        resize: vertical;
        outline: none;
      }
      .helper-comment textarea:focus {
        border-color: #3b82f6;
      }
      .char-count {
        font-size: 11px;
        color: #94a3b8;
        display: block;
        margin-top: 4px;
      }

      .vat-info {
        font-size: 12px;
        color: #64748b;
        margin-top: 8px;
      }
      
      .footer-actions {
        display: flex;
        justify-content: center;
        margin-top: 32px;
      }
      .btn-primary {
        background: #4f82d1;
        color: #fff;
        border: none;
        padding: 10px 24px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-primary:hover {
        background: #3b6cb5;
      }
    `
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Invoice Settings</h1>
      </div>

      <div class="main-tabs">
        <div class="main-tab active">
          Invoice Settings
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Invoice Settings</h3>
          <p>Settings related to Invoices.</p>
        </div>

        <div class="section-title">Header Settings</div>
        
        <div class="setting-row">
          <div>
            <div class="form-group" style="margin-bottom: 16px;">
              <label>Height:</label>
              <input type="number" class="form-control" value="120" />
            </div>
            <div class="toggle-item">
              <label>Invoice Header Flag :</label>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
          </div>
          <div class="upload-box">
            <div class="image-placeholder">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>
              Image not found
            </div>
            <button class="btn-outline">Upload Header</button>
          </div>
        </div>

        <div class="section-title">Footer Settings</div>
        
        <div class="setting-row">
          <div>
            <div class="form-group" style="margin-bottom: 16px;">
              <label>Height:</label>
              <input type="number" class="form-control" value="50" />
            </div>
            <div class="toggle-item">
              <label>Invoice Footer Flag :</label>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
          </div>
          <div class="upload-box">
            <div class="image-placeholder">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>
              Image not found
            </div>
            <button class="btn-outline">Upload Footer</button>
          </div>
        </div>

        <div class="helper-comment">
          <label>Helper Comment :</label>
          <textarea placeholder="Describe why this change is needed"></textarea>
          <span class="char-count">0/250</span>
        </div>

        <div class="section-title">VAT Settings</div>
        
        <div class="setting-row" style="flex-direction: column; align-items: flex-start;">
          <div class="toggle-item">
            <label>Use Bill-Level VAT in QR Code :</label>
            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
          </div>
          <div class="vat-info">
            When OFF, VAT in QR is from invoice-level tax. When ON, it uses sum of bill-level VAT.
          </div>
        </div>

        <div class="footer-actions">
          <button class="btn-primary">Save Settings</button>
        </div>

      </div>
    </div>
  `
})
export class InvoiceSettingsPage {}
