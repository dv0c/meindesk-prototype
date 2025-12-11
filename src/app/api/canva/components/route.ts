import { NextResponse } from "next/server";
import type { ComponentDefinition } from "@/lib/types";
import { db } from "@/lib/db";
import { ALL_COMPONENTS } from "@/lib/components-data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const session = await getServerSession(authOptions);

  // Admins see everything; others see only non-hidden components
  const isAdmin = session?.user?.role === "ADMIN";
  const components: ComponentDefinition[] = isAdmin
    ? [...ALL_COMPONENTS]
    : ALL_COMPONENTS.filter(c => !c.hidden);

  if (siteId) {
    try {
      // Fetch installed themes with their blocks
      const installedThemes = await db.siteTheme.findMany({
        where: { siteId },
        include: {
          theme: {
            include: {
              blocks: true,
            },
          },
        },
      });

      // Flatten blocks from all installed themes
      installedThemes.forEach((st) => {
        st.theme.blocks.forEach((block) => {
          // You might want to prevent duplicates or collision
          const dynamicComponent = block.componentDefinition as any as ComponentDefinition;

          // When a component is part of an installed theme, it should be visible
          if (dynamicComponent.hidden) {
            delete dynamicComponent.hidden;
          }

          // Ensure it has a unique name or careful about overriding
          // For now, we assume distinct names or acceptable override
          components.push(dynamicComponent);
        });
      });
    } catch (error) {
      console.error("Error fetching theme blocks:", error)
    }
  }

  return NextResponse.json(components);
}