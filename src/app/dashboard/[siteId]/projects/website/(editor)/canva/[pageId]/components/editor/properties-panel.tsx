"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ComponentDefinition, LayoutNode, PropDefinition } from "@/lib/types"
import { getAvailableComponents } from "@/lib/component-registry"
import { Trash2, Box, Settings, Code, FileCode, Layout, Type, Move, Square, Palette, Plus, ImageIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MediaGalleryModal } from "./media-gallery-modal"

interface PropertiesPanelProps {
  selectedNode: LayoutNode | null
  onUpdateNode: (updates: Partial<LayoutNode>) => void
  onDeleteNode: () => void
}

export function PropertiesPanel({ selectedNode, onUpdateNode, onDeleteNode }: PropertiesPanelProps) {
  const [componentDef, setComponentDef] = useState<ComponentDefinition | null>(null)
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false)
  const [activeImageProp, setActiveImageProp] = useState<string | null>(null)

  useEffect(() => {
    if (selectedNode) {
      loadComponentDefinition(selectedNode.type)
    }
  }, [selectedNode])

  async function loadComponentDefinition(type: string) {
    const components = await getAvailableComponents()
    const def = components.find((c) => c.name === type)
    setComponentDef(def || null)
  }

  if (!selectedNode || !componentDef) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a component to edit its properties</p>
        </CardContent>
      </Card>
    )
  }

  const handlePropChange = (propName: string, value: any) => {
    onUpdateNode({
      props: {
        ...selectedNode.props,
        [propName]: value,
      },
    })
  }

  const handleAdvancedChange = (key: keyof LayoutNode, value: any) => {
    onUpdateNode({
      [key]: value,
    })
  }

  const handleStyleChange = (styleKey: string, value: string) => {
    const newStyle = { ...selectedNode.style, [styleKey]: value }
    if (!value) delete newStyle[styleKey as keyof typeof newStyle]
    onUpdateNode({
      style: newStyle,
    })
  }

  const handleOpenGallery = (propName: string) => {
    setActiveImageProp(propName)
    setMediaGalleryOpen(true)
  }

  const handleGallerySelect = (url: string) => {
    if (activeImageProp) {
      handlePropChange(activeImageProp, url)
    }
  }

  return (
    <>
      <Card className="h-full flex flex-col border-0 rounded-none shadow-none">
        <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4 py-2 flex items-center justify-between">
            <TabsList className="grid w-full max-w-[240px] grid-cols-3 h-8">
              <TabsTrigger value="content" className="text-xs">
                Content
              </TabsTrigger>
              <TabsTrigger value="style" className="text-xs">
                Style
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">
                Advanced
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteNode}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="content" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Box className="w-4 h-4" />
                  {selectedNode.type} Settings
                </div>

                {componentDef.props.map((prop) => (
                  <div key={prop.name} className="space-y-2">
                    <Label htmlFor={prop.name} className="text-xs">
                      {prop.label}
                    </Label>
                    {renderPropInput(prop, selectedNode.props[prop.name], handlePropChange, handleOpenGallery)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="style" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <Accordion type="multiple" defaultValue={["layout", "spacing", "size"]} className="w-full">
                {/* Layout Section */}
                <AccordionItem value="layout" className="border-b px-4">
                  <AccordionTrigger className="text-xs hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      Layout
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Display</Label>
                        <Select
                          value={selectedNode.style?.display || ""}
                          onValueChange={(val) => handleStyleChange("display", val)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="block">Block</SelectItem>
                            <SelectItem value="flex">Flex</SelectItem>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="inline-block">Inline Block</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedNode.style?.display === "flex" && (
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">Direction</Label>
                          <Select
                            value={selectedNode.style?.flexDirection || ""}
                            onValueChange={(val) => handleStyleChange("flexDirection", val)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Row" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="row">Row</SelectItem>
                              <SelectItem value="column">Column</SelectItem>
                              <SelectItem value="row-reverse">Row Reverse</SelectItem>
                              <SelectItem value="column-reverse">Col Reverse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    {selectedNode.style?.display === "flex" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">Justify</Label>
                          <Select
                            value={selectedNode.style?.justifyContent || ""}
                            onValueChange={(val) => handleStyleChange("justifyContent", val)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flex-start">Start</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="flex-end">End</SelectItem>
                              <SelectItem value="space-between">Between</SelectItem>
                              <SelectItem value="space-around">Around</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">Align</Label>
                          <Select
                            value={selectedNode.style?.alignItems || ""}
                            onValueChange={(val) => handleStyleChange("alignItems", val)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Stretch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stretch">Stretch</SelectItem>
                              <SelectItem value="flex-start">Start</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="flex-end">End</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground">Gap</Label>
                      <Input
                        className="h-8"
                        placeholder="e.g. 16px"
                        value={selectedNode.style?.gap || ""}
                        onChange={(e) => handleStyleChange("gap", e.target.value)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Spacing Section */}
                <AccordionItem value="spacing" className="border-b px-4">
                  <AccordionTrigger className="text-xs hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      Spacing
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground">Margin (px/rem/auto)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          className="h-8"
                          placeholder="Top"
                          value={selectedNode.style?.marginTop || ""}
                          onChange={(e) => handleStyleChange("marginTop", e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Right"
                          value={selectedNode.style?.marginRight || ""}
                          onChange={(e) => handleStyleChange("marginRight", e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Bottom"
                          value={selectedNode.style?.marginBottom || ""}
                          onChange={(e) => handleStyleChange("marginBottom", e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Left"
                          value={selectedNode.style?.marginLeft || ""}
                          onChange={(e) => handleStyleChange("marginLeft", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground">Padding (px/rem)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          className="h-8"
                          placeholder="Top"
                          value={selectedNode.style?.paddingTop || ""}
                          onChange={(e) => handleStyleChange("paddingTop", e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Right"
                          value={selectedNode.style?.paddingRight || ""}
                          onChange={(e) => handleStyleChange("paddingRight", e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Bottom"
                          value={selectedNode.style?.paddingBottom || ""}
                          onChange={(e) => handleStyleChange("paddingBottom", e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Left"
                          value={selectedNode.style?.paddingLeft || ""}
                          onChange={(e) => handleStyleChange("paddingLeft", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Dimensions Section */}
                <AccordionItem value="size" className="border-b px-4">
                  <AccordionTrigger className="text-xs hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      Size
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Width</Label>
                        <Input
                          className="h-8"
                          placeholder="e.g. 100%"
                          value={selectedNode.style?.width || ""}
                          onChange={(e) => handleStyleChange("width", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Height</Label>
                        <Input
                          className="h-8"
                          placeholder="e.g. 100vh"
                          value={selectedNode.style?.height || ""}
                          onChange={(e) => handleStyleChange("height", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Typography Section */}
                <AccordionItem value="typography" className="border-b px-4">
                  <AccordionTrigger className="text-xs hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Typography
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Font Size</Label>
                        <Input
                          className="h-8"
                          placeholder="e.g. 16px"
                          value={selectedNode.style?.fontSize || ""}
                          onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Font Weight</Label>
                        <Select
                          value={selectedNode.style?.fontWeight || ""}
                          onValueChange={(val) => handleStyleChange("fontWeight", val)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Normal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="400">Normal</SelectItem>
                            <SelectItem value="500">Medium</SelectItem>
                            <SelectItem value="600">Semibold</SelectItem>
                            <SelectItem value="700">Bold</SelectItem>
                            <SelectItem value="900">Black</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground">Text Align</Label>
                      <Select
                        value={selectedNode.style?.textAlign || ""}
                        onValueChange={(val) => handleStyleChange("textAlign", val)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Left" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="justify">Justify</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                          value={selectedNode.style?.color || "#000000"}
                          onChange={(e) => handleStyleChange("color", e.target.value)}
                        />
                        <Input
                          className="h-8 flex-1"
                          placeholder="#000000"
                          value={selectedNode.style?.color || ""}
                          onChange={(e) => handleStyleChange("color", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Background Section */}
                <AccordionItem value="background" className="border-b px-4">
                  <AccordionTrigger className="text-xs hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Background
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                          value={selectedNode.style?.backgroundColor || "#ffffff"}
                          onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                        />
                        <Input
                          className="h-8 flex-1"
                          placeholder="#ffffff"
                          value={selectedNode.style?.backgroundColor || ""}
                          onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                {/* Layout / Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Settings className="w-4 h-4" />
                    Layout & Identity
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">ID</Label>
                    <Input className="h-8 font-mono text-xs" value={selectedNode.id} disabled />
                    <p className="text-[10px] text-muted-foreground">Unique identifier for this element</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">CSS Classes</Label>
                    <Input
                      className="h-8"
                      placeholder="e.g. text-center p-4 shadow-lg"
                      value={selectedNode.className || ""}
                      onChange={(e) => handleAdvancedChange("className", e.target.value)}
                      list="tailwind-classes" // Added autocomplete datalist
                    />
                    <datalist id="tailwind-classes">
                      <option value="flex" />
                      <option value="grid" />
                      <option value="block" />
                      <option value="hidden" />
                      <option value="text-center" />
                      <option value="text-left" />
                      <option value="text-right" />
                      <option value="text-red-500" />
                      <option value="bg-blue-500" />
                      <option value="p-4" />
                      <option value="m-4" />
                      <option value="rounded-lg" />
                      <option value="shadow-md" />
                      <option value="border" />
                    </datalist>
                  </div>
                </div>
                {/* Custom CSS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <FileCode className="w-4 h-4" />
                    Custom CSS
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">CSS Styles</Label>
                    <Textarea
                      className="font-mono text-xs h-32"
                      placeholder="selector { background: red; }"
                      value={selectedNode.customCss || ""}
                      onChange={(e) => handleAdvancedChange("customCss", e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Use <code>selector</code> to target this element.
                    </p>
                  </div>
                </div>

                {/* Custom JS/Scripts */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Code className="w-4 h-4" />
                    Custom JS
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">OnClick Script</Label>
                    <Textarea
                      className="font-mono text-xs h-20"
                      placeholder="alert('Hello!');"
                      value={selectedNode.script || ""}
                      onChange={(e) => handleAdvancedChange("script", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
      <MediaGalleryModal
        open={mediaGalleryOpen}
        onOpenChange={setMediaGalleryOpen}
        onSelect={handleGallerySelect}
      />
    </>
  )
}

function renderPropInput(
  prop: PropDefinition,
  value: any,
  onChange: (propName: string, value: any) => void,
  onOpenGallery?: (propName: string) => void
) {
  switch (prop.type) {
    case "string":
    case "url":
      return (
        <Input
          id={prop.name}
          className="h-8"
          type={prop.type === "url" ? "url" : "text"}
          value={value || ""}
          onChange={(e) => onChange(prop.name, e.target.value)}
        />
      )

    case "number":
      return (
        <Input
          id={prop.name}
          className="h-8"
          type="number"
          value={value || 0}
          onChange={(e) => onChange(prop.name, Number(e.target.value))}
        />
      )

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch id={prop.name} checked={value || false} onCheckedChange={(checked) => onChange(prop.name, checked)} />
        </div>
      )

    case "select":
      return (
        <Select value={value || prop.defaultValue} onValueChange={(newValue) => onChange(prop.name, newValue)}>
          <SelectTrigger id={prop.name} className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prop.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "color":
      return (
        <div className="flex gap-2">
          <Input
            type="color"
            className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
            value={value || "#000000"}
            onChange={(e) => onChange(prop.name, e.target.value)}
          />
          <Input
            id={prop.name}
            className="h-8 flex-1"
            type="text"
            value={value || ""}
            onChange={(e) => onChange(prop.name, e.target.value)}
          />
        </div>
      )

    // ✅ NEW: Dynamic JSON array editor (for things like Stats)
    case "json": {
      const parsedValue: any[] = (() => {
        if (Array.isArray(value)) return value
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        }
        return []
      })()

      const handleChange = (index: number, key: string, val: any) => {
        const newArr = [...parsedValue]
        newArr[index] = { ...newArr[index], [key]: val }
        onChange(prop.name, newArr)
      }

      const addItem = () => {
        const newItem: any = {}
        prop.schema?.forEach((f: any) => {
          if (f.type === "json") {
            // Only create submenu if schema has inner defaults or predefined structure
            // otherwise skip adding an empty array
            newItem[f.key] = undefined
          } else if (f.key === "label") {
            newItem[f.key] = "New Item"
          } else if (f.key === "href") {
            newItem[f.key] = ""
          } else {
            newItem[f.key] = f.defaultValue ?? ""
          }
        })
        // Clean out any undefined keys before pushing
        const cleanedItem = Object.fromEntries(
          Object.entries(newItem).filter(([_, v]) => v !== undefined)
        )
        onChange(prop.name, [...parsedValue, cleanedItem])
      }


      const removeItem = (index: number) => {
        const newArr = parsedValue.filter((_, i) => i !== index)
        onChange(prop.name, newArr)
      }

      return (
        <div className="space-y-3 border rounded-md p-3 bg-muted/30">
          <Accordion type="multiple" className="w-full space-y-2">
            {parsedValue.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border rounded-md bg-background"
              >
                <AccordionTrigger className="text-xs px-3 py-2 flex justify-between items-center">
                  <span className="font-medium">
                    {item.label ? (
                      <span>{item.label}</span>
                    ) : (
                      <div>Item {idx + 1}</div>
                    )}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="p-3 space-y-3 border-t bg-muted/10">
                  {prop.schema?.map((field: any) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs">{field.label}</Label>

                      {/* Handle nested JSON recursively */}
                      {field.type === "json" ? (
                        <div className="ml-2 border-l pl-3">
                          {renderPropInput(
                            field,
                            item[field.key],
                            (key, val) => handleChange(idx, field.key, val),
                            onOpenGallery
                          )}
                        </div>
                      ) : (
                        <Input
                          className="h-8"
                          value={item[field.key] ?? ""}
                          onChange={(e) =>
                            handleChange(idx, field.key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}

                  {/* Controls: Move up/down + delete */}
                  <div className="pt-3 mt-1 border-t flex flex-wrap justify-between items-center gap-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return
                          const newArr = [...parsedValue]
                          const [moved] = newArr.splice(idx, 1)
                          newArr.splice(idx - 1, 0, moved)
                          onChange(prop.name, newArr)
                        }}
                      >
                        ↑ Move Up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        disabled={idx === parsedValue.length - 1}
                        onClick={() => {
                          if (idx === parsedValue.length - 1) return
                          const newArr = [...parsedValue]
                          const [moved] = newArr.splice(idx, 1)
                          newArr.splice(idx + 1, 0, moved)
                          onChange(prop.name, newArr)
                        }}
                      >
                        ↓ Move Down
                      </Button>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>

                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>


          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={addItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      )
    }

    case "image":
      return (
        <div className="flex gap-2">
          <Input
            id={prop.name}
            className="h-8 flex-1"
            value={value || ""}
            onChange={(e) => onChange(prop.name, e.target.value)}
            placeholder="Image URL"
          />
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={() => onOpenGallery && onOpenGallery(prop.name)}
            title="Select from Gallery"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      )

    default:
      return <Input id={prop.name} value={value || ""} disabled />
  }
}
