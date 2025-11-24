"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface NavMenuProps extends ComponentProps<typeof NavigationMenu> {
  links?: {
    label: string;
    href: string;
    submenu?: { label: string; href: string }[];
  }[];
  darkMode?: boolean;
}

export const NavMenu = ({
  links = [],
  darkMode = false,
  className,
  ...props
}: NavMenuProps) => {
  return (
    <NavigationMenu
      className={cn("flex justify-center", className)}
      {...props}
    >
      <NavigationMenuList className="flex gap-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {links.map((link) => (
          <NavigationMenuItem key={link.label} className="relative">
            {/* Simple Link */}
            {!link.submenu?.length && (
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

            {/* Link with Submenu */}
            {link.submenu?.length && (
              <div className="group relative">
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "cursor-pointer",
                    darkMode
                      ? "text-white hover:bg-zinc-800 hover:text-white"
                      : "hover:bg-muted"
                  )}
                >
                  <span>{link.label}</span>
                </NavigationMenuLink>

                <div className="absolute left-0 top-full hidden min-w-[180px] flex-col rounded-md border bg-popover p-1 shadow-md group-hover:flex">
                  {link.submenu.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-colors",
                        darkMode
                          ? "text-zinc-100 hover:bg-zinc-800"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
