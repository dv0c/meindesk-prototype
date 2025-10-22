// app/api/team/[siteId]/route.ts
import { getAuthSession } from "@/lib/auth"; // your auth helper
import { db } from "@/lib/db"; // Prisma client
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = await params;
  console.log(siteId);
  try {
    // 1. Get logged in user
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the site
    const site = await db.site.findUnique({
      where: { id: siteId },
      include: {
        User: true, // optional: to return owner info
        subscription: true,
        features: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 3. Check if user owns it
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 4. Return site as the team
    return NextResponse.json({ site });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong " + siteId },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;

  try {
    // 1. Get logged in user
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the site
    const site = await db.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 3. Check if user owns it
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 4. Delete the site and any related records if necessary
    // Also triple-check if user owns the site
    await db.site.delete({
      where: { id: siteId, userId: session.user.id },
    });

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;

  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, link } = body;

    // 1. Find the site
    const site = await db.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 2. Check ownership
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 3. Update the site
    const updatedSite = await db.site.update({
      where: { id: siteId },
      data: {
        title: title ?? site.title,
        description: description ?? site.description,
        url: link ?? site.url,
      },
    });

    // 4. Revalidate cache for this team/site
    try {
      revalidateTag(`team-${siteId}`); // assuming you used this tag in unstable_cache
      revalidateTag("active-team"); // optional global tag if needed
    } catch (e) {
      console.warn("Revalidation failed:", e);
    }

    return NextResponse.json({ site: updatedSite });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}
