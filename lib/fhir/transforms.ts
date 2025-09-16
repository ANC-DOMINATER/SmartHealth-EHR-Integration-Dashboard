import type { FHIRPatient, FHIRAppointment } from "./client"
import type { Patient } from "@/components/patients/patient-management"
import type { InsuranceEligibility, PatientBalance, BillingCode } from '@/components/billing/billing-admin';
import type { ClinicalNote, VitalSigns, LabResult, Medication } from '@/components/clinical/clinical-operations';

// Transform FHIR Patient to internal Patient format
export function transformFHIRPatient(fhirPatient: FHIRPatient): Patient {
  const name = fhirPatient.name?.[0]
  const phone = fhirPatient.telecom?.find(t => t.system === "phone")?.value || ""
  const email = fhirPatient.telecom?.find(t => t.system === "email")?.value || ""
  const address = fhirPatient.address?.[0]
  const emergencyContact = fhirPatient.contact?.[0]

  return {
    id: fhirPatient.id || "",
    firstName: name?.given?.[0] || "",
    lastName: name?.family || "",
    dateOfBirth: fhirPatient.birthDate || "",
    gender: fhirPatient.gender || "unknown",
    phone,
    email,
    address: address ? [
      ...(address.line || []),
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean).join(", ") : "",
    emergencyContact: emergencyContact?.name ? 
      `${emergencyContact.name.given?.[0] || ""} ${emergencyContact.name.family || ""}`.trim() : "",
    emergencyPhone: emergencyContact?.telecom?.find(t => t.system === "phone")?.value || "",
    // FHIR doesn't directly map these fields, so we'll set defaults
    allergies: [],
    conditions: [],
    medications: [],
    lastVisit: "",
    nextAppointment: "",
    insuranceProvider: "",
    insuranceId: ""
  }
}

// Transform internal Patient to FHIR Patient format
export function transformToFHIRPatient(patient: Partial<Patient>): Partial<FHIRPatient> {
  return {
    resourceType: "Patient",
    id: patient.id,
    active: true,
    name: [{
      use: "usual",
      family: patient.lastName,
      given: patient.firstName ? [patient.firstName] : undefined
    }],
    telecom: [
      ...(patient.phone ? [{
        system: "phone" as const,
        value: patient.phone,
        use: "mobile" as const
      }] : []),
      ...(patient.email ? [{
        system: "email" as const,
        value: patient.email,
        use: "home" as const
      }] : [])
    ],
    gender: patient.gender as "male" | "female" | "other" | "unknown" | undefined,
    birthDate: patient.dateOfBirth,
    address: patient.address ? [{
      use: "home",
      line: [patient.address]
    }] : undefined,
    contact: patient.emergencyContact ? [{
      relationship: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/v2-0131",
          code: "EP",
          display: "Emergency contact person"
        }]
      }],
      name: {
        family: patient.emergencyContact.split(" ").slice(-1)[0],
        given: patient.emergencyContact.split(" ").slice(0, -1)
      },
      telecom: patient.emergencyPhone ? [{
        system: "phone",
        value: patient.emergencyPhone,
        use: "home"
      }] : undefined
    }] : undefined
  }
}

// Search parameters builder for FHIR
export function buildFHIRSearchParams(searchTerm: string, searchType: "name" | "id") {
  const params: Record<string, string> = {}
  
  switch (searchType) {
    case "name":
      // Use the correct FHIR search parameter for Patient name
      params.name = searchTerm
      break
    case "id":
      // Use the correct FHIR search parameter for Patient ID
      params._id = searchTerm
      break
  }
  
  // Add common search parameters according to FHIR spec
  params._count = "20" // Reasonable limit for UI
  params._sort = "family" // Sort by family name
  params._format = "json" // Explicit JSON format
  
  return params
}

// Format FHIR date to display format
export function formatFHIRDate(fhirDate?: string): string {
  if (!fhirDate) return ""
  
  try {
    return new Date(fhirDate).toLocaleDateString()
  } catch {
    return fhirDate
  }
}

// Extract text from FHIR CodeableConcept
export function extractCodeableConceptText(concept?: {
  coding?: Array<{
    system?: string
    code?: string
    display?: string
  }>
  text?: string
}): string {
  return concept?.text || concept?.coding?.[0]?.display || concept?.coding?.[0]?.code || ""
}

// Transform FHIR Coverage to internal InsuranceEligibility format
export function transformFHIRCoverage(fhirCoverage: any, patientName: string): InsuranceEligibility {
  const payor = fhirCoverage.payor?.[0];
  const period = fhirCoverage.period;
  
  return {
    patientId: fhirCoverage.beneficiary?.reference?.split('/')[1] || '',
    patientName,
    insuranceProvider: payor?.display || 'Unknown Provider',
    policyNumber: fhirCoverage.subscriberId || '',
    groupNumber: fhirCoverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'group')?.value || '',
    eligibilityStatus: fhirCoverage.status === 'active' ? 'active' : 'inactive',
    effectiveDate: period?.start || '',
    expirationDate: period?.end,
    copay: 25, // Default - would need extension data
    deductible: 1000, // Default - would need extension data
    deductibleMet: 0, // Default - would need extension data
    benefits: [
      { service: 'Office Visit', covered: true, copay: 25 },
      { service: 'Specialist Visit', covered: true, copay: 50 },
      { service: 'Lab Work', covered: true, coinsurance: 20 },
      { service: 'Imaging', covered: true, coinsurance: 20 }
    ],
    lastChecked: new Date().toISOString().split('T')[0]
  };
}

// Transform FHIR Account to internal PatientBalance format
export function transformFHIRAccount(fhirAccount: any, patientName: string): PatientBalance {
  const balance = fhirAccount.extension?.find((e: any) => e.url?.includes('balance'))?.valueDecimal || 0;
  
  return {
    patientId: fhirAccount.subject?.[0]?.reference?.split('/')[1] || '',
    patientName,
    totalBalance: balance,
    insuranceBalance: balance * 0.8, // Estimate
    patientBalance: balance * 0.2, // Estimate
    transactions: []
  };
}

// Transform FHIR ChargeItem to internal BillingCode format
export function transformFHIRChargeItem(fhirChargeItem: any): BillingCode {
  const code = fhirChargeItem.code?.coding?.[0];
  
  return {
    id: fhirChargeItem.id || '',
    code: code?.code || '',
    description: code?.display || '',
    category: 'General', // Would need extension data
    fee: fhirChargeItem.priceOverride?.value || 0,
    insuranceRate: fhirChargeItem.priceOverride?.value ? fhirChargeItem.priceOverride.value * 0.8 : 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    status: fhirChargeItem.status === 'billable' ? 'active' : 'inactive'
  };
}

// Transform FHIR DocumentReference to internal ClinicalNote format
export function transformFHIRDocumentReference(fhirDoc: any, patientName: string): ClinicalNote {
  const category = fhirDoc.category?.[0]?.coding?.[0];
  const content = fhirDoc.content?.[0];
  
  return {
    id: fhirDoc.id || '',
    patientId: fhirDoc.subject?.reference?.split('/')[1] || '',
    patientName,
    date: fhirDoc.date?.split('T')[0] || '',
    type: category?.display || 'Progress Note',
    providerId: fhirDoc.author?.[0]?.reference?.split('/')[1] || '',
    providerName: fhirDoc.author?.[0]?.display || 'Unknown Provider',
    chiefComplaint: fhirDoc.description || '',
    historyOfPresentIllness: '',
    physicalExam: '',
    assessment: content?.attachment?.title || '',
    plan: '',
    followUp: ''
  };
}

// Transform FHIR Observation to internal VitalSigns format
export function transformFHIRObservation(fhirObs: any, patientName: string): VitalSigns {
  const code = fhirObs.code?.coding?.[0]?.code;
  const value = fhirObs.valueQuantity?.value || 0;
  
  return {
    id: fhirObs.id || '',
    patientId: fhirObs.subject?.reference?.split('/')[1] || '',
    patientName,
    date: fhirObs.effectiveDateTime?.split('T')[0] || '',
    time: fhirObs.effectiveDateTime?.split('T')[1]?.split('.')[0] || '',
    temperature: code === '8310-5' ? value : 98.6,
    bloodPressureSystolic: code === '8480-6' ? value : 120,
    bloodPressureDiastolic: code === '8462-4' ? value : 80,
    heartRate: code === '8867-4' ? value : 72,
    respiratoryRate: code === '9279-1' ? value : 16,
    oxygenSaturation: code === '2708-6' ? value : 98,
    weight: code === '29463-7' ? value : 70,
    height: code === '8302-2' ? value : 170,
    bmi: 0, // Would calculate from height/weight
    notes: fhirObs.note?.[0]?.text || ''
  };
}

// Transform FHIR MedicationRequest to internal Medication format
export function transformFHIRMedicationRequest(fhirMedReq: any, patientName: string): Medication {
  const medication = fhirMedReq.medicationCodeableConcept?.coding?.[0];
  const dosage = fhirMedReq.dosageInstruction?.[0];
  
  return {
    id: fhirMedReq.id || '',
    patientId: fhirMedReq.subject?.reference?.split('/')[1] || '',
    patientName,
    medicationName: medication?.display || '',
    dosage: dosage?.text || '',
    frequency: dosage?.timing?.repeat?.frequency?.toString() || '',
    route: dosage?.route?.coding?.[0]?.display || '',
    startDate: fhirMedReq.authoredOn?.split('T')[0] || '',
    endDate: '',
    prescribedBy: fhirMedReq.requester?.display || 'Unknown Provider',
    indication: fhirMedReq.reasonCode?.[0]?.text || '',
    status: fhirMedReq.status || 'active',
    notes: fhirMedReq.note?.[0]?.text || ''
  };
}