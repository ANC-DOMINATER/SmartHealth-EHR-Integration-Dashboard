"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { InsuranceEligibility } from "./billing-admin"
import { Shield, Search, CheckCircle, XCircle, Clock, AlertTriangle, Calendar } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface InsuranceEligibilityCheckerProps {
  eligibilityData: InsuranceEligibility[]
}

export function InsuranceEligibilityChecker({ eligibilityData }: InsuranceEligibilityCheckerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<InsuranceEligibility[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    // Simulate API call
    setTimeout(() => {
      const results = eligibilityData.filter(
        (data) =>
          data.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(results)
      setIsLoading(false)
    }, 1500)
  }

  const handleCheckEligibility = async (patientId: string) => {
    setIsLoading(true)
    // Simulate real-time eligibility check
    setTimeout(() => {
      console.log("Checking real-time eligibility for patient:", patientId)
      setIsLoading(false)
    }, 2000)
  }

  const getStatusIcon = (status: "active" | "inactive" | "pending" | "expired") => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "inactive":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
    }
  }

  const getStatusBadge = (status: "active" | "inactive" | "pending" | "expired") => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      expired: "bg-orange-100 text-orange-800 border-orange-200",
    }

    return (
      <Badge variant="outline" className={colors[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Insurance Eligibility Checker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-eligibility">Patient Name, ID, or Policy Number</Label>
              <Input
                id="search-eligibility"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter patient information..."
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isLoading || !searchTerm.trim()}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Eligibility
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Eligibility Data Found</h3>
                  <p className="text-muted-foreground">
                    No insurance eligibility information found for "{searchTerm}".
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((eligibility) => (
              <Card key={eligibility.patientId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>{eligibility.patientName}</span>
                      </CardTitle>
                      <p className="text-muted-foreground">Patient ID: {eligibility.patientId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(eligibility.eligibilityStatus)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckEligibility(eligibility.patientId)}
                        disabled={isLoading}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Insurance Information */}
                  <div>
                    <h4 className="font-medium mb-3">Insurance Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Provider:</span>
                        <p className="font-medium">{eligibility.insuranceProvider}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Policy Number:</span>
                        <p className="font-medium">{eligibility.policyNumber}</p>
                      </div>
                      {eligibility.groupNumber && (
                        <div>
                          <span className="text-muted-foreground">Group Number:</span>
                          <p className="font-medium">{eligibility.groupNumber}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(eligibility.eligibilityStatus)}
                          <span className="font-medium capitalize">{eligibility.eligibilityStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Dates */}
                  <div>
                    <h4 className="font-medium mb-3">Coverage Period</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Effective Date:</span>
                        <p className="font-medium">{new Date(eligibility.effectiveDate).toLocaleDateString()}</p>
                      </div>
                      {eligibility.expirationDate && (
                        <div>
                          <span className="text-muted-foreground">Expiration Date:</span>
                          <p className="font-medium">{new Date(eligibility.expirationDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  {(eligibility.copay || eligibility.deductible) && (
                    <div>
                      <h4 className="font-medium mb-3">Financial Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {eligibility.copay && (
                          <div>
                            <span className="text-muted-foreground">Copay:</span>
                            <p className="font-medium">${eligibility.copay}</p>
                          </div>
                        )}
                        {eligibility.deductible && (
                          <div>
                            <span className="text-muted-foreground">Deductible:</span>
                            <p className="font-medium">${eligibility.deductible}</p>
                          </div>
                        )}
                        {eligibility.deductibleMet && (
                          <div>
                            <span className="text-muted-foreground">Deductible Met:</span>
                            <p className="font-medium">${eligibility.deductibleMet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium mb-3">Covered Benefits</h4>
                    <div className="space-y-2">
                      {eligibility.benefits.map((benefit, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-2">
                            {benefit.covered ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{benefit.service}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {benefit.copay && `$${benefit.copay} copay`}
                            {benefit.coinsurance && `${benefit.coinsurance}% coinsurance`}
                            {benefit.notes && ` - ${benefit.notes}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Last Checked */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Last checked: {new Date(eligibility.lastChecked).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
