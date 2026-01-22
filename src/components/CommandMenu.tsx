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
    ArrowRight
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
        <CommandDialog open={open} onOpenChange={setOpen} className="bg-[#0c0c0c] border-zinc-800 text-zinc-100 sm:max-w-[550px] p-0 overflow-hidden shadow-2xl">
            <div className="flex items-center border-b border-zinc-800 px-3 h-12">
                <CommandInput placeholder="Find..." className="border-0 focus:ring-0 text-zinc-100 placeholder:text-zinc-500 h-full bg-transparent" />
                <span className="text-[10px] text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded ml-auto font-mono">ESC</span>
            </div>
            <CommandList className="max-h-[450px] overflow-y-auto p-2">
                <CommandEmpty className="py-6 text-center text-sm text-zinc-500">No results found.</CommandEmpty>

                <CommandGroup heading="Suggestions" className="text-zinc-400 [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard"))}
                        className="flex flex-col items-start px-2 py-3 rounded-md aria-selected:bg-zinc-900 aria-selected:text-zinc-100 cursor-pointer group"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Globe className="mr-2 h-4 w-4 text-zinc-400 group-aria-selected:text-zinc-100" />
                            <span className="font-medium text-sm">Domains</span>
                        </div>
                        <span className="text-xs text-zinc-500 ml-6 group-aria-selected:text-zinc-400">dv0c's projects</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/settings"))}
                        className="flex flex-col items-start px-2 py-3 rounded-md aria-selected:bg-zinc-900 aria-selected:text-zinc-100 cursor-pointer group"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Settings className="mr-2 h-4 w-4 text-zinc-400 group-aria-selected:text-zinc-100" />
                            <span className="font-medium text-sm">Settings</span>
                        </div>
                        <span className="text-xs text-zinc-500 ml-6 group-aria-selected:text-zinc-400">dv0c's projects</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="bg-zinc-800 my-2" />

                <CommandGroup heading="Projects" className="text-zinc-400 [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                    {teams.map((team) => (
                        <CommandItem
                            key={team.id}
                            onSelect={() => runCommand(() => router.push(`/dashboard/${team.id}`))}
                            className="flex flex-col items-start px-2 py-3 rounded-md aria-selected:bg-zinc-900 aria-selected:text-zinc-100 cursor-pointer group"
                        >
                            <div className="flex items-center gap-2 w-full">
                                <GalleryVerticalEnd className="mr-2 h-4 w-4 text-zinc-400 group-aria-selected:text-zinc-100" />
                                <span className="font-medium text-sm">{team.title}</span>
                            </div>
                            <span className="text-xs text-zinc-500 ml-6 group-aria-selected:text-zinc-400">Switch to project</span>
                        </CommandItem>
                    ))}
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/setup"))}
                        className="flex flex-col items-start px-2 py-3 rounded-md aria-selected:bg-zinc-900 aria-selected:text-zinc-100 cursor-pointer group"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Plus className="mr-2 h-4 w-4 text-zinc-400 group-aria-selected:text-zinc-100" />
                            <span className="font-medium text-sm">Create New Project</span>
                        </div>
                        <span className="text-xs text-zinc-500 ml-6 group-aria-selected:text-zinc-400">Add a new project to your workspace</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="bg-zinc-800 my-2" />

                <CommandGroup heading="General" className="text-zinc-400 [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/marketplace"))}
                        className="flex flex-col items-start px-2 py-3 rounded-md aria-selected:bg-zinc-900 aria-selected:text-zinc-100 cursor-pointer group"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <ArrowRight className="mr-2 h-4 w-4 text-zinc-400 group-aria-selected:text-zinc-100" />
                            <span className="font-medium text-sm">Marketplace</span>
                        </div>
                        <span className="text-xs text-zinc-500 ml-6 group-aria-selected:text-zinc-400">dv0c's projects</span>
                    </CommandItem>

                    <CommandItem
                        className="flex flex-col items-start px-2 py-3 rounded-md aria-selected:bg-zinc-900 aria-selected:text-zinc-100 cursor-pointer group"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Sparkles className="mr-2 h-4 w-4 text-zinc-400 group-aria-selected:text-zinc-100" />
                            <span className="font-medium text-sm">"database-admin visits this morning"</span>
                        </div>
                        <span className="text-xs text-zinc-500 ml-6 group-aria-selected:text-zinc-400">Navigation Assistant</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
