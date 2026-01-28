'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-background text-foreground">
      {/* Grid Background Effect */}
      <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-black dark:bg-white text-white dark:text-black flex size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight">Meindesk</span>
        </div>

        <h1 className="text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground text-sm">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button className="h-10 px-6 font-medium">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="h-10 px-6">
              Go Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
    </main>
  )
}
