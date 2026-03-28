export const BOOKING_LIMITS = {
  standard: 2,
  pro: 1,
}

export function getBookingLabel(standardCount, proCount) {
  const standard = Number(standardCount || 0)
  const pro = Number(proCount || 0)

  if (standard === 1 && pro === 0) return '1 ESTÁNDAR'
  if (standard === 0 && pro === 1) return '1 PRO'
  if (standard === 2 && pro === 0) return '2 ESTÁNDAR'
  if (standard === 1 && pro === 1) return '1 ESTÁNDAR + 1 PRO'
  if (standard === 2 && pro === 1) return '2 ESTÁNDAR + 1 PRO'

  const parts = []
  if (standard > 0) parts.push(`${standard} ESTÁNDAR`)
  if (pro > 0) parts.push(`${pro} PRO`)
  return parts.join(' + ') || 'SIN CONFIGURACIÓN'
}

export function parseBookingTypeLabel(label = '', simulators = 0) {
  const cleanLabel = String(label || '').toUpperCase().trim()

  if (cleanLabel.includes('2 ESTÁNDAR + 1 PRO')) return { standardCount: 2, proCount: 1 }
  if (cleanLabel.includes('1 ESTÁNDAR + 1 PRO')) return { standardCount: 1, proCount: 1 }
  if (cleanLabel.includes('2 ESTÁNDAR')) return { standardCount: 2, proCount: 0 }
  if (cleanLabel.includes('1 ESTÁNDAR')) return { standardCount: 1, proCount: 0 }
  if (cleanLabel.includes('1 PRO')) return { standardCount: 0, proCount: 1 }

  const total = Number(simulators || 0)
  if (total >= 3) return { standardCount: 2, proCount: 1 }
  if (total === 2) return { standardCount: 2, proCount: 0 }
  if (total === 1) return { standardCount: 1, proCount: 0 }

  return { standardCount: 0, proCount: 0 }
}

export function getBookingConfigFromBooking(booking) {
  return parseBookingTypeLabel(booking?.booking_type, booking?.simulators)
}

function timeToMinutes(time) {
  const [h, m] = String(time || '00:00').slice(0, 5).split(':').map(Number)
  return (Number(h || 0) * 60) + Number(m || 0)
}

function minutesToTime(minutes) {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function getDurationMinutes(duration) {
  return Number(duration || 0)
}

export function buildDailyTimeline(bookings = [], bookingDate = '', intervalMinutes = 30) {
  if (!bookingDate) return []

  const startMinutes = 10 * 60 + 30
  const endMinutes = 20 * 60
  const dayBookings = bookings.filter((booking) => booking.booking_date === bookingDate)
  const slots = []

  for (let minute = startMinutes; minute < endMinutes; minute += intervalMinutes) {
    let standardUsed = 0
    let proUsed = 0
    const relatedBookings = []

    dayBookings.forEach((booking) => {
      const bookingStart = timeToMinutes(String(booking.booking_time).slice(0, 5))
      const bookingEnd = bookingStart + getDurationMinutes(booking.duration)
      const overlaps = minute >= bookingStart && minute < bookingEnd

      if (!overlaps) return

      const config = getBookingConfigFromBooking(booking)
      standardUsed += config.standardCount
      proUsed += config.proCount
      relatedBookings.push(booking)
    })

    const fullyBusy = standardUsed >= BOOKING_LIMITS.standard && proUsed >= BOOKING_LIMITS.pro
    const partiallyBusy = !fullyBusy && (standardUsed > 0 || proUsed > 0)

    slots.push({
      time: minutesToTime(minute),
      standardUsed,
      proUsed,
      standardAvailable: Math.max(0, BOOKING_LIMITS.standard - standardUsed),
      proAvailable: Math.max(0, BOOKING_LIMITS.pro - proUsed),
      status: fullyBusy ? 'COMPLETO' : partiallyBusy ? 'PARCIAL' : 'LIBRE',
      relatedBookings,
      minute,
    })
  }

  return slots
}

export function buildFocusedTimeline(timeline = [], focusTime = '') {
  if (!timeline.length) return []

  const focusMinute = focusTime
    ? timeToMinutes(focusTime)
    : timeline.find((slot) => slot.relatedBookings.length > 0)?.minute ?? timeline[0].minute

  const minMinute = focusMinute - 120
  const maxMinute = focusMinute + 120

  const visible = timeline.filter((slot) => slot.minute >= minMinute && slot.minute <= maxMinute)

  return visible.length > 0 ? visible : timeline.slice(0, 5)
}
