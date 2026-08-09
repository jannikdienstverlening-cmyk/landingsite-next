export function BarList({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map(({ value }) => value), 1)
  return <div className="bar-list">{items.map((item) => <div className="bar-row" key={item.label}><span>{item.label}</span><div className="bar-track"><i style={{ width: `${(item.value / max) * 100}%` }} /></div><strong>{item.value}</strong></div>)}</div>
}
