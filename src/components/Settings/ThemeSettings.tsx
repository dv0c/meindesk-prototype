"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Laptop, Zap, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export function ThemeSettings() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of your workspace.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="theme-mode" className="flex flex-col space-y-1">
                        <span>Theme Preference</span>
                        <span className="font-normal text-muted-foreground">
                            Select your preferred theme style.
                        </span>
                    </Label>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Initialize Theme Sequencer</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Select Theme</DialogTitle>
                                <DialogDescription>
                                    Choose a theme for your workspace.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <RadioGroup
                                    defaultValue={theme}
                                    onValueChange={(value) => setTheme(value)}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="light"
                                            id="theme-light"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="theme-light"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Sun className="mb-3 h-6 w-6" />
                                            Minimal Light
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="dark"
                                            id="theme-dark"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="theme-dark"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Moon className="mb-3 h-6 w-6" />
                                            Minimal Dark
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="cyberpunk"
                                            id="theme-cyberpunk"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="theme-cyberpunk"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Zap className="mb-3 h-6 w-6" />
                                            Cyberpunk
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="modern"
                                            id="theme-modern"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="theme-modern"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Sparkles className="mb-3 h-6 w-6" />
                                            Modern
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}
