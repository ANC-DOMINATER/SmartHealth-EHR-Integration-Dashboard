"use client"

import { useState } from "react"
import { PatientSearchForm } from "./patient-search-form"
import { PatientList } from "./patient-list"
import { PatientDetail } from "./patient-detail"
import { PatientEditForm } from "./patient-edit-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ModalDialog } from "@/components/shared/modal-dialog"
import { patientsApi } from "@/lib/api/patients"
import { useApiMutation } from "@/lib/hooks/use-api"

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  allergies: string[]
  conditions: string[]
  medications: string[]
  lastVisit: string
  nextAppointment?: string
  insuranceProvider: string
  insuranceId: string
}

export function PatientManagement() {
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load recent patients from FHIR on component mount for testing
  const loadRecentPatients = async () => {
    setIsLoading(true)
    console.log("🏥 Loading recent patients from FHIR...")

    try {
      const results = await patientsApi.getAll(1, 10)
      console.log("✅ FHIR patients loaded:", results)
      setSearchResults(results.data || [])
    } catch (error) {
      console.error("❌ Failed to load FHIR patients:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (searchTerm: string, searchType: "name" | "id") => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    console.log(`🔍 Searching FHIR for ${searchType}: "${searchTerm}"`)

    try {
      const results = await patientsApi.search(searchTerm, searchType)
      console.log(`✅ FHIR search results:`, results)
      setSearchResults(results.data || [])
    } catch (error) {
      console.error("❌ FHIR search failed:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const createPatientMutation = useApiMutation((patientData: Omit<Patient, "id">) => {
    console.log("🏥 Creating patient in FHIR:", patientData)
    return patientsApi.create(patientData)
  }, {
    successMessage: "Patient created successfully",
    onSuccess: (result) => {
      console.log("✅ Patient created in FHIR:", result)
      setIsAddModalOpen(false)
      // Refresh search results if there are any
      if (searchResults.length > 0) {
        // Re-run the last search to show updated results
        const lastSearchTerm = searchResults[0]?.firstName || searchResults[0]?.id
        if (lastSearchTerm) {
          handleSearch(lastSearchTerm, "name")
        }
      }
    },
  })

  const updatePatientMutation = useApiMutation(
    ({ patientId, patientData }: { patientId: string; patientData: Partial<Patient> }) =>
      patientsApi.update(patientId, patientData),
    {
      successMessage: "Patient updated successfully",
      onSuccess: (updatedPatient) => {
        setIsEditModalOpen(false)
        // Update the selected patient and search results
        setSelectedPatient(updatedPatient.data)
        setSearchResults((prev) => prev.map((p) => (p.id === updatedPatient.data.id ? updatedPatient.data : p)))
      },
    },
  )

  const handlePatientSave = (patient: Partial<Patient>) => {
    if (selectedPatient) {
      // Update existing patient
      updatePatientMutation.mutate({
        patientId: selectedPatient.id,
        patientData: patient,
      })
    } else {
      // Create new patient
      createPatientMutation.mutate(patient as Omit<Patient, "id">)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground">Search, view, and manage patient records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRecentPatients} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Recent Patients"}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      <PatientSearchForm onSearch={handleSearch} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PatientList
            patients={searchResults}
            onPatientSelect={setSelectedPatient}
            selectedPatientId={selectedPatient?.id}
          />
        </div>

        <div>
          {selectedPatient && <PatientDetail patient={selectedPatient} onEdit={() => setIsEditModalOpen(true)} />}
        </div>
      </div>

      <ModalDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient"
        description="Update patient information"
      >
        {selectedPatient && (
          <PatientEditForm
            patient={selectedPatient}
            onSave={handlePatientSave}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </ModalDialog>

      <ModalDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Patient"
        description="Register a new patient"
      >
        <PatientEditForm onSave={handlePatientSave} onCancel={() => setIsAddModalOpen(false)} />
      </ModalDialog>
    </div>
  )
}
