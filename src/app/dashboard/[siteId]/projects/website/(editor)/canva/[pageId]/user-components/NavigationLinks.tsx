"use client"

import { useNode, useEditor } from "@craftjs/core"
import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, ArrowRight, ArrowDown } from "lucide-react"
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
    PropertySlider,
    PropertyIconButtonGroup,
} from "../components/PropertySection"

// Navigation link type with submenu support
interface NavLink {
    id?: string
    label: string
    href: string
    submenu?: NavLink[]
}

interface NavigationLinksProps {
    links?: NavLink[]
    direction?: "row" | "column"
    gap?: number
    alignment?: "flex-start" | "center" | "flex-end"
    textColor?: string
    fontSize?: number
    fontWeight?: string

    // Global Decoration & Spacing (generic)
    marginTop?: string
    marginRight?: string
    marginBottom?: string
    marginLeft?: string
    paddingTop?: string
    paddingRight?: string
    paddingBottom?: string
    paddingLeft?: string
    backgroundColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    boxShadow?: string
}

export const NavigationLinks = ({
    links = [
        { id: "nav-1", label: "Home", href: "/" },
        { id: "nav-2", label: "About", href: "/about" },
        { id: "nav-3", label: "Services", href: "/services" },
    ],
    direction = "row",
    gap = 24,
    alignment = "center",
    textColor = "#333333",
    fontSize = 14,
    fontWeight = "500",

    marginTop, marginRight, marginBottom, marginLeft,
    paddingTop, paddingRight, paddingBottom, paddingLeft,
    backgroundColor, borderRadius, borderWidth, borderColor, boxShadow,
}: NavigationLinksProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

    return (
        <nav
            ref={(ref) => ref && connect(drag(ref)) as any}
            style={{
                display: "flex",
                flexDirection: direction,
                justifyContent: alignment,
                alignItems: direction === "column" ? alignment === "flex-start" ? "flex-start" : alignment === "flex-end" ? "flex-end" : "center" : "center",
                gap: `${gap}px`,
                backgroundColor,
                borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                border: borderWidth ? `${borderWidth}px solid ${borderColor}` : undefined,
                boxShadow,
                marginTop, marginRight, marginBottom, marginLeft,
                paddingTop, paddingRight, paddingBottom, paddingLeft,
                width: "100%", // Take full width to allow alignment
            }}
        >
            <ul
                style={{
                    display: "flex",
                    flexDirection: direction,
                    gap: `${gap}px`,
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    width: direction === "column" ? "100%" : "auto", // In column, let items expand or align
                    alignItems: direction === "column" ? alignment === "flex-start" ? "flex-start" : alignment === "flex-end" ? "flex-end" : "center" : "center",
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
                                fontSize: `${fontSize}px`,
                                fontWeight,
                                transition: "opacity 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                whiteSpace: "nowrap",
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
                                    top: direction === "row" ? "100%" : 0,
                                    left: direction === "row" ? 0 : "100%",
                                    minWidth: 180,
                                    backgroundColor: "#fff",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    borderRadius: 6,
                                    padding: "8px 0",
                                    marginTop: direction === "row" ? 4 : 0,
                                    marginLeft: direction === "column" ? 4 : 0,
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
                                            color: textColor, // Use parent text color or specific?
                                            textDecoration: "none",
                                            fontSize: `${fontSize - 1}px`, // Slightly smaller
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
        </nav>
    )
}

// Reuse helper components from Navbar (duplicated here to avoid circular/cross-file deps for now)
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
            <div
                className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${isOpen ? 'bg-muted/30' : ''}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
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

            {isOpen && (
                <div className="p-3 space-y-3 border-t bg-muted/10">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-medium">Label</label>
                        <input
                            value={link.label}
                            onChange={(e) => onChange("label", e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-medium">URL</label>
                        <input
                            value={link.href}
                            onChange={(e) => onChange("href", e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

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
                                <p className="text-[10px] text-muted-foreground">No submenu items</p>
                            </div>
                        )}

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

                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                        <span className="text-[10px] text-muted-foreground">ID: {link.id?.split('-')[1]}</span>
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

export const NavigationLinksSettings = () => {
    const {
        actions: { setProp },
        links,
        direction,
        gap,
        alignment,
        textColor,
        fontSize,
        fontWeight,
    } = useNode((node) => ({
        links: node.data.props.links,
        direction: node.data.props.direction,
        gap: node.data.props.gap,
        alignment: node.data.props.alignment,
        textColor: node.data.props.textColor,
        fontSize: node.data.props.fontSize,
        fontWeight: node.data.props.fontWeight,
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
                setProp((props: NavigationLinksProps) => {
                    props.links = newLinks
                })
            }
        }
    }, [links, setProp])

    const handleLinkChange = (index: number, field: string, value: any) => {
        setProp((props: NavigationLinksProps) => {
            if (props.links) {
                props.links = [...props.links]
                props.links[index] = { ...props.links[index], [field]: value }
            }
        })
    }

    const addLink = () => {
        setProp((props: NavigationLinksProps) => {
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
        setProp((props: NavigationLinksProps) => {
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
            setProp((props: NavigationLinksProps) => {
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
            <PropertySection title="Layout" summary={`${direction}, ${alignment}`}>
                <PropertyRow label="Direction">
                    <PropertyIconButtonGroup
                        value={direction || "row"}
                        onChange={(v) => setProp((props: NavigationLinksProps) => (props.direction = v as "row" | "column"))}
                        options={[
                            { label: "Horizontal", value: "row", icon: ArrowRight },
                            { label: "Vertical", value: "column", icon: ArrowDown },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Alignment">
                    <PropertyIconButtonGroup
                        value={alignment || "center"}
                        onChange={(v) => setProp((props: NavigationLinksProps) => (props.alignment = v as "flex-start" | "center" | "flex-end"))}
                        options={[
                            { label: "Left", value: "flex-start", icon: AlignLeft },
                            { label: "Center", value: "center", icon: AlignCenter },
                            { label: "Right", value: "flex-end", icon: AlignRight },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Gap">
                    <PropertySlider
                        value={gap || 24}
                        onChange={(v) => setProp((props: NavigationLinksProps) => (props.gap = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Typography" summary={`${fontSize}px`}>
                <PropertyRow label="Color">
                    <PropertyColor
                        value={textColor || "#333333"}
                        onChange={(v) => setProp((props: NavigationLinksProps) => (props.textColor = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Size">
                    <PropertySlider
                        value={fontSize || 14}
                        onChange={(v) => setProp((props: NavigationLinksProps) => (props.fontSize = v))}
                        min={10}
                        max={48}
                    />
                </PropertyRow>
                <PropertyRow label="Weight">
                    <select
                        className="w-full bg-background border rounded-md h-8 text-xs px-2"
                        value={fontWeight || "500"}
                        onChange={(e) => setProp((props: NavigationLinksProps) => (props.fontWeight = e.target.value))}
                    >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="700">Bold</option>
                    </select>
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Links" summary={`${links?.length || 0} items`}>
                <div className="space-y-3 border rounded-md p-3 bg-muted/30">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={(links || []).map((link) => link.id || "")}
                            strategy={verticalListSortingStrategy}
                        >
                            {(links || []).map((link, index) => (
                                <LinkEditor
                                    key={link.id}
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
                        Add Link
                    </button>
                </div>
            </PropertySection>
        </div>
    )
}

NavigationLinks.craft = {
    displayName: "Nav Links",
    props: {
        links: [
            { id: "nav-1", label: "Home", href: "/" },
            { id: "nav-2", label: "About", href: "/about" },
            { id: "nav-3", label: "Contact", href: "/contact" },
        ],
        direction: "row",
        gap: 24,
        alignment: "center",
        textColor: "#333333",
        fontSize: 14,
        fontWeight: "500",
    },
    related: {
        settings: NavigationLinksSettings,
    },
}
