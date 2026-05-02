/** GeoJSON is [lon, lat]; Leaflet wants [lat, lon]. */
export function lineStringToLeafletLatLngs(
  coordinates: [number, number][],
  maxPoints = 2500,
): [number, number][] {
  if (coordinates.length <= maxPoints) {
    return coordinates.map(([lon, lat]) => [lat, lon] as [number, number])
  }
  const step = Math.ceil(coordinates.length / maxPoints)
  const out: [number, number][] = []
  for (let i = 0; i < coordinates.length; i += step) {
    const [lon, lat] = coordinates[i]!
    out.push([lat, lon])
  }
  const last = coordinates[coordinates.length - 1]!
  const tail: [number, number] = [last[1], last[0]]
  const prev = out[out.length - 1]
  if (!prev || prev[0] !== tail[0] || prev[1] !== tail[1]) out.push(tail)
  return out
}
