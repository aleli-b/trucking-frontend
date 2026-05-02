import { useEffect, useMemo } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import { Box, useTheme } from '@mui/material'
import type { GeoJSONLineString, TripStop } from '../types/tripPlan'
import { lineStringToLeafletLatLngs } from '../lib/coords'

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0]!, 9)
      return
    }
    const b = L.latLngBounds(positions)
    map.fitBounds(b, { padding: [40, 40], maxZoom: 12 })
  }, [map, positions])
  return null
}

function stopLabel(kind: string): string {
  switch (kind) {
    case 'current':
      return 'Current'
    case 'pickup':
      return 'Pickup'
    case 'dropoff':
      return 'Dropoff'
    case '30_min_break':
      return '30 min break'
    case '10_hour_reset':
      return '10 hr reset'
    case '34_hour_reset':
      return '34 hr restart'
    case 'fuel':
      return 'Fuel'
    default:
      return kind
  }
}

function stopStyle(kind: string): { color: string; fill: string; r: number } {
  switch (kind) {
    case 'current':
      return { color: '#1d4ed8', fill: '#3b82f6', r: 8 }
    case 'pickup':
      return { color: '#15803d', fill: '#22c55e', r: 9 }
    case 'dropoff':
      return { color: '#b91c1c', fill: '#ef4444', r: 9 }
    case '30_min_break':
      return { color: '#c2410c', fill: '#fb923c', r: 7 }
    case '10_hour_reset':
    case '34_hour_reset':
      return { color: '#6b21a8', fill: '#a855f7', r: 8 }
    case 'fuel':
      return { color: '#0f766e', fill: '#14b8a6', r: 7 }
    default:
      return { color: '#52525b', fill: '#a1a1aa', r: 6 }
  }
}

type TripMapProps = {
  geometry: GeoJSONLineString
  stops: TripStop[]
}

export function TripMap({ geometry, stops }: TripMapProps) {
  const theme = useTheme()
  const routeColor = theme.palette.primary.main

  const latLngs = useMemo(
    () => lineStringToLeafletLatLngs(geometry.coordinates),
    [geometry.coordinates],
  )
  const allPositions = useMemo(() => {
    const pts: [number, number][] = [...latLngs]
    for (const s of stops) pts.push([s.lat, s.lon])
    return pts
  }, [latLngs, stops])

  const center = latLngs[0] ?? [39.8283, -98.5795]

  return (
    <Box
      className="leaflet-map-panel no-print"
      sx={{
        height: { xs: 360, md: 480 },
        width: 1,
        borderRadius: 1,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={latLngs}
          pathOptions={{
            color: routeColor,
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        {stops.map((s, i) => {
          const st = stopStyle(s.kind)
          return (
            <CircleMarker
              key={`${s.kind}-${i}-${s.lat}-${s.lon}`}
              center={[s.lat, s.lon]}
              radius={st.r}
              pathOptions={{ color: st.color, fillColor: st.fill, fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <strong>{stopLabel(s.kind)}</strong>
                {s.start && s.end ? (
                  <div style={{ marginTop: 6, fontSize: 12 }}>
                    {new Date(s.start).toUTCString()}
                    <br />
                    → {new Date(s.end).toUTCString()}
                  </div>
                ) : null}
              </Popup>
            </CircleMarker>
          )
        })}
        <FitBounds positions={allPositions} />
      </MapContainer>
    </Box>
  )
}
