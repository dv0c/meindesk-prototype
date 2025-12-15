"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useBuilderStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export function GlobalSettingsPanel() {
  const { websiteSettings, updateWebsiteSettings } = useBuilderStore()
  const params = useParams()
  const siteId = params.siteId as string
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [availableFonts, setAvailableFonts] = useState<Array<{ family: string, variable?: string }>>([{ family: 'System Default', variable: undefined }])
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

      if (!response.ok) {
        const error = await response.json()
        console.error('Save error:', error)
        throw new Error('Failed to save')
      }

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

  // Load available fonts from installed themes
  useEffect(() => {
    const loadFonts = async () => {
      if (!siteId) return

      try {
        // Fetch installed themes
        const response = await fetch(`/api/team/${siteId}/themes`)
        if (!response.ok) return

        const themes = await response.json()
        const fonts: Array<{ family: string, variable?: string }> = [{ family: 'System Default' }]

        // Collect all fonts from installed themes
        themes.forEach((theme: any) => {
          if (theme.fonts && Array.isArray(theme.fonts)) {
            theme.fonts.forEach((font: any) => {
              // Avoid duplicates
              if (!fonts.find(f => f.family === font.family)) {
                fonts.push({ family: font.family, variable: font.variable })
              }
            })
          }
        })

        setAvailableFonts(fonts)
      } catch (error) {
        console.error('Error loading fonts:', error)
      }
    }

    loadFonts()
  }, [siteId])

  return (
    <div className="h-full flex flex-col">
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
      <ScrollArea className="flex-1 h-full">
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
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                value={websiteSettings.favicon || ''}
                onChange={(e) => updateWebsiteSettings({ favicon: e.target.value })}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>

          <Separator />

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Theme</h3>
            <div className="space-y-2">
              <Label>Theme Mode</Label>
              <Select
                value={websiteSettings.theme.mode || 'light'}
                onValueChange={(value) => updateWebsiteSettings({ theme: { ...websiteSettings.theme, mode: value as 'light' | 'dark' | 'auto' } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (system preference)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Global Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-9 p-1 border-0"
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
                    className="w-12 h-9 p-1 border-0"
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
                    className="w-12 h-9 p-1 border-0"
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
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-9 p-1 border-0"
                    value={websiteSettings.theme.textColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, textColor: e.target.value } })
                    }
                  />
                  <Input
                    value={websiteSettings.theme.textColor}
                    onChange={(e) =>
                      updateWebsiteSettings({ theme: { ...websiteSettings.theme, textColor: e.target.value } })
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
              <Label>Heading Font</Label>
              <Select
                value={websiteSettings.theme.headingFont || 'System Default'}
                onValueChange={(value) =>
                  updateWebsiteSettings({ theme: { ...websiteSettings.theme, headingFont: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select heading font" />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts.map((font) => (
                    <SelectItem key={font.family} value={font.family}>
                      {font.family}
                      {font.variable && <span className="text-xs text-muted-foreground ml-2">({font.variable})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select
                value={websiteSettings.theme.bodyFont || 'System Default'}
                onValueChange={(value) =>
                  updateWebsiteSettings({ theme: { ...websiteSettings.theme, bodyFont: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body font" />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts.map((font) => (
                    <SelectItem key={font.family} value={font.family}>
                      {font.family}
                      {font.variable && <span className="text-xs text-muted-foreground ml-2">({font.variable})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Font Family <span className="text-xs text-muted-foreground">(fallback/custom)</span></Label>
              <Input
                placeholder="e.g. Inter, sans-serif"
                value={websiteSettings.theme.fontFamily}
                onChange={(e) =>
                  updateWebsiteSettings({ theme: { ...websiteSettings.theme, fontFamily: e.target.value } })
                }
              />
            </div>
          </div>

          <Separator />

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SEO Meta Tags</h3>
            <div className="space-y-2">
              <Label>Meta Title <span className="text-xs text-muted-foreground">(optional, defaults to Website Title)</span></Label>
              <Input
                value={websiteSettings.seo?.metaTitle || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, metaTitle: e.target.value } })}
                placeholder="Custom title for search engines"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{(websiteSettings.seo?.metaTitle || '').length}/200 characters</p>
            </div>
            <div className="space-y-2">
              <Label>Meta Description <span className="text-xs text-muted-foreground">(optional, defaults to Description)</span></Label>
              <Textarea
                value={websiteSettings.seo?.metaDescription || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, metaDescription: e.target.value } })}
                placeholder="Custom description for search engines"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{(websiteSettings.seo?.metaDescription || '').length}/500 characters</p>
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={websiteSettings.seo?.keywords || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, keywords: e.target.value } })}
                placeholder="seo, keywords, comma-separated"
              />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={websiteSettings.seo?.author || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, author: e.target.value } })}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-2">
              <Label>Robots</Label>
              <Select
                value={websiteSettings.seo?.robots || 'index, follow'}
                onValueChange={(value) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, robots: value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select robots directive" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index, follow">Index, Follow (default)</SelectItem>
                  <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                  <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                  <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={websiteSettings.seo?.canonical || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, canonical: e.target.value } })}
                placeholder="https://example.com/page"
              />
            </div>
          </div>

          <Separator />

          {/* Open Graph */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Open Graph (Social Media)</h3>
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input
                value={websiteSettings.seo?.ogTitle || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, ogTitle: e.target.value } })}
                placeholder="Title for social media shares"
              />
            </div>
            <div className="space-y-2">
              <Label>OG Description</Label>
              <Textarea
                value={websiteSettings.seo?.ogDescription || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, ogDescription: e.target.value } })}
                placeholder="Description for social media shares"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>OG Image URL</Label>
              <Input
                value={websiteSettings.seo?.ogImage || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, ogImage: e.target.value } })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>OG Type</Label>
              <Select
                value={websiteSettings.seo?.ogType || 'website'}
                onValueChange={(value) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, ogType: value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Twitter Card */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Twitter Card</h3>
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select
                value={websiteSettings.seo?.twitterCard || 'summary'}
                onValueChange={(value) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, twitterCard: value as any } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Twitter Site</Label>
              <Input
                value={websiteSettings.seo?.twitterSite || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, twitterSite: e.target.value } })}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter Creator</Label>
              <Input
                value={websiteSettings.seo?.twitterCreator || ''}
                onChange={(e) => updateWebsiteSettings({ seo: { ...websiteSettings.seo, twitterCreator: e.target.value } })}
                placeholder="@username"
              />
            </div>
          </div>

          <Separator />

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
