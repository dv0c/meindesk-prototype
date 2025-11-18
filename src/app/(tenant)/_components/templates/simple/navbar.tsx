"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
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

  const navbar = tenant.template_schema?.header?.navbar
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

  // Filter pages based on schema order
  const orderedPages = order
    .map((key) => pages.find((p) => p.slug === key || p.title.toLowerCase() === key) || null)
    .filter(Boolean) as PageItem[]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo / Site Name */}
        <Link
          href="/"
          className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
        >
          {tenant.title}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {orderedPages.map((page) => (
            <Link
              key={page.id}
              href={`/${page.slug === "home" ? "" : page.slug}`}
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              {page.title}
            </Link>
          ))}

          {/* Dropdowns */}
          {navbar?.dropdowns?.map((dd, idx) => (
            <DropdownMenu key={idx}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
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
              <Button variant={navbar.cta.variant === "primary" ? "default" : "outline"} size="sm">
                {navbar.cta.label}
              </Button>
            </Link>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {navbar?.icons?.showSearch && (
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Search">
              <Search size={18} />
            </button>
          )}
          {navbar?.icons?.showCart && (
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Cart">
              <ShoppingCart size={18} />
            </button>
          )}
          {navbar?.icons?.showThemeToggle && (
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Toggle theme">
              <Sun size={18} className="hidden dark:block" />
              <Moon size={18} className="block dark:hidden" />
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
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
                <span className="text-sm font-semibold text-foreground">{dd.label}</span>
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

            {/* CTA */}
            {navbar?.cta && (
              <Link href={navbar.cta.href}>
                <Button
                  variant={navbar.cta.variant === "primary" ? "default" : "outline"}
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
  )
}
