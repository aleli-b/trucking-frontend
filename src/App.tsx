import { useCallback, useEffect, useState } from 'react'
import ExpandMore from '@mui/icons-material/ExpandMore'
import MapOutlined from '@mui/icons-material/MapOutlined'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { DailyLogGrid } from './components/DailyLogGrid'
import { TimelineInstructions } from './components/TimelineInstructions'
import { TripMap } from './components/TripMap'
import { TripPlannerForm } from './components/TripPlannerForm'
import { fetchTripPlanSchema, planTrip } from './lib/api'
import type { TripPlanRequest, TripPlanResponse, TripPlanSchemaResponse } from './types/tripPlan'

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
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Card className="no-print" variant="outlined">
          <CardContent>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              HOS · routing · logs
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mt: 0.5, mb: 1, fontWeight: 700 }}>
              Trip planner &amp; ELD logs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '42rem' }}>
              Enter coordinates and cycle hours; the API returns OSRM geometry, a duty timeline, and
              daily log grids. Basemap:{' '}
              <Link
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                OpenStreetMap
              </Link>
              .
              Map data available under the Open Database License.
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }} className="no-print">
            <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>
              <CardContent>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                  Trip inputs
                </Typography>
                <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
                  Plan a load
                </Typography>
                <TripPlannerForm onSubmit={runPlan} loading={loading} />
                {schemaErr ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {schemaErr}
                  </Alert>
                ) : null}
                {schema?.assumptions ? (
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{ mt: 2, border: 1, borderColor: 'divider', borderRadius: 1, '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">API assumptions (GET /api/trips/plan/)</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          fontSize: '0.7rem',
                          lineHeight: 1.45,
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        {formatAssumptions(schema.assumptions as Record<string, unknown>)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : null}
                {planErr ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {planErr}
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            {result?.ok && result.route?.geometry ? (
              <Stack spacing={2.5}>
                <Card className="no-print" variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
                      Route map
                    </Typography>
                    <TripMap geometry={result.route.geometry} stops={result.stops} />
                    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {distanceMi != null ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Distance ${distanceMi.toFixed(1)} mi (OSRM)`}
                        />
                      ) : null}
                      {driveHrs != null ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`OSRM drive ${driveHrs.toFixed(2)} h`}
                        />
                      ) : null}
                      {simHrs != null ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          color="secondary"
                          label={`Simulated (HOS) ${simHrs.toFixed(2)} h`}
                        />
                      ) : null}
                      {result.summary?.trip_end_utc ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Trip end UTC ${result.summary.trip_end_utc}`}
                        />
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>

                <Card className="no-print" variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
                      Route instructions (duty timeline)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Times shown in{' '}
                      <Box component="code" sx={{ px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'action.hover', fontSize: '0.85em' }}>
                        {result.log_timezone || 'UTC'}
                      </Box>{' '}
                      where applicable.
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TimelineInstructions
                      timeline={result.timeline}
                      logTimezone={result.log_timezone}
                    />
                  </CardContent>
                </Card>

                <Box className="print-logs">
                  <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 700 }} className="no-print">
                    Daily log sheets
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} className="no-print">
                    One grid per calendar day in the driver&apos;s log timezone. Shaded bands match duty
                    status for that day.
                  </Typography>
                  <Stack spacing={2}>
                    {result.daily_logs.map((day) => (
                      <Card key={day.date} variant="outlined" className="print-logs">
                        <CardContent sx={{ py: 2 }}>
                          <DailyLogGrid day={day} />
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Card className="no-print" variant="outlined">
                <CardContent sx={{ py: 5, textAlign: 'center' }}>
                  <MapOutlined sx={{ fontSize: 56, color: 'action.active', mb: 1.5 }} />
                  <Typography color="text.secondary">
                    Submit the form to load the planned route, instructions, and log grids.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}
