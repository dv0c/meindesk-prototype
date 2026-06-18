"use client"
import Link from 'next/link'
import { useTheme } from '@/components/Providers/ThemeProvider'
import { Moon, Sun, Monitor, Github, Twitter } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

export function DashboardFooter() {
    const { setTheme } = useTheme()

    return (
        <footer className="border-t bg-background py-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        {/* Logo / Brand or just text */}
                        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span>All systems normal</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Documentation</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Guides</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Help</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <Monitor className="mr-2 h-4 w-4" />
                                <span>System</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-border" />

                    <Link href="https://github.com/meindesk" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="w-4 h-4" />
                    </Link>
                    <Link href="https://twitter.com/meindesk" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Twitter className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </footer>
    )
}
