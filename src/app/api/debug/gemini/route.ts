import { NextResponse } from "next/server";
import { createErrorResponse, requireAdmin } from "@/lib/security/route-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEBUG_APIS !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await requireAdmin();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API Key" }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}
