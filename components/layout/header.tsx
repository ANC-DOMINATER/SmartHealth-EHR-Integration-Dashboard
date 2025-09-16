"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bell, User, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-6 shadow-soft sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden mr-2 hover:bg-muted transition-colors duration-200"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Healthcare Dashboard</h1>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, appointments..."
            className="pl-10 bg-background border-border focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="relative hover:bg-muted transition-colors duration-200">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
          </div>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">DR</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 shadow-soft-lg" align="end" forceMount>
            <div className="px-3 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">Dr. Smith</p>
              <p className="text-xs text-muted-foreground">doctor@hospital.com</p>
            </div>
            <DropdownMenuItem className="hover:bg-muted transition-colors duration-200">
              <User className="mr-3 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-muted transition-colors duration-200">
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-destructive/10 text-destructive transition-colors duration-200">
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
