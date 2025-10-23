"use client"

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
import {
  Book,
  GalleryVerticalEnd,
  Globe,
  Home,
  Image,
  LifeBuoy,
  List,
  Send,
  Settings,
  SidebarIcon,
  WholeWord
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { NavProjects } from "./nav-projects"
import { TeamSwitcher } from "./team-switcher"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

const data = {
  teams: [] as any,
  navMain: [
    { title: "Home", url: "/", icon: Home, isActive: true },
    {
      title: "Website Overview",
      url: '/projects/website/',
      icon: Globe,
      isActive: false,
      items: [
        { title: "Features", url: "/projects/website/features" },
        { title: "Analytics", url: "/projects/website/analytics" },
        { title: "Subscription", url: "/projects/website/subscription" },
      ],
    },
    { title: "Settings", url: "/projects/settings", icon: Settings, isActive: true },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
  projects: [
    { name: "Articles", url: "/projects/website/articles", icon: WholeWord },
    { name: "Pages", url: "/projects/website/pages", icon: Book },
    { name: "Categories", url: "/projects/website/categories", icon: List },
    { name: "Media Gallery", url: "/projects/website/media-gallery", icon: Image },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { teams, loading: loadingTeams } = useTeams()
  const [hovered, setHovered] = useState(false)
  const [toggled, setToggled] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const collapseTimer = useRef<NodeJS.Timeout | null>(null)
  const sidebarRef = useRef<HTMLDivElement | null>(null)

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ✅ Restore sidebar state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const savedState = localStorage.getItem("sidebarToggled")
    if (savedState !== null) {
      setToggled(savedState === "true")
    }
  }, [])

  // ✅ Save sidebar state to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("sidebarToggled", String(toggled))
  }, [toggled])

  // Load team data
  if (!loadingTeams && teams?.length) {
    data.teams = teams.map((t) => ({
      name: t.title || "Untitled Team",
      logo: GalleryVerticalEnd,
      plan: t.subscription?.billing_cycle || "Free",
      id: t.id,
    }))
  }

  const handleMouseEnter = () => {
    if (isMobile) return
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setHovered(true)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    collapseTimer.current = setTimeout(() => setHovered(false), 300)
  }

  const handleToggle = () => {
    setToggled((prev) => !prev)
  }

  // When sidebar is open, keep it open as long as cursor is in the left half
  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      const halfScreen = window.innerWidth / 2.8
      const isInLeftHalf = e.clientX <= halfScreen

      if (hovered && !isInLeftHalf) {
        if (collapseTimer.current) clearTimeout(collapseTimer.current)
        collapseTimer.current = setTimeout(() => setHovered(false), 400)
      } else if (hovered && isInLeftHalf) {
        if (collapseTimer.current) clearTimeout(collapseTimer.current)
        setHovered(true)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [hovered, isMobile])

  const isOpen = isMobile ? toggled : hovered || toggled

  return (
    <div className="relative h-full flex">
      <div
        ref={sidebarRef}
        className="group relative h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`transition-[width] duration-300 ease-in-out overflow-hidden h-full ${isOpen ? "w-64" : "w-0 md:w-0"
            }`}
        >
          <Sidebar
            variant={toggled ? "sidebar" : "floating"}
            className={`h-full overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"
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
              <Button
                onClick={handleToggle}
                variant="ghost"
                className="justify-start items-center"
              >
                <SidebarIcon className="w-6 h-6" />
                Sidebar View
              </Button>
              <NavUser />
            </SidebarFooter>
          </Sidebar>
        </div>
      </div>
    </div>
  )
}
