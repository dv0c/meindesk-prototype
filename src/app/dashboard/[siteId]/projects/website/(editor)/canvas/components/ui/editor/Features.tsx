"use client"
import { Zap, Shield, Rocket } from "lucide-react"

export interface FeaturesProps {
  title?: string
  subtitle?: string
  columns?: number
}

export default function Features({
  title = "Amazing Features",
  subtitle = "Everything you need to succeed",
  columns = 3,
}: FeaturesProps) {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed and performance from the ground up.",
    },
    {
      icon: Shield,
      title: "Secure by Default",
      description: "Enterprise-grade security to protect your data.",
    },
    {
      icon: Rocket,
      title: "Easy to Use",
      description: "Intuitive interface that anyone can master.",
    },
  ]

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const FeaturesMetadata = {
  name: "Features",
  category: "layout",
  props: {
    title: { type: "string", default: "Amazing Features" },
    subtitle: { type: "string", default: "Everything you need to succeed" },
    columns: { type: "number", default: 3 },
  },
}
