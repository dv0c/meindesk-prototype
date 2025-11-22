"use client"
import { Button } from "@/components/ui/button"

export interface CallToActionProps {
  title?: string
  description?: string
  buttonText?: string
  backgroundColor?: string
}

export default function CallToAction({
  title = "Ready to Get Started?",
  description = "Join thousands of users who are already building amazing things.",
  buttonText = "Start Free Trial",
  backgroundColor = "bg-primary",
}: CallToActionProps) {
  return (
    <section className={`py-16 px-4 ${backgroundColor}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">{title}</h2>
        <p className="text-lg text-primary-foreground/90 mb-8">{description}</p>
        <Button size="lg" variant="secondary">
          {buttonText}
        </Button>
      </div>
    </section>
  )
}

export const CallToActionMetadata = {
  name: "CallToAction",
  category: "layout",
  props: {
    title: { type: "string", default: "Ready to Get Started?" },
    description: { type: "string", default: "Join thousands of users who are already building amazing things." },
    buttonText: { type: "string", default: "Start Free Trial" },
    backgroundColor: { type: "string", default: "bg-primary" },
  },
}
