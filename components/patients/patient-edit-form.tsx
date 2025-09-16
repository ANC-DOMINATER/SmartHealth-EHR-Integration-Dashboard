"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Patient } from "./patient-management"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface PatientEditFormProps {
  patient?: Patient
  onSave: (patient: Partial<Patient>) => void
  onCancel: () => void
}

export function PatientEditForm({ patient, onSave, onCancel }: PatientEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    address: patient?.address || "",
    emergencyContact: patient?.emergencyContact || "",
    emergencyPhone: patient?.emergencyPhone || "",
    allergies: patient?.allergies?.join(", ") || "",
    conditions: patient?.conditions?.join(", ") || "",
    medications: patient?.medications?.join(", ") || "",
    insuranceProvider: patient?.insuranceProvider || "",
    insuranceId: patient?.insuranceId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Convert comma-separated strings back to arrays
    const patientData: Partial<Patient> = {
      ...formData,
      allergies: formData.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      conditions: formData.conditions
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      medications: formData.medications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }

    if (patient) {
      patientData.id = patient.id
    }

    setTimeout(() => {
      onSave(patientData)
      setIsLoading(false)
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          rows={2}
        />
      </div>

      {/* Emergency Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => handleChange("emergencyContact", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
          <Input
            id="emergencyPhone"
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => handleChange("emergencyPhone", e.target.value)}
          />
        </div>
      </div>

      {/* Insurance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="insuranceProvider">Insurance Provider</Label>
          <Input
            id="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={(e) => handleChange("insuranceProvider", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="insuranceId">Insurance ID</Label>
          <Input
            id="insuranceId"
            value={formData.insuranceId}
            onChange={(e) => handleChange("insuranceId", e.target.value)}
          />
        </div>
      </div>

      {/* Medical Information */}
      <div>
        <Label htmlFor="allergies">Allergies (comma-separated)</Label>
        <Input
          id="allergies"
          value={formData.allergies}
          onChange={(e) => handleChange("allergies", e.target.value)}
          placeholder="e.g., Penicillin, Shellfish, Latex"
        />
      </div>

      <div>
        <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
        <Input
          id="conditions"
          value={formData.conditions}
          onChange={(e) => handleChange("conditions", e.target.value)}
          placeholder="e.g., Hypertension, Diabetes, Asthma"
        />
      </div>

      <div>
        <Label htmlFor="medications">Current Medications (comma-separated)</Label>
        <Input
          id="medications"
          value={formData.medications}
          onChange={(e) => handleChange("medications", e.target.value)}
          placeholder="e.g., Metformin, Lisinopril, Albuterol"
        />
      </div>

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
          ) : (
            "Save Patient"
          )}
        </Button>
      </div>
    </form>
  )
}
