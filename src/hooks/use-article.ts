'use client';

import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseArticleOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useArticle({ onSuccess, onError }: UseArticleOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<any>(null);

  // Always keep order: teamId, articleId
  const getArticle = useCallback(
    async (teamId: string, articleId: string) => {
      if (!teamId) {
        toast.error("Team not found.");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`/api/team/${teamId}/articles/${articleId}`);
        setArticle(res.data);
        onSuccess?.(res.data);
        return res.data;
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to load article";
        toast.error(message);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const updateArticle = useCallback(
    async (teamId: string, articleId: string, data: Record<string, any>) => {
      if (!teamId) {
        toast.error("Team not found.");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.patch(
          `/api/team/${teamId}/articles/${articleId}`,
          data
        );
        toast.success("Article updated successfully!");
        setArticle(res.data);
        onSuccess?.(res.data);
        return res.data;
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to update article";
        toast.error(message);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return { article, getArticle, updateArticle, loading };
}
