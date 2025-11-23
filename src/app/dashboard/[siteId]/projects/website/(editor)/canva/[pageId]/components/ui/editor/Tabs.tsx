"use client"

import { Children, isValidElement, type ReactNode, useState } from "react"
import { Tabs as TabsComponent, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TabItem {
  label: string
  content?: string
}

interface TabsProps {
  tabs?: TabItem[] | string
  className?: string
  children?: ReactNode
  [key: string]: any
}

export function Tabs({
  tabs = [
    { label: "Tab 1" },
    { label: "Tab 2" },
    { label: "Tab 3" },
  ],
  className = "",
  children,
  ...props
}: TabsProps) {
  // Parse JSON if provided as string
  let parsedTabs: TabItem[] = []
  try {
    parsedTabs = Array.isArray(tabs) ? tabs : JSON.parse(tabs)
  } catch {
    parsedTabs = []
  }

  // Group children by `data-tab` attribute
  const tabChildrenMap: Record<string, ReactNode[]> = {}
  Children.toArray(children).forEach((child) => {
    if (isValidElement(child)) {
      const tabLabel = child.props?.["data-tab"] || parsedTabs[0]?.label
      if (!tabChildrenMap[tabLabel]) tabChildrenMap[tabLabel] = []
      tabChildrenMap[tabLabel].push(child)
    }
  })

  if (!parsedTabs.length) {
    return (
      <div className={cn("p-6 border-2 border-dashed rounded-lg text-center text-muted-foreground", className)}>
        Tabs – Add tabs or drop content here
      </div>
    )
  }

  // State to track active tab (optional if TabsComponent supports controlled)
  const [activeTab, setActiveTab] = useState(parsedTabs[0].label)

  return (
    <TabsComponent
      defaultValue={parsedTabs[0].label}
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
      {...props}
    >
      <TabsList className="flex flex-wrap justify-start">
        {parsedTabs.map((tab, index) => (
          <TabsTrigger key={index} value={tab.label}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {parsedTabs.map((tab, index) => (
        <TabsContent key={index} value={tab.label} className="mt-4">
          {tabChildrenMap[tab.label]?.length
            ? tabChildrenMap[tab.label]
            : tab.content || <p className="text-muted-foreground text-sm">No content for {tab.label}</p>}
        </TabsContent>
      ))}
    </TabsComponent>
  )
}
