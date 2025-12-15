// Core types for the page builder system
export interface LayoutNode {
  id: string;
  type: string; // component name
  props: Record<string, any>;
  children?: LayoutNode[];
  className?: string;
  style?: Record<string, string>;
  customCss?: string;
  attributes?: Record<string, string>;
  script?: string;
  themeName?: string; // Theme this component belongs to (for themed components)
}

export interface WebsiteSettings {
  // Basic Information
  title: string;
  description: string;
  favicon?: string;
  globalCss?: string;

  // Theme Settings
  theme: {
    mode?: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    backgroundColor: string;
    textColor: string;
  };

  // SEO Settings
  seo?: {
    // Meta Tags
    metaTitle?: string; // Custom title for search engines (falls back to title)
    metaDescription?: string; // Custom description for search engines (falls back to description)
    keywords?: string; // Comma-separated keywords
    author?: string; // Author metadata
    robots?: string; // Robots meta tag (e.g., "index, follow")
    canonical?: string; // Canonical URL

    // Open Graph
    ogTitle?: string; // Open Graph title
    ogDescription?: string; // Open Graph description
    ogImage?: string; // Open Graph image URL
    ogType?: string; // Open Graph type (website, article, etc.)

    // Twitter Card
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string; // Twitter site handle (@username)
    twitterCreator?: string; // Twitter creator handle (@username)
  };
}

export interface PageData {
  id: string;
  name: string;
  tenantId: string;
  layout: LayoutNode[];
  settings?: WebsiteSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentDefinition {
  name: string;
  category: string;
  props: PropDefinition[];
  allowChildren?: boolean;
  hidden?: boolean;
  themeName?: string; // Name of the theme this component belongs to
}

export interface PropDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "color" | "url" | "json" | "media" | "image" | "spacing" | "dimensions" | "textarea";
  label: string;
  schema?: any;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}
