"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SophiaNavBarProps {
    name?: string;
    title?: string;
    links?: { label: string; href: string; submenu?: { label: string; href: string }[] }[];
    bottomLinks?: { label: string; href: string }[];
    imageSrc?: string;
    fontFamily?: string;
}

export const SophiaNavBar = ({
    name = "Σοφία Πλατανησιώτη",
    title = "Σύμβουλος Ψυχικής Υγείας",
    links = [
        { label: "ΑΡΧΙΚΗ", href: "#" },
        { label: "ΥΠΗΡΕΣΙΕΣ", href: "#" },
        { label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "#" },
        { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "#" },
        { label: "ΑΡΘΡΑ", href: "#", submenu: [{ label: "Blog", href: "#" }] },
    ],
    bottomLinks = [
        { label: "Ομάδες Συμβουλευτικής και Αυτογνωσίας", href: "#" },
        { label: "ΕΚΔΗΛΩΣΕΙΣ", href: "#" },
    ],
    imageSrc = "https://res.cloudinary.com/dv0c/image/upload/v1702334000/brain-flower-art_placeholder.png", // Placeholder
}: SophiaNavBarProps) => {
    return (
        <div className="w-full bg-[#a7c7c0] font-sans text-[#4a4a4a] relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-8 py-4 flex flex-col lg:flex-row items-center justify-between min-h-[160px]">

                {/* Left: Logo Area */}
                <div className="flex flex-col items-start z-10 mb-6 lg:mb-0">
                    <h1 className="text-3xl md:text-5xl font-serif text-[#5d4037] mb-1 tracking-wide">
                        {name}
                    </h1>
                    <p className="text-xl md:text-2xl text-[#1a3c5e] font-medium tracking-wide">
                        {title}
                    </p>
                </div>

                {/* Center: Navigation */}
                <div className="flex flex-col items-center lg:items-start space-y-4 z-10 flex-1 lg:ml-20">
                    {/* Top Row Links */}
                    <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
                        {links.map((link, index) => (
                            <div key={index} className="relative group">
                                <Link
                                    href={link.href}
                                    className="text-[#5d4037] text-sm font-bold tracking-widest hover:opacity-80 flex items-center gap-1"
                                >
                                    {link.label}
                                    {link.submenu && <ChevronDown className="w-3 h-3" />}
                                </Link>
                                {/* Submenu placeholder for now */}
                            </div>
                        ))}
                    </nav>

                    {/* Bottom Row Links */}
                    <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
                        {bottomLinks.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                className={cn(
                                    "text-[#5d4037] text-sm tracking-widest hover:opacity-80",
                                    link.label === "ΕΚΔΗΛΩΣΕΙΣ" ? "font-bold" : "font-medium"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Image Decoration */}
                {/* Using a pseudo-element logic or absolute positioning for the overlapping effect if needed, 
            but standard flex layout matches the clean look better for responsiveness */}
                <div className="hidden lg:block z-10 w-48 h-48 relative shrink-0">
                    {/* Note: In a real scenario, we'd use the user's uploaded image. 
                 Since we don't have the exact asset managed yet, we use a placeholder or allows the passed prop. */}
                    {imageSrc && (
                        <img
                            src={imageSrc}
                            alt="Decorative Brain Art"
                            className="w-full h-full object-contain object-center scale-125 translate-y-4"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SophiaNavBar;
