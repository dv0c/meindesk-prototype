
import { NextResponse } from "next/server"
import { model } from "@/lib/ai"
import { nanoid } from "nanoid"

// Define the recursive structure we ask the AI for
type AIComponent = {
    type: string
    props?: Record<string, any>
    children?: AIComponent[]
    content?: string // For Text nodes
}

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        const systemPrompt = `
        You are an expert web designer and developer. You are generating a component for a website builder.
        Your output must be a valid JSON object representing a hierarchical component tree.
        
        Available Components:
        - Container: props { flexDirection: 'row' | 'column', alignItems: 'center' | 'flex-start' | ..., justifyContent: ..., padding: ['10px', '10px', '10px', '10px'], background: string, width: string, height: string, gap: number }
        - Text: props { text: string, fontSize: number, color: string, textAlign: 'left' | 'center' | 'right', fontWeight: 'normal' | 'bold' }, content: string (same as props.text)
        - Button: props { text: string, variant: 'default' | 'outline' | 'ghost', size: 'default' | 'sm' | 'lg', background: string, color: string }
        - Image: props { src: string, alt: string, width: string, height: string }
        - Heading: props { text: string, tag: 'h1' | 'h2' | 'h3' | 'h4', fontSize: 32, textAlign: 'center' }
        - Grid: props { columns: 2 | 3 | 4, gap: 20 }
        - Divider: props { height: 1, color: '#e5e7eb' }
        - Spacer: props { height: 20 }

        Rules:
        1. Always return a single root object (usually a Container).
        2. Use "type" for component name.
        3. Use "props" for component properties.
        4. Use "children" array for nested components.
        5. For "Text" and "Heading", put the text content in "props.text".
        6. Do not include any markdown formatting or explanations, ONLY the JSON string.
        7. Use standard CSS values for colors (hex codes preferred) and spacing (px or %).
        8. Make sure the design is modern, professional, and visually appealing.
        9. If the user asks for a "Hero", "Section", or "Card", compose it using Containers, Text, Images, and Buttons.

        Example Output:
        {
            "type": "Container",
            "props": { "flexDirection": "column", "padding": ["40px","20px","40px","20px"], "background": "#f3f4f6", "alignItems": "center", "gap": 20 },
            "children": [
                { "type": "Heading", "props": { "text": "Welcome", "tag": "h1", "fontSize": 48 } },
                { "type": "Text", "props": { "text": "This is a subtext", "fontSize": 18, "color": "#4b5563" } },
                { "type": "Button", "props": { "text": "Get Started", "variant": "default", "background": "#000000", "color": "#ffffff" } }
            ]
        }
        `

        const result = await model.generateContent([
            systemPrompt,
            `User Prompt: ${prompt}`
        ])

        const responseText = result.response.text()

        // Clean up markdown code blocks if present
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim()

        let componentTree: AIComponent
        try {
            componentTree = JSON.parse(jsonString)
        } catch (e) {
            console.error("Failed to parse AI JSON", responseText)
            return NextResponse.json({ error: "Failed to generate valid JSON" }, { status: 500 })
        }

        // We will return the raw component tree so the client can use actions.addNodeTree
        // This is often easier than managing IDs on the server for insertion.

        return NextResponse.json({
            tree: componentTree
        })

    } catch (error) {
        console.error("AI Generation Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
