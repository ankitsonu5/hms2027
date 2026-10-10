import { Injectable, inject, signal } from '@angular/core';
import { PhlebotomistApiService, PhlebotomistModel } from './phlebotomist-api.service';

export interface HomeCollection {
  id: string; // e.g. HMC-2026-00101
  seqNo: number;
  // Patient details
  patientId: string; // UHID-2026-XXXXX
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  email?: string;
  address: string;
  landmark?: string;
  zone: string;
  // Schedule
  date: string; // YYYY-MM-DD
  timeSlot: string;
  fastingRequired: boolean;
  priority?: 'Normal' | 'Urgent' | 'VIP';
  // Tests & Specimen
  tests: string[];
  tubesRequired: string[];
  specialInstructions?: string;
  // Phlebotomist details
  phlebotomistId: string;
  phlebotomistName: string;
  phlebotomistPhone: string;
  phlebotomistVehicle?: string;
  // Status & Billing
  status: 'SCHEDULED' | 'ASSIGNED' | 'SAMPLE_COLLECTED' | 'IN_TRANSIT' | 'DELIVERED_TO_LAB' | 'CANCELLED';
  paymentStatus: 'Paid' | 'Cash on Collection' | 'UPI on Collection' | 'Insurance';
  totalAmount: number;
  barcode?: string;
  temperatureCelsius?: number;
  createdAt: string;
}

const STORAGE_KEY = 'hms_home_collections';

export const COMMON_LAB_TESTS = [
  { name: 'Complete Blood Count (CBC)', tube: 'EDTA (Purple)', price: 350, fasting: false },
  { name: 'Fasting Blood Sugar (FBS)', tube: 'Fluoride (Grey)', price: 100, fasting: true },
  { name: 'Post Prandial Blood Sugar (PPBS)', tube: 'Fluoride (Grey)', price: 100, fasting: false },
  { name: 'HbA1c (Glycated Hemoglobin)', tube: 'EDTA (Purple)', price: 550, fasting: false },
  { name: 'Lipid Profile (Full)', tube: 'SST/Gel (Yellow)', price: 750, fasting: true },
  { name: 'Liver Function Test (LFT)', tube: 'SST/Gel (Yellow)', price: 650, fasting: false },
  { name: 'Kidney Function Test (KFT/RFT)', tube: 'SST/Gel (Yellow)', price: 600, fasting: false },
  { name: 'Thyroid Profile (Total T3, T4, TSH)', tube: 'SST/Gel (Yellow)', price: 500, fasting: false },
  { name: 'Vitamin D (25-Hydroxy)', tube: 'SST/Gel (Yellow)', price: 1200, fasting: false },
  { name: 'Vitamin B12 (Cyanocobalamin)', tube: 'SST/Gel (Yellow)', price: 900, fasting: false },
  { name: 'Serum Electrolytes (Na, K, Cl)', tube: 'SST/Gel (Yellow)', price: 450, fasting: false },
  { name: 'Urine Routine & Microscopy', tube: 'Sterile Container', price: 150, fasting: false },
];

export const ZONES = [
  'Zone 1 - Krishna Nagar & Ramnagar',
  'Zone 2 - MVP Colony & Lawson Bay',
  'Zone 3 - Gajuwaka & Steel Plant',
  'Zone 4 - Madhurawada & Rushikonda',
  'Zone 5 - Waltair Uplands & Siripuram',
];

export const TIME_SLOTS = [
  '06:30 AM - 08:00 AM (Early Fasting)',
  '08:00 AM - 09:30 AM (Morning)',
  '09:30 AM - 11:00 AM (Mid-Morning)',
  '11:00 AM - 01:00 PM (Noon)',
  '02:00 PM - 04:00 PM (Afternoon)',
  '04:00 PM - 06:30 PM (Evening)',
];

@Injectable({ providedIn: 'root' })
export class HomeCollectionService {
  private phleboApi = inject(PhlebotomistApiService);

  collections = signal<HomeCollection[]>([]);
  phlebotomists = signal<PhlebotomistModel[]>([]);

  constructor() {
    this.loadPhlebotomists();
    this.loadCollections();
  }

  loadPhlebotomists(): void {
    this.phleboApi.list().subscribe({
      next: (list) => {
        this.phlebotomists.set(list || []);
      },
      error: () => {
        this.phlebotomists.set([]);
      },
    });
  }

  loadCollections(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.collections.set(parsed);
          this.saveToStorage(parsed);
          return;
        }
      } catch {
        // fallback
      }
    }

    this.collections.set([]);
    this.saveToStorage([]);
  }

  saveToStorage(items: HomeCollection[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save home collections to localStorage', e);
    }
  }

  addCollection(col: Omit<HomeCollection, 'id' | 'seqNo' | 'createdAt'>): HomeCollection {
    const list = this.collections();
    const nextSeq = list.length + 1;
    const year = new Date().getFullYear();
    const newCol: HomeCollection = {
      ...col,
      id: `HMC-${year}-${String(100 + nextSeq).padStart(5, '0')}`,
      seqNo: nextSeq,
      barcode: `BC${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCol, ...list];
    this.collections.set(updated);
    this.saveToStorage(updated);
    return newCol;
  }

  updateCollection(id: string, updates: Partial<HomeCollection>): void {
    const updated = this.collections().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.collections.set(updated);
    this.saveToStorage(updated);
  }

  updateStatus(id: string, status: HomeCollection['status']): void {
    this.updateCollection(id, { status });
  }

  deleteCollection(id: string): void {
    const updated = this.collections().filter((c) => c.id !== id);
    this.collections.set(updated);
    this.saveToStorage(updated);
  }
}
