import { useCallback, useState, type FormEvent } from 'react'
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
    <form className="trip-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Locations (WGS‑84)</legend>
        {(['current', 'pickup', 'dropoff'] as const).map((key) => (
          <div className="trip-form-row" key={key}>
            <span className="trip-form-label">{key}</span>
            <label>
              lat
              <input
                inputMode="decimal"
                value={String(body[key].lat)}
                onChange={(e) => setPoint(key, 'lat', e.target.value)}
              />
            </label>
            <label>
              lon
              <input
                inputMode="decimal"
                value={String(body[key].lon)}
                onChange={(e) => setPoint(key, 'lon', e.target.value)}
              />
            </label>
          </div>
        ))}
      </fieldset>
      <label className="trip-form-block">
        Cycle used (hours, 0–70)
        <input
          type="number"
          min={0}
          max={70}
          step={0.25}
          value={body.cycle_used_hours}
          onChange={(e) =>
            setBody((b) => ({ ...b, cycle_used_hours: Number(e.target.value) }))
          }
        />
      </label>
      <label className="trip-form-block">
        Trip start (ISO‑8601 UTC, optional)
        <input
          type="text"
          placeholder="2026-05-02T14:00:00Z"
          value={body.trip_start ?? ''}
          onChange={(e) => setBody((b) => ({ ...b, trip_start: e.target.value }))}
        />
      </label>
      <label className="trip-form-block">
        Log timezone (IANA, optional)
        <input
          type="text"
          placeholder="America/Chicago"
          value={body.log_timezone ?? ''}
          onChange={(e) => setBody((b) => ({ ...b, log_timezone: e.target.value }))}
        />
      </label>
      <button type="submit" className="trip-form-submit" disabled={loading}>
        {loading ? 'Planning…' : 'Plan trip'}
      </button>
    </form>
  )
}
