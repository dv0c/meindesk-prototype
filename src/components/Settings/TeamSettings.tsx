"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Mail, Trash2, UserMinus } from "lucide-react"
import { inviteMember, removeMember, leaveTeam, getTeamMembers } from "@/lib/actions/team-actions"
import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface TeamSettingsProps {
    siteId: string
    isOwner: boolean
}

export function TeamSettings({ siteId, isOwner }: TeamSettingsProps) {
    const { data: session } = useSession()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<any[]>([])
    const [invitations, setInvitations] = useState<any[]>([])
    const [fetching, setFetching] = useState(true)

    const fetchData = async () => {
        setFetching(true)
        const res = await getTeamMembers(siteId)
        if (res.error) {
            // toast.error(res.error)
        } else {
            setMembers(res.members || [])
            setInvitations(res.invitations || [])
        }
        setFetching(false)
    }

    useEffect(() => {
        fetchData()
    }, [siteId])

    const handleInvite = async () => {
        if (!email) return
        setLoading(true)
        const res = await inviteMember(siteId, email)
        setLoading(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Invitation sent!")
            setEmail("")
            fetchData()
        }
    }

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return
        const res = await removeMember(siteId, userId)
        if (res.success) {
            toast.success("Member removed")
            fetchData()
        } else {
            toast.error(res.error)
        }
    }

    const handleLeaveTeam = async () => {
        if (!confirm("Are you sure you want to leave this team?")) return
        const res = await leaveTeam(siteId)
        if (res.success) {
            toast.success("You have left the team")
            window.location.href = "/dashboard"
        } else {
            toast.error(res.error)
        }
    }

    // Identify current user in the list to hide "Remove" button for themselves (handled by isOwner logic usually, but owner is in members list?)
    // Actually owner is in members list?
    // In `getTeamMembers`, we include `members`. If `userId` is owner, they might be in `members` if we explicitly added them or just via `userId` field (schema says `members User[]`).
    // Usually owner is NOT in `members` relation if using explicit FK `userId` for ownership.
    // But `team-actions` getMembers includes `members`.
    // The Owner should be displayed. If `site.userId` is the owner, and they are not in `members` relation, `getTeamMembers` only returns `members`.
    // We should probably fetch owner detail too if we want to show them.
    // Let's assume for now we just show `members`.

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                    Manage your team members and invitations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Invite Section (Owner Only) */}
                {isOwner && (
                    <div className="flex gap-2 items-end">
                        <div className="grid gap-1 flex-1">
                            <label className="text-sm font-medium">Invite User</label>
                            <Input
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleInvite} disabled={loading || !email}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Invite
                        </Button>
                    </div>
                )}

                <Separator />

                {/* Lists */}
                {fetching ? (
                    <div className="text-center py-4 text-muted-foreground">Loading members...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Members */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Members</h3>
                            {members.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No other members.</p>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.image} />
                                                <AvatarFallback>{member.name?.[0] || "M"}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-0.5">
                                                <div className="text-sm font-medium">{member.name}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </div>
                                        </div>
                                        {isOwner && member.id !== session?.user?.id && (
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleRemoveMember(member.id)}>
                                                <UserMinus className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pending Invitations (Owner Only) */}
                        {isOwner && invitations.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Invitations</h3>
                                {invitations.map((invite) => (
                                    <div key={invite.id} className="flex items-center justify-between p-2 rounded-lg border border-dashed hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="grid gap-0.5">
                                                <div className="text-sm font-medium">{invite.email}</div>
                                                <div className="text-xs text-muted-foreground">Expires: {new Date(invite.expires).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Leave Team (Non-Owners) */}
                        {!isOwner && (
                            <div className="pt-4 border-t">
                                <Button variant="destructive" size="sm" onClick={handleLeaveTeam}>
                                    Leave Team
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
