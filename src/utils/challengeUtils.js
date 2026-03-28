const CHILE_TIME_ZONE = 'America/Santiago'

function getTimeZoneParts(date = new Date(), timeZone = CHILE_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const values = {}

  parts.forEach((part) => {
    if (part.type !== 'literal') {
      values[part.type] = part.value
    }
  })

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  }
}

function getDateFromTimeZoneParts(parts, timeZone = CHILE_TIME_ZONE) {
  const guessUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0)
  const guessDate = new Date(guessUtc)
  const zonedGuess = getTimeZoneParts(guessDate, timeZone)

  const desiredAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0)
  const zonedAsUtc = Date.UTC(
    zonedGuess.year,
    zonedGuess.month - 1,
    zonedGuess.day,
    zonedGuess.hour,
    zonedGuess.minute,
    zonedGuess.second || 0,
  )

  return new Date(guessUtc + (desiredAsUtc - zonedAsUtc))
}

function getCurrentChileDate() {
  return getDateFromTimeZoneParts(getTimeZoneParts(new Date(), CHILE_TIME_ZONE), CHILE_TIME_ZONE)
}

function getWeeklyPeriodEndDate() {
  const nowParts = getTimeZoneParts(new Date(), CHILE_TIME_ZONE)
  const currentLocalDate = new Date(nowParts.year, nowParts.month - 1, nowParts.day)
  const dayOfWeek = currentLocalDate.getDay()
  const daysUntilSunday = (7 - dayOfWeek) % 7

  return getDateFromTimeZoneParts(
    {
      year: nowParts.year,
      month: nowParts.month,
      day: nowParts.day + daysUntilSunday,
      hour: 23,
      minute: 59,
      second: 59,
    },
    CHILE_TIME_ZONE,
  )
}

function getMonthlyPeriodEndDate() {
  const nowParts = getTimeZoneParts(new Date(), CHILE_TIME_ZONE)
  const lastDay = new Date(nowParts.year, nowParts.month, 0).getDate()

  return getDateFromTimeZoneParts(
    {
      year: nowParts.year,
      month: nowParts.month,
      day: lastDay,
      hour: 23,
      minute: 59,
      second: 59,
    },
    CHILE_TIME_ZONE,
  )
}

function resolveTargetEndDate(endAt, type) {
  if (type === 'weekly') return getWeeklyPeriodEndDate()
  if (type === 'monthly') return getMonthlyPeriodEndDate()
  if (!endAt) return null

  const parsed = new Date(endAt)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getRemainingMs(endAt, type) {
  const targetDate = resolveTargetEndDate(endAt, type)
  if (!targetDate) return 0
  return Math.max(0, targetDate.getTime() - Date.now())
}

export function isChallengeExpired(endAt, type) {
  return getRemainingMs(endAt, type) <= 0
}

export function formatCountdown(endAt, type) {
  const remaining = getRemainingMs(endAt, type)

  if (remaining <= 0) {
    return 'Finalizado'
  }

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
  }

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
}

export function getChallengeStatus(endAt, type) {
  const remaining = getRemainingMs(endAt, type)

  if (remaining <= 0) return 'FINALIZADO'
  if (remaining <= 6 * 60 * 60 * 1000) return 'CIERRA PRONTO'
  if (remaining <= 24 * 60 * 60 * 1000) return 'ÚLTIMO DÍA'
  return 'ACTIVO'
}

export function getStatusColors(status) {
  if (status === 'FINALIZADO') {
    return {
      border: '1px solid rgba(239,68,68,0.35)',
      background: 'rgba(239,68,68,0.12)',
      color: '#fecaca',
    }
  }

  if (status === 'CIERRA PRONTO' || status === 'ÚLTIMO DÍA') {
    return {
      border: '1px solid rgba(245,158,11,0.35)',
      background: 'rgba(245,158,11,0.12)',
      color: '#fde68a',
    }
  }

  return {
    border: '1px solid rgba(34,197,94,0.35)',
    background: 'rgba(34,197,94,0.12)',
    color: '#bbf7d0',
  }
}

export function getPositionBadge(position) {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return `#${position}`
}
