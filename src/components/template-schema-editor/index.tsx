"use client"

import { Menu, X } from 'lucide-react'
import { useState } from "react"
import { MainEditor } from "./main-editor"
import { Sidebar } from "./sidebar"

interface TemplateSchemaEditorProps {
  params: { siteId: string }
}

export function TemplateSchemaEditor({ params }: TemplateSchemaEditorProps) {
  const [activeSection, setActiveSection] = useState("global")
  const [hasChanges, setHasChanges] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex  bg-background text-foreground overflow-hidden">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section)
            setMobileMenuOpen(false)
          }}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden border-b border-border bg-background/95 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Template Editor</h2>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <MainEditor
          activeSection={activeSection}
          siteId={params.siteId}
          onChangesMade={() => setHasChanges(true)}
          hasChanges={hasChanges}
          onSaved={() => setHasChanges(false)}
        />
      </div>
    </div>
  )
}
