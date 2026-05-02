import { useCallback, useEffect, useState } from 'react'
import { DailyLogGrid } from './components/DailyLogGrid'
import { TimelineInstructions } from './components/TimelineInstructions'
import { TripMap } from './components/TripMap'
import { TripPlannerForm } from './components/TripPlannerForm'
import { fetchTripPlanSchema, planTrip } from './lib/api'
import type { TripPlanRequest, TripPlanResponse, TripPlanSchemaResponse } from './types/tripPlan'
import './App.css'

function formatAssumptions(a: Record<string, unknown> | undefined): string {
  if (!a) return ''
  try {
    return JSON.stringify(a, null, 2)
  } catch {
    return String(a)
  }
}

export default function App() {
  const [schema, setSchema] = useState<TripPlanSchemaResponse | null>(null)
  const [schemaErr, setSchemaErr] = useState<string | null>(null)
  const [result, setResult] = useState<TripPlanResponse | null>(null)
  const [planErr, setPlanErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchTripPlanSchema()
      .then((s) => {
        if (!cancelled) setSchema(s)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setSchemaErr(e instanceof Error ? e.message : 'Could not load API schema')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const runPlan = useCallback(async (body: TripPlanRequest) => {
    setPlanErr(null)
    setLoading(true)
    try {
      const data = await planTrip(body)
      setResult(data)
    } catch (e: unknown) {
      setResult(null)
      setPlanErr(e instanceof Error ? e.message : 'Plan failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const distanceMi = result?.route?.distance_m != null ? result.route.distance_m / 1609.34 : null
  const driveHrs =
    result?.route?.duration_s != null ? result.route.duration_s / 3600 : null
  const simHrs = result?.summary?.simulated_trip_duration_hours

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <p className="app-eyebrow">HOS · routing · logs</p>
          <h1>Trip planner &amp; ELD logs</h1>
          <p className="app-lede">
            Enter coordinates and cycle hours; the API returns OSRM geometry, a duty timeline, and
            daily log grids. Basemap:{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
            .
          </p>
        </div>
      </header>

      <div className="app-grid">
        <aside className="app-aside">
          <div className="trip-side-card">
            <div className="trip-side-head">
              <p className="app-eyebrow">Trip inputs</p>
              <h2 className="trip-side-title">Plan a load</h2>
            </div>
            <TripPlannerForm onSubmit={runPlan} loading={loading} />
          </div>
          {schemaErr ? <p className="app-banner app-banner-warn">{schemaErr}</p> : null}
          {schema?.assumptions ? (
            <details className="schema-details">
              <summary>API assumptions (GET /api/trips/plan/)</summary>
              <pre>{formatAssumptions(schema.assumptions as Record<string, unknown>)}</pre>
            </details>
          ) : null}
          {planErr ? <p className="app-banner app-banner-err">{planErr}</p> : null}
        </aside>

        <main className="app-main">
          {result?.ok && result.route?.geometry ? (
            <>
              <section className="panel">
                <h2>Route map</h2>
                <TripMap geometry={result.route.geometry} stops={result.stops} />
                <ul className="route-stats">
                  {distanceMi != null ? (
                    <li>
                      <strong>Distance</strong> {distanceMi.toFixed(1)} mi (OSRM)
                    </li>
                  ) : null}
                  {driveHrs != null ? (
                    <li>
                      <strong>OSRM drive time</strong> {driveHrs.toFixed(2)} h
                    </li>
                  ) : null}
                  {simHrs != null ? (
                    <li>
                      <strong>Simulated trip (HOS)</strong> {simHrs.toFixed(2)} h
                    </li>
                  ) : null}
                  {result.summary?.trip_end_utc ? (
                    <li>
                      <strong>Trip end (UTC)</strong> {result.summary.trip_end_utc}
                    </li>
                  ) : null}
                </ul>
              </section>

              <section className="panel">
                <h2>Route instructions (duty timeline)</h2>
                <p className="panel-note">
                  Times shown in <code>{result.log_timezone || 'UTC'}</code> where applicable.
                </p>
                <TimelineInstructions
                  timeline={result.timeline}
                  logTimezone={result.log_timezone}
                />
              </section>

              <section className="panel print-logs">
                <h2>Daily log sheets</h2>
                <p className="panel-note">
                  One grid per calendar day in the driver&apos;s log timezone. Shaded bands match
                  duty status for that day.
                </p>
                <div className="daily-logs">
                  {result.daily_logs.map((day) => (
                    <DailyLogGrid key={day.date} day={day} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="app-placeholder">
              <div className="app-placeholder-icon" aria-hidden />
              <p>Submit the form to load the planned route, instructions, and log grids.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
