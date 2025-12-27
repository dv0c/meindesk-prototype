/**
 * Article Building Blocks
 * 
 * Modular components for building custom article layouts.
 * Use ArticleProvider to wrap your layout, then place any combination
 * of article blocks inside.
 */

export { ArticleProvider, useArticle, type ArticleData, type Author } from "./ArticleContext"
export { ArticleTitle } from "./ArticleTitle"
export { ArticleCover } from "./ArticleCover"
export { ArticleContent } from "./ArticleContent"
export { ArticleAuthor } from "./ArticleAuthor"

export { ArticleDate } from "./ArticleDate"
export { ArticleCategories } from "./ArticleCategories"
