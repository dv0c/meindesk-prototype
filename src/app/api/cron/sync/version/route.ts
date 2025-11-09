import { NextResponse } from "next/server";

// This should be updated on each deployment (manual, CI/CD, or env variable)
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";

export const GET = async (req: Request) => {
  try {
    return NextResponse.json({
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to get version" }, { status: 500 });
  }
};
