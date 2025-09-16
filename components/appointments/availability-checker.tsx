"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Provider, Appointment } from "./appointment-scheduling"
import { Clock, User, Calendar, CheckCircle, XCircle } from "lucide-react"

interface AvailabilityCheckerProps {
  providers: Provider[]
  appointments: Appointment[]
}

export function AvailabilityChecker({ providers, appointments }: AvailabilityCheckerProps) {
  const [selectedProviderId, setSelectedProviderId] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [showAvailability, setShowAvailability] = useState(false)

  const handleCheckAvailability = () => {
    if (selectedProviderId && selectedDate) {
      setShowAvailability(true)
    }
  }

  const getProviderAvailability = () => {
    if (!selectedProviderId || !selectedDate) return []

    const provider = providers.find((p) => p.id === selectedProviderId)
    if (!provider) return []

    const dayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const availableSlots = provider.availability[dayOfWeek] || []

    // Get booked appointments for this provider and date
    const bookedSlots = appointments
      .filter((apt) => apt.providerId === selectedProviderId && apt.date === selectedDate && apt.status !== "cancelled")
      .map((apt) => apt.time)

    return availableSlots.map((slot) => ({
      time: slot,
      isAvailable: !bookedSlots.includes(slot),
    }))
  }

  const selectedProvider = providers.find((p) => p.id === selectedProviderId)
  const availability = getProviderAvailability()

  return (
    <div className="space-y-4">
      {/* Selection Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="provider-select">Provider</Label>
          <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
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

        <div>
          <Label htmlFor="date-select">Date</Label>
          <Input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <Button onClick={handleCheckAvailability} disabled={!selectedProviderId || !selectedDate} className="w-full">
        <Clock className="w-4 h-4 mr-2" />
        Check Availability
      </Button>

      {/* Availability Results */}
      {showAvailability && selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>
                {selectedProvider.name} -{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No availability for this provider on the selected date.</p>
                <p className="text-sm mt-2">Provider may not work on this day.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Available Time Slots</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Booked</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availability.map((slot) => (
                    <Badge
                      key={slot.time}
                      variant={slot.isAvailable ? "default" : "secondary"}
                      className={`justify-center py-2 ${
                        slot.isAvailable
                          ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        {slot.isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{slot.time}</span>
                      </div>
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Summary</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Slots:</span>
                      <span className="ml-2 font-medium">{availability.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {availability.filter((slot) => slot.isAvailable).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
