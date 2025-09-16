"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BillingCode } from "./billing-admin"
import { FileText, Search, Filter, Edit, Plus, Calendar } from "lucide-react"

interface BillingCodesTableProps {
  billingCodes: BillingCode[]
}

export function BillingCodesTable({ billingCodes }: BillingCodesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredCodes = billingCodes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || code.category === categoryFilter
    const matchesStatus = statusFilter === "all" || code.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const uniqueCategories = Array.from(new Set(billingCodes.map((code) => code.category)))

  const getStatusBadge = (status: "active" | "inactive") => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
    }

    return (
      <Badge variant="outline" className={colors[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Billing Codes & Fee Schedule</h3>
          <p className="text-muted-foreground">Manage CPT codes, descriptions, and fee schedules</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Code
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Codes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search codes or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Billing Codes ({filteredCodes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No billing codes found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Standard Fee</TableHead>
                    <TableHead>Insurance Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={code.description}>
                          {code.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{code.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">${code.fee.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">
                        {code.insuranceRate ? `$${code.insuranceRate.toFixed(2)}` : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(code.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(code.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingCodes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingCodes.filter((code) => code.status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCategories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fee</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                billingCodes.filter((code) => code.status === "active").reduce((sum, code) => sum + code.fee, 0) /
                billingCodes.filter((code) => code.status === "active").length
              ).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
