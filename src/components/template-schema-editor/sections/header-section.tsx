import { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, ChevronDown, Edit2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface HeaderSectionProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
  pages: any[]
}

export function HeaderSection({ schema, handleChange, pages }: HeaderSectionProps) {
  const [editingDropdownIndex, setEditingDropdownIndex] = useState<number | null>(null)
  const [newDropdownLabel, setNewDropdownLabel] = useState("")
  const [newDropdownItems, setNewDropdownItems] = useState<Array<{ label: string; href: string }>>([])
  const [newItemLabel, setNewItemLabel] = useState("")
  const [newItemHref, setNewItemHref] = useState("")

  const handleAddPageToNavbar = (pageSlug: string) => {
    const order = schema.header.navbar.order || []
    if (!order.includes(pageSlug)) {
      handleChange("header.navbar.order", [...order, pageSlug])
    }
  }

  const handleRemovePageFromNavbar = (slug: string) => {
    const order = schema.header.navbar.order || []
    handleChange(
      "header.navbar.order",
      order.filter((s) => s !== slug)
    )
  }

  const handleEditDropdown = (index: number) => {
    const dropdown = (schema.header.navbar.dropdowns || [])[index]
    setEditingDropdownIndex(index)
    setNewDropdownLabel(dropdown.label)
    setNewDropdownItems([...(dropdown.items || [])])
  }

  const handleSaveDropdown = () => {
    if (newDropdownLabel.trim()) {
      const dropdowns = [...(schema.header.navbar.dropdowns || [])]
      dropdowns[editingDropdownIndex!] = {
        label: newDropdownLabel,
        items: newDropdownItems
      }
      handleChange("header.navbar.dropdowns", dropdowns)
      setEditingDropdownIndex(null)
      setNewDropdownLabel("")
      setNewDropdownItems([])
    }
  }

  const handleCancelEdit = () => {
    setEditingDropdownIndex(null)
    setNewDropdownLabel("")
    setNewDropdownItems([])
    setNewItemLabel("")
    setNewItemHref("")
  }

  const handleAddDropdown = () => {
    if (newDropdownLabel.trim()) {
      const dropdowns = schema.header.navbar.dropdowns || []
      handleChange("header.navbar.dropdowns", [
        ...dropdowns,
        { label: newDropdownLabel, items: newDropdownItems }
      ])
      setNewDropdownLabel("")
      setNewDropdownItems([])
    }
  }

  const handleAddDropdownItem = () => {
    if (newItemLabel.trim() && newItemHref.trim()) {
      setNewDropdownItems([...newDropdownItems, { label: newItemLabel, href: newItemHref }])
      setNewItemLabel("")
      setNewItemHref("")
    }
  }

  const handleRemoveDropdownItem = (index: number) => {
    setNewDropdownItems(newDropdownItems.filter((_, i) => i !== index))
  }

  const handleDeleteDropdown = (index: number) => {
    const dropdowns = schema.header.navbar.dropdowns || []
    handleChange(
      "header.navbar.dropdowns",
      dropdowns.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Settings</CardTitle>
          <CardDescription>Configure header behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sticky"
              checked={schema.header.sticky}
              onCheckedChange={(v) => handleChange("header.sticky", v)}
            />
            <Label htmlFor="sticky" className="font-normal">
              Make header sticky (stays at top when scrolling)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transparent"
              checked={schema.header.transparent}
              onCheckedChange={(v) => handleChange("header.transparent", v)}
            />
            <Label htmlFor="transparent" className="font-normal">
              Transparent header background
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Style</CardTitle>
          <CardDescription>Configure navbar appearance and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="navbar-style">Navigation Style</Label>
            <Select value={schema.header.navbar.style} onValueChange={(v) => handleChange("header.navbar.style", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="navbar-alignment">Alignment</Label>
            <Select value={schema.header.navbar.alignment} onValueChange={(v) => handleChange("header.navbar.alignment", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Menu</CardTitle>
          <CardDescription>Manage pages in navigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Add Pages to Navigation</Label>
            <Select onValueChange={handleAddPageToNavbar}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select a page to add..." />
              </SelectTrigger>
              <SelectContent>
                {pages
                  .filter((p) => !schema.header.navbar.order?.includes(p.slug))
                  .map((page) => (
                    <SelectItem key={page.slug} value={page.slug}>
                      {page.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Navigation Order</Label>
            <div className="flex flex-wrap gap-2">
              {(schema.header.navbar.order || []).map((slug) => {
                const page = pages.find((p) => p.slug === slug)
                return (
                  <Badge key={slug} variant="secondary" className="px-3 py-2 flex items-center gap-2">
                    {page?.title || slug}
                    <button
                      onClick={() => handleRemovePageFromNavbar(slug)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                )
              })}
              {(!schema.header.navbar.order || schema.header.navbar.order.length === 0) && (
                <p className="text-sm text-muted-foreground italic">No pages added yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronDown size={20} />
            Dropdown Menus
          </CardTitle>
          <CardDescription>Create custom dropdown menus in navigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display existing dropdowns */}
          <div className="space-y-3">
            {(schema.header.navbar.dropdowns || []).map((dropdown, index) => (
              <div key={index} className="p-3 border border-border rounded-lg bg-muted/40">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{dropdown.label}</h4>
                    <p className="text-xs text-muted-foreground">{dropdown.items?.length || 0} items</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDropdown(index)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-background rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDropdown(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-background rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(dropdown.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} className="text-xs flex items-center gap-2 px-2 py-1 bg-background rounded">
                      <span className="text-muted-foreground">•</span>
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-xs text-muted-foreground">{item.href}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit dropdown form */}
          <div className="p-3 border-2 border-dashed border-border rounded-lg bg-muted/20 space-y-3">
            <h4 className="text-sm font-semibold">
              {editingDropdownIndex !== null ? 'Edit Dropdown' : 'Create New Dropdown'}
            </h4>
            <div>
              <Label htmlFor="dropdown-label" className="text-xs">Dropdown Label</Label>
              <Input
                id="dropdown-label"
                placeholder="e.g., Products, Resources"
                value={newDropdownLabel}
                onChange={(e) => setNewDropdownLabel(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Items</Label>
              {newDropdownItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs p-2 bg-background rounded">
                  <span className="flex-1">{item.label}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-muted-foreground flex-1">{item.href}</span>
                  <button
                    onClick={() => handleRemoveDropdownItem(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 p-2 border border-border rounded-lg bg-background">
              <Input
                placeholder="Item label"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                className="text-sm h-8"
              />
              <Input
                placeholder="Item href (e.g., /products/item-1)"
                value={newItemHref}
                onChange={(e) => setNewItemHref(e.target.value)}
                className="text-sm h-8"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddDropdownItem}
                className="w-full text-xs"
              >
                <Plus size={14} className="mr-1" />
                Add Item
              </Button>
            </div>

            <div className="flex gap-2">
              {editingDropdownIndex !== null ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSaveDropdown}
                    disabled={!newDropdownLabel.trim() || newDropdownItems.length === 0}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAddDropdown}
                  disabled={!newDropdownLabel.trim() || newDropdownItems.length === 0}
                  className="w-full"
                >
                  <Plus size={14} className="mr-1" />
                  Create Dropdown
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call-to-Action Button</CardTitle>
          <CardDescription>Configure the primary CTA button</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cta-label">Button Label</Label>
            <Input
              id="cta-label"
              value={schema.header.navbar.cta.label}
              onChange={(e) => handleChange("header.navbar.cta.label", e.target.value)}
              className="mt-2"
              placeholder="Get Started"
            />
          </div>
          <div>
            <Label htmlFor="cta-href">Button Link</Label>
            <Input
              id="cta-href"
              value={schema.header.navbar.cta.href}
              onChange={(e) => handleChange("header.navbar.cta.href", e.target.value)}
              className="mt-2"
              placeholder="/signup"
            />
          </div>
          <div>
            <Label htmlFor="cta-variant">Button Style</Label>
            <Select value={schema.header.navbar.cta.variant} onValueChange={(v) => handleChange("header.navbar.cta.variant", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
