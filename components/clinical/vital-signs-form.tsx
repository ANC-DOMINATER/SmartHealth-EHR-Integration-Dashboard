"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { VitalSigns } from "./clinical-operations"
import { Activity, Plus, Calendar, Clock, Thermometer, Heart, Gauge, Save } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ModalDialog } from "@/components/shared/modal-dialog"

interface VitalSignsFormProps {
  patientId: string
  patientName: string
  existingVitals: VitalSigns[]
}

export function VitalSignsForm({ patientId, patientName, existingVitals }: VitalSignsFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    temperature: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    pain: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Calculate BMI if height and weight are provided
    let bmi: number | undefined
    if (formData.height && formData.weight) {
      const heightInMeters = Number.parseFloat(formData.height) * 0.0254 // inches to meters
      const weightInKg = Number.parseFloat(formData.weight) * 0.453592 // pounds to kg
      bmi = Number.parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1))
    }

    // Simulate API call
    setTimeout(() => {
      console.log("Saving vital signs:", {
        patientId,
        patientName,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        temperature: Number.parseFloat(formData.temperature),
        bloodPressureSystolic: Number.parseInt(formData.bloodPressureSystolic),
        bloodPressureDiastolic: Number.parseInt(formData.bloodPressureDiastolic),
        heartRate: Number.parseInt(formData.heartRate),
        respiratoryRate: Number.parseInt(formData.respiratoryRate),
        oxygenSaturation: Number.parseInt(formData.oxygenSaturation),
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        height: formData.height ? Number.parseFloat(formData.height) : undefined,
        bmi,
        pain: formData.pain ? Number.parseInt(formData.pain) : undefined,
        notes: formData.notes || undefined,
      })

      // Reset form
      setFormData({
        temperature: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        pain: "",
        notes: "",
      })
      setIsFormOpen(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case "temperature":
        if (value < 97 || value > 99.5) return "abnormal"
        return "normal"
      case "heartRate":
        if (value < 60 || value > 100) return "abnormal"
        return "normal"
      case "bloodPressure":
        // This would be calculated based on systolic/diastolic
        return "normal"
      case "oxygenSaturation":
        if (value < 95) return "abnormal"
        return "normal"
      default:
        return "normal"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Vital Signs - {patientName}</h3>
          <p className="text-muted-foreground">Record and track patient vital signs</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Vitals
        </Button>
      </div>

      {/* Existing Vital Signs */}
      <div className="grid gap-4">
        {existingVitals.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Vital Signs Recorded</h3>
                <p className="text-muted-foreground mb-4">No vital signs have been recorded for this patient.</p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record First Vitals
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          existingVitals.map((vital) => (
            <Card key={vital.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Vital Signs</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(vital.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{vital.time}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <p className="text-lg font-semibold">{vital.temperature}°F</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Blood Pressure</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Heart Rate</span>
                    </div>
                    <p className="text-lg font-semibold">{vital.heartRate} bpm</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">O2 Sat</span>
                    </div>
                    <p className="text-lg font-semibold">{vital.oxygenSaturation}%</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Respiratory Rate</span>
                    <p className="text-lg font-semibold">{vital.respiratoryRate}/min</p>
                  </div>

                  {vital.weight && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Weight</span>
                      <p className="text-lg font-semibold">{vital.weight} lbs</p>
                    </div>
                  )}

                  {vital.height && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Height</span>
                      <p className="text-lg font-semibold">{vital.height} in</p>
                    </div>
                  )}

                  {vital.bmi && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">BMI</span>
                      <p className="text-lg font-semibold">{vital.bmi}</p>
                    </div>
                  )}
                </div>

                {vital.pain !== undefined && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Pain Scale (0-10): </span>
                    <span className="text-lg font-semibold">{vital.pain}</span>
                  </div>
                )}

                {vital.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Notes: </span>
                    <p className="text-sm mt-1">{vital.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vital Signs Form Modal */}
      <ModalDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Record Vital Signs"
        description={`Record vital signs for ${patientName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Core Vitals */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature (°F) *</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                placeholder="98.6"
                required
              />
            </div>
            <div>
              <Label htmlFor="heart-rate">Heart Rate (bpm) *</Label>
              <Input
                id="heart-rate"
                type="number"
                value={formData.heartRate}
                onChange={(e) => handleChange("heartRate", e.target.value)}
                placeholder="72"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bp-systolic">Systolic BP *</Label>
              <Input
                id="bp-systolic"
                type="number"
                value={formData.bloodPressureSystolic}
                onChange={(e) => handleChange("bloodPressureSystolic", e.target.value)}
                placeholder="120"
                required
              />
            </div>
            <div>
              <Label htmlFor="bp-diastolic">Diastolic BP *</Label>
              <Input
                id="bp-diastolic"
                type="number"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => handleChange("bloodPressureDiastolic", e.target.value)}
                placeholder="80"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="respiratory-rate">Respiratory Rate (/min) *</Label>
              <Input
                id="respiratory-rate"
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) => handleChange("respiratoryRate", e.target.value)}
                placeholder="16"
                required
              />
            </div>
            <div>
              <Label htmlFor="oxygen-saturation">Oxygen Saturation (%) *</Label>
              <Input
                id="oxygen-saturation"
                type="number"
                value={formData.oxygenSaturation}
                onChange={(e) => handleChange("oxygenSaturation", e.target.value)}
                placeholder="98"
                required
              />
            </div>
          </div>

          {/* Optional Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="150"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="68"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pain">Pain Scale (0-10)</Label>
            <Input
              id="pain"
              type="number"
              min="0"
              max="10"
              value={formData.pain}
              onChange={(e) => handleChange("pain", e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional observations or notes"
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
                  Save Vitals
                </>
              )}
            </Button>
          </div>
        </form>
      </ModalDialog>
    </div>
  )
}
