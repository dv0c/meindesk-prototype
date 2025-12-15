import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/categories"

interface NavigationLinksProps {
  categories: Category[]
  pathname: string
  ulClassName?: string
}

const staticLinks = [
  { href: "/", label: "ΑΡΧΙΚΗ" },
  { href: "/ypiresies", label: "ΥΠΗΡΕΣΙΕΣ" },
  { href: "/contact", label: "ΕΠΙΚΟΙΝΩΝΙΑ" },
  { href: "/biography", label: "ΒΙΟΓΡΑΦΙΚΟ" },
]

export function NavigationLinks({ categories, pathname, ulClassName }: NavigationLinksProps) {
  const hiddenCategories = categories?.filter((cat) => cat.position === "HIDDEN") || []
  const headerCategories = categories?.filter((cat) => cat.position === "HEADER") || []

  return (
    <ul className={cn("items-center text-[.6875rem] !max-w-[700px]", ulClassName)}>
      {staticLinks.map((link) => (
        <li key={link.href}>
          <Link className={cn("menu-item", pathname === link.href && "font-bold !text-[11px]")} href={link.href}>
            {link.label}
          </Link>
        </li>
      ))}

      {/* Articles Dropdown for HIDDEN categories */}
      {hiddenCategories.length > 0 && (
        <li>
          <div className="menu-item group relative">
            <div className="flex items-center gap-2 cursor-pointer h-full">
              <span>ΑΡΘΡΑ</span>
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
              <div className="bg-background border rounded-sm shadow-lg py-1">
                <ul className="p-0 min-w-[200px]">
                  {hiddenCategories.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={"/articles/" + item.slug}
                        className={cn(
                          "block uppercase px-3 py-1.5 w-full hover:underline underline-offset-2 tracking-wide text-[.75rem]",
                          pathname === "/articles/" + item.slug && "font-semibold",
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </li>
      )}

      {/* Direct links for HEADER categories */}
      {headerCategories.map((item) => (
        <li key={item.id}>
          <Link
            className={cn("menu-item", pathname === "/articles/" + item.slug && "font-bold !text-[11px]")}
            href={"/articles/" + item.slug}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
