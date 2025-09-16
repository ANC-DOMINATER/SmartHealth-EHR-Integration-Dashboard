import { fhirClient, type FHIRBundle, type FHIRPatient } from "../fhir/client"
import { transformFHIRPatient, transformToFHIRPatient, buildFHIRSearchParams } from "../fhir/transforms"
import type { Patient } from "@/components/patients/patient-management"

export const patientsApi = {
  // Search patients by name or ID using FHIR
  search: async (searchTerm: string, searchType: "name" | "id") => {
    try {
      const searchParams = buildFHIRSearchParams(searchTerm, searchType)
      const bundle: FHIRBundle = await fhirClient.get("/Patient", searchParams)
      
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
      const fhirPatient: FHIRPatient = await fhirClient.get(`/Patient/${patientId}`)
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

  // Create new patient using FHIR
  create: async (patientData: Omit<Patient, "id">) => {
    try {
      const fhirPatient = transformToFHIRPatient(patientData)
      const createdPatient: FHIRPatient = await fhirClient.post("/Patient", fhirPatient)
      const patient = transformFHIRPatient(createdPatient)
      
      return {
        data: patient,
        success: true
      }
    } catch (error) {
      console.error("FHIR create patient error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to create patient")
    }
  },

  // Update patient using FHIR
  update: async (patientId: string, patientData: Partial<Patient>) => {
    try {
      // First get the existing patient to preserve FHIR-specific fields
      const existingPatient: FHIRPatient = await fhirClient.get(`/Patient/${patientId}`)
      
      // Transform updates to FHIR format
      const fhirUpdates = transformToFHIRPatient({ id: patientId, ...patientData })
      
      // Merge with existing patient data
      const updatedFHIRPatient = {
        ...existingPatient,
        ...fhirUpdates,
        id: patientId
      }
      
      const result: FHIRPatient = await fhirClient.put(`/Patient/${patientId}`, updatedFHIRPatient)
      const patient = transformFHIRPatient(result)
      
      return {
        data: patient,
        success: true
      }
    } catch (error) {
      console.error("FHIR update patient error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to update patient")
    }
  },

  // Delete patient using FHIR
  delete: async (patientId: string) => {
    try {
      await fhirClient.delete(`/Patient/${patientId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error("FHIR delete patient error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to delete patient")
    }
  },

  // Get all patients with pagination using FHIR
  getAll: async (page = 1, limit = 20) => {
    try {
      const searchParams: Record<string, string> = {
        _count: limit.toString(),
        _sort: "family",
        _format: "json"
      }
      
      // Add pagination if not first page
      if (page > 1) {
        searchParams._getpagesoffset = ((page - 1) * limit).toString()
      }
      
      console.log("🔍 FHIR: Getting all patients with params:", searchParams)
      const bundle: FHIRBundle = await fhirClient.get("/Patient", searchParams)
      
      const patients = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Patient")
        .map(entry => transformFHIRPatient(entry.resource as FHIRPatient))
        || []

      console.log("✅ FHIR: Transformed patients:", patients.length)

      return {
        data: patients,
        total: bundle.total || 0,
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
