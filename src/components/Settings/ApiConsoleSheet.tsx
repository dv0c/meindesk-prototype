"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { ApiPlayground } from "./ApiPlayground"

export function ApiConsoleSheet({ siteId }: { siteId: string }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Database className="w-4 h-4 mr-2" />
                    API Console
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[800px] sm:w-[540px] md:w-[900px] sm:max-w-none overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>API Console</SheetTitle>
                    <SheetDescription>
                        Interact with your headless content API directly.
                    </SheetDescription>
                </SheetHeader>
                <ApiPlayground siteId={siteId} hideHeader={true} className="border-0 shadow-none p-0 h-[calc(100vh-150px)]" />
            </SheetContent>
        </Sheet>
    )
}
