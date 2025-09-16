"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "./patient-management"
import { Users, Calendar, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface PatientListProps {
  patients: Patient[]
  onPatientSelect: (patient: Patient) => void
  selectedPatientId?: string
}

export function PatientList({ patients, onPatientSelect, selectedPatientId }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Search Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No patients found. Try searching for a patient name or ID.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Search Results ({patients.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
              selectedPatientId === patient.id ? "bg-accent border-accent-foreground" : "bg-card",
            )}
            onClick={() => onPatientSelect(patient)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
              </div>
              <Badge variant="outline">{patient.gender}</Badge>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
              </div>
            </div>

            {patient.conditions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {patient.conditions.slice(0, 2).map((condition) => (
                  <Badge key={condition} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
                {patient.conditions.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{patient.conditions.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
