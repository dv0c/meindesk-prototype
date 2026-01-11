import React, { useState } from "react"
import { useEditor, NodeTree } from "@craftjs/core"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AIComponent {
    type: string
    props?: Record<string, any>
    children?: AIComponent[]
    content?: string
}

export function AIGeneratorDialog() {
    const { actions, query, resolvers } = useEditor((state) => ({
        resolvers: state.options.resolver
    }))
    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch("/api/generate/component", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to generate")
            }

            const data = await response.json()
            const tree = data.tree

            if (tree) {
                // Convert AI JSON to React Element Tree
                try {
                    const reactElement = buildReactElement(tree, resolvers)

                    // Parse React Element to NodeTree using Craft's internal parser
                    const nodeTree = query.parseReactElement(reactElement).toNodeTree()

                    // Add to canvas
                    const selectedId = query.getEvent("selected").first()
                    const parentId = selectedId || "ROOT"

                    actions.addNodeTree(nodeTree, parentId)

                    toast.success("Component generated and added successfully!")
                    setOpen(false)
                    setPrompt("")
                } catch (buildError: any) {
                    console.error("Build Error:", buildError)
                    toast.error("Failed to construct component: " + buildError.message)
                }
            }

        } catch (error: any) {
            console.error("AI Error:", error)
            toast.error(error.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to convert AI Recursive Tree to React Element
    const buildReactElement = (node: AIComponent, resolvers: any): React.ReactElement => {
        if (!node) {
            console.error("AI Node is undefined")
            return React.createElement("div", { style: { color: 'red' } }, "AI Error: Missing Node")
        }

        if (!resolvers) {
            console.error("Craft Resolvers are undefined")
            throw new Error("Internal Editor Error: Resolvers not loaded")
        }

        const componentName = node.type
        if (!componentName) {
            return React.createElement("div", { style: { color: 'red' } }, "AI Error: Missing Component Type")
        }

        const Component = resolvers[componentName]

        if (!Component) {
            // Fallback for HTML tags if not in resolver, or error?
            // Craft resolvers usually include user components.
            // If AI returns "div", and "div" is not in resolver, Craft might handle it if it's a string, 
            // but if it's supposed to be a user component (e.g. Container), we fail.
            // Let's assume standard HTML tags are valid if passed as string to createElement.
            // But for registered components, we MUST use the resolved component.

            // If componentName starts with capital, it's likely a custom component -> Error if missing.
            // If lowercase, might be native.
            if (componentName[0] === componentName[0].toUpperCase()) {
                console.warn(`Component '${componentName}' not found in registry. Resolvers available:`, Object.keys(resolvers))
                // Fallback to Container if possible or div
                return React.createElement("div", { className: "p-4 border border-red-500 bg-red-50 text-red-500" }, `Missing Component: ${componentName}`)
            }
        }

        // Fix Props
        let props = node.props || {}
        if ((node.type === "Text" || node.type === "Heading") && node.content) {
            if (!props.text) {
                props = { ...props, text: node.content }
            }
        }

        const children = (node.children || []).map((child, idx) => {
            if (!child) return null;
            return React.cloneElement(buildReactElement(child, resolvers), { key: idx })
        }).filter(Boolean) as React.ReactElement[]

        // If Component is found in resolvers, use it. Otherwise use string (for html tags)
        return React.createElement(Component || componentName, props, ...children)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="gap-2 h-9 rounded-none border border-primary/20 bg-background/50 hover:bg-primary/5 text-primary uppercase text-[10px] tracking-widest font-bold px-4"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Build
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-2 border-primary/20 bg-background/95 backdrop-blur-3xl rounded-none shadow-2xl">
                <div className="p-6 border-b border-white/10 space-y-1">
                    <DialogTitle className="flex items-center gap-3 text-lg font-bold tracking-widest uppercase">
                        <div className="w-2 h-8 bg-primary" />
                        AI Construction
                    </DialogTitle>
                    <DialogDescription className="uppercase tracking-wider text-[10px] font-medium text-muted-foreground pl-5">
                        Generate components via Gemini Protocol
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Prompt Instruction</label>
                        <Textarea
                            placeholder="DESCRIBE COMPONENT STRUCTURE..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[120px] rounded-none border-2 border-primary/10 bg-muted/30 focus:border-primary/50 focus:ring-0 text-sm resize-none placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {/* Examples chips */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Quick Commands</label>
                        <div className="flex flex-wrap gap-2">
                            {["Hero Section", "Features Grid", "Newsletter Form", "Pricing Card"].map(ex => (
                                <button
                                    key={ex}
                                    onClick={() => setPrompt(prev => prev ? prev + " " + ex : ex)}
                                    className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t border-white/5 gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        className="rounded-none uppercase tracking-widest text-[10px] font-bold hover:bg-white/5"
                    >
                        Abort
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="gap-2 rounded-none uppercase tracking-widest text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3" />
                                Execute
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
