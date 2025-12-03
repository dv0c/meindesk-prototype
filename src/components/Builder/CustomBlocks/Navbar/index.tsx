"use client";

import { Button } from "@/components/ui/button";
import { NavigationSheet } from "./_comps/navigation-sheet";
import { NavMenu } from "./_comps/nav-menu";
import { Logo } from "./_comps/logo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  logoText?: string;
  align?: "left" | "center" | "right";
  sticky?: boolean;
  darkMode?: boolean;
  links?: {
    label: string;
    href: string;
    submenu?: { label: string; href: string }[];
  }[];
}

export const Navbar = ({
  logoText = "WebsiteName   ",
  align = "right",
  sticky = true,
  darkMode = false,
  links = []
}: NavbarProps) => {
  const alignment =
    align === "left"
      ? "justify-start"
      : align === "center"
        ? "justify-center"
        : "justify-end";

  return (
    <nav
      className={cn(
        "inset-x-4 h-16  border max-w-(--breakpoint-xl) mx-auto rounded-full transition-colors",
        sticky && "sticky top-6 z-50",
        darkMode ? "bg-zinc-900 text-white" : "bg-background text-foreground"
      )}
    >
      <div className="h-full flex items-center justify-between px-4">
        <Logo text={logoText} />

        {/* Desktop Menu */}
        <div className={cn("hidden md:flex flex-1", alignment)}>
          <NavMenu links={links} />
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet links={links} logoText={logoText} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
