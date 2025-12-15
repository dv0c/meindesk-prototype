# Component Creation Guide for Builder

This guide explains how to create new custom components for the website builder.

## 1. Directory Structure

Custom components are located in:
`src/components/Builder/CustomBlocks/Themes/[ThemeName]/[ComponentName]/index.tsx`

Example for a "Hero" component in "SophiaPlatanisioti" theme:
`src/components/Builder/CustomBlocks/Themes/SophiaPlatanisioti/Hero/index.tsx`

## 2. Component Implementation

Create your component file (e.g., `index.tsx`). It should accept props that you want to be editable.

### **Important Rules:**
- **Props**: Only include props that you want the user to edit (e.g., `title`, `image`, `padding`).
- **Static Styling**: Hardcode any styling that shouldn't be changed to maintain the theme's design.
- **Children**: If the component acts as a container (like a Section or Grid), use the `children` prop.

```tsx
import React from "react";

interface MyComponentProps {
  title?: string;
  image?: string;
  // Add other props here
}

export const MyComponent = ({ 
  title = "Default Title", 
  image, 
}: MyComponentProps) => {
  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold">{title}</h1>
      {image && <img src={image} alt="Component Image" className="w-full h-auto" />}
    </div>
  );
};
```

## 3. Registering the Component

To make the component available in the builder, you must register it in `src/lib/components-data.ts`.

Find the `componentDefinitions` array (or generic equivalent) and add your component configuration.

> [!WARNING]
> **Unique Names Required**: Each component must have a unique name within its theme. Global components (no theme) must be unique across all globals. If you duplicate a name, the application will log a CRITICAL ERROR in the console startup.

```typescript
{
  name: "MyComponent", // Must match the export name
  category: "hero", // Category in the builder sidebar
  themeName: "Sophia Platanisioti", // Group it under a theme
  props: [
    {
      name: "title",
      type: "textarea", // 'string', 'textarea', 'image', 'color', 'spacing', etc.
      label: "Main Title",
      defaultValue: "Welcome"
    },
    {
      name: "image",
      type: "image",
      label: "Background Image"
    }
  ]
}
```

### **Available Prop Types:**
- `string`: Single line text input
- `textarea`: Multi-line text (supports rich text if HTML content is detected)
- `image`: Image uploader/picker
- `color`: Color picker
- `spacing`: Padding/Margin controls (Top, Right, Bottom, Left)
- `select`: Dropdown menu (requires `options: [{label, value}]`)
- `boolean`: Toggle switch
- `number`: Numeric input
- `json`: Dynamic list editor (for repeated items like features or links)

## 4. Integration

Once created and registered:
1. The builder reads `components-data.ts` to show the component in the sidebar.
2. When dropped onto the canvas, `render-node.tsx` dynamically renders the component using the name specified.
3. The properties panel automatically generates inputs based on the `props` configuration.
