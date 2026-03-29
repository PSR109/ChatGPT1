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

function classifyDetails(details = []) {
  const grouped = { general: [], desafios: [], reservas: [], otros: [] }

  details.forEach((detail) => {
    const text = String(detail || '').toUpperCase()
    if (text.includes('RESERVA')) grouped.reservas.push(detail)
    else if (text.includes('SEMANAL') || text.includes('MENSUAL') || text.includes('PARTICIPACIÓN')) grouped.desafios.push(detail)
    else if (text.includes('GENERAL')) grouped.general.push(detail)
    else grouped.otros.push(detail)
  })

  return grouped
}

function StatBox({ label, value, strong = false, compact = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.30)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: compact ? 14 : 16,
        padding: compact ? '11px 12px' : '14px 16px',
        textAlign: 'center',
        background: strong
          ? 'linear-gradient(180deg, rgba(250,204,21,0.12), rgba(250,204,21,0.05))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: compact ? 10 : 11,
          opacity: 0.72,
          marginBottom: compact ? 4 : 6,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: compact ? 15 : 18, fontWeight: 900, wordBreak: 'break-word', lineHeight: 1.15 }}>{value || '-'}</div>
    </div>
  )
}

function DataChip({ label, value, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.24)' : '1px solid rgba(255,255,255,0.08)',
        background: strong ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: '10px 12px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 10, opacity: 0.68, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.25, wordBreak: 'break-word' }}>{value || '-'}</div>
    </div>
  )
}

function StagePill({ children, strong = false }) {
  return (
    <div
      style={{
        borderRadius: 999,
        padding: '7px 10px',
        border: strong ? '1px solid rgba(250,204,21,0.24)' : '1px solid rgba(255,255,255,0.08)',
        background: strong ? 'rgba(250,204,21,0.10)' : 'rgba(255,255,255,0.04)',
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.2,
        wordBreak: 'break-word',
      }}
    >
      {children}
    </div>
  )
}

function DetailBlock({ title, items, total, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.18)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 14,
        background: strong ? 'rgba(250,204,21,0.05)' : 'rgba(255,255,255,0.03)',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <div
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.10)',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            {total} pts
          </div>
        </div>

        {items.length ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((item, index) => (
              <div
                key={`${title}-${index}`}
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: 10,
                  background: 'rgba(255,255,255,0.02)',
                  wordBreak: 'break-word',
                  lineHeight: 1.3,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.65 }}>Sin puntos aquí</div>
        )}
      </div>
    </div>
  )
}

function DetailsPanel({ row, isMobile }) {
  const grouped = classifyDetails(row.details || [])
  const blocks = [
    { title: 'Ranking general', items: grouped.general, total: countGroupPoints(grouped.general), strong: true },
    { title: 'Desafíos', items: grouped.desafios, total: countGroupPoints(grouped.desafios) },
    { title: 'Reservas', items: grouped.reservas, total: countGroupPoints(grouped.reservas) },
  ]

  return (
    <div
      style={{
        marginTop: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: isMobile ? 14 : 16,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
        boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: isMobile ? 14 : 16,
          background: 'rgba(255,255,255,0.03)',
          textAlign: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resumen de piloto</div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, lineHeight: 1.15, wordBreak: 'break-word' }}>{row.player}</div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8, gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))' }}>
          <StatBox label='Total' value={row.points} strong compact={isMobile} />
          <StatBox label='General' value={countGroupPoints(grouped.general)} compact={isMobile} />
          <StatBox label='Desafíos' value={countGroupPoints(grouped.desafios)} compact={isMobile} />
          <StatBox label='Reservas' value={countGroupPoints(grouped.reservas)} compact={isMobile} />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {blocks.map((block) => (
          <DetailBlock key={block.title} title={block.title} items={block.items} total={block.total} strong={block.strong} />
        ))}
      </div>
    </div>
  )
}

function LeaderMiniCard({ row, label }) {
  const grouped = classifyDetails(row.details || [])

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
        display: 'grid',
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 11, opacity: 0.72, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800 }}>{label}</div>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{getBadge(row.position)}</div>
      </div>

      <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.1, wordBreak: 'break-word' }}>{row.player}</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <StagePill strong>Puntos: {row.points}</StagePill>
        <StagePill>General: {countGroupPoints(grouped.general)}</StagePill>
        <StagePill>Desafíos: {countGroupPoints(grouped.desafios)}</StagePill>
      </div>
    </div>
  )
}

function MobilePointsCard({ row, isOpen, onToggle }) {
  const isPodium = row.position <= 3
  const cardBackground = row.position === 1
    ? 'linear-gradient(180deg, rgba(250,204,21,0.16), rgba(250,204,21,0.06))'
    : row.position === 2
      ? 'linear-gradient(180deg, rgba(148,163,184,0.16), rgba(148,163,184,0.06))'
      : row.position === 3
        ? 'linear-gradient(180deg, rgba(251,146,60,0.16), rgba(251,146,60,0.06))'
        : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))'

  const grouped = classifyDetails(row.details || [])

  return (
    <button
      type='button'
      onClick={onToggle}
      style={{
        width: '100%',
        border: isOpen ? '1px solid rgba(59,130,246,0.42)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 14,
        textAlign: 'left',
        color: '#fff',
        cursor: 'pointer',
        background: isOpen ? 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(34,197,94,0.10))' : cardBackground,
        boxShadow: isPodium ? '0 12px 24px rgba(0,0,0,0.16)' : 'none',
      }}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(255,255,255,0.08)',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            {getBadge(row.position)}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.15, wordBreak: 'break-word' }}>{row.player}</div>
            <div style={{ fontSize: 11, opacity: 0.72, marginTop: 3 }}>Posición #{row.position}</div>
          </div>

          <div
            style={{
              textAlign: 'right',
              minWidth: 0,
              padding: '8px 10px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(0,0,0,0.14)',
            }}
          >
            <div style={{ fontSize: 10, opacity: 0.68, marginBottom: 2, textTransform: 'uppercase' }}>Puntos</div>
            <div style={{ fontSize: 16, fontWeight: 900, whiteSpace: 'nowrap' }}>{row.points}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <DataChip label='General' value={countGroupPoints(grouped.general)} strong />
          <DataChip label='Desafíos' value={countGroupPoints(grouped.desafios)} />
          <div style={{ gridColumn: '1 / -1' }}>
            <DataChip label='Reservas' value={countGroupPoints(grouped.reservas)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.76 }}>Toca para ver el detalle</div>
          <div
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.10)',
              padding: '7px 10px',
              fontSize: 12,
              fontWeight: 800,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            {isOpen ? 'Ocultar' : 'Abrir'}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function PointsSection({ pointsLeaderboard = [], card, sectionTitle, tableWrap, table, th, td }) {
  const [search, setSearch] = useState('')
  const [expandedPlayer, setExpandedPlayer] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  const filteredRows = useMemo(() => {
    const query = String(search || '').trim().toLowerCase()
    return (pointsLeaderboard || [])
      .map((row, index) => ({
        ...row,
        position: index + 1,
      }))
      .filter((row) => !query || String(row.player || '').toLowerCase().includes(query))
  }, [pointsLeaderboard, search])

  const leader = filteredRows[0] || null
  const second = filteredRows[1] || null
  const third = filteredRows[2] || null
  const totalPoints = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.points || 0), 0), [filteredRows])
  const averagePoints = filteredRows.length ? Math.round(totalPoints / filteredRows.length) : 0

  const activeExpandedPlayer = filteredRows.some((row) => row.player === expandedPlayer) ? expandedPlayer : ''

  return (
    <SectionCard title='🏆 Tabla de puntos' card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          borderRadius: 22,
          padding: isMobile ? '18px 14px' : '24px 20px',
          background:
            'radial-gradient(circle at top right, rgba(250,204,21,0.18), transparent 26%), radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 32%), linear-gradient(180deg, rgba(22,28,48,0.98) 0%, rgba(11,16,32,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
          display: 'grid',
          gap: 14,
        }}
      >
        <div style={{ textAlign: 'center', display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 11, opacity: 0.72, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Temporada PSR</div>
          <div style={{ fontSize: isMobile ? 26 : 34, fontWeight: 900, lineHeight: 1.05 }}>Quién viene sumando más</div>
          <div style={{ maxWidth: 720, margin: '0 auto', color: 'rgba(255,255,255,0.78)', lineHeight: 1.4, fontSize: isMobile ? 14 : 15 }}>
            Esta tabla mezcla ranking, desafíos y reservas para mostrar quién vuelve, compite y se mantiene activo.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
          <StagePill strong>{leader ? `Líder actual: ${leader.player}` : 'Sin líder aún'}</StagePill>
          <StagePill>{filteredRows.length} pilotos con puntos</StagePill>
          <StagePill>Promedio: {averagePoints} pts</StagePill>
        </div>

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))' }}>
          <StatBox label='Pilotos con puntos' value={filteredRows.length} compact={isMobile} />
          <StatBox label='Puntos totales' value={totalPoints} compact={isMobile} />
          <StatBox label='Líder' value={leader?.player || '-'} strong compact={isMobile} />
          <StatBox label='Puntos del líder' value={leader?.points || 0} compact={isMobile} />
        </div>
      </div>

      {leader ? (
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}>
          <LeaderMiniCard row={leader} label='P1 actual' />
          {second ? <LeaderMiniCard row={second} label='P2 actual' /> : null}
          {third ? <LeaderMiniCard row={third} label='P3 actual' /> : null}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.3fr) minmax(0, 0.9fr)',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            padding: isMobile ? 12 : 14,
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800 }}>Cómo leer esta tabla</div>
          <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, lineHeight: 1.3 }}>
            Toca un piloto para ver de dónde salen sus puntos y qué tan fuerte viene en ranking, desafíos y reservas.
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            padding: isMobile ? 12 : 14,
            display: 'grid',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.72, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800 }}>Cómo se suman puntos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StagePill strong>🥇 = 3</StagePill>
            <StagePill>🥈 = 2</StagePill>
            <StagePill>🥉 = 1</StagePill>
            <StagePill>Desafío = 5</StagePill>
            <StagePill>Reserva = 7</StagePill>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 2 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='BUSCAR PILOTO'
          style={{
            width: '100%',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '13px 14px',
            background: 'rgba(255,255,255,0.03)',
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filteredRows.length === 0 ? (
        <CenteredMessage text={pointsLeaderboard.length ? 'No hay pilotos para ese filtro' : 'Aún no hay puntos cargados'} />
      ) : isMobile ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {filteredRows.map((row) => {
            const isOpen = activeExpandedPlayer === row.player
            return (
              <div key={row.player}>
                <MobilePointsCard row={row} isOpen={isOpen} onToggle={() => setExpandedPlayer(isOpen ? '' : row.player)} />
                {isOpen ? <DetailsPanel row={row} isMobile /> : null}
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
                  const isOpen = activeExpandedPlayer === row.player
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

          {activeExpandedPlayer ? <DetailsPanel row={filteredRows.find((row) => row.player === activeExpandedPlayer)} isMobile={false} /> : null}
        </>
      )}
    </SectionCard>
  )
}
