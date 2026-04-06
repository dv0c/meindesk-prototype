import { NextRequest, NextResponse } from "next/server";
import { getPageWithChildrenJson } from "@/lib/server/get-page-with-children";

// ------------------------------------
// GET /pages/:id → fetch page + children
// ------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  const { tenantId, id } = await params;

  try {
    const data = await getPageWithChildrenJson(tenantId, id);

    if (!data) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /pages/:id error:", err);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
