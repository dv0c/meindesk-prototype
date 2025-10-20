"use client"

import {
  Folder,
  MoreHorizontal,
  Plus,
  type LucideIcon
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTeam } from "@/hooks/useTeam"
import { Skeleton } from "./ui/skeleton"
import Link from "next/link"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()
  const siteId = useTeam().team?.id
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Content Managment</SidebarGroupLabel>
      <SidebarMenu>
        {siteId !== undefined ? projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={'/dashboard/' + siteId + '/' + item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground" />
                  <span>View {item.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="text-muted-foreground" />
                  <span>Create {item.name}</span>
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator /> */}
                {/* <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )) : Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="w-full h-5 mb-2" />
          ))}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
