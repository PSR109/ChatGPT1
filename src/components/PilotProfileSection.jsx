import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildPilotProfileData } from '../utils/pilotProfileUtils'
import { buildCenteredTableStyles } from '../utils/tableStyles'

function MetricCard({ label, value, strong = false, compact = false }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: compact ? '14px 12px' : '18px 16px',
        textAlign: 'center',
        background: strong
          ? 'linear-gradient(180deg, rgba(29,78,216,0.26) 0%, rgba(30,41,59,0.88) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
        border: strong ? '1px solid rgba(96,165,250,0.34)' : '1px solid rgba(255,255,255,0.09)',
        boxShadow: strong ? '0 12px 32px rgba(37,99,235,0.16)' : '0 10px 24px rgba(0,0,0,0.12)',
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: strong ? 'rgba(191,219,254,0.92)' : 'rgba(255,255,255,0.62)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.3,
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: compact ? 23 : 26,
          fontWeight: 900,
          marginTop: 8,
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          lineHeight: 1.1,
        }}
      >
        {value || '-'}
      </div>
    </div>
  )
}

function SmallInfoCard({ label, value, compact = false }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: compact ? 14 : 16,
        textAlign: compact ? 'left' : 'center',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.56)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.3,
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontWeight: 800,
          lineHeight: 1.35,
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          fontSize: compact ? 14 : 15,
        }}
      >
        {value || '-'}
      </div>
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
        marginTop: 6,
        marginBottom: 4,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  )
}

function MetaChip({ children, accent = false }) {
  return (
    <div
      style={{
        borderRadius: 999,
        padding: '7px 10px',
        background: accent ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)',
        border: accent ? '1px solid rgba(96,165,250,0.26)' : '1px solid rgba(255,255,255,0.08)',
        fontSize: 12,
        lineHeight: 1.2,
        minWidth: 0,
        maxWidth: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}

function HighlightCard({ item, compact = false }) {
  const toneMap = {
    positive: {
      background: 'linear-gradient(180deg, rgba(34,197,94,0.12), rgba(255,255,255,0.03))',
      border: '1px solid rgba(74,222,128,0.22)',
    },
    warning: {
      background: 'linear-gradient(180deg, rgba(250,204,21,0.12), rgba(255,255,255,0.03))',
      border: '1px solid rgba(250,204,21,0.22)',
    },
    neutral: {
      background: 'linear-gradient(180deg, rgba(59,130,246,0.12), rgba(255,255,255,0.03))',
      border: '1px solid rgba(96,165,250,0.22)',
    },
  }

  const tone = toneMap[item?.tone] || toneMap.neutral

  return (
    <div
      style={{
        ...tone,
        borderRadius: 18,
        padding: compact ? 14 : 16,
        minWidth: 0,
        boxSizing: 'border-box',
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72, fontWeight: 800 }}>
        {item?.title || 'Resumen'}
      </div>
      <div style={{ fontSize: compact ? 16 : 18, fontWeight: 900, lineHeight: 1.2, wordBreak: 'break-word' }}>{item?.value || '-'}</div>
      <div style={{ fontSize: compact ? 13 : 14, lineHeight: 1.4, color: 'rgba(255,255,255,0.78)' }}>{item?.description || '-'}</div>
    </div>
  )
}

function MobileHistoryCard({ row }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 13,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
        display: 'grid',
        gap: 10,
        boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2, wordBreak: 'break-word' }}>{row.game}</div>
        <div style={{ fontSize: 13, opacity: 0.82, marginTop: 4, lineHeight: 1.3, wordBreak: 'break-word' }}>{row.track}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minWidth: 0 }}>
        <MetaChip>{row.createdLabel}</MetaChip>
        <MetaChip>Gap: {row.gapVsLeader}</MetaChip>
      </div>
      <div
        style={{
          borderRadius: 14,
          padding: '12px 14px',
          background: 'rgba(59,130,246,0.10)',
          border: '1px solid rgba(96,165,250,0.22)',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: 22,
          lineHeight: 1.15,
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
          wordBreak: 'break-word',
        }}
      >
        {row.time}
      </div>
    </div>
  )
}

function MobileBestCard({ row }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 13,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
        display: 'grid',
        gap: 10,
        boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2, wordBreak: 'break-word' }}>{row.game}</div>
        <div style={{ fontSize: 13, opacity: 0.82, marginTop: 4, lineHeight: 1.3, wordBreak: 'break-word' }}>{row.track}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minWidth: 0 }}>
        <MetaChip>Auto: {row.car || '-'}</MetaChip>
        <MetaChip accent>Posición: {row.position === '-' ? '-' : `#${row.position}`}</MetaChip>
      </div>
      <div
        style={{
          borderRadius: 14,
          padding: '12px 14px',
          background: 'rgba(34,197,94,0.10)',
          border: '1px solid rgba(74,222,128,0.22)',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: 22,
          lineHeight: 1.15,
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
          wordBreak: 'break-word',
        }}
      >
        {row.time}
      </div>
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
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

    return [...names].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
  }, [lapTimes, bookings, pointsLeaderboard, normalizeText])

  const filteredOptions = useMemo(() => {
    const query = normalizeText(search).toLowerCase()
    if (!query) return pilotOptions
    return pilotOptions.filter((pilot) => pilot.toLowerCase().includes(query))
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
        quickSummary: [],
        simpleHighlights: [],
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
        quickSummary: [],
        simpleHighlights: [],
      }
    }
  }, [selectedPilot, lapTimes, bookings, pointsLeaderboard, formatDateChile, normalizeText])

  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  const strongestGame = profile?.quickSummary?.find((item) => item?.label === 'Juego más fuerte')?.value || '-'
  const levelLabel = profile?.quickSummary?.find((item) => item?.label === 'Nivel actual')?.value || '-'
  const podiumRate = profile?.quickSummary?.find((item) => item?.label === 'Presencia en top 3')?.value || '-'
  const mainFocus = profile?.quickSummary?.find((item) => item?.label === 'En qué enfocarse')?.value || '-'
  const activityGame = profile?.quickSummary?.find((item) => item?.label === 'Juego con más actividad')?.value || '-'
  const trendHighlight = profile?.simpleHighlights?.find((item) => item?.title === 'Estado actual')

  return (
    <SectionCard title='👤 Perfil de piloto' card={card} sectionTitle={sectionTitle}>
      {pilotOptions.length === 0 ? (
        <CenteredMessage text='Aún no hay datos suficientes para mostrar perfiles' line={line} />
      ) : (
        <div style={{ display: 'grid', gap: isMobile ? 16 : 18, minWidth: 0, maxWidth: '100%' }}>
          <div
            style={{
              ...formGrid,
              gridTemplateColumns: isMobile ? '1fr' : formGrid.gridTemplateColumns,
              marginBottom: 2,
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='BUSCAR PILOTO'
              style={{ ...input, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
            />

            <select
              value={selectedPilot}
              onChange={(e) => setSelectedPilot(e.target.value)}
              style={{ ...input, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
            >
              {filteredOptions.map((pilot) => (
                <option key={pilot} value={pilot}>
                  {pilot}
                </option>
              ))}
            </select>
          </div>

          {!selectedPilot ? (
            <CenteredMessage text='No hay coincidencias para esa búsqueda' line={line} />
          ) : (
            <>
              <div
                style={{
                  borderRadius: 24,
                  padding: isMobile ? '18px 14px' : '24px 20px',
                  background:
                    'radial-gradient(circle at top right, rgba(34,197,94,0.14), transparent 28%), radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 34%), linear-gradient(180deg, rgba(14,24,53,0.98) 0%, rgba(8,15,35,0.98) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                  display: 'grid',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'rgba(255,255,255,0.56)',
                    lineHeight: 1.3,
                    fontWeight: 800,
                  }}
                >
                  Perfil rápido
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 27 : 36,
                    fontWeight: 900,
                    marginTop: -2,
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    lineHeight: 1.05,
                  }}
                >
                  {selectedPilot}
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.76)',
                    lineHeight: 1.35,
                    fontSize: isMobile ? 14 : 15,
                    maxWidth: 620,
                    marginInline: 'auto',
                  }}
                >
                  Mira rápido qué tan competitivo viene, dónde rinde mejor y qué debería atacar para seguir subiendo su nivel.
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <MetaChip accent>{levelLabel === '-' ? 'Nivel actual: -' : `Nivel actual: ${levelLabel}`}</MetaChip>
                  <MetaChip>{strongestGame === '-' ? 'Juego más fuerte: -' : `Juego más fuerte: ${strongestGame}`}</MetaChip>
                  <MetaChip>{podiumRate === '-' ? 'Top 3: -' : `Top 3: ${podiumRate}`}</MetaChip>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
                  minWidth: 0,
                  maxWidth: '100%',
                }}
              >
                <MetricCard label='Puntos' value={profile?.summary?.points ?? 0} strong compact={isMobile} />
                <MetricCard label='Mejor tiempo' value={profile?.summary?.bestTime || '-'} compact={isMobile} />
                <MetricCard label='Victorias' value={profile?.summary?.wins ?? 0} compact={isMobile} />
                <MetricCard label='Registros' value={profile?.summary?.lapCount ?? 0} compact={isMobile} />
                <MetricCard label='Juegos' value={profile?.summary?.gamesCount ?? 0} compact={isMobile} />
                <MetricCard label='Reservas' value={profile?.summary?.bookingsCount ?? 0} compact={isMobile} />
              </div>

              {profile?.simpleHighlights?.length ? (
                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}>
                  {profile.simpleHighlights.map((item) => (
                    <HighlightCard key={item.title} item={item} compact={isMobile} />
                  ))}
                </div>
              ) : null}

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                  minWidth: 0,
                  maxWidth: '100%',
                }}
              >
                <SmallInfoCard label='Juego con más actividad' value={activityGame} compact={isMobile} />
                <SmallInfoCard label='Tendencia actual' value={trendHighlight?.value || '-'} compact={isMobile} />
                <SmallInfoCard label='Siguiente foco' value={mainFocus} compact={isMobile} />
              </div>

              <div style={{ ...line, margin: '2px 0' }} />

              <SectionLabel compact={isMobile}>Últimos resultados</SectionLabel>
              {profile?.recentSessions?.length ? (
                isMobile ? (
                  <div style={{ display: 'grid', gap: 10, minWidth: 0, maxWidth: '100%' }}>
                    {profile.recentSessions.slice(0, 8).map((row, index) => (
                      <MobileHistoryCard key={`${row.game}-${row.track}-${row.time}-${index}`} row={row} />
                    ))}
                  </div>
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
                <CenteredMessage text='Todavía no hay resultados recientes para este piloto' line={line} />
              )}

              <SectionLabel compact={isMobile}>Dónde rinde mejor</SectionLabel>
              {profile?.bestRows?.length ? (
                isMobile ? (
                  <div style={{ display: 'grid', gap: 10, minWidth: 0, maxWidth: '100%' }}>
                    {profile.bestRows.slice(0, 8).map((row) => (
                      <MobileBestCard key={`${row.game}-${row.track}`} row={row} />
                    ))}
                  </div>
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
                <CenteredMessage text='Este piloto aún no tiene tiempos comparables' line={line} />
              )}
            </>
          )}
        </div>
      )}
    </SectionCard>
  )
}
