"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function TenantLoading() {
    return (
        <div className="min-h-screen animate-in fade-in duration-500">
            {/* Navbar skeleton */}
            <div className="h-16 border-b bg-background/95 backdrop-blur">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
            </div>

            {/* Hero section skeleton */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-2/3 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <div className="flex gap-4 justify-center pt-4">
                        <Skeleton className="h-11 w-32 rounded-md" />
                        <Skeleton className="h-11 w-32 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Content blocks skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4 p-6 rounded-lg border">
                            <Skeleton className="h-40 w-full rounded-md" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional section skeleton */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-4">
                    <Skeleton className="h-8 w-1/3 mx-auto" />
                    <div className="grid grid-cols-2 gap-8 pt-6">
                        <Skeleton className="h-64 rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-10 w-28 rounded-md mt-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
