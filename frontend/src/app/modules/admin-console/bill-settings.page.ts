import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bill-settings',
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

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 24px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-group label {
        font-size: 13px;
        color: #64748b;
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
      .note-text {
        font-size: 12px;
        color: #64748b;
        grid-column: span 3;
        margin-top: -12px;
      }

      .toggle-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e2e8f0;
      }
      .toggle-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #334155;
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
    `
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Bill Settings</h1>
      </div>

      <div class="main-tabs">
        <div class="main-tab active">
          Bill Settings
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Bill Receipt Settings</h3>
          <p>Settings related to format of bill receipt</p>
        </div>

        <div class="form-grid">
          <!-- Row 1 -->
          <div class="form-group">
            <label>Billing Font Size</label>
            <div class="select-wrap">
              <select class="form-control"><option>9</option></select>
              <span class="icon">▼</span>
            </div>
          </div>
          <div class="form-group">
            <label>Billing Font Family</label>
            <div class="select-wrap">
              <select class="form-control"><option>Times New Roman</option></select>
              <span class="icon">▼</span>
            </div>
          </div>
          <div class="form-group">
            <label>Billing Paper Size</label>
            <div class="select-wrap">
              <select class="form-control"><option>A4</option></select>
              <span class="icon">▼</span>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="form-group">
            <label>Header Height</label>
            <input type="number" class="form-control" value="100" />
          </div>
          <div class="form-group">
            <label>Footer Height</label>
            <input type="number" class="form-control" value="150" />
          </div>
          <div class="form-group">
            <label>Billing Paper Mode</label>
            <div class="select-wrap">
              <select class="form-control"><option>Select Paper Mode</option></select>
              <span class="icon">▼</span>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="form-group">
            <label>Bill Paper Width</label>
            <input type="number" class="form-control" value="595" />
          </div>
          <div class="form-group">
            <label>Bill Paper Height</label>
            <input type="number" class="form-control" value="900" />
          </div>
          <div class="form-group">
            <label>Billing Paper Margin</label>
            <input type="number" class="form-control" value="20" />
          </div>

          <!-- Row 4 -->
          <div class="form-group">
            <label>Barcode Abbreviation</label>
            <input type="text" class="form-control" value="01" />
          </div>
          <div class="form-group">
            <label>TDS Concession %</label>
            <input type="number" class="form-control" value="10.00" />
          </div>
          <div class="form-group"></div>
          
          <div class="note-text">
            Note: TDS will be calculated over the bills having amount greater than 30,000
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 0;">
          <div class="form-group">
            <label>Pre-set Additional Amount</label>
            <input type="number" class="form-control" value="0.00" />
          </div>
          <div class="form-group">
            <!-- empty for grid alignment -->
          </div>
          <div class="note-text" style="grid-column: span 3; margin-top: 0;">
            (Set fixed additional amounts like Government taxes which can be added to bill amount (%))
          </div>
        </div>

        <div class="toggle-grid">
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Bill Header Flag
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Bill Footer Flag
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Bill Signature Flag
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Barcode Flag
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Sample Type on Barcode
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Collection Date
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            Bill Receipt QR Code
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            Test Name
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            Short Test Names
          </div>
        </div>

        <div class="toggle-grid" style="grid-template-columns: repeat(2, 1fr);">
          <div class="toggle-item">
            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            Duplicate Accession Number
          </div>
          <div class="toggle-item">
            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            Manual Accession Number Mandatory
          </div>
        </div>

      </div>
    </div>
  `
})
export class BillSettingsPage {}
