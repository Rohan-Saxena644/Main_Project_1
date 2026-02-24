const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const aiController = require("../controllers/ai.js");

// POST /api/ai/search
// Body: { query: "I want a peaceful mountain cabin under ₹5000" }
router.post("/search", wrapAsync(aiController.aiSearch));

module.exports = router;
