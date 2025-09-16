import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AppointmentScheduling } from "@/components/appointments/appointment-scheduling"

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <AppointmentScheduling />
    </DashboardLayout>
  )
}
