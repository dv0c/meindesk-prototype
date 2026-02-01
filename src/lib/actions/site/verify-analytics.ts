"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function verifyAnalyticsInstallation(siteId: string) {
    const session = await getAuthSession()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const site = await db.site.findUnique({
            where: { id: siteId },
            include: { features: true }
        })

        if (!site) return { error: "Site not found" }
        if (!site.features) return { error: "Features not found" }

        // Fetch the site URL. 
        // Note: For local development, this might fail if site.url is localhost but port is different or not accessible from server container?
        // Assuming site.url is accessible.
        console.log("Verifying analytics for:", site.url)

        const response = await fetch(site.url, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Meindesk-Bot/1.0'
            }
        })

        if (!response.ok) {
            return { error: `Failed to access site: ${response.statusText}` }
        }

        const html = await response.text()

        // Check for usage of tracker.js
        // We look for the script src pattern or just "tracker.js"
        if (html.includes("tracker.js")) {
            // Enable analytics via Settings
            const currentSettings = (site.settings as any) || {}

            await db.site.update({
                where: { id: siteId },
                data: {
                    settings: {
                        ...currentSettings,
                        analyticsConnected: true
                    }
                }
            })

            revalidatePath(`/dashboard/${siteId}/projects/website/analytics`)
            return { success: true }
        } else {
            return { error: "Tracking script not found. Make sure you added it to the <head>." }
        }

    } catch (error: any) {
        console.error("Verification failed:", error)
        return { error: `Verification failed: ${error.message}` }
    }
}
