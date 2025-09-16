"use client"

import { useState, useEffect } from "react"
import { ClinicalNoteForm } from "./clinical-note-form"
import { VitalSignsForm } from "./vital-signs-form"
import { LabResultsViewer } from "./lab-results-viewer"
import { MedicationList } from "./medication-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Activity, TestTube, Pill, Search, User } from "lucide-react"
import { patientsApi } from "@/lib/api/patients"
import { clinicalApi } from "@/lib/api/clinical"
import { useApiQuery } from "@/lib/hooks/use-api"

export interface ClinicalNote {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  date: string
  type: string
  chiefComplaint: string
  historyOfPresentIllness: string
  physicalExam: string
  assessment: string
  plan: string
  followUp?: string
}

export interface VitalSigns {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  temperature: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  weight?: number
  height?: number
  bmi?: number
  pain?: number
  notes?: string
}

export interface LabResult {
  id: string
  patientId: string
  patientName: string
  orderDate: string
  resultDate: string
  testName: string
  category: string
  results: {
    name: string
    value: string
    unit: string
    referenceRange: string
    status: "normal" | "abnormal" | "critical"
  }[]
  providerId: string
  providerName: string
  status: "pending" | "completed" | "reviewed"
  notes?: string
}

export interface Medication {
  id: string
  patientId: string
  patientName: string
  medicationName: string
  dosage: string
  frequency: string
  route: string
  startDate: string
  endDate?: string
  prescribedBy: string
  indication: string
  status: "active" | "discontinued" | "completed"
  notes?: string
}

export function ClinicalOperations() {
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedPatientName, setSelectedPatientName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [patientOptions, setPatientOptions] = useState<{ id: string; name: string }[]>([])

  const { data: patientsData, isLoading: patientsLoading } = useApiQuery(
    ["patients", "all"],
    () => patientsApi.getAll(1, 100),
    { enabled: true },
  )

  const { data: clinicalNotes, refetch: refetchNotes } = useApiQuery(
    ["clinical", "notes", selectedPatientId],
    () => clinicalApi.notes.getByPatient(selectedPatientId),
    { enabled: !!selectedPatientId },
  )

  const { data: vitalSigns, refetch: refetchVitals } = useApiQuery(
    ["clinical", "vitals", selectedPatientId],
    () => clinicalApi.vitals.getByPatient(selectedPatientId),
    { enabled: !!selectedPatientId },
  )

  const { data: labResults, refetch: refetchLabs } = useApiQuery(
    ["clinical", "labs", selectedPatientId],
    () => clinicalApi.labs.getByPatient(selectedPatientId),
    { enabled: !!selectedPatientId },
  )

  const { data: medications, refetch: refetchMedications } = useApiQuery(
    ["clinical", "medications", selectedPatientId],
    () => clinicalApi.medications.getByPatient(selectedPatientId),
    { enabled: !!selectedPatientId },
  )

  useEffect(() => {
    if (patientsData?.data) {
      const options = patientsData.data.map((patient: any) => ({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
      }))
      setPatientOptions(options)
    }
  }, [patientsData])

  const handlePatientSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.length >= 2) {
      try {
        const results = await patientsApi.search(term, "name")
        if (results.data) {
          const options = results.data.map((patient: any) => ({
            id: patient.id,
            name: `${patient.firstName} ${patient.lastName}`,
          }))
          setPatientOptions(options)
        }
      } catch (error) {
        console.error("Patient search failed:", error)
      }
    }
  }

  const handlePatientSelect = (patientId: string) => {
    const patient = patientOptions.find((p) => p.id === patientId)
    setSelectedPatientId(patientId)
    setSelectedPatientName(patient?.name || "")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clinical Operations</h2>
        <p className="text-muted-foreground">Manage clinical notes, vital signs, lab results, and medications</p>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Patient Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select value={selectedPatientId} onValueChange={handlePatientSelect} disabled={patientsLoading}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={patientsLoading ? "Loading patients..." : "Choose a patient to view clinical data"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {patientOptions.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} (ID: {patient.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient ID or name..."
                className="w-64"
                value={searchTerm}
                onChange={(e) => handlePatientSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPatientId ? (
        <Tabs defaultValue="notes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Clinical Notes</span>
            </TabsTrigger>
            <TabsTrigger value="vitals" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Vital Signs</span>
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span>Lab Results</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center space-x-2">
              <Pill className="w-4 h-4" />
              <span>Medications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <ClinicalNoteForm
              patientId={selectedPatientId}
              patientName={selectedPatientName}
              existingNotes={clinicalNotes?.data || []}
              onNoteSaved={() => refetchNotes()}
            />
          </TabsContent>

          <TabsContent value="vitals">
            <VitalSignsForm
              patientId={selectedPatientId}
              patientName={selectedPatientName}
              existingVitals={vitalSigns?.data || []}
              onVitalSaved={() => refetchVitals()}
            />
          </TabsContent>

          <TabsContent value="labs">
            <LabResultsViewer
              patientId={selectedPatientId}
              patientName={selectedPatientName}
              labResults={labResults?.data || []}
              onLabUpdated={() => refetchLabs()}
            />
          </TabsContent>

          <TabsContent value="medications">
            <MedicationList
              patientId={selectedPatientId}
              patientName={selectedPatientName}
              medications={medications?.data || []}
              onMedicationUpdated={() => refetchMedications()}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
              <p className="text-muted-foreground">Please select a patient to view and manage clinical data.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
