"use client"

import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbProps {
  items?: string
  className?: string
}

export default function Breadcrumb({ items = "Home,Products,Category", className = "" }: BreadcrumbProps) {
  const itemList = items.split(",").map((item) => item.trim())

  return (
    <ShadcnBreadcrumb className={className}>
      <BreadcrumbList>
        {itemList.map((item, idx) => (
          <span key={idx} className="contents">
            <BreadcrumbItem>
              {idx === itemList.length - 1 ? (
                <BreadcrumbPage>{item}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href="#">{item}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {idx < itemList.length - 1 && <BreadcrumbSeparator />}
          </span>
        ))}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  )
}
