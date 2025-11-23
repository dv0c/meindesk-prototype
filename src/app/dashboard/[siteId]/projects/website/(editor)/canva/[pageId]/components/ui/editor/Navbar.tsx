"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export interface NavLink {
  label: string
  href: string
  submenu?: NavLink[]
}

export interface NavbarProps {
  logoText?: string
  links?: NavLink[]
  align?: "left" | "center" | "right"
  sticky?: boolean
  darkMode?: boolean
}

export default function Navbar({
  logoText = "Website Name",
  links = [],
  align = "right",
  sticky = false,
  darkMode = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

  const textColor = darkMode ? "text-gray-200" : "text-gray-800"
  const bgColor = darkMode ? "bg-gray-900" : "bg-background"

  return (
    <nav
      className={`${sticky ? "fixed" : "relative"} top-0 left-0 w-full ${bgColor} shadow-sm z-50`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className={`text-xl font-bold tracking-tight ${textColor}`}>
            {logoText}
          </Link>

          {/* Desktop Menu */}
          <ul
            className={`hidden md:flex items-center space-x-6 ${
              align === "center"
                ? "mx-auto"
                : align === "right"
                ? "ml-auto"
                : "mr-auto"
            }`}
          >
            {links.map((item, idx) =>
              item.submenu ? (
                <li
                  key={idx}
                  className="relative group"
                  onMouseEnter={() => setOpenSubmenu(idx)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button
                    className={`font-semibold ${textColor} hover:opacity-75 transition`}
                  >
                    {item.label}
                  </button>
                  <ul
                    className={`absolute left-0 top-full ${bgColor} border rounded-md shadow-md py-2 min-w-[200px] ${
                      openSubmenu === idx ? "block" : "hidden"
                    }`}
                  >
                    {item.submenu.map((sub, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          href={sub.href}
                          className={`block px-4 py-2 text-sm ${
                            darkMode
                              ? "text-gray-300 hover:bg-gray-800"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className={`font-semibold ${textColor} hover:opacity-75 transition`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* Mobile button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
          >
            {mobileOpen ? (
              <X size={24} className={textColor} />
            ) : (
              <Menu size={24} className={textColor} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <ul className="md:hidden flex flex-col space-y-2 pb-4">
            {links.map((item, idx) =>
              item.submenu ? (
                <li key={idx}>
                  <details>
                    <summary className={`cursor-pointer font-semibold ${textColor}`}>
                      {item.label}
                    </summary>
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((sub, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            href={sub.href}
                            className={`block text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className={`font-semibold ${textColor}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </nav>
  )
}
