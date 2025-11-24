"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { cn } from "@/lib/utils";

interface NavigationSheetProps {
  links?: {
    label: string;
    href: string;
    submenu?: { label: string; href: string }[];
  }[];
  logoText?: string;
  darkMode?: boolean;
}

export const NavigationSheet = ({
  links = [],
  logoText = "Website Name",
  darkMode = false,
}: NavigationSheetProps) => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger asChild>
        <Button
          variant={darkMode ? "secondary" : "outline"}
          size="icon"
          className={cn(
            "rounded-full",
            darkMode && "bg-zinc-900 text-white hover:bg-zinc-800"
          )}
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        className={cn(
          "px-6 py-4 flex flex-col",
          darkMode && "bg-zinc-900 text-white border-zinc-800"
        )}
      >
        <Logo text={logoText} darkMode={darkMode} />
        <NavMenu
          orientation="vertical"
          links={links}
          darkMode={darkMode}
          className="mt-6 w-full [&>div]:h-full"
        />
      </SheetContent>
    </Sheet>
  );
};
