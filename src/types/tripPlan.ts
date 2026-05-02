export type LatLon = { lat: number; lon: number }

export type TripPlanRequest = {
  current: LatLon
  pickup: LatLon
  dropoff: LatLon
  cycle_used_hours: number
  trip_start?: string
  log_timezone?: string
}

export type GeoJSONLineString = {
  type: 'LineString'
  coordinates: [number, number][]
}

export type RouteInfo = {
  distance_m: number
  duration_s: number
  geometry: GeoJSONLineString
}

export type StopKind =
  | 'current'
  | 'pickup'
  | 'dropoff'
  | '30_min_break'
  | '10_hour_reset'
  | '34_hour_reset'
  | 'fuel'
  | string

export type TripStop = {
  kind: StopKind
  lat: number
  lon: number
  start?: string
  end?: string
  duration_hours?: number
}

export type TimelineDuty = 'D' | 'ON' | 'OFF' | 'SB' | string

export type TimelineEntry = {
  duty: TimelineDuty
  start: string
  end: string
  label: string
  distance_m?: number
  distance_along_route_start_m?: number
  distance_along_route_end_m?: number
  lon_start?: number
  lat_start?: number
  lon_end?: number
  lat_end?: number
}

export type DailyLogSegment = {
  duty: TimelineDuty
  start_local: string
  end_local: string
  start_minute_of_day: number
  end_minute_of_day: number
}

export type DailyLogDay = {
  date: string
  segments: DailyLogSegment[]
}

export type TripPlanResponse = {
  ok: boolean
  assumptions?: Record<string, unknown>
  trip_start_utc?: string
  log_timezone?: string
  route: RouteInfo
  timeline: TimelineEntry[]
  stops: TripStop[]
  daily_logs: DailyLogDay[]
  summary?: {
    trip_end_utc?: string
    osrm_driving_duration_s?: number
    simulated_trip_duration_hours?: number
  }
}

export type TripPlanSchemaResponse = {
  endpoint?: string
  assumptions?: Record<string, unknown>
  body_schema?: Record<string, unknown>
}
