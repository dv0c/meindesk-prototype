import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone } from "lucide-react"


interface BillingHistoryProps {
  history: any[]
}

export function BillingHistory({ history }: BillingHistoryProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>Your payment history via Iris</CardDescription>
      </CardHeader>
      <CardContent className="">
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No billing history available.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <Badge
                      variant={transaction.status === "paid" ? "default" : "secondary"}
                      className="bg-accent text-accent-foreground"
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3 h-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{transaction.description || "Subscription Payment"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold">{transaction.currency === 'EUR' ? '€' : '$'}{transaction.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
