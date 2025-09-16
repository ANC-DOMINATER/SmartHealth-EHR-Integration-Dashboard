"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Appointment } from "./appointment-scheduling"
import { Calendar, Clock, User, Edit, X, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppointmentListProps {
  appointments: Appointment[]
  onAppointmentEdit: (appointment: Appointment) => void
  onAppointmentCancel: (appointmentId: string) => void
}

export function AppointmentList({ appointments, onAppointmentEdit, onAppointmentCancel }: AppointmentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    const matchesProvider = providerFilter === "all" || appointment.providerName === providerFilter

    return matchesSearch && matchesStatus && matchesProvider
  })

  const uniqueProviders = Array.from(new Set(appointments.map((apt) => apt.providerName)))

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    "no-show": "bg-orange-100 text-orange-800 border-orange-200",
  }

  const statusBadgeVariants = {
    scheduled: "secondary",
    confirmed: "default",
    completed: "outline",
    cancelled: "destructive",
    "no-show": "secondary",
  } as const

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>All Appointments ({filteredAppointments.length})</span>
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, providers, or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {uniqueProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No appointments found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments
              .sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`)
                const dateB = new Date(`${b.date} ${b.time}`)
                return dateA.getTime() - dateB.getTime()
              })
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors hover:bg-accent",
                    appointment.status === "cancelled" && "opacity-60",
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {appointment.time} ({appointment.duration} min)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={statusBadgeVariants[appointment.status]}>{appointment.status}</Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAppointmentEdit(appointment)}
                          disabled={appointment.status === "cancelled"}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAppointmentCancel(appointment.id)}
                          disabled={appointment.status === "cancelled"}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.patientName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Type:</strong> {appointment.type}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Provider:</strong> {appointment.providerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Patient ID:</strong> {appointment.patientId}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
