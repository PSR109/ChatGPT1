import { useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildCenteredTableStyles } from '../utils/tableStyles'
import {
  buildGlobalRankingMeta,
  buildRankingSectionMeta,
  getRankingBadge,
  getRankingRowAccent,
} from '../utils/rankingUtils'

function StatBox({ label, value, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250,204,21,0.28)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        textAlign: 'center',
        background: strong ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{value || '-'}</div>
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
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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

function CompactSectionCard({ section, isOpen, onToggle }) {
  const meta = buildRankingSectionMeta(section.entries || [])

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        border: isOpen ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        background: isOpen ? 'rgba(59,130,246,0.10)' : 'rgba(255,255,255,0.03)',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, textAlign: 'center' }}>{section.game}</div>
          <div style={{ opacity: 0.82, textAlign: 'center' }}>{section.track}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
            width: '100%',
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          <StatBox label="Récord" value={meta.recordTime} strong />
          <StatBox label="Pilotos" value={meta.participants} />
          <StatBox label="Líder" value={meta.recordHolder} />
        </div>
      </div>
    </button>
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
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

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
        <StatBox label="Mejor auto" value={buildRankingSectionMeta(section.entries).recordCar} />
        <StatBox label="Juego" value={section.game} />
        <StatBox label="Pista / etapa" value={section.track} />
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

  const firstSectionKey = (groupedRanking || [])[0]
    ? `${groupedRanking[0].game}__${groupedRanking[0].track}`
    : ''

  const currentOpenKey = openSectionKey || firstSectionKey

  return (
    <SectionCard title="🏁 Ranking general" card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 18,
        }}
      >
        <StatBox label="Secciones" value={globalMeta.sections} />
        <StatBox label="Pilotos" value={globalMeta.totalParticipants} />
        <StatBox label="Récord global" value={globalMeta.bestRecordTime} strong />
        <StatBox label="Piloto récord" value={globalMeta.bestRecordHolder} />
      </div>

      <div
        style={{
          textAlign: 'center',
          marginBottom: 18,
          padding: 12,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 4 }}>Mejor referencia general</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{globalMeta.bestRecordLocation}</div>
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
      />

      {!groupedRanking?.length ? (
        <CenteredMessage text="No hay tiempos para ese filtro" line={line} />
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
