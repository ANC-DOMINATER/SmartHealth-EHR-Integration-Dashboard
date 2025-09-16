"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { PatientBalance } from "./billing-admin"
import { CreditCard, Search, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react"

interface PatientBalanceOverviewProps {
  balanceData: PatientBalance[]
}

export function PatientBalanceOverview({ balanceData }: PatientBalanceOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBalances = balanceData.filter((balance) =>
    balance.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalOutstanding = balanceData.reduce((sum, balance) => sum + balance.totalBalance, 0)
  const totalInsuranceBalance = balanceData.reduce((sum, balance) => sum + balance.insuranceBalance, 0)
  const totalPatientBalance = balanceData.reduce((sum, balance) => sum + balance.patientBalance, 0)

  const getTransactionIcon = (type: "charge" | "payment" | "adjustment") => {
    switch (type) {
      case "charge":
        return <TrendingUp className="w-4 h-4 text-red-600" />
      case "payment":
        return <TrendingDown className="w-4 h-4 text-green-600" />
      case "adjustment":
        return <DollarSign className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusBadge = (status: "pending" | "processed" | "denied") => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processed: "bg-green-100 text-green-800 border-green-200",
      denied: "bg-red-100 text-red-800 border-red-200",
    }

    return (
      <Badge variant="outline" className={colors[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInsuranceBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending insurance payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPatientBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Patient responsibility</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Patient Balances</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredBalances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No patient balances found.</p>
              </div>
            ) : (
              filteredBalances.map((balance) => (
                <Card key={balance.patientId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{balance.patientName}</CardTitle>
                        <p className="text-muted-foreground">Patient ID: {balance.patientId}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${balance.totalBalance.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Total Balance</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Balance Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Insurance Balance</div>
                        <div className="text-lg font-semibold">${balance.insuranceBalance.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Patient Balance</div>
                        <div className="text-lg font-semibold">${balance.patientBalance.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Last Payment */}
                    {balance.lastPayment && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-green-800">Last Payment</div>
                            <div className="text-xs text-green-600">
                              {new Date(balance.lastPayment.date).toLocaleDateString()} via {balance.lastPayment.method}
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-green-800">
                            ${balance.lastPayment.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Transactions */}
                    <div>
                      <h4 className="font-medium mb-3">Recent Transactions</h4>
                      <div className="space-y-2">
                        {balance.transactions.slice(0, 5).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex justify-between items-center p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <div className="font-medium">{transaction.description}</div>
                                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${
                                  transaction.amount > 0 ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                              </div>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        View Full History
                      </Button>
                      <Button size="sm">Record Payment</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
