import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone } from "lucide-react"

export function BillingHistory() {
  // Mock data - replace with actual billing history
  const billingHistory = [
    {
      id: "1",
      date: "October 15, 2025",
      amount: 49.99,
      status: "paid",
      reference: "IRIS-2025-10-001",
    },
    {
      id: "2",
      date: "September 15, 2025",
      amount: 49.99,
      status: "paid",
      reference: "IRIS-2025-09-001",
    },
    {
      id: "3",
      date: "August 15, 2025",
      amount: 49.99,
      status: "paid",
      reference: "IRIS-2025-08-001",
    },
    {
      id: "4",
      date: "July 15, 2025",
      amount: 49.99,
      status: "paid",
      reference: "IRIS-2025-07-001",
    },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>Your payment history via Iris</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {billingHistory.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium">{transaction.date}</p>
                  <Badge
                    variant={transaction.status === "paid" ? "default" : "secondary"}
                    className="bg-accent text-accent-foreground"
                  >
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{transaction.reference}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold">${transaction.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
