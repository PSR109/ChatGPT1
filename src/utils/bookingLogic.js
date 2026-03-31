/**
 * COMPATIBILIDAD / WRAPPER
 * Este archivo ya no debe contener lógica principal de reservas.
 * Mantiene exports heredados delegando en bookingEngine.js para no romper componentes.
 */
import * as bookingEngine from './bookingEngine.js'

const OPEN_MINUTES = Number(bookingEngine.OPEN_MINUTES ?? 630)
const CLOSE_MINUTES = Number(bookingEngine.CLOSE_MINUTES ?? 1200)
const SLOT_STEP = 30

const timeToMinutes = (value) => {
  if (typeof bookingEngine.timeToMinutes === 'function') {
    return bookingEngine.timeToMinutes(value)
  }

  const [hours, minutes] = String(value ?? '').slice(0, 5).split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return (hours * 60) + minutes
}

const minutesToTime = (value) => {
  if (typeof bookingEngine.minutesToTime === 'function') {
    return bookingEngine.minutesToTime(value)
  }

  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  const hh = String(Math.floor(safe / 60)).padStart(2, '0')
  const mm = String(safe % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

const normalizeBooking = (booking = {}) => {
  if (typeof bookingEngine.normalizeBookingDraft === 'function') {
    return bookingEngine.normalizeBookingDraft(booking)
  }

  return { ...booking }
}

const getBookingRange = (booking = {}) => {
  const normalized = normalizeBooking(booking)
  const start = timeToMinutes(normalized.booking_time)
  const duration = Math.max(15, Number(normalized.duration || 30) || 30)

  if (start === null) {
    return { start: null, end: null }
  }

  return {
    start,
    end: start + duration,
  }
}

/**
 * Fuente de verdad:
 * usar siempre los campos persistidos standard_simulators y pro_simulators.
 */
export const getSimulatorBreakdown = (booking = {}) => {
  const standard = Number(booking.standard_simulators ?? 0)
  const pro = Number(booking.pro_simulators ?? 0)

  return {
    standard,
    pro,
    total: standard + pro,
  }
}

export const getBookingConfigFromBooking = (booking = {}) => {
  const { standard, pro, total } = getSimulatorBreakdown(booking)

  return {
    standard,
    pro,
    total,
    standardCount: standard,
    proCount: pro,
  }
}

export const buildDailyTimeline = (bookings = [], operationDate = '') => {
  if (!operationDate) return []

  const dayBookings = (bookings || []).filter(
    (booking) => String(booking?.booking_date ?? '') === String(operationDate)
  )

  const timeline = []

  for (let minutes = OPEN_MINUTES; minutes < CLOSE_MINUTES; minutes += SLOT_STEP) {
    const relatedBookings = dayBookings.filter((booking) => {
      const range = getBookingRange(booking)
      if (range.start === null || range.end === null) return false
      return minutes < range.end && range.start < (minutes + SLOT_STEP)
    })

    const usage = relatedBookings.reduce(
      (acc, booking) => {
        const config = getSimulatorBreakdown(booking)
        acc.standardUsed += config.standard
        acc.proUsed += config.pro
        return acc
      },
      { standardUsed: 0, proUsed: 0 }
    )

    const status =
      usage.standardUsed >= 2 && usage.proUsed >= 1
        ? 'full'
        : usage.standardUsed > 0 || usage.proUsed > 0
          ? 'partial'
          : 'free'

    timeline.push({
      time: minutesToTime(minutes),
      standardUsed: usage.standardUsed,
      proUsed: usage.proUsed,
      status,
      relatedBookings,
    })
  }

  return timeline
}

export const buildFocusedTimeline = (timeline = [], bookingTime = '') => {
  if (!Array.isArray(timeline) || timeline.length === 0) return []

  const target = timeToMinutes(bookingTime)
  if (target === null) {
    return timeline.slice(0, 4)
  }

  const indexed = timeline.map((slot, index) => ({
    slot,
    index,
    distance: Math.abs(timeToMinutes(slot.time) - target),
  }))

  indexed.sort((a, b) => a.distance - b.distance || a.index - b.index)

  const selectedIndexes = indexed
    .slice(0, 4)
    .map((item) => item.index)
    .sort((a, b) => a - b)

  return selectedIndexes.map((index) => timeline[index]).filter(Boolean)
}
