"use client";

import { useTeam } from "@/hooks/useTeam";
import { Article } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SingleArticleComponentProps {
  showCover?: boolean;
  coverHeight?: string;
  titleTag?: "h1" | "h2" | "h3";
  showExcerpt?: boolean;
  showCategories?: boolean;
  showMetadata?: boolean;
  contentFallback?: "json" | "none";
  padding?: string;
  align?: "left" | "center" | "right";
  article: Article
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
  align = "left",
  article
}) => {

  const TitleTag = titleTag;

  return (
    <article style={{ maxWidth: "900px", margin: "0 auto", padding, fontFamily: "Georgia, serif" }}>
      {/* Header with image on the right */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <TitleTag style={{ fontSize: "2.5rem", lineHeight: "1.2", marginBottom: "16px" }}>
            {article?.title}
          </TitleTag>

          {showExcerpt && article.excerpt && (
            <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "16px" }}>{article.excerpt}</p>
          )}

          {showCategories && article.categories.length > 0 && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              {article.categories.map((c) => (
                <span key={c} style={{ background: "#f0f0f0", padding: "6px 12px", borderRadius: "12px", fontSize: "0.875rem" }}>
                  {c}
                </span>
              ))}
            </div>
          )}

          {showMetadata && (
            <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "16px" }}>
              <span>Author: {article.authorId}</span> •{" "}
              <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span> •{" "}
              <span>Updated: {new Date(article.updateAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {showCover && article.cover && (
          <div style={{ width: "320px", height: "180px", position: "relative" }}>
            <Image src={article.cover} alt={article.title} fill style={{ objectFit: "cover", borderRadius: "8px" }} />
          </div>
        )}
      </div>

      {/* Content */}
      <section style={{ lineHeight: "1.8", fontSize: "1.1rem", color: "#222" }}>
        {article.html ? (
          <div dangerouslySetInnerHTML={{ __html: article.html }} />
        ) : contentFallback === "json" ? (
          <pre>{JSON.stringify(article.content, null, 2)}</pre>
        ) : null}
      </section>
    </article>
  );
};
