import { requireAuth, requireSiteAccess, createErrorResponse } from "@/lib/security/route-auth";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireSiteAccess(siteId, userId);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const replacePublicId = formData.get("replacePublicId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    if (replacePublicId && !replacePublicId.startsWith(`${siteId}/`)) {
      return NextResponse.json(
        { error: "Forbidden: Image does not belong to this site." },
        { status: 403 },
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(fileBuffer);

    const uploadOptions: Record<string, unknown> = replacePublicId
      ? {
          public_id: replacePublicId,
          overwrite: true,
          invalidate: true,
          resource_type: "image",
        }
      : {
          folder: `${siteId}/uploads/`,
          tags: ["gallery_image", siteId, "user_upload"],
        };

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width?: number;
      height?: number;
      bytes?: number;
    }>((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(uploadOptions, (error, uploadResult) => {
          if (error) {
            reject(error);
          } else if (!uploadResult) {
            reject(new Error("Upload returned no result"));
          } else {
            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              width: uploadResult.width,
              height: uploadResult.height,
              bytes: uploadResult.bytes,
            });
          }
        })
        .end(buffer);
    });

    return NextResponse.json(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}
