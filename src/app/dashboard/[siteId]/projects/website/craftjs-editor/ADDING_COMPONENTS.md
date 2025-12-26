# Adding New Components to CraftJS Editor

## Quick Start Guide

To add a new component to the editor, you only need to edit **ONE file**: `registry.tsx`

## Step-by-Step Instructions

### 1. Create Your Component File

Create a new file in the `user-components` folder (e.g., `MyComponent.tsx`):

```tsx
import React from 'react'
import { useNode } from '@craftjs/core'
import { withCraftComponent, CraftComponentProps, propsToStyle } from '../lib/withCraftComponent'
import { CommonSettings, SettingsSection, SettingControl } from '../lib/CommonSettings'
import { Input } from '@/components/ui/input'

// Define component-specific props
interface MyComponentProps extends CraftComponentProps {
    title?: string
    // Add your custom props here
}

// Create the base component
const MyComponentBase = React.forwardRef<HTMLDivElement, MyComponentProps>(
    ({ title, ...props }, ref) => {
        const style = propsToStyle(props)

        return (
            <div ref={ref} className={props.className} style={style}>
                <h2>{title}</h2>
                {/* Your component UI here */}
            </div>
        )
    }
)

MyComponentBase.displayName = 'MyComponentBase'

// Wrap with CraftJS functionality
export const MyComponent = withCraftComponent(MyComponentBase, {
    displayName: 'MyComponent',
    defaultProps: {
        title: 'Default Title',
        // Add default values
    }
})

// Create Settings component (optional but recommended)
const MyComponentSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as MyComponentProps
    }))

    return (
        <div className="space-y-4 p-4">
            <SettingsSection title="Content">
                <SettingControl label="Title">
                    <Input
                        value={props.title || ''}
                        onChange={(e) => setProp((p: MyComponentProps) => p.title = e.target.value)}
                        className="h-8 text-xs"
                    />
                </SettingControl>
            </SettingsSection>

            {/* Common settings for spacing, sizing, etc. */}
            <CommonSettings />
        </div>
    )
}

// Attach craft configuration
MyComponent.craft = {
    displayName: 'MyComponent',
    props: {
        title: 'Default Title',
    },
    related: {
        settings: MyComponentSettings,
    },
    custom: {
        resizable: true,
        deletable: true,
    }
}
```

### 2. Register in `registry.tsx`

Open `user-components/registry.tsx` and follow these steps:

#### A. Import the icon (from lucide-react)
```tsx
import { YourIcon } from 'lucide-react'
```

#### B. Import your component
```tsx
import { MyComponent, MyComponentSettings } from './MyComponent'
```

#### C. Add to the `componentRegistry` array
```tsx
{
    name: 'MyComponent',
    component: MyComponent,
    category: 'Content',  // Choose: Layout, Navigation, Typography, Interactive, Media, Content
    description: 'A brief description of your component',
    icon: <YourIcon className="h-5 w-5" />,
    settings: MyComponentSettings,  // Optional
    isContainer: false,  // Set to true if component can contain other components
},
```

#### D. Re-export your component (at the bottom of `registry.tsx`)
```tsx
export {
    // ... existing exports
    MyComponent,
    MyComponentSettings,
}
```

### 3. Done! 🎉

That's it! Your component will now automatically appear in:
- ✅ The sidebar toolbox
- ✅ With the correct icon
- ✅ In the right category
- ✅ With drag-and-drop functionality
- ✅ With the settings panel

## Example: The Card Component

See [`ExampleCard.tsx`](file:///c:/Users/tasos/Documents/Projects/meindesk-prototype/src/app/dashboard/%5BsiteId%5D/projects/website/craftjs-editor/user-components/ExampleCard.tsx) for a complete working example.

Its registration in `registry.tsx`:
```tsx
{
    name: 'Card',
    component: Card,
    category: 'Content',
    description: 'A card component with image, title, and description',
    icon: <CreditCard className="h-5 w-5" />,
},
```

## Categories

Choose from these predefined categories:
- **Layout**: Containers, grids, structural components
- **Navigation**: Navbars, links, menus
- **Typography**: Headings, text, formatted content
- **Interactive**: Buttons, forms, clickable elements
- **Media**: Images, videos, audio
- **Content**: Cards, lists, composite content sections

## Component Settings

The settings component receives props through CraftJS hooks:

```tsx
const MyComponentSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as MyComponentProps
    }))

    return (
        <div className="space-y-4 p-4">
            {/* Your custom settings */}
            {/* Use CommonSettings for spacing, colors, borders, etc. */}
            <CommonSettings />
        </div>
    )
}
```

## Common Props (Built-in)

All components wrapped with `withCraftComponent` automatically get these props:
- Spacing: `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `paddingTop`, etc.
- Sizing: `width`, `height`, `minWidth`, `maxWidth`, `minHeight`
- Colors: `backgroundColor`, `color`
- Border: `borderRadius`, `borderWidth`, `borderColor`, `borderStyle`

Use `<CommonSettings />` in your settings component to provide UI controls for these.

## Container Components

If your component should accept child components (like Container or Grid), set `isContainer: true` in the registry:

```tsx
{
    name: 'MyContainer',
    component: MyContainer,
    category: 'Layout',
    description: 'A container component',
    icon: <Box className="h-5 w-5" />,
    isContainer: true,  // ← Important!
},
```

And make sure your component uses the `canvas` prop in CraftJS.
