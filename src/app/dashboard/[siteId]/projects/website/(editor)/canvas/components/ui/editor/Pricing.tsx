"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export interface PricingProps {
  title?: string
  price?: string
  period?: string
  description?: string
  buttonText?: string
}

export default function Pricing({
  title = "Pro Plan",
  price = "$29",
  period = "per month",
  description = "Perfect for growing businesses",
  buttonText = "Get Started",
}: PricingProps) {
  const features = ["Unlimited projects", "24/7 support", "Advanced analytics", "Custom domain", "API access"]

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-2">{period}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}

export const PricingMetadata = {
  name: "Pricing",
  category: "content",
  props: {
    title: { type: "string", default: "Pro Plan" },
    price: { type: "string", default: "$29" },
    period: { type: "string", default: "per month" },
    description: { type: "string", default: "Perfect for growing businesses" },
    buttonText: { type: "string", default: "Get Started" },
  },
}
