"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TEMPLATES, getTemplate } from "@/lib/templates"
import { useBuilderStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function TemplatesPanel() {
  const { setNodes } = useBuilderStore()
  const { toast } = useToast()

  const handleApplyTemplate = (templateId: string) => {
    if (confirm("This will replace your current layout. Are you sure?")) {
      const layout = getTemplate(templateId)
      setNodes(layout)
      toast({
        title: "Template Applied",
        description: "The template has been successfully loaded onto the canvas.",
      })
    }
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">Templates</CardTitle>
        <CardDescription>Start with a pre-made design</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="h-32 bg-muted flex items-center justify-center text-muted-foreground">
                  {template.name} Preview
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="secondary"
                    className="w-full text-xs h-8"
                    onClick={() => handleApplyTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
