
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
        You are a world-class UI/UX Designer and Frontend Architect.
        Your goal is to generate **PREMIUM, MODERN, and HIGH-CONTRAST** components for a website builder.
        
        The user wants designs that feel "expensive", "stealthy", and "high-tech".
        
        ### Design Guidelines (STRICT):
        1. **Aesthetic**: Use a modern, minimalist dark-mode aesthetic by default unless requested otherwise.
           - Backgrounds: Use subtle gradients (e.g., 'linear-gradient(to bottom right, #09090b, #18181b)') or deep solid colors (#09090b).
           - Borders: Use thin, subtle borders (1px solid #27272a or rgba(255,255,255,0.08)).
           - Shadows: Use soft, large spread shadows for depth (e.g., '0 25px 50px -12px rgba(0, 0, 0, 0.5)').
           - Spacing: Be generous with padding (40px, 60px, 80px). Breathability = Premium.
        
        2. **Typography**:
           - Headings: Use 'props.textAlign: center' often for sections. Use 'props.fontSize' large (36, 48, 64).
           - Text: Use high-contrast text (#ffffff for headings, #a1a1aa for body).
        
        3. **Components Usage**:
           - **Container**: The core building block. Use it for sections, cards, and grids.
             - props: padding, background, gap, alignItems, justifyContent, borderRadius, border, minHeight.
           - **Text**: For body copy.
             - props: text, fontSize (14-18), color (#a1a1aa), lineHeight (1.6).
           - **Heading**: For titles.
             - props: text, tag (h1-h6), fontSize, color (#ffffff).
           - **Button**: Call to actions.
             - props: text, variant ('primary' | 'secondary' | 'outline' | 'ghost'), size ('sm'|'md'|'lg').
           - **Image**: Visuals.
             - props: src, alt, width, height, borderRadius.
        
        ### Output Format (JSON Only):
        Return a **single valid JSON object** representing the component tree.
        Node Structure:
        {
          "type": "Container" | "Text" | "Heading" | "Button" | "Image",
          "props": { ...style_properties },
          "children": [ ...child_nodes ]
        }
        
        ### Rules:
        1. **NO MARKDOWN**. Return raw JSON string only.
        2. **NO EXPLANATIONS**.
        3. Use standard CSS values for style props (padding: "40px", background: "#000000").
        4. Make it look beautiful. Like a landing page from 2026.
        
        Example Output:
                {
                    "type": "Container",
                    "props": { "flexDirection": "column", "padding": ["40px", "20px", "40px", "20px"], "background": "#f3f4f6", "alignItems": "center", "gap": 20 },
                    "children": [
                        { "type": "Heading", "props": { "text": "Welcome", "tag": "h1", "fontSize": 48 } },
                        { "type": "Text", "props": { "text": "This is a subtext", "fontSize": 18, "color": "#4b5563" } },
                        { "type": "Button", "props": { "text": "Get Started", "variant": "default", "background": "#000000", "color": "#ffffff" } }
                    ]
                }
        `

        let result;
        try {
            result = await model.generateContent([
                systemPrompt,
                `User Prompt: ${prompt} `
            ])
        } catch (genError: any) {
            console.error("Gemini Generation Error:", genError)

            // Check for common errors
            if (genError.message?.includes("404")) {
                return NextResponse.json({
                    error: "AI Model Not Found (404). This usually means your API Key is valid, but the project does not have access to the 'gemini-1.5-flash' model. Please ensuring you are using a key from Google AI Studio (aistudio.google.com) or that you have enabled the 'Generative Language API' in Google Cloud Console."
                }, { status: 500 })
            }
            if (genError.message?.includes("403") || genError.message?.includes("400")) {
                return NextResponse.json({
                    error: "Invalid API Key. Please check your .env file and valid key from aistudio.google.com."
                }, { status: 500 })
            }

            throw genError
        }

        const responseText = result.response.text()

        // Clean up markdown code blocks if present
        const jsonString = responseText.replace(/```json\s*/g, "").replace(/```/g, "").trim()

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
