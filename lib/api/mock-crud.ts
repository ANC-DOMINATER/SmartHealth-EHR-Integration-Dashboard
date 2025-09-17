// Mock storage for CRUD operations when FHIR server is read-only
// This provides a complete CRUD experience for demonstration purposes

interface MockStorage {
  patients: any[]
  appointments: any[]
  clinicalNotes: any[]
  vitals: any[]
  medications: any[]
  labResults: any[]
}

// Simple in-memory storage (in production, this would be a database)
let mockStorage: MockStorage = {
  patients: [],
  appointments: [],
  clinicalNotes: [],
  vitals: [],
  medications: [],
  labResults: []
}

// Generate unique IDs
function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const mockCRUD = {
  // Patient CRUD operations
  patients: {
    create: (patient: any) => {
      const newPatient = { ...patient, id: generateId() }
      mockStorage.patients.push(newPatient)
      console.log('✅ Mock CRUD: Created patient', newPatient.id)
      return { data: newPatient, success: true }
    },
    
    update: (id: string, updates: any) => {
      const index = mockStorage.patients.findIndex(p => p.id === id)
      if (index !== -1) {
        mockStorage.patients[index] = { ...mockStorage.patients[index], ...updates }
        console.log('✅ Mock CRUD: Updated patient', id)
        return { data: mockStorage.patients[index], success: true }
      }
      throw new Error('Patient not found')
    },
    
    delete: (id: string) => {
      const index = mockStorage.patients.findIndex(p => p.id === id)
      if (index !== -1) {
        mockStorage.patients.splice(index, 1)
        console.log('✅ Mock CRUD: Deleted patient', id)
        return { success: true }
      }
      throw new Error('Patient not found')
    },
    
    getAll: () => mockStorage.patients,
    getById: (id: string) => mockStorage.patients.find(p => p.id === id)
  },

  // Appointment CRUD operations
  appointments: {
    create: (appointment: any) => {
      const newAppointment = { ...appointment, id: generateId() }
      mockStorage.appointments.push(newAppointment)
      console.log('✅ Mock CRUD: Created appointment', newAppointment.id)
      return { data: newAppointment, success: true }
    },
    
    update: (id: string, updates: any) => {
      const index = mockStorage.appointments.findIndex(a => a.id === id)
      if (index !== -1) {
        mockStorage.appointments[index] = { ...mockStorage.appointments[index], ...updates }
        console.log('✅ Mock CRUD: Updated appointment', id)
        return { data: mockStorage.appointments[index], success: true }
      }
      throw new Error('Appointment not found')
    },
    
    cancel: (id: string) => {
      return mockCRUD.appointments.update(id, { status: 'cancelled' })
    },
    
    delete: (id: string) => {
      const index = mockStorage.appointments.findIndex(a => a.id === id)
      if (index !== -1) {
        mockStorage.appointments.splice(index, 1)
        console.log('✅ Mock CRUD: Deleted appointment', id)
        return { success: true }
      }
      throw new Error('Appointment not found')
    },
    
    getAll: () => mockStorage.appointments,
    getById: (id: string) => mockStorage.appointments.find(a => a.id === id),
    getByDateRange: (startDate: string, endDate: string) => 
      mockStorage.appointments.filter(a => a.date >= startDate && a.date <= endDate)
  },

  // Clinical Notes CRUD operations
  clinicalNotes: {
    create: (note: any) => {
      const newNote = { ...note, id: generateId() }
      mockStorage.clinicalNotes.push(newNote)
      console.log('✅ Mock CRUD: Created clinical note', newNote.id)
      return { data: newNote, success: true }
    },
    
    update: (id: string, updates: any) => {
      const index = mockStorage.clinicalNotes.findIndex(n => n.id === id)
      if (index !== -1) {
        mockStorage.clinicalNotes[index] = { ...mockStorage.clinicalNotes[index], ...updates }
        console.log('✅ Mock CRUD: Updated clinical note', id)
        return { data: mockStorage.clinicalNotes[index], success: true }
      }
      throw new Error('Clinical note not found')
    },
    
    delete: (id: string) => {
      const index = mockStorage.clinicalNotes.findIndex(n => n.id === id)
      if (index !== -1) {
        mockStorage.clinicalNotes.splice(index, 1)
        console.log('✅ Mock CRUD: Deleted clinical note', id)
        return { success: true }
      }
      throw new Error('Clinical note not found')
    },
    
    getByPatient: (patientId: string) => 
      mockStorage.clinicalNotes.filter(n => n.patientId === patientId)
  },

  // Vital Signs CRUD operations
  vitals: {
    create: (vital: any) => {
      const newVital = { ...vital, id: generateId() }
      mockStorage.vitals.push(newVital)
      console.log('✅ Mock CRUD: Created vital signs', newVital.id)
      return { data: newVital, success: true }
    },
    
    update: (id: string, updates: any) => {
      const index = mockStorage.vitals.findIndex(v => v.id === id)
      if (index !== -1) {
        mockStorage.vitals[index] = { ...mockStorage.vitals[index], ...updates }
        console.log('✅ Mock CRUD: Updated vital signs', id)
        return { data: mockStorage.vitals[index], success: true }
      }
      throw new Error('Vital signs not found')
    },
    
    getByPatient: (patientId: string) => 
      mockStorage.vitals.filter(v => v.patientId === patientId)
  },

  // Clear all mock data (for testing)
  clearAll: () => {
    mockStorage = {
      patients: [],
      appointments: [],
      clinicalNotes: [],
      vitals: [],
      medications: [],
      labResults: []
    }
    console.log('🧹 Mock CRUD: Cleared all data')
  }
}

// Helper function to check if we should use mock CRUD
export function shouldUseMockCRUD(operation: 'create' | 'update' | 'delete'): boolean {
  // Always use mock CRUD for write operations since HAPI test server is read-only
  return true
}

// Enhanced error messages for better user experience
export function getCRUDErrorMessage(operation: string, resourceType: string): string {
  return `Successfully ${operation}d ${resourceType} using demonstration mode. In a production environment, this would be saved to the FHIR server.`
}