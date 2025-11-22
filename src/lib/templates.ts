import type { LayoutNode } from "./types"
import { v4 as uuidv4 } from "uuid"

// Helper to generate unique IDs for template nodes
function randomizeIds(nodes: LayoutNode[]): LayoutNode[] {
  return nodes.map((node) => ({
    ...node,
    id: uuidv4(),
    children: node.children ? randomizeIds(node.children) : undefined,
  }))
}

export const LANDING_PAGE_TEMPLATE: LayoutNode[] = [
  {
    id: "hero",
    type: "Hero",
    props: {
      title: "Build Faster with V0",
      subtitle: "The ultimate page builder for modern web applications",
      description: "Create stunning websites in minutes with our intuitive drag-and-drop editor.",
      primaryButtonText: "Start Building",
      secondaryButtonText: "View Demo",
      textAlign: "center",
    },
  },
  {
    id: "features",
    type: "Features",
    props: {
      title: "Why Choose Us?",
      subtitle: "We provide everything you need to succeed",
      columns: 3,
    },
  },
  {
    id: "cta",
    type: "CallToAction",
    props: {
      title: "Ready to Launch?",
      description: "Join thousands of developers building with our platform today.",
      buttonText: "Get Started Now",
      backgroundColor: "bg-primary",
    },
  },
  {
    id: "footer",
    type: "Footer",
    props: {
      companyName: "V0 Builder",
      links: "About, Features, Pricing, Contact",
    },
  },
]

export const ABOUT_PAGE_TEMPLATE: LayoutNode[] = [
  {
    id: "hero",
    type: "Hero",
    props: {
      title: "About Us",
      subtitle: "Our Mission & Vision",
      description: "We are a team of passionate developers building tools for the future of the web.",
      primaryButtonText: "Contact Us",
      secondaryButtonText: "Our Team",
      textAlign: "center",
    },
  },
  {
    id: "content",
    type: "Container",
    props: {
      className: "max-w-4xl mx-auto py-16 px-4",
    },
    children: [
      {
        id: "heading1",
        type: "Heading",
        props: {
          text: "Our Story",
          level: "h2",
          align: "center",
        },
      },
      {
        id: "text1",
        type: "Text",
        props: {
          content:
            "Founded in 2024, we set out to make web development accessible to everyone. Our platform empowers creators to build professional websites without writing code.",
          align: "center",
          size: "lg",
        },
      },
      {
        id: "spacer1",
        type: "Spacer",
        props: { height: 40 },
      },
      {
        id: "image1",
        type: "Image",
        props: {
          src: "/placeholder.svg?height=400&width=800",
          alt: "Team photo",
          rounded: true,
        },
      },
    ],
  },
  {
    id: "footer",
    type: "Footer",
    props: {
      companyName: "V0 Builder",
      links: "Privacy, Terms",
    },
  },
]

export const TEMPLATES = [
  {
    id: "landing-page",
    name: "Landing Page",
    description: "A high-converting landing page with hero, features, and CTA.",
    layout: LANDING_PAGE_TEMPLATE,
  },
  {
    id: "about-page",
    name: "About Page",
    description: "A classic about us page with team section and story.",
    layout: ABOUT_PAGE_TEMPLATE,
  },
]

export function getTemplate(id: string): LayoutNode[] {
  const template = TEMPLATES.find((t) => t.id === id)
  return template ? randomizeIds(template.layout) : []
}
