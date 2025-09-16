"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Medication } from "./clinical-operations"
import { Pill, Plus, Edit, X, Save } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ModalDialog } from "@/components/shared/modal-dialog"

interface MedicationListProps {
  patientId: string
  patientName: string
  medications: Medication[]
}

export function MedicationList({ patientId, patientName, medications }: MedicationListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    route: "",
    indication: "",
    notes: "",
  })

  const frequencies = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime",
  ]

  const routes = ["Oral", "Topical", "Injection", "Intravenous", "Intramuscular", "Sublingual", "Rectal", "Inhalation"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Saving medication:", {
        patientId,
        patientName,
        ...formData,
        startDate: new Date().toISOString().split("T")[0],
        prescribedBy: "Dr. Smith", // Mock provider
        status: "active",
      })

      // Reset form
      setFormData({
        medicationName: "",
        dosage: "",
        frequency: "",
        route: "",
        indication: "",
        notes: "",
      })
      setIsFormOpen(false)
      setEditingMedication(null)
      setIsLoading(false)
    }, 1000)
  }

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setFormData({
      medicationName: medication.medicationName,
      dosage: medication.dosage,
      frequency: medication.frequency,
      route: medication.route,
      indication: medication.indication,
      notes: medication.notes || "",
    })
    setIsFormOpen(true)
  }

  const handleNewMedication = () => {
    setEditingMedication(null)
    setFormData({
      medicationName: "",
      dosage: "",
      frequency: "",
      route: "",
      indication: "",
      notes: "",
    })
    setIsFormOpen(true)
  }

  const handleDiscontinue = (medicationId: string) => {
    // TODO: Implement discontinue medication API call
    console.log("Discontinuing medication:", medicationId)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: "active" | "discontinued" | "completed") => {
    const variants = {
      active: "default",
      discontinued: "secondary",
      completed: "outline",
    } as const

    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      discontinued: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    )
  }

  const activeMedications = medications.filter((med) => med.status === "active")
  const inactiveMedications = medications.filter((med) => med.status !== "active")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Medications - {patientName}</h3>
          <p className="text-muted-foreground">Manage patient medications and prescriptions</p>
        </div>
        <Button onClick={handleNewMedication}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Active Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            <span>Active Medications ({activeMedications.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeMedications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Medications</h3>
              <p className="mb-4">No active medications have been prescribed for this patient.</p>
              <Button onClick={handleNewMedication}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Medication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMedications.map((medication) => (
                <div key={medication.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{medication.medicationName}</h4>
                      <p className="text-muted-foreground">
                        {medication.dosage} - {medication.frequency} ({medication.route})
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(medication.status)}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(medication)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDiscontinue(medication.id)}
                        disabled={medication.status !== "active"}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Indication:</span>
                      <p className="font-medium">{medication.indication}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prescribed by:</span>
                      <p className="font-medium">{medication.prescribedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">{new Date(medication.startDate).toLocaleDateString()}</p>
                    </div>
                    {medication.endDate && (
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <p className="font-medium">{new Date(medication.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {medication.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Notes: </span>
                      <p className="text-sm mt-1">{medication.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="w-5 h-5 opacity-50" />
              <span>Inactive Medications ({inactiveMedications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveMedications.map((medication) => (
                <div key={medication.id} className="p-4 border rounded-lg opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{medication.medicationName}</h4>
                      <p className="text-muted-foreground">
                        {medication.dosage} - {medication.frequency} ({medication.route})
                      </p>
                    </div>
                    {getStatusBadge(medication.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Indication:</span>
                      <p className="font-medium">{medication.indication}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">
                        {new Date(medication.startDate).toLocaleDateString()} -{" "}
                        {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : "Ongoing"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Form Modal */}
      <ModalDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingMedication ? "Edit Medication" : "Add New Medication"}
        description={`${editingMedication ? "Update" : "Add"} medication for ${patientName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label htmlFor="medication-name">Medication Name *</Label>
            <Input
              id="medication-name"
              value={formData.medicationName}
              onChange={(e) => handleChange("medicationName", e.target.value)}
              placeholder="Enter medication name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleChange("dosage", e.target.value)}
                placeholder="e.g., 10mg, 500mg"
                required
              />
            </div>
            <div>
              <Label htmlFor="route">Route *</Label>
              <Select value={formData.route} onValueChange={(value) => handleChange("route", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="frequency">Frequency *</Label>
            <Select value={formData.frequency} onValueChange={(value) => handleChange("frequency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="indication">Indication *</Label>
            <Input
              id="indication"
              value={formData.indication}
              onChange={(e) => handleChange("indication", e.target.value)}
              placeholder="Reason for prescription"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingMedication ? "Update Medication" : "Add Medication"}
                </>
              )}
            </Button>
          </div>
        </form>
      </ModalDialog>
    </div>
  )
}
