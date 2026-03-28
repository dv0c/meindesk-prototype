
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Plus, Trash2, Shield } from "lucide-react"
import { global_blur } from "@/lib/utils"
import { InviteMemberForm } from "@/components/dashboard/settings/InviteMemberForm"

export default async function TeamSettingsPage({ params }: { params: Promise<{ siteId: string }> }) {
    const session = await getAuthSession()
    if (!session?.user) return redirect("/login")

    const { siteId } = await params

    const site = await db.site.findUnique({
        where: { id: siteId },
        include: {
            members: true,
            user: true, // owner
        }
    })

    if (!site) return redirect("/dashboard")

    // Check if current user is member or owner
    const isOwner = site.userId === session.user.id
    const isMember = site.members.some(m => m.id === session.user.id)

    if (!isOwner && !isMember) return redirect("/dashboard")

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Team Members</h3>
                <p className="text-sm text-muted-foreground">
                    Manage who has access to this project.
                </p>
            </div>

            <div className={`space-y-6 ${global_blur} rounded-lg border bg-card text-card-foreground shadow-sm`}>
                <InviteMemberForm siteId={siteId} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Members</CardTitle>
                    <CardDescription>
                        People with access to <strong>{site.title}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Owner */}
                    {site.user && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={site.user.image || ""} />
                                    <AvatarFallback>{site.user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{site.user.name}
                                        {site.user.id === session.user.id && <span className="text-muted-foreground ml-2">(You)</span>}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{site.user.email}</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                                <Shield className="h-3 w-3" /> Owner
                            </Badge>
                        </div>
                    )}

                    {site.members.length > 0 && <Separator />}

                    {/* Members List */}
                    {site.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.image || ""} />
                                    <AvatarFallback>{member.name?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.name}
                                        {member.id === session.user.id && <span className="text-muted-foreground ml-2">(You)</span>}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Member</Badge>
                                {isOwner && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {site.members.length === 0 && !site.user && (
                        <p className="text-sm text-muted-foreground text-center py-4">No members found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
