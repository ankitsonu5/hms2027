# MediOrbit HMS (HMS2027)

> **Enterprise Hospital Management System (HMS)** — A full-stack, multi-tenant healthcare administration platform built with **NestJS 11**, **Angular 22**, **PostgreSQL**, and **TypeORM**.

---

## 🌟 Key Features & Modules

### 🏥 Clinical & Patient Care
- **Patient Registration & EMR**: Complete patient demographic tracking, unique MRN generation, medical history, and quick search.
- **OPD (Outpatient Department)**: Appointment queues, clinician consultation notes, diagnostic orders, and e-prescriptions.
- **IPD (Inpatient Department) & Wards**: Bed management, ward allocation, admission-to-discharge workflows, and inpatient care notes.
- **Emergency Department**: Rapid triage registration, emergency admissions, and urgent care tracking.

### 🧪 Diagnostics & Ancillary Services
- **Laboratory Information System (LIS)**: Test catalog management, accessioning, barcode tracking, lab result entry, and automated receipt generation.
- **Phlebotomist & Home Collection**: Home sample collection calendar, dispatch tracking, phlebotomist management, and status updates.
- **Radiology**: Scan orders, diagnostic parameter templates, and radiology report generation.
- **Pharmacy & POS**: Drug catalog, stock management, dispensary point-of-sale, and billing integration.

### 💼 Administration, Billing & MIS
- **Comprehensive Billing**: OPD/IPD bill generation, multi-mode payment collection, custom discount rules, and receipt printing.
- **Department Management**: Dynamic hospital department setup, clinician assignments, and operational tracking.
- **Clinician Management**: Doctor profiles, specialties, consultation schedules, and availability hours.
- **Smart Reports & Analytics**: Customizable report builder, financial metrics, departmental census, and operational KPIs.

---

## 🏗️ Architecture & Tech Stack

```
HMS2027 / MediOrbit
├── backend/                  # NestJS 11 REST API & TypeORM backend
│   ├── src/
│   │   ├── modules/          # Domain-driven modules (auth, patient, opd, ipd, lab, pharmacy, billing...)
│   │   ├── common/           # Guards, interceptors, decorators, filters
│   │   └── main.ts           # Application bootstrap & Swagger documentation
│   └── scripts/              # Database initialization & migrations
│
├── frontend/                 # Angular 22 Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Guards, interceptors, state services, navigation definitions
│   │   │   ├── layout/       # Shell, topbar, sidebar components
│   │   │   └── modules/      # Feature pages (OPD, IPD, Billing, Laboratory, Admin Console...)
│   │   └── styles.scss       # Global design system & theme variables
│
├── docker-compose.yml        # PostgreSQL 16 & Redis container configuration
├── ecosystem.config.js       # PM2 production process configuration
└── deploy.sh                 # Zero-downtime server build and deployment script
```

| Layer | Technology |
|---|---|
| **Frontend Framework** | Angular 22 (Standalone Components, Signals, RxJS) |
| **Backend Framework** | NestJS 11 (Express platform, TypeScript) |
| **Database & ORM** | PostgreSQL 16 + TypeORM |
| **Caching / Sessions** | Redis 7 |
| **Authentication** | JWT (Access & Refresh tokens) with bcrypt password hashing |
| **Documentation** | OpenAPI / Swagger (`/api/docs`) |
| **Process Manager** | PM2 |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+ or v22 LTS (recommended)
- **npm**: v10+
- **PostgreSQL**: v15+ (or Docker)

---

### 1. Database Setup (Docker or Local)

#### Using Docker:
```bash
docker compose up -d
```
This spins up PostgreSQL on port `5432` (or configured port) and Redis on `6379`.

---

### 2. Backend Configuration & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file and configure credentials:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies and start the backend:
   ```bash
   npm install
   npm run start:dev
   ```
   The backend API will be available at `http://localhost:3000/api/v1`.
   Interactive Swagger documentation is available at `http://localhost:3000/api/docs`.

---

### 3. Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies and start the Angular development server:
   ```bash
   npm install
   npm start
   ```
   Open your browser at `http://localhost:4200` to access the application.

---

## 📦 Production Build & Deployment

MediOrbit is architected for unified single-origin serving: the Angular application builds directly into `backend/client`, allowing the NestJS server to serve both the frontend SPA and the REST API on a single port.

### 1. Build Both Applications
From the project root:
```bash
npm run build
```
Or build individually:
```bash
# Build Frontend
cd frontend && npm run build

# Build Backend
cd ../backend && npm run build
```

### 2. Run with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Automated One-Command Deploy (Linux VPS)
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔒 Security Best Practices
- **Environment Variables**: Sensitive credentials (passwords, JWT secrets, database connection strings) are stored strictly in `.env` files and excluded from Git via `.gitignore`.
- **JWT Authentication**: Secure Bearer tokens with configurable expiration and refresh cycles.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions per role (`ADMIN`, `DOCTOR`, `NURSE`, `PHARMACIST`, `LAB_TECH`, `ACCOUNTANT`).
- **Data Validation**: Request payload validation using NestJS `class-validator` and `ValidationPipe`.

---

## 📄 License
This project is proprietary and confidential. All rights reserved.
