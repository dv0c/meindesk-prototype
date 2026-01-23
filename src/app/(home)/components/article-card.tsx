
"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Article {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    cover?: string | null
    createdAt: string | Date
    author?: {
        name: string
        image?: string | null
    }
    categories?: any[] // We might have full objects or IDs, but for display we assume we might fetch them or just show nothing if complex
}

interface ArticleCardProps {
    article: Article
    className?: string
}

export function ArticleCard({ article, className }: ArticleCardProps) {
    // Safe date parsing
    const date = new Date(article.createdAt)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("group flex flex-col h-full bg-card border border-border/50 rounded-xl overflow-hidden hover:border-accent/40 transition-colors duration-300", className)}
        >
            <Link href={`/${article.slug}`} className="block relative aspect-video overflow-hidden">
                {article.cover ? (
                    <Image
                        src={article.cover}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-4xl">📄</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                    <span>{format(date, "MMM d, yyyy")}</span>
                    {article.author && <span>{article.author.name}</span>}
                </div>

                <Link href={`/${article.slug}`} className="block group-hover:text-accent transition-colors duration-300">
                    <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-2">
                        {article.title}
                    </h3>
                </Link>

                {article.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                        {article.excerpt}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        Read Article &rarr;
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
