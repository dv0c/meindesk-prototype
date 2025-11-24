"use client";

import { useTeam } from "@/hooks/useTeam";
import { Article } from "@prisma/client";
import axios from "axios";
import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useIsEditorMode } from "@/lib/BuilderMode";

interface SingleArticleComponentProps {
  showCover?: boolean;
  coverHeight?: string;
  titleTag?: "h1" | "h2" | "h3";
  showExcerpt?: boolean;
  showCategories?: boolean;
  showMetadata?: boolean;
  backgroundColor?: string;
  contentFallback?: "json" | "none";
  padding?: string;
  align?: "left" | "center" | "right";
  article: Article;
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
  contentFallback = "json",
  padding = "24px",
  backgroundColor,
  children,
  align = "left",
  article,
  ...props
}) => {
  const isEditorMode = useIsEditorMode()
  const TitleTag = titleTag;
  const titleSizeClasses =
    titleTag === "h1"
      ? "text-2xl sm:text-3xl md:text-5xl" // Largest for H1
      : titleTag === "h2"
        ? "text-xl sm:text-2xl md:text-4xl" // Medium for H2
        : "text-lg sm:text-xl md:text-3xl"; // Smallest for H3

  // 2. Define classes for the cover/hero area (overlay text)
  const heroTitleClasses = `text-[#f1e6df] text-center font-bold flex justify-center items-center w-full h-full drop-shadow-lg ${titleSizeClasses}`;

  return (
    <article {...props}
      className="mx-auto font-serif"
      style={{ padding }}
    >
      {/* Thumbnail */}
      {article.cover && showCover && (
        <div className={`relative h-[${coverHeight || '30vh'}] bg-black/30 w-full`}>
          <TitleTag className={`z-20 max-w-xl mx-auto relative ${heroTitleClasses}`}>
            {article.title}
          </TitleTag>
          <Image
            priority
            alt={article.title}
            src={article.cover || "/SIMA_1-02 .webp"}
            className="object-cover object-center brightness-60 z-1 select-none"
            fill
            draggable="false"
          />
        </div>
      )}
      <div className="pt-10" style={{ backgroundColor: backgroundColor }}>
        {/* EXCERPT */}
        <div>
          {article.excerpt}
        </div>



        {/* CONTENT */}
        {article.html && (
          <div dangerouslySetInnerHTML={{ __html: article.html }} />
        )}
        {children || (
          <div style={{ color: "#9ca3af", fontStyle: "italic" }}>
            {isEditorMode ? "Add content components here..." : null}
          </div>
        )}
      </div>
    </article>
  );
};