import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import CenteredMessage from './CenteredMessage'
import { buildCenteredTableStyles } from '../utils/tableStyles'
import {
  formatCountdown,
  getChallengeStatus,
  getPositionBadge,
  getStatusColors,
  isChallengeExpired,
} from '../utils/challengeUtils'
import { buildRankingSectionMeta, getRankingRowAccent } from '../utils/rankingUtils'

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
      <div style={{ fontSize: 17, fontWeight: 800 }}>{value || '-'}</div>
    </div>
  )
}

function ChallengeStatusBanner({ endAt, type }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => setTick((x) => x + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const status = getChallengeStatus(endAt, type)
  const colors = getStatusColors(status)

  return (
    <div
      style={{
        ...colors,
        borderRadius: 14,
        padding: 14,
        textAlign: 'center',
        marginBottom: 18,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{status}</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{formatCountdown(endAt, type)}</div>
    </div>
  )
}

function ChallengeSummary({ challenge, leaderboard }) {
  const meta = buildRankingSectionMeta(leaderboard)

  return (
    <>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: 16,
          background: 'rgba(255,255,255,0.03)',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800 }}>{challenge?.game || '-'}</div>
        <div style={{ marginTop: 6, opacity: 0.88 }}>{challenge?.track || '-'}</div>
        <div style={{ marginTop: 6, fontWeight: 700 }}>{challenge?.car || '-'}</div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 16,
        }}
      >
        <StatBox label="Participantes" value={meta.participants} />
        <StatBox label="Mejor tiempo" value={meta.recordTime} strong />
        <StatBox label="Líder" value={meta.recordHolder} />
      </div>
    </>
  )
}

function ChallengeCreateForm({
  type,
  createGameValue,
  setCreateGameValue,
  createTrackValue,
  setCreateTrackValue,
  createCarValue,
  setCreateCarValue,
  createEndAtValue,
  setCreateEndAtValue,
  onCreateChallenge,
  input,
  button,
}) {
  const canCreate =
    String(createGameValue || '').trim() &&
    String(createTrackValue || '').trim() &&
    String(createCarValue || '').trim() &&
    String(createEndAtValue || '').trim()

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800 }}>
        Crear desafío {type === 'weekly' ? 'semanal' : 'mensual'}
      </div>
      <input value={createGameValue} onChange={(e) => setCreateGameValue(e.target.value)} placeholder="JUEGO" style={input} />
      <input value={createTrackValue} onChange={(e) => setCreateTrackValue(e.target.value)} placeholder="CIRCUITO / ETAPA" style={input} />
      <input value={createCarValue} onChange={(e) => setCreateCarValue(e.target.value)} placeholder="AUTO" style={input} />
      <input type="datetime-local" value={createEndAtValue} onChange={(e) => setCreateEndAtValue(e.target.value)} style={input} />
      <button
        onClick={onCreateChallenge}
        style={{ ...button, opacity: canCreate ? 1 : 0.55, cursor: canCreate ? 'pointer' : 'not-allowed' }}
        disabled={!canCreate}
      >
        Crear desafío
      </button>
    </div>
  )
}

function ChallengeEntryForm({
  isAdmin,
  expired,
  playerValue,
  setPlayerValue,
  timeValue,
  setTimeValue,
  editingEntryId,
  onSubmit,
  onCancelEdit,
  input,
  button,
  buttonSecondary,
}) {
  if (!isAdmin) return null

  const canSubmit = String(playerValue || '').trim() && String(timeValue || '').trim() && !expired

  return (
    <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
      <div style={{ textAlign: 'center', fontWeight: 700 }}>
        {editingEntryId ? 'Editar tiempo' : 'Registrar tiempo'}
      </div>
      <input value={playerValue} onChange={(e) => setPlayerValue(e.target.value)} placeholder="PILOTO" style={input} disabled={expired} />
      <input value={timeValue} onChange={(e) => setTimeValue(e.target.value)} placeholder="TIEMPO EJ: 1:28.500" style={input} disabled={expired} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            if (canSubmit) onSubmit()
          }}
          style={{ ...button, opacity: canSubmit ? 1 : 0.55, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          disabled={!canSubmit}
        >
          {editingEntryId ? 'Guardar cambios' : 'Registrar tiempo'}
        </button>
        {editingEntryId ? <button onClick={onCancelEdit} style={buttonSecondary}>Cancelar</button> : null}
      </div>
    </div>
  )
}

function ChallengeTable({
  leaderboard,
  isAdmin,
  onEditEntry,
  onDeleteEntry,
  normalizeText,
  tableWrap,
  table,
  th,
  td,
  miniButton,
  miniDanger,
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  if (!leaderboard.length) {
    return <CenteredMessage text="Aún no hay tiempos cargados" />
  }

  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={thCenter}>Pos.</th>
            <th style={thCenter}>Piloto</th>
            <th style={thCenter}>Tiempo</th>
            <th style={thCenter}>Gap</th>
            {isAdmin ? <th style={thCenter}>Admin</th> : null}
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.id} style={getRankingRowAccent(entry.position)}>
              <td style={tdCenter}>{getPositionBadge(entry.position)}</td>
              <td style={tdCenter}>{normalizeText(entry.player)}</td>
              <td style={tdCenter}><strong>{entry.time}</strong></td>
              <td style={tdCenter}>{entry.gap}</td>
              {isAdmin ? (
                <td style={tdCenter}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button style={miniButton} onClick={() => onEditEntry(entry)}>Editar</button>
                    <button style={miniDanger} onClick={() => onDeleteEntry(entry.id)}>Eliminar</button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ChallengeSection({
  challenge,
  leaderboard,
  type,
  isAdmin,
  playerValue,
  setPlayerValue,
  timeValue,
  setTimeValue,
  messageValue,
  editingEntryId,
  onSubmit,
  onCancelEdit,
  onEditEntry,
  onDeleteEntry,
  onDeleteChallenge,
  createGameValue,
  setCreateGameValue,
  createTrackValue,
  setCreateTrackValue,
  createCarValue,
  setCreateCarValue,
  createEndAtValue,
  setCreateEndAtValue,
  onCreateChallenge,
  normalizeText,
  card,
  sectionTitle,
  input,
  button,
  buttonSecondary,
  messageStyle,
  tableWrap,
  table,
  th,
  td,
  miniButton,
  miniDanger,
}) {
  const expired = useMemo(() => isChallengeExpired(challenge?.end_at, type), [challenge?.end_at, type])
  const title = type === 'weekly' ? '🏁 Ranking semanal' : '🏆 Ranking mensual'

  return (
    <SectionCard title={title} card={card} sectionTitle={sectionTitle}>
      {!challenge ? (
        isAdmin ? (
          <ChallengeCreateForm
            type={type}
            createGameValue={createGameValue}
            setCreateGameValue={setCreateGameValue}
            createTrackValue={createTrackValue}
            setCreateTrackValue={setCreateTrackValue}
            createCarValue={createCarValue}
            setCreateCarValue={setCreateCarValue}
            createEndAtValue={createEndAtValue}
            setCreateEndAtValue={setCreateEndAtValue}
            onCreateChallenge={onCreateChallenge}
            input={input}
            button={button}
          />
        ) : (
          <CenteredMessage text="Aún no hay un desafío activo" />
        )
      ) : (
        <>
          <ChallengeStatusBanner endAt={challenge.end_at} type={type} />
          <ChallengeSummary challenge={challenge} leaderboard={leaderboard} />

          <ChallengeEntryForm
            isAdmin={isAdmin}
            expired={expired}
            playerValue={playerValue}
            setPlayerValue={setPlayerValue}
            timeValue={timeValue}
            setTimeValue={setTimeValue}
            editingEntryId={editingEntryId}
            onSubmit={onSubmit}
            onCancelEdit={onCancelEdit}
            input={input}
            button={button}
            buttonSecondary={buttonSecondary}
          />

          {isAdmin ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <button onClick={onDeleteChallenge} style={miniDanger}>Eliminar desafío y limpiar tiempos</button>
            </div>
          ) : null}

          {messageValue ? <div style={{ ...messageStyle, textAlign: 'center', marginBottom: 14 }}>{messageValue}</div> : null}

          <ChallengeTable
            leaderboard={leaderboard}
            isAdmin={isAdmin}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            normalizeText={normalizeText}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
            miniButton={miniButton}
            miniDanger={miniDanger}
          />
        </>
      )}
    </SectionCard>
  )
}
