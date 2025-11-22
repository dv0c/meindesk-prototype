"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useBuilderStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GlobalSettingsPanel() {
  const { websiteSettings, updateWebsiteSettings } = useBuilderStore()

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Website Settings</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">General</h3>
            <div className="space-y-2">
              <Label>Website Title</Label>
              <Input value={websiteSettings.title} onChange={(e) => updateWebsiteSettings({ title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={websiteSettings.description}
                onChange={(e) => updateWebsiteSettings({ description: e.target.value })}
              />
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-8 h-8 p-0 border-0"
                    value={websiteSettings.theme.primaryColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, primaryColor: e.target.value } })
                    }
                  />
                  <Input
                    value={websiteSettings.theme.primaryColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, primaryColor: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-8 h-8 p-0 border-0"
                    value={websiteSettings.theme.secondaryColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, secondaryColor: e.target.value } })
                    }
                  />
                  <Input
                    value={websiteSettings.theme.secondaryColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, secondaryColor: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-8 h-8 p-0 border-0"
                    value={websiteSettings.theme.backgroundColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, backgroundColor: e.target.value } })
                    }
                  />
                  <Input
                    value={websiteSettings.theme.backgroundColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, backgroundColor: e.target.value } })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Typography</h3>
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Input
                placeholder="e.g. Inter, sans-serif"
                value={websiteSettings.theme.fontFamily}
                onChange={(e) =>
                  updateWebsiteSettings({ theme: { ...websiteSettings.theme, fontFamily: e.target.value } })
                }
              />
            </div>
          </div>

          {/* Custom CSS */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Custom Code</h3>
            <div className="space-y-2">
              <Label>Global CSS</Label>
              <Textarea
                className="font-mono text-xs h-40"
                placeholder=".my-class { color: red; }"
                value={websiteSettings.globalCss || ""}
                onChange={(e) => updateWebsiteSettings({ globalCss: e.target.value })}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
