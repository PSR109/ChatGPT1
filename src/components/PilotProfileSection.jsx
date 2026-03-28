import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildPilotProfileData } from '../utils/pilotProfileUtils'
import { buildCenteredTableStyles } from '../utils/tableStyles'

function MetricCard({ label, value, strong = false }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: '16px 14px',
        textAlign: 'center',
        background: strong ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
        border: strong ? '1px solid rgba(96,165,250,0.24)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.62)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{value || '-'}</div>
    </div>
  )
}

function SmallInfoCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 16,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.58)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.4 }}>{value || '-'}</div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, marginTop: 4, marginBottom: 4 }}>
      {children}
    </div>
  )
}

export default function PilotProfileSection({
  lapTimes = [],
  bookings = [],
  pointsLeaderboard = [],
  normalizeText = (value) => String(value || '').trim(),
  formatDateChile = (value) => value || '-',
  card,
  sectionTitle,
  formGrid,
  input,
  line,
  tableWrap,
  table,
  th,
  td,
}) {
  const [search, setSearch] = useState('')
  const [selectedPilot, setSelectedPilot] = useState('')

  const pilotOptions = useMemo(() => {
    const names = new Set()

    ;(lapTimes || []).forEach((row) => {
      const value = normalizeText(row?.player)
      if (value) names.add(value)
    })

    ;(bookings || []).forEach((row) => {
      const value = normalizeText(row?.client)
      if (value) names.add(value)
    })

    ;(pointsLeaderboard || []).forEach((row) => {
      const value = normalizeText(row?.player)
      if (value) names.add(value)
    })

    return [...names].sort((a, b) => a.localeCompare(b))
  }, [lapTimes, bookings, pointsLeaderboard, normalizeText])

  const filteredOptions = useMemo(() => {
    const term = normalizeText(search).toLowerCase()
    if (!term) return pilotOptions
    return pilotOptions.filter((pilot) => pilot.toLowerCase().includes(term))
  }, [pilotOptions, search, normalizeText])

  useEffect(() => {
    if (!selectedPilot && filteredOptions[0]) {
      setSelectedPilot(filteredOptions[0])
      return
    }

    if (selectedPilot && !filteredOptions.includes(selectedPilot)) {
      setSelectedPilot(filteredOptions[0] || '')
    }
  }, [selectedPilot, filteredOptions])

  const profile = useMemo(() => {
    if (!selectedPilot) {
      return {
        summary: {},
        bestRows: [],
        gameSummaryRows: [],
        historyRows: [],
        insights: [],
        recentSessions: [],
      }
    }

    try {
      return buildPilotProfileData({
        pilot: selectedPilot,
        lapTimes,
        bookings,
        pointsLeaderboard,
        formatDateChile,
        normalizeText,
      })
    } catch (error) {
      console.error('PilotProfileSection error:', error)
      return {
        summary: {},
        bestRows: [],
        gameSummaryRows: [],
        historyRows: [],
        insights: [],
        recentSessions: [],
      }
    }
  }, [selectedPilot, lapTimes, bookings, pointsLeaderboard, formatDateChile, normalizeText])

  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  const strongestGame = profile?.insights?.find((item) => item?.label === 'Juego más fuerte')?.value || '-'
  const trend = profile?.insights?.find((item) => item?.label === 'Tendencia reciente')?.value || '-'
  const activityGame = profile?.insights?.find((item) => item?.label === 'Juego con más actividad')?.value || '-'
  const nextFocusRow = profile?.bestRows?.find((row) => typeof row?.position === 'number' && row.position > 1)
  const nextFocus = nextFocusRow ? `${nextFocusRow.game} · ${nextFocusRow.track}` : 'Seguir mejorando sus mejores tiempos'

  return (
    <SectionCard title="👤 Perfil de piloto" card={card} sectionTitle={sectionTitle}>
      {pilotOptions.length === 0 ? (
        <CenteredMessage text="Aún no hay datos suficientes para mostrar perfiles" line={line} />
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ ...formGrid, marginBottom: 2 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="BUSCAR PILOTO"
              style={input}
            />

            <select value={selectedPilot} onChange={(e) => setSelectedPilot(e.target.value)} style={input}>
              {filteredOptions.map((pilot) => (
                <option key={pilot} value={pilot}>
                  {pilot}
                </option>
              ))}
            </select>
          </div>

          {!selectedPilot ? (
            <CenteredMessage text="No hay coincidencias para esa búsqueda" line={line} />
          ) : (
            <>
              <div
                style={{
                  borderRadius: 20,
                  padding: '22px 18px',
                  background: 'linear-gradient(180deg, rgba(19,28,59,0.96) 0%, rgba(10,18,41,0.96) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.58)',
                  }}
                >
                  Resumen rápido
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, marginTop: 10 }}>{selectedPilot}</div>
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.75)' }}>
                  Lo más importante del piloto, claro y fácil de leer.
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                }}
              >
                <MetricCard label="Puntos" value={profile?.summary?.points ?? 0} strong />
                <MetricCard label="Mejor tiempo" value={profile?.summary?.bestTime || '-'} />
                <MetricCard label="Victorias" value={profile?.summary?.wins ?? 0} />
                <MetricCard label="Registros" value={profile?.summary?.lapCount ?? 0} />
                <MetricCard label="Juegos" value={profile?.summary?.gamesCount ?? 0} />
                <MetricCard label="Reservas" value={profile?.summary?.bookingsCount ?? 0} />
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                }}
              >
                <SmallInfoCard label="Juego más fuerte" value={strongestGame} />
                <SmallInfoCard label="Juego con más actividad" value={activityGame} />
                <SmallInfoCard label="Tendencia actual" value={trend} />
                <SmallInfoCard label="Siguiente foco" value={nextFocus} />
              </div>

              <div style={{ ...line, margin: '2px 0' }} />

              <SectionLabel>Últimos resultados</SectionLabel>
              {profile?.recentSessions?.length ? (
                <div style={tableWrap}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={thCenter}>Fecha</th>
                        <th style={thCenter}>Juego</th>
                        <th style={thCenter}>Circuito</th>
                        <th style={thCenter}>Tiempo</th>
                        <th style={thCenter}>Gap líder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.recentSessions.slice(0, 8).map((row, index) => (
                        <tr key={`${row.game}-${row.track}-${row.time}-${index}`}>
                          <td style={tdCenter}>{row.createdLabel}</td>
                          <td style={tdCenter}>{row.game}</td>
                          <td style={tdCenter}>{row.track}</td>
                          <td style={tdCenter}>{row.time}</td>
                          <td style={tdCenter}>{row.gapVsLeader}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <CenteredMessage text="Todavía no hay resultados recientes para este piloto" line={line} />
              )}

              <SectionLabel>Dónde rinde mejor</SectionLabel>
              {profile?.bestRows?.length ? (
                <div style={tableWrap}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={thCenter}>Juego</th>
                        <th style={thCenter}>Circuito</th>
                        <th style={thCenter}>Auto</th>
                        <th style={thCenter}>Tiempo</th>
                        <th style={thCenter}>Posición</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.bestRows.slice(0, 8).map((row) => (
                        <tr key={`${row.game}-${row.track}`}>
                          <td style={tdCenter}>{row.game}</td>
                          <td style={tdCenter}>{row.track}</td>
                          <td style={tdCenter}>{row.car}</td>
                          <td style={tdCenter}>{row.time}</td>
                          <td style={tdCenter}>{row.position === '-' ? '-' : `#${row.position}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <CenteredMessage text="Este piloto aún no tiene tiempos comparables" line={line} />
              )}
            </>
          )}
        </div>
      )}
    </SectionCard>
  )
}
