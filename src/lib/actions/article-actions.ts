"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function getArticles(siteId: string) {
    // Public access allowed for fetching articles
    // const session = await getAuthSession()
    // if (!session) return { error: "Unauthorized" }

    try {
        const articles = await db.article.findMany({
            where: { siteId },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50, // Reasonable limit for search
        })
        return { articles }
    } catch (error) {
        console.error("Failed to fetch articles:", error)
        return { error: "Failed to fetch articles" }
    }
}
