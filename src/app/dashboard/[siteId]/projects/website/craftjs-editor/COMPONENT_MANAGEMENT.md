# Component Management System

## Overview

The component registry system now supports dynamic management through the admin/marketplace interface.

## How It Works

### Component Registry (`registry.tsx`)

Every component is registered with metadata:
- `name`: Component identifier
- `component`: React component
- `category`: UI category
- `description`: User-friendly description  
- `icon`: Lucide icon
- `settings`: Settings panel component
- `isContainer`: Can contain child components
- **`isCore`: Core components always available (boolean)**

### Core vs Theme Components

**Core Components** (`isCore: true`):
- Always available to users
- Cannot be disabled via marketplace
- Includes basic building blocks (Container, Text, Button, etc.)
- Visible in admin but marked as "Core"

**Theme Components** (`isCore: false`):
- Installed via marketplace themes
- Can be enabled/disabled
- Premium/specialty components

## For Admin/Marketplace Development

### Available Helper Functions

From `registry.tsx`:

```tsx
import { 
    componentRegistry,      // Full registry array
    getCoreComponents,      // Get all core components
    getNonCoreComponents,   // Get theme-based components
    getComponentByName,     // Find specific component
    isComponentCore         // Check if component is core
} from './user-components/registry'
```

### Example: Admin Component List

```tsx
import { componentRegistry, isComponentCore } from './user-components/registry'

function AdminComponentList() {
    return (
        <div>
            {componentRegistry.map(comp => (
                <div key={comp.name}>
                    <h3>{comp.name}</h3>
                    <p>{comp.description}</p>
                    <p>Category: {comp.category}</p>
                    {isComponentCore(comp.name) ? (
                        <Badge>Core - Always Available</Badge>
                    ) : (
                        <Toggle 
                            enabled={/* from your DB */}
                            onChange={/* save to DB */}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
```

### Example: Enable/Disable Components

In your admin, you can:

1. **List all components** from `componentRegistry`
2. **Check if core** using `isComponentCore(name)`
3. **Save enabled/disabled state** to your database
4. **Sync with themes** - components from installed themes automatically available

### Database Structure Recommendation

```sql
CREATE TABLE site_component_overrides (
    id UUID PRIMARY KEY,
    site_id UUID REFERENCES sites(id),
    component_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    UNIQUE(site_id, component_name)
);
```

### MarketplaceContext Integration

The `isComponentAvailable` function now checks:
1. ✅ Is it a core component? → Always show
2. ✅ Is it in an installed theme? → Show if theme installed
3. ❌ Otherwise → Hide

## Adding New Components

1. Create component file in `user-components/`
2. Add to `registry.tsx`:
   - Import component
   - Add to `componentRegistry` array
   - Set `isCore: true` for always-available, or `false` for theme-based
   - Re-export at bottom
3. Done! No need to touch resolver or marketplace code

## Migration Path

To fully enable admin control:

1. **Phase 1** (Current): Core components always show, theme components from DB
2. **Phase 2**: Add `site_component_overrides` table
3. **Phase 3**: Update `MarketplaceContext` to check overrides table
4. **Phase 4**: Build admin UI to manage component availability

The registry system is ready - just hook it up to your admin interface!
