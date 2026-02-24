/**
 * controllers/ai.js
 *
 * AI-powered natural language listing search.
 * Uses Google Gemini 3 (gemini-3-flash-preview) via the @google/genai SDK.
 */

const { GoogleGenAI } = require("@google/genai");
const Listing = require("../models/listing.js");

// Client initialization
const getAIClient = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// ── System prompt ──
const SYSTEM_PROMPT = `
You are a travel listing search assistant for "Wanderlust".
Extract structured search filters from the user's natural language request.

Available categories: mountains, arctic, farms, deserts, beaches, cities, forests, lakes.

Respond with ONLY a JSON object:
{
  "category": "<category or null>",
  "maxPrice": <number or null>,
  "minPrice": <number or null>,
  "locationKeyword": "<city/country or null>",
  "reason": "<explain your understanding>"
}

Rules:
- "cheap/budget" -> maxPrice 3000
- "luxury/expensive" -> minPrice 15000
- "moderate" -> maxPrice 10000
- Map synonyms (e.g., "snow" -> arctic, "ocean" -> beaches).
`.trim();

module.exports.aiSearch = async (req, res) => {
    const { query } = req.body;

    if (!query || !query.trim()) {
        return res.status(400).json({ error: "Please provide a search query." });
    }

    const ai = getAIClient();
    if (!ai) {
        return res.status(500).json({ error: "AI search is not configured. GEMINI_API_KEY is missing." });
    }

    try {
        // ── Step 1: Generate structured filters using Gemini 3 ──
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser query: "${query.trim()}"` }]
            }],
            config: {
                responseMimeType: "application/json"
            }
        });

        const filters = JSON.parse(response.candidates[0].content.parts[0].text);

        // ── Step 2: Build MongoDB query ──
        const mongoQuery = {};

        if (filters.category && filters.category !== "null" && filters.category !== null) {
            mongoQuery.category = filters.category;
        }

        if (filters.maxPrice || filters.minPrice) {
            mongoQuery.price = {};
            if (filters.maxPrice) mongoQuery.price.$lte = filters.maxPrice;
            if (filters.minPrice) mongoQuery.price.$gte = filters.minPrice;
        }

        if (filters.locationKeyword && filters.locationKeyword !== "null" && filters.locationKeyword !== null) {
            const rx = { $regex: filters.locationKeyword, $options: "i" };
            mongoQuery.$or = [{ location: rx }, { country: rx }, { title: rx }];
        }

        // ── Step 3: Fetch listings ──
        const listings = await Listing.find(mongoQuery).limit(24).sort({ _id: -1 });

        res.json({
            listings,
            filters,
            totalFound: listings.length,
        });

    } catch (err) {
        console.error("❌ Gemini 3 AI error Details:", err);
        res.status(500).json({
            error: "AI search service error.",
            details: err.message
        });
    }
};
