import { getAuthSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import type { Media, MediaGalleryResponse } from "@/types/media-gallery";
import { type NextRequest, NextResponse } from "next/server";
import { createErrorResponse, requireSiteAccess } from "@/lib/security/route-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const nextCursor = searchParams.get("next_cursor");
  const searchQuery = searchParams.get("search") || "";

  try {
    // Validate siteId is a valid 24-char hex MongoDB ObjectId
    if (!siteId || !/^[0-9a-fA-F]{24}$/.test(siteId)) {
      return NextResponse.json(
        { error: "Invalid Site ID provided." },
        { status: 400 }
      );
    }

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    let results: any;

    if (!searchQuery) {
      // Use standard resources API for default view (often more reliable/faster for simple lists)
      // Why: Search API might timeout in some environments, and default listing doesn't need expressions
      try {
        results = await cloudinary.v2.api.resources({
          type: "upload",
          prefix: `${siteId}/`, // Search all uploads for this site
          resource_type: "image",
          max_results: 24,
          next_cursor: nextCursor,
          context: true,
        });
      } catch (resourceError: any) {
        console.error("[Cloudinary Resource Error]", resourceError);
        throw resourceError;
      }
    } else {
      // Build search expression for filtering
      let expression = `resource_type:image AND folder:${siteId}/*`;
      expression += ` AND (filename:${searchQuery}* OR tags:${searchQuery}* OR context.alt:${searchQuery}* OR context.caption:${searchQuery}*)`;

      // Execute search via Cloudinary Search API
      try {
        const search = cloudinary.v2.search
          .expression(expression)
          .sort_by("created_at", "desc")
          .max_results(24)
          .with_field("context")
          .with_field("tags");

        if (nextCursor) {
          search.next_cursor(nextCursor);
        }

        results = await search.execute();
      } catch (searchError: any) {
        console.error("[Cloudinary Search Error]", searchError);
        throw searchError;
      }
    }

    const mediaItems: Media[] = (results.resources || []).map(
      (resource: any) => ({
        id: resource.asset_id || resource.public_id,
        public_id: resource.public_id,
        name:
          resource.filename ||
          resource.public_id.split("/").pop() ||
          "Untitled",
        url: resource.secure_url,
        alt: resource.context?.alt || resource.context?.caption || resource.context?.custom?.alt || null,
        type: `${resource.resource_type}/${resource.format}`,
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        createdAt: resource.created_at,
        updatedAt: resource.updated_at || resource.created_at,
        siteId: siteId!,
      })
    );

    const response: MediaGalleryResponse = {
      media: mediaItems,
      nextPageCursor: results.next_cursor ?? null,
      totalPages: Math.ceil((results.total_count || results.resources?.length || 0) / 24),
      currentPage: 1,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    // Handle Cloudinary specific rate limits
    if (error?.error?.http_code === 420 || error?.error?.http_code === 429) {
      let retryAfterSeconds = 60;
      const rateLimitReset = error.error?.headers?.["x-ratelimit-reset"];
      if (rateLimitReset) {
        const resetTimestamp = Number.parseInt(rateLimitReset, 10) * 1000;
        retryAfterSeconds = Math.max(
          0,
          Math.ceil((resetTimestamp - Date.now()) / 1000)
        );
      }
      return NextResponse.json(
        {
          error: "API rate limit exceeded. Please try again later.",
          details: error.error.message,
          isRateLimit: true,
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Standardized error response for other errors (403, 500 etc.)
    return createErrorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get("public_id");

  if (!publicId) {
    return NextResponse.json(
      { error: "public_id is required" },
      { status: 400 }
    );
  }
  if (!siteId) {
    return NextResponse.json(
      { error: "siteId is required for verification" },
      { status: 400 }
    );
  }

  try {
    await requireSiteAccess(siteId, session.user.id);
  } catch (error) {
    return createErrorResponse(error);
  }

  if (!publicId.startsWith(`${siteId}/`)) {
    return NextResponse.json(
      { error: "Forbidden: Image does not belong to this site." },
      { status: 403 }
    );
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "ok" || result.result === "not found") {
      return NextResponse.json(
        { message: "Image deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to delete image from Cloudinary", details: result },
        { status: 500 }
      );
    }
  } catch (error: any) {
    let retryAfterSeconds: number | undefined;
    let isRateLimitError = false;

    if (error?.error?.http_code === 420 || error?.error?.http_code === 429) {
      isRateLimitError = true;
      const rateLimitReset = error.error?.headers?.["x-ratelimit-reset"];
      if (rateLimitReset) {
        const resetTime = Number.parseInt(rateLimitReset, 10) * 1000;
        retryAfterSeconds = Math.max(
          0,
          Math.ceil((resetTime - Date.now()) / 1000)
        );
      } else {
        retryAfterSeconds = 60;
      }
      return NextResponse.json(
        {
          error: "Cloudinary API rate limit exceeded.",
          details: error.error.message,
          isRateLimit: true,
          retryAfterSeconds,
        },
        { status: error.error.http_code }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete image";
    return NextResponse.json(
      {
        error: "Failed to delete image",
        details: errorMessage,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
