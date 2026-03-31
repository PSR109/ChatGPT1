import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildCenteredTableStyles } from '../utils/tableStyles'

function getBadge(position) {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return `#${position}`
}

function getRowAccent(position) {
  if (position === 1) return { background: 'rgba(250,204,21,0.12)', fontWeight: 700 }
  if (position === 2) return { background: 'rgba(148,163,184,0.12)', fontWeight: 600 }
  if (position === 3) return { background: 'rgba(251,146,60,0.12)', fontWeight: 600 }
  return {}
}

function StatBox({ label, value, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.28)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        textAlign: 'center',
        background: strong ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, overflowWrap: 'anywhere' }}>{value || '-'}</div>
    </div>
  )
}

function classifyDetails(details = []) {
  const grouped = {
    general: [],
    desafios: [],
    reservas: [],
    otros: [],
  }

  details.forEach((detail) => {
    const text = String(detail || '').toUpperCase()

    if (text.includes('RESERVA')) grouped.reservas.push(detail)
    else if (text.includes('SEMANAL') || text.includes('MENSUAL') || text.includes('PARTICIPACIÓN')) grouped.desafios.push(detail)
    else if (text.includes('GENERAL')) grouped.general.push(detail)
    else grouped.otros.push(detail)
  })

  return grouped
}

function countGroupPoints(entries = []) {
  return entries.reduce((sum, item) => {
    const text = String(item || '')
    if (text.includes('🥇')) return sum + 3
    if (text.includes('🥈')) return sum + 2
    if (text.includes('🥉')) return sum + 1
    if (text.toUpperCase().includes('PARTICIPACIÓN')) return sum + 5
    if (text.toUpperCase().includes('RESERVA')) return sum + 7
    return sum
  }, 0)
}

function DetailEntry({ children }) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 10,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        lineHeight: 1.45,
        overflowWrap: 'anywhere',
      }}
    >
      {children}
    </div>
  )
}

function DetailsPanel({ row, isCompact = false }) {
  const grouped = classifyDetails(row.details || [])

  const blocks = [
    { title: 'Ranking general', items: grouped.general },
    { title: 'Desafíos', items: grouped.desafios },
    { title: 'Reservas', items: grouped.reservas },
    { title: 'Otros movimientos', items: grouped.otros },
  ].filter((block) => block.items.length)

  return (
    <div
      style={{
        marginTop: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: isCompact ? 12 : 14,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: isCompact ? 16 : 18, fontWeight: 800, marginBottom: 14, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
        Cómo sumó puntos {row.player}
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isCompact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 14,
        }}
      >
        <StatBox label='Total' value={row.points} strong />
        <StatBox label='General' value={countGroupPoints(grouped.general)} />
        <StatBox label='Desafíos' value={countGroupPoints(grouped.desafios)} />
        <StatBox label='Reservas' value={countGroupPoints(grouped.reservas)} />
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {blocks.map((block) => (
          <div
            key={block.title}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 12,
              background: 'rgba(255,255,255,0.02)',
              minWidth: 0,
            }}
          >
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 10 }}>{block.title}</div>
            {block.items.length ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {block.items.map((item, index) => (
                  <DetailEntry key={`${block.title}-${index}`}>{item}</DetailEntry>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', opacity: 0.65 }}>Sin movimientos aquí</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileLeaderboardCard({ row, isOpen, onToggle }) {
  const accent = getRowAccent(row.position)

  return (
    <div
      onClick={onToggle}
      style={{
        ...accent,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 14,
        background: accent.background || 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 20, lineHeight: 1 }}>{getBadge(row.position)}</div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Piloto</div>
          <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{row.player}</div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 66 }}>
          <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Puntos</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{row.points}</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 13,
        }}
      >
        <span style={{ opacity: 0.78 }}>{isOpen ? 'Ocultar resumen' : 'Ver resumen'}</span>
        <strong>{isOpen ? '▲' : '▼'}</strong>
      </div>
    </div>
  )
}

export default function PointsSection({
  pointsLeaderboard,
  card,
  sectionTitle,
  tableWrap,
  table,
  th,
  td,
}) {
  const [search, setSearch] = useState('')
  const [expandedPlayer, setExpandedPlayer] = useState('')
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 720
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onResize = () => setIsCompact(window.innerWidth <= 720)
    window.addEventListener('resize', onResize)
    onResize()

    return () => window.removeEventListener('resize', onResize)
  }, [])

  const filteredRows = useMemo(() => {
    const term = String(search || '').trim().toUpperCase()
    if (!term) return pointsLeaderboard
    return pointsLeaderboard.filter((row) => String(row.player || '').toUpperCase().includes(term))
  }, [pointsLeaderboard, search])

  useEffect(() => {
    if (!expandedPlayer) return
    if (filteredRows.some((row) => row.player === expandedPlayer)) return
    setExpandedPlayer('')
  }, [expandedPlayer, filteredRows])

  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)
  const totalPlayers = pointsLeaderboard.length
  const totalPoints = pointsLeaderboard.reduce((sum, row) => sum + Number(row.points || 0), 0)
  const leader = pointsLeaderboard[0]

  return (
    <SectionCard title='⭐ Puntos' card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isCompact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 18,
        }}
      >
        <StatBox label='Pilotos con puntos' value={totalPlayers} />
        <StatBox label='Puntos totales' value={totalPoints} />
        <StatBox label='Líder' value={leader?.player || '-'} strong />
        <StatBox label='Puntos del líder' value={leader?.points || 0} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar piloto'
          style={{
            width: '100%',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filteredRows.length === 0 ? (
        <CenteredMessage text={pointsLeaderboard.length ? 'No hay pilotos para ese filtro' : 'Aún no hay puntos cargados'} />
      ) : (
        <>
          <div style={{ textAlign: 'center', opacity: 0.8, marginBottom: 12, lineHeight: 1.35 }}>
            Toca un piloto para ver cómo sumó sus puntos.
          </div>

          {isCompact ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredRows.map((row) => {
                const isOpen = expandedPlayer === row.player
                return (
                  <div key={row.player}>
                    <MobileLeaderboardCard row={row} isOpen={isOpen} onToggle={() => setExpandedPlayer(isOpen ? '' : row.player)} />
                    {isOpen ? <DetailsPanel row={row} isCompact /> : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <>
              <div style={tableWrap}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={thCenter}>Pos.</th>
                      <th style={thCenter}>Piloto</th>
                      <th style={thCenter}>Puntos</th>
                      <th style={thCenter}>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const isOpen = expandedPlayer === row.player

                      return (
                        <tr
                          key={row.player}
                          style={{ ...getRowAccent(row.position), cursor: 'pointer' }}
                          onClick={() => setExpandedPlayer(isOpen ? '' : row.player)}
                        >
                          <td style={tdCenter}>{getBadge(row.position)}</td>
                          <td style={tdCenter}>{row.player}</td>
                          <td style={tdCenter}><strong>{row.points}</strong></td>
                          <td style={tdCenter}>{isOpen ? 'Ocultar' : 'Ver resumen'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {expandedPlayer ? (
                <DetailsPanel row={filteredRows.find((row) => row.player === expandedPlayer)} />
              ) : null}
            </>
          )}
        </>
      )}
    </SectionCard>
  )
}
