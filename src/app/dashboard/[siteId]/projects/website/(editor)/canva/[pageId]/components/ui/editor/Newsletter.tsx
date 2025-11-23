"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewsletterProps {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  className?: string
  [key: string]: any
}

export function Newsletter({
  title = "Subscribe to our Newsletter",
  description = "Get the latest updates and news delivered straight to your inbox.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  className = "",
  ...props
}: NewsletterProps) {
  const [email, setEmail] = useState("")

  return (
    <div
      className={`w-full rounded-lg bg-linear-to-r from-primary-foreground to-primary-foreground/70 p-8 text-white ${className}`}
      {...props}
    >
      <h3 className="mb-2 text-2xl font-bold">{title}</h3>
      <p className="mb-6 text-white/80">{description}</p>
      <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white dark:text-white text-black placeholder:text-gray-400"
        />
        <Button type="submit" variant="secondary" className="whitespace-nowrap">
          {buttonText}
        </Button>
      </form>
    </div>
  )
}
