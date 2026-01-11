import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return NextResponse.json({ error: "No API Key" })

        const genAI = new GoogleGenerativeAI(apiKey)
        // Accessing the 'model' property in a correct way if possible, or just trying a list via SDK if exposed?
        // The SDK doesn't expose listModels directly on the main instance easily in all versions. 
        // Let's try to infer or just try to use a very basic model.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const data = await response.json()

        return NextResponse.json(data)

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
