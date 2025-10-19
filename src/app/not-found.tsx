
'use client'
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { redirect } from "next/navigation"

export default function NotFound() {
  return (
    <main className="mt-20">
      <span className="text-6xl font-bold flex flex-col items-center">
        Meindesk Prototype
        </span>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>404 - Not Found</EmptyTitle>
            <EmptyDescription>
              The page you&apos;re looking for doesn&apos;t exist. Try searching for
              what you need below.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => redirect('/')}>Go back</Button>
            <EmptyDescription>
              Need help? <a href="#">Contact support</a>
            </EmptyDescription>
          </EmptyContent>
        </Empty>
    </main>
  )
}
