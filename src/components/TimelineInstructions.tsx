import type { TimelineEntry } from '../types/tripPlan'

function formatRange(
  startIso: string,
  endIso: string,
  timeZone: string | undefined,
): { line: string; duration: string } {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: timeZone || 'UTC',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
  const s = new Date(startIso)
  const e = new Date(endIso)
  const fmt = new Intl.DateTimeFormat(undefined, opts)
  const durMin = Math.round((e.getTime() - s.getTime()) / 60000)
  const h = Math.floor(durMin / 60)
  const m = durMin % 60
  const duration = h > 0 ? `${h}h ${m}m` : `${m}m`
  return { line: `${fmt.format(s)} – ${fmt.format(e)}`, duration }
}

function humanLabel(label: string): string {
  if (label.startsWith('leg_') && label.endsWith('_drive')) {
    const n = label.match(/^leg_(\d+)_drive$/)?.[1]
    return n ? `Driving (segment ${Number(n) + 1})` : 'Driving'
  }
  return label.replace(/_/g, ' ')
}

function dutyWord(duty: string): string {
  switch (duty) {
    case 'D':
      return 'Driving'
    case 'ON':
      return 'On duty (not driving)'
    case 'OFF':
      return 'Off duty'
    case 'SB':
      return 'Sleeper berth'
    default:
      return duty
  }
}

type Props = {
  timeline: TimelineEntry[]
  logTimezone?: string
}

export function TimelineInstructions({ timeline, logTimezone }: Props) {
  return (
    <ul className="timeline-instructions">
      {timeline.map((t, i) => {
        const { line, duration } = formatRange(t.start, t.end, logTimezone)
        return (
          <li key={`${t.start}-${i}`}>
            <span className="ti-duty">{dutyWord(t.duty)}</span>
            <span className="ti-label"> — {humanLabel(t.label)}</span>
            <div className="ti-meta">
              {line}
              <span className="ti-dur"> ({duration})</span>
            </div>
            {typeof t.distance_m === 'number' && t.duty === 'D' ? (
              <div className="ti-dist">{(t.distance_m / 1609.34).toFixed(1)} mi this slice</div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
