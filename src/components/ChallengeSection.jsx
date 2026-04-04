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
import { normalizeTextInput } from '../utils/psrUtils'

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
      <div style={{ fontSize: 17, fontWeight: 800, wordBreak: 'break-word' }}>{value || '-'}</div>
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

function ChallengeSummary({ challenge, leaderboard, isMobile, type }) {
  const meta = buildRankingSectionMeta(leaderboard)
  const topThree = leaderboard.slice(0, 3)
  const guideTitle = type === 'weekly' ? 'Meta de la semana' : 'Meta del mes'

  return (
    <>
      <div
        style={{
          border: '1px solid rgba(250,204,21,0.22)',
          borderRadius: 18,
          padding: 16,
          background: 'linear-gradient(180deg, rgba(250,204,21,0.12), rgba(255,255,255,0.04))',
          textAlign: 'center',
          marginBottom: 16,
          boxShadow: '0 12px 34px rgba(0,0,0,0.22)',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', opacity: 0.72, marginBottom: 8 }}>Desafío activo</div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, wordBreak: 'break-word' }}>{challenge?.game || '-'}</div>
        <div style={{ marginTop: 6, opacity: 0.9, wordBreak: 'break-word' }}>{challenge?.track || '-'}</div>
        <div style={{ marginTop: 6, fontWeight: 700, wordBreak: 'break-word' }}>{challenge?.car || '-'}</div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
          marginBottom: 16,
        }}
      >
        <StatBox label='Participantes' value={meta.participants} />
        <StatBox label='Mejor tiempo' value={meta.recordTime} strong />
        <StatBox label='Líder' value={meta.recordHolder} />
        <StatBox label={guideTitle} value={topThree.length ? 'Entrar al top 3' : 'Abrir el marcador'} />
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 14,
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.68, marginBottom: 10 }}>Lo importante</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 800 }}>• Corre este combo y compárate al instante.</div>
            <div style={{ opacity: 0.84 }}>• El mejor tiempo se lleva el liderazgo del {type === 'weekly' ? 'reto semanal' : 'reto mensual'}.</div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 14,
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.68, marginBottom: 10 }}>Top rápido</div>
          {topThree.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {topThree.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div style={{ fontSize: 18 }}>{getPositionBadge(entry.position)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{entry.player}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{entry.gap === '-' ? 'Marca de referencia' : `Gap ${entry.gap}`}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{entry.time}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.78 }}>Todavía no hay tiempos. El primero en correr abre el reto.</div>
          )}
        </div>
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
    <div
      style={{
        display: 'grid',
        gap: 10,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 14,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900 }}>
        Crear desafío {type === 'weekly' ? 'semanal' : 'mensual'}
      </div>
      <div style={{ textAlign: 'center', opacity: 0.76, fontSize: 13 }}>
        Define juego, pista, auto y cierre del reto en un solo lugar.
      </div>
      <input value={createGameValue} onChange={(e) => setCreateGameValue(normalizeTextInput(e.target.value))} placeholder='JUEGO' style={input} />
      <input value={createTrackValue} onChange={(e) => setCreateTrackValue(normalizeTextInput(e.target.value))} placeholder='CIRCUITO / ETAPA' style={input} />
      <input value={createCarValue} onChange={(e) => setCreateCarValue(normalizeTextInput(e.target.value))} placeholder='AUTO' style={input} />
      <input type='datetime-local' value={createEndAtValue} onChange={(e) => setCreateEndAtValue(e.target.value)} style={input} />
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
    <div
      style={{
        display: 'grid',
        gap: 10,
        marginBottom: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 14,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
      }}
    >
      <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 18 }}>
        {editingEntryId ? 'Editar tiempo' : 'Registrar tiempo'}
      </div>
      <div style={{ textAlign: 'center', opacity: 0.76, fontSize: 13 }}>
        Ajusta registros del reto sin salir de esta vista.
      </div>
      <input value={playerValue} onChange={(e) => setPlayerValue(normalizeTextInput(e.target.value))} placeholder='PILOTO' style={input} disabled={expired} />
      <input value={timeValue} onChange={(e) => setTimeValue(e.target.value)} placeholder='TIEMPO EJ: 1:28.500' style={input} disabled={expired} />
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
  onReserveFromChallenge,
  challenge,
  type,
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={thCenter}>Pos.</th>
            <th style={thCenter}>Piloto</th>
            <th style={thCenter}>Tiempo</th>
            <th style={thCenter}>Gap</th>
            {isAdmin ? <th style={thCenter}>Gestión</th> : onReserveFromChallenge ? <th style={thCenter}>Acción</th> : null}
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
              ) : onReserveFromChallenge ? (
                <td style={tdCenter}>
                  <button
                    type='button'
                    onClick={() =>
                      onReserveFromChallenge({
                        rankingType: type === 'weekly' ? 'WEEKLY' : 'MONTHLY',
                        position: entry.position,
                        gap: entry.gap,
                        game: challenge?.game,
                        track: challenge?.track,
                        player: normalizeText(entry.player),
                      })
                    }
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
                    {getReserveActionLabel(entry.position)}
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileLeaderboardCard({
  entry,
  isAdmin,
  onEditEntry,
  onDeleteEntry,
  miniButton,
  miniDanger,
  normalizeText,
  reserveActionLabel,
  onReserve,
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 12,
        background: entry.position === 1
          ? 'rgba(250,204,21,0.10)'
          : entry.position === 2
            ? 'rgba(148,163,184,0.10)'
            : entry.position === 3
              ? 'rgba(251,146,60,0.10)'
              : 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 22 }}>{getPositionBadge(entry.position)}</div>
        <div style={{ fontWeight: 800 }}>{normalizeText(entry.player)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        <StatBox label='Tiempo' value={entry.time} strong />
        <StatBox label='Gap' value={entry.gap} />
      </div>

      {!isAdmin && onReserve ? <ReserveActionButton label={reserveActionLabel} onClick={onReserve} /> : null}

      {isAdmin ? (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
          <button style={miniButton} onClick={() => onEditEntry(entry)}>Editar</button>
          <button style={miniDanger} onClick={() => onDeleteEntry(entry.id)}>Eliminar</button>
        </div>
      ) : null}
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
  onReserveFromChallenge,
}) {
  const expired = useMemo(() => isChallengeExpired(challenge?.end_at, type), [challenge?.end_at, type])
  const title = type === 'weekly' ? '🏁 Desafío semanal' : '🏆 Desafío mensual'
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

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
          <div
            style={{
              textAlign: 'center',
              padding: '18px 14px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, opacity: 0.92, marginBottom: 8 }}>
              No hay un desafío activo en este momento
            </div>
            <div style={{ fontSize: 13, opacity: 0.78, lineHeight: 1.45, maxWidth: 540, margin: '0 auto' }}>
              Cuando se abra el próximo reto aparecerá aquí con su combo y su cuenta regresiva.
            </div>
          </div>
        )
      ) : (
        <>
          <ChallengeStatusBanner endAt={challenge.end_at} type={type} />
          <ChallengeSummary challenge={challenge} leaderboard={leaderboard} isMobile={isMobile} type={type} />

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
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 14,
                background: 'rgba(255,255,255,0.03)',
                marginBottom: 16,
              }}
            >
              <div style={{ textAlign: 'center', fontWeight: 900, marginBottom: 6 }}>Ajustes rápidos del desafío</div>
              <div style={{ textAlign: 'center', opacity: 0.74, fontSize: 13, marginBottom: 12 }}>
                Ajusta tiempos, corrige registros y ordena el marcador sin salir del retoina el reto completo desde aquí.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
                <button onClick={onDeleteChallenge} style={miniDanger}>Eliminar desafío y limpiar tiempos</button>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 14,
                background: 'rgba(255,255,255,0.03)',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Cómo aprovechar mejor este reto</div>
              <div style={{ opacity: 0.8, fontSize: 14 }}>
                Reserva, corre este combo, compara tu tiempo y vuelve para mejorar tu posición.
              </div>
            </div>
          )}

          {messageValue ? <div style={{ ...messageStyle, textAlign: 'center', marginBottom: 14 }}>{messageValue}</div> : null}

          {!leaderboard.length ? (
            <div
              style={{
                textAlign: 'center',
                padding: '18px 14px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, opacity: 0.92, marginBottom: 8 }}>
                Aún no hay tiempos cargados
              </div>
              <div style={{ fontSize: 13, opacity: 0.78, lineHeight: 1.45, maxWidth: 540, margin: '0 auto' }}>
                Sé el primero en marcar un tiempo y abrir este marcador.
              </div>
            </div>
          ) : isMobile ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {leaderboard.map((entry) => (
                <MobileLeaderboardCard
                  key={entry.id}
                  entry={entry}
                  isAdmin={isAdmin}
                  onEditEntry={onEditEntry}
                  onDeleteEntry={onDeleteEntry}
                  miniButton={miniButton}
                  miniDanger={miniDanger}
                  normalizeText={normalizeText}
                  reserveActionLabel={getReserveActionLabel(entry.position)}
                  onReserve={
                    onReserveFromChallenge
                      ? () =>
                          onReserveFromChallenge({
                            rankingType: type === 'weekly' ? 'WEEKLY' : 'MONTHLY',
                            position: entry.position,
                            gap: entry.gap,
                            game: challenge?.game,
                            track: challenge?.track,
                            player: normalizeText(entry.player),
                          })
                      : null
                  }
                />
              ))}
            </div>
          ) : (
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
              onReserveFromChallenge={onReserveFromChallenge}
              challenge={challenge}
              type={type}
            />
          )}
        </>
      )}
    </SectionCard>
  )
}
