
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
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

Write a fully SEO-optimized blog article for the following tour page:
${tourUrl}

Topic Focus: ${topic}

CONTENT REQUIREMENTS

The article must follow this exact structure and style:

1. Meta Information

Meta Title (≤60 characters) – Include the tour name and a strong travel keyword.

Meta Description (≤160 characters) – Summarize the experience and mention “private transfers,” “local guides,” or “tickets included.”

2. H1 Title

Format:
{Tour Name} – {Main Experience or Highlight}
Example:
Athens by Night Tour – Discover the Magic of the City After Dark

3. Article Body (900–1200 words)
Introduction (150–200 words)

Introduce the tour as one of the best travel experiences in Greece.

Emphasize comfort, expert guides, and private transfers.

Naturally include the tour name and main keyword within the first 2 sentences.

Section 1 – What’s Included / What You’ll See

Use clear H2 or H3 headings for each stop, activity, or highlight.

Add descriptive paragraphs (80–120 words each).

Mention landmarks, villages, viewpoints, or activities related to the tour.

Example phrasing: “Explore the Acropolis and Parthenon,” “Visit the picturesque village of Oia,” “Enjoy a scenic drive along the Athenian Riviera.”

Section 2 – Why Choose This Tour

Highlight what makes this specific tour unique (private service, skip-the-line tickets, expert local drivers, flexible itinerary).

Use bullet points for clarity.

Naturally include related search terms such as Athens private tour, Santorini day trip, Greek sightseeing, custom transfers in Greece, etc.

Section 3 – Practical Travel Tips

Give 4–6 short, useful tips for visitors (what to wear, best time to visit, weather, footwear, hydration, etc.).

Add local context (“bring a hat for summer heat,” “go early to avoid crowds,” etc.).

Section 4 – After the Tour / Nearby Experiences

Suggest related attractions, restaurants, or tours.

Example: “After the tour, explore Plaka’s cafés or visit the Acropolis Museum.”

Include internal linking opportunities (example: “Check also our Athens by Night Tour
”).

Section 5 – Booking Call to Action

End with a 1-paragraph CTA encouraging readers to book through the official website.
Include the exact tour URL in markdown link format:
[Book your tour now](${tourUrl})
Mention: comfort, reliability, and professional local guides.

4. SEO INSTRUCTIONS

Primary keyword: Exact tour name (e.g. Athens and Acropolis Parthenon Half-Day Tour with Tickets).

Secondary keywords:

[City] private tour

[City] day trip

things to do in [City]

[City] sightseeing

Greece transfers

Naturally repeat the main keyword 6–8 times throughout the article.

Keep sentences short, clear, and friendly. Avoid keyword stuffing.

Use Markdown formatting (H2, H3, bold, bullet lists) for clean WordPress import.

5. Example Articles for Reference

Use these existing articles on the site as your stylistic and structural guide:

Athens and Acropolis Parthenon Half-Day Tour with Tickets

Athens by Night Tour

Santorini Tour – Discover Greece’s Most Iconic Island
 (example template only)

Tone & Style

Professional, clear, and travel-oriented.

Descriptive but natural (no exaggerated “clickbait” tone).

Should read like an official blog or brochure from a luxury transfer company.

Include local flavor — Greek locations, culture, and insider appeal.

Final Output Format

The output must be a ready-to-publish blog post with:

Markdown formatting

Meta title + description

Clear H1–H3 hierarchy

One main call-to-action link

IMPORTANT: OUTPUT FORMAT (JSON)
You must return the result strictly as a valid JSON object. Do not wrap it in markdown code blocks.
The JSON object must have this structure:
{
  "title": "The H1 Title string",
  "markdownContent": "The full article body in Markdown (Introduction to CTA), EXCLUDING H1 and Meta info.",
  "metaTitle": "The Meta Title string",
  "metaDescription": "The Meta Description string"
}
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        // 1. Log the raw text for debugging
        console.log("Gemini Raw Response:", text);

        // 2. More robust JSON extraction
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("No JSON object found in response");
        }

        const jsonString = text.substring(startIndex, endIndex + 1);
        const data = JSON.parse(jsonString);
        return data as GeneratedArticle;
    } catch (error) {
        console.error("Failed to parse AI response. Raw text:", text);
        throw new Error("Failed to parse AI generated article");
    }
}
