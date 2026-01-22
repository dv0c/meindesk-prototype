"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    CreditCard,
    LayoutDashboard,
    Settings,
    User,
    GalleryVerticalEnd,
    Plus,
    Globe,
    Sparkles,
    ArrowRight,
    Search,
    CornerDownLeft
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { useTeams } from "@/hooks/useTeams"
import { cn } from "@/lib/utils"

export function CommandMenu({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const router = useRouter()
    const { teams } = useTeams()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [setOpen])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [setOpen])

    return (
        <CommandDialog open={open} onOpenChange={setOpen} className="bg-popover/95 backdrop-blur-xl border-border text-popover-foreground sm:max-w-[600px] p-0 overflow-hidden shadow-2xl rounded-xl">
            <div className="flex items-center border-b border-border/50 px-4 h-14">
                <Search className="mr-3 h-5 w-5 text-muted-foreground/70" />
                <CommandInput
                    placeholder="Search documentation, projects, settings..."
                    className="border-0 focus:ring-0 text-base text-popover-foreground placeholder:text-muted-foreground/70 h-full bg-transparent p-0"
                />
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">ESC</span>
                </kbd>
            </div>

            <CommandList className="max-h-[400px] overflow-y-auto p-2">
                <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
                    <p className="text-base font-medium text-foreground mb-1">No results found</p>
                    <p className="text-muted-foreground/80">Try searching for something else.</p>
                </CommandEmpty>

                <CommandGroup heading="Suggestions" className="text-muted-foreground/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard"))}
                        className="flex items-center justify-between px-3 py-3 mb-1 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary group-aria-selected:bg-primary group-aria-selected:text-primary-foreground transition-colors">
                                <Globe className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-foreground group-aria-selected:text-accent-foreground">Domains</span>
                                <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground/70">Manage your project domains</span>
                            </div>
                        </div>
                        <CornerDownLeft className="h-4 w-4 text-muted-foreground/0 group-aria-selected:text-muted-foreground/50 transition-all" />
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/settings"))}
                        className="flex items-center justify-between px-3 py-3 mb-1 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary group-aria-selected:bg-primary group-aria-selected:text-primary-foreground transition-colors">
                                <Settings className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-foreground group-aria-selected:text-accent-foreground">Settings</span>
                                <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground/70">Global configuration</span>
                            </div>
                        </div>
                        <CornerDownLeft className="h-4 w-4 text-muted-foreground/0 group-aria-selected:text-muted-foreground/50 transition-all" />
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="bg-border/50 my-1 mx-2" />

                <CommandGroup heading="Projects" className="text-muted-foreground/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                    {teams.map((team) => (
                        <CommandItem
                            key={team.id}
                            onSelect={() => runCommand(() => router.push(`/dashboard/${team.id}`))}
                            className="flex items-center justify-between px-3 py-3 mb-1 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground group-aria-selected:bg-primary group-aria-selected:text-primary-foreground transition-colors">
                                    <GalleryVerticalEnd className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-foreground group-aria-selected:text-accent-foreground">{team.title}</span>
                                    <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground/70">Switch project context</span>
                                </div>
                            </div>
                            <CornerDownLeft className="h-4 w-4 text-muted-foreground/0 group-aria-selected:text-muted-foreground/50 transition-all" />
                        </CommandItem>
                    ))}
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/setup"))}
                        className="flex items-center justify-between px-3 py-3 mb-1 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground group-aria-selected:bg-primary group-aria-selected:text-primary-foreground transition-colors">
                                <Plus className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-foreground group-aria-selected:text-accent-foreground">Create New Project</span>
                                <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground/70">Start something new</span>
                            </div>
                        </div>
                        <CornerDownLeft className="h-4 w-4 text-muted-foreground/0 group-aria-selected:text-muted-foreground/50 transition-all" />
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="bg-border/50 my-1 mx-2" />

                <CommandGroup heading="General" className="text-muted-foreground/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/marketplace"))}
                        className="flex items-center justify-between px-3 py-3 mb-1 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground group-aria-selected:bg-primary group-aria-selected:text-primary-foreground transition-colors">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-foreground group-aria-selected:text-accent-foreground">Marketplace</span>
                                <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground/70">Explore plugins and themes</span>
                            </div>
                        </div>
                        <CornerDownLeft className="h-4 w-4 text-muted-foreground/0 group-aria-selected:text-muted-foreground/50 transition-all" />
                    </CommandItem>

                    <CommandItem
                        className="flex items-center justify-between px-3 py-3 mb-1 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-500/10 text-purple-500 group-aria-selected:bg-purple-500 group-aria-selected:text-white transition-colors">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-foreground group-aria-selected:text-accent-foreground">Ask AI</span>
                                <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground/70">"database-admin visits this morning"</span>
                            </div>
                        </div>
                        <CornerDownLeft className="h-4 w-4 text-muted-foreground/0 group-aria-selected:text-muted-foreground/50 transition-all" />
                    </CommandItem>
                </CommandGroup>
            </CommandList>

            <div className="flex items-center justify-end px-4 py-2 border-t border-border/50 bg-accent/30 text-xs text-muted-foreground">
                <span className="mr-2">Search by</span>
                <div className="flex items-center gap-1 font-semibold text-foreground">
                    <GalleryVerticalEnd className="h-3 w-3" />
                    <span className="tracking-tight">Prototype</span>
                </div>
            </div>
        </CommandDialog>
    )
}
