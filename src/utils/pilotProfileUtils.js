function safeDate(value) {
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function average(values = []) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
}

function formatGapMs(ms) {
  const gap = Number(ms || 0)
  if (!Number.isFinite(gap) || gap <= 0) return '+0.000'

  const minutes = Math.floor(gap / 60000)
  const seconds = Math.floor((gap % 60000) / 1000)
  const milliseconds = gap % 1000

  if (minutes > 0) {
    return `+${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`
  }

  return `+${seconds}.${String(milliseconds).padStart(3, '0')}`
}

function buildGlobalBestByTrackAndPlayer(lapTimes = [], normalizeText) {
  const grouped = {}

  lapTimes.forEach((row) => {
    const player = normalizeText(row.player)
    const game = normalizeText(row.game)
    const track = normalizeText(row.track)
    const key = `${game}__${track}__${player}`

    if (!grouped[key] || Number(row.time_ms) < Number(grouped[key].time_ms)) {
      grouped[key] = {
        ...row,
        player,
        game,
        track,
      }
    }
  })

  return Object.values(grouped)
}

function buildGlobalTrackLeaderMap(lapTimes = [], normalizeText) {
  const bestByTrackAndPlayer = buildGlobalBestByTrackAndPlayer(lapTimes, normalizeText)
  const grouped = {}

  bestByTrackAndPlayer.forEach((row) => {
    const comboKey = `${row.game}__${row.track}`
    if (!grouped[comboKey]) grouped[comboKey] = []
    grouped[comboKey].push(row)
  })

  const leaderMap = {}
  const positionMap = {}

  Object.entries(grouped).forEach(([comboKey, rows]) => {
    const ordered = [...rows].sort((a, b) => Number(a.time_ms) - Number(b.time_ms))
    leaderMap[comboKey] = ordered[0]

    ordered.forEach((row, index) => {
      const positionKey = `${row.game}__${row.track}__${row.player}`
      positionMap[positionKey] = index + 1
    })
  })

  return { leaderMap, positionMap }
}

function inferTrendFromPilotLapTimes(pilotLapTimes = []) {
  if (pilotLapTimes.length < 2) {
    return {
      label: 'Sin suficiente historial',
      tone: 'neutral',
      detail: 'Aún no hay suficientes sesiones para medir una tendencia real.',
    }
  }

  const ordered = [...pilotLapTimes]
    .filter((row) => row.created_at)
    .sort((a, b) => safeDate(a.created_at) - safeDate(b.created_at))

  if (ordered.length < 2) {
    return {
      label: 'Sin suficiente historial',
      tone: 'neutral',
      detail: 'Aún no hay suficientes sesiones con fecha para comparar evolución.',
    }
  }

  const first = Number(ordered[0].time_ms || 0)
  const last = Number(ordered[ordered.length - 1].time_ms || 0)
  const delta = first - last

  if (delta > 0) {
    return {
      label: 'Va mejorando',
      tone: 'positive',
      detail: `Su última referencia mejora aprox. ${formatGapMs(delta).replace('+', '')} frente a su primera sesión registrada.`,
    }
  }

  if (delta < 0) {
    return {
      label: 'Va bajando',
      tone: 'warning',
      detail: `Su última referencia está aprox. ${formatGapMs(Math.abs(delta)).replace('+', '')} más lenta que al inicio.`,
    }
  }

  return {
    label: 'Se mantiene estable',
    tone: 'neutral',
    detail: 'No hay cambios claros entre su primera y última referencia registrada.',
  }
}

function buildRecentSessions(pilotLapTimes = [], leaderMap = {}) {
  return [...pilotLapTimes]
    .sort((a, b) => safeDate(b.created_at) - safeDate(a.created_at) || Number(a.time_ms) - Number(b.time_ms))
    .slice(0, 8)
    .map((row) => {
      const leader = leaderMap[`${row.game}__${row.track}`]
      const gapMs = leader ? Math.max(0, Number(row.time_ms) - Number(leader.time_ms)) : 0

      return {
        ...row,
        gapVsLeader: formatGapMs(gapMs),
        createdLabel: row.created_at ? new Date(row.created_at).toLocaleDateString('es-CL') : '-',
      }
    })
}

function getLevelLabel({ avgPosition, wins, points, lapCount }) {
  const avg = Number(avgPosition || 999)

  if (wins >= 3 || avg <= 1.8 || points >= 25) return 'Muy competitivo'
  if (wins >= 1 || avg <= 3 || points >= 12) return 'Competitivo'
  if (lapCount >= 5) return 'En progreso'
  return 'Recién comenzando'
}

function getMainFocus({ avgPosition, bestRows, lapCount }) {
  const top3Count = bestRows.filter((row) => typeof row.position === 'number' && row.position <= 3).length

  if (lapCount <= 3) return 'Sumar más vueltas registradas'
  if (Number(avgPosition || 999) > 3.5) return 'Acercarse al top 3 con más constancia'
  if (top3Count < 2) return 'Convertir buenos tiempos en resultados repetibles'
  return 'Mantener consistencia y buscar más victorias'
}

export function buildPilotProfileData({
  pilot,
  lapTimes = [],
  bookings = [],
  pointsLeaderboard = [],
  formatDateChile,
  normalizeText,
}) {
  const cleanPilot = normalizeText(pilot)
  const { leaderMap, positionMap } = buildGlobalTrackLeaderMap(lapTimes, normalizeText)

  const pilotLapTimes = lapTimes
    .filter((row) => normalizeText(row.player) === cleanPilot)
    .map((row) => ({
      ...row,
      player: normalizeText(row.player),
      game: normalizeText(row.game),
      track: normalizeText(row.track),
      car: normalizeText(row.car),
    }))

  const pilotBookings = bookings.filter((row) => normalizeText(row.client) === cleanPilot)
  const pointsEntry = pointsLeaderboard.find((row) => normalizeText(row.player) === cleanPilot)

  const bestByCombo = {}
  pilotLapTimes.forEach((row) => {
    const key = `${row.game}__${row.track}`
    if (!bestByCombo[key] || Number(row.time_ms) < Number(bestByCombo[key].time_ms)) {
      bestByCombo[key] = row
    }
  })

  const bestRows = Object.values(bestByCombo)
    .sort((a, b) => {
      if (a.game !== b.game) return a.game.localeCompare(b.game)
      return a.track.localeCompare(b.track)
    })
    .map((row) => {
      const comboKey = `${row.game}__${row.track}`
      const leader = leaderMap[comboKey]
      const positionKey = `${row.game}__${row.track}__${cleanPilot}`
      const position = positionMap[positionKey] || '-'
      const gapMs = leader ? Math.max(0, Number(row.time_ms) - Number(leader.time_ms)) : 0

      return {
        ...row,
        position,
        gapVsLeader: formatGapMs(gapMs),
        leaderTime: leader?.time || '-',
        leaderPlayer: leader?.player || '-',
      }
    })

  const gameMap = {}
  bestRows.forEach((row) => {
    if (!gameMap[row.game]) {
      gameMap[row.game] = {
        game: row.game,
        entries: 0,
        tracks: new Set(),
        positions: [],
        wins: 0,
        bestTimeMs: Number(row.time_ms),
        bestTime: row.time,
      }
    }

    const current = gameMap[row.game]
    current.entries += 1
    current.tracks.add(row.track)
    if (typeof row.position === 'number') current.positions.push(row.position)
    if (row.position === 1) current.wins += 1
    if (Number(row.time_ms) < current.bestTimeMs) {
      current.bestTimeMs = Number(row.time_ms)
      current.bestTime = row.time
    }
  })

  const gameSummaryRows = Object.values(gameMap)
    .map((row) => ({
      game: row.game,
      tracksCount: row.tracks.size,
      entries: row.entries,
      avgPosition: row.positions.length ? average(row.positions).toFixed(1) : '-',
      wins: row.wins,
      bestTime: row.bestTime,
    }))
    .sort((a, b) => {
      if (a.avgPosition === '-' && b.avgPosition !== '-') return 1
      if (b.avgPosition === '-' && a.avgPosition !== '-') return -1
      return Number(a.avgPosition || 999) - Number(b.avgPosition || 999) || b.entries - a.entries
    })

  const bookingRows = pilotBookings.map((booking) => ({
    kind: 'Reserva',
    label: `${booking.reservation_kind || 'LOCAL'} · ${booking.booking_type || booking.simulators || '-'}`,
    date: formatDateChile(booking.booking_date),
    value: `$${Number(booking.total || 0).toLocaleString('es-CL')}`,
    sortValue: safeDate(booking.booking_date),
  }))

  const lapHistoryRows = pilotLapTimes.map((row) => ({
    kind: 'Tiempo',
    label: `${row.game} · ${row.track}`,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString('es-CL') : '-',
    value: row.time,
    sortValue: safeDate(row.created_at),
  }))

  const historyRows = [...bookingRows, ...lapHistoryRows]
    .sort((a, b) => b.sortValue - a.sortValue || a.label.localeCompare(b.label))
    .slice(0, 20)

  const gamesCount = new Set(pilotLapTimes.map((row) => row.game).filter(Boolean)).size
  const tracksCount = new Set(pilotLapTimes.map((row) => `${row.game}__${row.track}`).filter(Boolean)).size
  const bestTimeRow = [...pilotLapTimes].sort((a, b) => Number(a.time_ms) - Number(b.time_ms))[0]

  const positions = bestRows
    .map((row) => row.position)
    .filter((value) => typeof value === 'number')

  const summary = {
    points: Number(pointsEntry?.points || 0),
    bookingsCount: pilotBookings.length,
    gamesCount,
    tracksCount,
    lapCount: pilotLapTimes.length,
    bestTime: bestTimeRow?.time || '-',
    avgPosition: positions.length ? average(positions).toFixed(1) : '-',
    wins: bestRows.filter((row) => row.position === 1).length,
  }

  const strongestGame = gameSummaryRows[0]?.game || '-'
  const mostPlayedGame = [...gameSummaryRows].sort((a, b) => b.entries - a.entries)[0]?.game || '-'
  const top3Count = bestRows.filter((row) => typeof row.position === 'number' && row.position <= 3).length
  const podiumRate = bestRows.length ? `${Math.round((top3Count / bestRows.length) * 100)}%` : '0%'
  const levelLabel = getLevelLabel({ ...summary, bestRows })
  const mainFocus = getMainFocus({ ...summary, bestRows })
  const trend = inferTrendFromPilotLapTimes(pilotLapTimes)

  const recentSessions = buildRecentSessions(pilotLapTimes, leaderMap)

  const quickSummary = [
    { label: 'Nivel actual', value: levelLabel },
    { label: 'Juego más fuerte', value: strongestGame },
    { label: 'Juego con más actividad', value: mostPlayedGame },
    { label: 'Presencia en top 3', value: podiumRate },
    { label: 'En qué enfocarse', value: mainFocus },
  ]

  const simpleHighlights = [
    {
      title: 'Lo mejor del piloto',
      value: strongestGame,
      description: strongestGame === '-' ? 'Aún no hay suficiente información para definir su punto fuerte.' : `Su mejor rendimiento general aparece en ${strongestGame}.`,
      tone: 'positive',
    },
    {
      title: 'Estado actual',
      value: trend.label,
      description: trend.detail,
      tone: trend.tone,
    },
    {
      title: 'Prioridad clara',
      value: mainFocus,
      description: 'Este es el siguiente paso más lógico para mejorar resultados y consistencia.',
      tone: 'neutral',
    },
  ]

  return {
    summary,
    bestRows,
    gameSummaryRows,
    historyRows,
    recentSessions,
    quickSummary,
    simpleHighlights,
  }
}
