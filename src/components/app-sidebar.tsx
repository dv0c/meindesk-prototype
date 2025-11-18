"use client"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar"
import { useTeams } from "@/hooks/useTeams"
import {
  FileIcon,
  FileText,
  Folder,
  GalleryVerticalEnd,
  Globe,
  Home,
  Image,
  LifeBuoy,
  Rss,
  Send,
  Settings,
  SidebarIcon
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { NavProjects } from "./nav-projects"
import { TeamSwitcher } from "./team-switcher"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { useTeam } from "@/hooks/useTeam"
import { NavRSS } from "./nav-rss"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { teams, loading: loadingTeams } = useTeams()
  const { team: activeTeam } = useTeam()
  const [hovered, setHovered] = useState(false)
  const {newOpen, setNewOpen} = useSidebar()
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

  // Restore sidebar state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const savedState = localStorage.getItem("sidebarnewOpen")
    if (savedState !== null) setNewOpen(savedState === "true")
  }, [])

  // Save sidebar state
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("sidebarnewOpen", String(newOpen))
  }, [newOpen])

  // Handle hover toggle
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

  // @ts-ignore
  const handleToggle = () => setNewOpen((prev) => !prev)

  // Sidebar open logic
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

  const isOpen = isMobile ? newOpen : hovered || newOpen

  // Default nav and projects
  const defaultNavMain = [
    { title: "Home", url: "/", icon: Home, isActive: true },
    {
      title: "Website Overview",
      url: '/projects/website/',
      icon: Globe,
      isActive: false,
      items: [
        { title: "Schema", url: "/projects/settings/template-schema" },
        { title: "Features", url: "/projects/website/features" },
        { title: "Analytics", url: "/projects/website/analytics" },
        { title: "Subscription", url: "/projects/website/subscription" },
      ],
    },
    { title: "Settings", url: "/projects/settings", icon: Settings, isActive: true },
  ]
  const rsscontent = [
    { title: "RSS Feed", url: "projects/website/rss/my-feed", icon: Rss, isActive: false, items: [
      { title: "My Feed", url: "projects/website/rss/my-feed" },
      // { title: "Add New Feed", url: "/rss/feeds/new" },
    ] },
  ]

  // Build filtered data based on features
  const filteredData = React.useMemo(() => {
    if (!teams?.length || !activeTeam) {
      return { navMain: defaultNavMain, projects: null, teams: [], rss: rsscontent }
    }

    // Use the active team instead of teams[0]
    const features = activeTeam.features || {}

    // Filter projects based on active team features
    const projects = [
      features.articles && { name: "Articles", url: "/projects/website/articles", icon: FileText },
      features.pages && { name: "Pages", url: "/projects/website/pages", icon: FileIcon },
      features.categories && { name: "Categories", url: "/projects/website/categories", icon: Folder },
      features.media && { name: "Media Gallery", url: "/projects/website/media-gallery", icon: Image },
    ].filter(Boolean)

    // Filter navMain submenus based on features
    const navMain = defaultNavMain.map((navItem) => {
      if (!navItem.items) return navItem
      return {
        ...navItem,
        items: navItem.items.filter((item) => {
          if (item.title === "Analytics" && !features.analytics) return false
          if (item.title === "Articles" && !features.articles) return false
          return true
        }),
      }
    })

    const rss = features.media ? rsscontent : []

    // Map teams for TeamSwitcher
    const mappedTeams = teams.map((t) => ({
      name: t.title || "Untitled Team",
      logo: GalleryVerticalEnd,
      plan: t.subscription?.billing_cycle || "Free",
      id: t.id,
    }))

    return { navMain, projects, teams: mappedTeams, rss }
  }, [teams, activeTeam])

  return (
    <div className="relative h-full flex">
      <div
        ref={sidebarRef}
        className="group relative h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`transition-[width] duration-300 ease-in-out overflow-hidden h-full ${isOpen ? "w-64" : "w-0 md:w-0"}`}
        >
          <Sidebar
            variant={newOpen ? "inset" : "floating"}
            className={`h-full overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
            {...props}
          >
            <SidebarHeader>
              {!teams.length || !activeTeam ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <TeamSwitcher teams={filteredData.teams} />
              )}
            </SidebarHeader>

            <SidebarContent>
              <NavMain items={filteredData.navMain} />
              {/* @ts-ignore */}
              <NavProjects projects={filteredData.projects} />
              <NavRSS items={filteredData.rss} />
              <NavSecondary items={[
                { title: "Support", url: "#", icon: LifeBuoy },
                { title: "Feedback", url: "#", icon: Send },
              ]} className="mt-auto" />
              
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


export const ToggleSidebar = () => {
  const {toggleNewSidebar} = useSidebar()
  return (
    <Button
      onClick={toggleNewSidebar}
      variant="ghost"
      className="justify-start items-center"
    >
      <SidebarIcon className="w-6 h-6" />
    </Button>
  )
}