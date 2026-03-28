export const OPEN_MINUTES = 10 * 60 + 30;
export const CLOSE_MINUTES = 20 * 60;
export const STANDARD_CAPACITY = 2;
export const PRO_CAPACITY = 1;

export const RESERVATION_KIND_OPTIONS = [
  { id: 'standard-1', label: '1 estándar', standard: 1, pro: 0 },
  { id: 'standard-2', label: '2 estándar', standard: 2, pro: 0 },
  { id: 'pro-1', label: '1 pro', standard: 0, pro: 1 },
  { id: 'mixed-1-1', label: '1 estándar + 1 pro', standard: 1, pro: 1 },
  { id: 'all-3', label: '2 estándar + 1 pro', standard: 2, pro: 1 },
];

export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function timeToMinutes(timeValue) {
  if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) return null;
  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const safe = Math.max(0, totalMinutes);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function combineDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;
  return `${dateValue}T${timeValue}:00`;
}

export function getReservationConfig(kindId) {
  return RESERVATION_KIND_OPTIONS.find((item) => item.id === kindId) || RESERVATION_KIND_OPTIONS[0];
}

export function getDurationMinutes(durationValue) {
  const numeric = Number(durationValue);
  if (!Number.isFinite(numeric) || numeric < 15) return 15;
  return Math.round(numeric);
}

export function getRange(dateValue, startTime, durationMinutes) {
  const startMinutes = timeToMinutes(startTime);
  if (startMinutes === null) return null;
  const endMinutes = startMinutes + getDurationMinutes(durationMinutes);
  return {
    date: dateValue,
    startMinutes,
    endMinutes,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}

export function rangesOverlap(rangeA, rangeB) {
  if (!rangeA || !rangeB) return false;
  if (rangeA.date !== rangeB.date) return false;
  return rangeA.startMinutes < rangeB.endMinutes && rangeB.startMinutes < rangeA.endMinutes;
}

export function normalizeBooking(row) {
  const duration = getDurationMinutes(row.duration ?? row.duration_minutes ?? 60);
  const date = row.booking_date ?? row.date ?? '';
  const time = (row.booking_time ?? row.time ?? '').slice(0, 5);
  const config = {
    standard: Number(row.standard_simulators ?? row.standard_count ?? 0),
    pro: Number(row.pro_simulators ?? row.pro_count ?? 0),
  };
  return {
    ...row,
    booking_date: date,
    booking_time: time,
    duration,
    range: getRange(date, time, duration),
    config,
  };
}

export function getConflicts(candidate, bookings, ignoreId = null) {
  const candidateRange = getRange(candidate.booking_date, candidate.booking_time, candidate.duration);
  const candidateConfig = getReservationConfig(candidate.reservation_kind);

  return bookings
    .map(normalizeBooking)
    .filter((booking) => booking.id !== ignoreId)
    .filter((booking) => rangesOverlap(candidateRange, booking.range))
    .filter((booking) => {
      const standardLoad = candidateConfig.standard + booking.config.standard;
      const proLoad = candidateConfig.pro + booking.config.pro;
      return standardLoad > STANDARD_CAPACITY || proLoad > PRO_CAPACITY;
    });
}

export function validateBookingPayload(payload, bookings = [], ignoreId = null) {
  const errors = [];
  const duration = getDurationMinutes(payload.duration);
  const startMinutes = timeToMinutes(payload.booking_time);
  const config = getReservationConfig(payload.reservation_kind);

  if (!payload.client?.trim()) errors.push('Debes ingresar el nombre del cliente.');
  if (!payload.phone?.trim()) errors.push('Debes ingresar teléfono o WhatsApp.');
  if (!payload.booking_date) errors.push('Debes seleccionar una fecha.');
  if (!payload.booking_time) errors.push('Debes seleccionar una hora.');

  if (startMinutes === null) {
    errors.push('La hora seleccionada no es válida.');
  } else {
    const endMinutes = startMinutes + duration;
    if (startMinutes < OPEN_MINUTES) errors.push('La reserva no puede comenzar antes de las 10:30.');
    if (endMinutes > CLOSE_MINUTES) errors.push('La reserva no puede terminar después de las 20:00.');
  }

  if (config.standard === 0 && config.pro === 0) {
    errors.push('Debes seleccionar una configuración de simuladores.');
  }

  const conflicts = getConflicts({ ...payload, duration }, bookings, ignoreId);
  if (conflicts.length > 0) {
    errors.push('Ese horario genera conflicto con otra reserva para los simuladores elegidos.');
  }

  return { valid: errors.length === 0, errors, conflicts, duration };
}

export function summarizeBookings(rows = []) {
  return rows.reduce(
    (acc, row) => {
      acc.totalReservations += 1;
      acc.totalRevenue += Number(row.total ?? 0);
      acc.standardMinutes += Number(row.standard_simulators ?? 0) * getDurationMinutes(row.duration);
      acc.proMinutes += Number(row.pro_simulators ?? 0) * getDurationMinutes(row.duration);
      return acc;
    },
    { totalReservations: 0, totalRevenue: 0, standardMinutes: 0, proMinutes: 0 }
  );
}

export function getImmediateAvailability(payload, bookings = [], ignoreId = null) {
  const startMinutes = timeToMinutes(payload.booking_time);
  if (startMinutes === null || !payload.booking_date) {
    return { standardFree: STANDARD_CAPACITY, proFree: PRO_CAPACITY, conflicts: [] };
  }

  const duration = getDurationMinutes(payload.duration);
  const candidateRange = getRange(payload.booking_date, payload.booking_time, duration);
  const overlapping = bookings
    .map(normalizeBooking)
    .filter((booking) => booking.id !== ignoreId)
    .filter((booking) => rangesOverlap(candidateRange, booking.range));

  const standardUsed = overlapping.reduce((sum, item) => sum + Number(item.config.standard || 0), 0);
  const proUsed = overlapping.reduce((sum, item) => sum + Number(item.config.pro || 0), 0);

  return {
    standardFree: Math.max(0, STANDARD_CAPACITY - standardUsed),
    proFree: Math.max(0, PRO_CAPACITY - proUsed),
    conflicts: getConflicts({ ...payload, duration }, bookings, ignoreId),
  };
}

export function generateTimelineRows(rows = [], dateValue, centerTime, windowMinutes = 120) {
  const center = timeToMinutes(centerTime) ?? OPEN_MINUTES;
  const startWindow = Math.max(OPEN_MINUTES, center - windowMinutes);
  const endWindow = Math.min(CLOSE_MINUTES, center + windowMinutes);

  return rows
    .map(normalizeBooking)
    .filter((row) => row.booking_date === dateValue)
    .filter((row) => row.range && row.range.endMinutes > startWindow && row.range.startMinutes < endWindow)
    .sort((a, b) => a.range.startMinutes - b.range.startMinutes);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
