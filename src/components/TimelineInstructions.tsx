import FiberManualRecord from '@mui/icons-material/FiberManualRecord'
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
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
    <List disablePadding>
      {timeline.map((t, i) => {
        const { line, duration } = formatRange(t.start, t.end, logTimezone)
        return (
          <ListItem key={`${t.start}-${i}`} sx={{ py: 1.25, px: 0, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ minWidth: 32, mt: 0.35 }}>
              <FiberManualRecord sx={{ fontSize: 12, color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {dutyWord(t.duty)}
                    <Typography component="span" variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {' '}
                      — {humanLabel(t.label)}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
                    color="text.primary"
                  >
                    {line}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {' '}
                      ({duration})
                    </Typography>
                  </Typography>
                  {typeof t.distance_m === 'number' && t.duty === 'D' ? (
                    <Typography variant="caption" color="secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                      {(t.distance_m / 1609.34).toFixed(1)} mi this slice
                    </Typography>
                  ) : null}
                </Box>
              }
            />
          </ListItem>
        )
      })}
    </List>
  )
}
