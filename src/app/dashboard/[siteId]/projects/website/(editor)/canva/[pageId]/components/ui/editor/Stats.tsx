"use client"

interface StatItem {
  label: string
  value: string
}

interface StatsProps {
  stats?: StatItem[] | string | Record<string, any>
  className?: string
  [key: string]: any
}

export function Stats({
  stats = [
    { label: "Happy Customers", value: "10K+" },
    { label: "Projects Completed", value: "500+" },
    { label: "Team Members", value: "50+" },
    { label: "Years in Business", value: "5+" },
  ],
  className = "",
  ...props
}: StatsProps) {
  let safeStats: StatItem[] = []

  try {
    if (typeof stats === "string") {
      // try parsing if it was stringified
      const parsed = JSON.parse(stats)
      if (Array.isArray(parsed)) safeStats = parsed
      else if (parsed && typeof parsed === "object") safeStats = Object.values(parsed)
    } else if (Array.isArray(stats)) {
      safeStats = stats
    } else if (stats && typeof stats === "object") {
      // handle single object case
      safeStats = [stats as StatItem]
    }
  } catch {
    safeStats = []
  }

  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${className}`} {...props}>
      {safeStats.map((stat, index) => (
        <div key={index} className="rounded-lg bg-muted p-6 text-center">
          <div className="mb-2 text-3xl font-bold text-primary">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
