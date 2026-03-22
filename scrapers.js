const axios = require("axios");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

function truncate(arr, max = 500) {
  return arr.slice(0, max);
}

// ── YouTube — yt-dlp ──────────────────────────────────────────────────────────
async function scrapeYouTube(url, max = 500) {
  // Try multiple command variations for compatibility
  const commands = [
    `yt-dlp --write-comments --skip-download --dump-json --no-warnings --extractor-args "youtube:comment_sort=top" "${url}"`,
    `py -m yt_dlp --write-comments --skip-download --dump-json --no-warnings "${url}"`,
    `python -m yt_dlp --write-comments --skip-download --dump-json --no-warnings "${url}"`,
  ];

  let stdout = null;
  let lastError = null;

  for (const cmd of commands) {
    try {
      const result = await execPromise(cmd, {
        maxBuffer: 50 * 1024 * 1024,
        timeout: 90000,
      });
      stdout = result.stdout;
      break;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  if (!stdout) {
    throw new Error(
      `yt-dlp failed. Fix: open terminal and run "pip install -U yt-dlp" then try again. Raw error: ${lastError?.message?.slice(0, 200)}`
    );
  }

  // yt-dlp may output multiple JSON lines — take the first valid one
  let data = null;
  for (const line of stdout.trim().split("\n")) {
    try {
      data = JSON.parse(line);
      if (data.title) break;
    } catch (_) {}
  }

  if (!data) throw new Error("yt-dlp returned no parseable data.");

  const title = data.title || "YouTube Video";
  const rawComments = data.comments || [];

  const comments = truncate(
    rawComments
      .filter(c => c.text?.trim())
      .map(c => ({
        text: c.text,
        likes: c.like_count || 0,
        author: c.author || "",
      })),
    max
  );

  // If yt-dlp got video info but 0 comments, comments may be disabled
  if (comments.length === 0) {
    throw new Error("No comments found. Comments may be disabled on this video, or yt-dlp needs updating. Run: pip install -U yt-dlp");
  }

  return { title, comments };
}

// ── Reddit ────────────────────────────────────────────────────────────────────
async function scrapeReddit(url, max = 500) {
  const jsonUrl = url.replace(/\/?(\?.*)?$/, ".json$1");
  const res = await axios.get(jsonUrl, {
    headers: { ...HEADERS, Accept: "application/json" },
    params: { limit: 500, depth: 3 },
  });

  const postData = res.data[0]?.data?.children?.[0]?.data;
  const title = postData?.title || "Reddit Post";
  const commentsData = res.data[1]?.data?.children || [];

  function extractComments(children, result = []) {
    for (const child of children) {
      const d = child.data;
      if (child.kind === "t1" && d.body && d.body !== "[deleted]" && d.body !== "[removed]") {
        result.push({ text: d.body, likes: d.score || 0, author: d.author || "" });
        if (d.replies?.data?.children) extractComments(d.replies.data.children, result);
      }
    }
    return result;
  }

  return { title, comments: truncate(extractComments(commentsData), max) };
}

// ── Play Store ────────────────────────────────────────────────────────────────
async function scrapePlayStore(url, max = 500) {
  const match = url.match(/id=([a-zA-Z0-9_.]+)/);
  if (!match) throw new Error("Invalid Play Store URL. Example: https://play.google.com/store/apps/details?id=com.example.app");
  const appId = match[1];

  const cmd = `node -e "
    const gplay = require('google-play-scraper');
    Promise.all([
      gplay.app({ appId: '${appId}', lang: 'en' }),
      gplay.reviews({ appId: '${appId}', lang: 'en', country: 'in', num: 500, sort: gplay.sort.HELPFULNESS })
    ]).then(([info, data]) => {
      console.log(JSON.stringify({ title: info.title, reviews: data.data }));
    }).catch(e => { console.error(e.message); process.exit(1); });
  "`;

  const { stdout } = await execPromise(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 30000 });
  const parsed = JSON.parse(stdout.trim());

  return {
    title: parsed.title || "Play Store App",
    comments: truncate(
      (parsed.reviews || [])
        .filter(r => r.text?.trim())
        .map(r => ({ text: r.text, likes: r.thumbsUp || 0, author: r.userName || "", rating: r.score })),
      max
    ),
  };
}

// ── App Store ─────────────────────────────────────────────────────────────────
async function scrapeAppStore(url, max = 500) {
  const match = url.match(/id(\d+)/);
  if (!match) throw new Error("Invalid App Store URL. Example: https://apps.apple.com/app/id123456789");
  const appId = match[1];

  const cmd = `node -e "
    const store = require('app-store-scraper');
    Promise.all([
      store.app({ id: '${appId}', country: 'in' }),
      store.reviews({ id: '${appId}', country: 'in', page: 1, sort: store.sort.HELPFUL })
    ]).then(([info, reviews]) => {
      console.log(JSON.stringify({ title: info.title, reviews }));
    }).catch(e => { console.error(e.message); process.exit(1); });
  "`;

  const { stdout } = await execPromise(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 30000 });
  const parsed = JSON.parse(stdout.trim());

  return {
    title: parsed.title || "App Store App",
    comments: truncate(
      (parsed.reviews || [])
        .filter(r => r.text?.trim())
        .map(r => ({ text: r.text, likes: 0, author: r.userName || "", rating: r.score })),
      max
    ),
  };
}

// ── Kick ──────────────────────────────────────────────────────────────────────
async function scrapeKick(url, max = 500) {
  const channelMatch = url.match(/kick\.com\/([^/?#]+)/);
  if (!channelMatch) throw new Error("Invalid Kick URL.");
  const channel = channelMatch[1];

  const infoRes = await axios.get(`https://kick.com/api/v2/channels/${channel}`, { headers: HEADERS });
  const title = infoRes.data?.user?.username ? `${infoRes.data.user.username}'s Kick Channel` : "Kick Channel";

  const clipsRes = await axios.get(`https://kick.com/api/v2/channels/${channel}/clips`, {
    headers: HEADERS, params: { page: 1, clip_type: 1 },
  });

  const comments = [];
  for (const clip of (clipsRes.data?.clips || []).slice(0, 5)) {
    const clipRes = await axios.get(`https://kick.com/api/v2/clips/${clip.clip_id}`, { headers: HEADERS }).catch(() => null);
    if (clipRes?.data?.clip?.comments) {
      for (const c of clipRes.data.clip.comments) {
        comments.push({ text: c.content || "", likes: c.liked_by_count || 0, author: c.user?.username || "" });
      }
    }
    if (comments.length >= max) break;
  }

  return { title, comments: truncate(comments.filter(c => c.text.trim()), max) };
}

// ── Platform detector ─────────────────────────────────────────────────────────
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/reddit\.com/.test(url))            return "reddit";
  if (/play\.google\.com/.test(url))      return "playstore";
  if (/apps\.apple\.com/.test(url))       return "appstore";
  if (/kick\.com/.test(url))              return "kick";
  if (/linkedin\.com/.test(url))          return "linkedin";
  if (/instagram\.com/.test(url))         return "instagram";
  return "unknown";
}

async function scrape(url, max = 500) {
  const platform = detectPlatform(url);
  switch (platform) {
    case "youtube":   return { platform, ...(await scrapeYouTube(url, max)) };
    case "reddit":    return { platform, ...(await scrapeReddit(url, max)) };
    case "playstore": return { platform, ...(await scrapePlayStore(url, max)) };
    case "appstore":  return { platform, ...(await scrapeAppStore(url, max)) };
    case "kick":      return { platform, ...(await scrapeKick(url, max)) };
    case "linkedin":
    case "instagram": throw new Error(`${platform} scraping coming soon — requires login flow.`);
    default: throw new Error("Unsupported platform. Paste a YouTube, Reddit, Play Store, App Store, or Kick URL.");
  }
}

module.exports = { scrape, detectPlatform };