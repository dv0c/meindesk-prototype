"use client";

import { usePathname } from "next/navigation";
import { EditorComponent } from "./_comps/EditorComponent";
import { SingleArticleComponent } from "./_comps/SingleArticle";
import { useIsEditorMode } from "@/lib/BuilderMode";
import { useEffect, useState } from "react";
import { Article } from "@prisma/client";
import { useTeam } from "@/hooks/useTeam";
import axios from "axios";

export interface SingleArticleProps {
    showCover?: boolean;
    coverHeight?: string;
    titleTag?: "h1" | "h2" | "h3";
    showExcerpt?: boolean;
    showCategories?: boolean;
    showMetadata?: boolean;
    contentFallback?: "json" | "none";
    padding?: string;
    align?: "left" | "center" | "right";
    slug?: string; // allow direct slug override
}

export const SingleArticle = ({ slug: propSlug, padding = "1rem", align = "left", ...props }: SingleArticleProps) => {
    const pathname = usePathname();
    const isEditorMode = useIsEditorMode();
    const { team, loading: teamLoading } = useTeam(undefined, !isEditorMode ? "tenant" : "");
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Determine slug: priority to propSlug, then URL
    const urlSegments = pathname.split("/").filter(Boolean); // ["article", "my-slug"]
    const slug = propSlug || (urlSegments[0] === "article" ? urlSegments[1] : undefined);

    useEffect(() => {
        if (!team?.id) return;

        const fetchArticle = async () => {
            setLoading(true);
            setError(null);

            try {
                let res;
                if (isEditorMode) {
                    // In editor mode, just get the latest article for this team
                    res = await axios.get(`/api/team/${team.id}/articles?limit=1`);
                    setArticle(res.data?.[0] || null);
                } else if (slug) {
                    // In normal mode, get article by slug
                    res = await axios.get(`/api/v1/${team.id}/articles/${slug}`);
                    setArticle(res.data || null);
                } else {
                    setArticle(null);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch article");
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [team?.id, slug, isEditorMode]);

    if (teamLoading || loading) {
        return <div style={{ padding, textAlign: align }}>Loading article...</div>;
    }

    if (!team?.id) {
        return (
            <div style={{ padding, textAlign: align, color: "red" }}>
                Component not found
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding, textAlign: align, color: "red" }}>
                {error}
            </div>
        );
    }

    if (!article && !isEditorMode) {
        return <div style={{ padding, textAlign: align }}>No articles found</div>;
    }


    return <SingleArticleComponent article={article as Article} {...props} />;
};
