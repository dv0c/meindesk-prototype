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
        <CardContent className="space-y-4">
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
          <div>
            <Label htmlFor="colorMode">Color Mode</Label>
            <Select value={schema.theme.colorMode || "vibrant"} onValueChange={(v) => handleChange("theme.colorMode", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monochrome">Monochrome</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
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

      {schema.theme.palette.dark && (
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Colors</CardTitle>
            <CardDescription>Configure colors for dark theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="primary-dark">Primary Color</Label>
                <Input
                  id="primary-dark"
                  type="color"
                  value={schema.theme.palette.dark.primary}
                  onChange={(e) =>
                    handleChange("theme.palette.dark.primary", e.target.value)
                  }
                  className="mt-2 h-12 cursor-pointer"
                />
              </div>
              <div className="w-16 h-12 rounded border border-border" style={{
                backgroundColor: schema.theme.palette.dark.primary
              }} />
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="bg-dark">Background Color</Label>
                <Input
                  id="bg-dark"
                  type="color"
                  value={schema.theme.palette.dark.background}
                  onChange={(e) =>
                    handleChange("theme.palette.dark.background", e.target.value)
                  }
                  className="mt-2 h-12 cursor-pointer"
                />
              </div>
              <div className="w-16 h-12 rounded border border-border" style={{
                backgroundColor: schema.theme.palette.dark.background
              }} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Effects & Transitions</CardTitle>
          <CardDescription>Configure animation and visual effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="blur">Blur Effect (0-20)</Label>
            <Input
              id="blur"
              type="number"
              min="0"
              max="20"
              value={schema.theme.effects?.blur || 0}
              onChange={(e) => handleChange("theme.effects.blur", Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="transition-duration">Transition Duration (ms)</Label>
            <Input
              id="transition-duration"
              type="number"
              min="100"
              max="1000"
              value={schema.theme.effects?.transitions?.duration || 300}
              onChange={(e) => handleChange("theme.effects.transitions.duration", Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="transition-timing">Timing Function</Label>
            <Select value={schema.theme.effects?.transitions?.timing || "ease"} onValueChange={(v) => handleChange("theme.effects.transitions.timing", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ease">Ease</SelectItem>
                <SelectItem value="ease-in">Ease In</SelectItem>
                <SelectItem value="ease-out">Ease Out</SelectItem>
                <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
