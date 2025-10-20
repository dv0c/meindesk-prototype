import { BillingHistory } from "@/components/subscription/billing-history"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { WebsiteInfo } from "@/components/subscription/website-info"
import { getSite } from "@/lib/actions/helpers/site"
import { getActiveTeam } from "@/lib/actions/helpers/team"

const page = async ({ params }: { params: { siteId: string } }) => {
  const data = await getActiveTeam(params.siteId)
  if (!data) return <div>Site not found</div>
  return <div>
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{data.title} | Website</h2>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>

        <div className="mb-8">
          <WebsiteInfo siteId={params.siteId} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <SubscriptionCard siteId={params.siteId} />
        </div>

        <BillingHistory />
      </main>
    </div>
  </div>
}

export default page