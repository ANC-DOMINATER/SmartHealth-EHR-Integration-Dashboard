"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface PatientSearchFormProps {
  onSearch: (searchTerm: string, searchType: "name" | "id") => void
  isLoading: boolean
}

export function PatientSearchForm({ onSearch, isLoading }: PatientSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"name" | "id">("name")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim(), searchType)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Search Patients</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-term">Search Term</Label>
              <Input
                id="search-term"
                type="text"
                placeholder="Enter patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="sm:w-48">
              <Label>Search By</Label>
              <RadioGroup
                value={searchType}
                onValueChange={(value) => setSearchType(value as "name" | "id")}
                className="flex flex-row mt-2 space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="name" id="name" />
                  <Label htmlFor="name">Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="id" id="id" />
                  <Label htmlFor="id">Patient ID</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !searchTerm.trim()}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
