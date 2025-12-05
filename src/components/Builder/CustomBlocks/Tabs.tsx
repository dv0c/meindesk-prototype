"use client"
import { Tabs as TabsComponent, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabsProps {
  className?: string
  [key: string]: any
}

export function Tabs({ className = "", ...props }: TabsProps) {
  return (
    <TabsComponent defaultValue="tab-1" className={className} {...props}>
      <TabsList>
        <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab-3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1" className="mt-4">
        Content for Tab 1
      </TabsContent>
      <TabsContent value="tab-2" className="mt-4">
        Content for Tab 2
      </TabsContent>
      <TabsContent value="tab-3" className="mt-4">
        Content for Tab 3
      </TabsContent>
    </TabsComponent>
  )
}
