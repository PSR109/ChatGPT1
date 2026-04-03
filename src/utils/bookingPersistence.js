const MISSING_RPC_CODES = new Set(['42883', 'PGRST202'])
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])
const MISSING_COLUMN_CODES = new Set(['42703', 'PGRST204'])
const ATTEMPT_REQUIRED_KEYS = ['client', 'phone', 'simulators']

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
    client: normalizeTextField(payload.client),
    phone: normalizeTextField(payload.phone),
    simulators: normalizeNumberField(payload.simulators, 0),
  }

  const isComplete = ATTEMPT_REQUIRED_KEYS.every((key) => {
    if (key === 'simulators') return normalized.simulators > 0
    return Boolean(normalized[key])
  })

  if (!isComplete) {
    console.warn('[bookingPersistence] attempt skipped: incomplete critical payload', normalized)
  }

  return isComplete
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

async function createBookingWithRpc({ supabase, payload }) {
  const { data, error } = await supabase.rpc('psr_create_booking_safe', buildRpcPayload(payload))
  return { data, error, usedRpc: true }
}

async function updateBookingWithRpc({ supabase, bookingId, payload }) {
  const { data, error } = await supabase.rpc('psr_update_booking_safe', {
    p_booking_id: bookingId,
    ...buildRpcPayload(payload),
  })

  return { data, error, usedRpc: true }
}

async function deleteBookingWithRpc({ supabase, bookingId }) {
  const { data, error } = await supabase.rpc('psr_delete_booking_safe', {
    p_booking_id: bookingId,
  })

  return { data, error, usedRpc: true }
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
  const result = await createBookingWithRpc({ supabase, payload })

  if (result.error && isMissingRpcError(result.error)) {
    return { status: 'rpc_unavailable', error: result.error }
  }

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
      await deleteBookingWithRpc({ supabase, bookingId: createdBookingId })
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

  const result = await updateBookingWithRpc({ supabase, bookingId, payload })

  if (result.error && isMissingRpcError(result.error)) {
    return { status: 'rpc_unavailable', error: result.error, phase: 'update' }
  }

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
      const rollbackResult = await updateBookingWithRpc({ supabase, bookingId, payload: rollbackPayload })
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

  const deleteResult = await deleteBookingWithRpc({ supabase, bookingId })

  if (deleteResult.error && isMissingRpcError(deleteResult.error)) {
    return { status: 'rpc_unavailable', error: deleteResult.error, phase: 'delete' }
  }

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
