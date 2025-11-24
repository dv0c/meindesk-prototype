"use client";

import { useTeam } from "@/hooks/useTeam";
import { Article } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";

interface EditorComponentProps {
  showCover?: boolean;
  coverHeight?: string;
  titleTag?: "h1" | "h2" | "h3";
  showExcerpt?: boolean;
  showCategories?: boolean;
  showMetadata?: boolean;
  contentFallback?: "json" | "none";
  padding?: string;
  align?: "left" | "center" | "right";
}

export const EditorComponent: React.FC<EditorComponentProps> = ({
  showCover,
  coverHeight,
  titleTag = "h1",
  showExcerpt,
  showCategories,
  showMetadata,
  contentFallback,
  padding,
  align,
}) => {
  const { team, loading: teamLoading } = useTeam();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!team?.id) return;

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/v1/${team.id}/articles?limit=1`);
        setArticle(res.data?.[0] || null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [team?.id]);

  // Handle loading state
  if (teamLoading || loading) {
    return <div style={{ padding, textAlign: align }}>Loading article...</div>;
  }

  // Handle team not found
  if (!team?.id) {
    return (
      <div style={{ padding, textAlign: align, color: "red" }}>
        Component not found
      </div>
    );
  }

  // Handle fetch errors
  if (error) {
    return (
      <div style={{ padding, textAlign: align, color: "red" }}>
        {error}
      </div>
    );
  }

  // Handle empty article
  if (!article) {
    return <div style={{ padding, textAlign: align }}>No articles found</div>;
  }

  const TitleTag = titleTag;

  return (
    <article style={{ maxWidth: "900px", margin: "0 auto", padding, fontFamily: "Georgia, serif" }}>
      {/* Header with image on the right */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <TitleTag style={{ fontSize: "2.5rem", lineHeight: "1.2", marginBottom: "16px" }}>
            {article.title}
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
