"use client"

import { useSite } from "@/components/Contexts/site-id-context"
import MediaLibraryDialog from "@/components/MediaGallery/media-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useFetch } from "@/hooks/useFetch"
import { Article } from "@prisma/client"
import { Calendar } from "@/components/ui/calendar"
import { Check, ChevronsUpDown, CalendarIcon, Image as ImageIcon, Link2, Plus, Tag, Type, Upload, X, AlertCircle, CheckCircle2, Search } from "lucide-react"
import Image from "next/image"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// SEO Settings interface
interface SEOSettings {
    metaTitle: string
    metaDescription: string
    ogImage: string
}

const defaultSEO: SEOSettings = {
    metaTitle: "",
    metaDescription: "",
    ogImage: ""
}

// Helper to calculate article SEO score
const calculateArticleSeoScore = (settings: { title: string; excerpt: string; thumbnail: string; slug: string; seo: SEOSettings }) => {
    let score = 0
    const checks: { status: "pass" | "warn" | "fail"; msg: string }[] = []

    // Use metaTitle if set, otherwise fall back to title
    const metaTitle = settings.seo.metaTitle || settings.title
    // Use metaDescription if set, otherwise fall back to excerpt
    const metaDescription = settings.seo.metaDescription || settings.excerpt
    // Use ogImage if set, otherwise fall back to thumbnail
    const ogImage = settings.seo.ogImage || settings.thumbnail

    // Meta Title Check (30-60 chars)
    if (metaTitle.length >= 30 && metaTitle.length <= 60) {
        score += 25
        checks.push({ status: "pass", msg: "Meta title length is optimal (30-60 chars)" })
    } else if (metaTitle.length > 0) {
        score += 10
        checks.push({ status: "warn", msg: metaTitle.length < 30 ? "Meta title is too short" : "Meta title is too long" })
    } else {
        checks.push({ status: "fail", msg: "Meta title is missing" })
    }

    // Meta Description Check (120-160 chars)
    if (metaDescription.length >= 120 && metaDescription.length <= 160) {
        score += 25
        checks.push({ status: "pass", msg: "Meta description is optimal (120-160 chars)" })
    } else if (metaDescription.length > 0) {
        score += 10
        checks.push({ status: "warn", msg: metaDescription.length < 120 ? "Meta description is too short" : "Meta description is too long" })
    } else {
        checks.push({ status: "fail", msg: "Meta description is missing" })
    }

    // OG Image Check
    if (ogImage) {
        score += 25
        checks.push({ status: "pass", msg: "Social share image is set" })
    } else {
        checks.push({ status: "fail", msg: "Missing social share image" })
    }

    // Slug Check
    if (settings.slug && settings.slug.length >= 3 && /^[a-z0-9-]+$/.test(settings.slug)) {
        score += 25
        checks.push({ status: "pass", msg: "URL slug is valid" })
    } else if (settings.slug) {
        score += 10
        checks.push({ status: "warn", msg: "Slug should be lowercase with hyphens only" })
    } else {
        checks.push({ status: "fail", msg: "URL slug is missing" })
    }

    return { score, checks }
}

const EditorRightSection = ({
    article,
    slug,
    setSlug,
    excerpt,
    setExcerpt,
    setThumbnail, thumbnail,
    categories = [],
    setCategories,
    title = "",
    seo = defaultSEO,
    setSeo,
    aiGenerated,
    setAiGenerated,
    authors = [],
    setAuthors,
    createdAt,
    setCreatedAt,
    onSlugUserEdit,
    onResetSlugFromTitle,
}: {
    article: Article
    slug: string
    setSlug: (val: string) => void
    excerpt: string
    setExcerpt: (val: string) => void
    setThumbnail: (val: string) => void
    thumbnail: string;
    categories?: string[];
    setCategories?: (val: string[]) => void;
    title?: string;
    seo?: SEOSettings;
    setSeo?: (val: SEOSettings) => void;
    aiGenerated?: boolean;
    setAiGenerated?: (val: boolean) => void;
    authors?: string[];
    setAuthors?: (val: string[]) => void;
    createdAt?: Date;
    setCreatedAt?: (val: Date | undefined) => void;
    onSlugUserEdit?: () => void;
    onResetSlugFromTitle?: () => void;
}) => {
    const { siteId } = useSite()
    const [isOpen, setOpen] = useState<boolean>()
    const [isSeoMediaOpen, setSeoMediaOpen] = useState(false)
    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false)
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)

    // SEO Score calculation
    const { score: seoScore, checks: seoChecks } = useMemo(() =>
        calculateArticleSeoScore({ title, excerpt, thumbnail, slug, seo }),
        [title, excerpt, thumbnail, slug, seo]
    )

    const { data: availableCategories, refetch } = useFetch<any[]>(
        siteId ? `/api/team/${siteId}/categories?published=true` : null
    )

    const { data: availableMembers } = useFetch<any[]>(
        siteId ? `/api/team/${siteId}/members` : null
    )

    const toggleAuthor = (authorId: string) => {
        if (!setAuthors) return
        const current = authors || []
        if (current.includes(authorId)) {
            setAuthors(current.filter((id) => id !== authorId))
        } else {
            setAuthors([...current, authorId])
        }
    }

    const removeAuthor = (authorId: string) => {
        if (!setAuthors) return
        setAuthors((authors || []).filter((id) => id !== authorId))
    }

    const getSelectedAuthorNames = () => {
        if (!availableMembers || !authors) return []
        return availableMembers.filter((mem) => authors.includes(mem.id))
    }

    const [newCategoryForm, setNewCategoryForm] = useState({
        name: "",
        description: "",
        slug: "",
    })

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleCreateCategory = async () => {
        if (!siteId) return toast.error("Site not found")
        if (!newCategoryForm.name) return toast.error("Category name is required")

        try {
            const response = await fetch(`/api/team/${siteId}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCategoryForm.name,
                    description: newCategoryForm.description,
                    slug: newCategoryForm.slug || generateSlug(newCategoryForm.name),
                    published: true,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create category")
            }

            const newCategory = await response.json()
            toast.success("Category created successfully")
            setIsCreateCategoryOpen(false)
            setNewCategoryForm({ name: "", description: "", slug: "" })
            refetch()

            // Automatically select the newly created category
            if (setCategories) {
                setCategories([...(categories || []), newCategory.id])
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create category")
        }
    }

    const toggleCategory = (categoryId: string) => {
        if (!setCategories) return
        const current = categories || []
        if (current.includes(categoryId)) {
            setCategories(current.filter((id) => id !== categoryId))
        } else {
            setCategories([...current, categoryId])
        }
    }

    const removeCategory = (categoryId: string) => {
        if (!setCategories) return
        setCategories((categories || []).filter((id) => id !== categoryId))
    }

    const getSelectedCategoryNames = () => {
        if (!availableCategories || !categories) return [] // categories is the prop name I used in replacement
        return availableCategories.filter((cat) => categories.includes(cat.id))
    }

    if (!siteId) return null

    return (
        <>
            <div className="space-y-6">
                {/* SEO Score Panel */}
                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            SEO Score
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <div className={cn("text-lg font-bold leading-none",
                                    seoScore >= 90 ? "text-green-500" :
                                        seoScore >= 50 ? "text-yellow-500" : "text-red-500"
                                )}>
                                    {seoScore}/100
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-muted"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className={cn(
                                            seoScore >= 90 ? "text-green-500" :
                                                seoScore >= 50 ? "text-yellow-500" : "text-red-500"
                                        )}
                                        strokeDasharray={`${seoScore}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {seoChecks.map((check, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                                {check.status === "pass" && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
                                {check.status === "warn" && <AlertCircle className="w-3 h-3 text-yellow-500 shrink-0" />}
                                {check.status === "fail" && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
                                <span className={cn(
                                    check.status === "pass" ? "text-muted-foreground" : "text-foreground"
                                )}>{check.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thumbnail Section */}

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Cover Image</Label>
                    </div>
                    {thumbnail === "" ? (
                        <button
                            onClick={() => setOpen(true)}
                            className="group relative w-full h-48 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                    Upload cover image
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Click to select from media library
                                </div>
                            </div>
                        </button>
                    ) : (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                            <Image
                                src={thumbnail}
                                alt="Cover"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setOpen(true)}
                                    className="gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Change
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setThumbnail("")
                                    }}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Slug Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="slug" className="text-sm font-medium">URL Slug</Label>
                        </div>
                        {onResetSlugFromTitle && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={onResetSlugFromTitle}
                            >
                                Sync from title
                            </Button>
                        )}
                    </div>
                    <Input
                        id="slug"
                        placeholder="article-url-slug"
                        value={slug || ""}
                        onChange={(e) => {
                            onSlugUserEdit?.()
                            setSlug(e.target.value)
                        }}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Auto-updates from the title until you edit this field.
                    </p>
                </div>

                <Separator />

                {/* Publish Date Section */}
                {setCreatedAt && (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-medium">Publish Date</Label>
                                </div>
                                {createdAt && new Date(article.createdAt).getTime() !== createdAt.getTime() && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground"
                                        onClick={() => setCreatedAt(new Date(article.createdAt))}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-9",
                                            !createdAt && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {createdAt
                                            ? createdAt.toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={createdAt}
                                        onSelect={(date) => {
                                            if (!date) return
                                            const prev = createdAt || new Date()
                                            date.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds())
                                            setCreatedAt(date)
                                        }}
                                        initialFocus
                                    />
                                    <div className="border-t px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs text-muted-foreground whitespace-nowrap">Time</Label>
                                            <Input
                                                type="time"
                                                value={createdAt
                                                    ? `${String(createdAt.getHours()).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}`
                                                    : ""}
                                                onChange={(e) => {
                                                    const [h, m] = e.target.value.split(":").map(Number)
                                                    const next = new Date(createdAt || new Date())
                                                    next.setHours(h, m, 0, 0)
                                                    setCreatedAt(next)
                                                }}
                                                className="h-8 text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">
                                Override the date shown on the published article
                            </p>
                        </div>
                        <Separator />
                    </>
                )}

                {/* Authors Section */}
                {setAuthors && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                <span className="text-[8px] font-bold">@</span>
                            </div>
                            <Label className="text-sm font-medium">Authors</Label>
                        </div>

                        {/* Selected Authors */}
                        {getSelectedAuthorNames().length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {getSelectedAuthorNames().map((author) => (
                                    <Badge key={author.id} variant="secondary" className="gap-1.5 pr-1 pl-1.5 py-1">
                                        {author.image ? (
                                            <Image
                                                src={author.image}
                                                alt={author.name}
                                                width={16}
                                                height={16}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full bg-muted-foreground/20" />
                                        )}
                                        {author.name}
                                        <button
                                            onClick={() => removeAuthor(author.id)}
                                            className="ml-0.5 rounded-sm hover:bg-muted p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Author selector */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between h-9 font-normal"
                                >
                                    <span className="text-muted-foreground text-sm">
                                        {getSelectedAuthorNames().length > 0
                                            ? `${getSelectedAuthorNames().length} selected`
                                            : "Select authors..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search team members..." />
                                    <CommandEmpty>No members found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {availableMembers?.map((member) => (
                                            <CommandItem
                                                key={member.id}
                                                value={member.name}
                                                onSelect={() => toggleAuthor(member.id)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Checkbox
                                                        checked={authors?.includes(member.id)}
                                                        onCheckedChange={() => toggleAuthor(member.id)}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        {member.image ? (
                                                            <Image
                                                                src={member.image}
                                                                alt={member.name}
                                                                width={20}
                                                                height={20}
                                                                className="rounded-full object-cover w-5 h-5"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-muted-foreground/20" />
                                                        )}
                                                        <span className="text-sm">{member.name}</span>
                                                    </div>
                                                </div>
                                                <Check
                                                    className={`ml-auto h-4 w-4 ${authors?.includes(member.id) ? "opacity-100" : "opacity-0"
                                                        }`}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <Separator />

                {/* Categories Section */}
                {setCategories && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Categories</Label>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreateCategoryOpen(true)}
                                className="h-7 gap-1.5 text-xs"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                New
                            </Button>
                        </div>

                        {/* Selected categories */}
                        {getSelectedCategoryNames().length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {getSelectedCategoryNames().map((category) => (
                                    <Badge key={category.id} variant="secondary" className="gap-1.5 pr-1 pl-2.5">
                                        {category.name}
                                        <button
                                            onClick={() => removeCategory(category.id)}
                                            className="ml-0.5 rounded-sm hover:bg-muted p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Category selector */}
                        <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={categoryPopoverOpen}
                                    className="w-full justify-between h-9 font-normal"
                                >
                                    <span className="text-muted-foreground text-sm">
                                        {getSelectedCategoryNames().length > 0
                                            ? `${getSelectedCategoryNames().length} selected`
                                            : "Select categories..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search categories..." />
                                    <CommandEmpty>No categories found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {availableCategories?.map((category) => (
                                            <CommandItem
                                                key={category.id}
                                                value={category.name}
                                                onSelect={() => toggleCategory(category.id)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Checkbox
                                                        checked={categories?.includes(category.id)}
                                                        onCheckedChange={() => toggleCategory(category.id)}
                                                    />
                                                    <span className="text-sm">{category.name}</span>
                                                </div>
                                                <Check
                                                    className={`ml-auto h-4 w-4 ${categories?.includes(category.id) ? "opacity-100" : "opacity-0"
                                                        }`}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <Separator />

                {/* Excerpt Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                    </div>
                    <Textarea
                        id="excerpt"
                        placeholder="Brief summary of your article..."
                        value={excerpt || ""}
                        onChange={e => setExcerpt(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        A short description that appears in article previews
                    </p>
                </div>

                <Separator />

                {/* AI Generated Toggle */}
                {setAiGenerated && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ai-generated"
                                    checked={aiGenerated || false}
                                    onCheckedChange={(checked) => setAiGenerated(!!checked)}
                                />
                                <Label htmlFor="ai-generated" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    AI Generated Content
                                </Label>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Mark this article as created with AI assistance
                        </p>
                    </div>
                )}

                {/* SEO Settings Section */}
                {setSeo && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">SEO Settings</Label>
                            </div>

                            {/* Meta Title */}
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle" className="text-xs text-muted-foreground">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    placeholder={title || "Page title for search engines"}
                                    value={seo.metaTitle || ""}
                                    onChange={e => setSeo({ ...seo, metaTitle: e.target.value })}
                                />
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">Recommended: 30-60 characters</span>
                                    <span className={cn(
                                        ((seo.metaTitle || title).length < 30 || (seo.metaTitle || title).length > 60) ? "text-orange-500" : "text-green-500"
                                    )}>{(seo.metaTitle || title).length} chars</span>
                                </div>
                            </div>

                            {/* Meta Description */}
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription" className="text-xs text-muted-foreground">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    placeholder={excerpt || "Description for search engines..."}
                                    value={seo.metaDescription || ""}
                                    onChange={e => setSeo({ ...seo, metaDescription: e.target.value })}
                                    rows={3}
                                    className="resize-none"
                                />
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">Recommended: 120-160 characters</span>
                                    <span className={cn(
                                        ((seo.metaDescription || excerpt).length < 120 || (seo.metaDescription || excerpt).length > 160) ? "text-orange-500" : "text-green-500"
                                    )}>{(seo.metaDescription || excerpt).length} chars</span>
                                </div>
                            </div>

                            {/* OG Image */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-muted-foreground">Social Share Image</Label>
                                    {seo.ogImage && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-destructive hover:text-destructive px-2"
                                            onClick={() => setSeo({ ...seo, ogImage: "" })}
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSeoMediaOpen(true)}
                                    className={cn(
                                        "w-full h-24 border rounded-lg flex items-center justify-center transition-all",
                                        seo.ogImage ? "p-1" : "border-dashed hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    {seo.ogImage ? (
                                        <Image
                                            src={seo.ogImage}
                                            alt="OG Image"
                                            width={200}
                                            height={100}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                            <ImageIcon className="h-5 w-5" />
                                            <span className="text-xs">Set social image</span>
                                        </div>
                                    )}
                                </button>
                                <p className="text-[10px] text-muted-foreground">
                                    Used when sharing on social media. Falls back to cover image if not set.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Category Dialog */}
            <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                            Add a new category to organize your articles
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Name *</Label>
                            <Input
                                id="cat-name"
                                value={newCategoryForm.name}
                                onChange={(e) => {
                                    const name = e.target.value
                                    setNewCategoryForm((prev) => {
                                        const autoSlug =
                                            !prev.slug ||
                                            prev.slug === generateSlug(prev.name)
                                        return {
                                            ...prev,
                                            name,
                                            slug: autoSlug ? generateSlug(name) : prev.slug,
                                        }
                                    })
                                }}
                                placeholder="Technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-slug">Slug *</Label>
                            <Input
                                id="cat-slug"
                                value={newCategoryForm.slug}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, slug: e.target.value })}
                                placeholder="technology"
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-description">Description</Label>
                            <Textarea
                                id="cat-description"
                                value={newCategoryForm.description}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                                placeholder="Category description..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCategory}>Create & Select</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MediaLibraryDialog
                isOpen={!!isOpen}
                onClose={() => setOpen(false)}
                onSelect={(e) => setThumbnail(e[0].url)}
                siteId={siteId}
                suggestedAspectRatio={16 / 9}
            />

            {/* SEO OG Image Media Dialog */}
            {setSeo && (
                <MediaLibraryDialog
                    isOpen={isSeoMediaOpen}
                    onClose={() => setSeoMediaOpen(false)}
                    onSelect={(e) => {
                        setSeo({ ...seo, ogImage: e[0].url })
                        setSeoMediaOpen(false)
                    }}
                    siteId={siteId}
                    suggestedAspectRatio={1.91}
                />
            )}
        </>
    )
}

export default EditorRightSection
