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

function StatBox({ label, value, strong = false, compact = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.28)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: compact ? 12 : 14,
        padding: compact ? '10px 12px' : 14,
        textAlign: 'center',
        background: strong ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: compact ? 11 : 12, opacity: 0.72, marginBottom: compact ? 4 : 6 }}>{label}</div>
      <div style={{ fontSize: compact ? 15 : 18, fontWeight: 800, wordBreak: 'break-word', lineHeight: 1.2 }}>{value || '-'}</div>
    </div>
  )
}

function DataChip({ label, value, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.24)' : '1px solid rgba(255,255,255,0.08)',
        background: strong ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
        borderRadius: 999,
        padding: '8px 10px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 10, opacity: 0.68, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '-'}</div>
    </div>
  )
}


function getReserveActionLabel(position) {
  if (Number(position) === 1) return 'DEFENDER PUESTO'
  if (Number(position) <= 3) return 'IR POR EL P1'
  return 'MEJORAR TIEMPO'
}

function ReserveActionButton({ label, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        width: '100%',
        marginTop: 10,
        border: '1px solid rgba(41,129,243,0.34)',
        borderRadius: 12,
        padding: '11px 12px',
        background: 'linear-gradient(180deg, rgba(41,129,243,0.22), rgba(14,44,64,0.88))',
        color: '#ffffff',
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: 0.3,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
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
        marginBottom: 18,
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
        placeholder="BUSCAR PILOTO"
        style={input}
      />
    </div>
  )
}

function PodiumPreview({ entries }) {
  const preview = entries.slice(0, 3)
  if (!preview.length) return null

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {preview.map((row) => (
        <div
          key={row.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 8,
            alignItems: 'center',
            minWidth: 0,
            padding: '8px 10px',
            borderRadius: 12,
            background: row.position === 1 ? 'rgba(250,204,21,0.10)' : 'rgba(255,255,255,0.03)',
            border: row.position === 1 ? '1px solid rgba(250,204,21,0.18)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 18, lineHeight: 1 }}>{getRankingBadge(row.position)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.player}</div>
            <div style={{ fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.car || 'Auto no indicado'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap' }}>{row.time}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{row.gap}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CompactSectionCard({ section, isOpen, onToggle, isMobile }) {
  if (!section) return null
  const entries = Array.isArray(section.entries) ? section.entries : []
  const meta = buildRankingSectionMeta(entries)

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        border: isOpen ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: isMobile ? 14 : 16,
        background: isOpen ? 'rgba(59,130,246,0.10)' : 'rgba(255,255,255,0.03)',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: isOpen ? '0 12px 26px rgba(37,99,235,0.16)' : 'none',
      }}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {entries.length} tiempos cargados
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.88 }}>
              {isOpen ? 'Ocultar detalle' : 'Ver detalle'}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, textAlign: 'center' }}>{section.game}</div>
            <div style={{ opacity: 0.82, textAlign: 'center', fontSize: isMobile ? 13 : 15 }}>{section.track}</div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(3, minmax(90px, 1fr))',
            width: '100%',
          }}
        >
          <StatBox label="Récord" value={meta.recordTime} strong compact={isMobile} />
          <StatBox label="Pilotos" value={meta.participants} compact={isMobile} />
          <StatBox label="Líder" value={meta.recordHolder} compact={isMobile} />
        </div>

        {isMobile ? <PodiumPreview entries={entries} /> : null}
      </div>
    </button>
  )
}

function MobileEntryCard({
  row,
  isAdmin,
  startEditLapTime,
  deleteLapTime,
  buttonRowSmall,
  miniButton,
  miniDanger,
  reserveActionLabel,
  onReserve,
}) {
  const cardBackground = row.position === 1
    ? 'rgba(250,204,21,0.10)'
    : row.position === 2
      ? 'rgba(148,163,184,0.10)'
      : row.position === 3
        ? 'rgba(251,146,60,0.10)'
        : 'rgba(255,255,255,0.03)'

  return (
    <div
      style={{
        border: row.position <= 3 ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 12,
        background: cardBackground,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 10,
          alignItems: 'center',
          marginBottom: 10,
          minWidth: 0,
        }}
      >
        <div style={{ fontSize: 22, lineHeight: 1 }}>{getRankingBadge(row.position)}</div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.player}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Posición #{row.position}</div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div style={{ fontSize: 11, opacity: 0.68, marginBottom: 2 }}>Tiempo</div>
          <div style={{ fontSize: 16, fontWeight: 900, whiteSpace: 'nowrap' }}>{row.time}</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        <DataChip label="Gap" value={row.gap} strong={row.position === 1} />
        <DataChip label="País" value={row.country || '-'} />
        <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
          <DataChip label="Auto" value={row.car || '-'} />
        </div>
      </div>

      {!isAdmin && onReserve ? <ReserveActionButton label={reserveActionLabel} onClick={onReserve} /> : null}

      {isAdmin ? (
        <div style={{ ...buttonRowSmall, justifyContent: 'center', marginTop: 10 }}>
          <button style={miniButton} onClick={() => startEditLapTime(row)}>Editar</button>
          <button style={miniDanger} onClick={() => deleteLapTime(row.id)}>Eliminar</button>
        </div>
      ) : null}
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
  onReserveFromRanking,
}) {
  if (!section) return null
  const entries = Array.isArray(section.entries) ? section.entries : []
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)
  const sectionMeta = buildRankingSectionMeta(entries)

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          marginBottom: 14,
        }}
      >
        <StatBox label="Mejor auto" value={sectionMeta.recordCar} compact />
        <StatBox label="Juego" value={section.game} compact />
      </div>

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
              {isAdmin ? <th style={thCenter}>Admin</th> : onReserveFromRanking ? <th style={thCenter}>Acción</th> : null}
            </tr>
          </thead>
          <tbody>
            {entries.map((row) => (
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
                ) : onReserveFromRanking ? (
                  <td style={tdCenter}>
                    <button
                      type='button'
                      onClick={() => onReserveFromRanking({
                        rankingType: 'GENERAL',
                        position: row.position,
                        gap: row.gap,
                        game: row.game || section.game,
                        track: row.track || section.track,
                        player: row.player,
                      })}
                      style={{
                        border: '1px solid rgba(41,129,243,0.34)',
                        borderRadius: 10,
                        padding: '9px 10px',
                        background: 'rgba(41,129,243,0.18)',
                        color: '#ffffff',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getReserveActionLabel(row.position)}
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MobileSectionContent({
  section,
  isAdmin,
  startEditLapTime,
  deleteLapTime,
  buttonRowSmall,
  miniButton,
  miniDanger,
  onReserveFromRanking,
}) {
  if (!section) return null
  const entries = Array.isArray(section.entries) ? section.entries : []
  const sectionMeta = buildRankingSectionMeta(entries)

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          marginBottom: 12,
        }}
      >
        <StatBox label="Mejor auto" value={sectionMeta.recordCar} compact />
        <StatBox label="Líder" value={sectionMeta.recordHolder} compact strong />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          Récord: {sectionMeta.recordTime}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {entries.length} registros
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {entries.map((row) => (
          <MobileEntryCard
            key={row.id}
            row={row}
            isAdmin={isAdmin}
            startEditLapTime={startEditLapTime}
            deleteLapTime={deleteLapTime}
            buttonRowSmall={buttonRowSmall}
            miniButton={miniButton}
            miniDanger={miniDanger}
            reserveActionLabel={getReserveActionLabel(row.position)}
            onReserve={
              onReserveFromRanking
                ? () =>
                    onReserveFromRanking({
                      rankingType: 'GENERAL',
                      position: row.position,
                      gap: row.gap,
                      game: row.game || section.game,
                      track: row.track || section.track,
                      player: row.player,
                    })
                : null
            }
          />
        ))}
      </div>
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
  onReserveFromRanking,
}) {
  const globalMeta = useMemo(() => buildGlobalRankingMeta(groupedRanking || []), [groupedRanking])
  const [openSectionKey, setOpenSectionKey] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const firstSectionKey = (groupedRanking || [])[0]
    ? `${groupedRanking[0].game}__${groupedRanking[0].track}`
    : ''

  const currentOpenKey = openSectionKey || firstSectionKey

  return (
    <SectionCard title="🏁 Ranking general" card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 18,
          minWidth: 0,
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
          padding: isMobile ? 10 : 12,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 4 }}>Mejor referencia general</div>
        <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, wordBreak: 'break-word', lineHeight: 1.25 }}>{globalMeta.bestRecordLocation}</div>
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

      {!groupedRanking?.length ? (
        <CenteredMessage text="No hay tiempos para ese filtro" line={line} />
      ) : (
        <div style={{ display: 'grid', gap: isMobile ? 10 : 12, minWidth: 0 }}>
          {groupedRanking.filter(Boolean).map((section) => {
            const sectionKey = `${section.game}__${section.track}`
            const isOpen = sectionKey === currentOpenKey

            return (
              <div key={sectionKey}>
                <CompactSectionCard
                  section={section}
                  isOpen={isOpen}
                  onToggle={() => setOpenSectionKey(isOpen ? '' : sectionKey)}
                  isMobile={isMobile}
                />

                {isOpen ? (
                  isMobile ? (
                    <MobileSectionContent
                      section={section}
                      isAdmin={isAdmin}
                      startEditLapTime={startEditLapTime}
                      deleteLapTime={deleteLapTime}
                      buttonRowSmall={buttonRowSmall}
                      miniButton={miniButton}
                      miniDanger={miniDanger}
                      onReserveFromRanking={onReserveFromRanking}
                    />
                  ) : (
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
                      onReserveFromRanking={onReserveFromRanking}
                    />
                  )
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
