"use client"

import type { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Settings2, Code } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface SectionsPanelProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
}

export function SectionsPanel({ schema, handleChange }: SectionsPanelProps) {
  const [newPropKey, setNewPropKey] = useState("")
  const [newPropValue, setNewPropValue] = useState("")
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  const addSection = () => {
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      type: "custom-component",
      component: "Card",
      title: "New Section",
      enabled: true,
      props: {},
      content: "",
    }
    handleChange("sections", [...schema.sections, newSection])
  }

  const removeSection = (index: number) => {
    const newSections = [...schema.sections]
    newSections.splice(index, 1)
    handleChange("sections", newSections)
  }

  const addProp = (sectionIndex: number) => {
    if (!newPropKey) return
    const currentProps = schema.sections[sectionIndex].props || {}
    handleChange(`sections.${sectionIndex}.props`, {
      ...currentProps,
      [newPropKey]: newPropValue,
    })
    setNewPropKey("")
    setNewPropValue("")
  }

  const removeProp = (sectionIndex: number, key: string) => {
    const currentProps = { ...schema.sections[sectionIndex].props }
    delete currentProps[key]
    handleChange(`sections.${sectionIndex}.props`, currentProps)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Page Sections</h3>
          <p className="text-sm text-muted-foreground">Manage and customize your page sections</p>
        </div>
        <Button onClick={addSection} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {schema.sections.map((section, i) => (
          <Card key={section.id || i} className="group overflow-hidden transition-all hover:border-primary/20">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={section.enabled ? "default" : "secondary"} className="capitalize">
                      {section.component || section.type}
                    </Badge>
                    {section.type === "custom-component" && (
                      <Badge variant="outline" className="text-xs font-mono">
                        Custom
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{section.title || `Section ${i + 1}`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-background/50 p-1 rounded-md border mr-2">
                    <Checkbox
                      id={`section-${i}-enabled`}
                      checked={section.enabled}
                      onCheckedChange={(v) => handleChange(`sections.${i}.enabled`, v)}
                    />
                    <Label htmlFor={`section-${i}-enabled`} className="font-normal text-xs px-1 cursor-pointer">
                      {section.enabled ? "Visible" : "Hidden"}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSection(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`section-${i}-title`} className="text-xs text-muted-foreground">
                    Display Title
                  </Label>
                  <Input
                    id={`section-${i}-title`}
                    value={section.title || ""}
                    onChange={(e) => handleChange(`sections.${i}.title`, e.target.value)}
                    className="h-8 mt-1.5"
                    placeholder="My Awesome Section"
                  />
                </div>
                <div>
                  <Label htmlFor={`section-${i}-component`} className="text-xs text-muted-foreground">
                    Component Name
                  </Label>
                  <div className="relative mt-1.5">
                    <Code className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`section-${i}-component`}
                      value={section.component || ""}
                      onChange={(e) => handleChange(`sections.${i}.component`, e.target.value)}
                      className="h-8 pl-8 font-mono text-xs"
                      placeholder="Card, Button, Hero..."
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-2">
                    <Settings2 className="h-3 w-3" />
                    Component Properties
                  </Label>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                  {Object.entries(section.props || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 group/prop">
                      <div className="grid grid-cols-2 flex-1 gap-2">
                        <div className="px-2 py-1 bg-background border rounded text-xs font-mono text-muted-foreground">
                          {key}
                        </div>
                        <Input
                          value={String(value)}
                          onChange={(e) =>
                            handleChange(`sections.${i}.props`, { ...section.props, [key]: e.target.value })
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover/prop:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => removeProp(i, key)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder="Prop name"
                      value={newPropKey}
                      onChange={(e) => setNewPropKey(e.target.value)}
                      className="h-7 text-xs font-mono flex-1"
                      onFocus={() => setEditingSectionId(section.id)}
                    />
                    <Input
                      placeholder="Value"
                      value={editingSectionId === section.id ? newPropValue : ""}
                      onChange={(e) => setNewPropValue(e.target.value)}
                      className="h-7 text-xs flex-1"
                      onFocus={() => setEditingSectionId(section.id)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addProp(i)}
                      disabled={!newPropKey || editingSectionId !== section.id}
                      className="h-7 px-3 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Content / Children</Label>
                  <Textarea
                    value={section.content || ""}
                    onChange={(e) => handleChange(`sections.${i}.content`, e.target.value)}
                    className="h-20 text-xs font-mono resize-none"
                    placeholder="Inner content or text..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {schema.sections.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
            <p className="text-sm text-muted-foreground mb-4">No sections added yet</p>
            <Button onClick={addSection} variant="outline" size="sm">
              Add your first section
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
