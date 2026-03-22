"""
Leadsieve — Python NLP Engine (Lightweight Edition)
Total size: ~80MB vs previous 8GB
- VADER sentiment (built for social media — more accurate than DistilBERT for comments)
- TF-IDF theme extraction (sklearn — already a small dep)
- Zero torch, zero transformers, zero sentence-transformers
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import Counter
import re
import math

# ── Lazy-loaded models ────────────────────────────────────────────────────────
_vader = None
_tfidf = None

def get_vader():
    global _vader
    if _vader is None:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        _vader = SentimentIntensityAnalyzer()
        print("VADER ready.")
    return _vader

def get_tfidf():
    global _tfidf
    if _tfidf is None:
        from sklearn.feature_extraction.text import TfidfVectorizer
        _tfidf = TfidfVectorizer(
            ngram_range=(1, 3),
            stop_words='english',
            max_features=500,
            min_df=2,
        )
        print("TF-IDF ready.")
    return _tfidf

# ── Text helpers ──────────────────────────────────────────────────────────────

def clean_text(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^\w\s\?\!\.\,]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def is_question(text):
    text = text.strip()
    if text.endswith('?'):
        return True
    starters = (
        'what', 'why', 'how', 'when', 'where', 'who', 'which',
        'can you', 'could you', 'do you', 'is there', 'are there',
        'will you', 'please tell', 'anyone know'
    )
    return text.lower().startswith(starters)

def chunk_list(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]

# ── Core analysis ─────────────────────────────────────────────────────────────

def analyze_sentiment(comments):
    """
    VADER sentiment — purpose-built for social media text.
    Handles emojis, slang, caps, punctuation naturally.
    compound score: >= 0.05 = positive, <= -0.05 = negative, else neutral
    """
    analyzer = get_vader()
    results = []

    for comment in comments:
        text = clean_text(comment['text'])
        if not text:
            continue
        scores = analyzer.polarity_scores(text)
        compound = scores['compound']

        if compound >= 0.05:
            label = 'positive'
        elif compound <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'

        results.append({
            'text': comment['text'],
            'likes': comment.get('likes', 0),
            'label': label,
            'score': round(abs(compound), 3)
        })

    return results

def extract_themes(comments, top_n=6):
    """
    TF-IDF based theme extraction.
    Finds keyphrases that are statistically important across all comments.
    """
    vectorizer = get_tfidf()
    texts = [clean_text(c['text']) for c in comments if clean_text(c['text'])]

    if len(texts) < 3:
        return []

    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
        feature_names = vectorizer.get_feature_names_out()

        # Sum TF-IDF scores across all docs to find globally important terms
        scores = tfidf_matrix.sum(axis=0).A1
        term_scores = list(zip(feature_names, scores))
        term_scores.sort(key=lambda x: x[1], reverse=True)

        themes = []
        seen = set()

        for term, score in term_scores:
            term_lower = term.lower()

            # Skip very short or very common terms
            if len(term_lower) < 4:
                continue

            # Deduplicate overlapping phrases
            if any(term_lower in s or s in term_lower for s in seen):
                continue
            seen.add(term_lower)

            # Count how many comments contain this term
            count = sum(1 for t in texts if term_lower in t.lower())
            if count < 2:
                continue

            # Sample comments containing this theme
            sample = next(
                (c['text'] for c in comments if term_lower in clean_text(c['text']).lower()),
                None
            )

            themes.append({
                'theme': term.title(),
                'count': count,
                'description': (
                    f"Mentioned in {count} comments. Example: \"{sample[:80]}...\""
                    if sample else f"Mentioned in {count} comments."
                ),
                'sentiment': 'neutral',
                'relevance': round(float(score), 3)
            })

            if len(themes) >= top_n:
                break

        return themes

    except Exception as e:
        print(f"TF-IDF error: {e}")
        return []

def extract_questions(comments):
    questions = []
    for c in comments:
        text = clean_text(c['text'])
        if is_question(text) and len(text) > 15:
            questions.append({'text': text, 'likes': c.get('likes', 0)})

    questions.sort(key=lambda x: x['likes'], reverse=True)

    seen_starts = set()
    unique = []
    for q in questions:
        start = ' '.join(q['text'].lower().split()[:6])
        if start not in seen_starts:
            seen_starts.add(start)
            unique.append(q['text'])
        if len(unique) >= 5:
            break

    return unique if unique else ["No clear questions found in comments."]

def extract_pain_points(sentiment_results):
    negative = [
        r for r in sentiment_results
        if r['label'] == 'negative' and len(r['text']) > 20
    ]
    negative.sort(key=lambda x: (x['score'], x['likes']), reverse=True)

    pain_points = []
    seen = set()
    for r in negative:
        text = clean_text(r['text'])
        start = ' '.join(text.lower().split()[:5])
        if start not in seen:
            seen.add(start)
            pain_points.append(text[:120])
        if len(pain_points) >= 5:
            break

    return pain_points if pain_points else ["No significant pain points detected."]

def extract_praises(sentiment_results):
    positive = [
        r for r in sentiment_results
        if r['label'] == 'positive' and len(r['text']) > 20
    ]
    positive.sort(key=lambda x: (x['score'], x['likes']), reverse=True)

    praises = []
    seen = set()
    for r in positive:
        text = clean_text(r['text'])
        start = ' '.join(text.lower().split()[:5])
        if start not in seen:
            seen.add(start)
            praises.append(text[:120])
        if len(praises) >= 5:
            break

    return praises if praises else ["No significant praises detected."]

def generate_summary(sentiment_counts, themes, total):
    pos = sentiment_counts['positive']
    neg = sentiment_counts['negative']

    if pos > 60:
        overall = "overwhelmingly positive"
    elif pos > 40:
        overall = "mostly positive"
    elif neg > 40:
        overall = "largely negative"
    elif neg > 25:
        overall = "mixed with notable criticism"
    else:
        overall = "neutral"

    top_theme = themes[0]['theme'] if themes else "general discussion"
    second_theme = themes[1]['theme'] if len(themes) > 1 else None

    summary = f"Audience sentiment is {overall} across {total} analyzed comments. "
    summary += f"The dominant conversation theme is {top_theme}"
    if second_theme:
        summary += f", followed closely by {second_theme}"
    summary += f". Positive comments make up {pos}% of responses, with {neg}% expressing criticism."
    return summary

def generate_insights(themes, sentiment_counts, questions, pain_points):
    insights = []
    pos = sentiment_counts['positive']
    neg = sentiment_counts['negative']

    if pain_points and pain_points[0] != "No significant pain points detected.":
        insights.append({
            "action": f"Address the top complaint: \"{pain_points[0][:60]}...\"",
            "why": f"{neg}% of comments express negative sentiment — needs direct response.",
            "priority": "high" if neg > 25 else "medium"
        })

    if questions and questions[0] != "No clear questions found in comments.":
        insights.append({
            "action": f"Create content answering: \"{questions[0][:60]}\"",
            "why": "Top unanswered question — a dedicated post would drive engagement.",
            "priority": "high"
        })

    if themes:
        insights.append({
            "action": f"Double down on content about \"{themes[0]['theme']}\"",
            "why": f"Mentioned in {themes[0]['count']} comments — what your audience cares most about.",
            "priority": "medium"
        })

    if pos > 50:
        insights.append({
            "action": "Keep your current content style and format",
            "why": f"{pos}% positive sentiment — your audience is highly engaged.",
            "priority": "low"
        })

    return insights[:4]

def get_notable_comments(sentiment_results):
    notable = []
    seen_types = set()
    all_sorted = sorted(sentiment_results, key=lambda x: x['likes'], reverse=True)

    for r in all_sorted:
        if r['label'] not in seen_types and len(r['text']) > 20:
            seen_types.add(r['label'])
            notable.append({
                'text': clean_text(r['text'])[:100],
                'likes': r['likes'],
                'type': (
                    'praise' if r['label'] == 'positive'
                    else 'criticism' if r['label'] == 'negative'
                    else 'question'
                )
            })
        if len(notable) >= 3:
            break

    return notable

# ── Flask app ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'leadsieve-nlp', 'mode': 'lightweight'})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    comments = data.get('comments', [])
    video_title = data.get('videoTitle', 'Unknown Video')

    if not comments:
        return jsonify({'error': 'No comments provided'}), 400

    print(f"\nAnalyzing {len(comments)} comments for: {video_title}")

    print("Step 1: Sentiment analysis (VADER)...")
    sentiment_results = analyze_sentiment(comments)

    counts = Counter(r['label'] for r in sentiment_results)
    total = len(sentiment_results)
    sentiment_pct = {
        'positive': round(counts.get('positive', 0) / total * 100),
        'neutral':  round(counts.get('neutral', 0) / total * 100),
        'negative': round(counts.get('negative', 0) / total * 100),
    }

    print("Step 2: Theme extraction (TF-IDF)...")
    themes = extract_themes(comments, top_n=6)
    for theme in themes:
        matching = [
            r['label'] for r in sentiment_results
            if theme['theme'].lower() in clean_text(r['text']).lower()
        ]
        if matching:
            theme['sentiment'] = Counter(matching).most_common(1)[0][0]

    print("Step 3: Questions...")
    questions = extract_questions(comments)

    print("Step 4: Pain points and praises...")
    pain_points = extract_pain_points(sentiment_results)
    praises = extract_praises(sentiment_results)

    print("Step 5: Notable comments...")
    notable = get_notable_comments(sentiment_results)

    print("Step 6: Insights and summary...")
    insights = generate_insights(themes, sentiment_pct, questions, pain_points)
    summary = generate_summary(sentiment_pct, themes, total)

    report = {
        'summary': summary,
        'sentiment': sentiment_pct,
        'topThemes': themes,
        'topQuestions': questions[:5],
        'painPoints': pain_points[:5],
        'praises': praises[:5],
        'actionableInsights': insights,
        'notableComments': notable,
    }

    print("Analysis complete.\n")
    return jsonify(report)

if __name__ == '__main__':
    print("\n🧠 Leadsieve NLP Engine (Lightweight) starting on port 5001...")
    print("No model downloads needed — starts instantly.\n")
    app.run(port=5001, debug=False)