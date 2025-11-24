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
    {
      name: "HtmlContainer",
      category: "layout",
      allowChildren: true,
      props: [
        { name: "tag", type: "string", label: "HTML Tag", defaultValue: "div" },
        {
          name: "className",
          type: "string",
          label: "CSS Classes",
          defaultValue: "",
        },
        {
          name: "styles",
          type: "string",
          label: "Custom Styles (CSS)",
          defaultValue: "",
        },
      ],
    },
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
      name: "EditorButton",
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
      ],
    },
    {
      name: "Image",
      category: "basic",
      allowChildren: false,
      props: [
        {
          name: "src",
          type: "string",
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
      name: "ArticleList",
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
      ],
    },

    // Media Components
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
      category: "Articles",
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
          name: "contentFallback",
          type: "select",
          label: "Fallback Content",
          defaultValue: "json",
          options: [
            { label: "JSON", value: "json" },
            { label: "Nothing", value: "none" },
          ],
        },
        {
          name: "padding",
          type: "string",
          label: "Container Padding",
          defaultValue: "16px",
        },
        {
          name: "contentPadding",
          type: "string",
          label: "Content Padding",
          defaultValue: "0px",
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
      ],
    },
  ];

  return NextResponse.json(components);
}
