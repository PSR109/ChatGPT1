
export function filterValidRankingEntries(entries = []) {
  return (entries || []).filter((e) => {
    const time = Number(e?.time_ms)
    const pilot = getPilotName(e)
    return Number.isFinite(time) && time > 0 && pilot && pilot !== 'Sin nombre'
  })
}


export function getUniquePilots(entries = []) {
  const seen = new Set()
  return entries.filter((e) => {
    const name = getPilotName(e)
    if (!name || name === 'Sin nombre') return false
    if (seen.has(name)) return false
    seen.add(name)
    return true
  })
}



function normalizeTextValue(value, fallback = '-') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function getNumericTimeMs(entry = {}) {
  const numeric = Number(entry?.time_ms)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : Number.POSITIVE_INFINITY
}

export const getPilotName = (entry = {}) => {
  return normalizeTextValue(entry?.player || entry?.pilot || entry?.pilot_name, 'Sin nombre')
}
export function getRankingBadge(position) {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return `#${position}`
}

export function getRankingRowAccent(position) {
  if (position === 1) {
    return {
      background: 'rgba(250, 204, 21, 0.12)',
      fontWeight: 700,
    }
  }

  if (position === 2) {
    return {
      background: 'rgba(148, 163, 184, 0.12)',
      fontWeight: 600,
    }
  }

  if (position === 3) {
    return {
      background: 'rgba(251, 146, 60, 0.12)',
      fontWeight: 600,
    }
  }

  return {}
}

export function getRankingHighlight(position) {
  if (position === 1) {
    return {
      label: 'LÍDER ACTUAL',
      shortLabel: 'LÍDER',
      border: '1px solid rgba(250,204,21,0.30)',
      background: 'rgba(250,204,21,0.14)',
      color: '#fde68a',
    }
  }

  if (position === 2) {
    return {
      label: 'TOP 3',
      shortLabel: 'TOP 3',
      border: '1px solid rgba(148,163,184,0.26)',
      background: 'rgba(148,163,184,0.12)',
      color: '#e2e8f0',
    }
  }

  if (position === 3) {
    return {
      label: 'TOP 3',
      shortLabel: 'TOP 3',
      border: '1px solid rgba(251,146,60,0.28)',
      background: 'rgba(251,146,60,0.14)',
      color: '#fed7aa',
    }
  }

  return {
    label: 'EN CARRERA',
    shortLabel: 'EN CARRERA',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.86)',
  }
}

export function getSectionRecord(entries = []) {
  if (!entries.length) return null
  return entries[0]
}

export function buildRankingSectionMeta(entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : []
  const record = getSectionRecord(
    [...safeEntries].sort((a, b) => getNumericTimeMs(a) - getNumericTimeMs(b))
  )

  return {
    participants: getUniqueParticipantsCount(safeEntries),
    recordTime: normalizeTextValue(record?.time),
    recordHolder: getPilotName(record),
    recordCar: normalizeTextValue(record?.car),
  }
}

export function buildGlobalRankingMeta(groupedRanking = []) {
  const safeSections = Array.isArray(groupedRanking) ? groupedRanking : []
  const sections = safeSections.length
  let totalEntries = 0
  let bestRecord = null
  const uniquePilots = new Set()

  safeSections.forEach((section) => {
    const entries = Array.isArray(section?.entries) ? section.entries : []
    totalEntries += entries.length

    entries.forEach((entry) => {
      const normalizedPlayer = getPilotName(entry).trim().toUpperCase()
      if (normalizedPlayer && normalizedPlayer !== 'SIN NOMBRE') uniquePilots.add(normalizedPlayer)
    })

    const record = getSectionRecord(
      [...entries].sort((a, b) => getNumericTimeMs(a) - getNumericTimeMs(b))
    )

    if (record && (!bestRecord || getNumericTimeMs(record) < getNumericTimeMs(bestRecord))) {
      bestRecord = {
        ...record,
        game: normalizeTextValue(section?.game),
        track: normalizeTextValue(section?.track),
      }
    }
  })

  return {
    sections,
    totalEntries,
    totalParticipants: uniquePilots.size,
    uniquePilots: uniquePilots.size,
    bestRecordTime: normalizeTextValue(bestRecord?.time),
    bestRecordHolder: getPilotName(bestRecord),
    bestRecordLocation: bestRecord ? `${bestRecord.game} · ${bestRecord.track}` : '-',
  }
}

export const getUniqueParticipantsCount = (entries = []) => {
  const safeEntries = Array.isArray(entries) ? entries : []
  const unique = new Set(
    safeEntries
      .map((entry) => getPilotName(entry))
      .filter((name) => name && name !== 'Sin nombre')
      .map((name) => name.trim().toUpperCase())
  )

  return unique.size
}
