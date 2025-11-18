import { db } from "@/lib/db";
import { TemplateSchema } from "@/types/TemplateSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;
  const tenant = await db.site.findUnique({
    where: { id: siteId },
    select: { id: true, title: true, template_schema: true },
  });
  if (!tenant)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  return NextResponse.json(tenant);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;
  const body = await req.json();

  const parseResult = TemplateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid schema", details: parseResult.error },
      { status: 400 }
    );
  }

  const updatedTenant = await db.site.update({
    where: { id: siteId },
    data: { template_schema: parseResult.data },
  });

  return NextResponse.json(updatedTenant);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;

  const updatedTenant = await db.site.update({
    where: { id: siteId },
    data: { template_schema: null },
  });

  return NextResponse.json(updatedTenant);
}
