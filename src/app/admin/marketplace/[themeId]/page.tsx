"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Trash2, ImageIcon, UploadCloud } from "lucide-react"
import { toast } from "sonner"
// @ts-ignore
import { CldUploadButton, type CldUploadWidgetResults } from "next-cloudinary"

// CraftJS component definitions (these are the components available in CraftJS)
const CRAFTJS_COMPONENTS = [
    { name: "Container", category: "Layout", description: "A container for grouping elements" },
    { name: "Grid", category: "Layout", description: "A responsive grid layout" },
    { name: "Heading", category: "Typography", description: "A heading element (h1-h6)" },
    { name: "Text", category: "Typography", description: "A paragraph of text" },
    { name: "Button", category: "Interactive", description: "A clickable button" },
    { name: "Image", category: "Media", description: "An image element" },
    { name: "Divider", category: "Layout", description: "A horizontal divider line" },
    { name: "Spacer", category: "Layout", description: "Vertical spacing element" },
    { name: "Navbar", category: "Navigation", description: "Professional navbar with top bar and banner" },
    { name: "NavigationLinks", category: "Navigation", description: "Styled navigation links list" },
]

interface ThemeBlock {
    id?: string
    componentName: string
    componentDefinition: any
}

interface Theme {
    id: string
    name: string
    description: string
    thumbnail: string | null
    price: number
    isPremium: boolean
    blocks: ThemeBlock[]
}

export default function ThemeEditorPage({ params }: { params: Promise<{ themeId: string }> }) {
    const { themeId } = use(params)
    const isNew = themeId === "new"
    const router = useRouter()
    const { data: session, status } = useSession()

    const [isLoading, setIsLoading] = useState(!isNew)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        thumbnail: "",
        price: 0,
        isPremium: false,
    })

    // Selected components
    const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set())

    // Check admin access
    useEffect(() => {
        if (status === "loading") return
        if (!session || session.user.role !== "ADMIN") {
            router.push("/")
            return
        }
        if (!isNew) {
            fetchTheme()
        }
    }, [session, status, router, isNew, themeId])

    const fetchTheme = async () => {
        try {
            const response = await fetch(`/api/admin/marketplace/${themeId}`)
            if (!response.ok) {
                if (response.status === 404) {
                    toast.error("Theme not found")
                    router.push("/admin/marketplace")
                    return
                }
                throw new Error("Failed to fetch theme")
            }
            const theme: Theme = await response.json()

            setFormData({
                name: theme.name,
                description: theme.description,
                thumbnail: theme.thumbnail || "",
                price: theme.price,
                isPremium: theme.isPremium,
            })

            // Pre-select components
            const componentNames = theme.blocks.map(b => b.componentName)
            setSelectedComponents(new Set(componentNames))
        } catch (error) {
            console.error("Error fetching theme:", error)
            toast.error("Failed to load theme")
        } finally {
            setIsLoading(false)
        }
    }

    const handleComponentToggle = (componentName: string) => {
        setSelectedComponents(prev => {
            const next = new Set(prev)
            if (next.has(componentName)) {
                next.delete(componentName)
            } else {
                next.add(componentName)
            }
            return next
        })
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Theme name is required")
            return
        }

        setIsSaving(true)
        try {
            const url = isNew ? "/api/admin/marketplace" : `/api/admin/marketplace/${themeId}`
            const method = isNew ? "POST" : "PUT"

            // Build blocks array from selected components
            const blocks = Array.from(selectedComponents).map(name => {
                const component = CRAFTJS_COMPONENTS.find(c => c.name === name)
                return {
                    componentName: name,
                    componentDefinition: {
                        category: component?.category || "Other",
                        description: component?.description || "",
                        isCore: false,
                    }
                }
            })

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    blocks,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to save theme")
            }

            toast.success(isNew ? "Theme created successfully" : "Theme updated successfully")
            router.push("/admin/marketplace")
        } catch (error) {
            console.error("Error saving theme:", error)
            toast.error("Failed to save theme")
        } finally {
            setIsSaving(false)
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Group components by category
    const componentsByCategory = CRAFTJS_COMPONENTS.reduce((acc, component) => {
        if (!acc[component.category]) acc[component.category] = []
        acc[component.category].push(component)
        return acc
    }, {} as Record<string, typeof CRAFTJS_COMPONENTS>)

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/marketplace">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {isNew ? "Create Theme" : "Edit Theme"}
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Theme
                </Button>
            </div>

            <div className="space-y-8">
                {/* Theme Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Theme Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Sophia Platanisioti"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="A brief description of this theme..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Thumbnail</Label>
                                <div className="flex items-start gap-4">
                                    {formData.thumbnail ? (
                                        <div className="relative aspect-video w-40 rounded-md overflow-hidden border">
                                            <Image
                                                src={formData.thumbnail}
                                                alt="Theme thumbnail"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, thumbnail: "" }))}
                                                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex h-24 w-40 items-center justify-center rounded-md border border-dashed bg-muted/50">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <CldUploadButton
                                            options={{
                                                maxFiles: 1,
                                                folder: "admin/themes",
                                                tags: ["theme_thumbnail"],
                                            }}
                                            onSuccess={(result: CldUploadWidgetResults) => {
                                                if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
                                                    setFormData(prev => ({ ...prev, thumbnail: result.info.secure_url }))
                                                    toast.success("Image uploaded")
                                                }
                                            }}
                                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "esiln4yu"}
                                        >
                                            <Button variant="outline" type="button" size="sm">
                                                <UploadCloud className="mr-2 h-4 w-4" />
                                                Upload Image
                                            </Button>
                                        </CldUploadButton>
                                        <p className="text-xs text-muted-foreground">
                                            Recommended size: 1200x800px
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price (€)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="premium"
                                            checked={formData.isPremium}
                                            onCheckedChange={checked => setFormData(prev => ({ ...prev, isPremium: checked }))}
                                        />
                                        <Label htmlFor="premium">Premium Theme</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Component Selection */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Components</CardTitle>
                        <Badge variant="secondary">
                            {selectedComponents.size} selected
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(componentsByCategory).map(([category, components]) => (
                            <div key={category} className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
                                    {category}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {components.map(component => {
                                        const isSelected = selectedComponents.has(component.name)
                                        return (
                                            <div
                                                key={component.name}
                                                className={`
                                                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                                                    ${isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}
                                                `}
                                                onClick={() => handleComponentToggle(component.name)}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleComponentToggle(component.name)}
                                                    className="mt-0.5"
                                                />
                                                <div className="grid gap-1">
                                                    <span className="text-sm font-medium">
                                                        {component.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {component.description}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
