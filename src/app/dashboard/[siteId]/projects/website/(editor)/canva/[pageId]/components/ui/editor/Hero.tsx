"use client"
import { Button } from "@/components/ui/button"

export interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  backgroundImage?: string
  textAlign?: "left" | "center" | "right"
}

export default function Hero({
  title = "Welcome to Our Platform",
  subtitle = "Build Something Amazing",
  description = "Create beautiful websites with our powerful page builder. Drag and drop to design your perfect site.",
  primaryButtonText = "Get Started",
  secondaryButtonText = "Learn More",
  backgroundImage,
  textAlign = "center",
}: HeroProps) {
  return (
    <section
      className="relative py-20 px-4 md:py-32"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className={`max-w-6xl mx-auto text-${textAlign}`}>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-3">{subtitle}</p>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{description}</p>
        <div className="flex gap-4 justify-center items-center">
          <Button size="lg">{primaryButtonText}</Button>
          <Button size="lg" variant="outline">
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </section>
  )
}

export const HeroMetadata = {
  name: "Hero",
  category: "layout",
  props: {
    title: { type: "string", default: "Welcome to Our Platform" },
    subtitle: { type: "string", default: "Build Something Amazing" },
    description: { type: "string", default: "Create beautiful websites with our powerful page builder." },
    primaryButtonText: { type: "string", default: "Get Started" },
    secondaryButtonText: { type: "string", default: "Learn More" },
    backgroundImage: { type: "string", default: "" },
    textAlign: { type: "select", options: ["left", "center", "right"], default: "center" },
  },
}
