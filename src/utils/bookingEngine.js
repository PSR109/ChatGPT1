/**
 * ACTIVE / FUENTE PRINCIPAL DE RESERVAS
 * Motor real de disponibilidad, validación y helpers compartidos de reservas.
 * Antes de tocar contratos heredados, validar aquí la lógica actual.
 */
const APP_BOOKING_OPTIONS = {
  '1_ESTANDAR': {
    key: '1_ESTANDAR',
    reservationKind: 'standard-1',
    label: '1 ESTÁNDAR',
    simulators: 1,
    standard: 1,
    pro: 0,
    pricingModel: ['ESTANDAR'],
  },
  '1_PRO': {
    key: '1_PRO',
    reservationKind: 'pro-1',
    label: '1 PRO',
    simulators: 1,
    standard: 0,
    pro: 1,
    pricingModel: ['PRO'],
  },
  '2_ESTANDAR': {
    key: '2_ESTANDAR',
    reservationKind: 'standard-2',
    label: '2 ESTÁNDAR',
    simulators: 2,
    standard: 2,
    pro: 0,
    pricingModel: ['ESTANDAR', 'ESTANDAR'],
  },
  '1_ESTANDAR_1_PRO': {
    key: '1_ESTANDAR_1_PRO',
    reservationKind: 'mixed-1-1',
    label: '1 ESTÁNDAR + 1 PRO',
    simulators: 2,
    standard: 1,
    pro: 1,
    pricingModel: ['ESTANDAR', 'PRO'],
  },
  '3_SIMULADORES': {
    key: '3_SIMULADORES',
    reservationKind: 'all-3',
    label: '3 SIMULADORES',
    simulators: 3,
    standard: 2,
    pro: 1,
    pricingModel: ['ESTANDAR', 'ESTANDAR', 'PRO'],
  },
}

export const RESERVATION_KIND_OPTIONS = Object.values(APP_BOOKING_OPTIONS).map((option) => ({
  id: option.reservationKind,
  label: option.label,
  standard: option.standard,
  pro: option.pro,
  simulators: option.simulators,
  simulator_config_id: option.key,
}))

export const OPEN_MINUTES = 10 * 60 + 30
export const CLOSE_MINUTES = 20 * 60
export const BOOKING_LIMITS = { standard: 2, pro: 1 }

const RESERVATION_KIND_TO_KEY = RESERVATION_KIND_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.simulator_config_id
  return acc
}, {})

function normalizeText(value = '') {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function normalizePhone(value = '') {
  return String(value ?? '').replace(/[^\d+]/g, '').trim()
}

export function minutesToTime(minutes) {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0
  const hh = String(Math.floor(safeMinutes / 60)).padStart(2, '0')
  const mm = String(safeMinutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export function timeToMinutes(time) {
  const [hours, minutes] = String(time ?? '').slice(0, 5).split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return (hours * 60) + minutes
}

export function formatCurrency(value = 0) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function getOptionByKey(configKey = '1_ESTANDAR') {
  return APP_BOOKING_OPTIONS[configKey] || APP_BOOKING_OPTIONS['1_ESTANDAR']
}

function getOptionByReservationKind(kind = 'standard-1') {
  return getOptionByKey(RESERVATION_KIND_TO_KEY[kind] || '1_ESTANDAR')
}

function inferConfigFromLabels(row = {}) {
  const bookingType = String(row.booking_type ?? row.reservation_kind ?? '').toUpperCase().trim()
  const totalSimulators = Number(row.simulators ?? 0)

  if (bookingType.includes('2 ESTÁNDAR + 1 PRO')) return { standard: 2, pro: 1 }
  if (bookingType.includes('1 ESTÁNDAR + 1 PRO')) return { standard: 1, pro: 1 }
  if (bookingType.includes('2 ESTÁNDAR')) return { standard: 2, pro: 0 }
  if (bookingType.includes('1 ESTÁNDAR')) return { standard: 1, pro: 0 }
  if (bookingType.includes('1 PRO')) return { standard: 0, pro: 1 }

  if (row.reservation_kind && RESERVATION_KIND_TO_KEY[row.reservation_kind]) {
    const option = getOptionByReservationKind(row.reservation_kind)
    return { standard: option.standard, pro: option.pro }
  }

  if (totalSimulators >= 3) return { standard: 2, pro: 1 }
  if (totalSimulators === 2) return { standard: 2, pro: 0 }
  if (totalSimulators === 1) return { standard: 1, pro: 0 }

  return { standard: 0, pro: 0 }
}

export function inferSimulatorConfig(booking = {}) {
  const explicitStandard = Number(booking.standard_simulators ?? booking.standard_count ?? booking.standard_quantity ?? 0)
  const explicitPro = Number(booking.pro_simulators ?? booking.pro_count ?? booking.pro_quantity ?? 0)

  if (explicitStandard > 0 || explicitPro > 0) {
    return { standard: explicitStandard, pro: explicitPro }
  }

  return inferConfigFromLabels(booking)
}

export function getBookingOptionKeyFromBooking(row = {}) {
  const config = inferSimulatorConfig(row)

  if (config.standard === 1 && config.pro === 0) return '1_ESTANDAR'
  if (config.standard === 0 && config.pro === 1) return '1_PRO'
  if (config.standard === 2 && config.pro === 0) return '2_ESTANDAR'
  if (config.standard === 1 && config.pro === 1) return '1_ESTANDAR_1_PRO'
  if (config.standard >= 2 && config.pro >= 1) return '3_SIMULADORES'

  return '1_ESTANDAR'
}

export function normalizeBookingDraft(payload = {}) {
  const draft = { ...payload }
  const duration = Math.max(15, Math.round(Number(draft.duration || 30) || 30))
  const bookingDate = String(draft.booking_date ?? draft.date ?? '').trim()
  const bookingTime = String(draft.booking_time ?? draft.time ?? '').slice(0, 5)

  const configKey = String(
    draft.simulator_config_id
    ?? draft.simulatorConfigId
    ?? RESERVATION_KIND_TO_KEY[draft.reservation_kind]
    ?? draft.booking_option
    ?? '1_ESTANDAR'
  )

  const config = getOptionByKey(configKey)

  return {
    ...draft,
    client: normalizeText(draft.client),
    phone: normalizePhone(draft.phone),
    booking_date: bookingDate,
    booking_time: bookingTime,
    duration,
    simulators: Number(draft.simulators ?? config.simulators),
    simulator_config_id: config.key,
    reservation_kind: draft.reservation_kind ?? config.reservationKind,
    standard_simulators: Number(draft.standard_simulators ?? config.standard),
    pro_simulators: Number(draft.pro_simulators ?? config.pro),
  }
}

function getReservationRange(booking = {}) {
  const normalized = normalizeBookingDraft(booking)
  const start = timeToMinutes(normalized.booking_time)
  const duration = Math.max(15, Number(normalized.duration || 30))
  const end = start === null ? null : start + duration

  return {
    start,
    end,
    duration,
    startTime: normalized.booking_time,
    endTime: end === null ? '' : minutesToTime(end),
  }
}

export function getConflicts(payload, bookings = [], ignoreId = null) {
  const draft = normalizeBookingDraft(payload)
  const candidateRange = getReservationRange(draft)
  const candidateConfig = inferSimulatorConfig(draft)

  if (candidateRange.start === null || candidateRange.end === null) return []

  return (bookings || []).filter((booking) => {
    if (ignoreId !== null && String(booking?.id) === String(ignoreId)) return false
    if (String(booking?.booking_date ?? '') !== String(draft.booking_date ?? '')) return false

    const currentRange = getReservationRange(booking)
    if (currentRange.start === null || currentRange.end === null) return false

    const overlap = candidateRange.start < currentRange.end && currentRange.start < candidateRange.end
    if (!overlap) return false

    const currentConfig = inferSimulatorConfig(booking)
    return (candidateConfig.standard + currentConfig.standard) > BOOKING_LIMITS.standard
      || (candidateConfig.pro + currentConfig.pro) > BOOKING_LIMITS.pro
  })
}

export function validateBookingPayload(payload, bookings = [], ignoreId = null) {
  const draft = normalizeBookingDraft(payload)
  const errors = []

  if (!draft.client) errors.push('Debes ingresar el nombre del cliente.')
  if (!draft.phone) errors.push('Debes ingresar teléfono o WhatsApp.')
  if (!draft.booking_date) errors.push('Debes seleccionar una fecha.')
  if (!draft.booking_time) errors.push('Debes seleccionar una hora.')

  const startMinutes = timeToMinutes(draft.booking_time)
  if (startMinutes === null) {
    errors.push('La hora seleccionada no es válida.')
  } else {
    const endMinutes = startMinutes + Number(draft.duration || 30)
    if (startMinutes < OPEN_MINUTES) errors.push('La reserva no puede comenzar antes de las 10:30.')
    if (endMinutes > CLOSE_MINUTES) errors.push('La reserva no puede terminar después de las 20:00.')
  }

  const conflicts = getConflicts(draft, bookings, ignoreId)
  if (conflicts.length > 0) {
    errors.push('Ese horario genera conflicto con otra reserva para los simuladores elegidos.')
  }

  return {
    valid: errors.length === 0,
    errors,
    conflicts,
    duration: Number(draft.duration || 30),
    normalized: draft,
  }
}

export function normalizeBooking(row = {}) {
  const normalized = normalizeBookingDraft(row)
  const config = inferSimulatorConfig(normalized)
  const option = getOptionByKey(getBookingOptionKeyFromBooking(normalized))

  return {
    ...row,
    ...normalized,
    booking_type: row.booking_type ?? option.label,
    config,
    range: getReservationRange(normalized),
  }
}

export function getImmediateAvailability(form, bookings = [], ignoreId = null) {
  const normalized = normalizeBookingDraft(form)
  const conflicts = getConflicts(normalized, bookings, ignoreId)
  const candidateConfig = inferSimulatorConfig(normalized)

  let standardUsed = 0
  let proUsed = 0

  conflicts.forEach((booking) => {
    const config = inferSimulatorConfig(booking)
    standardUsed += config.standard
    proUsed += config.pro
  })

  return {
    conflicts,
    standardUsed,
    proUsed,
    standardFree: Math.max(0, BOOKING_LIMITS.standard - standardUsed - candidateConfig.standard),
    proFree: Math.max(0, BOOKING_LIMITS.pro - proUsed - candidateConfig.pro),
  }
}

export function generateTimelineRows(bookings = [], bookingDate = '', focusTime = '') {
  if (!bookingDate) return []

  const focusMinutes = timeToMinutes(focusTime) ?? OPEN_MINUTES
  const minMinutes = focusMinutes - 120
  const maxMinutes = focusMinutes + 120

  return (bookings || [])
    .filter((booking) => String(booking.booking_date ?? '') === String(bookingDate))
    .map((booking) => normalizeBooking(booking))
    .filter((booking) => booking.range.start !== null && booking.range.end !== null)
    .filter((booking) => booking.range.start <= maxMinutes && booking.range.end >= minMinutes)
    .sort((a, b) => a.range.start - b.range.start)
}

export function summarizeBookings(rows = []) {
  return (rows || []).reduce((summary, row) => {
    const booking = normalizeBooking(row)
    summary.totalReservations += 1
    summary.totalRevenue += Number(row.total || 0)
    summary.standardMinutes += Number(booking.duration || 0) * Number(booking.config.standard || 0)
    summary.proMinutes += Number(booking.duration || 0) * Number(booking.config.pro || 0)
    return summary
  }, {
    totalReservations: 0,
    totalRevenue: 0,
    standardMinutes: 0,
    proMinutes: 0,
  })
}

export function getImmediateAvailabilitySummary(form, bookings = [], ignoreId = null) {
  return getImmediateAvailability(form, bookings, ignoreId)
}

export function buildTimeOptions(intervalMinutes = 30) {
  const options = []
  for (let minute = OPEN_MINUTES; minute <= CLOSE_MINUTES - intervalMinutes; minute += intervalMinutes) {
    options.push(minutesToTime(minute))
  }
  return options
}
