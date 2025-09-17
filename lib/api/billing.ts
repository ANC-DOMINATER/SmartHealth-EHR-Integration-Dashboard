import { fhirClient } from "../fhir/client"
import { transformFHIRCoverage, transformFHIRAccount, transformFHIRChargeItem } from "../fhir/transforms"
import type { InsuranceEligibility, BillingCode, PatientBalance } from "@/components/billing/billing-admin"

export const billingApi = {
  // Insurance Eligibility
  insurance: {
    checkEligibility: async (patientId: string, insuranceInfo: any) => {
      // In a real implementation, this would verify coverage with external payers
      const coverage = await fhirClient.search('Coverage', {
        _format: 'json'
      })
      return coverage
    },
    getEligibility: async (patientId: string): Promise<InsuranceEligibility[]> => {
      try {
        const coverageBundle = await fhirClient.search('Coverage', {
          _format: 'json'
        })
        
        if (!coverageBundle.entry || coverageBundle.entry.length === 0) {
          return []
        }

        // Get patient info separately if needed
        let patientName = 'Unknown Patient'
        try {
          const patient = await fhirClient.read('Patient', patientId)
          patientName = patient.name?.[0] ? 
            `${patient.name[0].given?.[0] || ''} ${patient.name[0].family || ''}`.trim() :
            'Unknown Patient'
        } catch (error) {
          console.warn('Could not fetch patient details:', error)
        }

        return coverageBundle.entry
          .filter(entry => entry.resource?.resourceType === 'Coverage')
          .map(entry => transformFHIRCoverage(entry.resource, patientName))
      } catch (error) {
        console.error('Error fetching insurance eligibility:', error)
        return []
      }
    },
    updateEligibility: async (patientId: string, eligibilityData: Partial<InsuranceEligibility>) => {
      // In a real implementation, this would update coverage information
      return fhirClient.update('Coverage', patientId, eligibilityData)
    },
  },

  // Patient Balances
  balances: {
    getByPatient: async (patientId: string): Promise<PatientBalance[]> => {
      try {
        const accountBundle = await fhirClient.search('Account', {
          _format: 'json'
        })
        
        if (!accountBundle.entry || accountBundle.entry.length === 0) {
          return []
        }

        // Get patient info separately if needed
        let patientName = 'Unknown Patient'
        try {
          const patient = await fhirClient.read('Patient', patientId)
          patientName = patient.name?.[0] ? 
            `${patient.name[0].given?.[0] || ''} ${patient.name[0].family || ''}`.trim() :
            'Unknown Patient'
        } catch (error) {
          console.warn('Could not fetch patient details:', error)
        }

        return accountBundle.entry
          .filter(entry => entry.resource?.resourceType === 'Account')
          .map(entry => transformFHIRAccount(entry.resource, patientName))
      } catch (error) {
        console.error('Error fetching patient balances:', error)
        return []
      }
    },
    getAll: async (page = 1, limit = 20): Promise<PatientBalance[]> => {
      try {
        const accountBundle = await fhirClient.search('Account', {
          _format: 'json'
        })
        
        if (!accountBundle.entry || accountBundle.entry.length === 0) {
          return []
        }

        const accounts = accountBundle.entry.filter(entry => entry.resource?.resourceType === 'Account')
        
        return accounts.map(entry => {
          const account = entry.resource as any
          return transformFHIRAccount(account, 'Unknown Patient')
        })
      } catch (error) {
        console.error('Error fetching all patient balances:', error)
        return []
      }
    },
    addTransaction: async (patientId: string, transaction: any) => {
      // In a real implementation, this would create a ChargeItem or Invoice
      return fhirClient.create('ChargeItem', {
        resourceType: 'ChargeItem',
        status: 'billable',
        subject: { reference: `Patient/${patientId}` },
        ...transaction
      })
    },
    processPayment: async (patientId: string, paymentData: any) => {
      // In a real implementation, this would process payment and update Account
      return fhirClient.create('PaymentNotice', {
        resourceType: 'PaymentNotice',
        status: 'active',
        request: { reference: `Patient/${patientId}` },
        ...paymentData
      })
    },
  },

  // Billing Codes
  codes: {
    getAll: async (): Promise<BillingCode[]> => {
      try {
        const chargeItemBundle = await fhirClient.search('ChargeItem', {
          _format: 'json'
        })
        
        if (!chargeItemBundle.entry || chargeItemBundle.entry.length === 0) {
          return []
        }

        return chargeItemBundle.entry
          .filter(entry => entry.resource?.resourceType === 'ChargeItem')
          .map(entry => transformFHIRChargeItem(entry.resource))
      } catch (error) {
        console.error('Error fetching billing codes:', error)
        return []
      }
    },
    getByCategory: async (category: string): Promise<BillingCode[]> => {
      try {
        const chargeItemBundle = await fhirClient.search('ChargeItem', {
          _format: 'json'
        })
        
        if (!chargeItemBundle.entry || chargeItemBundle.entry.length === 0) {
          return []
        }

        return chargeItemBundle.entry
          .filter(entry => entry.resource?.resourceType === 'ChargeItem')
          .map(entry => transformFHIRChargeItem(entry.resource))
      } catch (error) {
        console.error('Error fetching billing codes by category:', error)
        return []
      }
    },
    create: async (codeData: Omit<BillingCode, "id">): Promise<BillingCode> => {
      const fhirChargeItem = {
        resourceType: 'ChargeItem',
        status: 'billable',
        code: {
          coding: [{
            code: codeData.code,
            display: codeData.description
          }]
        },
        priceOverride: {
          value: codeData.fee,
          currency: 'USD'
        }
      }
      
      const created = await fhirClient.create('ChargeItem', fhirChargeItem)
      return transformFHIRChargeItem(created)
    },
    update: async (codeId: string, codeData: Partial<BillingCode>): Promise<BillingCode> => {
      const updated = await fhirClient.update('ChargeItem', codeId, codeData)
      return transformFHIRChargeItem(updated)
    },
    search: async (searchTerm: string): Promise<BillingCode[]> => {
      try {
        const chargeItemBundle = await fhirClient.search('ChargeItem', {
          _format: 'json'
        })
        
        if (!chargeItemBundle.entry || chargeItemBundle.entry.length === 0) {
          return []
        }

        return chargeItemBundle.entry
          .filter(entry => entry.resource?.resourceType === 'ChargeItem')
          .map(entry => transformFHIRChargeItem(entry.resource))
      } catch (error) {
        console.error('Error searching billing codes:', error)
        return []
      }
    },
  },

  // Reports
  reports: {
    getRevenue: async (startDate: string, endDate: string) => {
      // In a real implementation, this would aggregate financial data from various FHIR resources
      try {
        const chargeItemBundle = await fhirClient.search('ChargeItem', {
          _format: 'json',
          
        })
        
        // Process and aggregate revenue data
        return chargeItemBundle
      } catch (error) {
        console.error('Error fetching revenue data:', error)
        return { entry: [] }
      }
    },
    getPatientGrowth: async (period: string) => {
      // Aggregate patient registration data
      try {
        const patientBundle = await fhirClient.search('Patient', {
          _format: 'json',
          
        })
        
        // Process and group by registration dates
        return patientBundle
      } catch (error) {
        console.error('Error fetching patient growth data:', error)
        return { entry: [] }
      }
    },
    getAppointmentTrends: async (period: string) => {
      try {
        const appointmentBundle = await fhirClient.search('Appointment', {
          _format: 'json',
          
        })
        
        // Process and group by appointment dates and status
        return appointmentBundle
      } catch (error) {
        console.error('Error fetching appointment trends:', error)
        return { entry: [] }
      }
    },
    getPaymentMethods: async (period: string) => {
      // In a real implementation, this would analyze payment data
      try {
        const chargeItemBundle = await fhirClient.search('ChargeItem', {
          _format: 'json',
          
        })
        
        return chargeItemBundle
      } catch (error) {
        console.error('Error fetching payment methods data:', error)
        return { entry: [] }
      }
    },
    getTopServices: async (period: string) => {
      try {
        const procedureBundle = await fhirClient.search('Procedure', {
          _format: 'json',
          
        })
        
        // Process and aggregate by procedure codes
        return procedureBundle
      } catch (error) {
        console.error('Error fetching top services data:', error)
        return { entry: [] }
      }
    },
    getEfficiencyMetrics: async () => {
      // Calculate various efficiency metrics from FHIR data
      try {
        const appointments = await fhirClient.search('Appointment', { 
          _format: 'json',
          
        })
        
        // Calculate metrics like wait times, utilization, etc.
        return { appointments }
      } catch (error) {
        console.error('Error fetching efficiency metrics:', error)
        return { appointments: { entry: [] } }
      }
    },
  },
}
