"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Appointment, Provider } from "./appointment-scheduling"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface AppointmentFormProps {
  appointment?: Appointment | null
  providers: Provider[]
  onSave: (appointment: Partial<Appointment>) => void
  onCancel: () => void
}

export function AppointmentForm({ appointment, providers, onSave, onCancel }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: appointment?.patientName || "",
    patientId: appointment?.patientId || "",
    providerId: appointment?.providerId || "",
    providerName: appointment?.providerName || "",
    date: appointment?.date || "",
    time: appointment?.time || "",
    duration: appointment?.duration?.toString() || "30",
    type: appointment?.type || "",
    reason: appointment?.reason || "",
    notes: appointment?.notes || "",
    status: appointment?.status || "scheduled",
  })

  const appointmentTypes = [
    "Consultation",
    "Follow-up",
    "Physical Exam",
    "Procedure",
    "Lab Work",
    "Vaccination",
    "Emergency",
    "Telemedicine",
  ]

  const durations = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const selectedProvider = providers.find((p) => p.id === formData.providerId)

    const appointmentData: Partial<Appointment> = {
      ...formData,
      duration: Number.parseInt(formData.duration),
      providerName: selectedProvider?.name || formData.providerName,
    }

    // Simulate API call
    setTimeout(() => {
      onSave(appointmentData)
      setIsLoading(false)
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getAvailableTimeSlots = () => {
    if (!formData.date || !formData.providerId) return []

    const selectedProvider = providers.find((p) => p.id === formData.providerId)
    if (!selectedProvider) return []

    const dayOfWeek = new Date(formData.date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    return selectedProvider.availability[dayOfWeek] || []
  }

  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name *</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => handleChange("patientName", e.target.value)}
            placeholder="Enter patient name"
            required
          />
        </div>
        <div>
          <Label htmlFor="patientId">Patient ID *</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => handleChange("patientId", e.target.value)}
            placeholder="Enter patient ID"
            required
          />
        </div>
      </div>

      {/* Provider Selection */}
      <div>
        <Label htmlFor="provider">Provider *</Label>
        <Select value={formData.providerId} onValueChange={(value) => handleChange("providerId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name} - {provider.specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time *</Label>
          <Select
            value={formData.time}
            onValueChange={(value) => handleChange("time", value)}
            disabled={!formData.date || !formData.providerId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.date && formData.providerId && availableTimeSlots.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">No available time slots for this date</p>
          )}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Appointment Type *</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duration">Duration *</Label>
          <Select value={formData.duration} onValueChange={(value) => handleChange("duration", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durations.map((duration) => (
                <SelectItem key={duration.value} value={duration.value}>
                  {duration.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reason and Notes */}
      <div>
        <Label htmlFor="reason">Reason for Visit *</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Brief description of the visit reason"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Any additional notes or special instructions"
          rows={3}
        />
      </div>

      {/* Status (for editing existing appointments) */}
      {appointment && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : appointment ? (
            "Update Appointment"
          ) : (
            "Schedule Appointment"
          )}
        </Button>
      </div>
    </form>
  )
}
