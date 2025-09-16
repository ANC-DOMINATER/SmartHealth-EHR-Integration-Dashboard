"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ModalDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function ModalDialog({ isOpen, onClose, title, description, children }: ModalDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
