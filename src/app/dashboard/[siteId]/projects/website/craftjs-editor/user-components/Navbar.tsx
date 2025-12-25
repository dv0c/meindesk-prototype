"use client"

import { useNode, useEditor } from "@craftjs/core"
import React, { useState, useEffect } from "react"
import { Menu, ChevronDown, ChevronUp, Mail, Phone, Plus, Trash2, GripVertical, ImageIcon } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
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
} from "../components/PropertySection"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import MediaLibraryDialog, { MediaItem } from "@/components/MediaGallery/media-select"

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
    navBackgroundColor?: string
    topBarBackground?: string
    topBarTextColor?: string
    textColor?: string
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
    // Banner
    bannerImage?: string
    bannerOpacity?: number
}

// Icons
const Instagram = ({ fill = "#fff" }: { fill?: string }) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="15px" width="15px">
        <path
            d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.847 5.847 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z"
            fill={fill}
        />
    </svg>
)

const Facebook = ({ fill = "#fff" }: { fill?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="15px" width="15px">
        <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            fill={fill}
        />
    </svg>
)

// Desktop Navigation Links
function DesktopNavLinks({ links, textColor }: { links: NavLink[], textColor: string }) {
    const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

    return (
        <ul className="hidden @lg:flex flex-wrap max-w-full gap-x-4 md:gap-x-6 items-baseline z-10 list-none m-0 p-0">
            {links.map((link, index) => (
                <li
                    key={index}
                    className="relative"
                    onMouseEnter={() => link.submenu && setOpenSubmenu(index)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                >
                    {link.submenu && link.submenu.length > 0 ? (
                        <div className="menu-item group relative">
                            <div className="flex items-center gap-2 cursor-pointer h-full transition-all group-hover:underline text-[.8875rem]" style={{ color: textColor }}>
                                <span>{link.label}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-3 h-3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                            {openSubmenu === index && (
                                <div className="absolute h-auto z-10 top-full mt-px right-0 bg-white border rounded-sm shadow-lg py-1">
                                    <ul className="p-0 space-y-2 min-w-[200px] list-none">
                                        {link.submenu.map((subItem, subIndex) => (
                                            <li key={subIndex}>
                                                <a
                                                    href={subItem.href}
                                                    className="block uppercase px-3 py-1.5 w-full hover:underline tracking-wide text-[.875rem]"
                                                    style={{ color: textColor }}
                                                >
                                                    {subItem.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a
                            className="menu-item hover:underline font-normal transition-all text-[.8875rem]"
                            href={link.href}
                            style={{ color: textColor }}
                        >
                            {link.label}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    )
}

// Mobile Menu Component
function MobileMenu({ links, brandColor, email, phone, facebookUrl, instagramUrl }: {
    links: NavLink[],
    brandColor: string,
    email?: string,
    phone?: string,
    facebookUrl?: string,
    instagramUrl?: string
}) {
    return (
        <Sheet>
            <SheetTrigger aria-label="menu" className="block @lg:hidden z-10">
                <Menu className="h-8 w-8 text-black" />
            </SheetTrigger>
            <SheetContent className="pt-12 bg-white">
                <div style={{ color: brandColor }}>
                    <ul className="flex flex-col gap-4 list-none p-0">
                        {links.map((item, i) => (
                            <li key={i} className="border-b-[hsla(40,26%,73%,.4)] transition-all border-b py-2 cursor-pointer group">
                                <a
                                    className="group-hover:font-semibold transition-all block w-full"
                                    href={item.href}
                                >
                                    {item.label}
                                </a>
                                {item.submenu && item.submenu.length > 0 && (
                                    <ul className="pl-4 mt-2 space-y-2 list-none">
                                        {item.submenu.map((subItem, subIndex) => (
                                            <li key={subIndex}>
                                                <a
                                                    className="text-sm hover:font-semibold transition-all block"
                                                    href={subItem.href}
                                                >
                                                    {subItem.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="border-b-[hsla(40,26%,73%,.4)] mt-5">
                        <div className="pb-5 border-b space-y-4 border-b-[hsla(40,26%,73%,.4)]">
                            {email && (
                                <a href={`mailto:${email}`} className="items-center flex gap-1 space-x-2">
                                    <Mail size={15} className="stroke-[#ccc0a8] mt-1" />
                                    <span className="text-black border-b truncate font-medium hover:border-b-gray-100 transition-all border-b-gray-500 text-sm">
                                        {email}
                                    </span>
                                </a>
                            )}
                            {phone && (
                                <a href={`tel:${phone}`} className="items-center space-x-2 flex gap-1">
                                    <Phone size={15} className="stroke-[#ccc0a8] mt-1" />
                                    <span className="text-black border-b font-medium hover:border-b-gray-100 transition-all border-b-gray-500 text-sm">
                                        {phone}
                                    </span>
                                </a>
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            {facebookUrl && (
                                <a href={facebookUrl} target="_blank" rel="noreferrer noopener">
                                    <Facebook fill="#ccc0a8" />
                                </a>
                            )}
                            {instagramUrl && (
                                <a href={instagramUrl} target="_blank" rel="noreferrer noopener">
                                    <Instagram fill="#ccc0a8" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Fixed Navigation (appears on scroll)
function FixedNav({ links, brandName, brandColor, textColor, maxWidth, isScrolled }: {
    links: NavLink[],
    brandName: string,
    brandColor: string,
    textColor: string,
    maxWidth: string,
    isScrolled: boolean
}) {
    return (
        <nav
            className={cn(
                "opacity-0 invisible fixed top-0 left-0 w-full shadow-md bg-white transition-all duration-300 z-50 px-5 border-b",
                isScrolled && "opacity-100 visible",
            )}
        >
            <div
                className="mx-auto md:py-5 py-5 flex justify-between lg:gap-20 items-center"
                style={{ maxWidth }}
            >
                <a
                    href="/"
                    className="md:text-4xl text-xl sm:text-2xl"
                    style={{ color: brandColor }}
                >
                    {brandName}
                </a>

                <DesktopNavLinks links={links} textColor={textColor} />

                <div className="block lg:hidden">
                    <MobileMenu links={links} brandColor={brandColor} />
                </div>
            </div>
        </nav>
    )
}

export const Navbar = ({
    brandName = "Σοφία Πλατανησιώτη",
    tagline = "Σύμβουλος Ψυχικής Υγείας",
    brandColor = "#5a5933",
    navBackgroundColor = "#a9c8be",
    topBarBackground = "#000000",
    topBarTextColor = "#ffffff",
    textColor = "#000000",
    email = "platanisiotisophia@gmail.com",
    phone = "+30 6947777532",
    facebookUrl = "https://www.facebook.com/PlatanisiotiSophia",
    instagramUrl = "https://www.instagram.com/sophia.platanisioti",
    links = [
        { id: "nav-1", label: "ΑΡΧΙΚΗ", href: "/" },
        { id: "nav-2", label: "ΥΠΗΡΕΣΙΕΣ", href: "/services" },
        { id: "nav-3", label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/about" },
        { id: "nav-4", label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact" },
    ],
    showTopBar = true,
    maxWidth = "90vw",
    bannerImage = "",
    bannerOpacity = 80,
}: NavbarProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    // Simple scroll detection for the fixed nav
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div
            ref={(ref) => ref && connect(drag(ref)) as any}
            className="w-full max-w-full relative @container overflow-hidden"
            style={{ fontFamily: "var(--design-font-base, sans-serif)" }}
        >
            {/* Top Bar - Desktop */}
            {showTopBar && (
                <section className="hidden @lg:block" style={{ backgroundColor: topBarBackground }}>
                    <div className="max-w-5xl mx-auto flex justify-between items-center px-5">
                        <div className="flex items-center gap-3 py-3">
                            {facebookUrl && (
                                <a href={facebookUrl} target="_blank" rel="noreferrer noopener">
                                    <Facebook fill={topBarTextColor} />
                                </a>
                            )}
                            {instagramUrl && (
                                <a href={instagramUrl} target="_blank" rel="noreferrer noopener">
                                    <Instagram fill={topBarTextColor} />
                                </a>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {email && (
                                <a href={`mailto:${email}`} className="items-center flex gap-1">
                                    <Mail size={15} style={{ color: topBarTextColor }} className="mt-1" />
                                    <span
                                        className="border-b hover:border-b-gray-100 transition-all border-b-gray-500 text-sm font-light"
                                        style={{ color: topBarTextColor }}
                                    >
                                        {email}
                                    </span>
                                </a>
                            )}
                            {phone && (
                                <a href={`tel:${phone}`} className="items-center flex gap-1">
                                    <Phone size={15} style={{ color: topBarTextColor }} className="mt-1" />
                                    <span
                                        className="border-b hover:border-b-gray-100 transition-all border-b-gray-500 text-sm font-light"
                                        style={{ color: topBarTextColor }}
                                    >
                                        {phone}
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Main Nav */}
            <nav
                className="relative px-5 border-b border-b-black/40 z-0"
                style={{ backgroundColor: navBackgroundColor }}
            >
                <section
                    className="mx-auto h-24 md:h-40 flex gap-20 items-center justify-between lg:justify-start"
                    style={{ maxWidth }}
                >
                    <a href="/" className="z-10 min-w-0 flex-shrink">
                        <h1
                            className="text-lg @sm:text-xl @md:text-2xl @lg:text-4xl mb-1 @md:mb-2 truncate"
                            style={{
                                color: brandColor,
                                fontFamily: "var(--design-font-heading, inherit)",
                                fontWeight: "var(--design-font-weight-heading, 500)"
                            }}
                        >
                            {brandName}
                        </h1>
                        {tagline && (
                            <h2
                                className="text-xs @sm:text-sm @md:text-base @lg:text-[1.3125rem] truncate"
                                style={{ color: textColor }}
                            >
                                {tagline}
                            </h2>
                        )}
                    </a>

                    <DesktopNavLinks links={links} textColor={textColor} />

                    <MobileMenu
                        links={links}
                        brandColor={brandColor}
                        email={email}
                        phone={phone}
                        facebookUrl={facebookUrl}
                        instagramUrl={instagramUrl}
                    />
                </section>

                {/* Banner Background */}
                {bannerImage && (
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <Image
                            src={bannerImage}
                            fill
                            alt="banner"
                            className="object-cover pr-[20px]"
                            style={{ opacity: bannerOpacity / 100 }}
                            priority
                        />
                    </div>
                )}
            </nav>

            {/* Fixed Nav on Scroll */}
            <FixedNav
                links={links}
                brandName={brandName}
                brandColor={brandColor}
                textColor={textColor}
                maxWidth={maxWidth}
                isScrolled={isScrolled}
            />
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

// Accordion-style link editor
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
        textColor,
        topBarBackground,
        topBarTextColor,
        email,
        phone,
        facebookUrl,
        instagramUrl,
        showTopBar,
        links,
        bannerImage,
        bannerOpacity,
    } = useNode((node) => ({
        brandName: node.data.props.brandName,
        tagline: node.data.props.tagline,
        brandColor: node.data.props.brandColor,
        navBackgroundColor: node.data.props.navBackgroundColor,
        textColor: node.data.props.textColor,
        topBarBackground: node.data.props.topBarBackground,
        topBarTextColor: node.data.props.topBarTextColor,
        email: node.data.props.email,
        phone: node.data.props.phone,
        facebookUrl: node.data.props.facebookUrl,
        instagramUrl: node.data.props.instagramUrl,
        showTopBar: node.data.props.showTopBar,
        links: node.data.props.links,
        bannerImage: node.data.props.bannerImage,
        bannerOpacity: node.data.props.bannerOpacity,
    }))

    const [openLinkIndex, setOpenLinkIndex] = useState<number | null>(null)
    const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)

    const params = useParams()
    const siteId = params.siteId as string

    const handleBannerSelect = (items: MediaItem[]) => {
        if (items.length > 0) {
            const selectedImage = items[0]
            setProp((props: NavbarProps) => {
                props.bannerImage = selectedImage.url
            })
        }
    }

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
                        value={brandColor || "#5a5933"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.brandColor = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Colors" summary="" defaultOpen={false}>
                <PropertyRow label="Nav Background">
                    <PropertyColor
                        value={navBackgroundColor || "#a9c8be"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.navBackgroundColor = v))}
                        placeholder="#a9c8be"
                    />
                </PropertyRow>
                <PropertyRow label="Text Color">
                    <PropertyColor
                        value={textColor || "#000000"}
                        onChange={(v) => setProp((props: NavbarProps) => (props.textColor = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Banner Image" summary="" defaultOpen={false}>
                <PropertyRow label="Image">
                    <div className="flex flex-col gap-2 w-full">
                        {bannerImage ? (
                            <div className="relative group w-full aspect-[3/1] bg-muted rounded-md overflow-hidden border border-border">
                                <img
                                    src={bannerImage}
                                    alt="Banner Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setIsBannerDialogOpen(true)}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setProp((props: NavbarProps) => (props.bannerImage = ""))}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-2 h-16 border-dashed"
                                onClick={() => setIsBannerDialogOpen(true)}
                            >
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                <span className="text-muted-foreground">Select Banner Image</span>
                            </Button>
                        )}
                    </div>
                </PropertyRow>
                <PropertyRow label="Opacity">
                    <PropertySlider
                        value={bannerOpacity ?? 80}
                        onChange={(v) => setProp((props: NavbarProps) => (props.bannerOpacity = v))}
                        min={0}
                        max={100}
                        unit="%"
                    />
                </PropertyRow>
            </PropertySection>

            <MediaLibraryDialog
                siteId={siteId}
                isOpen={isBannerDialogOpen}
                onClose={() => setIsBannerDialogOpen(false)}
                onSelect={handleBannerSelect}
                multiSelect={false}
            />

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
        brandName: "Σοφία Πλατανησιώτη",
        tagline: "Σύμβουλος Ψυχικής Υγείας",
        brandColor: "#5a5933",
        navBackgroundColor: "#a9c8be",
        textColor: "#000000",
        topBarBackground: "#000000",
        topBarTextColor: "#ffffff",
        email: "platanisiotisophia@gmail.com",
        phone: "+30 6947777532",
        facebookUrl: "https://www.facebook.com/PlatanisiotiSophia",
        instagramUrl: "https://www.instagram.com/sophia.platanisioti",
        showTopBar: true,
        maxWidth: "90vw",
        bannerImage: "/banner.webp",
        bannerOpacity: 80,
        links: [
            { id: "nav-1", label: "ΑΡΧΙΚΗ", href: "/" },
            { id: "nav-2", label: "ΥΠΗΡΕΣΙΕΣ", href: "/services" },
            { id: "nav-3", label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/about" },
            { id: "nav-4", label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact" },
        ],
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: NavbarSettings,
    },
}
