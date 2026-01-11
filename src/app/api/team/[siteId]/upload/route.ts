import { requireAuth, requireSiteOwnership, createErrorResponse } from "@/lib/security/route-auth";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;

    // Verify site ownership
    await requireSiteOwnership(siteId, session.user.id);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(fileBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: siteId + "/uploads/",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              return resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}
