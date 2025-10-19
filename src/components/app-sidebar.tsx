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

const data = {
  teams: [
    {
      name: "Loading",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },

  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Website Overview",
      url: "/dashboard/projects/website",
      icon: Globe,
      isActive: false,
      items: [
        {
          title: "Features",
          url: "/dashboard/projects/website/features",
        },
        {
          title: "Analytics",
          url: "/dashboard/projects/website/analytics",
        },
        {
          title: "Subscription",
          url: "/dashboard/projects/website/subscription",
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
      url: "/dashboard/projects/website/articles",
      icon: WholeWord,
    },
    {
      name: "Pages",
      url: "/dashboard/projects/website/pages",
      icon:Book
    }

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { site, loading } = useSite()

  if (site && !loading) {
    data.teams[0].name = site.title || "Your website"
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
