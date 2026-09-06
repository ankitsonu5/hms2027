import {
  IsString,
  IsEnum,
  IsDateString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { PatientCategory, Gender, BloodGroup } from '../patient.entity';

export class CreatePatientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  dob: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  altPhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  aadhaar?: string;

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsEnum(PatientCategory)
  category?: PatientCategory;

  // B2B referral
  @IsOptional()
  @IsString()
  referredByDoctorId?: string;

  @IsOptional()
  @IsString()
  referredByDoctorName?: string;

  // Corporate
  @IsOptional()
  @IsString()
  corporateId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  // Insurance
  @IsOptional()
  @IsString()
  insurerId?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  // Compliance flags
  @IsOptional()
  @IsBoolean()
  hasNotifiableCondition?: boolean;

  @IsOptional()
  @IsBoolean()
  govtDataSharingConsent?: boolean;

  // OBG
  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsString()
  plannedDeliveryLocation?: string;

  @IsOptional()
  @IsBoolean()
  locationSharingConsent?: boolean;

  // ── Registration desk fields ──────────────────────────────────────────────
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  patientType?: string;

  @IsOptional()
  @IsString()
  optionalPatientId?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  phoneBelongsTo?: string;

  @IsOptional()
  @IsBoolean()
  whatsappConsent?: boolean;

  @IsOptional()
  @IsObject()
  screening?: Record<string, unknown>;
}
