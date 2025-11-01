import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-5">
      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="size-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions Skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded border p-4">
                  <div className="flex items-center justify-between">
                    <div className="size-5 animate-pulse rounded bg-muted" />
                    <div className="size-4 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="size-8 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Content Skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 animate-pulse rounded-md bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
