import { getAuthSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import type { Media, MediaGalleryResponse } from "@/types/media-gallery";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
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
    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID could not be determined." },
        { status: 500 }
      );
    }

    const options: any = {
      type: "upload",
      prefix: `${siteId}/uploads/`,
      resource_type: "image",
      max_results: 24,
      context: true,
    };
    if (nextCursor) options.next_cursor = nextCursor;

    let expression = `resource_type:image AND folder:${siteId}/*`;
    if (searchQuery) {
      expression += ` AND (filename:${searchQuery}* OR tags:${searchQuery}* OR context.alt:${searchQuery}* OR context.caption:${searchQuery}*)`;
    }
    options.expression = expression;

    const results = await cloudinary.v2.api.resources(options);

    const mediaItems: Media[] = (results.resources || []).map(
      (resource: any) => ({
        id: resource.asset_id,
        public_id: resource.public_id,
        name:
          resource.filename ||
          resource.public_id.split("/").pop() ||
          "Untitled",
        url: resource.secure_url,
        alt: resource.context?.alt || resource.context?.caption || null,
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
      // @ts-ignore
      nextPageCursor: results.next_cursor,
      totalPages: 0,
      currentPage: 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
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

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch media gallery";
    const errorStack = error.stack || "No stack available";
    return NextResponse.json(
      {
        error: "Failed to fetch media gallery",
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { siteId: string } }
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
