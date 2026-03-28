export const GAME_ORDER = [
  'EA WRC',
  'DIRT RALLY 2.0',
  'ASSETTO CORSA RALLY',
  'F1 24',
  'F1 25',
  'ASSETTO CORSA COMPETIZIONE',
  'ASSETTO CORSA EVO',
  'LE MANS ULTIMATE',
]

export function buildTimeOptions(start, end, stepMinutes) {
  const result = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)

  let total = startH * 60 + startM
  const endTotal = endH * 60 + endM

  while (total <= endTotal) {
    const hh = String(Math.floor(total / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    result.push(`${hh}:${mm}`)
    total += stepMinutes
  }

  return result
}

export function timeToMinutes(timeString) {
  const [hh, mm] = String(timeString || '00:00').split(':').map(Number)
  return hh * 60 + mm
}

export function getDurationMinutes(duration) {
  return Number(duration || 0)
}

export function formatDateChile(dateValue) {
  if (!dateValue) return ''
  const [y, m, d] = String(dateValue).split('-')
  if (!y || !m || !d) return String(dateValue)
  return `${d}-${m}-${y}`
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

export function normalizePhone(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase()
}

export function isValidTimeFormat(value) {
  return /^\d+:\d{2}\.\d{3}$/.test(String(value || '').trim())
}

export function convertToMs(value) {
  const clean = String(value || '').trim()
  const [min, rest] = clean.split(':')
  if (!min || !rest) return 0
  const [sec, ms] = rest.split('.')
  if (sec == null || ms == null) return 0
  return parseInt(min, 10) * 60000 + parseInt(sec, 10) * 1000 + parseInt(ms, 10)
}

export function formatGap(ms) {
  if (ms <= 0) return '+0.000'
  return `+${(ms / 1000).toFixed(3)}`
}

export function getGameOrderIndex(game) {
  const normalized = normalizeText(game)
  const idx = GAME_ORDER.indexOf(normalized)
  return idx === -1 ? 999 : idx
}