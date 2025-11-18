import { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GlobalSectionProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
}

export function GlobalSection({ schema, handleChange }: GlobalSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>Configure site layout properties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="container">Container Width</Label>
            <Input
              id="container"
              value={schema.global.container}
              onChange={(e) => handleChange("global.container", e.target.value)}
              placeholder="1280px"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="radius">Border Radius</Label>
            <Input
              id="radius"
              value={schema.global.radius}
              onChange={(e) => handleChange("global.radius", e.target.value)}
              placeholder="0.5rem"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spacing</CardTitle>
          <CardDescription>Define vertical and horizontal spacing</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sectionY">Section Vertical Spacing</Label>
            <Input
              id="sectionY"
              type="number"
              value={schema.global.spacing.sectionY}
              onChange={(e) =>
                handleChange("global.spacing.sectionY", Number(e.target.value))
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="sectionX">Section Horizontal Spacing</Label>
            <Input
              id="sectionX"
              type="number"
              value={schema.global.spacing.sectionX}
              onChange={(e) =>
                handleChange("global.spacing.sectionX", Number(e.target.value))
              }
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
