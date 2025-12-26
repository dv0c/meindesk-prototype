# Component Wrapper System - Quick Start Guide

## Overview

The wrapper system simplifies creating CraftJS components by providing:
- **Common props** (spacing, sizing, colors, borders)
- **Automatic style conversion** from props to CSS
- **CraftJS node connection** handling
- **Reusable settings panels**

## File Structure

```
craftjs-editor/
├── lib/
│   ├── withCraftComponent.tsx    # HOC wrapper
│   └── CommonSettings.tsx        # Reusable settings components
└── user-components/
    └── ExampleCard.tsx           # Example usage
```

## Creating a Component

### 1. Define Props
```tsx
interface MyComponentProps extends CraftComponentProps {
  // Add component-specific props
  title?: string
  content?: string
}
```

### 2. Create Base Component
```tsx
const MyComponentBase = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ title, content, ...props }, ref) => {
    const style = propsToStyle(props) // Auto-converts common props
    
    return (
      <div ref={ref} style={style} className={props.className}>
        {title && <h3>{title}</h3>}
        {content && <p>{content}</p>}
      </div>
    )
  }
)
```

### 3. Wrap with HOC
```tsx
export const MyComponent = withCraftComponent(MyComponentBase, {
  displayName: 'MyComponent',
  defaultProps: {
    title: 'Default Title',
    paddingTop: 16,
    paddingBottom: 16,
  }
})
```

### 4. Create Settings
```tsx
const MyComponentSettings = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Your custom settings */}
      <SettingsSection title="Content">
        <SettingControl label="Title">
          <Input ... />
        </SettingControl>
      </SettingsSection>
      
      {/* Common settings */}
      <CommonSettings />
    </div>
  )
}
```

### 5. Attach Config
```tsx
MyComponent.craft = {
  displayName: 'MyComponent',
  props: { /* defaults */ },
  related: { settings: MyComponentSettings },
  custom: { resizable: true, deletable: true }
}
```

## Available Common Props

### Spacing
- `marginTop`, `marginRight`, `marginBottom`, `marginLeft`
- `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`

### Sizing
- `width`, `height`, `minWidth`, `maxWidth`, `minHeight`

### Colors
- `backgroundColor`, `color`

### Border
- `borderRadius`, `borderWidth`, `borderColor`, `borderStyle`

### Other
- `className`, `style`

## Common Settings Components

### `<CommonSettings />`
Includes all common settings (spacing, sizing, appearance)

### `<SpacingSettings />`
Only margin and padding controls

### `<SizingSettings />`
Only width/height controls

### `<AppearanceSettings />`
Only colors and border controls

### `<SettingsSection title="...">`
Groups related settings with a title

### `<SettingControl label="...">`
Individual setting with label and description

## Benefits

✅ **Less Boilerplate** - No need to rewrite spacing/styling logic  
✅ **Consistent UX** - All components use same settings UI  
✅ **Type Safe** - Full TypeScript support  
✅ **Easy to Extend** - Add custom props alongside common ones  
✅ **Automatic Styling** - Props auto-convert to CSS

## See Also

- `ExampleCard.tsx` - Complete working example
- `withCraftComponent.tsx` - HOC implementation
- `CommonSettings.tsx` - Reusable settings
