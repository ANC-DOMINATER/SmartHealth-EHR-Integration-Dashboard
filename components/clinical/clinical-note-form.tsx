"use client"

import type React from "react"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { ClinicalNote } from "./clinical-operations"
import { FileText, Plus, Calendar, User, Edit, Save } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ModalDialog } from "@/components/shared/modal-dialog"
import { practitionerApi } from "@/lib/api/practitioner"

interface ClinicalNoteFormProps {
  patientId: string
  patientName: string
  existingNotes: ClinicalNote[]
}

export function ClinicalNoteForm({ patientId, patientName, existingNotes }: ClinicalNoteFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    chiefComplaint: "",
    historyOfPresentIllness: "",
    physicalExam: "",
    assessment: "",
    plan: "",
    followUp: "",
  })

  // Fetch current practitioner data
  const { data: currentPractitioner, isLoading: practitionerLoading } = useQuery({
    queryKey: ['current-practitioner'],
    queryFn: () => practitionerApi.getCurrentPractitioner(),
  })

  const noteTypes = [
    "Progress Note",
    "Initial Consultation",
    "Follow-up Visit",
    "Procedure Note",
    "Discharge Summary",
    "Telephone Encounter",
    "Emergency Visit",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Saving clinical note:", {
        patientId,
        patientName,
        ...formData,
        date: new Date().toISOString().split("T")[0],
        providerId: currentPractitioner?.id || "unknown",
        providerName: currentPractitioner?.name || "Unknown Provider",
      })

      // Reset form
      setFormData({
        type: "",
        chiefComplaint: "",
        historyOfPresentIllness: "",
        physicalExam: "",
        assessment: "",
        plan: "",
        followUp: "",
      })
      setIsFormOpen(false)
      setEditingNote(null)
      setIsLoading(false)
    }, 1000)
  }

  const handleEdit = (note: ClinicalNote) => {
    setEditingNote(note)
    setFormData({
      type: note.type,
      chiefComplaint: note.chiefComplaint,
      historyOfPresentIllness: note.historyOfPresentIllness,
      physicalExam: note.physicalExam,
      assessment: note.assessment,
      plan: note.plan,
      followUp: note.followUp || "",
    })
    setIsFormOpen(true)
  }

  const handleNewNote = () => {
    setEditingNote(null)
    setFormData({
      type: "",
      chiefComplaint: "",
      historyOfPresentIllness: "",
      physicalExam: "",
      assessment: "",
      plan: "",
      followUp: "",
    })
    setIsFormOpen(true)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Clinical Notes - {patientName}</h3>
          <p className="text-muted-foreground">Document patient encounters and clinical findings</p>
        </div>
        <Button onClick={handleNewNote}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Existing Notes */}
      <div className="grid gap-4">
        {existingNotes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Clinical Notes</h3>
                <p className="text-muted-foreground mb-4">No clinical notes have been recorded for this patient.</p>
                <Button onClick={handleNewNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Note
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          existingNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>{note.type}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{note.providerName}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Chief Complaint</h4>
                  <p className="text-sm">{note.chiefComplaint}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Assessment</h4>
                  <p className="text-sm">{note.assessment}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Plan</h4>
                  <p className="text-sm">{note.plan}</p>
                </div>
                {note.followUp && (
                  <div>
                    <Badge variant="outline">Follow-up: {note.followUp}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Note Form Modal */}
      <ModalDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingNote ? "Edit Clinical Note" : "New Clinical Note"}
        description={`${editingNote ? "Update" : "Create"} clinical note for ${patientName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label htmlFor="note-type">Note Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chief-complaint">Chief Complaint *</Label>
            <Input
              id="chief-complaint"
              value={formData.chiefComplaint}
              onChange={(e) => handleChange("chiefComplaint", e.target.value)}
              placeholder="Brief description of the patient's main concern"
              required
            />
          </div>

          <div>
            <Label htmlFor="hpi">History of Present Illness</Label>
            <Textarea
              id="hpi"
              value={formData.historyOfPresentIllness}
              onChange={(e) => handleChange("historyOfPresentIllness", e.target.value)}
              placeholder="Detailed history of the current condition"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="physical-exam">Physical Examination</Label>
            <Textarea
              id="physical-exam"
              value={formData.physicalExam}
              onChange={(e) => handleChange("physicalExam", e.target.value)}
              placeholder="Physical examination findings"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="assessment">Assessment *</Label>
            <Textarea
              id="assessment"
              value={formData.assessment}
              onChange={(e) => handleChange("assessment", e.target.value)}
              placeholder="Clinical assessment and diagnosis"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="plan">Plan *</Label>
            <Textarea
              id="plan"
              value={formData.plan}
              onChange={(e) => handleChange("plan", e.target.value)}
              placeholder="Treatment plan and recommendations"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="follow-up">Follow-up</Label>
            <Input
              id="follow-up"
              value={formData.followUp}
              onChange={(e) => handleChange("followUp", e.target.value)}
              placeholder="e.g., 2 weeks, 1 month, PRN"
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
                  {editingNote ? "Update Note" : "Save Note"}
                </>
              )}
            </Button>
          </div>
        </form>
      </ModalDialog>
    </div>
  )
}
