import { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ThemeSectionProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
}

export function ThemeSection({ schema, handleChange }: ThemeSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Mode</CardTitle>
          <CardDescription>Select how your site appears</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="mode">Appearance</Label>
            <Select value={schema.theme.mode} onValueChange={(v) => handleChange("theme.mode", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Light Mode Colors</CardTitle>
          <CardDescription>Configure colors for light theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="primary-light">Primary Color</Label>
              <Input
                id="primary-light"
                type="color"
                value={schema.theme.palette.light.primary}
                onChange={(e) =>
                  handleChange("theme.palette.light.primary", e.target.value)
                }
                className="mt-2 h-12 cursor-pointer"
              />
            </div>
            <div className="w-16 h-12 rounded border border-border" style={{
              backgroundColor: schema.theme.palette.light.primary
            }} />
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="bg-light">Background Color</Label>
              <Input
                id="bg-light"
                type="color"
                value={schema.theme.palette.light.background}
                onChange={(e) =>
                  handleChange("theme.palette.light.background", e.target.value)
                }
                className="mt-2 h-12 cursor-pointer"
              />
            </div>
            <div className="w-16 h-12 rounded border border-border" style={{
              backgroundColor: schema.theme.palette.light.background
            }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
