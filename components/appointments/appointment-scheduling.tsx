"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { appointmentsApi } from "@/lib/api/appointments"
import { AppointmentCalendar } from "./appointment-calendar"
import { AppointmentList } from "./appointment-list"
import { AppointmentForm } from "./appointment-form"
import { AvailabilityChecker } from "./availability-checker"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { ModalDialog } from "@/components/shared/modal-dialog"
import { CRUDNotice } from "@/components/shared/crud-notice"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

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
  const queryClient = useQueryClient()

  // Fetch appointments for the selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments', selectedDateStr],
    queryFn: () => appointmentsApi.getByDateRange(selectedDateStr, selectedDateStr),
  })

  // Fetch providers
  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['appointment-providers'],
    queryFn: () => appointmentsApi.getProviders(),
  })

  const appointments = appointmentsData?.data || []
  const providers = (providersData?.data || []).map((provider: any) => ({
    id: provider.id,
    name: provider.name,
    specialty: provider.specialty,
    availability: provider.schedule || {
      monday: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00"],
      tuesday: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
      wednesday: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "15:30"],
      thursday: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
      friday: ["09:00", "09:30", "10:00", "10:30", "11:00"],
    }
  }))

  const handleAppointmentSave = async (appointmentData: Partial<Appointment>) => {
    if (selectedAppointment) {
      // Update existing appointment
      try {
        await appointmentsApi.update(selectedAppointment.id, appointmentData)
        queryClient.invalidateQueries({ queryKey: ['appointments'] })
      } catch (error) {
        console.error('Failed to update appointment:', error)
      }
    } else {
      // Create new appointment
      try {
        await appointmentsApi.create(appointmentData as any)
        queryClient.invalidateQueries({ queryKey: ['appointments'] })
      } catch (error) {
        console.error('Failed to create appointment:', error)
      }
    }
    setIsFormModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleAppointmentEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsFormModalOpen(true)
  }

  const handleAppointmentCancel = async (appointmentId: string) => {
    try {
      await appointmentsApi.cancel(appointmentId)
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  if (appointmentsLoading || providersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CRUDNotice />
      
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
