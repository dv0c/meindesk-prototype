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
  title: string;
  description: string;
  favicon?: string;
  globalCss?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    backgroundColor: string;
    textColor: string;
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
