import { getActivityLogs } from "@/lib/actions/activity-log"
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Activity, FileText, FolderOpen, Image, Settings, Trash2, UserPlus, Edit, Plus, Eye, EyeOff, Layers } from "lucide-react"
import { redirect } from "next/navigation"

const actionIcons: Record<string, React.ReactNode> = {
    CREATE: <Plus className="w-3 h-3" />,
    UPDATE: <Edit className="w-3 h-3" />,
    DELETE: <Trash2 className="w-3 h-3" />,
    PUBLISH: <Eye className="w-3 h-3" />,
    UNPUBLISH: <EyeOff className="w-3 h-3" />,
    INVITE: <UserPlus className="w-3 h-3" />,
    REMOVE: <Trash2 className="w-3 h-3" />,
    LOGIN: <Activity className="w-3 h-3" />,
    OTHER: <Activity className="w-3 h-3" />,
}

const actionColors: Record<string, string> = {
    CREATE: "bg-green-500/10 text-green-500 border-green-500/20",
    UPDATE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
    PUBLISH: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    UNPUBLISH: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    INVITE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    REMOVE: "bg-red-500/10 text-red-500 border-red-500/20",
    LOGIN: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const entityIcons: Record<string, React.ReactNode> = {
    article: <FileText className="w-4 h-4 text-muted-foreground" />,
    category: <FolderOpen className="w-4 h-4 text-muted-foreground" />,
    page: <Layers className="w-4 h-4 text-muted-foreground" />,
    media: <Image className="w-4 h-4 text-muted-foreground" />,
    settings: <Settings className="w-4 h-4 text-muted-foreground" />,
    member: <UserPlus className="w-4 h-4 text-muted-foreground" />,
}

export default async function LogsPage({ params }: { params: { siteId: string } }) {
    const { siteId } = await params
    const site = await getActiveTeam(siteId)

    if (!site) return redirect("/dashboard")

    // Check CMS mode
    const isCMS = (site.settings as any)?.mode === "cms"
    if (!isCMS) return redirect(`/dashboard/${siteId}`)

    const { logs, total } = await getActivityLogs(siteId)

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track all changes and actions by team members • {total} entries
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">User</TableHead>
                            <TableHead className="w-[120px]">Action</TableHead>
                            <TableHead className="w-[120px]">Entity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="w-[150px] text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length > 0 ? (
                            logs.map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 ring-1 ring-border">
                                                <AvatarImage src={log.user?.image || ""} />
                                                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                                    {log.user?.name?.substring(0, 2).toUpperCase() || "??"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">{log.user?.name || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`gap-1 ${actionColors[log.action] || actionColors.OTHER}`}>
                                            {actionIcons[log.action] || actionIcons.OTHER}
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {entityIcons[log.entity] || <Activity className="w-4 h-4 text-muted-foreground" />}
                                            <span className="capitalize">{log.entity}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {log.entityName ? (
                                            <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
                                                &ldquo;{log.entityName}&rdquo;
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-[200px] text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                        <Activity className="w-8 h-8 opacity-20" />
                                        <p>No activity logs yet.</p>
                                        <p className="text-xs">Actions will appear here as team members make changes.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
