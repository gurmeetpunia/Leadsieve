"""
Leadsieve — Python NLP Engine
Runs as a Flask microservice on port 5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import Counter
import re

# ── Lazy-loaded models ────────────────────────────────────────────────────────
_sentiment_pipeline = None
_kw_model = None

def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        print("Loading sentiment model (first time — takes ~30 seconds)...")
        from transformers import pipeline as hf_pipeline   # fix: renamed to avoid shadowing
        _sentiment_pipeline = hf_pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            max_length=512,
            truncation=True,
            device=-1   # fix: explicit CPU — silences device warning
        )
        print("Sentiment model ready.")
    return _sentiment_pipeline

def get_kw_model():
    global _kw_model
    if _kw_model is None:
        print("Loading KeyBERT model...")
        from keybert import KeyBERT
        _kw_model = KeyBERT(model="all-MiniLM-L6-v2")
        print("KeyBERT ready.")
    return _kw_model

# fix: removed get_spacy() entirely — spaCy was loaded but never used in analyze()

# ── Text helpers ──────────────────────────────────────────────────────────────

def clean_text(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def is_question(text):
    text = text.strip()
    if text.endswith('?'):
        return True
    question_starters = (
        'what', 'why', 'how', 'when', 'where', 'who', 'which',
        'can you', 'could you', 'do you', 'is there', 'are there',
        'will you', 'please tell', 'anyone know'
    )
    return text.lower().startswith(question_starters)

def chunk_list(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]

# ── Core analysis ─────────────────────────────────────────────────────────────

def analyze_sentiment(comments):
    sent_pipeline = get_sentiment_pipeline()   # fix: renamed local var
    texts = [clean_text(c['text'])[:500] for c in comments]

    results = []
    for i, batch in enumerate(chunk_list(list(zip(comments, texts)), 32)):
        print(f"  Sentiment batch {i+1}...")
        batch_texts = [t for _, t in batch]
        batch_comments = [c for c, _ in batch]
        preds = sent_pipeline(batch_texts)
        for comment, pred in zip(batch_comments, preds):
            label = pred['label'].lower()
            if 'pos' in label:
                norm = 'positive'
            elif 'neg' in label:
                norm = 'negative'
            else:
                norm = 'neutral'
            results.append({
                'text': comment['text'],
                'likes': comment.get('likes', 0),
                'label': norm,
                'score': round(pred['score'], 3)
            })
    return results

def extract_themes(comments, top_n=6):
    kw_model = get_kw_model()
    combined = ' '.join([clean_text(c['text']) for c in comments[:300]])

    keywords = kw_model.extract_keywords(
        combined,
        keyphrase_ngram_range=(1, 3),
        stop_words='english',
        top_n=top_n * 2,
        diversity=0.6,
        use_mmr=True
    )

    themes = []
    seen = set()

    for kw, relevance in keywords:
        kw_lower = kw.lower()
        count = sum(1 for c in comments if kw_lower in clean_text(c['text']).lower())
        if count < 2:
            continue
        if any(kw_lower in s or s in kw_lower for s in seen):
            continue
        seen.add(kw_lower)

        sample_comments = [
            c['text'] for c in comments
            if kw_lower in clean_text(c['text']).lower()
        ][:3]

        themes.append({
            'theme': kw.title(),
            'count': count,
            'description': (
                f"Mentioned in {count} comments. Example: \"{sample_comments[0][:80]}...\""
                if sample_comments else f"Mentioned {count} times."
            ),
            'sentiment': 'neutral',
            'relevance': round(relevance, 3)
        })

        if len(themes) >= top_n:
            break

    return themes

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
CORS(app)   # fix: Flask-CORS 4.x works fine with just CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'leadsieve-nlp'})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    comments = data.get('comments', [])
    video_title = data.get('videoTitle', 'Unknown Video')

    if not comments:
        return jsonify({'error': 'No comments provided'}), 400

    print(f"\nAnalyzing {len(comments)} comments for: {video_title}")

    print("Step 1: Sentiment analysis...")
    sentiment_results = analyze_sentiment(comments)

    counts = Counter(r['label'] for r in sentiment_results)
    total = len(sentiment_results)
    sentiment_pct = {
        'positive': round(counts.get('positive', 0) / total * 100),
        'neutral':  round(counts.get('neutral', 0) / total * 100),
        'negative': round(counts.get('negative', 0) / total * 100),
    }

    print("Step 2: Theme extraction...")
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
    notable = get_notable_comments(sentiment_results)   # fix: removed unused `comments` arg

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
    print("\n🧠 Leadsieve NLP Engine starting on port 5001...")
    print("Models load on first request — be patient the first time.\n")
    app.run(port=5001, debug=False)