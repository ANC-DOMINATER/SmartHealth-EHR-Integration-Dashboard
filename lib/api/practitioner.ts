import { fhirClient } from "../fhir/client"

export interface Provider {
  id: string
  name: string
  firstName: string
  lastName: string
  specialty: string
  qualification: string
  department: string
  email?: string
  phone?: string
  active: boolean
}

export const practitionerApi = {
  // Get all practitioners
  getAll: async (): Promise<Provider[]> => {
    try {
      const practitionerBundle = await fhirClient.search('Practitioner', {
        _format: 'json'
      })

      if (!practitionerBundle.entry || practitionerBundle.entry.length === 0) {
        return []
      }

      return practitionerBundle.entry
        .filter(entry => entry.resource?.resourceType === 'Practitioner')
        .map(entry => transformFHIRPractitioner(entry.resource))
    } catch (error) {
      console.error('Error fetching practitioners:', error)
      return []
    }
  },

  // Get practitioner by ID
  getById: async (practitionerId: string): Promise<Provider | null> => {
    try {
      const practitioner = await fhirClient.read('Practitioner', practitionerId)
      return transformFHIRPractitioner(practitioner)
    } catch (error) {
      console.error('Error fetching practitioner:', error)
      return null
    }
  },

  // Get current user practitioner (mock for now)
  getCurrentPractitioner: async (): Promise<Provider | null> => {
    try {
      // In a real implementation, this would get the current logged-in practitioner
      // For now, return the first available practitioner
      const practitioners = await practitionerApi.getAll()
      return practitioners[0] || null
    } catch (error) {
      console.error('Error fetching current practitioner:', error)
      return null
    }
  }
}

// Transform FHIR Practitioner resource to internal Provider type
function transformFHIRPractitioner(fhirPractitioner: any): Provider {
  const name = fhirPractitioner.name?.[0]
  const firstName = name?.given?.[0] || ''
  const lastName = name?.family || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Practitioner'

  const qualification = fhirPractitioner.qualification?.[0]?.code?.text || 
                       fhirPractitioner.qualification?.[0]?.code?.coding?.[0]?.display || 
                       'General Practitioner'

  const specialty = qualification // In FHIR, specialty could be derived from qualification or other fields

  return {
    id: fhirPractitioner.id || '',
    name: fullName,
    firstName,
    lastName,
    specialty,
    qualification,
    department: 'Primary Care', // Default department
    email: fhirPractitioner.telecom?.find((t: any) => t.system === 'email')?.value,
    phone: fhirPractitioner.telecom?.find((t: any) => t.system === 'phone')?.value,
    active: fhirPractitioner.active !== false
  }
}
