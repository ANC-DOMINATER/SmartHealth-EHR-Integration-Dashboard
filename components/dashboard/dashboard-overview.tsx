"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { patientsApi } from "@/lib/api/patients"
import { appointmentsApi } from "@/lib/api/appointments"
import { clinicalApi } from "@/lib/api/clinical"
import { billingApi } from "@/lib/api/billing"
import { Users, Calendar, FileText, DollarSign, BarChart3, UserPlus, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

export function DashboardOverview() {
  // Only fetch data on the client side (not during SSR)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch real data from FHIR APIs
  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: () => patientsApi.getAll(),
    enabled: isClient, // Only run on client side
  })

  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['dashboard-appointments-today'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0]
      return appointmentsApi.getByDateRange(today, today)
    },
    enabled: isClient, // Only run on client side
  })

  const { data: recentNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['dashboard-recent-notes'],
    queryFn: async () => {
      // Get recent clinical notes - just get any available from the server
      try {
        // Use a simple search for DocumentReference without patient filter first
        const response = await fetch('/fhir/DocumentReference')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const bundle = await response.json()
        if (bundle.entry && bundle.entry.length > 0) {
          return bundle.entry.map((entry: any) => ({
            id: entry.resource.id,
            patientName: 'Unknown Patient',
            type: entry.resource.type?.coding?.[0]?.display || 'Clinical Note',
            date: entry.resource.date || new Date().toISOString().split('T')[0],
            provider: 'Unknown Provider',
            chiefComplaint: entry.resource.description || 'N/A'
          }))
        }
        return []
      } catch (error) {
        console.error('Error fetching notes:', error)
        return []
      }
    },
    enabled: isClient, // Only run on client side
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const rawData = await billingApi.reports.getRevenue(startDate.toISOString().split('T')[0], endDate)
      
      // Process the FHIR Bundle to calculate total revenue
      let totalRevenue = 0
      if (rawData?.entry) {
        rawData.entry.forEach((entry: any) => {
          if (entry.resource?.resourceType === 'ChargeItem') {
            const chargeItem = entry.resource
            
            // Method 1: Look for valueMoney in performer extensions
            chargeItem.performer?.forEach((performer: any) => {
              performer.extension?.forEach((ext: any) => {
                if (ext.valueMoney?.value) {
                  const quantity = ext.valueQuantity?.value || 1
                  totalRevenue += (parseFloat(ext.valueMoney.value) || 0) * quantity
                }
              })
            })
            
            // Method 2: Look for priceOverride field
            if (chargeItem.priceOverride?.value) {
              const quantity = chargeItem.quantity?.value || 1
              totalRevenue += (parseFloat(chargeItem.priceOverride.value) || 0) * quantity
            }
          }
        })
      }
      
      console.log('Revenue calculation:', { totalRevenue, entryCount: rawData?.entry?.length })
      return { totalRevenue, rawData }
    },
    enabled: isClient, // Only run on client side
  })

  // Add console logging for debugging
  console.log('Dashboard Data:', {
    patientsResponse,
    revenueData,
    todayAppointments,
    recentNotes
  })

  const isLoading = patientsLoading || appointmentsLoading || notesLoading || revenueLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  // Create stats from real data
  const stats = [
    {
      title: "Total Patients",
      value: patientsResponse?.total?.toString() || patientsResponse?.data?.length?.toString() || "0",
      change: "+12%", // This would be calculated from historical data
      changeType: "positive" as const,
      icon: Users,
      color: "bg-primary",
    },
    {
      title: "Today's Appointments",
      value: todayAppointments?.data?.length?.toString() || "0",
      change: "+3%", // This would be calculated from previous day
      changeType: "positive" as const,
      icon: Calendar,
      color: "bg-success",
    },
    {
      title: "Recent Notes",
      value: recentNotes?.length?.toString() || "0",
      change: "+5%", // This would be calculated from historical data
      changeType: "positive" as const,
      icon: FileText,
      color: "bg-warning",
    },
    {
      title: "Monthly Revenue",
      value: revenueData?.totalRevenue ? `$${revenueData.totalRevenue.toLocaleString()}` : "$0",
      change: "+8%", // This would be calculated from previous month
      changeType: "positive" as const,
      icon: DollarSign,
      color: "bg-accent",
    },
  ]
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-lg text-muted-foreground">Welcome back! Here's what's happening in your practice today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="hover-lift shadow-soft border-border/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2.5 rounded-lg ${stat.color} shadow-soft`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-soft-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {recentNotes && recentNotes.length > 0 ? (
                recentNotes.slice(0, 3).map((note: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                    <div className="w-3 h-3 bg-primary rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-foreground">Clinical note: {note.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {note.providerName} - {new Date(note.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p>No recent clinical notes found</p>
                </div>
              )}
              
              {todayAppointments && todayAppointments.data && todayAppointments.data.length > 0 && (
                <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="w-3 h-3 bg-success rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">Today's appointments scheduled</p>
                    <p className="text-sm text-muted-foreground">
                      {todayAppointments.data.length} appointments for today
                    </p>
                  </div>
                </div>
              )}
              
              {patientsResponse && patientsResponse.total > 0 && (
                <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="w-3 h-3 bg-info rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">Total patients in system</p>
                    <p className="text-sm text-muted-foreground">
                      {patientsResponse.total} patients registered
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-soft-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-primary/5 hover-lift transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2.5 rounded-lg bg-primary shadow-soft">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Schedule Appointment</div>
                  <div className="text-sm text-muted-foreground">Book a new patient visit</div>
                </div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-success/5 hover-lift transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2.5 rounded-lg bg-success shadow-soft">
                  <UserPlus className="w-5 h-5 text-success-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Add Patient</div>
                  <div className="text-sm text-muted-foreground">Register new patient</div>
                </div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-accent/5 hover-lift transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2.5 rounded-lg bg-accent shadow-soft">
                  <BarChart3 className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">View Reports</div>
                  <div className="text-sm text-muted-foreground">Check analytics</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
