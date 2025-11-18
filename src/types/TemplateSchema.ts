import { z } from "zod"

export const TemplateSchema = z.object({
  version: z.string(),
  template: z.string().default("simple"),
  global: z.object({
    container: z.string(),
    radius: z.string(),
    spacing: z.object({
      sectionY: z.number(),
      sectionX: z.number(),
    }),
    font: z.object({
      primary: z.string(),
      secondary: z.string(),
      mono: z.string(),
    }),
    typography: z.object({
      h1: z.object({
        size: z.string(),
        weight: z.number(),
        tracking: z.string(),
      }),
      body: z.object({
        size: z.string(),
        lineHeight: z.string(),
      }),
    }),
    layout: z.object({
      boxed: z.boolean(),
      maxWidth: z.number(),
      gridGap: z.number(),
      showGridLines: z.boolean(),
    }),
  }),
  theme: z.object({
    mode: z.string(),
    colorMode: z.string(),
    palette: z.object({
      light: z.record(z.string(), z.string()),
      dark: z.record(z.string(), z.string()),
    }),
    effects: z.object({
      blur: z.number(),
      shadows: z.record(z.string(), z.string()),
      transitions: z.object({
        duration: z.number(),
        timing: z.string(),
      }),
    }),
  }),
  header: z.object({
    sticky: z.boolean(),
    transparent: z.boolean(),
    height: z.number(),
    logo: z.object({
      url: z.string(),
      height: z.number(),
      alignment: z.string(),
    }),
    navbar: z.object({
      alignment: z.string(),
      style: z.string(),
      order: z.array(z.string()),
      hidden: z.array(z.string()),
      dropdowns: z.array(
        z.object({
          label: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              href: z.string(),
            })
          ),
        })
      ),
      cta: z.object({
        label: z.string(),
        href: z.string(),
        variant: z.string(),
      }),
      icons: z.object({
        showSearch: z.boolean(),
        showCart: z.boolean(),
        showThemeToggle: z.boolean(),
        showUserMenu: z.boolean(),
      }),
    }),
    announcementBar: z.object({
      enabled: z.boolean(),
      text: z.string(),
      link: z.string(),
      background: z.string(),
      color: z.string(),
    }),
  }),
  hero: z.object({
    enabled: z.boolean(),
    variant: z.string(),
    title: z.string(),
    subtitle: z.string(),
    image: z.string().nullable(),
    video: z.string().nullable(),
    cta: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
        variant: z.string(),
      })
    ),
    alignment: z.string(),
    background: z.object({
      type: z.string(),
      colors: z.array(z.string()),
    }),
  }),
  sections: z.array(
    z.object({
      type: z.string(),
      enabled: z.boolean(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      layout: z.string().optional(),
      columns: z.number().optional(),
      iconStyle: z.string().optional(),
      items: z.array(z.any()).optional(),
      members: z.array(z.any()).optional(),
      plans: z.array(z.any()).optional(),
    })
  ),
  blog: z.object({
    enabled: z.boolean(),
    layout: z.string(),
    showAuthor: z.boolean(),
    showDate: z.boolean(),
    excerptLength: z.number(),
    sidebar: z.object({
      enabled: z.boolean(),
      widgets: z.array(z.string()),
    }),
  }),
  shop: z.object({
    enabled: z.boolean(),
    currency: z.string(),
    showStock: z.boolean(),
    layout: z.string(),
    filters: z.array(z.string()),
  }),
  footer: z.object({
    layout: z.string(),
    background: z.string(),
    foreground: z.string(),
    columns: z.array(
      z.object({
        title: z.string(),
        links: z.array(
          z.object({
            label: z.string(),
            href: z.string(),
          })
        ),
      })
    ),
    social: z.record(z.string(), z.string()),
    newsletter: z.object({
      enabled: z.boolean(),
      title: z.string(),
      placeholder: z.string(),
      buttonLabel: z.string(),
      provider: z.string(),
    }),
    copyright: z.string(),
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()),
    openGraph: z.object({
      image: z.string(),
      type: z.string(),
    }),
    twitter: z.object({
      handle: z.string(),
      cardType: z.string(),
    }),
    jsonLd: z.object({
      "@context": z.string(),
      "@type": z.string(),
      name: z.string(),
      url: z.string(),
    }),
  }),
  integrations: z.object({
    googleAnalytics: z.object({ id: z.string() }),
    plausible: z.object({ domain: z.string() }),
    facebookPixel: z.object({ id: z.string() }),
    stripe: z.object({
      enabled: z.boolean(),
      products: z.array(z.string()),
    }),
    mailchimp: z.object({
      enabled: z.boolean(),
      audienceId: z.string(),
    }),
    chat: z.object({
      enabled: z.boolean(),
      provider: z.string(),
      id: z.string(),
    }),
  }),
  performance: z.object({
    lazyLoadImages: z.boolean(),
    prefetchLinks: z.boolean(),
    optimizeFonts: z.boolean(),
    cacheTTL: z.number(),
  }),
  features: z.object({
    darkMode: z.boolean(),
    animations: z.boolean(),
    parallax: z.boolean(),
    backToTop: z.boolean(),
    cookieConsent: z.boolean(),
    autoPlayVideos: z.boolean(),
  }),
})

export type TemplateSchema = z.infer<typeof TemplateSchema>
