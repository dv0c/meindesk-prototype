"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Plus, Search, User as UserIcon } from "lucide-react"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { searchUsers } from "@/lib/actions/user-actions"
import { inviteUserToSite } from "@/lib/actions/invite-actions"

interface User {
    id: string
    name: string
    email: string
    image: string | null
}

interface InviteMemberFormProps {
    siteId: string
}

export function InviteMemberForm({ siteId }: InviteMemberFormProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery] = useDebounce(query, 300)
    const [users, setUsers] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(false)
    const [inviting, setInviting] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null)

    React.useEffect(() => {
        const fetchUsers = async () => {
            if (debouncedQuery.length < 2) {
                setUsers([])
                return
            }

            setLoading(true)
            try {
                const results = await searchUsers(debouncedQuery)
                // Filter out if needed, but simple search is fine
                setUsers(results)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [debouncedQuery])

    const handleInvite = async () => {
        if (!selectedUser) return

        setInviting(true)
        try {
            const result = await inviteUserToSite(siteId, selectedUser.email)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Invited ${selectedUser.name} to the team`)
                setSelectedUser(null)
                setOpen(false)
                setQuery("")
            }
        } catch (error) {
            toast.error("Failed to send invitation")
        } finally {
            setInviting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
            <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Invite New Member</p>
                <p className="text-sm text-muted-foreground">
                    Search for users to add to your team.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative w-full sm:w-[300px] z-20">
                    <Command
                        shouldFilter={false}
                        className="rounded-lg border shadow-sm overflow-visible bg-background"
                    >
                        <CommandInput
                            placeholder="Search by name or email..."
                            value={selectedUser ? selectedUser.name : query}
                            onValueChange={(val) => {
                                if (selectedUser) setSelectedUser(null) // Clear selection on edit
                                setQuery(val)
                                setOpen(true)
                            }}
                            onFocus={() => setOpen(true)}
                            onBlur={() => setTimeout(() => setOpen(false), 200)} // Allow click to register
                            className="border-none focus:ring-0"
                        />
                        {open && query.length > 0 && !selectedUser && (
                            <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-popover rounded-md border shadow-md overflow-hidden">
                                <CommandList>
                                    {loading && (
                                        <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Searching...
                                        </div>
                                    )}
                                    {!loading && users.length === 0 && (
                                        <CommandEmpty>No users found.</CommandEmpty>
                                    )}
                                    {!loading && users.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={user.id} // or name + email
                                            onSelect={() => {
                                                setSelectedUser(user)
                                                setQuery(user.email) // Fill with email or name
                                                setOpen(false)
                                            }}
                                            className="gap-2 cursor-pointer"
                                        >
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate font-medium">{user.name}</span>
                                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </div>
                        )}
                    </Command>
                </div>

                <Button onClick={handleInvite} disabled={!selectedUser || inviting}>
                    {inviting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Invite</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
