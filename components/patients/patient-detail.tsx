"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "./patient-management"
import { User, Phone, Mail, MapPin, Calendar, AlertTriangle, Activity, Pill, Edit, Shield } from "lucide-react"

interface PatientDetailProps {
  patient: Patient
  onEdit: () => void
}

export function PatientDetail({ patient, onEdit }: PatientDetailProps) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>
                {patient.firstName} {patient.lastName}
              </span>
            </CardTitle>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
          </div>
          <Button onClick={onEdit} size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demographics */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Demographics</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Age:</span>
              <p className="font-medium">{age} years old</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gender:</span>
              <p className="font-medium">{patient.gender}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date of Birth:</span>
              <p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Contact Information</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{patient.address}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency Contact</span>
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{patient.emergencyContact}</p>
            <p className="text-muted-foreground">{patient.emergencyPhone}</p>
          </div>
        </div>

        {/* Insurance */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Insurance</span>
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{patient.insuranceProvider}</p>
            <p className="text-muted-foreground">ID: {patient.insuranceId}</p>
          </div>
        </div>

        {/* Medical History */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Medical History</span>
          </h3>

          {/* Allergies */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Allergies</h4>
            {patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((allergy) => (
                  <Badge key={allergy} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies</p>
            )}
          </div>

          {/* Conditions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Conditions</h4>
            {patient.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.conditions.map((condition) => (
                  <Badge key={condition} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active conditions</p>
            )}
          </div>

          {/* Medications */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center space-x-1">
              <Pill className="w-3 h-3" />
              <span>Current Medications</span>
            </h4>
            {patient.medications.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.medications.map((medication) => (
                  <Badge key={medication} variant="outline" className="text-xs">
                    {medication}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No current medications</p>
            )}
          </div>
        </div>

        {/* Visit History */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Visit History</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Last Visit:</span>
              <p className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
            </div>
            {patient.nextAppointment && (
              <div>
                <span className="text-muted-foreground">Next Appointment:</span>
                <p className="font-medium">{new Date(patient.nextAppointment).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
