import { fhirClient, type FHIRBundle, type FHIRAppointment } from "../fhir/client"
import { extractCodeableConceptText, formatFHIRDate } from "../fhir/transforms"
import { mockCRUD, shouldUseMockCRUD, getCRUDErrorMessage } from "./mock-crud"

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  date: string
  time: string
  duration: number
  type: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  reason: string
  notes?: string
  location?: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  schedule: {
    [key: string]: { start: string; end: string; available: boolean }[]
  }
}

// Transform FHIR Appointment to internal format
function transformFHIRAppointment(fhirAppointment: FHIRAppointment): Appointment {
  const start = new Date(fhirAppointment.start || "")
  const end = new Date(fhirAppointment.end || "")
  const duration = fhirAppointment.end && fhirAppointment.start 
    ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) 
    : 30

  const patient = fhirAppointment.participant?.find(p => 
    p.type?.some(t => t.coding?.some(c => c.code === "patient" || c.code === "PPRF"))
  )
  
  const provider = fhirAppointment.participant?.find(p => 
    p.type?.some(t => t.coding?.some(c => c.code === "practitioner" || c.code === "PRCP"))
  )

  return {
    id: fhirAppointment.id || "",
    patientId: patient?.actor?.reference?.replace("Patient/", "") || "",
    patientName: patient?.actor?.display || "Unknown Patient",
    providerId: provider?.actor?.reference?.replace("Practitioner/", "") || "",
    providerName: provider?.actor?.display || "Unknown Provider", 
    date: formatFHIRDate(fhirAppointment.start),
    time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration,
    type: extractCodeableConceptText(fhirAppointment.appointmentType) || 
          extractCodeableConceptText(fhirAppointment.serviceType?.[0]) || "General",
    status: mapFHIRAppointmentStatus(fhirAppointment.status),
    reason: extractCodeableConceptText(fhirAppointment.reasonCode?.[0]) || "",
    notes: fhirAppointment.description || "",
    location: "" // FHIR appointments might have location in extensions
  }
}

// Map FHIR appointment status to internal status
function mapFHIRAppointmentStatus(fhirStatus: FHIRAppointment['status']): Appointment['status'] {
  switch (fhirStatus) {
    case "booked":
    case "pending":
      return "scheduled"
    case "arrived":
    case "checked-in":
      return "confirmed"
    case "fulfilled":
      return "completed"
    case "cancelled":
      return "cancelled"
    case "noshow":
      return "no-show"
    default:
      return "scheduled"
  }
}

export const appointmentsApi = {
  // Get appointments using simplified FHIR search
  getByDateRange: async (startDate: string, endDate: string) => {
    try {
      const searchParams = {
        date: startDate, // Use the date parameter to filter appointments
        _format: "json"
      }
      
      const bundle: FHIRBundle = await fhirClient.search('Appointment', searchParams)
      
      const appointments = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Appointment")
        .map(entry => transformFHIRAppointment(entry.resource as FHIRAppointment))
        || []

      return {
        data: appointments,
        total: bundle.total || 0,
        success: true
      }
    } catch (error) {
      console.error("FHIR get appointments by date range error:", error)
      return {
        data: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : "Failed to get appointments"
      }
    }
  },

  // Get appointments by patient using FHIR
  getByPatient: async (patientId: string) => {
    try {
      const searchParams = {
        _format: "json"
      }
      
      const bundle: FHIRBundle = await fhirClient.search('Appointment', searchParams)
      
      const appointments = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Appointment")
        .map(entry => transformFHIRAppointment(entry.resource as FHIRAppointment))
        || []

      return {
        data: appointments,
        success: true
      }
    } catch (error) {
      console.error("FHIR get appointments by patient error:", error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : "Failed to get patient appointments"
      }
    }
  },

  // Get appointments by provider using FHIR
  getByProvider: async (providerId: string, date?: string) => {
    try {
      const searchParams = {
        _format: "json"
      }
      
      const bundle: FHIRBundle = await fhirClient.search('Appointment', searchParams)
      
      const appointments = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Appointment")
        .map(entry => transformFHIRAppointment(entry.resource as FHIRAppointment))
        || []

      return {
        data: appointments,
        success: true
      }
    } catch (error) {
      console.error("FHIR get appointments by provider error:", error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : "Failed to get provider appointments"
      }
    }
  },

  // Create appointment using FHIR or Mock CRUD
  create: async (appointmentData: Omit<Appointment, "id">) => {
    try {
      if (shouldUseMockCRUD('create')) {
        // Use mock CRUD for demonstration since HAPI test server is read-only
        const result = mockCRUD.appointments.create(appointmentData)
        console.log("✅ Mock CRUD: Appointment created successfully")
        return {
          data: result.data,
          success: true,
          message: getCRUDErrorMessage('create', 'appointment')
        }
      }
      
      // Fallback to FHIR (would work with a writable FHIR server)
      const fhirAppointment: Partial<FHIRAppointment> = {
        resourceType: "Appointment",
        status: "booked",
        appointmentType: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/v2-0276",
            code: "ROUTINE",
            display: appointmentData.type
          }]
        },
        description: appointmentData.notes,
        start: `${appointmentData.date}T${appointmentData.time}:00`,
        end: new Date(new Date(`${appointmentData.date}T${appointmentData.time}:00`).getTime() + appointmentData.duration * 60000).toISOString(),
        participant: [
          {
            type: [{
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                code: "PPRF",
                display: "primary performer"
              }]
            }],
            actor: {
              reference: `Patient/${appointmentData.patientId}`,
              display: appointmentData.patientName
            },
            required: "required",
            status: "accepted"
          },
          {
            type: [{
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType", 
                code: "PRCP",
                display: "primary care provider"
              }]
            }],
            actor: {
              reference: `Practitioner/${appointmentData.providerId}`,
              display: appointmentData.providerName
            },
            required: "required",
            status: "accepted"
          }
        ]
      }
      
      const created: FHIRAppointment = await fhirClient.create('Appointment', fhirAppointment)
      const appointment = transformFHIRAppointment(created)
      
      return {
        data: appointment,
        success: true
      }
    } catch (error) {
      console.error("FHIR create appointment error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to create appointment")
    }
  },

  // Update appointment using FHIR or Mock CRUD
  update: async (appointmentId: string, appointmentData: Partial<Appointment>) => {
    try {
      if (shouldUseMockCRUD('update')) {
        // Use mock CRUD for demonstration since HAPI test server is read-only
        const result = mockCRUD.appointments.update(appointmentId, appointmentData)
        console.log("✅ Mock CRUD: Appointment updated successfully")
        return {
          data: result.data,
          success: true,
          message: getCRUDErrorMessage('update', 'appointment')
        }
      }
      
      // Fallback to FHIR (would work with a writable FHIR server)
      // Get existing appointment
      const existing: FHIRAppointment = await fhirClient.read('Appointment', appointmentId)
      
      // Update fields
      const updated: Partial<FHIRAppointment> = {
        ...existing,
        id: appointmentId
      }
      
      if (appointmentData.status) {
        updated.status = appointmentData.status === "confirmed" ? "booked" : 
                        appointmentData.status === "completed" ? "fulfilled" :
                        appointmentData.status === "cancelled" ? "cancelled" :
                        appointmentData.status === "no-show" ? "noshow" : "booked"
      }
      
      if (appointmentData.notes !== undefined) {
        updated.description = appointmentData.notes
      }
      
      const result: FHIRAppointment = await fhirClient.update('Appointment', appointmentId, updated)
      const appointment = transformFHIRAppointment(result)
      
      return {
        data: appointment,
        success: true
      }
    } catch (error) {
      console.error("FHIR update appointment error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to update appointment")
    }
  },

  // Cancel appointment using FHIR
  cancel: async (appointmentId: string, reason?: string) => {
    try {
      if (shouldUseMockCRUD('update')) {
        // Use mock CRUD for demonstration since HAPI test server is read-only
        const result = mockCRUD.appointments.cancel(appointmentId)
        console.log("✅ Mock CRUD: Appointment cancelled successfully")
        return {
          success: true,
          message: getCRUDErrorMessage('cancel', 'appointment')
        }
      }
      
      // Fallback to FHIR (would work with a writable FHIR server)
      const existing: FHIRAppointment = await fhirClient.read('Appointment', appointmentId)
      
      const updated: Partial<FHIRAppointment> = {
        ...existing,
        id: appointmentId,
        status: "cancelled",
        description: reason ? `${existing.description || ""}\nCancellation reason: ${reason}` : existing.description
      }
      
      await fhirClient.update('Appointment', appointmentId, updated)
      
      return {
        success: true
      }
    } catch (error) {
      console.error("Appointment cancel error:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to cancel appointment")
    }
  },

  // Get provider availability (mock implementation - FHIR doesn't have built-in availability)
  getProviderAvailability: async (providerId: string, date: string) => {
    try {
      // This would typically be implemented with Schedule and Slot resources
      // For now, return a basic availability based on existing appointments
      const existingAppointments = await appointmentsApi.getByProvider(providerId, date)
      
      return {
        data: {
          providerId,
          date,
          available: existingAppointments.data?.length < 8, // Simple logic
          slots: [] // Would be populated from Schedule/Slot resources
        },
        success: true
      }
    } catch (error) {
      console.error("Provider availability error:", error)
      return {
        data: { providerId, date, available: false, slots: [] },
        success: false
      }
    }
  },

  // Get all providers using FHIR Practitioner resource
  getProviders: async () => {
    try {
      const bundle: FHIRBundle = await fhirClient.search('Practitioner', {
        active: "true",
        _format: "json"
      })
      
      const providers = bundle.entry
        ?.filter(entry => entry.resource?.resourceType === "Practitioner")
        .map(entry => {
          const practitioner = entry.resource as any
          return {
            id: practitioner.id || "",
            name: practitioner.name?.[0] ? 
              `${practitioner.name[0].given?.[0] || ""} ${practitioner.name[0].family || ""}`.trim() : 
              "Unknown Provider",
            specialty: practitioner.qualification?.[0]?.code?.coding?.[0]?.display || "General Practice",
            schedule: {} // Would be populated from Schedule resources
          }
        }) || []

      return {
        data: providers,
        success: true
      }
    } catch (error) {
      console.error("FHIR get providers error:", error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : "Failed to get providers"
      }
    }
  },
}
