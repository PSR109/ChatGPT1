import React from 'react'

export const BOOKING_OPTIONS = {
  '1_ESTANDAR': {
    label: '1 ESTÁNDAR',
    simulators: 1,
    pricingModel: ['ESTANDAR'],
  },
  '1_PRO': {
    label: '1 PRO',
    simulators: 1,
    pricingModel: ['PRO'],
  },
  '2_ESTANDAR': {
    label: '2 ESTÁNDAR',
    simulators: 2,
    pricingModel: ['ESTANDAR', 'ESTANDAR'],
  },
  '1_ESTANDAR_1_PRO': {
    label: '1 ESTÁNDAR + 1 PRO',
    simulators: 2,
    pricingModel: ['ESTANDAR', 'PRO'],
  },
  '3_SIMULADORES': {
    label: '3 SIMULADORES',
    simulators: 3,
    pricingModel: ['ESTANDAR', 'ESTANDAR', 'PRO'],
  },
}

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

export const TIME_OPTIONS = buildTimeOptions('10:30', '20:00', 30)

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

export function calculateSingleSimulatorPrice(type, minutes) {
  const m = Number(minutes)

  const rates = {
    ESTANDAR: { base15: 9000, base30: 16000, hour: 28000 },
    PRO: { base15: 10000, base30: 18000, hour: 32000 },
  }

  const cfg = rates[type]
  if (!cfg || m < 15) return 0

  const minuteRate = cfg.hour / 60

  if (m === 15) return cfg.base15
  if (m === 30) return cfg.base30
  if (m === 60) return cfg.hour
  if (m >= 16 && m <= 29) return cfg.base15 + minuteRate * (m - 15)
  if (m >= 31 && m <= 59) return cfg.base30 + minuteRate * (m - 30)
  if (m > 60) return minuteRate * m

  return 0
}

export function calculateBookingTotal(configKey, duration) {
  const config = BOOKING_OPTIONS[configKey]
  if (!config) return 0

  const total = config.pricingModel.reduce((sum, simulatorType) => {
    return sum + calculateSingleSimulatorPrice(simulatorType, duration)
  }, 0)

  return Math.round(total)
}

export function getBookingAvailability(bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId = null) {
  if (!bookingDate) {
    return {
      unavailableTimes: [],
      availableTimeOptions: TIME_OPTIONS,
      suggestedTimes: [],
    }
  }

  const selectedConfig = BOOKING_OPTIONS[bookingConfig]
  const neededSims = selectedConfig?.simulators || 1
  const durationMinutes = getDurationMinutes(bookingDuration)

  const unavailableTimes = TIME_OPTIONS.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + durationMinutes

    let reservedSims = 0

    bookings.forEach((booking) => {
      if (editingBookingId && booking.id === editingBookingId) return
      if (booking.booking_date !== bookingDate) return

      const existingStart = timeToMinutes(String(booking.booking_time).slice(0, 5))
      const existingEnd = existingStart + getDurationMinutes(booking.duration)
      const overlap = slotStart < existingEnd && slotEnd > existingStart

      if (overlap) reservedSims += Number(booking.simulators || 0)
    })

    return reservedSims + neededSims > 3
  })

  const availableTimeOptions = TIME_OPTIONS.filter((slot) => !unavailableTimes.includes(slot))
  const suggestedTimes = availableTimeOptions.slice(0, 4)

  return { unavailableTimes, availableTimeOptions, suggestedTimes }
}

export function buildChallengeLeaderboard(entries) {
  const sorted = [...entries]
    .map((entry) => ({
      ...entry,
      player: normalizeText(entry.player),
    }))
    .sort((a, b) => a.time_ms - b.time_ms)

  const best = sorted[0]?.time_ms || 0

  return sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
    gap: formatGap(entry.time_ms - best),
  }))
}

export const page = {
  minHeight: '100vh',
  background: '#0b1020',
  color: '#f4f7fb',
  padding: '24px 12px',
  fontFamily: 'Arial, sans-serif',
}

export const container = {
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
}

export const hero = {
  marginBottom: 20,
}

export const title = {
  margin: 0,
  fontSize: 32,
  fontWeight: 800,
}

export const subtitle = {
  margin: '8px 0 0',
  color: '#aab6d3',
}

export const modeWrap = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginBottom: 14,
}

export const modeButton = {
  border: '1px solid #2a3552',
  background: '#101827',
  color: '#e8eefc',
  padding: '10px 14px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
}

export const modeButtonActive = {
  ...modeButton,
  background: '#00a86b',
  borderColor: '#00a86b',
}

export const tabs = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 20,
}

export const tab = {
  border: '1px solid #2a3552',
  background: '#131a2b',
  color: '#e8eefc',
  padding: '10px 14px',
  borderRadius: 10,
  cursor: 'pointer',
}

export const tabActive = {
  ...tab,
  background: '#2142ff',
  borderColor: '#2142ff',
}

export const card = {
  background: '#131a2b',
  border: '1px solid #222c45',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
}

export const sectionTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 20,
}

export const line = {
  margin: '6px 0',
}

export const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
  marginBottom: 12,
}

export const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #31405f',
  background: '#0d1425',
  color: '#f4f7fb',
  boxSizing: 'border-box',
}

export const buttonRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 10,
}

export const buttonRowSmall = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
}

export const button = {
  border: 'none',
  background: '#2142ff',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
}

export const buttonSecondary = {
  border: '1px solid #445174',
  background: 'transparent',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  cursor: 'pointer',
}

export const miniButton = {
  border: 'none',
  background: '#2142ff',
  color: '#fff',
  padding: '6px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
}

export const miniDanger = {
  border: 'none',
  background: '#b42318',
  color: '#fff',
  padding: '6px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
}

export const messageStyle = {
  marginTop: 10,
  color: '#9bc0ff',
  fontWeight: 700,
}

export const checkboxRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  margin: '10px 0',
}

export const tableWrap = {
  width: '100%',
  overflowX: 'auto',
}

export const table = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 760,
}

export const th = {
  textAlign: 'left',
  padding: '10px 8px',
  borderBottom: '1px solid #2f3b59',
  color: '#aab6d3',
  fontSize: 13,
}

export const td = {
  padding: '10px 8px',
  borderBottom: '1px solid #202940',
  fontSize: 14,
}

export const MemoButton = React.memo(function MemoButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={active ? tabActive : tab}>
      {children}
    </button>
  )
})