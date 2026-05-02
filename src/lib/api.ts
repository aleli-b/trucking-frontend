import type { TripPlanRequest, TripPlanResponse, TripPlanSchemaResponse } from '../types/tripPlan'

function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '')
  }
  return ''
}

export async function fetchTripPlanSchema(): Promise<TripPlanSchemaResponse> {
  const res = await fetch(`${apiBase()}/api/trips/plan/`)
  if (!res.ok) throw new Error(`Schema request failed (${res.status})`)
  return res.json() as Promise<TripPlanSchemaResponse>
}

export async function planTrip(body: TripPlanRequest): Promise<TripPlanResponse> {
  const res = await fetch(`${apiBase()}/api/trips/plan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Plan request failed (${res.status})`)
  }
  return res.json() as Promise<TripPlanResponse>
}
