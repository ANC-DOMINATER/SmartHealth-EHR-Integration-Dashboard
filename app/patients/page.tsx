import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PatientManagement } from "@/components/patients/patient-management"

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <PatientManagement />
    </DashboardLayout>
  )
}
