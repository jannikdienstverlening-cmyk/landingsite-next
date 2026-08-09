import type { ScoreClass } from '@/lib/lead-engine/types'

export function ScoreBadge({ score, scoreClass }: { score: number; scoreClass: ScoreClass }) {
  const tone = score >= 75 ? 'hot' : score >= 40 ? 'good' : 'low'
  return <div className={`score-badge ${tone}`} style={{ '--score': score } as React.CSSProperties} aria-label={`Opportunity score ${score} van 100, ${scoreClass.toLowerCase().replace('_', ' ')}`}>
    <span>{score}</span>
  </div>
}
