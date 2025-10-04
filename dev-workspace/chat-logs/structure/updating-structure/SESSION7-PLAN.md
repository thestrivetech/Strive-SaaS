# Session 7: Healthcare Industry Implementation - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~4-5 hours
**Dependencies:** Session 1 ✅, Session 2 ✅
**Parallel Safe:** Yes (can run alongside SESSION3, SESSION8)

---

## 🎯 Session Objectives

Implement the complete healthcare industry plugin, including UI components, business logic, and HIPAA compliance features. This mirrors the real estate implementation pattern but adds healthcare-specific functionality.

**What Exists:**
- ✅ `lib/industries/healthcare/config.ts` - Industry configuration
- ✅ `lib/industries/healthcare/types.ts` - Type definitions
- ✅ Prisma schema with Industry support

**What's Missing:**
- ❌ `components/(platform)/healthcare/` - Healthcare UI components
- ❌ `lib/industries/healthcare/overrides/` - Business logic (CRM, tasks, projects)
- ❌ `lib/industries/healthcare/features/` - HIPAA compliance, patient management
- ❌ Tests for all healthcare functionality

---

## 📋 Task Breakdown

### Phase 1: Healthcare CRM Components (1 hour)

**Directory:** `components/(platform)/healthcare/crm/`

Create 7 components matching the real estate pattern:

#### File 1: `create-patient-dialog.tsx`
- [ ] Dialog form for creating new patients
- [ ] Fields: name, email, phone, dateOfBirth, insuranceProvider
- [ ] Medical record number (MRN) auto-generation
- [ ] HIPAA consent checkbox (required)
- [ ] Primary physician dropdown
- [ ] Insurance information section
- [ ] Calls `createHealthcarePatient()` action
- [ ] Client Component with form validation

#### File 2: `edit-patient-dialog.tsx`
- [ ] Edit existing patient information
- [ ] Pre-populate form with patient data
- [ ] Cannot edit MRN (read-only)
- [ ] Track changes for audit log
- [ ] Calls `updateHealthcarePatient()` action

#### File 3: `delete-patient-dialog.tsx`
- [ ] Confirmation dialog with HIPAA warning
- [ ] Shows patient name and MRN
- [ ] Explains data retention policy
- [ ] Soft delete (HIPAA requirement)
- [ ] Calls `deleteHealthcarePatient()` action

#### File 4: `patient-actions-menu.tsx`
- [ ] Dropdown menu with actions
- [ ] View patient chart
- [ ] Schedule appointment
- [ ] Add clinical note
- [ ] View medical history
- [ ] Edit patient
- [ ] Delete patient (admin only)

#### File 5: `patient-filters.tsx`
- [ ] Filter by patient status (active, inactive, archived)
- [ ] Filter by insurance provider
- [ ] Filter by primary physician
- [ ] Filter by appointment date range
- [ ] Search by MRN, name, email, phone

#### File 6: `patient-list-skeleton.tsx`
- [ ] Loading skeleton for patient list
- [ ] Mimics patient card layout
- [ ] Shimmer effect

#### File 7: `patient-search.tsx`
- [ ] Search component with autocomplete
- [ ] Search by name, MRN, email, phone
- [ ] Recent patients dropdown
- [ ] Keyboard navigation

**Success Criteria:**
- All components client-side ("use client")
- Match real estate component patterns
- HIPAA-compliant UI (no PHI in URLs)
- Form validation with React Hook Form + Zod
- Accessibility standards met

---

### Phase 2: Healthcare Tasks Components (45 minutes)

**Directory:** `components/(platform)/healthcare/tasks/`

Create 7 components for healthcare task management:

#### Files (following real estate pattern):
1. `create-appointment-task-dialog.tsx` - Schedule appointments
2. `edit-appointment-task-dialog.tsx` - Modify appointments
3. `task-attachments.tsx` - Medical documents, lab results
4. `appointment-card.tsx` - Calendar card for appointments
5. `appointment-filters.tsx` - Filter by type, physician, status
6. `appointment-list-skeleton.tsx` - Loading state
7. `appointment-list.tsx` - Full appointment list view

**Healthcare-Specific Features:**
- Appointment types: checkup, follow-up, consultation, procedure
- Duration tracking (15min, 30min, 60min)
- Recurring appointments
- Patient reminders
- Physician assignment

---

### Phase 3: Healthcare Dashboard Component (30 minutes)

**Directory:** `components/(platform)/healthcare/dashboard/`

#### File 1: `healthcare-metrics.tsx`
- [ ] Today's appointments count
- [ ] Active patients count
- [ ] HIPAA compliance status badge
- [ ] Pending lab results count
- [ ] Prescription refills needed
- [ ] Server Component with data fetching

#### File 2: `appointments-calendar.tsx`
- [ ] Calendar view of appointments
- [ ] Day, week, month views
- [ ] Color-coded by appointment type
- [ ] Click to view/edit
- [ ] Client Component (interactive)

#### File 3: `patient-stats-widget.tsx`
- [ ] Patient demographics chart
- [ ] Insurance breakdown pie chart
- [ ] Active treatment plans
- [ ] Recent vitals trends

---

### Phase 4: Healthcare Business Logic - CRM (1 hour)

**Directory:** `lib/industries/healthcare/overrides/crm/`

#### File 1: `schemas.ts`
- [ ] `HealthcarePatientSchema` extending Customer
- [ ] Fields: patientId (MRN), dateOfBirth, insuranceProvider, primaryPhysician
- [ ] HIPAA consent fields: consentDate, consentGiven
- [ ] Emergency contact information
- [ ] Medical alerts (allergies, conditions)
- [ ] `CreateHealthcarePatientSchema`
- [ ] `UpdateHealthcarePatientSchema`
- [ ] `HealthcarePatientFiltersSchema`

#### File 2: `queries.ts`
- [ ] `getHealthcarePatients()` - list with HIPAA filtering
- [ ] `getHealthcarePatientById()` - single patient record
- [ ] `getHealthcarePatientStats()` - metrics for dashboard
- [ ] `searchHealthcarePatients()` - PHI-safe search
- [ ] All queries must log access for HIPAA audit

#### File 3: `actions.ts`
- [ ] `createHealthcarePatient()` - with MRN generation
- [ ] `updateHealthcarePatient()` - with audit logging
- [ ] `deleteHealthcarePatient()` - soft delete only
- [ ] `recordHIPAAAccess()` - audit log entry
- [ ] All actions create audit trail

#### File 4: `index.ts` - Export all

---

### Phase 5: Healthcare Business Logic - Tasks (1 hour)

**Directory:** `lib/industries/healthcare/overrides/tasks/`

#### File 1: `schemas.ts`
- [ ] `HealthcareAppointmentSchema` extending Task
- [ ] Fields: patientId, physicianId, appointmentType, duration
- [ ] Medical notes field
- [ ] Vital signs tracking
- [ ] Follow-up required flag
- [ ] `CreateHealthcareAppointmentSchema`
- [ ] `UpdateHealthcareAppointmentSchema`

#### File 2: `queries.ts`
- [ ] `getHealthcareAppointments()` - list with filters
- [ ] `getAppointmentById()` - single appointment
- [ ] `getUpcomingAppointments()` - calendar view
- [ ] `getPatientAppointments()` - patient history
- [ ] `getPhysicianSchedule()` - availability

#### File 3: `actions.ts`
- [ ] `createHealthcareAppointment()` - with conflict checking
- [ ] `updateHealthcareAppointment()` - reschedule logic
- [ ] `cancelAppointment()` - with cancellation reason
- [ ] `recordAppointmentNotes()` - clinical notes
- [ ] `recordVitalSigns()` - attach to appointment

#### File 4: `index.ts` - Export all

---

### Phase 6: HIPAA Compliance Features (1 hour)

**Directory:** `lib/industries/healthcare/features/compliance/`

#### File 1: `hipaa-audit-log.ts`
- [ ] Create `logHIPAAAccess()` function
  - Record who accessed what patient data
  - Timestamp and action type
  - IP address and device info
  - Store in database (HIPAAAuditLog table or existing ActivityLog)
- [ ] Create `getHIPAAAuditLog()` function
  - Query audit logs
  - Filter by patient, user, date range
  - Admin only access
- [ ] Create `exportHIPAAAuditLog()` function
  - Generate CSV for compliance reporting
  - Date range filtering

#### File 2: `hipaa-consent.ts`
- [ ] `recordPatientConsent()` function
  - Store consent date and version
  - Digital signature or checkbox confirmation
- [ ] `verifyPatientConsent()` function
  - Check if consent is current
  - Return expiration status
- [ ] `revokePatientConsent()` function
  - Handle consent withdrawal

#### File 3: `data-retention.ts`
- [ ] `archivePatientData()` function
  - Move to archive storage
  - Maintain for 7 years (HIPAA requirement)
- [ ] `purgeExpiredData()` function
  - Delete data past retention period
  - Cron job compatible

#### File 4: `index.ts` - Export all compliance functions

---

### Phase 7: Patient Management Features (30 minutes)

**Directory:** `lib/industries/healthcare/features/patient-management/`

#### File 1: `medical-records.ts`
- [ ] `createClinicalNote()` - Add note to patient chart
- [ ] `getClinicalNotes()` - Fetch patient notes
- [ ] `createPrescription()` - Record prescription
- [ ] `createLabOrder()` - Order lab tests
- [ ] `recordLabResults()` - Store lab results

#### File 2: `vital-signs.ts`
- [ ] `recordVitals()` - Store vital signs (BP, temp, weight, etc.)
- [ ] `getVitalsHistory()` - Trend data
- [ ] `flagAbnormalVitals()` - Alert for out-of-range values

#### File 3: `index.ts` - Export all

---

### Phase 8: Testing (1 hour)

#### Healthcare CRM Tests
- `__tests__/lib/industries/healthcare/overrides/crm/actions.test.ts`
- `__tests__/lib/industries/healthcare/overrides/crm/queries.test.ts`

#### Healthcare Tasks Tests
- `__tests__/lib/industries/healthcare/overrides/tasks/actions.test.ts`
- `__tests__/lib/industries/healthcare/overrides/tasks/queries.test.ts`

#### HIPAA Compliance Tests
- `__tests__/lib/industries/healthcare/features/compliance/hipaa-audit-log.test.ts`
- `__tests__/lib/industries/healthcare/features/compliance/hipaa-consent.test.ts`

#### Component Tests
- `__tests__/components/healthcare/create-patient-dialog.test.tsx`
- `__tests__/components/healthcare/patient-filters.test.tsx`

**Coverage Target:** 80%+

---

## 📊 Files to Create

### Components (21 files)
```
components/(platform)/healthcare/
├── crm/                              (7 files)
│   ├── create-patient-dialog.tsx
│   ├── edit-patient-dialog.tsx
│   ├── delete-patient-dialog.tsx
│   ├── patient-actions-menu.tsx
│   ├── patient-filters.tsx
│   ├── patient-list-skeleton.tsx
│   └── patient-search.tsx
├── tasks/                            (7 files)
│   ├── create-appointment-task-dialog.tsx
│   ├── edit-appointment-task-dialog.tsx
│   ├── task-attachments.tsx
│   ├── appointment-card.tsx
│   ├── appointment-filters.tsx
│   ├── appointment-list-skeleton.tsx
│   └── appointment-list.tsx
└── dashboard/                        (3 files)
    ├── healthcare-metrics.tsx
    ├── appointments-calendar.tsx
    └── patient-stats-widget.tsx
```

### Business Logic (16 files)
```
lib/industries/healthcare/
├── overrides/
│   ├── crm/                          (4 files)
│   │   ├── schemas.ts
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── index.ts
│   └── tasks/                        (4 files)
│       ├── schemas.ts
│       ├── queries.ts
│       ├── actions.ts
│       └── index.ts
└── features/
    ├── compliance/                   (4 files)
    │   ├── hipaa-audit-log.ts
    │   ├── hipaa-consent.ts
    │   ├── data-retention.ts
    │   └── index.ts
    └── patient-management/           (3 files)
        ├── medical-records.ts
        ├── vital-signs.ts
        └── index.ts
```

### Tests (8 files)
```
__tests__/
├── lib/industries/healthcare/overrides/
│   ├── crm/
│   │   ├── actions.test.ts
│   │   └── queries.test.ts
│   └── tasks/
│       ├── actions.test.ts
│       └── queries.test.ts
├── lib/industries/healthcare/features/
│   └── compliance/
│       ├── hipaa-audit-log.test.ts
│       └── hipaa-consent.test.ts
└── components/healthcare/
    ├── create-patient-dialog.test.tsx
    └── patient-filters.test.tsx
```

**Total:** 45 files (37 new + 8 tests)

---

## 🎯 Success Criteria

- [ ] All healthcare components created
- [ ] All business logic implemented
- [ ] HIPAA compliance features functional
- [ ] Audit logging works for all PHI access
- [ ] Soft delete only (no hard deletes)
- [ ] MRN generation implemented
- [ ] Patient consent tracking works
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines
- [ ] HIPAA requirements documented

---

## 📝 HIPAA Compliance Requirements

### Must-Have Features
1. **Audit Logging:** Every access to patient data logged
2. **Soft Deletes:** Never permanently delete patient data
3. **Consent Tracking:** Record and verify patient consent
4. **Data Encryption:** Use Supabase encryption at rest
5. **Access Control:** Role-based access to patient data
6. **Data Retention:** 7-year minimum retention
7. **Breach Notification:** Alert system for unauthorized access

### Implementation Notes
```typescript
// Always log PHI access
async function getHealthcarePatientById(patientId: string, userId: string) {
  // Log access
  await logHIPAAAccess({
    userId,
    patientId,
    action: 'READ',
    timestamp: new Date(),
  });

  // Fetch data
  const patient = await prisma.customer.findUnique({ where: { id: patientId } });
  return patient;
}

// Soft delete only
async function deleteHealthcarePatient(patientId: string) {
  return await prisma.customer.update({
    where: { id: patientId },
    data: {
      deletedAt: new Date(),
      status: 'ARCHIVED',
    },
  });
}
```

---

## 🔄 Dependencies

**Requires:**
- ✅ Session 1: Healthcare industry foundation
- ✅ Session 2: Shared UI components

**Parallel Safe:** Yes (independent of SESSION3, SESSION4, SESSION5)

**Enables:**
- Healthcare industry fully functional
- Can be enabled by organizations
- HIPAA-compliant patient management

---

## 📖 Reference Files

**Read before starting:**
- `components/(platform)/real-estate/` - Component patterns to mirror
- `lib/industries/real-estate/overrides/` - Business logic patterns
- `lib/industries/healthcare/types.ts` - Type definitions
- `lib/industries/healthcare/config.ts` - Industry configuration

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
