"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { InsuranceEligibilityChecker } from "./insurance-eligibility-checker"
import { PatientBalanceOverview } from "./patient-balance-overview"
import { BillingCodesTable } from "./billing-codes-table"
import { ReportsDashboard } from "./reports-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { billingApi } from "@/lib/api/billing"
import { CreditCard, Shield, FileText, BarChart3, AlertCircle } from "lucide-react"

export interface InsuranceEligibility {
  patientId: string
  patientName: string
  insuranceProvider: string
  policyNumber: string
  groupNumber?: string
  eligibilityStatus: "active" | "inactive" | "pending" | "expired"
  effectiveDate: string
  expirationDate?: string
  copay?: number
  deductible?: number
  deductibleMet?: number
  benefits: {
    service: string
    covered: boolean
    copay?: number
    coinsurance?: number
    notes?: string
  }[]
  lastChecked: string
}

export interface PatientBalance {
  patientId: string
  patientName: string
  totalBalance: number
  insuranceBalance: number
  patientBalance: number
  lastPayment?: {
    amount: number
    date: string
    method: string
  }
  transactions: {
    id: string
    date: string
    description: string
    amount: number
    type: "charge" | "payment" | "adjustment"
    status: "pending" | "processed" | "denied"
  }[]
}

export interface BillingCode {
  id: string
  code: string
  description: string
  category: string
  fee: number
  insuranceRate?: number
  lastUpdated: string
  status: "active" | "inactive"
}

export function BillingAdmin() {
  // Fetch eligibility data for sample patients
  const { data: eligibilityData = [], isLoading: eligibilityLoading, error: eligibilityError } = useQuery({
    queryKey: ['insurance-eligibility'],
    queryFn: async () => {
      // Get eligibility for sample patients
      const samplePatients = ['Patient/example', 'Patient/example2']
      const eligibilities = await Promise.all(
        samplePatients.map(patientId => billingApi.insurance.getEligibility(patientId))
      )
      return eligibilities.flat()
    },
  })

  // Fetch patient balances
  const { data: balanceData = [], isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ['patient-balances'],
    queryFn: async () => {
      // For now, get balances for sample patients
      const samplePatients = ['Patient/example', 'Patient/example2']
      const balances = await Promise.all(
        samplePatients.map(patientId => billingApi.balances.getByPatient(patientId))
      )
      return balances.flat()
    },
  })

  // Fetch billing codes
  const { data: billingCodes = [], isLoading: codesLoading, error: codesError } = useQuery({
    queryKey: ['billing-codes'],
    queryFn: () => billingApi.codes.getAll(),
  })

  const isLoading = eligibilityLoading || balanceLoading || codesLoading
  const hasError = eligibilityError || balanceError || codesError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (hasError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading billing data: {eligibilityError?.message || balanceError?.message || codesError?.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Administration</h2>
        <p className="text-muted-foreground">
          Manage insurance eligibility, patient balances, billing codes, and financial reports
        </p>
      </div>

      <Tabs defaultValue="eligibility" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eligibility" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Insurance</span>
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Balances</span>
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Billing Codes</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility">
          <InsuranceEligibilityChecker eligibilityData={eligibilityData} />
        </TabsContent>

        <TabsContent value="balances">
          <PatientBalanceOverview balanceData={balanceData} />
        </TabsContent>

        <TabsContent value="codes">
          <BillingCodesTable billingCodes={billingCodes} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
