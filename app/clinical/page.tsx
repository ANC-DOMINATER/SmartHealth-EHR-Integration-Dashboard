import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ClinicalOperations } from "@/components/clinical/clinical-operations"

export default function ClinicalPage() {
  return (
    <DashboardLayout>
      <ClinicalOperations />
    </DashboardLayout>
  )
}
