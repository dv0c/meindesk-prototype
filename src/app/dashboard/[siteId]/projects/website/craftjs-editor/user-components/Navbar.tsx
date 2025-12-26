"use client"

import React, { useState, useEffect } from "react"
import { Menu, Mail, Phone } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { withCraftComponent, CraftComponentProps } from '../lib/withCraftComponent'

// Navigation link type with submenu support
interface NavLink {
    id?: string
    label: string
    href: string
    submenu?: NavLink[]
}

interface NavbarProps extends CraftComponentProps {
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
            className={`opacity-0 invisible fixed top-0 left-0 w-full shadow-md bg-white transition-all duration-300 z-50 px-5 border-b ${isScrolled && "opacity-100 visible"}`}
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

// Main Navbar Component
const NavbarComponent = React.forwardRef<HTMLDivElement, NavbarProps>(({
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
}, ref) => {
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
            ref={ref}
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
})

NavbarComponent.displayName = "NavbarComponent"

// Export with withCraftComponent wrapper (settings will be auto-generated)
export const Navbar = withCraftComponent<NavbarProps>(
    NavbarComponent,
    {
        displayName: 'Navbar',
        defaultProps: {
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
            bannerImage: "",
            bannerOpacity: 80,
            links: [
                { id: "nav-1", label: "ΑΡΧΙΚΗ", href: "/" },
                { id: "nav-2", label: "ΥΠΗΡΕΣΙΕΣ", href: "/services" },
                { id: "nav-3", label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/about" },
                { id: "nav-4", label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact" },
            ],
        },
        settingsConfig: {
            // Brand
            brandName: { label: 'Brand Name', type: 'text' },
            tagline: { label: 'Tagline', type: 'text' },
            brandColor: { label: 'Brand Color', type: 'color' },
            // Colors
            navBackgroundColor: { label: 'Nav Background', type: 'color' },
            textColor: { label: 'Text Color', type: 'color' },
            topBarBackground: { label: 'Top Bar Background', type: 'color' },
            topBarTextColor: { label: 'Top Bar Text', type: 'color' },
            // Contact
            email: { label: 'Email', type: 'text', placeholder: 'email@example.com' },
            phone: { label: 'Phone', type: 'text', placeholder: '+30 123 456 789' },
            facebookUrl: { label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/...' },
            instagramUrl: { label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/...' },
            // Layout
            showTopBar: { label: 'Show Top Bar', type: 'checkbox' },
            maxWidth: { label: 'Max Width', type: 'text', placeholder: '90vw' },
            // Banner
            bannerImage: { label: 'Banner Image', type: 'media' },
            bannerOpacity: { label: 'Banner Opacity', type: 'slider', min: 0, max: 100, unit: '%' },

            // Navigation Links
            links: {
                label: 'Navigation Links',
                type: 'array',
                arrayFields: {
                    label: { label: 'Label', type: 'text' },
                    href: { label: 'URL', type: 'text' },
                    submenu: {
                        label: 'Submenu Items',
                        type: 'array',
                        arrayFields: {
                            label: { label: 'Label', type: 'text' },
                            href: { label: 'URL', type: 'text' }
                        }
                    }
                }
            }
        },
        sectionTitle: 'Navbar Settings'
    }
)

