
"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface RawHtmlDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    htmlContent: string
}

export function RawHtmlDialog({ open, onOpenChange, htmlContent }: RawHtmlDialogProps) {
    const [copied, setCopied] = useState(false)

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
        a.download = "page-export.html"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Download started")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-screen h-screen max-w-none rounded-none flex border-none flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1.5">
                        <DialogTitle>Raw HTML Export</DialogTitle>
                        <DialogDescription>
                            Preview and download the raw HTML for this page.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download HTML
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 bg-zinc-950 relative group">
                    <iframe
                        srcDoc={htmlContent}
                        className="w-full h-full border-none bg-white"
                        title="HTML Preview"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
