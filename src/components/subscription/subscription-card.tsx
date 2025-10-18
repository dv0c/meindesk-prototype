import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Smartphone, TrendingUp } from "lucide-react"

export async function SubscriptionCard() {
  // Mock data - replace with actual subscription data
  const subscription = {
    plan: "Custom",
    status: "active",
    price: 20,
    billingCycle: "monthly",
    nextBillingDate: "November 15, 2025",
    daysUntilBilling: 29,
  }


  return (
    <Card className="col-span-full border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Current Subscription</CardTitle>
            <CardDescription>Your active plan details</CardDescription>
          </div>
          <Badge
            variant={subscription.status === "active" ? "default" : "secondary"}
            className="bg-accent text-accent-foreground"
          >
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Plan</span>
            </div>
            <p className="text-2xl font-bold">{subscription.plan}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Smartphone className="w-4 h-4" />
              <span>Price</span>
            </div>
            <p className="text-2xl font-bold">
              ${subscription.price}
              <span className="text-sm font-normal text-muted-foreground">/null</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span>Next Payment</span>
            </div>
            <p className="text-lg font-semibold">{subscription.nextBillingDate}</p>
            <p className="text-sm text-muted-foreground">in {subscription.daysUntilBilling} days</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-accent" />
              <span className="font-medium">Iris Payment</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments are processed via Iris through the business owner's phone. You will be contacted when payment is
              due.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
