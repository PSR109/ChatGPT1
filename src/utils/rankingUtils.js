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

export function getSectionRecord(entries = []) {
  if (!entries.length) return null
  return entries[0]
}

export function buildRankingSectionMeta(entries = []) {
  const record = getSectionRecord(entries)

  return {
    participants: entries.length,
    recordTime: record?.time || '-',
    recordHolder: record?.player || '-',
    recordCar: record?.car || '-',
  }
}

export function buildGlobalRankingMeta(groupedRanking = []) {
  let sections = groupedRanking.length
  let totalParticipants = 0
  let bestRecord = null

  groupedRanking.forEach((section) => {
    totalParticipants += section.entries?.length || 0
    const record = getSectionRecord(section.entries || [])

    if (record && (!bestRecord || Number(record.time_ms) < Number(bestRecord.time_ms))) {
      bestRecord = {
        ...record,
        game: section.game,
        track: section.track,
      }
    }
  })

  return {
    sections,
    totalParticipants,
    bestRecordTime: bestRecord?.time || '-',
    bestRecordHolder: bestRecord?.player || '-',
    bestRecordLocation: bestRecord ? `${bestRecord.game} · ${bestRecord.track}` : '-',
  }
}
