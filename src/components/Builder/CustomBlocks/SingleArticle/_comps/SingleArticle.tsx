"use client";

import { useTeam } from "@/hooks/useTeam";
import { Article } from "@prisma/client";
import axios from "axios";
import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useIsEditorMode } from "@/lib/BuilderMode";
import { cn } from "@/lib/utils";

interface SingleArticleComponentProps {
  showCover?: boolean;
  coverHeight?: string;
  titleTag?: "h1" | "h2" | "h3";
  showExcerpt?: boolean;
  showCategories?: boolean;
  showMetadata?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  backgroundColor?: string;
  contentFallback?: "json" | "none";
  // Alignment & Layout
  align?: "left" | "center" | "right";
  style?: "default" | "magazine" | "minimal" | "card" | "news";
  // Granular Spacing
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  // Dimensions
  widthWidth?: string;
  widthHeight?: string;
  // Colors
  textColor?: string;
  titleColor?: string;
  accentColor?: string;
  dateColor?: string;
  // Data
  article: Article;
  contentPadding?: string;
  children?: ReactNode,
  [key: string]: any
}

export const SingleArticleComponent: React.FC<SingleArticleComponentProps> = ({
  showCover = true,
  coverHeight = "400px",
  titleTag = "h1",
  showExcerpt = true,
  showCategories = true,
  showMetadata = true,
  showDate = true,
  showAuthor = true,
  contentFallback = "json",
  // Granular Spacing & Dimensions
  widthWidth = "100%",
  widthHeight = "auto",
  marginTop = "0px",
  marginRight = "auto", // Center by default if width < 100%
  marginBottom = "0px",
  marginLeft = "auto",
  paddingTop = "24px",
  paddingRight = "24px",
  paddingBottom = "24px",
  paddingLeft = "24px",
  // Colors
  backgroundColor,
  textColor,
  titleColor,
  accentColor,
  dateColor,

  style = "default",
  children,
  align = "left",
  article,
  contentPadding,
  ...props
}) => {
  const isEditorMode = useIsEditorMode()
  const TitleTag = titleTag;

  // -- Helper: Date & Author Formatting --
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("el-GR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // -- Style Logic --
  const isCard = style === "card"
  const isMinimal = style === "minimal"
  const isNews = style === "news"
  const isMagazine = style === "magazine" || style === "default" // Default is currently Magazine-like

  // Dynamic Styles
  const containerStyle: React.CSSProperties = {
    width: widthWidth,
    height: widthHeight,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop: isCard ? "0px" : paddingTop, // Card padding handled inside
    paddingRight: isCard ? "0px" : paddingRight,
    paddingBottom: isCard ? "0px" : paddingBottom,
    paddingLeft: isCard ? "0px" : paddingLeft,
    backgroundColor: isCard ? "transparent" : backgroundColor, // Card bg applied to inner
    color: textColor,
  }

  const cardInnerStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || "#fff",
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    color: textColor,
  }

  const titleStyle: React.CSSProperties = {
    color: titleColor,
  }

  const metaStyle: React.CSSProperties = {
    color: dateColor || "#6b7280",
  }

  // Typography Sizes
  const titleClasses = cn(
    "font-bold leading-tight",
    titleTag === "h1" ? "text-3xl md:text-5xl" : titleTag === "h2" ? "text-2xl md:text-4xl" : "text-xl md:text-3xl"
  )

  // -- Render Helpers --

  const renderCover = () => {
    if (!showCover || !article.cover || isMinimal || isNews) return null; // News handles cover internally

    // Magazine/Default Overlay Style
    if (isMagazine) {
      return (
        <div className="relative w-full overflow-hidden" style={{ height: coverHeight }}>
          <Image
            priority
            alt={article.title}
            src={article.cover}
            className="object-cover object-center brightness-60"
            fill
            draggable="false"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center z-10">
            <TitleTag className={titleClasses} style={{ color: "#f1e6df", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {article.title}
            </TitleTag>
            {showMetadata && (
              <div className="mt-4 flex gap-4 text-white/90 text-sm font-medium">
                {showDate && <span>{formatDate(article.createdAt)}</span>}
                {showAuthor && article.author?.name && <span>by {article.author.name}</span>}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Card/Standard Style (Image on top, no overlay text)
    return (
      <div className="relative w-full" style={{ height: coverHeight }}>
        <Image
          priority
          alt={article.title}
          src={article.cover}
          className="object-cover object-center"
          fill
          draggable="false"
        />
      </div>
    )
  }

  const renderContent = () => {
    // NEWS Layout (Distinct structure)
    if (isNews) {
      return (
        <div className="flex flex-col gap-6 pt-6">
          {/* News Header */}
          <div className="space-y-4 text-left">
            {/* Metadata Row: Category | Date */}
            {showMetadata && (
              <div className="flex items-center gap-3 text-sm font-medium">
                {showCategories && <span style={{ color: accentColor || "#2563eb" }}>Διεθνή</span>}
                {/* Note: 'International' hardcoded placeholder or fallback to 'News' if no category data */}
                <span style={metaStyle}>{formatDate(article.createdAt)} Time: 21:21</span>
              </div>
            )}

            {/* Title */}
            <TitleTag className={titleClasses} style={titleStyle}>{article.title}</TitleTag>

            {/* Author Row */}
            {showAuthor && article.author && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {article.author.name?.charAt(0) || "A"}
                </div>
                <span className="font-semibold text-blue-600">{article.author.name}</span>
              </div>
            )}
          </div>

          {/* News Image */}
          {showCover && article.cover && (
            <div className="relative w-full mb-4" style={{ height: coverHeight }}>
              <Image
                priority
                alt={article.title}
                src={article.cover}
                className="object-cover object-center"
                fill
                draggable="false"
              />
              <div className="absolute bottom-[-24px] left-0 text-xs text-gray-500">
                Photograph: X (Source)
              </div>
            </div>
          )}

          {/* News Body with Sidebar */}
          <div className="flex gap-8 relative mt-6">
            {/* Sticky Share/sidebar */}
            <div className="hidden md:flex flex-col gap-3 sticky top-24 h-fit w-10 shrink-0">
              {/* Mock Share Icons */}
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-700 font-bold text-xs">f</button>
              <button className="w-8 h-8 bg-black hover:bg-gray-900 rounded flex items-center justify-center text-white font-bold text-xs">X</button>
              <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white font-bold text-xs">in</button>
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-700 font-bold text-xs">✉</button>
            </div>

            {/* Main Content with Drop Cap */}
            <div className="flex-1">
              {/* Drop Cap Logic: applied via prose modifier if possible, or we wrap first letter? 
                      Standard clean way: CSS first-letter pseudo. 
                      Tailwind has `prose-p:first-letter:...` but standard `prose` might capture it.
                      We'll add a specific class for the drop cap capability.
                  */}
              <style jsx global>{`
                    .news-drop-cap > div > p:first-of-type::first-letter {
                      float: left;
                      font-size: 5rem;
                      line-height: 0.8;
                      font-weight: bold;
                      margin-right: 0.75rem;
                      margin-top: 0rem;
                      color: ${textColor || 'inherit'};
                    }
                  `}</style>

              {article.html && (
                <div className="prose prose-lg prose-invert max-w-none news-drop-cap" style={{ color: textColor }}>
                  <div dangerouslySetInnerHTML={{ __html: article.html }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // STANDARD Layouts (Magazine/Minimal/Card)
    return (
      <div className={cn("flex flex-col gap-6", isMagazine ? "pt-10" : "pt-6")}>
        {/* Header for non-magazine styles */}
        {!isMagazine && (
          <div className={cn("space-y-4", align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left")}>
            <TitleTag className={titleClasses} style={titleStyle}>{article.title}</TitleTag>
            {showMetadata && (
              <div className="flex gap-4 text-sm font-medium opacity-80" style={metaStyle}>
                {showDate && <span>{formatDate(article.createdAt)}</span>}
                {showAuthor && article.author?.name && <span>by {article.author.name}</span>}
              </div>
            )}
          </div>
        )}

        {/* Excerpt */}
        {showExcerpt && article.excerpt && (
          <div className={cn("text-lg sm:text-xl font-serif italic opacity-90 border-l-4 pl-4", align === "center" && "text-center border-l-0 border-t-4 pt-4")} style={{ borderColor: accentColor || "currentColor" }}>
            {article.excerpt}
          </div>
        )}

        {/* HTML Content */}
        {article.html && (
          <div className="prose prose-lg prose-invert max-w-none" style={{ color: textColor }}>
            {/* We can inject custom styles for prose elements here if needed via style tag or class overrides */}
            <div dangerouslySetInnerHTML={{ __html: article.html }} />
          </div>
        )}

        {children && (
          <div className="mt-8 border-t pt-8 border-dashed border-gray-700">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <article
      {...props}
      className={cn(
        "relative font-serif transition-all duration-300",
        isCard && "rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
      )}
      style={containerStyle}
    >
      {/* Inner Container for Card styling context */}
      <div style={isCard ? cardInnerStyle : undefined} className="h-full w-full">
        {renderCover()}

        <div style={{ padding: contentPadding || (isMagazine || isCard ? "2rem" : "0") }}>
          {renderContent()}
        </div>
      </div>

      {isEditorMode && !article.html && !children && (
        <div className="p-4 text-center text-gray-400 italic">
          Single Article Placeholder (No Content)
        </div>
      )}
    </article>
  );
};