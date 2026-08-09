export function MetricCard({ label, value, note, accent = false }: { label: string; value: string | number; note: string; accent?: boolean }) {
  return <article className="metric-card"><span>{label}</span><strong className={accent ? 'metric-accent' : undefined}>{value}</strong><small>{note}</small></article>
}
