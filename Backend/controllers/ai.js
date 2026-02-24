/**
 * controllers/ai.js
 *
 * AI-powered natural language listing search.
 * Uses Google Gemini (aistudio.google.com) to parse the user's preference
 * into structured MongoDB filters, then returns matching listings.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Listing = require("../models/listing.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── System prompt ──
const SYSTEM_PROMPT = `
You are a travel listing search assistant for "Wanderlust", a platform where users find places to stay.
Your job is to read the user's natural language preference and extract structured search filters.

Available categories are EXACTLY: mountains, arctic, farms, deserts, beaches, cities, forests, lakes.

You MUST respond with ONLY a valid JSON object in this exact shape — no markdown blocks, no extra text:
{
  "category": "<one of the 8 categories above, or null if not specified>",
  "maxPrice": <number in INR per night, or null>,
  "minPrice": <number in INR per night, or null>,
  "locationKeyword": "<a city/country/region keyword to search for, or null>",
  "reason": "<one short sentence explaining what you understood from the user>"
}

Rules:
- If the user says "cheap" or "budget", set maxPrice to 3000
- If the user says "luxury" or "expensive", set minPrice to 15000
- If the user says "moderate" or "mid-range", maxPrice 10000
- Map synonyms: "snow/cold/polar" -> arctic, "sea/ocean/coast" -> beaches, "hill/peak/valley" -> mountains, "jungle/woods/rainforest" -> forests, "sand dunes/arid" -> deserts, "village/rural/countryside" -> farms, "urban/metro/downtown" -> cities, "river/reservoir" -> lakes
`.trim();

module.exports.aiSearch = async (req, res) => {
    const { query } = req.body;

    if (!query || !query.trim()) {
        return res.status(400).json({ error: "Please provide a search query." });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "AI search is not configured. Add GEMINI_API_KEY to your .env file." });
    }

    try {
        // ── Step 1: Ask Gemini to parse the query ──────────────────
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" } // Force JSON
        });

        const prompt = `${SYSTEM_PROMPT}\n\nUser query: "${query.trim()}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse result
        const filters = JSON.parse(responseText);

        // ── Step 2: Build MongoDB query from filters ──────────────
        const mongoQuery = {};

        if (filters.category && filters.category !== "null") {
            mongoQuery.category = filters.category;
        }

        if (filters.maxPrice || filters.minPrice) {
            mongoQuery.price = {};
            if (filters.maxPrice) mongoQuery.price.$lte = filters.maxPrice;
            if (filters.minPrice) mongoQuery.price.$gte = filters.minPrice;
        }

        if (filters.locationKeyword && filters.locationKeyword !== "null") {
            const rx = { $regex: filters.locationKeyword, $options: "i" };
            mongoQuery.$or = [{ location: rx }, { country: rx }, { title: rx }];
        }

        // ── Step 3: Query DB and respond ──────────────────────────
        const listings = await Listing.find(mongoQuery).limit(24).sort({ _id: -1 });

        res.json({
            listings,
            filters,
            totalFound: listings.length,
        });

    } catch (err) {
        console.error("Gemini AI error:", err);
        res.status(500).json({ error: "AI search service error. Please try again." });
    }
};
