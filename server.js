require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function fetchWithYtDlp(url, maxComments = 500) {
  // Use yt-dlp to fetch video info + comments — no API key needed
  const cmd = `py -m yt_dlp --write-comments --skip-download --dump-json --no-warnings "${url}"`;
  const { stdout } = await execPromise(cmd, { maxBuffer: 50 * 1024 * 1024 });

  const data = JSON.parse(stdout.trim().split("\n")[0]);

  const title = data.title || "Unknown Video";
  const rawComments = data.comments || [];

  const comments = rawComments
    .filter(c => c.text && c.text.trim().length > 0)
    .slice(0, maxComments)
    .map(c => ({
      text: c.text,
      likes: c.like_count || 0,
      author: c.author || "Unknown",
    }));

  return { title, comments };
}

async function analyzeWithNLP(comments, videoTitle) {
  // Call our local Python NLP engine — no external AI API needed
  const NLP_URL = process.env.NLP_ENGINE_URL || "http://localhost:5001";

  const res = await axios.post(`${NLP_URL}/analyze`, {
    comments,
    videoTitle,
  }, {
    headers: { "Content-Type": "application/json" },
    timeout: 600000, // 10 min timeout — first run downloads models
  });

  return res.data;
}

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing required field: url" });
  }

  try {
    const { title: videoTitle, comments } = await fetchWithYtDlp(url, 500);

    if (comments.length === 0) return res.status(400).json({ error: "No comments found on this video." });

    const report = await analyzeWithNLP(comments, videoTitle);
    return res.json({ success: true, videoTitle, totalComments: comments.length, report });

  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    if (err.response?.status === 403) return res.status(403).json({ error: "Invalid API key or quota exceeded." });
    if (err instanceof SyntaxError) return res.status(500).json({ error: "AI returned malformed response. Try again." });
    return res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🚀 Leadsieve running at http://localhost:${PORT}\n`));