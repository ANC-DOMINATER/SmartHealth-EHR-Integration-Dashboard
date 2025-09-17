"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Info, Database, Server } from "lucide-react"

export function CRUDNotice() {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>EHR Integration Status</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Fully Functional
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Read Operations */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-medium">READ Operations</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Real FHIR Data
              </Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Patient Records from HAPI FHIR R4</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Appointments, Clinical Notes, Lab Results</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Billing Data, Insurance Coverage</span>
              </li>
            </ul>
          </div>

          {/* Write Operations */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-green-600" />
              <span className="font-medium">CREATE/UPDATE/DELETE Operations</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Demo Mode
              </Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Create new patients, appointments</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Update existing records</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Delete/cancel operations</span>
              </li>
            </ul>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> This dashboard integrates with the HAPI FHIR R4 test server for reading real healthcare data. 
            Since public FHIR servers are typically read-only, write operations (CREATE/UPDATE/DELETE) use a demonstration layer that 
            provides full CRUD functionality. In a production environment, these would connect to your organization's writable FHIR server.
          </AlertDescription>
        </Alert>

        <div className="text-xs text-muted-foreground">
          <p><strong>Features Available:</strong> Patient Management, Appointment Scheduling, Clinical Operations, Billing Administration</p>
          <p><strong>FHIR Compliance:</strong> All operations follow FHIR R4 standards and would work with any FHIR-compliant EHR system</p>
        </div>
      </CardContent>
    </Card>
  )
}