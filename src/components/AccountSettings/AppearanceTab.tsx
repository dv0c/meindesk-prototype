"use client"

import { useTheme } from "@/components/Providers/ThemeProvider"
import { Monitor, Moon, Sun, Sparkles, Zap, Smartphone, Laptop } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export function AppearanceTab() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of your workspace.
                </p>
            </div>

            <RadioGroup
                defaultValue={theme}
                onValueChange={(value) => setTheme(value)}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {/* Light Theme */}
                <ThemeCard
                    value="light"
                    label="Light"
                    icon={Sun}
                    isActive={theme === 'light'}
                >
                    <div className="absolute inset-0 bg-white p-2">
                        <div className="h-full w-full rounded-md border border-zinc-200 bg-zinc-50 flex overflow-hidden shadow-sm">
                            <div className="w-1/4 bg-white border-r border-zinc-200 p-1.5 space-y-1.5">
                                <div className="h-1.5 w-8 bg-zinc-200 rounded-full" />
                                <div className="h-1.5 w-12 bg-zinc-100 rounded-full" />
                                <div className="h-1.5 w-10 bg-zinc-100 rounded-full" />
                            </div>
                            <div className="flex-1 p-2 space-y-2">
                                <div className="h-2 w-24 bg-zinc-200 rounded-full" />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-12 bg-white border border-zinc-100 rounded shadow-sm" />
                                    <div className="flex-1 h-12 bg-white border border-zinc-100 rounded shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ThemeCard>

                {/* Dark Theme */}
                <ThemeCard
                    value="dark"
                    label="Dark"
                    icon={Moon}
                    isActive={theme === 'dark'}
                >
                    <div className="absolute inset-0 bg-zinc-950 p-2">
                        <div className="h-full w-full rounded-md border border-zinc-800 bg-zinc-900 flex overflow-hidden shadow-inner">
                            <div className="w-1/4 bg-zinc-950 border-r border-zinc-800 p-1.5 space-y-1.5">
                                <div className="h-1.5 w-8 bg-zinc-800 rounded-full" />
                                <div className="h-1.5 w-12 bg-zinc-900 rounded-full" />
                                <div className="h-1.5 w-10 bg-zinc-900 rounded-full" />
                            </div>
                            <div className="flex-1 p-2 space-y-2">
                                <div className="h-2 w-24 bg-zinc-800 rounded-full" />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-12 bg-zinc-950 border border-zinc-800 rounded shadow-sm" />
                                    <div className="flex-1 h-12 bg-zinc-950 border border-zinc-800 rounded shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ThemeCard>

                {/* Cyberpunk Theme */}
                <ThemeCard
                    value="cyberpunk"
                    label="Cyberpunk"
                    icon={Zap}
                    isActive={theme === 'cyberpunk'}
                    className="border-primary/20"
                >
                    <div className="absolute inset-0 bg-[#141414] p-2 font-mono">
                        <div className="h-full w-full rounded-none border border-[#404040] bg-[#1f1f1f] flex overflow-hidden">
                            <div className="w-1/4 bg-[#1a1a1a] border-r border-[#404040] p-1.5 space-y-1.5">
                                <div className="h-1.5 w-8 bg-[#f2f2f2] rounded-none" />
                                <div className="h-1.5 w-12 bg-[#404040] rounded-none" />
                            </div>
                            <div className="flex-1 p-2 space-y-2">
                                <div className="h-2 w-24 bg-[#e07730]/40 rounded-none border-l-2 border-[#e07730]" />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-12 bg-[#1a1a1a] border border-[#404040] rounded-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ThemeCard>

                {/* Modern Theme */}
                <ThemeCard
                    value="modern"
                    label="Modern"
                    icon={Sparkles}
                    isActive={theme === 'modern'}
                >
                    <div className="absolute inset-0 bg-[#fefefe] p-2 font-sans">
                        <div className="h-full w-full rounded-2xl border border-purple-100 bg-[#fafafa] flex overflow-hidden shadow-sm">
                            <div className="w-1/4 bg-white border-r border-dashed border-purple-100 p-1.5 space-y-1.5">
                                <div className="h-1.5 w-6 bg-purple-200 rounded-full" />
                                <div className="h-1.5 w-10 bg-purple-50 rounded-full" />
                            </div>
                            <div className="flex-1 p-2 space-y-2">
                                <div className="h-2 w-20 bg-purple-100 rounded-full" />
                                <div className="h-12 w-full bg-white rounded-xl border border-purple-100 shadow-sm" />
                            </div>
                        </div>
                    </div>
                </ThemeCard>

                {/* System Theme */}
                <ThemeCard
                    value="system"
                    label="System"
                    icon={Laptop}
                    isActive={theme === 'system'}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-900 flex items-center justify-center">
                        <div className="bg-background/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-border/50">
                            <Monitor className="h-6 w-6 text-foreground" />
                        </div>
                    </div>
                </ThemeCard>

            </RadioGroup>
        </div>
    )
}

function ThemeCard({
    value,
    label,
    icon: Icon,
    children,
    isActive,
    className
}: {
    value: string,
    label: string,
    icon: any,
    children: React.ReactNode,
    isActive?: boolean,
    className?: string
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={`theme-${value}`} className="cursor-pointer group block">
                <RadioGroupItem value={value} id={`theme-${value}`} className="sr-only" />
                <div className={cn(
                    "relative overflow-hidden w-full aspect-[16/10] rounded-xl border-2 transition-all duration-200",
                    isActive
                        ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                        : "border-muted hover:border-muted-foreground/50 hover:shadow-md",
                    className
                )}>
                    {children}

                    {/* Active Checkmark Badge could go here if nice, but ring is usually enough */}
                </div>
                <div className="flex items-center justify-between pt-3 px-1">
                    <span className={cn(
                        "font-medium transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        {label}
                    </span>
                    <Icon className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                </div>
            </Label>
        </div>
    )
}
