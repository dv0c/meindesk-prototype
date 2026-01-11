
import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY environment variable. AI features will not work.")
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy-key")

// Use the standard gemini-1.5-flash model
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
