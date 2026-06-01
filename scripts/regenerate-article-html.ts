/**
 * Regenerate article.html from Lexical content JSON (includes carousel export).
 *
 * Usage:
 *   DATABASE_URL="mongodb+srv://..." npx tsx scripts/regenerate-article-html.ts [siteId]
 */
import "./lib/bootstrap"
import { JSDOM } from "jsdom"
import { createEditor } from "lexical"
import { $generateHtmlFromNodes } from "@lexical/html"
import { nodes } from "../src/components/blocks/editor-x/nodes"
import { getScriptDb, disconnectScriptDb } from "./lib/prisma-script"

const SITE_ID_DEFAULT = "6a099338b4f6f3ac6e2dc60a"

function hasCarouselInContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return false
  let found = false
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return
    const record = node as Record<string, unknown>
    if (record.type === "carousel") found = true
    if (Array.isArray(record.children)) record.children.forEach(visit)
  }
  visit((content as { root?: unknown }).root)
  return found
}

function setupDom(): void {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>")
  const { window } = dom
  globalThis.document = window.document
  globalThis.window = window as unknown as Window & typeof globalThis
  globalThis.Node = window.Node
  globalThis.HTMLElement = window.HTMLElement
}

async function htmlFromContent(content: unknown): Promise<string | null> {
  if (!content || typeof content !== "object") return null
  const record = content as { root?: unknown }
  if (!record.root) return null

  setupDom()

  const editor = createEditor({
    nodes: [...nodes],
    onError: (error) => console.error(error),
  })

  const state = editor.parseEditorState(JSON.stringify(content))
  editor.setEditorState(state)

  let html = ""
  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor, null)
  })

  return html || null
}

async function main() {
  const siteId = process.argv[2] ?? SITE_ID_DEFAULT
  const db = getScriptDb()

  const articles = await db.article.findMany({
    where: { siteId },
    select: { id: true, title: true, slug: true, html: true, content: true },
  })

  console.log(`Processing ${articles.length} articles for site ${siteId}…\n`)

  let updated = 0
  let skipped = 0

  for (const article of articles) {
    const content = article.content
    if (!content || !hasCarouselInContent(content)) {
      skipped++
      continue
    }

    const nextHtml = await htmlFromContent(content)
    if (!nextHtml || !nextHtml.includes("swiper-container")) {
      console.warn(`  skip (no swiper in output): ${article.slug}`)
      skipped++
      continue
    }

    if (article.html === nextHtml) {
      skipped++
      continue
    }

    await db.article.update({
      where: { id: article.id },
      data: { html: nextHtml },
    })
    updated++
    console.log(`  updated: ${article.slug}`)
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
