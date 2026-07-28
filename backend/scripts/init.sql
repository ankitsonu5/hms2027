-- HMS Database Initialisation
-- Runs once on first docker-compose up

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for fast ILIKE patient search

-- Enum types (shared across tables)
CREATE TYPE user_role AS ENUM (
  'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST',
  'PHARMACIST', 'LAB_TECH', 'ACCOUNTANT', 'OWNER'
);

CREATE TYPE patient_category AS ENUM (
  'DIRECT', 'B2B_REFERRAL', 'CORPORATE', 'INSURANCE'
);

CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');

CREATE TYPE triage_tag AS ENUM ('RED', 'YELLOW', 'GREEN');

CREATE TYPE bed_status AS ENUM (
  'VACANT', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'
);

CREATE TYPE notifiable_flag AS ENUM ('NOTIFIABLE', 'NON_NOTIFIABLE');

CREATE TYPE drug_schedule AS ENUM (
  'GENERAL', 'SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X', 'NARCOTIC'
);
