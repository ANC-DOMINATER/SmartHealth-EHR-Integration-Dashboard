"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Users, Calendar, CreditCard, X, Activity, Stethoscope, ClipboardList } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Clinical", href: "/clinical", icon: Stethoscope },
  { name: "Billing", href: "/billing", icon: CreditCard },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-soft-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">EHR Dashboard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group hover-lift",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 mr-3 transition-transform duration-200",
                        isActive ? "" : "group-hover:scale-105",
                      )}
                    />
                    <span>{item.name}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors duration-200">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-soft">
              <span className="text-sm font-semibold text-accent-foreground">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Dr. Smith</p>
              <p className="text-xs text-muted-foreground truncate">Healthcare Provider</p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full" />
          </div>
        </div>
      </div>
    </>
  )
}
