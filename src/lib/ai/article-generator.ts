
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GeneratedArticle {
    title: string;
    markdownContent: string;
    metaTitle: string;
    metaDescription: string;
}

export async function generateArticle(tourUrl: string, topic: string): Promise<GeneratedArticle> {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are a professional SEO travel writer for https://greeceathenstransfers.gr 
— a premium private transfer and tour company in Greece.

Your task is to write a fully SEO-optimized blog article about the following tour/topic:
Tour URL: ${tourUrl}
Topic/Focus: ${topic}

CONTENT REQUIREMENTS

The article must follow this exact structure and style:

1. Meta Information
Meta Title (≤60 characters) – Include the tour name and a strong travel keyword.
Meta Description (≤160 characters) – Summarize the experience and mention “private transfers,” “local guides,” or “tickets included.”

2. H1 Title
Format: {Tour Name} – {Main Experience or Highlight}

3. Article Body (900–1200 words)
- Introduction (150–200 words): Introduce the tour. Emphasize comfort, expert guides. Include tour name and keyword.
- Section 1 – What’s Included / What You’ll See: Use clear H2 headings. Descriptive paragraphs.
- Section 2 – Why Choose This Tour: Highlight what makes it unique. Use bullet points.
- Section 3 – Practical Travel Tips: 4-6 tips.
- Section 4 – After the Tour / Nearby Experiences: Related attractions.
- Section 5 – Booking Call to Action: End with a CTA. Link text: "[Book your tour now](${tourUrl})".

4. SEO INSTRUCTIONS
Primary keyword: Exact tour name.
Natural keyword repetition.
Keep sentences short, clear, and friendly.

OUTPUT FORMAT (JSON)
Return the result strictly as a JSON object with the following keys:
- title: The H1 Title (string)
- markdownContent: The full article body in Markdown format, EXCLUDING the H1 title and Meta info. Start from Introduction. Use H2, H3, bold, lists. (string)
- metaTitle: The SEO Meta Title (string)
- metaDescription: The SEO Meta Description (string)

Do not include any code block markers (like \`\`\`json) in the response. Just the raw JSON string.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        // Clean up any potential markdown code blocks if the model includes them despite instructions
        const cleanedText = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        const data = JSON.parse(cleanedText);
        return data as GeneratedArticle;
    } catch (error) {
        console.error("Failed to parse AI response:", text);
        throw new Error("Failed to parse AI generated article");
    }
}
