"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { TemplateSchema } from "@/types/TemplateSchema"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { GlobalSection } from "./sections/global-section"
import { ThemeSection } from "./sections/theme-section"
import { HeaderSection } from "./sections/header-section"
import { SectionsPanel } from "./sections/sections-panel"
import { FooterSection } from "./sections/footer-section"
import { Save, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

interface MainEditorProps {
  activeSection: string
  siteId: string
  onChangesMade: () => void
  hasChanges: boolean
  onSaved: () => void
}

const SECTION_TITLES: Record<string, { title: string; description: string }> = {
  global: {
    title: "Global Settings",
    description: "Configure site-wide settings and defaults"
  },
  theme: {
    title: "Theme Configuration",
    description: "Customize colors, fonts, and visual appearance"
  },
  header: {
    title: "Header & Navigation",
    description: "Manage site navigation and branding"
  },
  sections: {
    title: "Page Sections",
    description: "Configure and manage page section components"
  },
  footer: {
    title: "Footer Links",
    description: "Manage footer content and links"
  }
}

export function MainEditor({
  activeSection,
  siteId,
  onChangesMade,
  hasChanges,
  onSaved,
}: MainEditorProps) {
  const [schema, setSchema] = useState<TemplateSchema | null>(null)
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schemaRes, pagesRes] = await Promise.all([
          axios.get(`/api/team/${siteId}/template-schema`),
          axios.get<any[]>(`/api/team/${siteId}/pages`),
        ])
        setSchema(schemaRes.data.template_schema)
        setPages(pagesRes.data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load template configuration")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [siteId])

  const handleChange = (path: string, value: any) => {
    setSchema((prev) => {
      if (!prev) return prev
      const clone = JSON.parse(JSON.stringify(prev))
      const keys = path.split(".")
      let obj: any = clone
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return clone
    })
    onChangesMade()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put(`/api/team/${siteId}/template-schema`, schema)
      toast.success("Template saved successfully!", {
        description: "Your changes have been applied.",
      })
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error("Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background via-background to-card/20">
        <div className="text-center">
          <Spinner className="mx-auto mb-6" />
          <p className="text-muted-foreground font-medium">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background via-background to-card/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="text-destructive" size={32} />
          </div>
          <div>
            <p className="text-foreground font-semibold">Template not found</p>
            <p className="text-sm text-muted-foreground">Unable to load schema</p>
          </div>
        </div>
      </div>
    )
  }

  const sectionInfo = SECTION_TITLES[activeSection] || { title: "Editor", description: "" }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-background via-background to-card/20">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-xl font-bold text-foreground truncate">
              {sectionInfo.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {sectionInfo.description}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={cn(
            "gap-2 transition-all duration-300 flex-shrink-0 ml-4",
            hasChanges
              ? "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
              : "opacity-60"
          )}
        >
          <Save size={18} />
          <span className="hidden sm:inline">
            {saving ? "Saving..." : "Save"}
          </span>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeSection === "global" && (
            <GlobalSection schema={schema} handleChange={handleChange} />
          )}
          {activeSection === "theme" && (
            <ThemeSection schema={schema} handleChange={handleChange} />
          )}
          {activeSection === "header" && (
            <HeaderSection
              schema={schema}
              handleChange={handleChange}
              pages={pages}
            />
          )}
          {activeSection === "sections" && (
            <SectionsPanel schema={schema} handleChange={handleChange} />
          )}
          {activeSection === "footer" && (
            <FooterSection schema={schema} handleChange={handleChange} />
          )}
        </div>
      </div>
    </div>
  )
}
