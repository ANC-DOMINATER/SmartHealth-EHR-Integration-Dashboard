import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BillingAdmin } from "@/components/billing/billing-admin"

export default function BillingPage() {
  return (
    <DashboardLayout>
      <BillingAdmin />
    </DashboardLayout>
  )
}
