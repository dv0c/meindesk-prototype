import { Button } from "@/components/ui/button"
import { Settings, Palette, Layout, Grid3x3, Filter as Footer, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  category: string
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "global",
    label: "Global",
    icon: <Settings size={20} />,
    description: "Site-wide settings",
    category: "Configuration",
  },
  {
    id: "theme",
    label: "Theme",
    icon: <Palette size={20} />,
    description: "Colors & styling",
    category: "Design",
  },
  {
    id: "header",
    label: "Header",
    icon: <Layout size={20} />,
    description: "Navigation & branding",
    category: "Components",
  },
  {
    id: "sections",
    label: "Sections",
    icon: <Grid3x3 size={20} />,
    description: "Page sections",
    category: "Components",
  },
  {
    id: "footer",
    label: "Footer",
    icon: <Footer size={20} />,
    description: "Footer links",
    category: "Components",
  },
]

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const groupedItems = NAV_ITEMS.reduce((acc, item) => {
    const existing = acc.find(g => g.category === item.category)
    if (existing) {
      existing.items.push(item)
    } else {
      acc.push({ category: item.category, items: [item] })
    }
    return acc
  }, [] as Array<{ category: string; items: NavItem[] }>)

  return (
    <aside className="w-64 lg:w-72 border-r border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30 p-6 flex flex-col h-screen max-h-screen overflow-hidden hover:overflow-y-auto">
      <div className="mb-8 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <Menu size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Template</h1>
            <p className="text-xs text-muted-foreground font-medium">Schema Editor</p>
          </div>
        </div>
      </div>

      <nav className="space-y-6 flex-1 min-w-0">
        {groupedItems.map((group) => (
          <div key={group.category} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              {group.category}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 group min-w-0",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-foreground hover:bg-secondary/70"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 transition-colors",
                    activeSection === item.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-semibold text-sm leading-tight transition-colors",
                      activeSection === item.id
                        ? "text-primary-foreground"
                        : "text-foreground"
                    )}>
                      {item.label}
                    </p>
                    <p className={cn(
                      "text-xs leading-tight transition-colors",
                      activeSection === item.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}>
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-6 border-t border-border/50 space-y-3 flex-shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
          Resources
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs h-9 font-medium hover:bg-secondary/70 transition-colors"
        >
          Documentation
        </Button>
      </div>
    </aside>
  )
}
