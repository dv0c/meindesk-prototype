"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavLink {
  label: string
  href: string
  submenu?: NavLink[]
}

export interface NavbarProps {
  logo?: string
  logoText?: string
  logoSizeWidth?: string
  logoSizeHeight?: string
  // Granular Margin
  logoMarginTop?: string
  logoMarginRight?: string
  logoMarginBottom?: string
  logoMarginLeft?: string
  // Granular Padding
  logoPaddingTop?: string
  logoPaddingRight?: string
  logoPaddingBottom?: string
  logoPaddingLeft?: string
  logoObjectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  links?: NavLink[]
  sticky?: boolean
  style?: "split" | "centered" | "glassmorphism" | "floating" | "underline" | "sidebar"
  backgroundColor?: string
  textColor?: string
  accentColor?: string
}

export default function Navbar({
  logo,
  logoText = "Website Name",
  logoSizeWidth = "auto",
  logoSizeHeight = "32px",
  // Default all granular props to "0px" or "auto" as needed, usually 0 for spacing
  logoMarginTop = "0px",
  logoMarginRight = "0px",
  logoMarginBottom = "0px",
  logoMarginLeft = "0px",
  logoPaddingTop = "0px",
  logoPaddingRight = "0px",
  logoPaddingBottom = "0px",
  logoPaddingLeft = "0px",
  logoObjectFit = "contain",
  links = [],
  sticky = false,
  style = "split",
  backgroundColor,
  textColor: customTextColor,
  accentColor = "#3b82f6", // default blue-500
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Use custom colors if provided, otherwise fall back to style defaults
  const navStyle = {
    backgroundColor: backgroundColor || undefined,
    color: customTextColor || undefined,
  }

  const logoStyle: React.CSSProperties = {
    width: logoSizeWidth,
    height: logoSizeHeight,
    marginTop: logoMarginTop,
    marginRight: logoMarginRight,
    marginBottom: logoMarginBottom,
    marginLeft: logoMarginLeft,
    paddingTop: logoPaddingTop,
    paddingRight: logoPaddingRight,
    paddingBottom: logoPaddingBottom,
    paddingLeft: logoPaddingLeft,
    objectFit: logoObjectFit,
  }

  // Accent color for hovers/active states
  const accentStyle = {
    '--accent-color': accentColor,
  } as React.CSSProperties

  // Helper for conditional classes if no custom color is set
  const defaultBgClass = !backgroundColor ? "bg-white dark:bg-gray-900" : ""
  const defaultTextClass = !customTextColor ? "text-gray-900 dark:text-white" : ""

  // Dropdown "bridge" to fix hover gap - transparent pseudo element
  const dropdownBridge = "before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-['']"

  const Logo = () => (
    <Link href="/" className="flex-shrink-0">
      {logo ? (
        <img src={logo} alt={logoText} style={logoStyle} className="object-contain" />
      ) : (
        <span className="text-2xl font-bold">{logoText}</span>
      )}
    </Link>
  )

  const CenteredLogo = () => (
    <Link href="/" className="inline-block mb-6">
      {logo ? (
        <img src={logo} alt={logoText} style={logoStyle} className="mx-auto" />
      ) : (
        <span className="text-3xl font-bold tracking-tight">{logoText}</span>
      )}
    </Link>
  )

  // Split Layout - Logo left, Links center, CTA right
  if (style === "split") {
    return (
      <nav
        className={`${sticky ? "sticky" : "relative"} top-0 left-0 w-full border-b z-50 ${defaultBgClass} ${defaultTextClass}`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            {/* Logo */}
            <Logo />

            {/* Center Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
              {links.slice(0, -1).map((item, idx) => (
                <div key={idx} className="relative group">
                  {item.submenu ? (
                    <>
                      <button
                        className="transition-colors font-medium flex items-center gap-1 hover:text-[var(--accent-color)]"
                        style={accentStyle}
                      >
                        {item.label}
                        <ChevronDown size={16} />
                      </button>
                      <div className={`absolute top-full left-0 mt-2 ${dropdownBridge} bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto border dark:border-gray-700`}>
                        {item.submenu.map((sub, subIdx) => (
                          <Link key={subIdx} href={sub.href} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors font-medium hover:text-[var(--accent-color)]"
                      style={accentStyle}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              {links.length > 0 && links[links.length - 1] && (
                <Link
                  href={links[links.length - 1].href}
                  className="px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {links[links.length - 1].label}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t px-6 py-4 space-y-2">
            {links.map((item, idx) => (
              <Link key={idx} href={item.href} className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    )
  }

  // Centered Layout
  if (style === "centered") {
    return (
      <nav
        className={`${sticky ? "sticky" : "relative"} top-0 left-0 w-full z-50 ${defaultBgClass} ${defaultTextClass}`}
        style={navStyle}
      >
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          {/* Logo */}
          <Logo />

          {/* Links */}
          <div className="hidden md:flex items-center justify-center space-x-8 border-t border-b py-4 border-gray-200 dark:border-gray-700">
            {links.map((item, idx) => (
              <div key={idx} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className="transition-colors uppercase tracking-wider text-sm font-semibold flex items-center gap-1 hover:text-[var(--accent-color)]"
                      style={accentStyle}
                    >
                      {item.label}
                      <ChevronDown size={14} />
                    </button>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${dropdownBridge} bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto border dark:border-gray-700`}>
                      {item.submenu.map((sub, subIdx) => (
                        <Link key={subIdx} href={sub.href} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors uppercase tracking-wider text-sm font-semibold hover:text-[var(--accent-color)]"
                    style={accentStyle}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden mt-4">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden mt-4 space-y-2">
              {links.map((item, idx) => (
                <Link key={idx} href={item.href} className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    )
  }

  // Glassmorphism Style
  if (style === "glassmorphism") {
    const glassClass = backgroundColor ? "backdrop-blur-xl" : "backdrop-blur-xl bg-white/70 dark:bg-gray-900/70"

    return (
      <nav
        className={`${sticky ? "sticky" : "relative"} top-0 left-0 w-full border-b border-white/20 z-50 ${glassClass} ${defaultTextClass}`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />

            <div className="hidden md:flex items-center space-x-6">
              {links.map((item, idx) => (
                <div key={idx} className="relative group">
                  {item.submenu ? (
                    <>
                      <button
                        className="transition-colors font-medium flex items-center gap-1 hover:text-[var(--accent-color)]"
                        style={accentStyle}
                      >
                        {item.label}
                        <ChevronDown size={16} />
                      </button>
                      <div className={`absolute top-full right-0 mt-2 ${dropdownBridge} backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 shadow-2xl rounded-xl py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-white/20 pointer-events-none group-hover:pointer-events-auto`}>
                        {item.submenu.map((sub, subIdx) => (
                          <Link key={subIdx} href={sub.href} className="block px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm rounded-lg mx-2">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors font-medium hover:text-[var(--accent-color)]"
                      style={accentStyle}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden px-6 py-4 space-y-2 backdrop-blur-xl">
            {links.map((item, idx) => (
              <Link key={idx} href={item.href} className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    )
  }

  // Floating Style
  if (style === "floating") {
    return (
      <div className={`${sticky ? "sticky" : "relative"} top-0 left-0 w-full z-50`}>
        <nav
          className={`rounded-full shadow-lg mx-6 mt-4 px-6 border ${defaultBgClass} ${defaultTextClass}`}
          style={navStyle}
        >
          <div className="flex items-center justify-between h-14">
            <Logo />

            <div className="hidden md:flex items-center space-x-6">
              {links.map((item, idx) => (
                <div key={idx} className="relative group">
                  {item.submenu ? (
                    <>
                      <button
                        className="transition-colors font-medium text-sm flex items-center gap-1 hover:text-[var(--accent-color)]"
                        style={accentStyle}
                      >
                        {item.label}
                        <ChevronDown size={14} />
                      </button>
                      <div className={`absolute top-full right-0 mt-2 ${dropdownBridge} bg-white dark:bg-gray-800 shadow-xl rounded-2xl py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto border dark:border-gray-700`}>
                        {item.submenu.map((sub, subIdx) => (
                          <Link key={subIdx} href={sub.href} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded-lg mx-2">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors font-medium text-sm hover:text-[var(--accent-color)]"
                      style={accentStyle}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {links.map((item, idx) => (
                <Link key={idx} href={item.href} className="block py-2 font-medium text-sm" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    )
  }

  // Underline Active Style
  if (style === "underline") {
    return (
      <nav
        className={`${sticky ? "sticky" : "relative"} top-0 left-0 w-full z-50 ${defaultBgClass} ${defaultTextClass}`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 border-b-2" style={{ borderColor: backgroundColor ? 'rgba(0,0,0,0.1)' : undefined }}>
            <Logo />

            <div className="hidden md:flex items-center space-x-1">
              {links.map((item, idx) => (
                <div key={idx} className="relative group">
                  {item.submenu ? (
                    <>
                      <button
                        className="transition-colors font-medium px-4 py-2 flex items-center gap-1 relative hover:text-[var(--accent-color)]"
                        style={accentStyle}
                      >
                        {item.label}
                        <ChevronDown size={16} />
                        <span
                          className="absolute bottom-0 left-0 w-full h-0.5 scale-x-0 transition-transform group-hover:scale-x-100"
                          style={{ backgroundColor: accentColor }}
                        />
                      </button>
                      <div className={`absolute top-full left-0 mt-2 ${dropdownBridge} bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto border dark:border-gray-700`}>
                        {item.submenu.map((sub, subIdx) => (
                          <Link key={subIdx} href={sub.href} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors font-medium px-4 py-2 block relative hover:text-[var(--accent-color)]"
                      style={accentStyle}
                    >
                      {item.label}
                      <span
                        className="absolute bottom-0 left-0 w-full h-0.5 scale-x-0 transition-transform hover:scale-x-100"
                        style={{ backgroundColor: accentColor }}
                      />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden px-6 py-4 space-y-2 border-b">
            {links.map((item, idx) => (
              <Link key={idx} href={item.href} className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    )
  }

  // Sidebar Style (default fallback)
  return (
    <>
      {/* Top Bar */}
      <nav
        className={`${sticky ? "sticky" : "relative"} top-0 left-0 w-full border-b z-50 ${defaultBgClass} ${defaultTextClass}`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu size={24} />
            </button>

            <Logo />

            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>


      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 shadow-2xl z-50 transform transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          !backgroundColor ? "bg-white dark:bg-gray-900" : ""
        )}
        style={{ backgroundColor: backgroundColor, color: customTextColor }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {logo ? (
              <img src={logo} alt={logoText} style={logoStyle} className="object-contain" />
            ) : (
              <h2 className="text-2xl font-bold">{logoText}</h2>
            )}
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {links.map((item, idx) => (
              <div key={idx}>
                {item.submenu ? (
                  <details className="group">
                    <summary
                      className="cursor-pointer py-3 px-4 rounded-lg font-semibold flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {item.label}
                      <ChevronDown size={18} className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="ml-4 mt-2 space-y-1">
                      {item.submenu.map((sub, subIdx) => (
                        <Link
                          key={subIdx}
                          href={sub.href}
                          className="block py-2 px-4 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                          onClick={() => setSidebarOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-3 px-4 rounded-lg font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
