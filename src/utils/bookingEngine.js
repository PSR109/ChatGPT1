/**
 * ACTIVE / FUENTE PRINCIPAL DE RESERVAS
 * Motor real de disponibilidad, validación y helpers compartidos de reservas.
 * Antes de tocar contratos heredados, validar aquí la lógica actual.
 */
export const BOOKING_OPTIONS = {
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

export const RESERVATION_KIND_OPTIONS = Object.values(BOOKING_OPTIONS).map((option) => ({
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
export const BOOKING_DURATION_OPTIONS = [30, 60, 90, 120, 150, 180]

export const COMMERCIAL_BOOKING_PREFILLS = {
  aprender: {
    bookingKind: 'LOCAL',
    bookingConfig: '1_ESTANDAR',
    bookingDuration: 30,
    sourceLabel: 'Práctica',
    message: 'Reserva preconfigurada desde sección comercial: Práctica',
  },
  empresa: {
    bookingKind: 'EMPRESA',
    bookingConfig: '3_SIMULADORES',
    bookingDuration: 120,
    sourceLabel: 'Empresa',
    message: 'Reserva preconfigurada desde sección comercial: Empresa',
  },
  evento: {
    bookingKind: 'EVENTO',
    bookingConfig: '3_SIMULADORES',
    bookingDuration: 120,
    sourceLabel: 'Evento',
    message: 'Reserva preconfigurada desde sección comercial: Evento',
  },
  activacion: {
    bookingKind: 'EVENTO',
    bookingConfig: '3_SIMULADORES',
    bookingDuration: 120,
    sourceLabel: 'Activación',
    message: 'Reserva preconfigurada desde sección comercial: Activación',
  },
}

const RESERVATION_KIND_TO_KEY = RESERVATION_KIND_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.simulator_config_id
  return acc
}, {})



const DB_CAPACITY_ERROR_MAP = {
  PSR_STANDARD_CAPACITY_EXCEEDED: 'Ya no quedan simuladores estándar disponibles para ese horario.',
  PSR_PRO_CAPACITY_EXCEEDED: 'El simulador pro ya está ocupado en ese horario.',
  PSR_TOTAL_CAPACITY_EXCEEDED: 'Ya no quedan simuladores disponibles para ese horario.',
  PSR_BOOKING_INVALID_DURATION: 'La duración de la reserva no es válida.',
  PSR_BOOKING_INVALID_START: 'La hora de inicio de la reserva no es válida.',
}

export function getBookingDbErrorCode(error) {
  const candidates = [
    error?.message,
    error?.details,
    error?.hint,
    error?.code,
    error?.error_description,
  ]

  for (const value of candidates) {
    const text = String(value ?? '')
    const match = text.match(/PSR_[A-Z_]+/)
    if (match) return match[0]
  }

  return ''
}

export function isBookingDbCapacityError(error) {
  return Boolean(DB_CAPACITY_ERROR_MAP[getBookingDbErrorCode(error)])
}

export function getBookingDbCapacityMessage(error) {
  const code = getBookingDbErrorCode(error)
  return DB_CAPACITY_ERROR_MAP[code] || 'Ese horario ya no está disponible. Elige otro horario.'
}
const BUSINESS_BOOKING_KIND_LABELS = {
  LOCAL: 'Personas',
  NORMAL: 'Personas',
  EVENTO: 'Eventos',
  EMPRESA: 'Empresas',
  GIFT_CARD: 'Gift Card',
}

export function normalizeCommercialBookingKind(value = '') {
  const normalized = String(value ?? '').trim().toUpperCase()

  if (!normalized) return 'LOCAL'
  if (['LOCAL', 'NORMAL', 'PERSONAS', 'PERSONA'].includes(normalized)) return 'LOCAL'
  if (['EVENTO', 'EVENTOS'].includes(normalized)) return 'EVENTO'
  if (['EMPRESA', 'EMPRESAS'].includes(normalized)) return 'EMPRESA'
  if (['GIFT_CARD', 'GIFT CARD', 'REGALO'].includes(normalized)) return 'GIFT_CARD'

  return 'LOCAL'
}

export function getCommercialBookingKindLabel(value = '') {
  const normalized = normalizeCommercialBookingKind(value)
  return BUSINESS_BOOKING_KIND_LABELS[normalized] || 'Personas'
}

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
  return BOOKING_OPTIONS[configKey] || BOOKING_OPTIONS['1_ESTANDAR']
}

function getOptionByReservationKind(kind = 'standard-1') {
  return getOptionByKey(RESERVATION_KIND_TO_KEY[kind] || '1_ESTANDAR')
}

export function getCommercialBookingPrefill(segment = 'aprender') {
  const key = String(segment || 'aprender').trim().toLowerCase()
  return COMMERCIAL_BOOKING_PREFILLS[key] || COMMERCIAL_BOOKING_PREFILLS.aprender
}

function sanitizePositiveInteger(value, fallback) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(0, Math.round(parsed))
}

function sanitizeBookingDurationValue(value, fallback = 30) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(30, Math.round(parsed))
}

function resolveBookingOption(payload = {}) {
  const configKey = String(
    payload.simulator_config_id
    ?? payload.simulatorConfigId
    ?? payload.booking_option
    ?? getBookingOptionKeyFromBooking(payload)
    ?? '1_ESTANDAR'
  )

  return getOptionByKey(configKey)
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
  if (totalSimulators === 2) return { standard: 1, pro: 1 } // safer fallback for legacy data
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
  const duration = sanitizeBookingDurationValue(draft.duration, 30)
  const bookingDate = String(draft.booking_date ?? draft.date ?? '').trim()
  const bookingTime = String(draft.booking_time ?? draft.time ?? '').slice(0, 5)
  const config = resolveBookingOption(draft)

  return {
    ...draft,
    client: normalizeText(draft.client),
    phone: normalizePhone(draft.phone),
    booking_date: bookingDate,
    booking_time: bookingTime,
    duration,
    simulators: sanitizePositiveInteger(draft.simulators ?? config.simulators, config.simulators),
    simulator_config_id: config.key,
    reservation_kind: normalizeCommercialBookingKind(draft.reservation_kind),
    standard_simulators: sanitizePositiveInteger(draft.standard_simulators ?? config.standard, config.standard),
    pro_simulators: sanitizePositiveInteger(draft.pro_simulators ?? config.pro, config.pro),
  }
}

function getReservationRange(booking = {}) {
  const normalized = normalizeBookingDraft(booking)
  const start = timeToMinutes(normalized.booking_time)
  const duration = Math.max(30, Number(normalized.duration || 30))
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


export function isSameDayBooking(date = '', now = new Date()) {
  if (!date) return false
  return String(date) === getTodayDateString(now)
}

export function isPastBookingTime(date = '', time = '', now = new Date()) {
  if (!date || !time || !isSameDayBooking(date, now)) return false

  const bookingMinutes = timeToMinutes(time)
  if (bookingMinutes === null) return false

  const safeNow = now instanceof Date ? now : new Date(now)
  const nowMinutes = (safeNow.getHours() * 60) + safeNow.getMinutes()
  return bookingMinutes < nowMinutes
}

export function filterAvailablePublicTimeOptions(timeOptions = [], bookingDate = '', now = new Date()) {
  const options = Array.isArray(timeOptions) ? timeOptions : []
  if (!isSameDayBooking(bookingDate, now)) return options

  return options.filter((time) => !isPastBookingTime(bookingDate, time, now))
}

export function validateBookingPayload(payload, bookings = [], ignoreId = null, options = {}) {
  const draft = normalizeBookingDraft(payload)
  const errors = []
  const { allowPast = false, now = new Date() } = options || {}

  if (!draft.client) errors.push('Debes ingresar el nombre del cliente.')
  if (!draft.phone) errors.push('Debes ingresar teléfono o WhatsApp.')
  if (!draft.booking_date) errors.push('Debes seleccionar una fecha.')
  if (!draft.booking_time) errors.push('Debes seleccionar una hora.')

  if (!allowPast && draft.booking_date && isPastBookingDate(draft.booking_date, now)) {
    errors.push('No puedes crear reservas en una fecha pasada.')
  }

  if (!allowPast && draft.booking_date && draft.booking_time && isPastBookingTime(draft.booking_date, draft.booking_time, now)) {
    errors.push('No puedes reservar un horario que ya pasó.')
  }

  const config = inferSimulatorConfig(draft)
  const totalSimulators = Number(draft.simulators ?? 0)
  const expectedKey = getBookingOptionKeyFromBooking(draft)
  const expectedOption = getOptionByKey(expectedKey)
  const total = Number(draft.total)
  const expectedTotal = calculateBookingTotal(expectedKey, draft.duration)

  if (!Number.isFinite(Number(draft.duration)) || Number(draft.duration) < 30) {
    errors.push('La duración mínima es 30 minutos.')
  }

  if (Number(draft.duration) % 30 !== 0) {
    errors.push('La duración debe avanzar en bloques de 30 minutos.')
  }

  if (config.standard < 0 || config.pro < 0) {
    errors.push('La configuración de simuladores no es válida.')
  }

  if (config.standard > BOOKING_LIMITS.standard) {
    errors.push('No puedes reservar más de 2 simuladores estándar.')
  }

  if (config.pro > BOOKING_LIMITS.pro) {
    errors.push('No puedes reservar más de 1 simulador pro.')
  }

  if ((config.standard + config.pro) !== totalSimulators) {
    errors.push('La cantidad total de simuladores no coincide con la configuración elegida.')
  }

  if (String(draft.booking_type || '').trim() !== String(expectedOption.label || '').trim()) {
    errors.push('El tipo de reserva no coincide con la configuración elegida.')
  }

  if (String(draft.simulator_config_id || '').trim() !== String(expectedOption.key || '').trim()) {
    errors.push('La configuración de simuladores no coincide con la selección actual.')
  }

  if (!Number.isFinite(total) || total <= 0) {
    errors.push('El total calculado no es válido.')
  } else if (Math.round(total) !== Math.round(expectedTotal)) {
    errors.push('El total no coincide con la configuración y duración elegidas.')
  }

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
    expectedConfigKey: expectedKey,
    expectedTotal,
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
export function getBookingConfigFromBooking(booking = {}) {
  const configKey = getBookingOptionKeyFromBooking(booking)
  const option = getOptionByKey(configKey)

  return {
    key: configKey,
    label: option.label,
    standard: Number(option.standard || 0),
    pro: Number(option.pro || 0),
    total: Number(option.simulators || 0),
    standardCount: Number(option.standard || 0),
    proCount: Number(option.pro || 0),
    simulators: Number(option.simulators || 0),
  }
}

export function buildDailyTimeline(bookings = [], operationDate = '') {
  if (!operationDate) return []

  const dayBookings = (bookings || []).filter(
    (booking) => String(booking?.booking_date ?? '') === String(operationDate)
  )

  const timeline = []

  for (let minutes = OPEN_MINUTES; minutes < CLOSE_MINUTES; minutes += 30) {
    const relatedBookings = dayBookings.filter((booking) => {
      const range = getReservationRange(booking)
      if (range.start === null || range.end === null) return false
      return minutes < range.end && range.start < (minutes + 30)
    })

    const usage = relatedBookings.reduce(
      (acc, booking) => {
        const config = inferSimulatorConfig(booking)
        acc.standardUsed += Number(config.standard || 0)
        acc.proUsed += Number(config.pro || 0)
        return acc
      },
      { standardUsed: 0, proUsed: 0 }
    )

    const status =
      usage.standardUsed >= BOOKING_LIMITS.standard && usage.proUsed >= BOOKING_LIMITS.pro
        ? 'COMPLETO'
        : usage.standardUsed > 0 || usage.proUsed > 0
          ? 'PARCIAL'
          : 'LIBRE'

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

export function isTimeSlotAvailable(payload = {}, bookings = [], ignoreId = null) {
  const draft = normalizeBookingDraft(payload)
  if (!draft.booking_date || !draft.booking_time) return true
  return getConflicts(draft, bookings, ignoreId).length === 0
}

export function getVisibleBookingTimeOptions({
  timeOptions = [],
  bookings = [],
  bookingDate = '',
  bookingConfig = '1_ESTANDAR',
  bookingDuration = 30,
  editingBookingId = null,
  isAdmin = false,
  now = new Date(),
  preserveSlot = '',
} = {}) {
  const baseOptions = Array.isArray(timeOptions) ? timeOptions : []

  const availableByConflicts = !bookingDate
    ? [...baseOptions]
    : baseOptions.filter((slot) => isTimeSlotAvailable({
      booking_date: bookingDate,
      booking_time: slot,
      duration: Number(bookingDuration),
      simulator_config_id: bookingConfig,
    }, bookings, editingBookingId))

  const visibleOptions = isAdmin
    ? availableByConflicts
    : filterAvailablePublicTimeOptions(availableByConflicts, bookingDate, now)

  if (isAdmin && preserveSlot && !visibleOptions.includes(preserveSlot)) {
    return [preserveSlot, ...visibleOptions]
  }

  return visibleOptions
}

export function getNearestBookingTimeSuggestions(availableTimeOptions = [], bookingTime = '', maxSuggestions = 3) {
  const target = timeToMinutes(bookingTime)

  return [...(Array.isArray(availableTimeOptions) ? availableTimeOptions : [])]
    .filter((slot) => slot && slot !== bookingTime)
    .map((slot) => ({
      slot,
      distance: target === null ? 9999 : Math.abs((timeToMinutes(slot) ?? target) - target),
    }))
    .sort((a, b) => a.distance - b.distance || a.slot.localeCompare(b.slot))
    .slice(0, Math.max(0, Number(maxSuggestions) || 0))
    .map((item) => item.slot)
}

export function getNearestBookingDateSuggestions({
  timeOptions = [],
  bookings = [],
  bookingDate = '',
  bookingConfig = '1_ESTANDAR',
  bookingDuration = 30,
  editingBookingId = null,
  isAdmin = false,
  maxDays = 14,
  maxSuggestions = 4,
  now = new Date(),
} = {}) {
  if (!bookingDate) return []

  const baseDate = new Date(`${bookingDate}T12:00:00`)
  if (Number.isNaN(baseDate.getTime())) return []

  const suggestions = []
  const safeMaxDays = Math.max(1, Number(maxDays) || 14)
  const safeMaxSuggestions = Math.max(1, Number(maxSuggestions) || 4)

  for (let offset = 1; offset <= safeMaxDays && suggestions.length < safeMaxSuggestions; offset += 1) {
    const candidateDate = new Date(baseDate)
    candidateDate.setDate(baseDate.getDate() + offset)

    const candidateDateString = [
      candidateDate.getFullYear(),
      String(candidateDate.getMonth() + 1).padStart(2, '0'),
      String(candidateDate.getDate()).padStart(2, '0'),
    ].join('-')

    const visibleSlots = getVisibleBookingTimeOptions({
      timeOptions,
      bookings,
      bookingDate: candidateDateString,
      bookingConfig,
      bookingDuration,
      editingBookingId,
      isAdmin,
      now,
    })

    if (visibleSlots.length === 0) continue

    suggestions.push({
      date: candidateDateString,
      firstTime: visibleSlots[0],
      slotsCount: visibleSlots.length,
    })
  }

  return suggestions
}

export function buildBookingEditSnapshot(booking = {}) {
  const draft = buildBookingMutationPayload(booking)

  return {
    id: booking?.id ?? null,
    client: draft.client,
    phone: draft.phone,
    booking_date: draft.booking_date,
    booking_time: String(draft.booking_time || '').slice(0, 5),
    reservation_kind: draft.reservation_kind,
    bookingConfig: draft.simulator_config_id,
    booking_type: draft.booking_type,
    bookingDuration: Number(draft.duration || 0),
    simulators: Number(draft.simulators || 0),
    total: Number(draft.total || 0),
    standard_simulators: Number(draft.standard_simulators || 0),
    pro_simulators: Number(draft.pro_simulators || 0),
    whatsapp_reminder: Boolean(draft.whatsapp_reminder),
  }
}

export function isSameBookingEditSnapshot(snapshot, booking = {}) {
  if (!snapshot) return false

  const live = buildBookingEditSnapshot(booking)

  return (
    String(snapshot.id ?? '') === String(live.id ?? '')
    && String(snapshot.client || '') === String(live.client || '')
    && String(snapshot.phone || '') === String(live.phone || '')
    && String(snapshot.booking_date || '') === String(live.booking_date || '')
    && String(snapshot.booking_time || '') === String(live.booking_time || '')
    && String(snapshot.reservation_kind || '') === String(live.reservation_kind || '')
    && String(snapshot.bookingConfig || '') === String(live.bookingConfig || '')
    && String(snapshot.booking_type || '') === String(live.booking_type || '')
    && Number(snapshot.bookingDuration || 0) === Number(live.bookingDuration || 0)
    && Number(snapshot.simulators || 0) === Number(live.simulators || 0)
    && Number(snapshot.total || 0) === Number(live.total || 0)
    && Number(snapshot.standard_simulators || 0) === Number(live.standard_simulators || 0)
    && Number(snapshot.pro_simulators || 0) === Number(live.pro_simulators || 0)
    && Boolean(snapshot.whatsapp_reminder) === Boolean(live.whatsapp_reminder)
  )
}

export function applyBookingSnapshotFilters(query, snapshot) {
  if (!snapshot) return query

  return query
    .eq('client', snapshot.client)
    .eq('phone', snapshot.phone)
    .eq('booking_date', snapshot.booking_date)
    .eq('booking_time', snapshot.booking_time)
    .eq('reservation_kind', snapshot.reservation_kind)
    .eq('booking_type', snapshot.booking_type)
    .eq('duration', snapshot.bookingDuration)
    .eq('simulators', snapshot.simulators)
    .eq('total', snapshot.total)
    .eq('standard_simulators', snapshot.standard_simulators)
    .eq('pro_simulators', snapshot.pro_simulators)
    .eq('whatsapp_reminder', snapshot.whatsapp_reminder)
}

export function buildFocusedTimeline(timeline = [], bookingTime = '') {
  if (!Array.isArray(timeline) || timeline.length === 0) return []

  const target = timeToMinutes(bookingTime)
  if (target === null) return timeline.slice(0, 4)

  return [...timeline]
    .map((slot, index) => ({
      slot,
      index,
      distance: Math.abs((timeToMinutes(slot.time) ?? target) - target),
    }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .slice(0, 4)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.slot)
}


export function getTodayDateString(now = new Date()) {
  const safeNow = now instanceof Date ? now : new Date(now)
  const year = safeNow.getFullYear()
  const month = String(safeNow.getMonth() + 1).padStart(2, '0')
  const day = String(safeNow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isPastBookingDate(date = '', now = new Date()) {
  if (!date) return false
  return String(date) < getTodayDateString(now)
}


export function buildBookingMutationPayload(payload = {}) {
  const normalized = normalizeBookingDraft(payload)
  const configKey = getBookingOptionKeyFromBooking(normalized)
  const option = getOptionByKey(configKey)
  const total = calculateBookingTotal(configKey, normalized.duration)

  return {
    client: normalized.client,
    phone: normalized.phone,
    whatsapp_reminder: Boolean(normalized.whatsapp_reminder),
    booking_date: normalized.booking_date,
    booking_time: normalized.booking_time,
    reservation_kind: normalized.reservation_kind,
    simulators: Number(option.simulators || 0),
    booking_type: option.label,
    duration: Number(normalized.duration || 30),
    total,
    standard_simulators: Number(option.standard || 0),
    pro_simulators: Number(option.pro || 0),
    simulator_config_id: option.key,
  }
}

export function validateFinalBooking(payload = {}, bookings = [], ignoreId = null, options = {}) {
  const normalizedPayload = buildBookingMutationPayload(payload)
  const validation = validateBookingPayload(normalizedPayload, bookings, ignoreId, options)

  return {
    ok: validation.valid,
    valid: validation.valid,
    error: validation.errors[0] || '',
    errors: validation.errors,
    conflicts: validation.conflicts,
    normalized: normalizedPayload,
    expectedTotal: validation.expectedTotal,
  }
}



export function buildBookingPersistencePayload(payload = {}) {
  const normalized = buildBookingMutationPayload(payload)

  return {
    client: normalized.client,
    phone: normalized.phone,
    whatsapp_reminder: normalized.whatsapp_reminder,
    booking_date: normalized.booking_date,
    booking_time: normalized.booking_time,
    reservation_kind: normalized.reservation_kind,
    simulators: normalized.simulators,
    booking_type: normalized.booking_type,
    duration: normalized.duration,
    total: normalized.total,
    standard_simulators: normalized.standard_simulators,
    pro_simulators: normalized.pro_simulators,
  }
}

export function buildBookingSafeRpcPayload(payload = {}) {
  const normalized = buildBookingPersistencePayload(payload)

  return {
    client: normalized.client,
    phone: normalized.phone,
    whatsapp_reminder: Boolean(normalized.whatsapp_reminder),
    booking_date: normalized.booking_date,
    booking_time: normalized.booking_time,
    reservation_kind: normalized.reservation_kind,
    simulators: Number(normalized.simulators || 0),
    booking_type: normalized.booking_type,
    duration: Number(normalized.duration || 0),
    total: Number(normalized.total || 0),
    standard_simulators: Number(normalized.standard_simulators || 0),
    pro_simulators: Number(normalized.pro_simulators || 0),
  }
}

export function buildBookingSuccessSummary(payload = {}, options = {}) {
  const normalized = buildBookingMutationPayload(payload)
  const bookingOption = getOptionByKey(normalized.simulator_config_id)
  const formatDate = typeof options.formatDate === 'function'
    ? options.formatDate
    : (value) => value

  return {
    client: normalized.client,
    phone: normalized.phone,
    date: formatDate(normalized.booking_date),
    time: normalized.booking_time,
    kind: normalized.reservation_kind,
    configLabel: bookingOption.label,
    duration: normalized.duration,
    total: normalized.total,
    whatsappReminder: Boolean(normalized.whatsapp_reminder),
  }
}

const BOOKING_PRICE_TABLE = {
  ESTANDAR: { q15: 9000, q30: 16000, h1: 28000 },
  PRO: { q15: 10000, q30: 18000, h1: 32000 },
}

function calculateUnitBookingPrice(priceTable, totalMinutes) {
  const minutes = Math.max(30, Number(totalMinutes || 0))
  if (minutes === 30) return priceTable.q30
  if (minutes < 60) return priceTable.q30 + ((priceTable.h1 / 60) * (minutes - 30))
  return (priceTable.h1 / 60) * minutes
}

export function calculateBookingTotal(configKey = '1_ESTANDAR', duration = 30) {
  const option = getOptionByKey(configKey)
  const pricingModel = Array.isArray(option.pricingModel) ? option.pricingModel : ['ESTANDAR']
  const total = pricingModel.reduce((sum, simulatorType) => {
    const table = simulatorType === 'PRO' ? BOOKING_PRICE_TABLE.PRO : BOOKING_PRICE_TABLE.ESTANDAR
    return sum + calculateUnitBookingPrice(table, duration)
  }, 0)
  return Math.round(total)
}

export function getBookingTotalValue(configOrBooking = '1_ESTANDAR', duration = 30) {
  if (configOrBooking && typeof configOrBooking === 'object' && !Array.isArray(configOrBooking)) {
    const booking = normalizeBookingDraft(configOrBooking)
    const configKey = getBookingOptionKeyFromBooking(booking)
    return calculateBookingTotal(configKey, booking.duration)
  }

  return calculateBookingTotal(configOrBooking, duration)
}
