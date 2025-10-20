"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    id: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  // Extract current team/site ID from URL (assuming /dashboard/[siteId]/...)
  const currentId = React.useMemo(() => {
    const parts = pathname.split("/")
    return parts[2] || null
  }, [pathname])

  // Set initial active team
  const initialTeam =
    teams.find((team) => team.id === currentId) || teams[0] || null

  const [activeTeam, setActiveTeam] = React.useState(initialTeam)

  // Sync when user navigates
  React.useEffect(() => {
    const newActive =
      teams.find((team) => team.id === currentId) || teams[0] || null
    setActiveTeam(newActive)
  }, [currentId, teams])

  if (!activeTeam) return null

  // 🔥 Switch teams but preserve the rest of the path
  const handleTeamChange = (teamId: string) => {
    // @ts-ignore
    setActiveTeam(teams.find((t) => t.id === teamId) || null)

    const parts = pathname.split("/")

    // Look for "dashboard" index dynamically
    const dashboardIndex = parts.findIndex((part) => part === "dashboard")

    if (dashboardIndex !== -1) {
      // Ensure there's a slot for the teamId
      if (parts.length > dashboardIndex + 1) {
        parts[dashboardIndex + 1] = teamId
      } else {
        parts.push(teamId)
      }
    } else {
      // fallback if path is missing "dashboard"
      parts.splice(2, 0, teamId)
    }

    const newPath = parts.join("/")
    router.push(newPath)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>

            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamChange(team.id)}
                className={`gap-2 cursor-pointer p-2 ${
                  activeTeam.id === team.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : ""
                }`}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <Link href={"/setup"}>
              <DropdownMenuItem className="gap-2 cursor-pointer p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Setup a team
                </div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
