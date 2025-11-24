"use client"

import { useState } from "react"
import { Facebook, Twitter, Linkedin, Mail, MessageCircle, Bookmark, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Article } from "@prisma/client"

interface ArticleProps {
    // Header/Navigation props
    siteLogoText?: string
    navigationLinks?: { label: string; href: string }[]

    // Category and breadcrumb props
    categoryLabel?: string
    categoryColor?: string
    breadcrumbs?: string[]

    // Article metadata props
    title?: string
    subtitle?: string
    publishDate?: string
    updateDate?: string
    author?: string
    readTime?: string

    // Main image props
    mainImage?: string
    mainImageCaption?: string
    mainImageCredit?: string

    // Article content props
    content?: {
        type: "paragraph" | "heading" | "quote" | "list" | "image" | "html"
        text?: string
        items?: string[]
        imageSrc?: string
        imageCaption?: string
    }[]

    // Tags props
    tags?: string[]

    // Related articles props
    relatedArticles?: {
        title: string
        category: string
        image: string
        time: string
    }[]

    // Styling props
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    linkColor?: string
    borderColor?: string
    headerBgColor?: string

    // New: dynamic article
    article?: Article
}

export default function SingleArticle2({
    article,
    siteLogoText = "ΝΑΥΤΕΜΠΟΡΙΚΗ",
    navigationLinks = [
        { label: "ΑΡΧΙΚΗ", href: "#" },
        { label: "ΟΙΚΟΝΟΜΙΑ", href: "#" },
        { label: "ΕΠΙΧΕΙΡΗΣΕΙΣ", href: "#" },
        { label: "ΧΡΗΜΑΤΙΣΤΗΡΙΟ", href: "#" },
        { label: "ΚΟΣΜΟΣ", href: "#" },
        { label: "POLITICA", href: "#" },
        { label: "ΝΑΥΤΙΛΙΑ", href: "#" },
    ],
    categoryLabel = "ΚΟΣΜΟΣ",
    categoryColor = "#d32f2f",
    breadcrumbs = ["Αρχική", "Κόσμος"],
    title = "Ουκρανία: Το ειρηνευτικό σχέδιο μειώθηκε σε 19 από 28 σημεία",
    subtitle = "",
    publishDate = "24/11/2025 14:30",
    updateDate = "",
    author = "Naftemporiki.gr",
    readTime = "3 λεπτά ανάγνωση",
    mainImage = "/placeholder.svg?height=600&width=1200",
    mainImageCaption = "",
    mainImageCredit = "Φωτογραφία: Reuters",
    content = [
        {
            type: "paragraph",
            text: "Η Ουκρανία μείωσε το ειρηνευτικό της σχέδιο από 28 σε 19 σημεία, σύμφωνα με πληροφορίες που έδωσε στη δημοσιότητα ο Ουκρανός πρόεδρος Βολοντιμίρ Ζελένσκι.",
        },
        {
            type: "paragraph",
            text: "Το αρχικό σχέδιο περιλάμβανε λεπτομερείς προτάσεις για την επίλυση της σύγκρουσης, αλλά μετά από διαβουλεύσεις με διεθνείς εταίρους, η ουκρανική πλευρά αποφάσισε να συμπυκνώσει τις θέσεις της.",
        },
        {
            type: "heading",
            text: "Τα βασικά σημεία του σχεδίου",
        },
        {
            type: "list",
            items: [
                "Αποκατάσταση της εδαφικής ακεραιότητας",
                "Εγγυήσεις ασφαλείας από τη Δύση",
                "Οικονομική στήριξη για την ανασυγκρότηση",
                "Δικαιοσύνη για τα εγκλήματα πολέμου",
            ],
        },
    ],
    tags = ["Ουκρανία", "Ειρήνη", "Διεθνή", "Πόλεμος"],
    relatedArticles = [
        {
            title: "Νέες εξελίξεις στο διεθνές προσκήνιο",
            category: "ΚΟΣΜΟΣ",
            image: "/placeholder.svg?height=200&width=300",
            time: "2 ώρες πριν",
        },
        {
            title: "Συνάντηση ηγετών για την ειρήνη",
            category: "ΚΟΣΜΟΣ",
            image: "/placeholder.svg?height=200&width=300",
            time: "5 ώρες πριν",
        },
        {
            title: "Οικονομικές κυρώσεις και συνέπειες",
            category: "ΟΙΚΟΝΟΜΙΑ",
            image: "/placeholder.svg?height=200&width=300",
            time: "1 ημέρα πριν",
        },
    ],
    accentColor = "#d32f2f",
    backgroundColor = "#ffffff",
    textColor = "#212121",
    linkColor = "#1976d2",
    borderColor = "#e0e0e0",
    headerBgColor = "#1a1a1a",
}: ArticleProps) {
    const [isBookmarked, setIsBookmarked] = useState(false)

    // --- Dynamic article overrides ---
    if (article) {
        title = article.title || title
        subtitle = article.excerpt || subtitle
        publishDate = new Date(article.createdAt).toLocaleString("el-GR")
        updateDate = article.updateAt ? new Date(article.updateAt).toLocaleString("el-GR") : updateDate
        author = article.authorId || author
        mainImage = article.cover || mainImage
        tags = article.categories?.length ? article.categories : tags

        if (article.content && Array.isArray(article.content)) {
            content = article.content as any[]
        } else if (article.html) {
            content = [{ type: "html", text: article.html }]
        }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor }}>
            {/* Top Header Bar */}
            <header className="border-b" style={{ backgroundColor: headerBgColor, borderColor }}>
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold tracking-tight text-white">{siteLogoText}</h1>
                            <nav className="hidden gap-6 lg:flex">
                                {navigationLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                                ΣΥΝΔΕΣΗ
                            </Button>
                            <Button size="sm" style={{ backgroundColor: accentColor }} className="text-white">
                                ΕΓΓΡΑΦΗ
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumb Navigation */}
            <div className="border-b" style={{ borderColor }}>
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <a href="#" className="transition-colors hover:underline" style={{ color: linkColor }}>
                                    {crumb}
                                </a>
                                {index < breadcrumbs.length - 1 && (
                                    <ChevronRight className="h-4 w-4" style={{ color: textColor, opacity: 0.5 }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Main Article Content */}
                    <article>
                        {/* Category Badge */}
                        <div className="mb-4">
                            <span
                                className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                                style={{ backgroundColor: categoryColor }}
                            >
                                {categoryLabel}
                            </span>
                        </div>

                        {/* Article Title */}
                        <h1 className="mb-4 text-4xl font-bold leading-tight lg:text-5xl" style={{ color: textColor }}>
                            {title}
                        </h1>

                        {/* Subtitle */}
                        {subtitle && (
                            <p className="mb-6 text-xl leading-relaxed" style={{ color: textColor, opacity: 0.8 }}>
                                {subtitle}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm" style={{ color: textColor, opacity: 0.7 }}>
                            <div className="flex items-center gap-2">
                                <span>Δημοσίευση: {publishDate}</span>
                            </div>
                            {updateDate && (
                                <div className="flex items-center gap-2">
                                    <span>Ενημέρωση: {updateDate}</span>
                                </div>
                            )}
                            <span>|</span>
                            <span>{author}</span>
                            <span>|</span>
                            <span>{readTime}</span>
                        </div>

                        {/* Social Buttons */}
                        <div className="mb-8 flex flex-wrap items-center gap-3 border-y py-4" style={{ borderColor }}>
                            <span className="text-sm font-medium" style={{ color: textColor }}>
                                Κοινοποίηση:
                            </span>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Facebook className="h-4 w-4" style={{ color: "#1877f2" }} />
                                Facebook
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Twitter className="h-4 w-4" style={{ color: "#1da1f2" }} />
                                Twitter
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Linkedin className="h-4 w-4" style={{ color: "#0a66c2" }} />
                                LinkedIn
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Mail className="h-4 w-4" />
                                Email
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <MessageCircle className="h-4 w-4" style={{ color: "#25d366" }} />
                                WhatsApp
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto gap-2 bg-transparent"
                                onClick={() => setIsBookmarked(!isBookmarked)}
                            >
                                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                                {isBookmarked ? "Αποθηκεύτηκε" : "Αποθήκευση"}
                            </Button>
                        </div>

                        {/* Main Image */}
                        <figure className="mb-8">
                            <img src={mainImage || "/placeholder.svg"} alt={title} className="w-full rounded-lg" />
                            {(mainImageCaption || mainImageCredit) && (
                                <figcaption className="mt-2 text-sm" style={{ color: textColor, opacity: 0.6 }}>
                                    {mainImageCaption && <span>{mainImageCaption}</span>}
                                    {mainImageCaption && mainImageCredit && <span> - </span>}
                                    {mainImageCredit && <span>{mainImageCredit}</span>}
                                </figcaption>
                            )}
                        </figure>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none">
                            {content.map((block, index) => {
                                switch (block.type) {
                                    case "paragraph":
                                        return (
                                            <p key={index} className="mb-6 text-lg leading-relaxed" style={{ color: textColor }}>
                                                {block.text}
                                            </p>
                                        )
                                    case "heading":
                                        return (
                                            <h2 key={index} className="mb-4 mt-8 text-2xl font-bold" style={{ color: textColor }}>
                                                {block.text}
                                            </h2>
                                        )
                                    case "quote":
                                        return (
                                            <blockquote
                                                key={index}
                                                className="my-6 border-l-4 pl-6 italic"
                                                style={{ borderColor: accentColor, color: textColor }}
                                            >
                                                {block.text}
                                            </blockquote>
                                        )
                                    case "list":
                                        return (
                                            <ul key={index} className="mb-6 ml-6 list-disc space-y-2">
                                                {block.items?.map((item, i) => (
                                                    <li key={i} className="text-lg leading-relaxed" style={{ color: textColor }}>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    case "image":
                                        return (
                                            <figure key={index} className="my-8">
                                                <img
                                                    src={block.imageSrc || "/placeholder.svg"}
                                                    alt={block.imageCaption || ""}
                                                    className="w-full rounded-lg"
                                                />
                                                {block.imageCaption && (
                                                    <figcaption className="mt-2 text-sm" style={{ color: textColor, opacity: 0.6 }}>
                                                        {block.imageCaption}
                                                    </figcaption>
                                                )}
                                            </figure>
                                        )
                                    case "html":
                                        return (
                                            <div
                                                key={index}
                                                className="article-html-content mb-6 text-lg leading-relaxed"
                                                style={{ color: textColor }}
                                                dangerouslySetInnerHTML={{ __html: block.text || "" }}
                                            />
                                        )
                                    default:
                                        return null
                                }
                            })}
                        </div>

                        {/* Tags */}
                        {tags && tags.length > 0 && (
                            <div className="mt-12 border-t pt-6" style={{ borderColor }}>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm font-medium" style={{ color: textColor }}>
                                        Ετικέτες:
                                    </span>
                                    {tags.map((tag, index) => (
                                        <a
                                            key={index}
                                            href="#"
                                            className="rounded-full px-3 py-1 text-sm transition-colors"
                                            style={{
                                                backgroundColor: borderColor,
                                                color: textColor,
                                            }}
                                        >
                                            {tag}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author Bio */}
                        <div className="mt-8 rounded-lg border p-6" style={{ borderColor }}>
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {author.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: textColor }}>
                                        {author}
                                    </h3>
                                    <p className="mt-1 text-sm" style={{ color: textColor, opacity: 0.7 }}>
                                        Συντάκτης στο Naftemporiki.gr
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                                        Περισσότερα άρθρα
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="rounded-lg border p-4" style={{ borderColor }}>
                            <h3 className="mb-4 text-lg font-bold" style={{ color: textColor }}>
                                ΠΕΡΙΣΣΟΤΕΡΑ ΑΠΟ {categoryLabel}
                            </h3>
                            <div className="space-y-4">
                                {relatedArticles.map((article, index) => (
                                    <a key={index} href="#" className="group block">
                                        <div className="flex gap-3">
                                            <img
                                                src={article.image || "/placeholder.svg"}
                                                alt={article.title}
                                                className="h-20 w-20 flex-shrink-0 rounded object-cover"
                                            />
                                            <div>
                                                <span className="mb-1 inline-block text-xs font-bold uppercase" style={{ color: accentColor }}>
                                                    {article.category}
                                                </span>
                                                <h4
                                                    className="text-sm font-semibold leading-tight transition-colors group-hover:underline"
                                                    style={{ color: textColor }}
                                                >
                                                    {article.title}
                                                </h4>
                                                <p className="mt-1 text-xs" style={{ color: textColor, opacity: 0.6 }}>
                                                    {article.time}
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div
                            className="flex h-[600px] items-center justify-center rounded-lg border text-sm"
                            style={{
                                borderColor,
                                backgroundColor: borderColor,
                                color: textColor,
                            }}
                        >
                            ΔΙΑΦΗΜΙΣΗ 300x600
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="mt-16 border-t" style={{ borderColor, backgroundColor: headerBgColor }}>
                <div className="mx-auto max-w-7xl px-4 py-12">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <h4 className="mb-4 text-lg font-bold text-white">{siteLogoText}</h4>
                            <p className="text-sm text-white/70">
                                Η πιο αξιόπιστη πηγή ειδήσεων για την οικονομία και τις επιχειρήσεις.
                            </p>
                        </div>
                        <div>
                            <h5 className="mb-4 font-bold text-white">Κατηγορίες</h5>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li><a href="#" className="hover:text-white">Οικονομία</a></li>
                                <li><a href="#" className="hover:text-white">Επιχειρήσεις</a></li>
                                <li><a href="#" className="hover:text-white">Χρηματιστήριο</a></li>
                                <li><a href="#" className="hover:text-white">Κόσμος</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="mb-4 font-bold text-white">Πληροφορίες</h5>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li><a href="#" className="hover:text-white">Σχετικά με εμάς</a></li>
                                <li><a href="#" className="hover:text-white">Επικοινωνία</a></li>
                                <li><a href="#" className="hover:text-white">Διαφήμιση</a></li>
                                <li><a href="#" className="hover:text-white">Όροι Χρήσης</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="mb-4 font-bold text-white">Ακολουθήστε μας</h5>
                            <div className="flex gap-3">
                                <a href="#" className="text-white/70 hover:text-white"><Facebook className="h-5 w-5" /></a>
                                <a href="#" className="text-white/70 hover:text-white"><Twitter className="h-5 w-5" /></a>
                                <a href="#" className="text-white/70 hover:text-white"><Linkedin className="h-5 w-5" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-8 text-center text-sm text-white/50" style={{ borderColor }}>
                        © 2025 {siteLogoText}. Με την επιφύλαξη παντός δικαιώματος.
                    </div>
                </div>
            </footer>
        </div>
    )
}
