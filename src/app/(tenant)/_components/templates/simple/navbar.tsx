"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import Image from "next/image"
import { Menu, X, Moon, Sun, Search, ShoppingCart } from "lucide-react"
import { Site } from "@prisma/client"
import { TemplateSchema } from "@/types/TemplateSchema"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageItem {
  id: string
  title: string
  slug: string
}

interface NavbarProps {
  tenant: Site & { template_schema: TemplateSchema }
}

export default function Navbar({ tenant }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pages, setPages] = useState<PageItem[]>([])

  const schema = tenant.template_schema
  const header = schema?.header
  const navbar = header?.navbar

  const order = navbar?.order || ["home", "about", "contact"]

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axios.get<PageItem[]>(`/api/team/${tenant.id}/pages`)
        setPages(res.data)
      } catch (err) {
        console.error("Failed to fetch tenant pages:", err)
      }
    }
    fetchPages()
  }, [tenant.id])

  const orderedPages = order
    .map((key) => pages.find((p) => p.slug === key || p.title.toLowerCase() === key) || null)
    .filter(Boolean) as PageItem[]

  const headerClass = cn(
    "z-50 border-b border-border bg-background backdrop-blur-md transition-all",
    header?.sticky && "sticky top-0",
    header?.transparent && "bg-transparent border-none",
    header?.height ? `h-[${header.height}px]` : "h-auto"
  )

  return (
    <>
      {/* Announcement bar */}
      {header?.announcementBar?.enabled && (
        <div
          className="text-center text-sm font-medium"
          style={{
            background: header.announcementBar.background,
            color: header.announcementBar.color,
          }}
        >
          <Link href={header.announcementBar.link}>
            {header.announcementBar.text}
          </Link>
        </div>
      )}

      <header className={headerClass}>
        <nav
          className={cn(
            "mx-auto flex items-center justify-between px-4 py-3 md:px-6",
            schema.global.container || "max-w-7xl"
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "flex items-center",
              header.logo?.alignment === "center" && "justify-center",
              header.logo?.alignment === "right" && "justify-end"
            )}
          >
            {header.logo?.url ? (
              <Link href="/">
                <Image
                  src={header.logo.url}
                  alt={tenant.title}
                  height={header.logo.height || 40}
                  width={header.logo.height ? header.logo.height * 4 : 160}
                  className="object-contain"
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
              >
                {tenant.title}
              </Link>
            )}
          </div>

          {/* Desktop Nav */}
          <div
            className={cn(
              "hidden md:flex items-center gap-6",
              navbar?.alignment === "right" && "ml-auto",
              navbar?.alignment === "center" && "mx-auto"
            )}
          >
            {orderedPages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug === "home" ? "" : page.slug}`}
                className={cn(
                  "text-sm transition-colors",
                  navbar?.style === "underline"
                    ? "relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-primary hover:after:w-full after:transition-all"
                    : "hover:text-primary"
                )}
              >
                {page.title}
              </Link>
            ))}

            {/* Dropdowns */}
            {navbar?.dropdowns?.map((dd, idx) => (
              <DropdownMenu key={idx}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-primary"
                  >
                    {dd.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border border-border mt-2 rounded shadow-lg">
                  {dd.items.map((item, i) => (
                    <DropdownMenuItem key={i} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* CTA */}
            {navbar?.cta && (
              <Link href={navbar.cta.href}>
                <Button
                  variant={
                    navbar.cta.variant === "primary" ? "default" : "outline"
                  }
                  size="sm"
                >
                  {navbar.cta.label}
                </Button>
              </Link>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 md:gap-3">
            {navbar?.icons?.showSearch && (
              <button
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}
            {navbar?.icons?.showCart && (
              <button
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
              </button>
            )}
            {navbar?.icons?.showThemeToggle && (
              <button
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                <Sun size={18} className="hidden dark:block" />
                <Moon size={18} className="block dark:hidden" />
              </button>
            )}

            <button
              className="p-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="flex flex-col gap-3 px-4 py-4">
              {orderedPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug === "home" ? "" : page.slug}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {page.title}
                </Link>
              ))}

              {navbar?.dropdowns?.map((dd, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {dd.label}
                  </span>
                  {dd.items.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="pl-4 py-1 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}

              {navbar?.cta && (
                <Link href={navbar.cta.href}>
                  <Button
                    variant={
                      navbar.cta.variant === "primary" ? "default" : "outline"
                    }
                    size="sm"
                    className="mt-2 w-full"
                  >
                    {navbar.cta.label}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
