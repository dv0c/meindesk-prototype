"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useBuilderStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export function GlobalSettingsPanel() {
  const { websiteSettings, updateWebsiteSettings } = useBuilderStore()
  const params = useParams()
  const siteId = params.siteId as string
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const isInitialMount = useRef(true)

  // Debounced save function
  const saveSettings = useCallback(async (settings: typeof websiteSettings) => {
    if (!siteId) return

    setSaveStatus('saving')
    try {
      const response = await fetch(`/api/v1/${siteId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error('Failed to save')

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [siteId])

  // Auto-save when settings change (skip initial mount)
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      if (siteId) {
        saveSettings(websiteSettings)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [websiteSettings, siteId, saveSettings])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Website Settings</h2>
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-3 w-3 text-destructive" />
                <span className="text-destructive">Error</span>
              </>
            )}
          </div>
        </div>
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
