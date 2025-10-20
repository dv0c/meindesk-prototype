import { getActiveTeam } from "@/lib/actions/helpers/team";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const { siteId } = await params;
  const site = await getActiveTeam(siteId);
  
  if (!site?.id)
    return NextResponse.json({ error: "No site found" }, { status: 404 });

  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(fileBuffer);

  const result = await new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: site.id + "/uploads/",
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
}
