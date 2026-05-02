import { useCallback, useState, type FormEvent } from 'react'
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'
import type { TripPlanRequest } from '../types/tripPlan'

const defaultBody: TripPlanRequest = {
  current: { lat: 41.8781, lon: -87.6298 },
  pickup: { lat: 41.9, lon: -87.65 },
  dropoff: { lat: 39.7392, lon: -104.9903 },
  cycle_used_hours: 5,
  trip_start: '2026-05-02T14:00:00Z',
  log_timezone: 'America/Chicago',
}

type NumField = 'lat' | 'lon'

function parseNum(s: string): number {
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

type Props = {
  onSubmit: (body: TripPlanRequest) => void
  loading: boolean
}

export function TripPlannerForm({ onSubmit, loading }: Props) {
  const [body, setBody] = useState<TripPlanRequest>(defaultBody)

  const setPoint = useCallback(
    (key: 'current' | 'pickup' | 'dropoff', field: NumField, raw: string) => {
      const n = parseNum(raw)
      setBody((b) => ({
        ...b,
        [key]: { ...b[key], [field]: Number.isFinite(n) ? n : b[key][field] },
      }))
    },
    [],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trip_start = body.trip_start?.trim() || undefined
    const log_timezone = body.log_timezone?.trim() || undefined
    onSubmit({
      ...body,
      trip_start,
      log_timezone,
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 700 }}>
            Locations (WGS‑84)
          </Typography>
          <Stack spacing={1.5}>
            {(['current', 'pickup', 'dropoff'] as const).map((key) => (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  alignItems: { sm: 'flex-start' },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    minWidth: { sm: 72 },
                    pt: { sm: 1 },
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    color: 'text.primary',
                  }}
                >
                  {key}
                </Typography>
                <TextField
                  label="Latitude"
                  size="small"
                  type="text"
                  inputMode="decimal"
                  fullWidth
                  value={String(body[key].lat)}
                  onChange={(e) => setPoint(key, 'lat', e.target.value)}
                />
                <TextField
                  label="Longitude"
                  size="small"
                  type="text"
                  inputMode="decimal"
                  fullWidth
                  value={String(body[key].lon)}
                  onChange={(e) => setPoint(key, 'lon', e.target.value)}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        <TextField
          label="Cycle used (hours, 0–70)"
          type="number"
          size="small"
          fullWidth
          slotProps={{ htmlInput: { min: 0, max: 70, step: 0.25 } }}
          value={body.cycle_used_hours}
          onChange={(e) =>
            setBody((b) => ({ ...b, cycle_used_hours: Number(e.target.value) }))
          }
        />
        <TextField
          label="Trip start (ISO‑8601 UTC, optional)"
          size="small"
          fullWidth
          placeholder="2026-05-02T14:00:00Z"
          value={body.trip_start ?? ''}
          onChange={(e) => setBody((b) => ({ ...b, trip_start: e.target.value }))}
        />
        <TextField
          label="Log timezone (IANA, optional)"
          size="small"
          fullWidth
          placeholder="America/Chicago"
          value={body.log_timezone ?? ''}
          onChange={(e) => setBody((b) => ({ ...b, log_timezone: e.target.value }))}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
          {loading ? 'Planning…' : 'Plan trip'}
        </Button>
      </Stack>
    </Box>
  )
}
