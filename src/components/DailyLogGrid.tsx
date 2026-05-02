import { Typography } from '@mui/material'
import type { DailyLogDay, TimelineDuty } from '../types/tripPlan'

const ROW_LABELS = ['Off duty', 'Sleeper berth', 'Driving', 'On duty (not driving)'] as const

function dutyRow(duty: TimelineDuty): number {
  switch (duty) {
    case 'OFF':
      return 0
    case 'SB':
      return 1
    case 'D':
      return 2
    case 'ON':
      return 3
    default:
      return 0
  }
}

function dutySegClass(duty: TimelineDuty): string {
  switch (duty) {
    case 'OFF':
      return 'eld-seg--off'
    case 'SB':
      return 'eld-seg--sb'
    case 'D':
      return 'eld-seg--d'
    case 'ON':
      return 'eld-seg--on'
    default:
      return 'eld-seg--default'
  }
}

function clampDayMinute(m: number): number {
  return Math.max(0, Math.min(1440, m))
}

type DailyLogGridProps = {
  day: DailyLogDay
}

/** Single-day 24h grid (midnight–midnight) with four duty bands. */
export function DailyLogGrid({ day }: DailyLogGridProps) {
  const W = 920
  const leftLab = 108
  const topPad = 36
  const rowH = 40
  const bottomPad = 36
  const chartW = W - leftLab - 24
  const H = topPad + ROW_LABELS.length * rowH + bottomPad

  function xFromMinute(m: number): number {
    return leftLab + (clampDayMinute(m) / 1440) * chartW
  }

  const hours = Array.from({ length: 25 }, (_, h) => h)

  return (
    <figure className="daily-log-grid" style={{ margin: 0 }}>
      <Typography variant="subtitle2" component="figcaption" sx={{ mb: 1, fontWeight: 700 }}>
        Driver&apos;s daily log — {day.date}
      </Typography>
      <svg
        className="eld-svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        role="img"
        aria-label={`Electronic log grid for ${day.date}`}
      >
        <rect className="eld-chart-bg" x={0} y={0} width={W} height={H} />
        {ROW_LABELS.map((lab, row) => {
          const y = topPad + row * rowH
          return (
            <g key={lab}>
              <text className="eld-row-label" x={8} y={y + rowH / 2 + 4}>
                {lab}
              </text>
              <line className="eld-hline" x1={leftLab} y1={y} x2={W - 12} y2={y} />
            </g>
          )
        })}
        <line
          className="eld-hline"
          x1={leftLab}
          y1={topPad + ROW_LABELS.length * rowH}
          x2={W - 12}
          y2={topPad + ROW_LABELS.length * rowH}
        />
        <line className="eld-frame" x1={leftLab} y1={topPad} x2={leftLab} y2={topPad + ROW_LABELS.length * rowH} />
        <line
          className="eld-frame"
          x1={W - 12}
          y1={topPad}
          x2={W - 12}
          y2={topPad + ROW_LABELS.length * rowH}
        />
        {hours.map((h) => {
          const x = xFromMinute(h * 60)
          const label =
            h % 4 === 0 ? (h === 24 ? '24' : String(h).padStart(2, '0')) : ''
          return (
            <g key={`h-${h}`}>
              <line
                className={h % 6 === 0 ? 'eld-vline eld-vline--major' : 'eld-vline'}
                x1={x}
                y1={topPad}
                x2={x}
                y2={topPad + ROW_LABELS.length * rowH}
              />
              {label ? (
                <text className="eld-hour-label" x={x} y={H - 10} textAnchor="middle">
                  {label}
                </text>
              ) : null}
            </g>
          )
        })}
        {day.segments.map((seg, idx) => {
          const row = dutyRow(seg.duty)
          const y0 = topPad + row * rowH + 6
          const hBar = rowH - 12
          const x0 = xFromMinute(seg.start_minute_of_day)
          const x1 = xFromMinute(seg.end_minute_of_day)
          const xa = Math.min(x0, x1)
          const xb = Math.max(x0, x1)
          if (xb - xa < 0.25) return null
          return (
            <rect
              key={`${seg.start_local}-${idx}`}
              className={`eld-seg ${dutySegClass(seg.duty)}`}
              x={xa}
              y={y0}
              width={Math.max(xb - xa, 0.5)}
              height={hBar}
            />
          )
        })}
      </svg>
    </figure>
  )
}
