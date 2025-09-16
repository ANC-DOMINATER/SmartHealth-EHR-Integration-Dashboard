import { fhirClient } from "../fhir/client"
import { transformFHIRDocumentReference, transformFHIRObservation, transformFHIRMedicationRequest } from "../fhir/transforms"
import type { ClinicalNote, VitalSigns, LabResult, Medication } from "@/components/clinical/clinical-operations"

export const clinicalApi = {
  // Clinical Notes
  notes: {
    getByPatient: async (patientId: string): Promise<ClinicalNote[]> => {
      try {
        const docBundle = await fhirClient.search('DocumentReference', {
          patient: patientId,
          status: 'current',
          _include: 'DocumentReference:patient'
        })
        
        if (!docBundle.entry || docBundle.entry.length === 0) {
          return []
        }

        // Get patient name from included resources
        const patientResource = docBundle.entry.find(
          (entry: any) => entry.resource?.resourceType === 'Patient'
        )?.resource as any
        
        const patientName = patientResource ? 
          `${patientResource.name?.[0]?.given?.[0] || ''} ${patientResource.name?.[0]?.family || ''}`.trim() :
          'Unknown Patient'

        return docBundle.entry
          .filter((entry: any) => entry.resource?.resourceType === 'DocumentReference')
          .map((entry: any) => transformFHIRDocumentReference(entry.resource, patientName))
      } catch (error) {
        console.error('Error fetching clinical notes:', error)
        return []
      }
    },
    create: async (noteData: Omit<ClinicalNote, "id">): Promise<ClinicalNote> => {
      const fhirDoc = {
        resourceType: 'DocumentReference',
        status: 'current',
        docStatus: 'final',
        type: {
          coding: [{
            system: 'http://loinc.org',
            code: '18842-5',
            display: noteData.type
          }]
        },
        category: [{
          coding: [{
            system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
            code: 'clinical-note',
            display: 'Clinical Note'
          }]
        }],
        subject: { reference: `Patient/${noteData.patientId}` },
        date: `${noteData.date}T00:00:00Z`,
        author: [{ reference: `Practitioner/${noteData.providerId}` }],
        description: noteData.chiefComplaint,
        content: [{
          attachment: {
            contentType: 'text/plain',
            title: noteData.assessment,
            data: Buffer.from(JSON.stringify({
              chiefComplaint: noteData.chiefComplaint,
              historyOfPresentIllness: noteData.historyOfPresentIllness,
              physicalExam: noteData.physicalExam,
              assessment: noteData.assessment,
              plan: noteData.plan,
              followUp: noteData.followUp
            })).toString('base64')
          }
        }]
      }
      
      const created = await fhirClient.create('DocumentReference', fhirDoc)
      return transformFHIRDocumentReference(created, noteData.patientName)
    },
    update: async (noteId: string, noteData: Partial<ClinicalNote>): Promise<ClinicalNote> => {
      const updated = await fhirClient.update('DocumentReference', noteId, noteData)
      return transformFHIRDocumentReference(updated, noteData.patientName || 'Unknown Patient')
    },
    delete: async (noteId: string): Promise<void> => {
      await fhirClient.delete(`/DocumentReference/${noteId}`)
    },
  },

  // Vital Signs
  vitals: {
    getByPatient: async (patientId: string): Promise<VitalSigns[]> => {
      try {
        const obsBundle = await fhirClient.search('Observation', {
          patient: patientId,
          category: 'vital-signs',
          status: 'final',
          _include: 'Observation:patient'
        })
        
        if (!obsBundle.entry || obsBundle.entry.length === 0) {
          return []
        }

        // Get patient name from included resources
        const patientResource = obsBundle.entry.find(
          (entry: any) => entry.resource?.resourceType === 'Patient'
        )?.resource as any
        
        const patientName = patientResource ? 
          `${patientResource.name?.[0]?.given?.[0] || ''} ${patientResource.name?.[0]?.family || ''}`.trim() :
          'Unknown Patient'

        return obsBundle.entry
          .filter((entry: any) => entry.resource?.resourceType === 'Observation')
          .map((entry: any) => transformFHIRObservation(entry.resource, patientName))
      } catch (error) {
        console.error('Error fetching vital signs:', error)
        return []
      }
    },
    create: async (vitalData: Omit<VitalSigns, "id">): Promise<VitalSigns> => {
      // Create multiple Observation resources for different vital signs
      const vitals = [
        { code: '8310-5', display: 'Body temperature', value: vitalData.temperature, unit: 'Cel' },
        { code: '8480-6', display: 'Systolic blood pressure', value: vitalData.bloodPressureSystolic, unit: 'mm[Hg]' },
        { code: '8462-4', display: 'Diastolic blood pressure', value: vitalData.bloodPressureDiastolic, unit: 'mm[Hg]' },
        { code: '8867-4', display: 'Heart rate', value: vitalData.heartRate, unit: '/min' },
        { code: '9279-1', display: 'Respiratory rate', value: vitalData.respiratoryRate, unit: '/min' },
        { code: '2708-6', display: 'Oxygen saturation', value: vitalData.oxygenSaturation, unit: '%' }
      ]

      const observations = await Promise.all(vitals.map(vital => {
        const fhirObs = {
          resourceType: 'Observation',
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: vital.code,
              display: vital.display
            }]
          },
          subject: { reference: `Patient/${vitalData.patientId}` },
          effectiveDateTime: `${vitalData.date}T${vitalData.time}:00Z`,
          valueQuantity: {
            value: vital.value,
            unit: vital.unit,
            system: 'http://unitsofmeasure.org'
          }
        }
        
        return fhirClient.create('Observation', fhirObs)
      }))

      // Return transformed data from first observation
      return transformFHIRObservation(observations[0], vitalData.patientName)
    },
    update: async (vitalId: string, vitalData: Partial<VitalSigns>): Promise<VitalSigns> => {
      const updated = await fhirClient.update('Observation', vitalId, vitalData)
      return transformFHIRObservation(updated, vitalData.patientName || 'Unknown Patient')
    },
    delete: async (vitalId: string): Promise<void> => {
      await fhirClient.delete(`/Observation/${vitalId}`)
    },
  },

  // Lab Results
  labs: {
    getByPatient: async (patientId: string): Promise<LabResult[]> => {
      try {
        const obsBundle = await fhirClient.search('Observation', {
          patient: patientId,
          category: 'laboratory',
          status: 'final',
          _include: 'Observation:patient'
        })
        
        if (!obsBundle.entry || obsBundle.entry.length === 0) {
          return []
        }

        // Transform lab observations to LabResult format
        // This would need more complex transformation logic
        return []
      } catch (error) {
        console.error('Error fetching lab results:', error)
        return []
      }
    },
    create: async (labData: Omit<LabResult, "id">): Promise<LabResult> => {
      // Create lab result as Observation
      const fhirObs = {
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '33747-0',
            display: labData.testName
          }]
        },
        subject: { reference: `Patient/${labData.patientId}` },
        effectiveDateTime: `${labData.orderDate}T00:00:00Z`,
        component: labData.results.map(result => ({
          code: { text: result.name },
          valueString: `${result.value} ${result.unit}`,
          referenceRange: [{
            text: result.referenceRange
          }]
        }))
      }
      
      const created = await fhirClient.create('Observation', fhirObs)
      return labData as LabResult // Return original data for now
    },
    update: async (labId: string, labData: Partial<LabResult>): Promise<LabResult> => {
      const updated = await fhirClient.update('Observation', labId, labData)
      return labData as LabResult
    },
    updateStatus: async (labId: string, status: "pending" | "completed" | "reviewed"): Promise<void> => {
      await fhirClient.update('Observation', labId, { status })
    },
  },

  // Medications
  medications: {
    getByPatient: async (patientId: string): Promise<Medication[]> => {
      try {
        const medBundle = await fhirClient.search('MedicationRequest', {
          patient: patientId,
          status: 'active',
          _include: 'MedicationRequest:patient'
        })
        
        if (!medBundle.entry || medBundle.entry.length === 0) {
          return []
        }

        // Get patient name from included resources
        const patientResource = medBundle.entry.find(
          (entry: any) => entry.resource?.resourceType === 'Patient'
        )?.resource as any
        
        const patientName = patientResource ? 
          `${patientResource.name?.[0]?.given?.[0] || ''} ${patientResource.name?.[0]?.family || ''}`.trim() :
          'Unknown Patient'

        return medBundle.entry
          .filter((entry: any) => entry.resource?.resourceType === 'MedicationRequest')
          .map((entry: any) => transformFHIRMedicationRequest(entry.resource, patientName))
      } catch (error) {
        console.error('Error fetching medications:', error)
        return []
      }
    },
    create: async (medicationData: Omit<Medication, "id">): Promise<Medication> => {
      const fhirMedReq = {
        resourceType: 'MedicationRequest',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            display: medicationData.medicationName
          }]
        },
        subject: { reference: `Patient/${medicationData.patientId}` },
        authoredOn: `${medicationData.startDate}T00:00:00Z`,
        requester: { reference: `Practitioner/${medicationData.prescribedBy}` },
        dosageInstruction: [{
          text: medicationData.dosage,
          route: {
            coding: [{
              display: medicationData.route
            }]
          },
          timing: {
            repeat: {
              frequency: parseInt(medicationData.frequency) || 1
            }
          }
        }],
        reasonCode: [{
          text: medicationData.indication
        }]
      }
      
      const created = await fhirClient.create('MedicationRequest', fhirMedReq)
      return transformFHIRMedicationRequest(created, medicationData.patientName)
    },
    update: async (medicationId: string, medicationData: Partial<Medication>): Promise<Medication> => {
      const updated = await fhirClient.update('MedicationRequest', medicationId, medicationData)
      return transformFHIRMedicationRequest(updated, medicationData.patientName || 'Unknown Patient')
    },
    discontinue: async (medicationId: string): Promise<void> => {
      await fhirClient.update('MedicationRequest', medicationId, { status: 'stopped' })
    },
  },
}
