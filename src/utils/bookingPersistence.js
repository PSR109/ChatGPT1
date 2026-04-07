import { BOOKING_OPTIONS, calculateBookingTotal } from './bookingEngine.js'

const MISSING_RPC_CODES = new Set(['42883', 'PGRST202'])
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])
const MISSING_COLUMN_CODES = new Set(['42703', 'PGRST204'])

function extractErrorText(error) {
  return String(
    error?.message
    || error?.details
    || error?.hint
    || error?.code
    || ''
  ).toLowerCase()
}

function isMissingRpcError(error) {
  const text = extractErrorText(error)
  return MISSING_RPC_CODES.has(String(error?.code || ''))
    || text.includes('function')
    || text.includes('rpc')
    || text.includes('could not find the function')
}

function isMissingTableError(error) {
  const text = extractErrorText(error)
  return MISSING_TABLE_CODES.has(String(error?.code || ''))
    || text.includes('booking_attempts') && text.includes('does not exist')
}

function isMissingColumnError(error) {
  const text = extractErrorText(error)
  return MISSING_COLUMN_CODES.has(String(error?.code || ''))
    || text.includes('column') && text.includes('does not exist')
    || text.includes('schema cache')
}


function normalizeTextField(value, fallback = '') {
  return String(value ?? fallback).trim()
}

function normalizeNumberField(value, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizeAttemptSource(source = '') {
  const value = normalizeTextField(source, 'booking_flow').toLowerCase()
  if (!value) return 'booking_flow'
  return value
}

function buildReasonCode(payload = {}) {
  return normalizeTextField(payload.reason_code || payload.reason || '', 'unknown')
}

function buildReasonDetail(payload = {}) {
  return normalizeTextField(payload.reason_detail || payload.message || '') || null
}

function shouldPersistAttempt(payload = {}) {
  const normalized = {
    booking_id: payload.booking_id,
    booking_date: normalizeTextField(payload.booking_date),
    booking_time: normalizeTextField(payload.booking_time),
    simulators: normalizeNumberField(payload.simulators, 0),
    source: normalizeAttemptSource(payload.source),
    attempt_status: normalizeTextField(payload.attempt_status || payload.status || '', 'unknown'),
  }

  const hasIdentity = normalized.booking_id !== null && normalized.booking_id !== undefined
  const hasSchedule = Boolean(normalized.booking_date) && Boolean(normalized.booking_time)
  const hasSimulatorSelection = normalized.simulators > 0
  const canPersist = (hasIdentity || (hasSchedule && hasSimulatorSelection))
    && Boolean(normalized.source)
    && Boolean(normalized.attempt_status)

  if (!canPersist) {
    console.warn('[bookingPersistence] attempt skipped: insufficient payload', normalized)
  }

  return canPersist
}

function buildRpcPayload(payload = {}) {
  return {
    p_client: payload.client,
    p_phone: payload.phone,
    p_whatsapp_reminder: Boolean(payload.whatsapp_reminder),
    p_booking_date: payload.booking_date,
    p_booking_time: payload.booking_time,
    p_reservation_kind: payload.reservation_kind,
    p_simulators: Number(payload.simulators || 0),
    p_booking_type: payload.booking_type,
    p_duration: Number(payload.duration || 0),
    p_total: Number(payload.total || 0),
    p_standard_simulators: Number(payload.standard_simulators || 0),
    p_pro_simulators: Number(payload.pro_simulators || 0),
  }
}


function isHalfHourSlot(time = '') {
  const normalized = String(time ?? '').trim()
  if (!/^\d{2}:\d{2}$/.test(normalized)) return false

  const [hours, minutes] = normalized.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false
  if (hours < 0 || hours > 23) return false

  return minutes === 0 || minutes === 30
}

function validateMutationPayload(payload = {}) {
  const errors = []
  const client = normalizeTextField(payload.client)
  const phone = normalizeTextField(payload.phone)
  const bookingDate = normalizeTextField(payload.booking_date)
  const bookingTime = normalizeTextField(payload.booking_time)
  const simulators = normalizeNumberField(payload.simulators, 0)
  const standardSimulators = normalizeNumberField(payload.standard_simulators, 0)
  const proSimulators = normalizeNumberField(payload.pro_simulators, 0)
  const duration = normalizeNumberField(payload.duration, 0)
  const total = normalizeNumberField(payload.total, 0)
  const bookingType = normalizeTextField(payload.booking_type)
  const matchingOption = Object.values(BOOKING_OPTIONS).find((option) => (
    option.simulators === simulators
    && option.standard === standardSimulators
    && option.pro === proSimulators
    && option.label === bookingType
  ))

  if (!client) errors.push('Debes ingresar el nombre del cliente.')
  if (!phone) errors.push('Debes ingresar teléfono o WhatsApp.')
  if (!bookingDate) errors.push('Debes seleccionar una fecha.')
  if (!bookingTime) errors.push('Debes seleccionar una hora.')
  if (bookingTime && !isHalfHourSlot(bookingTime)) errors.push('La hora seleccionada no es válida.')
  if (!Number.isFinite(duration) || duration < 30) {
    errors.push('La duración mínima es 30 minutos.')
  }
  if (!Number.isFinite(duration) || duration % 30 !== 0) {
    errors.push('La duración debe ser en bloques de 30 minutos.')
  }
  if (standardSimulators < 0 || standardSimulators > 2) {
    errors.push('No puedes reservar más de 2 simuladores estándar.')
  }
  if (proSimulators < 0 || proSimulators > 1) {
    errors.push('No puedes reservar más de 1 simulador pro.')
  }
  if (simulators <= 0 || simulators > 3 || simulators !== (standardSimulators + proSimulators)) {
    errors.push('La cantidad total de simuladores no coincide con la configuración elegida.')
  }
  if (!matchingOption) {
    errors.push('La configuración de simuladores no coincide con la selección actual.')
  }
  const expectedTotal = matchingOption ? calculateBookingTotal(matchingOption.key, duration) : null
  if (!Number.isFinite(total) || total <= 0) {
    errors.push('El total calculado no es válido.')
  } else if (expectedTotal !== null && Number(total) !== Number(expectedTotal)) {
    errors.push('El total no coincide con la configuración y duración elegidas.')
  }

  return { valid: errors.length === 0, errors }
}

function buildLegacyAttemptPayload(payload = {}) {
  return {
    booking_date: payload.booking_date || null,
    booking_time: payload.booking_time || null,
    status: payload.attempt_status || payload.status || null,
    created_at: payload.created_at || new Date().toISOString(),
  }
}

function buildAttemptPayload(payload = {}) {
  const reasonCode = buildReasonCode(payload)
  const reasonDetail = buildReasonDetail(payload)
  const metadata = payload.metadata ?? payload.meta ?? null
  const attemptStatus = normalizeTextField(payload.attempt_status || payload.status || '', 'unknown')

  return {
    booking_id: payload.booking_id ?? null,
    booking_date: payload.booking_date || null,
    booking_time: payload.booking_time || null,
    reservation_kind: payload.reservation_kind || null,
    simulator_config_id: payload.simulator_config_id || null,
    client: normalizeTextField(payload.client) || null,
    phone: normalizeTextField(payload.phone) || null,
    simulators: normalizeNumberField(payload.simulators, 0),
    standard_simulators: normalizeNumberField(payload.standard_simulators, 0),
    pro_simulators: normalizeNumberField(payload.pro_simulators, 0),
    booking_type: normalizeTextField(payload.booking_type) || null,
    duration: normalizeNumberField(payload.duration, 0),
    total: normalizeNumberField(payload.total, 0),
    attempt_status: attemptStatus,
    status: attemptStatus,
    reason: reasonCode,
    reason_code: reasonCode,
    reason_detail: reasonDetail,
    source: normalizeAttemptSource(payload.source),
    message: reasonDetail,
    metadata,
    meta: metadata,
    created_at: payload.created_at || new Date().toISOString(),
  }
}

async function insertBookingAttempt(supabase, payload) {
  return supabase.from('booking_attempts').insert([payload])
}

export async function saveBookingAttempt({ supabase, ...payload }) {
  if (!supabase) return { ok: false, skipped: true }

  const completePayload = buildAttemptPayload(payload)

  if (!shouldPersistAttempt(completePayload)) {
    return { ok: false, skipped: true, reason: 'incomplete_critical_payload' }
  }

  let response = await insertBookingAttempt(supabase, completePayload)

  if (!response.error) return { ok: true }
  if (isMissingTableError(response.error)) return { ok: false, skipped: true, error: response.error }

  if (isMissingColumnError(response.error)) {
    response = await insertBookingAttempt(supabase, buildLegacyAttemptPayload(completePayload))
    if (!response.error) return { ok: true, fallback: true }
    if (isMissingTableError(response.error)) return { ok: false, skipped: true, error: response.error }
  }

  return { ok: false, error: response.error }
}


function sortBookingsChronologically(rows = []) {
  return [...rows].sort((a, b) => {
    const dateCompare = String(a?.booking_date || '').localeCompare(String(b?.booking_date || ''))
    if (dateCompare !== 0) return dateCompare

    const timeCompare = String(a?.booking_time || '').localeCompare(String(b?.booking_time || ''))
    if (timeCompare !== 0) return timeCompare

    return Number(a?.id || 0) - Number(b?.id || 0)
  })
}

export async function listBookings({ supabase }) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })

  return {
    data: sortBookingsChronologically(data || []),
    error,
  }
}

async function listBookingAvailabilityFromView({ supabase, dateValue = '' }) {
  let query = supabase
    .from('booking_availability')
    .select('*')

  if (dateValue) {
    query = query.eq('booking_date', dateValue)
  }

  const { data, error } = await query
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })

  return {
    data: sortBookingsChronologically(data || []),
    error,
  }
}

export async function listBookingAvailability({ supabase }) {
  const result = await listBookingAvailabilityFromView({ supabase })
  if (!result.error || !isMissingTableError(result.error)) return result

  const fallback = await listBookings({ supabase })
  return {
    ...fallback,
    fallbackUsed: true,
    sourceError: result.error,
  }
}

export async function listBookingsByDate({ supabase, dateValue }) {
  if (!dateValue) return { data: [], error: null }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', dateValue)
    .order('booking_time', { ascending: true })

  return {
    data: sortBookingsChronologically(data || []),
    error,
  }
}

export async function listBookingAvailabilityByDate({ supabase, dateValue }) {
  if (!dateValue) return { data: [], error: null }

  const result = await listBookingAvailabilityFromView({ supabase, dateValue })
  if (!result.error || !isMissingTableError(result.error)) return result

  const fallback = await listBookingsByDate({ supabase, dateValue })
  return {
    ...fallback,
    fallbackUsed: true,
    sourceError: result.error,
  }
}

export async function getBookingById({ supabase, bookingId }) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle()

  return { data, error }
}

async function createBookingWithRpc({ supabase, payload }) {
  const { data, error } = await supabase.rpc('psr_create_booking_safe', buildRpcPayload(payload))
  return { data, error, usedRpc: true }
}

async function createBookingDirect({ supabase, payload }) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([payload])
    .select('*')

  return { data, error, usedRpc: false }
}

async function createBookingMutation({ supabase, payload }) {
  const rpcResult = await createBookingWithRpc({ supabase, payload })
  if (!rpcResult.error || !isMissingRpcError(rpcResult.error)) return rpcResult

  const fallbackResult = await createBookingDirect({ supabase, payload })
  return { ...fallbackResult, fallbackUsed: true, rpcError: rpcResult.error }
}

async function updateBookingWithRpc({ supabase, bookingId, payload }) {
  const { data, error } = await supabase.rpc('psr_update_booking_safe', {
    p_booking_id: bookingId,
    ...buildRpcPayload(payload),
  })

  return { data, error, usedRpc: true }
}

async function updateBookingDirect({ supabase, bookingId, payload }) {
  const { data, error } = await supabase
    .from('bookings')
    .update(payload)
    .eq('id', bookingId)
    .select('*')

  return { data, error, usedRpc: false }
}

async function updateBookingMutation({ supabase, bookingId, payload }) {
  const rpcResult = await updateBookingWithRpc({ supabase, bookingId, payload })
  if (!rpcResult.error || !isMissingRpcError(rpcResult.error)) return rpcResult

  const fallbackResult = await updateBookingDirect({ supabase, bookingId, payload })
  return { ...fallbackResult, fallbackUsed: true, rpcError: rpcResult.error }
}

async function deleteBookingWithRpc({ supabase, bookingId }) {
  const { data, error } = await supabase.rpc('psr_delete_booking_safe', {
    p_booking_id: bookingId,
  })

  return { data, error, usedRpc: true }
}

async function deleteBookingDirect({ supabase, bookingId }) {
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .select('*')

  return { data, error, usedRpc: false }
}

async function deleteBookingMutation({ supabase, bookingId }) {
  const rpcResult = await deleteBookingWithRpc({ supabase, bookingId })
  if (!rpcResult.error || !isMissingRpcError(rpcResult.error)) return rpcResult

  const fallbackResult = await deleteBookingDirect({ supabase, bookingId })
  return { ...fallbackResult, fallbackUsed: true, rpcError: rpcResult.error }
}

export async function createBookingRecord({
  supabase,
  payload,
  draftPayload,
  isAdmin,
  validateFinalBooking,
  loadBookingsByDate,
  syncBookingsForDate,
}) {
  const payloadValidation = validateMutationPayload(payload)
  if (!payloadValidation.valid) {
    return { status: 'invalid_payload', validationErrors: payloadValidation.errors }
  }

  const result = await createBookingMutation({ supabase, payload })

  if (result.error) {
    return { status: 'error', error: result.error }
  }

  const createdBooking = Array.isArray(result.data) ? (result.data[0] || null) : result.data
  const createdBookingId = createdBooking?.id ?? null
  const postInsertBookings = await loadBookingsByDate(draftPayload.booking_date)

  if (postInsertBookings === null) {
    return {
      status: 'revalidation_unavailable',
      createdBooking,
      createdBookingId,
    }
  }

  const postInsertValidation = validateFinalBooking(
    { ...draftPayload, id: createdBookingId },
    postInsertBookings,
    createdBookingId,
    { allowPast: isAdmin }
  )

  if (!postInsertValidation.valid) {
    if (createdBookingId !== null) {
      await deleteBookingMutation({ supabase, bookingId: createdBookingId })
    }

    const refreshedBookings = await loadBookingsByDate(draftPayload.booking_date)
    if (refreshedBookings !== null) {
      syncBookingsForDate(draftPayload.booking_date, refreshedBookings)
    }

    return {
      status: 'live_conflict',
      createdBooking,
      refreshedBookings: refreshedBookings ?? postInsertBookings,
      validation: postInsertValidation,
    }
  }

  syncBookingsForDate(draftPayload.booking_date, postInsertBookings)

  return {
    status: 'created',
    createdBooking,
    refreshedBookings: postInsertBookings,
    usedRpc: result.usedRpc,
  }
}

export async function updateBookingRecord({
  supabase,
  bookingId,
  payload,
  draftPayload,
  previousBooking,
  currentEditSnapshot,
  isSameBookingEditSnapshot,
  validateFinalBooking,
  loadBookingsByDate,
  syncBookingsForDate,
  loadBookings,
  isAdmin,
}) {
  const payloadValidation = validateMutationPayload(payload)
  if (!payloadValidation.valid) {
    return { status: 'invalid_payload', validationErrors: payloadValidation.errors }
  }

  const { data: latestEditingBooking, error: latestEditingBookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle()

  if (latestEditingBookingError) {
    return { status: 'error', error: latestEditingBookingError, phase: 'precheck' }
  }

  if (!latestEditingBooking) {
    return { status: 'missing' }
  }

  if (!isSameBookingEditSnapshot(currentEditSnapshot, latestEditingBooking)) {
    const refreshedCurrentDateBookings = await loadBookingsByDate(latestEditingBooking.booking_date)
    if (refreshedCurrentDateBookings !== null) {
      syncBookingsForDate(latestEditingBooking.booking_date, refreshedCurrentDateBookings)
    } else {
      await loadBookings()
    }

    return {
      status: 'stale',
      latestBooking: latestEditingBooking,
      refreshedCurrentDateBookings,
    }
  }

  const result = await updateBookingMutation({ supabase, bookingId, payload })

  if (result.error) {
    return { status: 'error', error: result.error, phase: 'update' }
  }

  let updatedBooking = Array.isArray(result.data) ? (result.data[0] || null) : result.data

  if (!updatedBooking) {
    const { data: refreshedBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle()

    if (refreshedBooking) {
      const refreshedCurrentDateBookings = await loadBookingsByDate(refreshedBooking.booking_date)
      if (refreshedCurrentDateBookings !== null) {
        syncBookingsForDate(refreshedBooking.booking_date, refreshedCurrentDateBookings)
      } else {
        await loadBookings()
      }

      return {
        status: 'stale',
        latestBooking: refreshedBooking,
        refreshedCurrentDateBookings,
      }
    }

    return { status: 'missing' }
  }

  const postUpdateBookings = await loadBookingsByDate(draftPayload.booking_date)

  if (postUpdateBookings === null) {
    await loadBookings()
    return {
      status: 'revalidation_unavailable',
      updatedBooking,
    }
  }

  const updatedBookingId = updatedBooking?.id ?? bookingId
  const postUpdateValidation = validateFinalBooking(
    { ...draftPayload, id: updatedBookingId },
    postUpdateBookings,
    updatedBookingId,
    { allowPast: isAdmin }
  )

  if (!postUpdateValidation.valid) {
    if (previousBooking) {
      const rollbackPayload = {
        client: previousBooking.client,
        phone: previousBooking.phone,
        whatsapp_reminder: previousBooking.whatsapp_reminder,
        booking_date: previousBooking.booking_date,
        booking_time: previousBooking.booking_time,
        reservation_kind: previousBooking.reservation_kind,
        simulators: previousBooking.simulators,
        booking_type: previousBooking.booking_type,
        duration: previousBooking.duration,
        total: previousBooking.total,
        standard_simulators: previousBooking.standard_simulators,
        pro_simulators: previousBooking.pro_simulators,
      }
      const rollbackResult = await updateBookingMutation({ supabase, bookingId, payload: rollbackPayload })
      if (rollbackResult.error) {
        return {
          status: 'rollback_failed',
          updatedBooking,
          rollbackError: rollbackResult.error,
          validation: postUpdateValidation,
        }
      }
    }

    await loadBookings()

    return {
      status: 'live_conflict',
      updatedBooking,
      validation: postUpdateValidation,
    }
  }

  syncBookingsForDate(draftPayload.booking_date, postUpdateBookings)

  return {
    status: 'updated',
    updatedBooking,
    refreshedBookings: postUpdateBookings,
    usedRpc: result.usedRpc,
  }
}


export async function deleteBookingRecord({
  supabase,
  bookingId,
  editingBookingId,
  currentEditSnapshot,
  isSameBookingEditSnapshot,
  loadBookings,
  syncBookingsForDate,
  saveAttempt,
}) {
  const { data: latestBooking, error: latestBookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle()

  if (latestBookingError) {
    return { status: 'error', error: latestBookingError, phase: 'precheck' }
  }

  if (!latestBooking) {
    return { status: 'missing' }
  }

  if (editingBookingId && currentEditSnapshot && !isSameBookingEditSnapshot(currentEditSnapshot, latestBooking)) {
    await saveAttempt?.({
      booking_id: latestBooking.id,
      client: latestBooking.client,
      phone: latestBooking.phone,
      booking_date: latestBooking.booking_date,
      booking_time: latestBooking.booking_time,
      reservation_kind: latestBooking.reservation_kind,
      simulator_config_id: latestBooking.simulator_config_id,
      simulators: latestBooking.simulators,
      standard_simulators: latestBooking.standard_simulators,
      pro_simulators: latestBooking.pro_simulators,
      booking_type: latestBooking.booking_type,
      duration: latestBooking.duration,
      total: latestBooking.total,
      attempt_status: 'abandoned',
      reason: 'stale_delete_snapshot',
      source: 'admin_delete',
    })

    const refreshed = await loadBookings()
    return { status: 'stale', latestBooking, refreshedBookings: refreshed }
  }

  const deleteResult = await deleteBookingMutation({ supabase, bookingId })

  if (deleteResult.error) {
    return { status: 'error', error: deleteResult.error, phase: 'delete' }
  }

  const deletedBookings = Array.isArray(deleteResult.data) ? deleteResult.data : []
  const deletedBooking = deletedBookings[0] || latestBooking

  if (!deletedBooking) {
    const { data: refreshedBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle()

    await loadBookings()

    if (refreshedBooking) {
      return { status: 'stale', latestBooking: refreshedBooking }
    }

    return { status: 'missing_after_snapshot', latestBooking }
  }

  const refreshedBookings = await loadBookings()
  if (deletedBooking.booking_date) {
    const sameDate = Array.isArray(refreshedBookings)
      ? refreshedBookings.filter((item) => String(item?.booking_date || '') === String(deletedBooking.booking_date || ''))
      : []
    syncBookingsForDate(deletedBooking.booking_date, sameDate)
  }

  return { status: 'deleted', deletedBooking, refreshedBookings }
}
