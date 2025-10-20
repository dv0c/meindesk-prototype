"use client"

import {
  Book,
  GalleryVerticalEnd,
  Globe,
  Home,
  LifeBuoy,
  Send,
  WholeWord
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"
import { useSite } from "@/hooks/useSite"
import { NavProjects } from "./nav-projects"
import { TeamSwitcher } from "./team-switcher"
import { useTeam } from "@/hooks/useTeam"
import { useTeams } from "@/hooks/useTeams"
import { Skeleton } from "./ui/skeleton"

const data = {
  teams: [
    {
      name: "",
      logo: GalleryVerticalEnd,
      plan: "",
      id: ""
    },

  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Website Overview",
      url: "/projects/website",
      icon: Globe,
      isActive: false,
      items: [
        {
          title: "Features",
          url: "/projects/website/features",
        },
        {
          title: "Analytics",
          url: "/projects/website/analytics",
        },
        {
          title: "Subscription",
          url: "/projects/website/subscription",
        },
      ],
    },


  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Articles",
      url: "/projects/website/articles",
      icon: WholeWord,
    },
    {
      name: "Pages",
      url: "/projects/website/pages",
      icon: Book
    }

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { teams, loading: loadingTeams } = useTeams()

  if (!loadingTeams && teams?.length) {
    data.teams = [
      // ...data.teams, // keep your default entry
      ...teams.map((t) => ({
        name: t.title || "Untitled Team",
        logo: GalleryVerticalEnd, // fallback icon
        plan: t.subscription?.billing_cycle || "Free", // or "Enterprise"
        id: t.id
      })),
    ]
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        {!teams.length ?
          <Skeleton className="h-12 w-full" />
          : (
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
  )
}
