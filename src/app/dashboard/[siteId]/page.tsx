'use client'
import { useTeam } from "@/hooks/useTeam";

export default function Page() {
  const { team, loading } = useTeam()
  if (loading) return <div>Loading</div>
  if (!team?.id) {
    return <div className="flex flex-1 items-center justify-center p-4">
      <p className="text-muted-foreground">Site not found.</p>
    </div>
  }



  return <div className="flex flex-1 flex-col gap-4 p-4">
    Team name {team?.title}
  </div>
}
