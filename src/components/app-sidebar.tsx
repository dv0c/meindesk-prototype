"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Book,
  GalleryVerticalEnd,
  Globe,
  Home,
  LifeBuoy,
  Send,
  WholeWord,
  Menu
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"
import { useTeams } from "@/hooks/useTeams"
import { Skeleton } from "./ui/skeleton"
import { TeamSwitcher } from "./team-switcher"
import { NavProjects } from "./nav-projects"

const data = {
  teams: [],
  navMain: [
    { title: "Home", url: "/", icon: Home, isActive: true },
    {
      title: "Website Overview",
      url: "/projects/website",
      icon: Globe,
      isActive: false,
      items: [
        { title: "Features", url: "/projects/website/features" },
        { title: "Analytics", url: "/projects/website/analytics" },
        { title: "Subscription", url: "/projects/website/subscription" },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
  projects: [
    { name: "Articles", url: "/projects/website/articles", icon: WholeWord },
    { name: "Pages", url: "/projects/website/pages", icon: Book },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { teams, loading: loadingTeams } = useTeams()
  const [hovered, setHovered] = useState(false)
  const [toggled, setToggled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const collapseTimer = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768) // md breakpoint
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!loadingTeams && teams?.length) {
    data.teams = teams.map((t) => ({
      name: t.title || "Untitled Team",
      logo: GalleryVerticalEnd,
      plan: t.subscription?.billing_cycle || "Free",
      id: t.id,
    }))
  }

  const handleMouseEnter = () => {
    if (isMobile) return // disable hover on mobile
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setHovered(true)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    collapseTimer.current = setTimeout(() => setHovered(false), 400)
  }

  const handleToggle = () => {
    setToggled((prev) => !prev)
  }

  // open sidebar if hovered (desktop) or toggled (any device)
  const isOpen = isMobile ? toggled : hovered || toggled

  return (
    <div className="relative h-full flex">

      <div
        className="group relative h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`transition-[width] duration-300 ease-in-out overflow-hidden h-full ${
            isOpen ? "w-64" : "w-0 md:w-0"
          }`}
        >
          <Sidebar
            variant="floating"
            className={`h-full overflow-hidden transition-all duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            {...props}
          >
            <SidebarHeader>
              {!teams.length ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <TeamSwitcher teams={data.teams} />
              )}
            </SidebarHeader>

            <SidebarContent>
              <NavMain items={data.navMain} />
              <NavProjects projects={data.projects} />
              <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>

            <SidebarFooter>
              <NavUser />
            </SidebarFooter>
          </Sidebar>
        </div>
      </div>
    </div>
  )
}
