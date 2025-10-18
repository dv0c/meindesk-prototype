"use client"

import {
  AudioWaveform,
  ChartArea,
  Command,
  GalleryVerticalEnd,
  Globe,
  Home,
  LifeBuoy,
  Send
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
import { TeamSwitcher } from "./team-switcher"
import { useSite } from "@/hooks/useSite"

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
          title: "Pages",
          url: "/dashboard/projects/website/pages",
        },
        {
          title: "Articles",
          url: "/dashboard/projects/website/articles",
        },
        {
          title: "Subscription",
          url: "/dashboard/projects/website/subscription",
        },

      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: ChartArea,
      isActive: true,
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
    // {
    //   name: "Your website",
    //   url: "/dashboard/projects/website",
    //   icon: Globe,
    // },

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const {site, loading} = useSite()
  
  if (site && !loading) {
    data.teams[0].name = site.title || "Your website"
  }

  console.log(site)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
