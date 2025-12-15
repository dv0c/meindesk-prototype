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

  // IMPORTANT: Filter out components with themeName from ALL_COMPONENTS
  // Theme components should ONLY come from installed themes in the database
  const baseComponents = ALL_COMPONENTS.filter(c => !c.themeName);

  const components: ComponentDefinition[] = isAdmin
    ? [...baseComponents]
    : baseComponents.filter(c => !c.hidden);

  console.log(`Starting with ${components.length} base components (theme components excluded)`);

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
      console.log(`Found ${installedThemes.length} installed themes for siteId: ${siteId}`);

      installedThemes.forEach((st) => {
        console.log(`Processing theme: ${st.theme.name} with ${st.theme.blocks.length} blocks`);

        st.theme.blocks.forEach((block) => {
          // Create a copy to avoid mutating the original
          const dynamicComponent = { ...(block.componentDefinition as any) } as ComponentDefinition;

          // When a component is part of an installed theme, it should be visible
          if (dynamicComponent.hidden) {
            delete dynamicComponent.hidden;
          }

          // Add theme name to the component (for UI display only - doesn't change component name)
          dynamicComponent.themeName = st.theme.name;

          console.log(`Added themeName "${st.theme.name}" to component: ${dynamicComponent.name}`);

          // ALWAYS add theme components - don't replace base components
          // This allows both the base "Hero" and themed "Hero (Sophia Platanisioti)" to coexist
          components.push(dynamicComponent);
          console.log(`✓ Component "${dynamicComponent.name}" added with theme "${st.theme.name}"`);
        });
      });
    } catch (error) {
      console.error("Error fetching theme blocks:", error)
    }
  }

  return NextResponse.json(components);
}