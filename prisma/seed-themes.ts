import { PrismaClient } from "../src/generated/client"

const prisma = new PrismaClient()

async function seedThemes() {
    console.log("🎨 Seeding themes...")

    // 1. Create Core Theme (always available to all sites)
    const coreTheme = await prisma.theme.upsert({
        where: { id: "000000000000000000000001" },
        update: {},
        create: {
            id: "000000000000000000000001",
            name: "Core",
            description: "Essential building blocks for every website. These components are always available.",
            thumbnail: "/themes/core.png",
            price: 0,
            isPremium: false,
            fonts: JSON.stringify([]),
            blocks: {
                create: [
                    {
                        componentName: "Container",
                        componentDefinition: {
                            category: "Layout",
                            description: "A container for grouping elements",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Grid",
                        componentDefinition: {
                            category: "Layout",
                            description: "A responsive grid layout",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Heading",
                        componentDefinition: {
                            category: "Typography",
                            description: "A heading element (h1-h6)",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Text",
                        componentDefinition: {
                            category: "Typography",
                            description: "A paragraph of text",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Button",
                        componentDefinition: {
                            category: "Interactive",
                            description: "A clickable button",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Image",
                        componentDefinition: {
                            category: "Media",
                            description: "An image element",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Divider",
                        componentDefinition: {
                            category: "Layout",
                            description: "A horizontal divider line",
                            isCore: true,
                        }
                    },
                    {
                        componentName: "Spacer",
                        componentDefinition: {
                            category: "Layout",
                            description: "Vertical spacing element",
                            isCore: true,
                        }
                    },
                ]
            }
        },
        include: { blocks: true }
    })

    console.log(`✅ Created Core theme with ${coreTheme.blocks?.length || 0} components`)

    // 2. Create Sophia Platanisioti Theme
    const sophiaTheme = await prisma.theme.upsert({
        where: { id: "000000000000000000000002" },
        update: {},
        create: {
            id: "000000000000000000000002",
            name: "Sophia Platanisioti",
            description: "Elegant therapy & counseling website theme with a calming aesthetic, professional navbar, and clean design.",
            thumbnail: "/themes/sophia-platanisioti.png",
            price: 0,
            isPremium: false,
            fonts: JSON.stringify([
                {
                    family: "Playfair Display",
                    type: "google",
                    weights: ["400", "500", "600", "700"],
                    subsets: ["latin", "greek"],
                }
            ]),
            blocks: {
                create: [
                    {
                        componentName: "Navbar",
                        componentDefinition: {
                            category: "Navigation",
                            description: "Professional navbar with top bar, social links, and banner image",
                            isCore: false,
                        }
                    },
                    {
                        componentName: "NavigationLinks",
                        componentDefinition: {
                            category: "Navigation",
                            description: "Styled navigation links list",
                            isCore: false,
                        }
                    },
                ]
            }
        },
        include: { blocks: true }
    })

    console.log(`✅ Created Sophia Platanisioti theme with ${sophiaTheme.blocks?.length || 0} components`)

    // 3. Auto-install Core theme for all existing sites
    const sites = await prisma.site.findMany({ select: { id: true } })

    for (const site of sites) {
        await prisma.siteTheme.upsert({
            where: {
                siteId_themeId: {
                    siteId: site.id,
                    themeId: coreTheme.id,
                }
            },
            update: {},
            create: {
                siteId: site.id,
                themeId: coreTheme.id,
            }
        })
    }

    console.log(`✅ Installed Core theme for ${sites.length} existing sites`)
    console.log("🎉 Theme seeding complete!")
}

seedThemes()
    .catch((e) => {
        console.error("Error seeding themes:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
