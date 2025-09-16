"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, FileText, DollarSign, BarChart3, UserPlus, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Total Patients",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    color: "bg-primary",
  },
  {
    title: "Today's Appointments",
    value: "24",
    change: "+3%",
    changeType: "positive" as const,
    icon: Calendar,
    color: "bg-success",
  },
  {
    title: "Pending Results",
    value: "18",
    change: "-5%",
    changeType: "negative" as const,
    icon: FileText,
    color: "bg-warning",
  },
  {
    title: "Monthly Revenue",
    value: "$45,231",
    change: "+8%",
    changeType: "positive" as const,
    icon: DollarSign,
    color: "bg-accent",
  },
]

export function DashboardOverview() {
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
              <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="w-3 h-3 bg-primary rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">New patient registered</p>
                  <p className="text-sm text-muted-foreground">Sarah Johnson - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="w-3 h-3 bg-success rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">Appointment completed</p>
                  <p className="text-sm text-muted-foreground">Dr. Smith with John Doe - 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="w-3 h-3 bg-info rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">Lab results available</p>
                  <p className="text-sm text-muted-foreground">Blood work for Mary Wilson - 1 hour ago</p>
                </div>
              </div>
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
