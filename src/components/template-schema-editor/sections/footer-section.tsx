import { TemplateSchema } from "@/types/TemplateSchema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Plus } from 'lucide-react'

interface FooterSectionProps {
  schema: TemplateSchema
  handleChange: (path: string, value: any) => void
}

export function FooterSection({ schema, handleChange }: FooterSectionProps) {
  const addLink = (colIndex: number) => {
    const newLinks = [
      ...(schema.footer.columns[colIndex].links || []),
      { label: "New Link", href: "#" },
    ]
    handleChange(`footer.columns.${colIndex}.links`, newLinks)
  }

  const removeLink = (colIndex: number, linkIndex: number) => {
    const newLinks = schema.footer.columns[colIndex].links.filter(
      (_, i) => i !== linkIndex
    )
    handleChange(`footer.columns.${colIndex}.links`, newLinks)
  }

  return (
    <div className="space-y-6">
      {schema.footer.columns.map((col, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-base">Column {i + 1}</CardTitle>
            <CardDescription>Manage links in this column</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`footer-col-${i}-title`}>Column Title</Label>
              <Input
                id={`footer-col-${i}-title`}
                value={col.title}
                onChange={(e) => handleChange(`footer.columns.${i}.title`, e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Links</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addLink(i)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Link
                </Button>
              </div>

              <div className="space-y-3">
                {col.links.map((link, j) => (
                  <div key={j} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          handleChange(
                            `footer.columns.${i}.links.${j}.label`,
                            e.target.value
                          )
                        }
                        placeholder="Link text"
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={link.href}
                        onChange={(e) =>
                          handleChange(
                            `footer.columns.${i}.links.${j}.href`,
                            e.target.value
                          )
                        }
                        placeholder="URL"
                        className="text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLink(i, j)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
