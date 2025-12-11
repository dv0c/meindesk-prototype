import { NextResponse } from "next/server";
import type { ComponentDefinition } from "@/lib/types";
import { db } from "@/lib/db";
import { ALL_COMPONENTS } from "@/lib/components-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const components: ComponentDefinition[] = [...ALL_COMPONENTS];

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