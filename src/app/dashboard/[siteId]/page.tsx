'use client'
import NotFound from "@/app/not-found";
import { DashboardSkeleton } from "@/components/DashboardSkeletonHomepage";
import QuickActions from "@/components/QuickActions";
import RecentContentView from "@/components/RecentContentView";
import StatsCards from "@/components/StatsCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { useTeam } from "@/hooks/useTeam";
import { Ghost, TrendingUp, X } from "lucide-react";
import { notFound } from "next/navigation";
export default function Page() {
  const { team, loading } = useTeam()
  if (loading) return <DashboardSkeleton />

  if (!team?.id) {
    notFound()
  }

  return <div>
    <main className="flex-1 p-6">
      <StatsCards siteId={team.id} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions features={team.features} siteId={team.id} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Activity
            </CardTitle>
            <CardDescription>Recent content updates</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New article published</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-500/10">
                  <FileIcon className="size-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Page updated</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-green-500/10">
                  <ImageIcon className="size-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Images uploaded</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div> */}
            <Empty>
              <EmptyTitle><X /></EmptyTitle>
              <EmptyDescription>Recent activity is disabled.</EmptyDescription>
              <EmptyContent>
                <Button variant={'outline'}>Visit Analytics for activity</Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
        <RecentContentView siteId={team.id} />
        <Card className="h-full w-full">
          <Empty>
            <EmptyTitle><Ghost /></EmptyTitle>
            <EmptyDescription>This section is coming soon.</EmptyDescription>
          </Empty>
        </Card>
      </div>
    </main>
  </div>
}



