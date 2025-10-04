/**
 * Healthcare Industry Configuration
 *
 * Defines the healthcare industry's capabilities, features, and extensions
 */

import type { IndustryConfig } from '../_core/industry-config';

export const healthcareConfig: IndustryConfig = {
  // Identification
  id: 'healthcare',
  name: 'Healthcare',
  description: 'HIPAA-compliant patient and practice management',
  icon: 'Heart', // Lucide icon name
  color: '#10B981', // Emerald green

  // Module Extensions - which core modules does healthcare use?
  extends: ['crm', 'projects', 'ai', 'tasks'],

  // Features - healthcare-specific capabilities (will be implemented later)
  features: [
    {
      id: 'patient-management',
      name: 'Patient Management',
      description: 'Comprehensive patient record system with HIPAA compliance',
      componentPath: '@/lib/industries/healthcare/features/patient-management',
      requiredTier: 'PRO',
    },
    {
      id: 'hipaa-compliance',
      name: 'HIPAA Compliance',
      description: 'Automated compliance monitoring and audit trails',
      componentPath: '@/lib/industries/healthcare/features/compliance',
      requiredTier: 'ENTERPRISE',
    },
    {
      id: 'appointment-scheduling',
      name: 'Appointment Scheduling',
      description: 'Patient appointment scheduling with automated reminders',
      componentPath: '@/lib/industries/healthcare/features/scheduling',
      requiredTier: 'BASIC',
    },
  ],

  // Tools - healthcare marketplace add-ons (will be implemented later)
  tools: [
    {
      id: 'patient-portal',
      name: 'Patient Portal',
      description: 'Self-service portal for patients',
      category: 'engagement',
      pricing: 'paid',
      basePrice: 9900, // $99/month (PLACEHOLDER - TBD)
      requiredTier: 'PRO',
    },
    {
      id: 'prescription-tracker',
      name: 'Prescription Tracker',
      description: 'Medication management and prescription tracking',
      category: 'clinical',
      pricing: 'enterprise',
      requiredTier: 'ENTERPRISE',
    },
    {
      id: 'telehealth-platform',
      name: 'Telehealth Platform',
      description: 'Virtual consultation and telemedicine',
      category: 'clinical',
      pricing: 'paid',
      basePrice: 14900, // $149/month (PLACEHOLDER - TBD)
      requiredTier: 'ENTERPRISE',
    },
  ],

  // CRM Field Extensions - custom fields for healthcare CRM
  crmFields: {
    customer: [
      {
        fieldName: 'patientId',
        type: 'string',
        label: 'Patient ID',
        required: true,
      },
      {
        fieldName: 'dateOfBirth',
        type: 'date',
        label: 'Date of Birth',
        required: true,
      },
      {
        fieldName: 'insuranceProvider',
        type: 'string',
        label: 'Insurance Provider',
        required: false,
      },
      {
        fieldName: 'primaryPhysician',
        type: 'string',
        label: 'Primary Physician',
        required: false,
      },
      {
        fieldName: 'hipaaConsentDate',
        type: 'date',
        label: 'HIPAA Consent Date',
        required: true,
      },
    ],
  },

  // Project Field Extensions - healthcare-specific project fields
  projectFields: [
    {
      fieldName: 'caseType',
      type: 'string',
      label: 'Case Type',
      required: false,
    },
    {
      fieldName: 'diagnosisCode',
      type: 'string',
      label: 'Diagnosis Code (ICD-10)',
      required: false,
    },
  ],

  // Routes - healthcare-specific pages
  routes: [
    {
      path: '/industries/healthcare/dashboard',
      name: 'Healthcare Dashboard',
      description: 'Overview of patient metrics and practice performance',
      componentPath: '@/lib/industries/healthcare/features/dashboard',
    },
    {
      path: '/industries/healthcare/patients',
      name: 'Patient Management',
      description: 'Manage patient records and information',
      componentPath: '@/lib/industries/healthcare/features/patient-management',
    },
    {
      path: '/industries/healthcare/appointments',
      name: 'Appointments',
      description: 'Schedule and manage patient appointments',
      componentPath: '@/lib/industries/healthcare/features/scheduling',
    },
    {
      path: '/industries/healthcare/compliance',
      name: 'HIPAA Compliance',
      description: 'Compliance monitoring and audit logs',
      componentPath: '@/lib/industries/healthcare/features/compliance',
    },
  ],

  // Status
  status: 'beta',
  releasedAt: new Date('2025-01-01'),
  version: '1.0.0-beta',

  // Settings Schema - industry-specific configuration
  settingsSchema: {
    type: 'object',
    properties: {
      enableHIPAALogs: {
        type: 'boolean',
        default: true,
        description: 'Enable HIPAA audit logging',
      },
      defaultAppointmentDuration: {
        type: 'number',
        default: 30,
        description: 'Default appointment duration in minutes',
      },
      requirePatientConsent: {
        type: 'boolean',
        default: true,
        description: 'Require HIPAA consent before patient interactions',
      },
    },
  },
};

export default healthcareConfig;
