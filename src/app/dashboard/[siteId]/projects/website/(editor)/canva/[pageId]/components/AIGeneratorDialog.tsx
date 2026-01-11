
import { useState } from "react"
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
    const { actions, query } = useEditor()
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
                // Convert AI Tree to Craft NodeTree
                const craftTree = convertToNodeTree(tree)

                // Add to canvas
                // If a container is selected, add to it. Otherwise add to ROOT.
                const selectedId = query.getEvent("selected").first()
                const parentId = selectedId || "ROOT"

                actions.addNodeTree(craftTree, parentId)

                toast.success("Component generated and added successfully!")
                setOpen(false)
                setPrompt("")
            }

        } catch (error: any) {
            console.error("AI Error:", error)
            toast.error(error.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to convert AI Recursive Tree to Craft NodeTree
    const convertToNodeTree = (node: AIComponent): NodeTree => {
        // If it's a Text node and has 'content' but no props.text, move content to props.text
        if (node.type === "Text" || node.type === "Heading") {
            if (node.content && (!node.props || !node.props.text)) {
                node.props = { ...node.props, text: node.content }
            }
        }

        const nodeTree: NodeTree = {
            data: {
                type: node.type,
                props: node.props || {}
            },
            children: (node.children || []).map(child => convertToNodeTree(child))
        }

        return nodeTree
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200/20 hover:border-indigo-300/30 text-indigo-600 dark:text-indigo-400"
                >
                    <Sparkles className="w-4 h-4" />
                    AI Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        AI Construction
                    </DialogTitle>
                    <DialogDescription>
                        Describe the component or section you want to build. The AI will generate it for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Textarea
                        placeholder="E.g., Create a 3-column pricing table with blue buttons, or a hero section with a large title..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[120px] text-base resize-none"
                    />

                    {/* Examples chips could go here */}
                    <div className="flex flex-wrap gap-2">
                        {["Hero Section", "Features Grid", "Newsletter Form", "Pricing Card"].map(ex => (
                            <button
                                key={ex}
                                onClick={() => setPrompt(prev => prev ? prev + " " + ex : ex)}
                                className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
