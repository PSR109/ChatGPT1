/**
 * ACTIVE RANKING LAYER
 * Esta es la capa principal usada por App.jsx para el ranking general.
 * Mantener cambios aquí antes de tocar capas heredadas.
 */
/*
 * PSR RANKING MAP
 * ACTIVO: este es el componente real conectado en src/App.jsx.
 * Cualquier mejora funcional o visual del ranking general debe partir aquí,
 * salvo que primero se decida una refactorización controlada.
 */
import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildCenteredTableStyles } from '../utils/tableStyles'
import {
  buildGlobalRankingMeta,
  buildRankingSectionMeta,
  getRankingBadge,
  getRankingRowAccent,
} from '../utils/rankingUtils'

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= breakpoint
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onResize = () => setIsMobile(window.innerWidth <= breakpoint)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isMobile
}

function fitText(value, fallback = '-') {
  return value || fallback
}

function StatBox({ label, value, strong = false, compact = false }) {
  return (
    <div
      title={fitText(value)}
      style={{
        minWidth: 0,
        border: strong ? '1px solid rgba(250,204,21,0.28)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: compact ? 12 : 14,
        padding: compact ? '10px 8px' : 14,
        textAlign: 'center',
        background: strong ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: compact ? 10 : 12,
          opacity: 0.72,
          marginBottom: compact ? 4 : 6,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: compact ? 'clamp(0.88rem, 2.9vw, 1rem)' : 'clamp(0.98rem, 2.8vw, 1.12rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {fitText(value)}
      </div>
    </div>
  )
}

function FilterCard({
  selectedGame,
  setSelectedGame,
  selectedTrack,
  setSelectedTrack,
  selectedPilot,
  setSelectedPilot,
  generalGames,
  generalTracks,
  input,
  isMobile,
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
        marginBottom: 12,
      }}
    >
      <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} style={input}>
        {generalGames.map((game) => (
          <option key={game} value={game}>{game}</option>
        ))}
      </select>

      <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)} style={input}>
        {generalTracks.map((track) => (
          <option key={track} value={track}>{track}</option>
        ))}
      </select>

      <input
        value={selectedPilot}
        onChange={(e) => setSelectedPilot(e.target.value)}
        placeholder="Buscar piloto"
        style={input}
      />
    </div>
  )
}

function FilterSummary({ selectedGame, selectedTrack, selectedPilot, isMobile }) {
  const chips = [
    selectedGame && selectedGame !== 'TODOS' ? `Juego: ${selectedGame}` : 'Juego: Todos',
    selectedTrack && selectedTrack !== 'TODOS' ? `Pista: ${selectedTrack}` : 'Pista: Todas',
    selectedPilot ? `Piloto: ${selectedPilot}` : 'Piloto: Todos',
  ]

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: isMobile ? 12 : 14,
        background: 'rgba(255,255,255,0.03)',
        marginBottom: 18,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 8 }}>Filtro activo</div>
      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {chips.map((chip) => (
          <div
            key={chip}
            title={chip}
            style={{
              minWidth: 0,
              borderRadius: 10,
              border: '1px solid rgba(59,130,246,0.25)',
              background: 'rgba(59,130,246,0.10)',
              padding: '8px 10px',
              fontSize: 'clamp(0.74rem, 2.8vw, 0.84rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              overflowWrap: 'anywhere',
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>
  )
}

function CompactSectionCard({ section, isOpen, onToggle, isMobile }) {
  const meta = buildRankingSectionMeta(section.entries || [])

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        border: isOpen ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: isMobile ? 12 : 14,
        background: isOpen
          ? 'linear-gradient(180deg, rgba(59,130,246,0.12), rgba(255,255,255,0.04))'
          : 'rgba(255,255,255,0.03)',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'center',
        overflow: 'hidden',
        boxShadow: isOpen ? '0 12px 26px rgba(2,8,23,0.22)' : 'none',
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div
            title={section.game}
            style={{
              fontSize: isMobile ? 'clamp(1rem, 4.8vw, 1.3rem)' : 18,
              fontWeight: 900,
              lineHeight: 1.08,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {section.game}
          </div>
          <div
            title={section.track}
            style={{
              opacity: 0.82,
              marginTop: 4,
              fontSize: isMobile ? 'clamp(0.78rem, 3.1vw, 0.92rem)' : 15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {section.track}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          <StatBox label="Récord" value={meta.recordTime} strong compact={isMobile} />
          <StatBox label="Pilotos" value={meta.participants} compact={isMobile} />
          <StatBox label="Líder" value={meta.recordHolder} compact={isMobile} />
        </div>

        <div
          style={{
            fontSize: 11,
            opacity: 0.72,
            letterSpacing: 0.3,
          }}
        >
          {isOpen ? 'Toca para cerrar detalle' : 'Toca para ver detalle'}
        </div>
      </div>
    </button>
  )
}

function MobileEntryCard({ row, isAdmin, startEditLapTime, deleteLapTime, miniButton, miniDanger }) {
  return (
    <div
      style={{
        ...getRankingRowAccent(row.position),
        borderRadius: 16,
        padding: 12,
        display: 'grid',
        gap: 10,
        overflow: 'hidden',
        boxShadow: '0 10px 24px rgba(2,8,23,0.18)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '38px minmax(0, 1fr)',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 11,
            background: 'rgba(255,255,255,0.08)',
            fontSize: 18,
          }}
        >
          {getRankingBadge(row.position)}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            title={row.player}
            style={{
              fontWeight: 900,
              fontSize: 'clamp(0.98rem, 3.8vw, 1.08rem)',
              lineHeight: 1.08,
              overflowWrap: 'anywhere',
            }}
          >
            {row.player}
          </div>
          <div
            title={`${row.country || '-'} · ${row.car || '-'}`}
            style={{
              marginTop: 5,
              opacity: 0.76,
              fontSize: 'clamp(0.72rem, 2.9vw, 0.82rem)',
              lineHeight: 1.2,
              overflowWrap: 'anywhere',
            }}
          >
            {(row.country || '-') + ' · ' + (row.car || '-')}
          </div>
        </div>
      </div>

      <div
        style={{
          borderRadius: 12,
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>Tiempo oficial</div>
        <div
          title={row.time}
          style={{
            fontWeight: 900,
            fontSize: 'clamp(1.08rem, 4.4vw, 1.24rem)',
            lineHeight: 1.02,
            overflowWrap: 'anywhere',
          }}
        >
          {row.time}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <StatBox label="Posición" value={`#${row.position || '-'}`} compact />
        <StatBox label="Diferencia" value={row.gap} compact />
        <StatBox label="Auto" value={row.car || '-'} compact />
      </div>

      {isAdmin ? (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <button style={{ ...miniButton, width: '100%' }} onClick={() => startEditLapTime(row)}>Editar</button>
          <button style={{ ...miniDanger, width: '100%' }} onClick={() => deleteLapTime(row.id)}>Eliminar</button>
        </div>
      ) : (
        <div
          style={{
            fontSize: 11,
            opacity: 0.72,
          }}
        >
          ¿Crees que puedes bajarlo? Reserva tu turno y prueba tu tiempo.
        </div>
      )}
    </div>
  )
}

function RankingCTA({ isMobile }) {
  return (
    <div
      style={{
        marginTop: 14,
        borderRadius: 14,
        border: '1px solid rgba(59,130,246,0.2)',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.12), rgba(255,255,255,0.03))',
        padding: isMobile ? 12 : 14,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 4 }}>Siguiente paso</div>
      <div style={{ fontWeight: 800, fontSize: isMobile ? 'clamp(0.96rem, 3.8vw, 1.04rem)' : 17, lineHeight: 1.15 }}>
        ¿Quieres aparecer en el ranking?
      </div>
      <div style={{ opacity: 0.82, marginTop: 6, fontSize: isMobile ? 'clamp(0.76rem, 3vw, 0.86rem)' : 14, lineHeight: 1.35 }}>
        Reserva, corre tu tanda y compite por el mejor tiempo del local.
      </div>
    </div>
  )
}

function SectionTable({
  section,
  isAdmin,
  startEditLapTime,
  deleteLapTime,
  tableWrap,
  table,
  th,
  td,
  buttonRowSmall,
  miniButton,
  miniDanger,
  isMobile,
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)
  const meta = buildRankingSectionMeta(section.entries)

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))',
          marginBottom: 14,
        }}
      >
        <StatBox label="Mejor auto" value={meta.recordCar} compact={isMobile} />
        <StatBox label="Juego" value={section.game} compact={isMobile} />
        <StatBox label="Pista / etapa" value={section.track} compact={isMobile} />
        <StatBox label="Vueltas / tiempos" value={section.entries?.length || 0} compact={isMobile} />
      </div>

      {isMobile ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {(section.entries || []).map((row) => (
            <MobileEntryCard
              key={row.id}
              row={row}
              isAdmin={isAdmin}
              startEditLapTime={startEditLapTime}
              deleteLapTime={deleteLapTime}
              miniButton={miniButton}
              miniDanger={miniDanger}
            />
          ))}
          {!isAdmin ? <RankingCTA isMobile={isMobile} /> : null}
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={thCenter}>Pos.</th>
                <th style={thCenter}>Piloto</th>
                <th style={thCenter}>País</th>
                <th style={thCenter}>Auto</th>
                <th style={thCenter}>Tiempo</th>
                <th style={thCenter}>Gap</th>
                {isAdmin ? <th style={thCenter}>Admin</th> : null}
              </tr>
            </thead>
            <tbody>
              {(section.entries || []).map((row) => (
                <tr key={row.id} style={getRankingRowAccent(row.position)}>
                  <td style={tdCenter}>{getRankingBadge(row.position)}</td>
                  <td style={tdCenter}>{row.player}</td>
                  <td style={tdCenter}>{row.country || '-'}</td>
                  <td style={tdCenter}>{row.car}</td>
                  <td style={tdCenter}><strong>{row.time}</strong></td>
                  <td style={tdCenter}>{row.gap}</td>
                  {isAdmin ? (
                    <td style={tdCenter}>
                      <div style={{ ...buttonRowSmall, justifyContent: 'center' }}>
                        <button style={miniButton} onClick={() => startEditLapTime(row)}>Editar</button>
                        <button style={miniDanger} onClick={() => deleteLapTime(row.id)}>Eliminar</button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function GeneralRankingSection({
  groupedRanking,
  selectedGame,
  setSelectedGame,
  selectedTrack,
  setSelectedTrack,
  selectedPilot,
  setSelectedPilot,
  generalGames,
  generalTracks,
  isAdmin,
  startEditLapTime,
  deleteLapTime,
  card,
  sectionTitle,
  input,
  line,
  tableWrap,
  table,
  th,
  td,
  buttonRowSmall,
  miniButton,
  miniDanger,
}) {
  const globalMeta = useMemo(() => buildGlobalRankingMeta(groupedRanking || []), [groupedRanking])
  const [openSectionKey, setOpenSectionKey] = useState('')
  const isMobile = useIsMobile()

  const firstSectionKey = (groupedRanking || [])[0]
    ? `${groupedRanking[0].game}__${groupedRanking[0].track}`
    : ''

  const validSectionKeys = useMemo(
    () => (groupedRanking || []).map((section) => `${section.game}__${section.track}`),
    [groupedRanking]
  )

  useEffect(() => {
    if (!validSectionKeys.length) {
      if (openSectionKey) setOpenSectionKey('')
      return
    }

    if (openSectionKey && !validSectionKeys.includes(openSectionKey)) {
      setOpenSectionKey(validSectionKeys[0])
    }
  }, [openSectionKey, validSectionKeys])

  const currentOpenKey = openSectionKey || firstSectionKey

  return (
    <SectionCard title="🏁 Ranking general" card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 18,
        }}
      >
        <StatBox label="Secciones" value={globalMeta.sections} compact={isMobile} />
        <StatBox label="Pilotos" value={globalMeta.totalParticipants} compact={isMobile} />
        <StatBox label="Récord global" value={globalMeta.bestRecordTime} strong compact={isMobile} />
        <StatBox label="Piloto récord" value={globalMeta.bestRecordHolder} compact={isMobile} />
      </div>

      <div
        style={{
          textAlign: 'center',
          marginBottom: 18,
          padding: isMobile ? '12px 12px' : 14,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 4 }}>Mejor referencia general</div>
        <div
          title={globalMeta.bestRecordLocation}
          style={{
            fontSize: isMobile ? 'clamp(0.94rem, 3.8vw, 1.06rem)' : 18,
            fontWeight: 900,
            lineHeight: 1.1,
            overflowWrap: 'anywhere',
          }}
        >
          {globalMeta.bestRecordLocation}
        </div>
        {!isAdmin ? (
          <div style={{ opacity: 0.8, marginTop: 8, fontSize: isMobile ? 'clamp(0.74rem, 2.9vw, 0.84rem)' : 14, lineHeight: 1.35 }}>
            Revisa el tiempo a batir y elige dónde quieres correr para entrar al ranking.
          </div>
        ) : null}
      </div>

      <FilterCard
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        selectedTrack={selectedTrack}
        setSelectedTrack={setSelectedTrack}
        selectedPilot={selectedPilot}
        setSelectedPilot={setSelectedPilot}
        generalGames={generalGames}
        generalTracks={generalTracks}
        input={input}
        isMobile={isMobile}
      />

      <FilterSummary
        selectedGame={selectedGame}
        selectedTrack={selectedTrack}
        selectedPilot={selectedPilot}
        isMobile={isMobile}
      />

      {!groupedRanking?.length ? (
        <div
          style={{
            textAlign: 'center',
            padding: isMobile ? '18px 14px' : '20px 18px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 15, opacity: 0.92, fontWeight: 800, marginBottom: 8 }}>
            Aún no hay tiempos válidos para ese filtro
          </div>
          <div style={{ fontSize: 13, opacity: 0.76, lineHeight: 1.45, maxWidth: 560, margin: '0 auto' }}>
            Ajusta el juego, la pista o el piloto para ver otros resultados. Si todavía no hay registros, este puede ser tu lugar para marcar el primer tiempo.
          </div>
          {!isAdmin ? (
            <div style={{ opacity: 0.84, marginTop: 12, fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>
              Reserva tu sesión y entra al ranking.
            </div>
          ) : null}
          <div style={{ ...line, marginTop: 14 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {groupedRanking.map((section) => {
            const sectionKey = `${section.game}__${section.track}`
            const isOpen = sectionKey === currentOpenKey

            return (
              <div key={sectionKey}>
                <CompactSectionCard
                  section={section}
                  isOpen={isOpen}
                  isMobile={isMobile}
                  onToggle={() => setOpenSectionKey(isOpen ? '' : sectionKey)}
                />

                {isOpen ? (
                  <SectionTable
                    section={section}
                    isAdmin={isAdmin}
                    startEditLapTime={startEditLapTime}
                    deleteLapTime={deleteLapTime}
                    tableWrap={tableWrap}
                    table={table}
                    th={th}
                    td={td}
                    buttonRowSmall={buttonRowSmall}
                    miniButton={miniButton}
                    miniDanger={miniDanger}
                    isMobile={isMobile}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
