"use client"

import { useState } from "react"
import { AppointmentCalendar } from "./appointment-calendar"
import { AppointmentList } from "./appointment-list"
import { AppointmentForm } from "./appointment-form"
import { AvailabilityChecker } from "./availability-checker"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { ModalDialog } from "@/components/shared/modal-dialog"

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  date: string
  time: string
  duration: number // in minutes
  type: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  notes?: string
  reason: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  availability: {
    [key: string]: string[] // day of week -> available time slots
  }
}

export function AppointmentScheduling() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "A001",
      patientId: "P001",
      patientName: "John Doe",
      providerId: "PR001",
      providerName: "Dr. Smith",
      date: "2024-02-15",
      time: "09:00",
      duration: 30,
      type: "Consultation",
      status: "scheduled",
      reason: "Annual checkup",
    },
    {
      id: "A002",
      patientId: "P002",
      patientName: "Sarah Johnson",
      providerId: "PR002",
      providerName: "Dr. Wilson",
      date: "2024-02-15",
      time: "10:30",
      duration: 45,
      type: "Follow-up",
      status: "confirmed",
      reason: "Asthma follow-up",
    },
    {
      id: "A003",
      patientId: "P003",
      patientName: "Mike Brown",
      providerId: "PR001",
      providerName: "Dr. Smith",
      date: "2024-02-16",
      time: "14:00",
      duration: 60,
      type: "Physical Exam",
      status: "scheduled",
      reason: "Annual physical",
    },
  ])

  const providers: Provider[] = [
    {
      id: "PR001",
      name: "Dr. Smith",
      specialty: "Family Medicine",
      availability: {
        monday: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00"],
        tuesday: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
        wednesday: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "15:30"],
        thursday: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
        friday: ["09:00", "09:30", "10:00", "10:30", "11:00"],
      },
    },
    {
      id: "PR002",
      name: "Dr. Wilson",
      specialty: "Internal Medicine",
      availability: {
        monday: ["10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30"],
        tuesday: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00"],
        wednesday: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30"],
        thursday: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00"],
        friday: ["10:00", "10:30", "11:00", "11:30", "14:00"],
      },
    },
  ]

  const handleAppointmentSave = (appointmentData: Partial<Appointment>) => {
    if (selectedAppointment) {
      // Update existing appointment
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === selectedAppointment.id ? { ...apt, ...appointmentData } : apt)),
      )
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: `A${String(appointments.length + 1).padStart(3, "0")}`,
        ...appointmentData,
      } as Appointment
      setAppointments((prev) => [...prev, newAppointment])
    }
    setIsFormModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleAppointmentEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsFormModalOpen(true)
  }

  const handleAppointmentCancel = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" as const } : apt)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointment Scheduling</h2>
          <p className="text-muted-foreground">Manage appointments and provider schedules</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsAvailabilityModalOpen(true)}>
            Check Availability
          </Button>
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onAppointmentEdit={handleAppointmentEdit}
            onAppointmentCancel={handleAppointmentCancel}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <AppointmentList
            appointments={appointments}
            onAppointmentEdit={handleAppointmentEdit}
            onAppointmentCancel={handleAppointmentCancel}
          />
        </TabsContent>
      </Tabs>

      <ModalDialog
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedAppointment(null)
        }}
        title={selectedAppointment ? "Edit Appointment" : "Schedule New Appointment"}
        description={selectedAppointment ? "Update appointment details" : "Book a new appointment"}
      >
        <AppointmentForm
          appointment={selectedAppointment}
          providers={providers}
          onSave={handleAppointmentSave}
          onCancel={() => {
            setIsFormModalOpen(false)
            setSelectedAppointment(null)
          }}
        />
      </ModalDialog>

      <ModalDialog
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Check Provider Availability"
        description="View available time slots for providers"
      >
        <AvailabilityChecker providers={providers} appointments={appointments} />
      </ModalDialog>
    </div>
  )
}
