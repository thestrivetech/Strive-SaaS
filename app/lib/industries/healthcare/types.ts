/**
 * Healthcare Industry Types
 *
 * Type definitions specific to the healthcare industry.
 * Co-located with the healthcare implementation for better organization.
 */

import type { Customer } from '@prisma/client';

/**
 * Healthcare-Specific Customer Extension
 *
 * Extends the base Customer type with healthcare-specific fields
 */
export interface HealthcareCustomer extends Customer {
  // Custom fields stored in customFields JSON
  customFields: {
    patientId: string;
    dateOfBirth: Date;
    insuranceProvider?: string;
    primaryPhysician?: string;
    hipaaConsentDate: Date;

    // Optional healthcare-specific fields
    bloodType?: string;
    allergies?: string[];
    currentMedications?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}

/**
 * Patient Status
 */
export type PatientStatus =
  | 'active'
  | 'inactive'
  | 'deceased'
  | 'transferred';

/**
 * Appointment Type
 */
export type AppointmentType =
  | 'new-patient'
  | 'follow-up'
  | 'annual'
  | 'sick-visit'
  | 'procedure'
  | 'consultation'
  | 'telehealth';

/**
 * Appointment Status (extends base AppointmentStatus)
 */
export type HealthcareAppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'no-show'
  | 'cancelled';

/**
 * Clinical Note
 */
export interface ClinicalNote {
  id: string;
  patientId: string;
  appointmentId?: string;
  providerId: string;

  // SOAP format
  type: 'soap' | 'progress' | 'discharge' | 'consultation';
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;

  // Vitals
  vitals?: VitalSigns;

  // Billing codes
  diagnosisCodes: string[]; // ICD-10 codes
  procedureCodes: string[]; // CPT codes

  // Status
  isFinalized: boolean;
  finalizedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vital Signs
 */
export interface VitalSigns {
  temperature?: number; // Fahrenheit
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number; // BPM
  respiratoryRate?: number; // Breaths per minute
  oxygenSaturation?: number; // Percentage
  weight?: number; // Pounds
  height?: number; // Inches
  bmi?: number;
  recordedAt: Date;
}

/**
 * Prescription
 */
export interface Prescription {
  id: string;
  patientId: string;
  providerId: string;

  medication: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;

  instructions: string;

  prescribedDate: Date;
  expirationDate: Date;

  pharmacyId?: string;

  status: 'active' | 'filled' | 'expired' | 'cancelled';

  createdAt: Date;
}

/**
 * Lab Order
 */
export interface LabOrder {
  id: string;
  patientId: string;
  providerId: string;

  testType: string;
  testCode: string; // LOINC code

  orderedDate: Date;
  collectedDate?: Date;
  resultDate?: Date;

  status: 'ordered' | 'collected' | 'in-progress' | 'resulted' | 'cancelled';

  results?: LabResult[];

  priority: 'routine' | 'urgent' | 'stat';

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lab Result
 */
export interface LabResult {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  notes?: string;
}

/**
 * Insurance Information
 */
export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: Date;
  expirationDate?: Date;
  isPrimary: boolean;
}

/**
 * HIPAA Audit Log Entry
 */
export interface HIPAAAuditLog {
  id: string;
  userId: string;
  action: HIPAAAction;
  patientId: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * HIPAA Auditable Actions
 */
export type HIPAAAction =
  | 'PATIENT_CREATED'
  | 'PATIENT_VIEWED'
  | 'PATIENT_UPDATED'
  | 'PATIENT_DELETED'
  | 'RECORD_ACCESSED'
  | 'RECORD_EXPORTED'
  | 'CONSENT_UPDATED'
  | 'PHI_ACCESSED';

/**
 * Healthcare Project Type Extension
 *
 * Extends the base Project with healthcare-specific fields
 */
export interface HealthcareProject {
  customFields: {
    caseType?: string;
    diagnosisCode?: string; // ICD-10
    treatmentPlan?: string;
    expectedDuration?: number; // Days
  };
}
