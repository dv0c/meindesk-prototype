import { NextResponse } from "next/server";
import type { ComponentDefinition } from "@/lib/types";

export async function GET() {
  const components: ComponentDefinition[] = [
    // ========================
    // MAIN FILE COMPONENTS
    // ========================
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
      name: "Accordion",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "items",
          type: "string",
          label: "Items (JSON)",
          defaultValue: JSON.stringify([
            {
              title: "Is it accessible?",
              content: "Yes. It adheres to the WAI-ARIA design pattern.",
            },
            {
              title: "Is it styled?",
              content: "Yes. It comes with default styles.",
            },
          ]),
        },
      ],
    },
    {
      name: "Card",
      category: "content",
      allowChildren: true,
      props: [
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Card Title",
        },
        {
          name: "description",
          type: "string",
          label: "Description",
          defaultValue: "Card description",
        },
      ],
    },
    {
      name: "Alert",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "type",
          type: "select",
          label: "Type",
          defaultValue: "info",
          options: [
            { label: "Info", value: "info" },
            { label: "Success", value: "success" },
            { label: "Warning", value: "warning" },
            { label: "Error", value: "error" },
          ],
        },
        {
          name: "title",
          type: "string",
          label: "Title",
          defaultValue: "Alert Title",
        },
        {
          name: "message",
          type: "string",
          label: "Message",
          defaultValue: "This is an alert",
        },
      ],
    },
    {
      name: "Timeline",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "items",
          type: "string",
          label: "Timeline Items (JSON)",
          defaultValue: JSON.stringify([
            {
              title: "Started",
              description: "Founded the company",
              date: "2020",
            },
            {
              title: "First Launch",
              description: "Launched our first product",
              date: "2021",
            },
          ]),
        },
      ],
    },
    {
      name: "Articles",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "title",
          type: "string",
          label: "Section Title",
          defaultValue: "Latest Articles",
        },
      ],
    },
    {
      name: "SingleArticle",
      category: "content",
      allowChildren: false,
      props: [
        {
          name: "siteLogoText",
          type: "string",
          label: "Site Logo Text",
          defaultValue: "ΝΑΥΤΕΜΠΟΡΙΚΗ",
        },
        {
          name: "categoryLabel",
          type: "string",
          label: "Category Label",
          defaultValue: "ΚΟΣΜΟΣ",
        },
        {
          name: "categoryColor",
          type: "string",
          label: "Category Color",
          defaultValue: "#d32f2f",
        },
        {
          name: "title",
          type: "string",
          label: "Article Title",
          defaultValue: "Article Title",
        },
      ],
    },
    {
      name: "Input",
      category: "forms",
      allowChildren: false,
      props: [
        { name: "label", type: "string", label: "Label", defaultValue: "" },
        {
          name: "placeholder",
          type: "string",
          label: "Placeholder",
          defaultValue: "Enter text...",
        },
        { name: "type", type: "string", label: "Type", defaultValue: "text" },
      ],
    },
    {
      name: "Textarea",
      category: "forms",
      allowChildren: false,
      props: [
        { name: "label", type: "string", label: "Label", defaultValue: "" },
        {
          name: "placeholder",
          type: "string",
          label: "Placeholder",
          defaultValue: "Enter text...",
        },
        { name: "rows", type: "number", label: "Rows", defaultValue: 4 },
      ],
    },
    {
      name: "Select",
      category: "forms",
      allowChildren: false,
      props: [
        { name: "label", type: "string", label: "Label", defaultValue: "" },
        {
          name: "placeholder",
          type: "string",
          label: "Placeholder",
          defaultValue: "Select an option",
        },
        {
          name: "options",
          type: "string",
          label: "Options (comma-separated)",
          defaultValue: "Option 1,Option 2,Option 3",
        },
      ],
    },
    {
      name: "Checkbox",
      category: "forms",
      allowChildren: false,
      props: [
        {
          name: "label",
          type: "string",
          label: "Label",
          defaultValue: "Checkbox",
        },
        {
          name: "checked",
          type: "boolean",
          label: "Checked",
          defaultValue: false,
        },
      ],
    },
    {
      name: "Switch",
      category: "forms",
      allowChildren: false,
      props: [
        {
          name: "label",
          type: "string",
          label: "Label",
          defaultValue: "Switch",
        },
        {
          name: "checked",
          type: "boolean",
          label: "Checked",
          defaultValue: false,
        },
      ],
    },
    {
      name: "Slider",
      category: "forms",
      allowChildren: false,
      props: [
        { name: "label", type: "string", label: "Label", defaultValue: "" },
        { name: "min", type: "number", label: "Min", defaultValue: 0 },
        { name: "max", type: "number", label: "Max", defaultValue: 100 },
        { name: "step", type: "number", label: "Step", defaultValue: 1 },
        {
          name: "defaultValue",
          type: "number",
          label: "Default Value",
          defaultValue: 50,
        },
      ],
    },
    {
      name: "Badge",
      category: "ui",
      allowChildren: true,
      props: [
        { name: "text", type: "string", label: "Text", defaultValue: "Badge" },
        {
          name: "variant",
          type: "select",
          label: "Variant",
          defaultValue: "default",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Destructive", value: "destructive" },
            { label: "Outline", value: "outline" },
          ],
        },
      ],
    },
    {
      name: "Avatar",
      category: "ui",
      allowChildren: false,
      props: [
        { name: "src", type: "string", label: "Image URL", defaultValue: "" },
        {
          name: "alt",
          type: "string",
          label: "Alt Text",
          defaultValue: "Avatar",
        },
        {
          name: "fallback",
          type: "string",
          label: "Fallback Text",
          defaultValue: "U",
        },
      ],
    },
    {
      name: "Progress",
      category: "ui",
      allowChildren: false,
      props: [
        {
          name: "value",
          type: "number",
          label: "Value (0-100)",
          defaultValue: 50,
        },
      ],
    },
    {
      name: "Separator",
      category: "ui",
      allowChildren: false,
      props: [
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
      ],
    },
    {
      name: "Skeleton",
      category: "ui",
      allowChildren: false,
      props: [
        { name: "width", type: "string", label: "Width", defaultValue: "100%" },
        {
          name: "height",
          type: "string",
          label: "Height",
          defaultValue: "20px",
        },
      ],
    },
    {
      name: "Spinner",
      category: "ui",
      allowChildren: false,
      props: [
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
      ],
    },
    {
      name: "Breadcrumb",
      category: "ui",
      allowChildren: false,
      props: [
        {
          name: "items",
          type: "string",
          label: "Items (comma-separated)",
          defaultValue: "Home,Products,Category",
        },
      ],
    },
    {
      name: "Kbd",
      category: "ui",
      allowChildren: false,
      props: [
        {
          name: "keys",
          type: "string",
          label: "Keys (comma-separated)",
          defaultValue: "Ctrl,C",
        },
      ],
    },
    {
      name: "Gallery",
      category: "",
      allowChildren: false,
      props: [
        {
          name: "items",
          type: "image",
          label: "Gallery Items",
          // Note: In a real editor, this 'array' type would usually link to
          // a sub-editor or collection management interface.
        },
        // Note: The 'renderItem' prop is a render function and typically wouldn't be
        // exposed as a simple property in a JSON/visual editor like this.
        // The editor assumes a default item rendering template.
      ],
    },
  ];

  return NextResponse.json(components);
}
