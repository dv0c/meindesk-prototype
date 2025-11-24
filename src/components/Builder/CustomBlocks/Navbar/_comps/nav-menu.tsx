"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuViewport, // 1. Import this
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

// --- Types ---
interface NavLink {
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
}

interface NavMenuProps extends ComponentProps<typeof NavigationMenu> {
  links?: NavLink[];
  darkMode?: boolean;
}

// --- Component ---
export const NavMenu = ({
  links = [],
  darkMode = false,
  className,
  ...props
}: NavMenuProps) => {
  return (
    <NavigationMenu
      className={cn("flex justify-center z-50", className)}
      {...props}
    >
      <NavigationMenuList className="flex gap-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {links.map((link) => (
          <NavigationMenuItem key={link.label}>
            {/* 1. Link with Submenu */}
            {link.submenu?.length ? (
              <>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    darkMode
                      ? "text-white hover:bg-zinc-800 hover:text-white"
                      : "hover:bg-muted"
                  )}
                >
                  {link.label}
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  {/* I moved the sizing (w-[500px]) to the ul or a div wrapper inside.
                      Applying fixed width directly to Content can sometimes conflict with
                      the Viewport's animation calculations.
                  */}
                  <ul className="grid w-[200px] gap-3 p-4 md:w-[200px] md:grid-cols-1">
                    {link.submenu.map((sub) => (
                      <li key={sub.href}>
                        <NavigationMenuLink
                          asChild
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                            darkMode
                              ? "text-zinc-100 hover:bg-zinc-800 focus:bg-zinc-800"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <Link href={sub.href}>
                            <div className="text-sm font-medium leading-none mb-1">
                              {sub.label}
                            </div>
                            {/* Optional: Add description here if your data supports it */}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              /* 2. Simple Link (No Dropdown) */
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  darkMode
                    ? "text-white hover:bg-zinc-800 hover:text-white"
                    : "hover:bg-muted"
                )}
              >
                <Link href={link.href}>{link.label}</Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>

      {/* 3. CRITICAL: The Viewport must be here.
        This is the container where the 'NavigationMenuContent' is actually rendered.
        It handles the sliding animation and positioning relative to the MenuList.
      */}
      <NavigationMenuViewport className={cn(darkMode && "border-zinc-700 bg-zinc-900")} />
    </NavigationMenu>
  );
};