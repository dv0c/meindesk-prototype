"use client"

import { useNode, useEditor } from "@craftjs/core"
import React, { useState, useEffect } from "react"
import { Menu, X, ChevronDown, ChevronUp, Mail, Phone, Plus, Trash2, GripVertical } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    PropertySection,
    PropertyRow,
    PropertyColor,
    PropertyInput,
} from "../components/PropertySection"


// Navigation link type with submenu support
interface NavLink {
    id?: string
    label: string
    href: string
    submenu?: NavLink[]
}

interface NavbarProps {
    // Brand
    brandName?: string
    tagline?: string
    brandColor?: string
    // Colors
    backgroundColor?: string
    textColor?: string
    topBarBackground?: string
    topBarTextColor?: string
    // Contact
    email?: string
    phone?: string
    facebookUrl?: string
    instagramUrl?: string
    // Navigation
    links?: NavLink[]
    // Layout
    showTopBar?: boolean
    maxWidth?: string

    // Global Decoration
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    boxShadow?: string
    // Global Alignment (Spacing)
    marginTop?: string
    marginRight?: string
    marginBottom?: string
    marginLeft?: string
    paddingTop?: string
    paddingRight?: string
    paddingBottom?: string
    paddingLeft?: string
}

export const Navbar = ({
    brandName = "Your Brand",
    tagline = "",
    brandColor = "#333333",
    backgroundColor = "transparent", // Wrapper defaults to transparent
    navBackgroundColor = "#ffffff", // New prop for generic nav background
    textColor = "#333333",
    topBarBackground = "#000000",
    topBarTextColor = "#ffffff",
    email = "",
    phone = "",
    facebookUrl = "",
    instagramUrl = "",
    links = [
        { id: "nav-1", label: "Home", href: "/" },
        { id: "nav-2", label: "About", href: "/about" },
        {
            id: "nav-3", label: "Services", href: "/services", submenu: [
                { id: "sub-1", label: "Web Design", href: "/services/web" },
                { id: "sub-2", label: "SEO", href: "/services/seo" },
            ]
        },
        { id: "nav-4", label: "Contact", href: "/contact" },
    ],
    showTopBar = true,
    maxWidth = "1200px",
    borderRadius,
    borderWidth,
    borderColor,
    boxShadow,
    marginTop, marginRight, marginBottom, marginLeft,
    paddingTop, paddingRight, paddingBottom, paddingLeft,
}: NavbarProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

    return (
        <div
            ref={(ref) => ref && connect(drag(ref)) as any}
            style={{
                width: "100%",
                backgroundColor, // Wrapper background
                borderRadius: `${borderRadius || 0}px`,
                border: borderWidth ? `${borderWidth}px solid ${borderColor}` : "none",
                boxShadow,
                marginTop, marginRight, marginBottom, marginLeft,
                paddingTop, paddingRight, paddingBottom, paddingLeft,
            }}
        >
            {/* Top Bar */}
            {showTopBar && (email || phone || facebookUrl || instagramUrl) && (
                <div
                    style={{
                        backgroundColor: topBarBackground,
                        color: topBarTextColor,
                        padding: "8px 20px",
                    }}
                >
                    <div
                        style={{
                            maxWidth,
                            margin: "0 auto",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 13,
                        }}
                    >
                        {/* Social Links */}
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            {facebookUrl && (
                                <a href={facebookUrl} target="_blank" rel="noreferrer" style={{ color: topBarTextColor }}>
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                            )}
                            {instagramUrl && (
                                <a href={instagramUrl} target="_blank" rel="noreferrer" style={{ color: topBarTextColor }}>
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.847 5.847 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                        {/* Contact Info */}
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            {email && (
                                <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 6, color: topBarTextColor, textDecoration: "none" }}>
                                    <Mail size={13} />
                                    <span>{email}</span>
                                </a>
                            )}
                            {phone && (
                                <a href={`tel:${phone}`} style={{ display: "flex", alignItems: "center", gap: 6, color: topBarTextColor, textDecoration: "none" }}>
                                    <Phone size={13} />
                                    <span>{phone}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Nav */}
            <nav
                style={{
                    backgroundColor: navBackgroundColor,
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    padding: "16px 20px",
                }}
            >
                <div
                    style={{
                        maxWidth,
                        margin: "0 auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Brand */}
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: brandColor }}>
                            {brandName}
                        </div>
                        {tagline && (
                            <div style={{ fontSize: 14, color: textColor, opacity: 0.8 }}>
                                {tagline}
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <ul
                        style={{
                            display: "flex",
                            gap: 24,
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        {links.map((link, index) => (
                            <li
                                key={index}
                                style={{ position: "relative" }}
                                onMouseEnter={() => link.submenu && setOpenSubmenu(index)}
                                onMouseLeave={() => setOpenSubmenu(null)}
                            >
                                <a
                                    href={link.href}
                                    style={{
                                        color: textColor,
                                        textDecoration: "none",
                                        fontSize: 14,
                                        fontWeight: 500,
                                        transition: "opacity 0.2s",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    {link.label}
                                    {link.submenu && link.submenu.length > 0 && (
                                        <ChevronDown size={14} style={{ opacity: 0.6 }} />
                                    )}
                                </a>
                                {/* Submenu dropdown */}
                                {link.submenu && link.submenu.length > 0 && openSubmenu === index && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            minWidth: 180,
                                            backgroundColor: "#fff",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            borderRadius: 6,
                                            padding: "8px 0",
                                            marginTop: 4,
                                            zIndex: 100,
                                        }}
                                    >
                                        {link.submenu.map((sub, subIdx) => (
                                            <a
                                                key={subIdx}
                                                href={sub.href}
                                                style={{
                                                    display: "block",
                                                    padding: "8px 16px",
                                                    color: textColor,
                                                    textDecoration: "none",
                                                    fontSize: 13,
                                                    transition: "background 0.15s",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                            >
                                                {sub.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: "none",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: textColor,
                        }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>
        </div>
    )
}

// Sortable Submenu Item
interface SortableSubmenuItemProps {
    sub: NavLink
    subIdx: number
    updateSubmenuItem: (idx: number, field: string, value: string) => void
    removeSubmenuItem: (idx: number) => void
}

const SortableSubmenuItem = ({ sub, subIdx, updateSubmenuItem, removeSubmenuItem }: SortableSubmenuItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sub.id || `sub-${subIdx}` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
    }



    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative flex gap-2 mb-2 p-2 bg-background border border-border/50 rounded-md items-start hover:border-border transition-colors"
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
            >
                <GripVertical size={14} />
            </div>
            <div className="flex-1 space-y-2">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground font-medium">Label</label>
                    <input
                        value={sub.label}
                        onChange={(e) => updateSubmenuItem(subIdx, "label", e.target.value)}
                        placeholder="Label"
                        className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground font-medium">URL</label>
                    <input
                        value={sub.href}
                        onChange={(e) => updateSubmenuItem(subIdx, "href", e.target.value)}
                        placeholder="URL"
                        className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
            </div>
            <button
                onClick={() => removeSubmenuItem(subIdx)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={14} />
            </button>
        </div>
    )
}

// Accordion-style link editor with internal Drag and Drop for Submenus
interface LinkEditorProps {
    link: NavLink
    index: number
    isOpen: boolean
    onToggle: () => void
    onChange: (field: string, value: any) => void
    onRemove: () => void
}

const LinkEditor = ({
    link,
    index,
    isOpen,
    onToggle,
    onChange,
    onRemove,
}: LinkEditorProps) => {

    // Sortable hooks for the parent item
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id || `link-${index}` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
        position: 'relative' as 'relative',
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const addSubmenuItem = () => {
        const newSubmenu = [...(link.submenu || []), { id: `sub-${Date.now()}`, label: "New Submenu", href: "/" }]
        onChange("submenu", newSubmenu)
    }

    const removeSubmenuItem = (subIndex: number) => {
        const newSubmenu = (link.submenu || []).filter((_, i) => i !== subIndex)
        onChange("submenu", newSubmenu.length > 0 ? newSubmenu : undefined)
    }

    const updateSubmenuItem = (subIndex: number, field: string, value: string) => {
        const newSubmenu = [...(link.submenu || [])]
        newSubmenu[subIndex] = { ...newSubmenu[subIndex], [field]: value }
        onChange("submenu", newSubmenu)
    }

    // Handle submenu drag end
    const handleSubDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const currentSubmenu = link.submenu || []
            const oldIndex = currentSubmenu.findIndex((sub) => (sub.id || `sub-${currentSubmenu.indexOf(sub)}`) === active.id)
            const newIndex = currentSubmenu.findIndex((sub) => (sub.id || `sub-${currentSubmenu.indexOf(sub)}`) === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSubmenu = arrayMove(currentSubmenu, oldIndex, newIndex)
                onChange("submenu", newSubmenu)
            }
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`border rounded-md overflow-hidden mb-2 bg-background ${isOpen ? 'ring-1 ring-ring border-transparent' : 'border-border'}`}
        >
            {/* Header */}
            <div
                className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${isOpen ? 'bg-muted/30' : ''}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                    >
                        <GripVertical size={14} />
                    </div>

                    <span className="text-xs font-medium truncate">
                        {link.label || `Link ${index + 1}`}
                    </span>
                    {link.submenu && link.submenu.length > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto mr-2">
                            {link.submenu.length}
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </div>

            {/* Content */}
            {isOpen && (
                <div className="p-3 space-y-3 border-t bg-muted/10">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-medium">
                            Label
                        </label>
                        <input
                            value={link.label}
                            onChange={(e) => onChange("label", e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-medium">
                            URL
                        </label>
                        <input
                            value={link.href}
                            onChange={(e) => onChange("href", e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {/* Submenu Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase text-muted-foreground font-medium">Submenu Items</span>
                            <button
                                onClick={addSubmenuItem}
                                className="flex items-center gap-1 px-2 py-1 h-6 text-[10px] font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                            >
                                <Plus size={10} />
                                Add
                            </button>
                        </div>

                        {(!link.submenu || link.submenu.length === 0) && (
                            <div className="text-center py-2 border border-dashed rounded-md">
                                <p className="text-[10px] text-muted-foreground">
                                    No submenu items
                                </p>
                            </div>
                        )}

                        {/* Internal Sortable Context for Submenu */}
                        {link.submenu && link.submenu.length > 0 && (
                            <div className="space-y-2 pl-3 border-l-2 border-muted">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleSubDragEnd}
                                >
                                    <SortableContext
                                        items={(link.submenu || []).map((sub, idx) => sub.id || `sub-${idx}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {link.submenu?.map((sub, subIdx) => (
                                            <SortableSubmenuItem
                                                key={sub.id || `sub-${subIdx}`}
                                                sub={sub}
                                                subIdx={subIdx}
                                                updateSubmenuItem={updateSubmenuItem}
                                                removeSubmenuItem={removeSubmenuItem}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                        <span className="text-[10px] text-muted-foreground">
                            ID: {link.id?.split('-')[1]}
                        </span>
                        <button
                            onClick={onRemove}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                            <Trash2 size={12} />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Settings component for Navbar
export const NavbarSettings = () => {
    const {
        actions: { setProp },
        brandName,
        tagline,
        brandColor,
        navBackgroundColor,
        backgroundColor,
        textColor,
        topBarBackground,
        topBarTextColor,
        email,
        phone,
        facebookUrl,
        instagramUrl,
        showTopBar,
        links,
    } = useNode((node) => ({
        brandName: node.data.props.brandName,
        tagline: node.data.props.tagline,
        brandColor: node.data.props.brandColor,
        navBackgroundColor: node.data.props.navBackgroundColor || node.data.props.backgroundColor, // Fallback for migration
        textColor: node.data.props.textColor,
        topBarBackground: node.data.props.topBarBackground,
        topBarTextColor: node.data.props.topBarTextColor,
        email: node.data.props.email,
        phone: node.data.props.phone,
        facebookUrl: node.data.props.facebookUrl,
        instagramUrl: node.data.props.instagramUrl,
        showTopBar: node.data.props.showTopBar,
        links: node.data.props.links,
    }))

    const [openLinkIndex, setOpenLinkIndex] = useState<number | null>(null)

    // Ensure links have IDs
    useEffect(() => {
        if (links) {
            let hasMissingId = false
            const newLinks = links.map((link: NavLink) => {
                let linkChanged = false
                let newLink = { ...link }

                if (!link.id) {
                    hasMissingId = true
                    linkChanged = true
                    newLink.id = `link-${Math.random().toString(36).substr(2, 9)}`
                }

                // Ensure submenus have IDs too
                if (link.submenu) {
                    const newSubmenu = link.submenu.map((sub: NavLink) => {
                        if (!sub.id) {
                            hasMissingId = true
                            linkChanged = true
                            return { ...sub, id: `sub-${Math.random().toString(36).substr(2, 9)}` }
                        }
                        return sub
                    })
                    if (JSON.stringify(newSubmenu) !== JSON.stringify(link.submenu)) {
                        newLink.submenu = newSubmenu
                        linkChanged = true
                    }
                }
                return newLink
            })

            if (hasMissingId) {
                setProp((props: NavbarProps) => {
                    props.links = newLinks
                })
            }
        }
    }, [links, setProp])

    const handleLinkChange = (index: number, field: string, value: any) => {
        setProp((props: NavbarProps) => {
            if (props.links) {
                props.links = [...props.links]
                props.links[index] = { ...props.links[index], [field]: value }
            }
        })
    }

    const addLink = () => {
        setProp((props: NavbarProps) => {
            const newLink = {
                id: `link-${Date.now()}`,
                label: "New Link",
                href: "/"
            }
            props.links = [...(props.links || []), newLink]
        })
        setOpenLinkIndex((links || []).length)
    }

    const removeLink = (index: number) => {
        setProp((props: NavbarProps) => {
            props.links = (props.links || []).filter((_, i) => i !== index)
        })
        setOpenLinkIndex(null)
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setProp((props: NavbarProps) => {
                const oldIndex = (props.links || []).findIndex((item) => item.id === active.id)
                const newIndex = (props.links || []).findIndex((item) => item.id === over.id)

                if (oldIndex !== -1 && newIndex !== -1) {
                    props.links = arrayMove(props.links || [], oldIndex, newIndex)
                }
            })
        }
    }

    return (
        <div>


            <PropertySection title="Brand" summary={brandName}>
                <PropertyRow label="Name">
                    <PropertyInput
                        value={brandName || ""}
                        onChange={(v) => setProp((props: NavbarProps) => (props.brandName = v))}
                        placeholder="Your Brand"
                    />
                </PropertyRow>
                <PropertyRow label="Tagline">
                    <PropertyInput
                        value={tagline || ""}
                        onChange={(v) => setProp((props: NavbarProps) => (props.tagline = v))}
                        placeholder="Optional tagline"
                    />
                </PropertyRow>
                <PropertyRow label="Brand Color">
                    <PropertyColor
                        value={brandColor || "#333333"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.brandColor = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Colors" summary="" defaultOpen={false}>
                <PropertyRow label="Nav Background">
                    <PropertyColor
                        value={navBackgroundColor || "#ffffff"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.navBackgroundColor = v))}
                        placeholder="#ffffff"
                    />
                </PropertyRow>
                <PropertyRow label="Text Color">
                    <PropertyColor
                        value={textColor || "#333333"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.textColor = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Top Bar" summary={showTopBar ? "Visible" : "Hidden"} defaultOpen={false}>
                <PropertyRow label="Show Top Bar">
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={showTopBar}
                            onChange={(e) => setProp((props: NavbarProps) => (props.showTopBar = e.target.checked))}
                        />
                        <span style={{ fontSize: 13 }}>Show top bar</span>
                    </label>
                </PropertyRow>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={topBarBackground || "#000000"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.topBarBackground = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Text Color">
                    <PropertyColor
                        value={topBarTextColor || "#ffffff"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.topBarTextColor = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Contact Info" summary="" defaultOpen={false}>
                <PropertyRow label="Email">
                    <PropertyInput
                        value={email || ""}
                        onChange={(v) => setProp((props: NavbarProps) => (props.email = v))}
                        placeholder="email@example.com"
                    />
                </PropertyRow>
                <PropertyRow label="Phone">
                    <PropertyInput
                        value={phone || ""}
                        onChange={(v) => setProp((props: NavbarProps) => (props.phone = v))}
                        placeholder="+1 234 567 890"
                    />
                </PropertyRow>
                <PropertyRow label="Facebook URL">
                    <PropertyInput
                        value={facebookUrl || ""}
                        onChange={(v) => setProp((props: NavbarProps) => (props.facebookUrl = v))}
                        placeholder="https://facebook.com/..."
                    />
                </PropertyRow>
                <PropertyRow label="Instagram URL">
                    <PropertyInput
                        value={instagramUrl || ""}
                        onChange={(v) => setProp((props: NavbarProps) => (props.instagramUrl = v))}
                        placeholder="https://instagram.com/..."
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Navigation Links" summary={`${(links || []).length} links`}>
                <div className="space-y-3 border rounded-md p-3 bg-muted/30">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={(links || []).map((link: NavLink) => link.id || "")}
                            strategy={verticalListSortingStrategy}
                        >
                            {(links || []).map((link: NavLink, index: number) => (
                                <LinkEditor
                                    key={link.id || index}
                                    link={link}
                                    index={index}
                                    isOpen={openLinkIndex === index}
                                    onToggle={() => setOpenLinkIndex(openLinkIndex === index ? null : index)}
                                    onChange={(field, value) => handleLinkChange(index, field, value)}
                                    onRemove={() => removeLink(index)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button
                        onClick={addLink}
                        className="w-full py-2 px-3 bg-secondary text-secondary-foreground rounded-md text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-secondary/80 transition-colors"
                    >
                        <Plus size={14} />
                        Add Navigation Link
                    </button>
                </div>
            </PropertySection>
        </div>
    )
}

Navbar.craft = {
    displayName: "Navbar",
    props: {
        brandName: "Your Brand",
        tagline: "",
        brandColor: "#333333",
        navBackgroundColor: "#ffffff",
        backgroundColor: "transparent",
        textColor: "#333333",
        topBarBackground: "#000000",
        topBarTextColor: "#ffffff",
        email: "hello@example.com",
        phone: "+1 234 567 890",
        facebookUrl: "",
        instagramUrl: "",
        showTopBar: true,
        maxWidth: "1200px",
        links: [
            { id: "nav-1", label: "Home", href: "/" },
            { id: "nav-2", label: "About", href: "/about" },
            {
                id: "nav-3", label: "Services", href: "/services", submenu: [
                    { id: "sub-1", label: "Web Design", href: "/services/web" },
                    { id: "sub-2", label: "SEO", href: "/services/seo" },
                ]
            },
            { id: "nav-4", label: "Contact", href: "/contact" },
        ],
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: NavbarSettings,
    },
}
