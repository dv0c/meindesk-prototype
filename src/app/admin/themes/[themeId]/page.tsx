
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ALL_COMPONENTS } from "@/lib/components-data";
import { ComponentDefinition } from "@/lib/types";
// @ts-ignore
import { CldUploadButton, type CldUploadWidgetResults } from "next-cloudinary";
import NextImage from "next/image";

export default function ThemeEditorPage({ params }: { params: Promise<{ themeId: string }> }) {
    const { themeId } = use(params);
    const isNew = themeId === "new";
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        isPremium: false,
        thumbnail: "",
    });

    // Block Selection State
    // We store just the names of the selected components
    const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());

    useEffect(() => {
        console.log("ThemeEditor mounted. themeId:", themeId);
        if (!isNew) {
            fetchThemeData();
        } else {
            console.log("New theme mode");
        }
    }, [themeId]);

    const fetchThemeData = async () => {
        try {
            console.log("Fetching theme data for:", themeId);
            const res = await fetch(`/api/admin/themes/${themeId}`);

            if (!res.ok) {
                if (res.status === 404) throw new Error("Theme not found in API");
                throw new Error("Failed to fetch theme");
            }

            const theme = await res.json();

            setFormData({
                name: theme.name,
                description: theme.description,
                price: theme.price,
                isPremium: theme.isPremium,
                thumbnail: theme.thumbnail || "",
            });

            // Pre-select blocks
            if (theme.blocks) {
                const blockNames = theme.blocks.map((b: any) => b.componentName);
                setSelectedBlocks(new Set(blockNames));
            }
        } catch (error) {
            console.error("fetchThemeData error:", error);
            toast.error("Failed to load theme details");
            // Don't redirect immediately to allow debugging
            // router.push("/admin/themes"); 
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = (componentName: string) => {
        const next = new Set(selectedBlocks);
        if (next.has(componentName)) {
            next.delete(componentName);
        } else {
            next.add(componentName);
        }
        setSelectedBlocks(next);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Theme name is required");
            return;
        }

        setSaving(true);
        try {
            // 1. Create or Update Theme
            const url = isNew ? "/api/admin/themes" : `/api/admin/themes/${themeId}`;
            const method = isNew ? "POST" : "PUT";

            console.log("Saving theme...", { url, method, formData });

            const themeRes = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!themeRes.ok) throw new Error("Failed to save theme metadata");
            const themeData = await themeRes.json();
            const savedThemeId = themeData.id; // Renamed to avoid shadowing

            // 2. Sync Blocks
            // Filter ALL_COMPONENTS to get the full definitions of selected blocks
            const blocksToSave = ALL_COMPONENTS.filter(c => selectedBlocks.has(c.name));

            const blocksRes = await fetch(`/api/admin/themes/${savedThemeId}/blocks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blocks: blocksToSave }),
            });

            if (!blocksRes.ok) throw new Error("Failed to sync blocks");

            toast.success(isNew ? "Theme created successfully" : "Theme updated successfully");
            router.push("/admin/themes");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save theme");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    // Group components by category for better UI
    const componentsByCategory = ALL_COMPONENTS.reduce((acc, component) => {
        const cat = component.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(component);
        return acc;
    }, {} as Record<string, ComponentDefinition[]>);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/themes">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isNew ? "Create Theme" : "Edit Theme"}</h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Theme
                </Button>
            </div>

            <div className="grid gap-8">
                {/* Metadata Section */}
                <div className="space-y-4 border p-6 rounded-lg bg-card shadow-sm">
                    <h3 className="text-lg font-semibold border-b pb-2">Theme Details</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Theme Name</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Modern Business"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="A brief description of this theme..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Thumbnail Image</Label>
                                <div className="flex items-start gap-4">
                                    {formData.thumbnail ? (
                                        <div className="relative aspect-video w-40 rounded-md overflow-hidden border">
                                            <NextImage
                                                src={formData.thumbnail}
                                                alt="Theme Thumbnail"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => setFormData({ ...formData, thumbnail: "" })}
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
                                                    setFormData({ ...formData, thumbnail: result.info.secure_url });
                                                    toast.success("Image uploaded");
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Price ($)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="premium"
                                        checked={formData.isPremium}
                                        onCheckedChange={checked => setFormData({ ...formData, isPremium: checked })}
                                    />
                                    <Label htmlFor="premium">Premium Theme?</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blocks Selection Section */}
                <div className="space-y-4 border p-6 rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-semibold">Available Blocks</h3>
                        <div className="text-sm text-muted-foreground">
                            {selectedBlocks.size} selected
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(componentsByCategory).map(([category, components]) => (
                            <div key={category} className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{category}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {components.map(component => (
                                        <div
                                            key={component.name}
                                            className={`
                                        flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer
                                        ${selectedBlocks.has(component.name) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}
                                    `}
                                            onClick={() => handleBlockToggle(component.name)}
                                        >
                                            <Checkbox
                                                checked={selectedBlocks.has(component.name)}
                                                onCheckedChange={() => handleBlockToggle(component.name)}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    {component.name}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {component.props.length} props configured
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
