"use client"
import { Alert as AlertComponent, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

interface AlertProps {
  type?: "info" | "success" | "warning" | "error"
  title?: string
  message?: string
  className?: string
  [key: string]: any
}

const alertIcons = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
}

const alertColors = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
  warning: "bg-yellow-50 border-yellow-200",
  error: "bg-red-50 border-red-200",
}

export function Alert({
  type = "info",
  title = "Alert Title",
  message = "This is an alert message",
  className = "",
  ...props
}: AlertProps) {
  return (
    <AlertComponent className={`${alertColors[type]} ${className}`} {...props}>
      {alertIcons[type]}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </AlertComponent>
  )
}
