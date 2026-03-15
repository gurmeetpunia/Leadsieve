export function calcScore(r) {
  const pos = r.sentiment?.positive || 0
  const praiseCount = (r.praises || []).filter(p => p !== 'No significant praises detected.').length
  const painCount = (r.painPoints || []).filter(p => p !== 'No significant pain points detected.').length
  const qCount = (r.topQuestions || []).filter(q => q !== 'No clear questions found in comments.').length
  return Math.min(100, Math.max(0, Math.round((pos * 0.55) + (praiseCount * 4) - (painCount * 3) + (qCount * 2))))
}

export function scoreLabel(s) {
  if (s >= 80) return { title: 'Thriving audience', sub: 'Highly engaged and positive' }
  if (s >= 60) return { title: 'Healthy signal', sub: 'Mostly positive with room to grow' }
  if (s >= 40) return { title: 'Mixed reception', sub: 'Balanced — address the pain points' }
  if (s >= 20) return { title: 'Needs attention', sub: 'Negative sentiment is dominant' }
  return { title: 'Critical signal', sub: 'Urgent issues in comments' }
}

export function scoreColor(s, theme) {
  if (s >= 60) return theme.colors.green
  if (s >= 40) return theme.colors.amber
  return theme.colors.red
}

export function formatDate() {
  return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}