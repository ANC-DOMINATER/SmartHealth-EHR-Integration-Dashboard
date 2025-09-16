"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LabResult } from "./clinical-operations"
import { TestTube, Calendar, User, Search, Filter, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

interface LabResultsViewerProps {
  patientId: string
  patientName: string
  labResults: LabResult[]
}

export function LabResultsViewer({ patientId, patientName, labResults }: LabResultsViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredResults = labResults.filter((result) => {
    const matchesSearch =
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || result.status === statusFilter
    const matchesCategory = categoryFilter === "all" || result.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const uniqueCategories = Array.from(new Set(labResults.map((result) => result.category)))

  const getStatusIcon = (status: "normal" | "abnormal" | "critical") => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "abnormal":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (status: "normal" | "abnormal" | "critical") => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-50 border-green-200"
      case "abnormal":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
    }
  }

  const getResultStatusBadge = (status: "pending" | "completed" | "reviewed") => {
    const variants = {
      pending: "secondary",
      completed: "default",
      reviewed: "outline",
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Lab Results - {patientName}</h3>
          <p className="text-muted-foreground">View and review laboratory test results</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search test names or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Results */}
      <div className="grid gap-4">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Lab Results Found</h3>
                <p className="text-muted-foreground">
                  {labResults.length === 0
                    ? "No lab results have been recorded for this patient."
                    : "No results match your current filters."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TestTube className="w-5 h-5" />
                      <span>{result.testName}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline">{result.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Ordered: {new Date(result.orderDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Result: {new Date(result.resultDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">{getResultStatusBadge(result.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Ordered by: {result.providerName}</span>
                </div>

                {/* Test Results */}
                <div className="space-y-3">
                  <h4 className="font-medium">Test Results</h4>
                  <div className="space-y-2">
                    {result.results.map((test, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getStatusColor(test.status)} flex justify-between items-center`}
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <span className="font-medium">{test.name}</span>
                            <p className="text-sm opacity-75">Reference: {test.referenceRange}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {test.value} {test.unit}
                          </div>
                          <div className="text-xs capitalize">{test.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Results Alert */}
                {result.results.some((test) => test.status === "critical") && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Critical Results Detected</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This lab result contains critical values that require immediate attention.
                    </p>
                  </div>
                )}

                {/* Notes */}
                {result.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium mb-1">Notes</h5>
                    <p className="text-sm">{result.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {result.status === "completed" && (
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      Mark as Reviewed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
