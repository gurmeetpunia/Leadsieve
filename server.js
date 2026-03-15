require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const { scrape, detectPlatform } = require("./scrapers");

const app = express();
app.use(cors());
app.use(express.json());
// Change this line:
app.use(express.static(path.join(__dirname, "public")));

async function analyzeWithNLP(comments, videoTitle) {
  const NLP_URL = process.env.NLP_ENGINE_URL || "http://localhost:5001";
  const res = await axios.post(`${NLP_URL}/analyze`, {
    comments,
    videoTitle,
  }, {
    headers: { "Content-Type": "application/json" },
    timeout: 600000,
  });
  return res.data;
}

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Please paste a URL to analyze." });
  }

  try {
    const { platform, title, comments } = await scrape(url, 500);

    if (!comments || comments.length === 0) {
      return res.status(400).json({ error: "No comments found. The post may be empty or private." });
    }

    const report = await analyzeWithNLP(comments, title);

    return res.json({
      success: true,
      platform,
      videoTitle: title,
      totalComments: comments.length,
      report,
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🚀 Leadsieve running at http://localhost:${PORT}\n`));