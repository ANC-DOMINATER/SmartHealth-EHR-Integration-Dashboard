"use client"

import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"

export type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationToastProps {
  type: NotificationType
  title: string
  message?: string
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colors = {
  success: "text-green-600",
  error: "text-destructive",
  warning: "text-yellow-600",
  info: "text-blue-600",
}

export function useNotification() {
  const { toast } = useToast()

  const showNotification = ({ type, title, message }: NotificationToastProps) => {
    const Icon = icons[type]

    toast({
      title: (
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${colors[type]}`} />
          <span>{title}</span>
        </div>
      ),
      description: message,
    })
  }

  return { showNotification }
}
