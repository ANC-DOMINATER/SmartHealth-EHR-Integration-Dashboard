import { fhirClient, type FHIRBundle, type FHIRPatient } from "../fhir/client"
import { transformFHIRPatient, transformToFHIRPatient, buildFHIRSearchParams } from "../fhir/transforms"
import { mockCRUD, shouldUseMockCRUD, getCRUDErrorMessage } from "./mock-crud"
import type { Patient } from "@/components/patients/patient-management"

export const patientsApi = {
  // Search patients by name or ID using FHIR
  search: async (searchTerm: string, searchType: "name" | "id") => {
    try {
      let searchParams: Record<string, string> = {
        _format: 'json'
      }
      
      if (searchType === 'name') {
        searchParams.name = searchTerm
      } else if (searchType === 'id') {
        searchParams._id = searchTerm
      }
      
      const bundle: FHIRBundle = await fhirClient.search('Patient', searchParams)
      
      const patients = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Patient")
        .map(entry => transformFHIRPatient(entry.resource as FHIRPatient))
        || []

      return {
        data: patients,
        total: bundle.total || 0,
        success: true
      }
    } catch (error) {
      console.error("FHIR search error:", error)
      return {
        data: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : "Search failed"
      }
    }
  },

  // Get patient by ID using FHIR
  getById: async (patientId: string) => {
    try {
      const fhirPatient: FHIRPatient = await fhirClient.read('Patient', patientId)
      const patient = transformFHIRPatient(fhirPatient)
      
      return {
        data: patient,
        success: true
      }
    } catch (error) {
      console.error("FHIR get patient error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to get patient")
    }
  },

  // Create new patient using FHIR or Mock CRUD
  create: async (patientData: Omit<Patient, "id">) => {
    try {
      if (shouldUseMockCRUD('create')) {
        // Use mock CRUD for demonstration since HAPI test server is read-only
        const result = mockCRUD.patients.create(patientData)
        console.log("✅ Mock CRUD: Patient created successfully")
        return {
          data: result.data,
          success: true,
          message: getCRUDErrorMessage('create', 'patient')
        }
      }
      
      // Fallback to FHIR (would work with a writable FHIR server)
      const fhirPatient = transformToFHIRPatient(patientData)
      const createdPatient: FHIRPatient = await fhirClient.create('Patient', fhirPatient)
      const patient = transformFHIRPatient(createdPatient)
      
      return {
        data: patient,
        success: true
      }
    } catch (error) {
      console.error("Patient create error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to create patient")
    }
  },

  // Update patient using FHIR or Mock CRUD
  update: async (patientId: string, patientData: Partial<Patient>) => {
    try {
      if (shouldUseMockCRUD('update')) {
        // Use mock CRUD for demonstration since HAPI test server is read-only
        const result = mockCRUD.patients.update(patientId, patientData)
        console.log("✅ Mock CRUD: Patient updated successfully")
        return {
          data: result.data,
          success: true,
          message: getCRUDErrorMessage('update', 'patient')
        }
      }
      
      // Fallback to FHIR (would work with a writable FHIR server)
      // First get the existing patient to preserve FHIR-specific fields
      const existingPatient: FHIRPatient = await fhirClient.read('Patient', patientId)
      
      // Transform updates to FHIR format
      const fhirUpdates = transformToFHIRPatient({ id: patientId, ...patientData })
      
      // Merge with existing patient data
      const updatedFHIRPatient = {
        ...existingPatient,
        ...fhirUpdates,
        id: patientId
      }
      
      const result: FHIRPatient = await fhirClient.update('Patient', patientId, updatedFHIRPatient)
      const patient = transformFHIRPatient(result)
      
      return {
        data: patient,
        success: true
      }
    } catch (error) {
      console.error("Patient update error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to update patient")
    }
  },

  // Delete patient using FHIR or Mock CRUD
  delete: async (patientId: string) => {
    try {
      if (shouldUseMockCRUD('delete')) {
        // Use mock CRUD for demonstration since HAPI test server is read-only
        const result = mockCRUD.patients.delete(patientId)
        console.log("✅ Mock CRUD: Patient deleted successfully")
        return {
          success: true,
          message: getCRUDErrorMessage('delete', 'patient')
        }
      }
      
      // Fallback to FHIR (would work with a writable FHIR server)
      await fhirClient.delete(`/Patient/${patientId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error("Patient delete error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to delete patient")
    }
  },

  // Get all patients with pagination using FHIR
  getAll: async (page = 1, limit = 20) => {
    try {
      const searchParams: Record<string, string> = {
        _format: 'json'
      }
      
      console.log("🔍 FHIR: Getting all patients with params:", searchParams)
      const bundle: FHIRBundle = await fhirClient.search('Patient', searchParams)
      
      const patients = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Patient")
        .map(entry => transformFHIRPatient(entry.resource as FHIRPatient))
        || []

      console.log("✅ FHIR: Transformed patients:", patients.length)

      return {
        data: patients,
        total: bundle.total || patients.length, // Use patients.length as fallback if total is not provided
        page,
        limit,
        success: true
      }
    } catch (error) {
      console.error("❌ FHIR get all patients error:", error)
      return {
        data: [],
        total: 0,
        page,
        limit,
        success: false,
        error: error instanceof Error ? error.message : "Failed to get patients"
      }
    }
  },
}
