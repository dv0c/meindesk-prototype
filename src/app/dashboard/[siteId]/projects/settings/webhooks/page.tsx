import { getActiveTeam } from "@/lib/actions/helpers/team"
import { redirect } from "next/navigation"
import { WebhookSettings } from "@/components/Settings/WebhookSettings"

export default async function WebhooksSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const team = await getActiveTeam(siteId)

  if (!team) return redirect("/dashboard")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Webhooks</h3>
        <p className="text-sm text-muted-foreground">
          Configure webhook endpoints to automatically revalidate your frontend
          when content changes in the CMS.
        </p>
      </div>

      <WebhookSettings siteId={siteId} />
    </div>
  )
}
