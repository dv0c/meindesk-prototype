import type { ComponentDefinition } from "./types"

export const ALL_COMPONENTS: ComponentDefinition[] = [
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
                defaultValue: "var(--primary)",
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
            {
                name: "justifyContent",
                type: "select",
                label: "Content Justification",
                defaultValue: "start",
                options: [
                    { label: "Space Between", value: "between" },
                    { label: "Start (Manual Align)", value: "start" },
                    { label: "Center", value: "center" },
                    { label: "End", value: "end" },
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
    {
        name: "HeroSection",
        category: "layout",
        allowChildren: false,
        props: [
            {
                name: "heading",
                type: "string",
                label: "Heading",
                defaultValue: "Welcome",
            },
            {
                name: "subheading",
                type: "string",
                label: "Subheading",
                defaultValue: "Your subtitle here",
            },
            {
                name: "headingSize",
                type: "select",
                label: "Heading Size",
                defaultValue: "xl",
                options: [
                    { label: "Small", value: "sm" },
                    { label: "Medium", value: "md" },
                    { label: "Large", value: "lg" },
                    { label: "Extra Large", value: "xl" },
                ],
            },
            {
                name: "textAlign",
                type: "select",
                label: "Text Alignment",
                defaultValue: "center",
                options: [
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                ],
            },
            {
                name: "backgroundColor",
                type: "color",
                label: "Background Color",
                defaultValue: "#F5F3F0",
            },
            {
                name: "backgroundImage",
                type: "image",
                label: "Background Image",
                defaultValue: "",
            },
            {
                name: "textColor",
                type: "color",
                label: "Text Color",
                defaultValue: "#2C2C2C",
            },
            {
                name: "padding",
                type: "spacing",
                label: "Padding",
                defaultValue: "80px 24px",
            },
            {
                name: "minHeight",
                type: "dimensions",
                label: "Minimum Height",
                defaultValue: "400px",
            },
            {
                name: "showButton",
                type: "boolean",
                label: "Show Button",
                defaultValue: false,
            },
            {
                name: "buttonText",
                type: "string",
                label: "Button Text",
                defaultValue: "Get Started",
            },
            {
                name: "buttonHref",
                type: "string",
                label: "Button Link",
                defaultValue: "#",
            },
            {
                name: "buttonVariant",
                type: "select",
                label: "Button Style",
                defaultValue: "default",
                options: [
                    { label: "Default", value: "default" },
                    { label: "Secondary", value: "secondary" },
                    { label: "Outline", value: "outline" },
                ],
            },
        ],
    },
    {
        name: "FooterBlock",
        category: "layout",
        allowChildren: false,
        props: [
            {
                name: "copyright",
                type: "string",
                label: "Copyright Text",
                defaultValue: "© 2024 All rights reserved",
            },
            {
                name: "attribution",
                type: "string",
                label: "Attribution",
                defaultValue: "",
            },
            {
                name: "links",
                type: "json",
                label: "Links",
                schema: [
                    { key: "label", label: "Label", type: "string" },
                    { key: "href", label: "URL", type: "string" },
                ],
                defaultValue: [],
            },
            {
                name: "backgroundColor",
                type: "color",
                label: "Background Color",
                defaultValue: "#2C2C2C",
            },
            {
                name: "textColor",
                type: "color",
                label: "Text Color",
                defaultValue: "#F5F3F0",
            },
            {
                name: "padding",
                type: "spacing",
                label: "Padding",
                defaultValue: "40px 24px",
            },
            {
                name: "textAlign",
                type: "select",
                label: "Text Alignment",
                defaultValue: "center",
                options: [
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                ],
            },
            {
                name: "fontSize",
                type: "select",
                label: "Font Size",
                defaultValue: "sm",
                options: [
                    { label: "Small", value: "sm" },
                    { label: "Base", value: "base" },
                    { label: "Large", value: "lg" },
                ],
            },
        ],
    },
    {
        name: "SectionDivider",
        category: "layout",
        allowChildren: false,
        props: [
            {
                name: "height",
                type: "dimensions",
                label: "Height",
                defaultValue: "60px",
            },
            {
                name: "backgroundColor",
                type: "color",
                label: "Background Color",
                defaultValue: "transparent",
            },
            {
                name: "showLine",
                type: "boolean",
                label: "Show Line",
                defaultValue: false,
            },
            {
                name: "lineColor",
                type: "color",
                label: "Line Color",
                defaultValue: "#E5E7EB",
            },
            {
                name: "lineWidth",
                type: "dimensions",
                label: "Line Width",
                defaultValue: "1px",
            },
        ],
    },
    {
        name: "ContactInfo",
        category: "advanced",
        allowChildren: false,
        props: [
            {
                name: "phone",
                type: "string",
                label: "Phone",
                defaultValue: "",
            },
            {
                name: "email",
                type: "string",
                label: "Email",
                defaultValue: "",
            },
            {
                name: "facebook",
                type: "string",
                label: "Facebook URL",
                defaultValue: "",
            },
            {
                name: "instagram",
                type: "string",
                label: "Instagram URL",
                defaultValue: "",
            },
            {
                name: "linkedin",
                type: "string",
                label: "LinkedIn URL",
                defaultValue: "",
            },
            {
                name: "twitter",
                type: "string",
                label: "Twitter URL",
                defaultValue: "",
            },
            {
                name: "showIcons",
                type: "boolean",
                label: "Show Icons",
                defaultValue: true,
            },
            {
                name: "layout",
                type: "select",
                label: "Layout",
                defaultValue: "vertical",
                options: [
                    { label: "Vertical", value: "vertical" },
                    { label: "Horizontal", value: "horizontal" },
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
                defaultValue: "WebsiteName",
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
                name: "sticky",
                type: "boolean",
                label: "Sticky",
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
                label: "Links",
                // Basic schema for links
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
        ],
    },

    {
        name: "Hero",
        category: "layout",
        allowChildren: true,
        themeName: "Sophia Platanisioti",
        hidden: true,
        props: [
            {
                name: "content",
                type: "textarea",
                label: "Main Content (HTML)",
                defaultValue: "<p>Add your content here...</p>"
            },
            {
                name: "thumbnail",
                type: "image",
                label: "Hero Image",
                defaultValue: ""
            },
            {
                name: "containerPadding",
                type: "spacing",
                label: "Container Padding",
                defaultValue: "px-3"
            },
            {
                name: "containerMargin",
                type: "spacing",
                label: "Container Margin",
                defaultValue: "0"
            }
        ],
    },
    {
        name: "Navbar",
        category: "layout",
        themeName: "Sophia Platanisioti",
        props: [
            {
                name: "logoColor",
                type: "color",
                label: "Logo Color",
                defaultValue: "#5a5933"
            },
            {
                name: "bannerImage",
                type: "image",
                label: "Banner Image",
                defaultValue: "/banner.webp"
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
                        schema: [
                            { key: "label", label: "Label", type: "string" },
                            { key: "href", label: "URL", type: "string" },
                        ],
                    },
                ],
                defaultValue: [
                    { label: "ΑΡΧΙΚΗ", href: "/" },
                    { label: "ΥΠΗΡΕΣΙΕΣ", href: "/ypiresies" },
                    { label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact" },
                    { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/biography" },
                    {
                        label: "ΑΡΘΡΑ",
                        href: "/articles",
                        submenu: [
                            { label: "ΨΥΧΟΘΕΡΑΠΕΙΑ", href: "/articles/psychotherapy" },
                            { label: "ΣΥΜΒΟΥΛΕΥΤΙΚΗ", href: "/articles/counseling" },
                            { label: "BLOG", href: "/articles/blog" },
                            { label: "Όλα τα Άρθρα", href: "/articles" },
                        ],
                    },
                ],
            },
        ],
    },
]

    // VALIDATION: Prevent duplicate component definitions during development
    // This runs when the module is loaded (e.g., server start or build)
    ; (() => {
        if (typeof window !== 'undefined') return; // Run only on server/build

        const seen = new Set<string>();
        const errors: string[] = [];

        // Check for duplicates in ALL_COMPONENTS
        ALL_COMPONENTS.forEach((component, index) => {
            // Create a unique key based on theme and name
            // Global components (no theme) use just the name
            // Themed components use ThemeName::ComponentName
            const key = component.themeName
                ? `${component.themeName}::${component.name}`
                : `Global::${component.name}`;

            if (seen.has(key)) {
                errors.push(`Duplicate component definition at index ${index}: "${component.name}" ${component.themeName ? `(Theme: ${component.themeName})` : "(Global)"}`);
            }
            seen.add(key);
        });

        if (errors.length > 0) {
            console.error("\n\n❌ CRITICAL: DUPLICATE COMPONENTS DETECTED IN components-data.ts ❌");
            errors.forEach(err => console.error(err));
            console.error("Please remove duplicates to prevent database conflicts.\n\n");
        }
    })();
