const timelineItems = [
  ['00h', 'Checkout', 'Input compleet'],
  ['02h', 'Intake ontvangen', 'Design build'],
  ['24h', 'Eerste versie', 'Formulier actief'],
  ['48h', 'Live', 'Domein klaar'],
]

export function LaunchTimelineVisual() {
  return (
    <div className="launch-timeline-visual" aria-label="48-uurs launch-timeline">
      <div className="timeline-track" aria-hidden="true">
        <span />
      </div>
      <ol>
        {timelineItems.map(([time, title, status]) => (
          <li key={time}>
            <div className="timeline-node">
              <strong>{time}</strong>
            </div>
            <div className="timeline-copy">
              <span>{status}</span>
              <h3>{title}</h3>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
