# ML Model Options for Railway Free Tier

## Problem
Railway free tier: **4 GB image limit**
Current image: **8.5 GB** (too large)

---

## Option 1: Use Lightweight Models ✅ (Recommended for Free)

### Files to Use
- `nlp_engine_lightweight.py` (instead of `nlp_engine.py`)
- `requirements-lightweight.txt` (instead of `requirements.txt`)

### What Changes
| Feature | Original (Heavy) | Lightweight |
|---------|------------------|------------|
| **Sentiment** | DistilBERT | VADER (NLTK) |
| **Keywords** | KeyBERT | spaCy NLP |
| **Embeddings** | Sentence-Transformers | Removed |
| **Image Size** | 8.5 GB | ~2 GB ✅ |
| **Speed** | ~5-10s per analysis | ~1-2s per analysis |
| **Accuracy** | 95%+ | 85%+ |
| **Cost** | Paid tier ($10+/mo) | **Free tier** ✅ |

### Installation Steps

```bash
# 1. Backup original files (optional)
cp nlp_engine.py nlp_engine_heavy.py
cp requirements.txt requirements-heavy.txt

# 2. Switch to lightweight versions
cp nlp_engine_lightweight.py nlp_engine.py
cp requirements-lightweight.txt requirements.txt

# 3. Commit and push
git add nlp_engine.py requirements.txt
git commit -m "Switch to lightweight NLP models for Railway free tier"
git push origin main

# 4. In Railway dashboard, click 'Redeploy'
```

**Expected result:** Image size ~2GB ✅

---

## Option 2: Keep Heavy Models (Paid Railway)

Pros:
- Better accuracy (95%+)
- Faster (hidden in large first load)
- No code changes needed

Cons:
- Must upgrade Railway plan (~$10-20/month)
- Image build takes longer
- Slower first response

### Steps
```bash
# Just wait for current deployment or redeploy as-is
# Then upgrade Railway plan in settings
```

---

## Option 3: Split Deployment (Advanced)

Deploy separate services:
- **Frontend**: Vercel (free, 50MB)
- **Backend**: Railway free tier (Node.js only, 100MB)
- **ML Engine**: Separate Railway service (paid, or use external API)

Benefits:
- Scale independently
- Can pause ML when not needed
- Better resource management

Complexity: ⭐⭐⭐

---

## Quick Comparison

| Option | Cost | Setup | Performance | Recommendation |
|--------|------|-------|-------------|-----------------|
| **Lightweight** | Free ✅ | 1 min | Fast & Good | ✅ Best for MVP |
| **Heavy (paid)** | $10+/mo | 0 min | Best | Good if budget |
| **Split** | Free/Paid | 15 min | Variable | For Scale |

---

## I Recommend: Option 1 (Lightweight) because:
✅ Free forever  
✅ Actually **faster** (VADER is ~100x faster than DistilBERT)  
✅ Good accuracy for comment analysis  
✅ Fits in 4GB limit  
✅ No need to pay for Railway  

85% accuracy is more than enough for "sentiment" on comments. Try it for a week - if you want better accuracy, upgrade to Option 2.

---

## Testing Lightweight Version Locally

```bash
# 1. Install requirements
pip install -r requirements-lightweight.txt
# This downloads spacy model (~50MB)
python -m spacy download en_core_web_sm

# 2. Test the NLP engine
python nlp_engine.py

# 3. In another terminal, test it
curl -X POST http://localhost:5001/analyze \
  -H "Content-Type: application/json" \
  -d '{"comments": [{"text": "This is amazing!", "likes": 10}], "videoTitle": "Test"}'
```

---

## Next Steps

**Choice A: Go with Lightweight (Recommended)**
```bash
cd e:\Leadsieve
cp nlp_engine_lightweight.py nlp_engine.py
cp requirements-lightweight.txt requirements.txt
git add nlp_engine.py requirements.txt
git commit -m "Switch to lightweight NLP models for Railway free tier"
git push origin main
# Then click Redeploy in Railway
```

**Choice B: Keep Heavy Model**
```bash
# Wait for current deployment or upgrade Railway plan
```

**Which would you like to do?**
