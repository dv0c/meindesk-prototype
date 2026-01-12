"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Monitor, Tablet, Smartphone, Download, Copy, Check, X, Code2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RawHtmlDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    htmlContent: string
}

export function RawHtmlDialog({ open, onOpenChange, htmlContent }: RawHtmlDialogProps) {
    const [copied, setCopied] = useState(false)
    const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlContent)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "index.html"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Download started")
    }

    // Determine container width based on view mode
    const getContainerStyle = () => {
        switch (viewMode) {
            case "mobile":
                return { width: "375px", height: "100%" }
            case "tablet":
                return { width: "768px", height: "100%" }
            default:
                return { width: "100%", height: "100%" }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-screen h-screen max-w-none rounded-none border-none p-0 gap-0 bg-background flex flex-col font-sans [&>button]:hidden">
                {/* Window Header */}
                <div className="h-14 border-b bg-muted/30 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-none border bg-background flex items-center justify-center">
                            <Code2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold font-mono tracking-tight text-foreground/90">PAGE_EXPORT.HTML</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Ready for deployment</span>
                        </div>
                    </div>

                    {/* View Controls */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 border rounded-md">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 rounded-sm", viewMode === "desktop" && "bg-background shadow-sm")}
                            onClick={() => setViewMode("desktop")}
                            title="Desktop View"
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 rounded-sm", viewMode === "tablet" && "bg-background shadow-sm")}
                            onClick={() => setViewMode("tablet")}
                            title="Tablet View"
                        >
                            <Tablet className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 rounded-sm", viewMode === "mobile" && "bg-background shadow-sm")}
                            onClick={() => setViewMode("mobile")}
                            title="Mobile View"
                        >
                            <Smartphone className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="rounded-none border-dashed hover:border-solid h-8 font-mono text-xs"
                        >
                            {copied ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                            {copied ? "COPIED" : "COPY CODE"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDownload}
                            className="rounded-none h-8 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Download className="h-3 w-3 mr-2" />
                            DOWNLOAD FILE
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-muted/10 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    {/* Device Frame */}
                    <div
                        className={cn(
                            "bg-background transition-all duration-300 ease-in-out flex flex-col shadow-2xl overflow-hidden border",
                            viewMode !== "desktop" && "rounded-[2rem] border-[8px] border-zinc-800",
                            viewMode === "tablet" && "aspect-[3/4] max-h-full",
                            viewMode === "mobile" && "aspect-[9/19.5] max-h-full"
                        )}
                        style={viewMode === "desktop" ? { width: "100%", height: "100%" } : { height: "90%" }}
                    >
                        {/* Status Bar for Mobile/Tablet */}
                        {viewMode !== "desktop" && (
                            <div className="h-6 bg-zinc-800 w-full shrink-0 flex items-center justify-center">
                                <div className="w-16 h-4 bg-black rounded-b-xl" />
                            </div>
                        )}

                        <iframe
                            srcDoc={htmlContent}
                            className="flex-1 w-full border-none bg-white"
                            title="Export Preview"
                            sandbox="allow-scripts allow-same-origin" // Important for JS execution
                        />

                        {/* Home Bar for Mobile */}
                        {viewMode === "mobile" && (
                            <div className="h-4 bg-zinc-800 w-full shrink-0 flex items-center justify-center pb-1">
                                <div className="w-24 h-1 bg-zinc-600 rounded-full" />
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground font-mono">
                        SRC: {htmlContent.length} bytes
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
