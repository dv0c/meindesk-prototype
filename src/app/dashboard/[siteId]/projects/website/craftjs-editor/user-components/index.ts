// User components for CraftJS
export { Container, ContainerSettings } from "./Container"
export { Heading, HeadingSettings } from "./Heading"
export { Text, TextSettings } from "./Text"
export { Button, ButtonSettings } from "./Button"
export { Image, ImageSettings } from "./Image"
export { Grid, GridSettings } from "./Grid"
export { Divider, DividerSettings } from "./Divider"
export { Spacer, SpacerSettings } from "./Spacer"
export { Navbar, NavbarSettings } from "./Navbar"
export { NavigationLinks, NavigationLinksSettings } from "./NavigationLinks"

// Component definitions for the toolbox
export const componentDefinitions = [
    {
        name: "Container",
        category: "Layout",
        description: "A container for grouping elements",
    },
    {
        name: "Grid",
        category: "Layout",
        description: "A responsive grid layout",
    },
    {
        name: "Navbar",
        category: "Navigation",
        description: "A header navigation bar",
    },
    {
        name: "NavigationLinks",
        category: "Navigation",
        description: "A list of navigation links",
    },
    {
        name: "Heading",
        category: "Typography",
        description: "A heading element (h1-h6)",
    },
    {
        name: "Text",
        category: "Typography",
        description: "A paragraph of text",
    },
    {
        name: "Button",
        category: "Interactive",
        description: "A clickable button",
    },
    {
        name: "Image",
        category: "Media",
        description: "An image element",
    },
    {
        name: "Divider",
        category: "Layout",
        description: "A horizontal divider line",
    },
    {
        name: "Spacer",
        category: "Layout",
        description: "Vertical spacing element",
    },
]
