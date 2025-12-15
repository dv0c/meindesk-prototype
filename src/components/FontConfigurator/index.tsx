"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import type { FontConfig } from "@/lib/fonts"
import { POPULAR_GOOGLE_FONTS, FONT_WEIGHTS, FONT_SUBSETS } from "@/lib/fonts"

interface FontConfiguratorProps {
    fonts: FontConfig[]
    onChange: (fonts: FontConfig[]) => void
}

export function FontConfigurator({ fonts = [], onChange }: FontConfiguratorProps) {
    const [activeTab, setActiveTab] = useState<"google" | "custom">("google")

    const addGoogleFont = () => {
        const newFont: FontConfig = {
            family: POPULAR_GOOGLE_FONTS[0],
            type: "google",
            weights: [400, 700],
            subsets: ["latin"],
            variable: ""
        }
        onChange([...fonts, newFont])
    }

    const addCustomFont = () => {
        const newFont: FontConfig = {
            family: "Custom Font",
            type: "custom",
            url: "",
            variable: ""
        }
        onChange([...fonts, newFont])
    }

    const updateFont = (index: number, updates: Partial<FontConfig>) => {
        const updated = [...fonts]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeFont = (index: number) => {
        onChange(fonts.filter((_, i) => i !== index))
    }

    const googleFonts = fonts.filter(f => f.type === "google")
    const customFonts = fonts.filter(f => f.type === "custom")

    return (
        <Card>
            <CardHeader>
                <CardTitle>Font Configuration</CardTitle>
                <CardDescription>
                    Add Google Fonts or upload custom fonts for your theme
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="google">Google Fonts</TabsTrigger>
                        <TabsTrigger value="custom">Custom Fonts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="google" className="space-y-4 mt-4">
                        {googleFonts.map((font, i) => {
                            const actualIndex = fonts.findIndex(f => f === font)
                            return (
                                <Card key={actualIndex}>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Font Family</Label>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeFont(actualIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <Select
                                            value={font.family}
                                            onValueChange={(v) => updateFont(actualIndex, { family: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {POPULAR_GOOGLE_FONTS.map(name => (
                                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="space-y-2">
                                            <Label>Font Weights</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {FONT_WEIGHTS.map(weight => (
                                                    <label key={weight.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={font.weights?.includes(weight.value)}
                                                            onCheckedChange={(checked) => {
                                                                const weights = font.weights || []
                                                                updateFont(actualIndex, {
                                                                    weights: checked
                                                                        ? [...weights, weight.value]
                                                                        : weights.filter(w => w !== weight.value)
                                                                })
                                                            }}
                                                        />
                                                        <span className="text-sm">{weight.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>CSS Variable (optional)</Label>
                                            <Input
                                                placeholder="--font-heading"
                                                value={font.variable || ""}
                                                onChange={(e) => updateFont(actualIndex, { variable: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        <Button onClick={addGoogleFont} variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Google Font
                        </Button>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4 mt-4">
                        {customFonts.map((font, i) => {
                            const actualIndex = fonts.findIndex(f => f === font)
                            return (
                                <Card key={actualIndex}>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Custom Font</Label>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeFont(actualIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div>
                                            <Label>Font Family Name</Label>
                                            <Input
                                                placeholder="My Custom Font"
                                                value={font.family}
                                                onChange={(e) => updateFont(actualIndex, { family: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <Label>Font File URL</Label>
                                            <Input
                                                placeholder="https://example.com/fonts/my-font.woff2"
                                                value={font.url || ""}
                                                onChange={(e) => updateFont(actualIndex, { url: e.target.value })}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Supports: .woff2, .woff, .ttf, .otf
                                            </p>
                                        </div>

                                        <div>
                                            <Label>CSS Variable (optional)</Label>
                                            <Input
                                                placeholder="--font-custom"
                                                value={font.variable || ""}
                                                onChange={(e) => updateFont(actualIndex, { variable: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        <Button onClick={addCustomFont} variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Custom Font
                        </Button>
                    </TabsContent>
                </Tabs>

                {fonts.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Font Preview:</p>
                        {fonts.map((font, i) => (
                            <div key={i} className="text-sm">
                                • <span className="font-mono">{font.family}</span>
                                {font.variable && <span className="text-muted-foreground"> ({font.variable})</span>}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
