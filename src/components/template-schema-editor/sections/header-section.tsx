import { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HeaderSectionProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
  pages: any[]
}

export function HeaderSection({ schema, handleChange, pages }: HeaderSectionProps) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Settings</CardTitle>
          <CardDescription>Configure header behavior</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
