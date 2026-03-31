import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildPilotProfileData } from '../utils/pilotProfileUtils'
import { buildCenteredTableStyles } from '../utils/tableStyles'

function MetricCard({ label, value, strong = false, compact = false }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: compact ? '14px 10px' : '16px 14px',
        textAlign: 'center',
        background: strong ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
        border: strong ? '1px solid rgba(96,165,250,0.24)' : '1px solid rgba(255,255,255,0.08)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: compact ? 11 : 12,
          color: 'rgba(255,255,255,0.62)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          overflowWrap: 'anywhere',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: compact ? 20 : 24, fontWeight: 900, marginTop: 8, lineHeight: 1.1 }}>{value || '-'}</div>
    </div>
  )
}

function SmallInfoCard({ label, value, compact = false }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: compact ? 14 : 16,
        textAlign: compact ? 'left' : 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.58)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          overflowWrap: 'anywhere',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.4, overflowWrap: 'anywhere' }}>{value || '-'}</div>
    </div>
  )
}

function SectionLabel({ children, compact = false }) {
  return (
    <div
      style={{
        textAlign: compact ? 'left' : 'center',
        fontSize: compact ? 18 : 20,
        fontWeight: 900,
        marginTop: 4,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

function MobileDataCard({ title, subtitle, rows, narrow = false }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: narrow ? 12 : 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        minWidth: 0,
      }}
    >
      {title ? <div style={{ fontWeight: 900, fontSize: narrow ? 14 : 15, marginBottom: subtitle ? 4 : 10, overflowWrap: 'anywhere', lineHeight: 1.25 }}>{title}</div> : null}
      {subtitle ? (
        <div
          style={{
            fontSize: narrow ? 11 : 12,
            color: 'rgba(255,255,255,0.62)',
            marginBottom: 10,
            overflowWrap: 'anywhere',
          }}
        >
          {subtitle}
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            style={{
              display: 'grid',
              gridTemplateColumns: narrow ? '78px 1fr' : '92px 1fr',
              gap: 10,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.58)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                overflowWrap: 'anywhere',
              }}
            >
              {row.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{row.value || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileList({ items, buildRows, getKey, getTitle, getSubtitle, narrow = false }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((item, index) => (
        <MobileDataCard
          key={getKey(item, index)}
          title={getTitle ? getTitle(item, index) : undefined}
          subtitle={getSubtitle ? getSubtitle(item, index) : undefined}
          rows={buildRows(item, index)}
          narrow={narrow}
        />
      ))}
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
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 720
  })
  const [isNarrow, setIsNarrow] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 380
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onResize = () => {
      setIsCompact(window.innerWidth <= 720)
      setIsNarrow(window.innerWidth <= 380)
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
        <div style={{ display: 'grid', gap: isCompact ? 16 : 18 }}>
          <div
            style={{
              display: 'grid',
              gap: isCompact ? 8 : 12,
              gridTemplateColumns: isCompact ? '1fr' : formGrid?.gridTemplateColumns,
              marginBottom: 2,
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar piloto"
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
                  padding: isCompact ? '16px 14px' : '22px 18px',
                  background: 'linear-gradient(180deg, rgba(19,28,59,0.96) 0%, rgba(10,18,41,0.96) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: isCompact ? 'left' : 'center',
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
                  Vista rápida
                </div>
                <div style={{ fontSize: isCompact ? (isNarrow ? 22 : 24) : 34, fontWeight: 900, marginTop: 10, lineHeight: 1.05, overflowWrap: 'anywhere' }}>
                  {selectedPilot}
                </div>
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.75)', fontSize: isCompact ? 14 : 16, lineHeight: 1.35, maxWidth: isCompact ? '100%' : 740, marginInline: isCompact ? 0 : 'auto' }}>
                  Rendimiento, actividad y dónde tiene más margen para bajar tiempos.
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: isCompact ? (isNarrow ? '1fr' : 'repeat(2, minmax(0, 1fr))') : 'repeat(auto-fit, minmax(160px, 1fr))',
                }}
              >
                <MetricCard label="Puntos" value={profile?.summary?.points ?? 0} strong compact={isCompact} />
                <MetricCard label="Mejor tiempo" value={profile?.summary?.bestTime || '-'} compact={isCompact} />
                <MetricCard label="Victorias" value={profile?.summary?.wins ?? 0} compact={isCompact} />
                <MetricCard label="Registros" value={profile?.summary?.lapCount ?? 0} compact={isCompact} />
                <MetricCard label="Juegos" value={profile?.summary?.gamesCount ?? 0} compact={isCompact} />
                <MetricCard label="Reservas" value={profile?.summary?.bookingsCount ?? 0} compact={isCompact} />
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                }}
              >
                <SmallInfoCard label="Juego más fuerte" value={strongestGame} compact={isCompact} />
                <SmallInfoCard label="Juego con más actividad" value={activityGame} compact={isCompact} />
                <SmallInfoCard label="Tendencia actual" value={trend} compact={isCompact} />
                <SmallInfoCard label="Siguiente foco" value={nextFocus} compact={isCompact} />
              </div>

              <div style={{ ...line, margin: '2px 0' }} />

              <SectionLabel compact={isCompact}>Últimos resultados</SectionLabel>
              {profile?.recentSessions?.length ? (
                isCompact ? (
                  <MobileList
                    items={profile.recentSessions.slice(0, 8)}
                    getKey={(row, index) => `${row.game}-${row.track}-${row.time}-${index}`}
                    getTitle={(row) => row.game}
                    getSubtitle={(row) => row.track}
                    buildRows={(row) => [
                      { label: 'Fecha', value: row.createdLabel },
                      { label: 'Tiempo', value: row.time },
                      { label: 'Gap líder', value: row.gapVsLeader },
                    ]}
                    narrow={isNarrow}
                  />
                ) : (
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
                )
              ) : (
                <CenteredMessage text="Todavía no hay resultados recientes para este piloto" line={line} />
              )}

              <SectionLabel compact={isCompact}>Dónde rinde mejor</SectionLabel>
              {profile?.bestRows?.length ? (
                isCompact ? (
                  <MobileList
                    items={profile.bestRows.slice(0, 8)}
                    getKey={(row) => `${row.game}-${row.track}`}
                    getTitle={(row) => row.game}
                    getSubtitle={(row) => row.track}
                    buildRows={(row) => [
                      { label: 'Auto', value: row.car },
                      { label: 'Tiempo', value: row.time },
                      { label: 'Posición', value: row.position === '-' ? '-' : `#${row.position}` },
                    ]}
                    narrow={isNarrow}
                  />
                ) : (
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
                )
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
