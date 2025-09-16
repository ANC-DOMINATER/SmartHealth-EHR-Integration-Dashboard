"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "./appointment-scheduling"
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Edit, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppointmentCalendarProps {
  appointments: Appointment[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onAppointmentEdit: (appointment: Appointment) => void
  onAppointmentCancel: (appointmentId: string) => void
}

export function AppointmentCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentEdit,
  onAppointmentCancel,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.date === dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const days = getDaysInMonth(currentMonth)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const selectedDateAppointments = getAppointmentsForDate(selectedDate)

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    "no-show": "bg-orange-100 text-orange-800 border-orange-200",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </CardTitle>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2 h-20" />
              }

              const dayAppointments = getAppointmentsForDate(day)
              const isSelected = day.toDateString() === selectedDate.toDateString()
              const isToday = day.toDateString() === new Date().toDateString()

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 h-20 border rounded-lg cursor-pointer transition-colors hover:bg-accent",
                    isSelected && "bg-accent border-accent-foreground",
                    isToday && "border-primary",
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <div className={cn("text-sm font-medium", isToday && "text-primary")}>{day.getDate()}</div>
                  <div className="space-y-1 mt-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div key={apt.id} className="text-xs p-1 rounded bg-primary text-primary-foreground truncate">
                        {apt.time} {apt.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayAppointments.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div key={appointment.id} className={cn("p-3 rounded-lg border", statusColors[appointment.status])}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => onAppointmentEdit(appointment)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onAppointmentCancel(appointment.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>{appointment.patientName}</span>
                      </div>
                      <p className="text-muted-foreground">{appointment.reason}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{appointment.providerName}</span>
                        <Badge variant="outline" className="text-xs">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
