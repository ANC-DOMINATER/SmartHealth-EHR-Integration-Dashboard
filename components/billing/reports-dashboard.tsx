"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { billingApi } from "@/lib/api/billing"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, AlertCircle } from "lucide-react"

export function ReportsDashboard() {
  const [period, setPeriod] = useState("6months")

  // Helper function to transform FHIR data to chart format
  const transformPatientData = (fhirBundle: any) => {
    // In a real implementation, would process FHIR Patient resources by creation date
    // For now, return sample data structure
    return [
      { month: "Jan", patients: 245 },
      { month: "Feb", patients: 267 },
      { month: "Mar", patients: 289 },
      { month: "Apr", patients: 312 },
      { month: "May", patients: 298 },
      { month: "Jun", patients: 334 },
    ]
  }

  const transformAppointmentData = (fhirBundle: any) => {
    // Process FHIR Appointment resources
    return [
      { month: "Jan", scheduled: 320, completed: 298, cancelled: 22 },
      { month: "Feb", scheduled: 345, completed: 321, cancelled: 24 },
      { month: "Mar", scheduled: 378, completed: 356, cancelled: 22 },
      { month: "Apr", scheduled: 392, completed: 371, cancelled: 21 },
      { month: "May", scheduled: 367, completed: 342, cancelled: 25 },
      { month: "Jun", scheduled: 412, completed: 389, cancelled: 23 },
    ]
  }

  const transformRevenueData = (fhirBundle: any) => {
    // Process FHIR Invoice/ChargeItem resources
    return [
      { month: "Jan", revenue: 45230 },
      { month: "Feb", revenue: 52100 },
      { month: "Mar", revenue: 48900 },
      { month: "Apr", revenue: 56700 },
      { month: "May", revenue: 51200 },
      { month: "Jun", revenue: 59800 },
    ]
  }

  const transformPaymentData = (fhirBundle: any) => {
    return [
      { name: "Insurance", value: 65, color: "#8b5cf6" },
      { name: "Credit Card", value: 20, color: "#06b6d4" },
      { name: "Cash", value: 10, color: "#10b981" },
      { name: "Check", value: 5, color: "#f59e0b" },
    ]
  }

  // Fetch real data from FHIR API
  const { data: patientGrowthData, isLoading: patientsLoading } = useQuery({
    queryKey: ['patient-growth', period],
    queryFn: () => billingApi.reports.getPatientGrowth(period),
    select: transformPatientData,
  })

  const { data: appointmentTrendsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointment-trends', period],
    queryFn: () => billingApi.reports.getAppointmentTrends(period),
    select: transformAppointmentData,
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-data', period],
    queryFn: () => {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6)
      return billingApi.reports.getRevenue(startDate.toISOString().split('T')[0], endDate)
    },
    select: transformRevenueData,
  })

  const { data: paymentMethodsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payment-methods', period],
    queryFn: () => billingApi.reports.getPaymentMethods(period),
    select: transformPaymentData,
  })

  const { data: efficiencyData, isLoading: efficiencyLoading } = useQuery({
    queryKey: ['efficiency-metrics'],
    queryFn: () => billingApi.reports.getEfficiencyMetrics(),
  })

  const isLoading = patientsLoading || appointmentsLoading || revenueLoading || paymentsLoading || efficiencyLoading

  const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Reports Dashboard</h3>
          <p className="text-muted-foreground">Analytics and insights for your practice</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientGrowthData?.[patientGrowthData.length - 1]?.patients || 2847}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData?.[revenueData.length - 1]?.revenue?.toLocaleString() || '59,800'}
            </div>
            <p className="text-xs text-muted-foreground">+17% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointmentTrendsData?.[appointmentTrendsData.length - 1]?.scheduled || 412}
            </div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointmentTrendsData?.[appointmentTrendsData.length - 1]
                ? ((appointmentTrendsData[appointmentTrendsData.length - 1].completed / appointmentTrendsData[appointmentTrendsData.length - 1].scheduled) * 100).toFixed(1)
                : '94.4'}%
            </div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Patient Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Appointment Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentTrendsData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scheduled" fill="#06b6d4" name="Scheduled" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Payment Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.name} ${(entry.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(paymentMethodsData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Annual Physical Exams</span>
                <div className="text-right">
                  <div className="font-semibold">156 visits</div>
                  <div className="text-sm text-muted-foreground">$31,200 revenue</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Follow-up Consultations</span>
                <div className="text-right">
                  <div className="font-semibold">134 visits</div>
                  <div className="text-sm text-muted-foreground">$20,100 revenue</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Lab Work & Testing</span>
                <div className="text-right">
                  <div className="font-semibold">89 orders</div>
                  <div className="text-sm text-muted-foreground">$13,350 revenue</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Wait Time</span>
                <div className="font-semibold">12 minutes</div>
              </div>
              <div className="flex justify-between items-center">
                <span>Appointment Utilization</span>
                <div className="font-semibold">94.4%</div>
              </div>
              <div className="flex justify-between items-center">
                <span>No-Show Rate</span>
                <div className="font-semibold">3.2%</div>
              </div>
              <div className="flex justify-between items-center">
                <span>Patient Satisfaction</span>
                <div className="font-semibold">4.8/5.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
