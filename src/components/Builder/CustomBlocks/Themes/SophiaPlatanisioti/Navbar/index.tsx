"use strict";

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mail, Menu, Phone } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import useScroll from "@/hooks/useScroll"

// Define types locally since they might not exist in the project
interface NavLink {
    label: string
    href: string
    submenu?: NavLink[]
}

interface SophiaNavBarProps {
    links?: NavLink[]
    logoColor?: string
    bannerImage?: string
}

export const Navbar = ({
    links = [],
    logoColor = "#5a5933", // Default from source text color
    bannerImage = "/banner.webp"
}: SophiaNavBarProps) => {
    const pathname = usePathname() || "/"

    return (
        <div className="w-full relative font-sans">
            {/* Top Bar - Desktop */}
            <section className="bg-black hidden lg:block">
                <div className="max-w-5xl mx-auto flex justify-between items-center px-5">
                    <div className="flex items-center gap-3 py-3">
                        <a href="https://www.facebook.com/PlatanisiotiSophia" target="_blank" rel="noreferrer noopener">
                            <Facebook />
                        </a>
                        <a href="https://www.instagram.com/sophia.platanisioti" target="_blank" rel="noreferrer noopener">
                            <Instagram />
                        </a>
                    </div>
                    <div className="flex gap-3">
                        <a href="mailto:platanisiotisophia@gmail.com" className="items-center flex gap-1">
                            <Mail size={15} className="fill-white mt-1" />
                            <span className="text-white border-b hover:border-b-gray-100 transition-all border-b-gray-500 text-sm font-light">
                                platanisiotisophia@gmail.com
                            </span>
                        </a>
                        <a href="tel:+30 6947777532" className="items-center flex gap-1">
                            <Phone size={15} className="fill-white mt-1" />
                            <span className="text-white border-b hover:border-b-gray-100 transition-all border-b-gray-500 text-sm font-light">
                                +30 6947777532
                            </span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Main Nav */}
            <nav className="relative px-5 border-b border-b-black/40 bg-[#a9c8be] z-0">
                <section className="max-w-[90vw] mx-auto h-24 md:h-40 flex gap-20 items-center justify-between lg:justify-start">
                    <Link href={"/"} className="z-10">
                        <h1 className="md:text-4xl text-xl sm:text-2xl mb-2" style={{ color: logoColor }}>Σοφία Πλατανησιώτη</h1>
                        <h2 className="md:text-[1.3125rem] text-sm text-black">Σύμβουλος Ψυχικής Υγείας</h2>
                    </Link>

                    <NavigationLinks
                        links={links}
                        pathname={pathname}
                        ulClassName="hidden lg:flex flex-wrap max-w-full gap-x-4 md:gap-x-6 items-baseline z-10"
                    />

                    <div className="block lg:hidden z-10">
                        <BMenu links={links} pathname={pathname} logoColor={logoColor} />
                    </div>
                </section>

                {/* Banner Background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    {/* Using simple div with background if image fails, or next/image with layout fill */}
                    {bannerImage && (
                        <Image
                            src={bannerImage}
                            fill
                            alt="banner"
                            className="object-cover pr-[20px] opacity-80"
                            priority
                        />
                    )}
                </div>
            </nav>

            <FixedNav links={links} pathname={pathname} logoColor={logoColor} />
        </div>
    )
}

const FixedNav = ({ links, pathname, logoColor }: { links: NavLink[], pathname: string, logoColor: string }) => {
    const isScrolled = useScroll()

    return (
        <nav
            className={cn(
                "opacity-0 invisible fixed top-0 left-0 w-full shadow-md bg-white transition-all duration-300 z-50 px-5 border-b",
                isScrolled && "opacity-100 visible",
            )}
        >
            <div className="max-w-[90vw] mx-auto md:py-5 py-5 flex justify-between lg:gap-20 items-center">
                <Link
                    href={"/"}
                    className="md:text-4xl text-xl sm:text-2xl"
                    style={{ color: logoColor }}
                >
                    Σοφία Πλατανησιώτη
                </Link>

                <NavigationLinks
                    links={links}
                    pathname={pathname}
                    ulClassName="hidden lg:flex flex-wrap gap-x-4 md:gap-x-6 items-baseline"
                />

                <div className="block lg:hidden">
                    <BMenu links={links} pathname={pathname} logoColor={logoColor} />
                </div>
            </div>
        </nav>
    )
}

// Navigation Links Component
interface NavigationLinksProps {
    links: NavLink[]
    pathname: string
    ulClassName?: string
}

function NavigationLinks({ links, pathname, ulClassName }: NavigationLinksProps) {
    return (
        <ul className={cn("items-center text-[.6875rem] max-w-[700px]!", ulClassName)}>
            {links.map((link, index) => (
                <li key={index}>
                    {link.submenu && link.submenu.length > 0 ? (
                        <div className="menu-item group relative">
                            <div className="flex items-center gap-2 cursor-pointer h-full hover:font-bold">
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
                            <div className="absolute h-auto z-10 top-full mt-px transition-all delay-75 right-0 invisible opacity-0 group-hover:visible group-hover:opacity-100">
                                <div className="bg-white border rounded-sm shadow-lg py-1">
                                    <ul className="p-0 min-w-[200px]">
                                        {link.submenu.map((subItem, subIndex) => (
                                            <li key={subIndex}>
                                                <Link
                                                    href={subItem.href}
                                                    className={cn(
                                                        "block uppercase px-3 py-1.5 w-full hover:bg-gray-100 hover:font-semibold tracking-wide text-[.75rem]",
                                                        pathname === subItem.href && "font-semibold",
                                                    )}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link className={cn("menu-item hover:font-bold transition-all", pathname === link.href && "font-bold text-[11px]!")} href={link.href}>
                            {link.label}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    )
}

// Mobile Menu Component
const BMenu = ({ links, pathname, logoColor }: { links: NavLink[], pathname: string, logoColor: string }) => {
    return (
        <Sheet>
            <SheetTrigger aria-label="menu">
                <Menu className="h-8 w-8 text-black" />
            </SheetTrigger>
            <SheetContent className="pt-12 bg-white">
                <div style={{ color: logoColor }}>
                    <ul className="flex flex-col gap-4">
                        {links.map((item, i) => (
                            <li key={i} className="border-b-[hsla(40,26%,73%,.4)] transition-all border-b py-2 cursor-pointer group">
                                <Link
                                    className={cn(
                                        "group-hover:font-semibold transition-all block w-full",
                                        pathname === item.href && "font-semibold",
                                    )}
                                    href={item.href}
                                >
                                    {item.label}
                                </Link>
                                {item.submenu && item.submenu.length > 0 && (
                                    <ul className="pl-4 mt-2 space-y-2">
                                        {item.submenu.map((subItem, subIndex) => (
                                            <li key={subIndex}>
                                                <Link
                                                    className={cn(
                                                        "text-sm hover:font-semibold transition-all block",
                                                        pathname === subItem.href && "font-semibold",
                                                    )}
                                                    href={subItem.href}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="border-b-[hsla(40,26%,73%,.4)] mt-5">
                        <div className="pb-5 border-b space-y-4 border-b-[hsla(40,26%,73%,.4)]">
                            <a href="mailto:platanisiotisophia@gmail.com" className="items-center flex gap-1 space-x-2">
                                <Mail size={15} className="stroke-[#ccc0a8] mt-1" />
                                <span className="text-black border-b truncate font-medium hover:border-b-gray-100 transition-all border-b-gray-500 text-sm">
                                    platanisiotisophia@gmail.com
                                </span>
                            </a>
                            <a href="tel:+30 6947777532" className="items-center space-x-2 flex gap-1">
                                <Phone size={15} className="stroke-[#ccc0a8] mt-1" />
                                <span className="text-black border-b font-medium hover:border-b-gray-100 transition-all border-b-gray-500 text-sm">
                                    +30 6947777532
                                </span>
                            </a>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <a href="https://www.facebook.com/PlatanisiotiSophia" target="_blank" rel="noreferrer noopener">
                                <Facebook fill="#ccc0a8" />
                            </a>
                            <a href="https://www.instagram.com/sophia.platanisioti" target="_blank" rel="noreferrer noopener">
                                <Instagram fill="#ccc0a8" />
                            </a>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Icons
const Instagram = ({ fill }: { fill?: string }) => {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="15px" width="15px">
            <path
                d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.847 5.847 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z"
                fill={fill || "#ffff"}
            ></path>
        </svg>
    )
}

const Facebook = ({ fill }: { fill?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="15px" width="15px">
            <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill={fill || "#ffff"}
            ></path>
        </svg>
    )
}
