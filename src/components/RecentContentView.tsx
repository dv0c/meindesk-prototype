import { ArrowUpRight, Clock, FileIcon, FileText } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

const RecentContentView = () => {
    return <Card className="lg:col-span-2">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Content</CardTitle>
                    <CardDescription>Your latest articles and pages</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                    View all
                    <ArrowUpRight className="ml-1 size-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {[
                    {
                        title: "Getting Started with Next.js",
                        type: "Article",
                        status: "Published",
                        date: "2 hours ago",
                    },
                    {
                        title: "About Our Team",
                        type: "Page",
                        status: "Published",
                        date: "1 day ago",
                    },
                    {
                        title: "Product Launch Announcement",
                        type: "Article",
                        status: "Draft",
                        date: "3 days ago",
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                {item.type === "Article" ? (
                                    <FileText className="size-5" />
                                ) : (
                                    <FileIcon className="size-5" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{item.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    {item.date}
                                </div>
                            </div>
                        </div>
                        <Badge variant={item.status === "Published" ? "default" : "secondary"}>{item.status}</Badge>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
}

export default RecentContentView