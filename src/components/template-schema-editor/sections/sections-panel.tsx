import { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface SectionsPanelProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
}

export function SectionsPanel({ schema, handleChange }: SectionsPanelProps) {
  return (
    <div className="space-y-4">
      {schema.sections.map((section, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {section.type}
                  </Badge>
                </div>
                <CardTitle className="text-base">{section.title || `${section.type} Section`}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`section-${i}-enabled`}
                  checked={section.enabled}
                  onCheckedChange={(v) => handleChange(`sections.${i}.enabled`, v)}
                />
                <Label htmlFor={`section-${i}-enabled`} className="font-normal text-sm">
                  Enabled
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor={`section-${i}-title`}>Section Title</Label>
              <Input
                id={`section-${i}-title`}
                value={section.title || ""}
                onChange={(e) => handleChange(`sections.${i}.title`, e.target.value)}
                placeholder="Enter section title"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
