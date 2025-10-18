import { BillingHistory } from "@/components/subscription/billing-history"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { WebsiteInfo } from "@/components/subscription/website-info"
import { getSite } from "@/lib/actions/helpers/site"

const page = async () => {
    const data = await getSite()
    if (!data?.site) return <div>Site not found</div>
  return <div>
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{data.site.title} | Website</h2>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>

        <div className="mb-8">
          <WebsiteInfo />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <SubscriptionCard />
        </div>

        <BillingHistory />
      </main>
    </div>
  </div>
}

export default page