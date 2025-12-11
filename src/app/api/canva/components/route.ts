import { NextResponse } from "next/server";
import type { ComponentDefinition } from "@/lib/types";

export async function GET() {
  const components: ComponentDefinition[] = [
    // Layout Components
    {
      name: "Container",
      category: "layout",
      allowChildren: true,
      props: [
        {
          name: "className",
          type: "string",
          label: "CSS Classes",
          defaultValue: "p-4",
        },
      ],
    },
    {
      name: "Grid",
      category: "layout",
      allowChildren: true,
      props: [
        { name: "columns", type: "number", label: "Columns", defaultValue: 2 },
        { name: "gap", type: "number", label: "Gap (0-16)", defaultValue: 4 },
        { name: "rows", type: "number", label: "Rows (0-16)", defaultValue: 2 },
        {
          name: "padding",
          type: "number",
          label: "Padding (0-16)",
          defaultValue: 4,
        },
        {
          name: "className",
          type: "string",
          label: "CSS Classes",
          defaultValue: "",
        },
      ],
    },
    // {
    //   name: "HtmlContainer",
    //   category: "layout",
    //   allowChildren: true,
    //   props: [
    //     { name: "tag", type: "string", label: "HTML Tag", defaultValue: "div" },
    //     {
    //       name: "className",
    //       type: "string",
    //       label: "CSS Classes",
    //       defaultValue: "",
    //     },
    //     {
    //       name: "styles",
    //       type: "string",
    //       label: "Custom Styles (CSS)",
    //       defaultValue: "",
    //     },
    //   ],
    // },
    {
      name: "Hero",
      category: "layout",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Welcome to Our Platform",
        },
        {
          name: "subtitle",
          type: "string",
          label: "Subtitle",
          defaultValue: "Build Something Amazing",
        },
        {
          name: "description",
          type: "string",
          label: "Description",
          defaultValue:
            "Create beautiful websites with our powerful page builder.",
        },
        {
          name: "primaryButtonText",
          type: "string",
          label: "Primary Button",
          defaultValue: "Get Started",
        },
        {
          name: "secondaryButtonText",
          type: "string",
          label: "Secondary Button",
          defaultValue: "Learn More",
        },
        {
          name: "backgroundImage",
          type: "string",
          label: "Background Image URL",
          defaultValue: "",
        },
        {
          name: "textAlign",
          type: "select",
          label: "Text Align",
          defaultValue: "center",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      ],
    },
    {
      name: "Features",
      category: "layout",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Amazing Features",
        },
        {
          name: "subtitle",
          type: "string",
          label: "Subtitle",
          defaultValue: "Everything you need to succeed",
        },
        { name: "columns", type: "number", label: "Columns", defaultValue: 3 },
      ],
    },
    {
      name: "CallToAction",
      category: "layout",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Ready to Get Started?",
        },
        {
          name: "description",
          type: "string",
          label: "Description",
          defaultValue:
            "Join thousands of users who are already building amazing things.",
        },
        {
          name: "buttonText",
          type: "string",
          label: "Button Text",
          defaultValue: "Start Free Trial",
        },
        {
          name: "backgroundColor",
          type: "string",
          label: "Background Class",
          defaultValue: "bg-primary",
        },
      ],
    },
    {
      name: "Footer",
      category: "layout",
      allowChildren: false,
      props: [
        {
          name: "companyName",
          type: "string",
          label: "Company Name",
          defaultValue: "Your Company",
        },
        {
          name: "year",
          type: "string",
          label: "Year",
          defaultValue: new Date().getFullYear().toString(),
        },
        {
          name: "links",
          type: "string",
          label: "Links (comma-separated)",
          defaultValue: "Privacy, Terms, Contact",
        },
      ],
    },

    // Basic Components
    {
      name: "Heading",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "text",
          type: "string",
          label: "Text",
          defaultValue: "Heading",
        },
        {
          name: "level",
          type: "select",
          label: "Level",
          defaultValue: "h2",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "H5", value: "h5" },
            { label: "H6", value: "h6" },
          ],
        },
        {
          name: "align",
          type: "select",
          label: "Align",
          defaultValue: "left",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        { name: "color", type: "string", label: "Color", defaultValue: "" },
      ],
    },
    {
      name: "Text",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "content",
          type: "string",
          label: "Content",
          defaultValue: "Add your text here...",
        },
        {
          name: "align",
          type: "select",
          label: "Align",
          defaultValue: "left",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
            { label: "Justify", value: "justify" },
          ],
        },
        { name: "color", type: "string", label: "Color", defaultValue: "" },
        {
          name: "size",
          type: "select",
          label: "Size",
          defaultValue: "base",
          options: [
            { label: "Small", value: "sm" },
            { label: "Base", value: "base" },
            { label: "Large", value: "lg" },
            { label: "XL", value: "xl" },
          ],
        },
      ],
    },
    {
      name: "Button",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "text",
          type: "string",
          label: "Button Text",
          defaultValue: "Click me",
        },
        {
          name: "variant",
          type: "select",
          label: "Variant",
          defaultValue: "default",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Destructive", value: "destructive" },
          ],
        },
        {
          name: "href",
          type: "string",
          label: "Link URL",
          defaultValue: "#",
        },
      ],
    },
    {
      name: "Image",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "src",
          type: "image",
          label: "Image URL",
          defaultValue: "/placeholder.svg?height=400&width=600",
        },
        {
          name: "alt",
          type: "string",
          label: "Alt Text",
          defaultValue: "Image",
        },
        { name: "width", type: "string", label: "Width", defaultValue: "100%" },
        {
          name: "height",
          type: "string",
          label: "Height",
          defaultValue: "auto",
        },
        {
          name: "rounded",
          type: "boolean",
          label: "Rounded",
          defaultValue: false,
        },
      ],
    },
    {
      name: "Spacer",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "height",
          type: "number",
          label: "Height (px)",
          defaultValue: 40,
        },
      ],
    },
    {
      name: "Divider",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "spacing",
          type: "number",
          label: "Spacing (px)",
          defaultValue: 20,
        },
      ],
    },

    // Content Components
    {
      name: "Testimonial",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "quote",
          type: "string",
          label: "Quote",
          defaultValue:
            "This product has completely transformed how we work. Highly recommended!",
        },
        {
          name: "author",
          type: "string",
          label: "Author",
          defaultValue: "John Doe",
        },
        {
          name: "role",
          type: "string",
          label: "Role",
          defaultValue: "CEO, Company Inc.",
        },
        {
          name: "avatarUrl",
          type: "string",
          label: "Avatar URL",
          defaultValue: "",
        },
      ],
    },
    {
      name: "Pricing",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Plan Title",
          defaultValue: "Pro Plan",
        },
        { name: "price", type: "string", label: "Price", defaultValue: "$29" },
        {
          name: "period",
          type: "string",
          label: "Period",
          defaultValue: "per month",
        },
        {
          name: "description",
          type: "string",
          label: "Description",
          defaultValue: "Perfect for growing businesses",
        },
        {
          name: "buttonText",
          type: "string",
          label: "Button Text",
          defaultValue: "Get Started",
        },
      ],
    },
    {
      name: "Newsletter",
      category: "conversion",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Subscribe to our Newsletter",
        },
        {
          name: "description",
          type: "string",
          label: "Description",
          defaultValue: "Get the latest updates delivered to your inbox.",
        },
        {
          name: "placeholder",
          type: "string",
          label: "Placeholder",
          defaultValue: "Enter your email",
        },
        {
          name: "buttonText",
          type: "string",
          label: "Button Text",
          defaultValue: "Subscribe",
        },
      ],
    },
    {
      name: "ContactForm",
      category: "conversion",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Contact Us",
        },
        {
          name: "submitText",
          type: "string",
          label: "Submit Button Text",
          defaultValue: "Send Message",
        },
      ],
    },
    {
      name: "TeamMember",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "name",
          type: "string",
          label: "Name",
          defaultValue: "John Doe",
        },
        {
          name: "role",
          type: "string",
          label: "Role",
          defaultValue: "Co-founder & CEO",
        },
        {
          name: "bio",
          type: "string",
          label: "Bio",
          defaultValue: "Passionate about building great products",
        },
        {
          name: "image",
          type: "string",
          label: "Image URL",
          defaultValue: "/placeholder.svg?height=400&width=400",
        },
      ],
    },
    {
      name: "Stats",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "stats",
          type: "json",
          label: "Stats",
          schema: [
            { key: "label", label: "Label", type: "string" },
            { key: "value", label: "Value", type: "string" },
          ],
          defaultValue: [
            { label: "Happy Customers", value: "10K+" },
            { label: "Projects Completed", value: "500+" },
          ],
        },
      ],
    },
    {
      name: "Tabs",
      category: "content",
      allowChildren: true,
      props: [
        {
          name: "tabs",
          type: "json",
          label: "Tabs",
          schema: [{ key: "label", label: "Label", type: "string" }],
          defaultValue: [
            { label: "Tab 1" },
            { label: "Tab 2" },
            { label: "Tab 3" },
          ],
        },
      ],
    },
    {
      name: "Articles",
      category: "Articles",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Section Title",
          defaultValue: "Latest Articles",
        },
        {
          name: "thumbnail",
          type: "boolean",
          label: "Thumbnail",
          defaultValue: false,
        },
        {
          name: "limit",
          type: "number",
          label: "Articles limit",
          defaultValue: 10,
        },
        {
          name: "style",
          type: "select",
          label: "Layout Style",
          defaultValue: "magazine",
          options: [
            { label: "Magazine", value: "magazine" },
            { label: "Boxed", value: "boxed" },
            { label: "Simple", value: "simple" },
            { label: "Minimal", value: "minimal" },
          ],
        },
      ],
    },

    // Media Components
    {
      name: "ImageGrid",
      category: "media",
      allowChildren: false,
      props: [
        {
          name: "images",
          type: "json",
          label: "Images",
          schema: [
            { key: "src", label: "Image", type: "image" }
          ],
          defaultValue: [
            { src: "/placeholder.svg?height=400&width=400" },
            { src: "/placeholder.svg?height=400&width=400" },
            { src: "/placeholder.svg?height=400&width=400" },
          ],
        },
        {
          name: "columns",
          type: "number",
          label: "Columns",
          defaultValue: 3,
        },
        {
          name: "gap",
          type: "number",
          label: "Gap",
          defaultValue: 4,
        },
        {
          name: "aspectRatio",
          type: "select",
          label: "Aspect Ratio",
          defaultValue: "square",
          options: [
            { label: "Square", value: "square" },
            { label: "Video (16:9)", value: "video" },
            { label: "Portrait (3:4)", value: "portrait" },
            { label: "Auto", value: "auto" },
          ]
        }
      ],
    },
    {
      name: "Slideshow",
      category: "media",
      allowChildren: true, // Enable children for component-based slides
      props: [
        {
          name: "autoplay",
          type: "boolean",
          label: "Autoplay",
          defaultValue: true,
        },
        {
          name: "interval",
          type: "number",
          label: "Interval (ms)",
          defaultValue: 3000,
        },
        {
          name: "currIndex",
          type: "number",
          label: "Current Index",
          defaultValue: 0,
        },
      ],
    },
    {
      name: "Navbar",
      category: "navigation",
      allowChildren: false,
      props: [
        {
          name: "logo",
          type: "image",
          label: "Logo Image",
          defaultValue: "",
        },
        {
          name: "logoSize",
          type: "dimensions",
          label: "Size",
          defaultValue: "auto",
        },
        {
          name: "logoMargin",
          type: "spacing",
          label: "Margin",
          defaultValue: "0px",
        },
        {
          name: "logoPadding",
          type: "spacing",
          label: "Padding",
          defaultValue: "0px",
        },
        {
          name: "logoObjectFit",
          type: "select",
          label: "Logo Fit",
          defaultValue: "contain",
          options: [
            { label: "Contain", value: "contain" },
            { label: "Cover", value: "cover" },
            { label: "Fill", value: "fill" },
            { label: "None", value: "none" },
            { label: "Scale Down", value: "scale-down" },
          ],
        },
        {
          name: "logoAlignment",
          type: "select",
          label: "Logo Position",
          defaultValue: "left",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "logoText",
          type: "string",
          label: "Logo Text",
          defaultValue: "Sophia Platanisioti",
        },
        {
          name: "backgroundColor",
          type: "color",
          label: "Background Color",
        },
        {
          name: "textColor",
          type: "color",
          label: "Text Color",
        },
        {
          name: "sticky",
          type: "boolean",
          label: "Sticky Header",
          defaultValue: true,
        },
        {
          name: "accentColor",
          type: "color",
          label: "Accent Color",
          defaultValue: "#3b82f6",
        },
        {
          name: "style",
          type: "select",
          label: "Navigation Style",
          defaultValue: "split",
          options: [
            { label: "Split Layout", value: "split" },
            { label: "Centered", value: "centered" },
            { label: "Glassmorphism", value: "glassmorphism" },
            { label: "Floating", value: "floating" },
            { label: "Underline Active", value: "underline" },
            { label: "Sidebar", value: "sidebar" },
          ],
        },
        {
          name: "links",
          type: "json",
          label: "Navigation Links",
          schema: [
            { key: "label", label: "Label", type: "string" },
            { key: "href", label: "URL", type: "string" },
            {
              key: "submenu",
              label: "Submenu",
              type: "json",
              // Keep it editable as plain JSON to bypass your builder’s depth limit
              schema: [
                { key: "label", label: "Label", type: "string" },
                { key: "href", label: "URL", type: "string" },
              ],
            },
          ],
          defaultValue: [
            { label: "ΑΡΧΙΚΗ", href: "/" },
            { label: "ΥΠΗΡΕΣΙΕΣ", href: "/services" },
            { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/bio" },
            {
              label: "ΑΡΘΡΑ",
              href: "/articles",
              submenu: [
                {
                  label: "Παιδιά και Έφηβοι",
                  href: "/articles/paidia-kai-efivoi",
                },
                { label: "Όλα τα Άρθρα", href: "/articles" },
              ],
            },
            { label: "ΟΜΑΔΕΣ", href: "/groups" },
            { label: "ΕΚΔΗΛΩΣΕΙΣ", href: "/events" },
            { label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact" },
          ],
        },
      ],
    },
    {
      name: "Navbar2",
      category: "navigation",
      allowChildren: false,
      props: [
        {
          name: "logoText",
          type: "string",
          label: "Logo Text",
          defaultValue: "Sophia Platanisioti",
        },
        {
          name: "align",
          type: "select",
          label: "Menu Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
          defaultValue: "right",
        },
        {
          name: "sticky",
          type: "boolean",
          label: "Sticky Header",
          defaultValue: true,
        },
        {
          name: "darkMode",
          type: "boolean",
          label: "Dark Mode",
          defaultValue: false,
        },
        {
          name: "links",
          type: "json",
          label: "Navigation Links",
          schema: [
            { key: "label", label: "Label", type: "string" },
            { key: "href", label: "URL", type: "string" },
            {
              key: "submenu",
              label: "Submenu",
              type: "json",
              // Keep it editable as plain JSON to bypass your builder’s depth limit
              schema: [
                { key: "label", label: "Label", type: "string" },
                { key: "href", label: "URL", type: "string" },
              ],
            },
          ],
          defaultValue: [
            { label: "ΑΡΧΙΚΗ", href: "/" },
            { label: "ΥΠΗΡΕΣΙΕΣ", href: "/services" },
            { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/bio" },
            {
              label: "ΑΡΘΡΑ",
              href: "/articles",
              submenu: [
                {
                  label: "Παιδιά και Έφηβοι",
                  href: "/articles/paidia-kai-efivoi",
                },
                { label: "Όλα τα Άρθρα", href: "/articles" },
              ],
            },
            { label: "ΟΜΑΔΕΣ", href: "/groups" },
            { label: "ΕΚΔΗΛΩΣΕΙΣ", href: "/events" },
            { label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact" },
          ],
        },
      ],
    },
    {
      name: "SingleArticle",
      category: "Templates",
      allowChildren: true,
      props: [
        {
          name: "showCover",
          type: "boolean",
          label: "Show Cover Image",
          defaultValue: true,
        },
        {
          name: "coverHeight",
          type: "string",
          label: "Cover Height",
          defaultValue: "400px",
        },
        {
          name: "backgroundColor",
          type: "color",
          label: "Background Color",
        },
        {
          name: "titleTag",
          type: "select",
          label: "Title Tag",
          defaultValue: "h1",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
        {
          name: "showExcerpt",
          type: "boolean",
          label: "Show Excerpt",
          defaultValue: true,
        },
        {
          name: "showCategories",
          type: "boolean",
          label: "Show Categories",
          defaultValue: true,
        },
        {
          name: "showMetadata",
          type: "boolean",
          label: "Show Metadata",
          defaultValue: true,
        },
        {
          name: "style",
          type: "select",
          label: "Layout Style",
          defaultValue: "default",
          options: [
            { label: "Default", value: "default" },
            { label: "Magazine", value: "magazine" },
            { label: "Minimal", value: "minimal" },
            { label: "Card", value: "card" },
            { label: "News", value: "news" },
          ],
        },
        {
          name: "width",
          type: "dimensions",
          label: "Width / Height",
          defaultValue: "100%",
        },
        {
          name: "margin",
          type: "spacing",
          label: "Margin",
          defaultValue: "0px",
        },
        {
          name: "padding",
          type: "spacing", // Changed from string to spacing for granular control
          label: "Padding",
          defaultValue: "0px",
        },
        {
          name: "textColor",
          type: "color",
          label: "Text Color",
        },
        {
          name: "titleColor",
          type: "color",
          label: "Title Color",
        },
        {
          name: "accentColor",
          type: "color",
          label: "Accent Color",
        },
        {
          name: "dateColor",
          type: "color",
          label: "Date Color",
        },
        {
          name: "showDate",
          type: "boolean",
          label: "Show Date",
          defaultValue: true,
        },
        {
          name: "showAuthor",
          type: "boolean",
          label: "Show Author",
          defaultValue: true,
        },
        {
          name: "align",
          type: "select",
          label: "Content Alignment",
          defaultValue: "left",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "childrenPosition",
          type: "select",
          label: "Extra Content Position",
          defaultValue: "bottom",
          options: [
            { label: "Bottom", value: "bottom" },
            { label: "Right Sidebar", value: "sidebar" },
          ],
        },
      ],
    },
    {
      name: "MostPopular",
      category: "Articles",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Section Title",
          defaultValue: "MOST POPULAR",
        },
        {
          name: "limit",
          type: "number",
          label: "Number of Articles",
          defaultValue: 5,
        },
        {
          name: "style",
          type: "select",
          label: "Layout Styles",
          defaultValue: "gradient",
          options: [
            { label: "Compact", value: "compact" },
            { label: "Gradient", value: "gradient" },
            { label: "Numbered", value: "numbered" },
            { label: "Classic", value: "classic" },
          ],
        },
      ],
    },
    {
      name: "ThemeSwitcher",
      category: "advanced",
      allowChildren: false,
      props: [
        {
          name: "variant",
          type: "select",
          label: "Style",
          defaultValue: "button",
          options: [
            { label: "Button", value: "button" },
            { label: "Toggle", value: "toggle" },
            { label: "Icon Only", value: "icon" },
          ],
        },
        {
          name: "size",
          type: "select",
          label: "Size",
          defaultValue: "md",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        {
          name: "showLabel",
          type: "boolean",
          label: "Show Labels",
          defaultValue: true,
        },
        {
          name: "lightLabel",
          type: "string",
          label: "Light Mode Label",
          defaultValue: "Light",
        },
        {
          name: "darkLabel",
          type: "string",
          label: "Dark Mode Label",
          defaultValue: "Dark",
        },
        {
          name: "position",
          type: "select",
          label: "Position",
          defaultValue: "inline",
          options: [
            { label: "Inline", value: "inline" },
            { label: "Fixed Top Right", value: "fixed-top-right" },
            { label: "Fixed Bottom Right", value: "fixed-bottom-right" },
          ],
        },
      ],
    },
    {
      name: "NavbarContainer",
      category: "navbar-blocks",
      allowChildren: true,
      props: [
        {
          name: "backgroundColor",
          type: "color",
          label: "Background Color",
          defaultValue: "#ffffff",
        },
        {
          name: "textColor",
          type: "color",
          label: "Text Color",
          defaultValue: "#000000",
        },
        {
          name: "sticky",
          type: "boolean",
          label: "Sticky Header",
          defaultValue: true,
        },
        {
          name: "height",
          type: "dimensions",
          label: "Height",
          defaultValue: "auto",
        },
        {
          name: "padding",
          type: "spacing",
          label: "Padding",
          defaultValue: "16px 24px",
        },
        {
          name: "shadow",
          type: "boolean",
          label: "Shadow",
          defaultValue: true,
        },
        {
          name: "borderBottom",
          type: "boolean",
          label: "Bottom Border",
          defaultValue: true,
        },
        {
          name: "borderColor",
          type: "color",
          label: "Border Color",
          defaultValue: "#e5e7eb",
        },
        {
          name: "maxWidth",
          type: "select",
          label: "Max Width",
          defaultValue: "container",
          options: [
            { label: "Full Width", value: "full" },
            { label: "Container", value: "container" },
            { label: "Narrow", value: "narrow" },
          ],
        },
      ],
    },
    {
      name: "LogoBlock",
      category: "navbar-blocks",
      allowChildren: false,
      props: [
        {
          name: "logoImage",
          type: "image",
          label: "Logo Image",
          defaultValue: "",
        },
        {
          name: "logoText",
          type: "string",
          label: "Logo Text",
          defaultValue: "Brand",
        },
        {
          name: "logoSize",
          type: "select",
          label: "Size",
          defaultValue: "md",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        {
          name: "href",
          type: "string",
          label: "Link URL",
          defaultValue: "/",
        },
        {
          name: "align",
          type: "select",
          label: "Alignment",
          defaultValue: "left",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "marginLeft",
          type: "spacing",
          label: "Margin Left",
          defaultValue: "0px",
        },
        {
          name: "marginRight",
          type: "spacing",
          label: "Margin Right",
          defaultValue: "auto",
        },
      ],
    },
    {
      name: "NavigationBlock",
      category: "navbar-blocks",
      allowChildren: false,
      props: [
        {
          name: "links",
          type: "json",
          label: "Navigation Links",
          schema: [
            { key: "label", label: "Label", type: "string" },
            { key: "href", label: "URL", type: "string" },
          ],
          defaultValue: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
        },
        {
          name: "orientation",
          type: "select",
          label: "Orientation",
          defaultValue: "horizontal",
          options: [
            { label: "Horizontal", value: "horizontal" },
            { label: "Vertical", value: "vertical" },
          ],
        },
        {
          name: "spacing",
          type: "select",
          label: "Spacing",
          defaultValue: "md",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        {
          name: "hoverStyle",
          type: "select",
          label: "Hover Style",
          defaultValue: "underline",
          options: [
            { label: "Underline", value: "underline" },
            { label: "Background", value: "background" },
            { label: "Color Change", value: "color" },
          ],
        },
        {
          name: "fontSize",
          type: "select",
          label: "Font Size",
          defaultValue: "base",
          options: [
            { label: "Small", value: "sm" },
            { label: "Base", value: "base" },
            { label: "Large", value: "lg" },
          ],
        },
        {
          name: "fontWeight",
          type: "select",
          label: "Font Weight",
          defaultValue: "medium",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Medium", value: "medium" },
            { label: "Semibold", value: "semibold" },
            { label: "Bold", value: "bold" },
          ],
        },
        {
          name: "textColor",
          type: "color",
          label: "Text Color",
        },
        {
          name: "hoverColor",
          type: "color",
          label: "Hover Color",
        },
        {
          name: "align",
          type: "select",
          label: "Alignment",
          defaultValue: "center",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      ],
    },
    {
      name: "ActionButtonBlock",
      category: "navbar-blocks",
      allowChildren: false,
      props: [
        {
          name: "text",
          type: "string",
          label: "Button Text",
          defaultValue: "Get Started",
        },
        {
          name: "variant",
          type: "select",
          label: "Variant",
          defaultValue: "default",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Destructive", value: "destructive" },
          ],
        },
        {
          name: "href",
          type: "string",
          label: "Link URL",
          defaultValue: "#",
        },
        {
          name: "size",
          type: "select",
          label: "Size",
          defaultValue: "default",
          options: [
            { label: "Small", value: "sm" },
            { label: "Default", value: "default" },
            { label: "Large", value: "lg" },
          ],
        },
        {
          name: "align",
          type: "select",
          label: "Alignment",
          defaultValue: "right",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "marginLeft",
          type: "spacing",
          label: "Margin Left",
          defaultValue: "0px",
        },
        {
          name: "marginRight",
          type: "spacing",
          label: "Margin Right",
          defaultValue: "0px",
        },
        {
          name: "backgroundColor",
          type: "color",
          label: "Background Color",
        },
        {
          name: "textColor",
          type: "color",
          label: "Text Color",
        },
      ],
    },
  ];

  return NextResponse.json(components);
}